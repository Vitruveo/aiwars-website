'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useBalance, useChainId, usePublicClient, useReadContracts, useSwitchChain, useWriteContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { bsc } from 'wagmi/chains';
import { formatUnits } from 'viem';
import { vitruveo } from '@/lib/chains';
import { SALE_ADDRESS, SALE_ABI, USDT_BSC, ERC20_ABI } from '@/lib/contracts';
import { getEligibility, postFulfill } from './api';

const MONO = 'var(--aw-mono), ui-monospace, monospace';
const SALE = SALE_ADDRESS;
const USDT = USDT_BSC;
const ZERO = '0x0000000000000000000000000000000000000000';

const STEP_LABEL = {
  switching: 'Switch to BNB Smart Chain…',
  approving: 'Approving USDT…',
  buying: 'Confirming purchase…',
  minting: 'Minting on Vitruveo…',
  waiting: 'Waiting for your shard…',
  returning: 'Switching back to Vitruveo…',
};

function short(e) {
  const m = e?.shortMessage || e?.message || 'Transaction failed';
  return m.length > 110 ? `${m.slice(0, 110)}…` : m;
}

// Access gate under the game. A wallet can play five times without holding a
// Tier 1 Archive Shard; after that the contract requires one. States: connect a
// wallet; plays left without a shard; those used and no Tier 1 shard (mini mint
// one here, or go to /mint); holding a Tier 1 shard (unlimited play).
export function Eligibility({ onChange, embedded = false }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { openConnectModal } = useConnectModal();
  const payClient = usePublicClient({ chainId: bsc.id });

  const [mounted, setMounted] = useState(false);
  const [elig, setElig] = useState(null); // null = unknown / loading
  const [step, setStep] = useState('idle');
  const [error, setError] = useState(null);
  const [switching, setSwitching] = useState(false);
  const pollRef = useRef(null);
  const onVitruveo = chainId === vitruveo.id;
  const onBsc = chainId === bsc.id;
  const netName = onVitruveo ? 'Vitruveo' : onBsc ? 'BNB Smart Chain' : `chain ${chainId}`;

  useEffect(() => { setMounted(true); }, []);

  const check = useCallback(async () => {
    if (!address) return null;
    try {
      const e = await getEligibility(address);
      setElig(e);
      onChange?.(e);
      return e;
    } catch (err) {
      setElig((prev) => prev ?? { eligible: false, error: err.message });
      return null;
    }
  }, [address, onChange]);

  useEffect(() => {
    setElig(null);
    setError(null);
    setStep('idle');
    if (!address) { onChange?.(null); return undefined; }
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [address, check, onChange]);

  // Sale quote for one shard on BSC.
  const sale = useReadContracts({
    contracts: [
      { address: SALE, abi: SALE_ABI, functionName: 'paused', chainId: bsc.id },
      { address: SALE, abi: SALE_ABI, functionName: 'quote', args: [1n], chainId: bsc.id },
      { address: USDT, abi: ERC20_ABI, functionName: 'allowance', args: [address ?? ZERO, SALE], chainId: bsc.id },
      { address: USDT, abi: ERC20_ABI, functionName: 'balanceOf', args: [address ?? ZERO], chainId: bsc.id },
      { address: USDT, abi: ERC20_ABI, functionName: 'decimals', chainId: bsc.id },
    ],
    query: { enabled: !!address && elig !== null && !elig.eligible, refetchInterval: 20000 },
  });
  const d = sale.data;
  const paused = (d?.[0]?.result ?? true) === true;
  const cost = d?.[1]?.result ?? 0n;
  const allowance = d?.[2]?.result ?? 0n;
  const usdtBalance = d?.[3]?.result ?? 0n;
  const decimals = d?.[4]?.result ?? 18;
  const price = cost ? Number(formatUnits(cost, decimals)) : null;

  // Gas on BNB Chain: approve + buy need a little BNB.
  const MIN_BNB = 300000000000000n; // 0.0003 BNB
  const bnb = useBalance({ address, chainId: bsc.id, query: { enabled: !!address && elig !== null && !elig.eligible, refetchInterval: 20000 } });
  const bnbBalance = bnb.data?.value ?? null;

  const busy = step !== 'idle';
  const loaded = !!d && bnbBalance !== null;
  const lacksUsdt = loaded && cost > 0n && usdtBalance < cost;
  const lacksGas = loaded && bnbBalance < MIN_BNB;
  const canMint = loaded && !busy && !paused && cost > 0n && !lacksUsdt && !lacksGas;
  const blocker = !loaded
    ? null
    : lacksUsdt && lacksGas
      ? `Needs ${price.toFixed(0)} USDT and some BNB for gas on BNB Chain`
      : lacksUsdt
        ? `Needs ${price.toFixed(0)} USDT on BNB Chain`
        : lacksGas
          ? 'Needs a little BNB on BNB Chain for gas'
          : null;

  async function mint() {
    setError(null);
    if (!isConnected) return openConnectModal?.();
    if (!payClient || !canMint) return;
    try {
      if (chainId !== bsc.id) {
        setStep('switching');
        await switchChainAsync({ chainId: bsc.id });
      }
      if (allowance < cost) {
        setStep('approving');
        const h = await writeContractAsync({ address: USDT, abi: ERC20_ABI, functionName: 'approve', args: [SALE, cost], chainId: bsc.id });
        await payClient.waitForTransactionReceipt({ hash: h });
      }
      setStep('buying');
      const h = await writeContractAsync({ address: SALE, abi: SALE_ABI, functionName: 'buy', args: [1n, ''], chainId: bsc.id });
      const rc = await payClient.waitForTransactionReceipt({ hash: h });
      if (rc.status !== 'success') throw new Error('Purchase reverted');
      setStep('minting');
      await postFulfill(address).catch(() => null);
      setStep('waiting');
      // the shard lands on Vitruveo a block or two later; poll until it shows
      for (let i = 0; i < 40; i++) {
        const e = await check();
        if (e?.eligible) break;
        await new Promise((res) => setTimeout(res, 4000));
      }
      // game play lives on Vitruveo: bring the wallet back
      setStep('returning');
      try { await switchChainAsync({ chainId: vitruveo.id }); } catch (e) { /* user can switch from the gate */ }
      setStep('idle');
    } catch (e) {
      setError(short(e));
      setStep('idle');
    }
  }

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  async function toVitruveo() {
    setError(null);
    setSwitching(true);
    try {
      await switchChainAsync({ chainId: vitruveo.id });
    } catch (e) {
      setError(short(e));
    } finally {
      setSwitching(false);
    }
  }

  const NetworkLine = () => (
    <div className="aw-gate-net">
      <span className={`aw-net-dot ${onVitruveo ? 'is-game' : onBsc ? 'is-mint' : 'is-other'}`} aria-hidden="true" />
      <span>Wallet on <span className="aw-ink">{netName}</span></span>
      <span className="aw-faint">&middot; game play on Vitruveo &middot; minting on BNB Smart Chain</span>
    </div>
  );

  // ---- render ----
  let body;
  if (!mounted || !isConnected) {
    body = (
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <div className="aw-gate-title">Connect your wallet</div>
          <div className="aw-gate-sub">You can play five times without holding a Tier 1 Archive Shard. After that, a Tier 1 shard keeps you playing.</div>
        </div>
        <button type="button" className="aw-btn" onClick={() => openConnectModal?.()}>Connect</button>
      </div>
    );
  } else if (elig === null) {
    body = <div className="aw-gate-sub">Checking your plays and shards&hellip;</div>;
  } else if (!elig.eligible) {
    body = (
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div>
          <div className="aw-gate-title aw-ember">{elig.legacy ? 'Cannot play' : 'You have played five times without a Tier 1 shard'}</div>
          <div className="aw-gate-sub">
            Mint a Tier 1 Archive Shard to keep playing
            {price !== null ? <> &middot; {price.toFixed(0)} USDT on BNB Chain</> : null}
          </div>
          <NetworkLine />
          <div className="aw-gate-sub aw-faint" style={{ fontSize: '0.8rem' }}>
            Minting switches your wallet to BNB Smart Chain and returns it to Vitruveo when the shard lands.
          </div>
          {(error || elig.error) && <div className="aw-gate-err">{error || elig.error}</div>}
          {!error && !busy && blocker && <div className="aw-gate-err">{blocker}</div>}
        </div>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button type="button" className="aw-btn" onClick={mint} disabled={!canMint}>
            {busy ? STEP_LABEL[step] : !loaded ? 'Checking balances…' : paused ? 'Mint opens soon' : 'Mint'}
          </button>
          <a href="/mint" className="aw-btn aw-btn-ghost">main mint page</a>
        </div>
      </div>
    );
  } else {
    body = (
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <span className="aw-check" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </span>
        <div className="flex-grow-1">
          <div className="aw-gate-title">
            {elig.legacy
              ? elig.tokenId !== null ? `Token #${elig.tokenId} detected.` : 'Archive Shard detected.'
              : elig.tier1Count > 0
                ? `Tier 1 Archive Shard detected${elig.tier1Count > 1 ? ` (${elig.tier1Count})` : ''}. Unlimited play.`
                : `${elig.freePlaysLeft} play${elig.freePlaysLeft === 1 ? '' : 's'} left without a Tier 1 shard.`}
          </div>
          <div className="aw-gate-sub aw-signal">
            {elig.legacy || elig.tier1Count > 0 ? 'AIWars Trends access confirmed.' : 'After that, a Tier 1 Archive Shard keeps you playing.'}
          </div>
          {elig.nextPrizeAt > Date.now() / 1000 && (
            <div className="aw-gate-sub aw-ember">
              Next Tier 5 shard can mint after {new Date(elig.nextPrizeAt * 1000).toISOString().slice(11, 16)} UTC
              {new Date(elig.nextPrizeAt * 1000).toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10) ? ' tomorrow' : ''}. Credits keep counting.
            </div>
          )}
          <NetworkLine />
          {error && <div className="aw-gate-err">{error}</div>}
        </div>
        {!onVitruveo && (
          <button type="button" className="aw-btn" onClick={toVitruveo} disabled={switching}>
            {switching ? 'Switching…' : 'Switch to Vitruveo to play'}
          </button>
        )}
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="aw-gate aw-play-section">
        <div style={{ fontFamily: MONO }}>{body}</div>
      </div>
    );
  }
  return (
    <div className="aw-panel aw-gate p-3 p-md-4 mt-4">
      <p className="aw-kicker mb-2" style={{ fontSize: '0.75rem' }}>Access</p>
      <div style={{ fontFamily: MONO }}>{body}</div>
    </div>
  );
}
