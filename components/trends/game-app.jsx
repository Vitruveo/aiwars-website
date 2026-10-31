'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useBalance, useConfig, useReadContract, useReadContracts, useSwitchChain, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from 'wagmi/actions';
import { formatEther, parseEther } from 'viem';
import aiwars from '@/data/aiwars-contracts.json';
import { vitruveo } from '@/lib/chains';
import { GameRound, fmtAbs } from './game-round';
import { getGameConfig, getLeaderboard, getLive, getSettle, getWindow } from './api';
import { Rulebook } from './rulebook';
import { GAME_S, SOURCE, FEED, FALLBACK_THRESHOLDS, BUCKET_NAMES, TRENDPULSE_BASE, bucketOf, bLimitFor, gameIdFor, gameStartFor, phaseOf, trendAbsOf, tsOls } from '@/lib/trends/gamemath';
import { Leaderboard } from './leaderboard';
import { Eligibility } from './eligibility';

const MONO = 'var(--aw-mono), ui-monospace, monospace';
const NFT = aiwars.vitruveo.AIWarsNFT;
const NFT_ABI = aiwars.abi.AIWarsNFT;
const GAS_RESERVE = parseEther('0.05'); // VTRU kept back for the bet and claim transactions
const REMEMBERED_BETS = 12;

const BET_LABELS = {
  switching: 'Switching to Vitruveo…',
  wallet: 'Confirm in wallet…',
  mining: 'Placing bet…',
};

// Format wei (bigint or decimal string) as VTRU with up to 2 decimals.
function fmtVtru(wei) {
  if (wei === null || wei === undefined) return '…';
  const v = Number(formatEther(BigInt(wei)));
  return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function fmtUtc(ts) {
  const d = new Date(ts * 1000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

// Bets this browser placed, per wallet, so the slider position survives a
// reload and past games can be checked for unclaimed winnings. The chain is
// the source of truth; this is only a list of serials worth asking about.
const betsKey = (address) => `aw:bets:${address.toLowerCase()}`;
function loadBets(address) {
  if (!address) return [];
  try {
    const raw = window.localStorage.getItem(betsKey(address));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveBets(address, bets) {
  try {
    window.localStorage.setItem(betsKey(address), JSON.stringify(bets.slice(-REMEMBERED_BETS)));
  } catch (e) {
    // private mode: the chain still knows
  }
}

// The sliding five-minute view of the oracle feed, streamed straight from
// TrendPulse: a series fetch reaching back one window on each new game,
// live ticks over the websocket, a periodic refill for gaps, and a 1Hz
// clock (server-skew corrected) that drives phase, elapsed time and the
// live OLS fit over the trailing five minutes. The chart draws the trailing
// points; settlement uses the window's own points on the server.
function useLiveWindow(live) {
  const [state, setState] = useState(null);
  // Server clock skew and lock length live in refs so a refreshed `live`
  // object never tears the stream down: the chart must never blank out.
  const skewRef = useRef(0);
  const lockRef = useRef(240);
  useEffect(() => {
    if (!live) return;
    skewRef.current = live.serverNow - Date.now() / 1000;
    lockRef.current = live.lockS;
  }, [live]);
  const ready = !!live && !!TRENDPULSE_BASE;
  useEffect(() => {
    if (!ready) return undefined;
    const nowS = () => Date.now() / 1000 + skewRef.current;
    let stop = false;
    let ws;
    const cur = { start: null, map: new Map() };

    async function loadWindow(start) {
      try {
        const to = Math.min(Math.floor(nowS()), start + GAME_S - 1);
        const r = await fetch(`${TRENDPULSE_BASE}/series?source=${SOURCE}&from=${start - GAME_S}&to=${to}`);
        const d = await r.json();
        if (stop || cur.start !== start) return;
        for (const p of d.points || []) cur.map.set(p[0], p[1]);
      } catch (e) {
        // next refill retries
      }
    }

    function connect() {
      if (stop) return;
      ws = new WebSocket(`${TRENDPULSE_BASE.replace(/^http/, 'ws')}/feed`);
      ws.onmessage = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'tick' && m.source === SOURCE && cur.start !== null && m.ts >= cur.start - GAME_S) cur.map.set(m.ts, m.value);
        } catch (e) {}
      };
      ws.onclose = () => { if (!stop) setTimeout(connect, 3000); };
      ws.onerror = () => {};
    }
    connect();

    const tick = () => {
      const t = nowS();
      const start = gameStartFor(t);
      if (cur.start !== start) {
        cur.start = start;
        loadWindow(start);
      }
      const floor = Math.floor(t) - GAME_S;
      for (const ts of cur.map.keys()) if (ts < floor) cur.map.delete(ts);
      const trailing = [...cur.map.entries()].sort((a, b) => a[0] - b[0]);
      const points = trailing.filter((p) => p[0] >= start);
      // x measured from the window start, so xbar/a line up with the chart
      const liveFit = trailing.length >= 2 ? tsOls(trailing, start) : null;
      setState({ start, points, trailing, phase: phaseOf(start, t), elapsed: t - start, lockS: lockRef.current, liveFit, now: t });
    };
    tick();
    const clock = setInterval(tick, 1000);
    const refill = setInterval(() => { if (cur.start !== null) loadWindow(cur.start); }, 15000);
    return () => { stop = true; clearInterval(clock); clearInterval(refill); if (ws) ws.close(); };
  }, [ready]);
  return state;
}

function fmtClock(s) {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function TickerRow({ items }) {
  return (
    <>
      {items.map(([label, value, tone]) => (
        <span key={label} className="aw-tick">
          <span className="aw-faint">{label}</span>
          <span className={tone === 'ember' ? 'aw-ember' : tone === 'signal' ? 'aw-signal' : 'aw-ink'}>{value}</span>
        </span>
      ))}
    </>
  );
}

// Live telemetry strip in the AI Wars ticker style, fed by the real window.
function Ticker({ win, thresholds, calibration, burned, creditBps }) {
  const last = win?.points.length ? win.points[win.points.length - 1][1] : null;
  const fit = win?.liveFit;
  const projected = fit ? trendAbsOf(fit.b) : null;
  const bucket = projected === null ? -1 : bucketOf(projected, thresholds);
  const items = [
    [FEED.name, last === null ? '…' : last.toFixed(0), 'ink'],
    ['LIVE OLS', projected === null ? '…' : fmtAbs(projected), projected !== null && projected >= 0 ? 'signal' : 'ember'],
    ['BUCKET', bucket >= 0 ? BUCKET_NAMES[bucket].toUpperCase() : '…', 'ink'],
    ['PHASE', win ? win.phase.toUpperCase() : '…', win?.phase === 'open' ? 'signal' : 'ember'],
    [win?.phase === 'open' ? 'BETTING CLOSES' : 'NEXT GAME', win ? fmtClock((win.phase === 'open' ? win.lockS : GAME_S) - win.elapsed) : '…', 'ink'],
    ['A HIT PAYS', creditBps ? `STAKE + ${(creditBps / 10000).toFixed(2).replace(/\.?0+$/, '')}X CREDITS` : '…', 'signal'],
    ['BURNED', burned === null ? '…' : `${fmtVtru(burned)} VTRU`, 'ember'],
    ['SIGNAL CADENCE', `${FEED.cadenceS}S`, 'ink'],
    ['MARKET WINDOW', '5M', 'ink'],
    ['CALIBRATION', calibration?.fallback ? 'FALLBACK' : `${calibration?.windows ?? 0} WINDOWS`, calibration?.fallback ? 'ember' : 'ink'],
    ['ARCHIVE STATUS', 'PREVIEW OPEN', 'signal'],
  ];
  return (
    <div className="aw-ticker">
      <div className="aw-marquee">
        <TickerRow items={items} />
        <TickerRow items={items} />
      </div>
    </div>
  );
}

// Past bets this browser placed, with their on-chain status and a claim button.
function PastBets({ bets, statuses, claimingStart, onClaim }) {
  if (!bets.length) return null;
  return (
    <div className="aw-panel p-3 p-md-4 mt-4">
      <h2 className="aw-kicker mb-3" style={{ fontSize: '0.95rem' }}>Your recent games</h2>
      <div className="table-responsive">
        <table className="ols-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Game</th>
              <th>Bet</th>
              <th style={{ textAlign: 'right' }}>Stake</th>
              <th style={{ textAlign: 'right' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => {
              const st = statuses[bet.start];
              let cell;
              if (!st) cell = <span className="aw-faint">…</span>;
              else if (st.refund > 0n) {
                cell = (
                  <button type="button" className="aw-btn aw-btn-sm" onClick={() => onClaim(bet.start)} disabled={claimingStart !== null}>
                    {claimingStart === bet.start ? 'Claiming…' : st.credit > 0n ? `Claim stake + ${fmtVtru(st.credit)} credits` : `Claim ${fmtVtru(st.refund)} VTRU refund`}
                  </button>
                );
              } else if (!st.resolved) cell = <span className="aw-faint">awaiting result</span>;
              else if (st.voided) cell = <span className="aw-faint">void &middot; refunded</span>;
              else if (st.winner) cell = <span className="aw-signal">hit &middot; stake returned</span>;
              else cell = <span className="aw-faint">{BUCKET_NAMES[st.bucket]} &middot; burned</span>;
              return (
                <tr key={bet.start}>
                  <td style={{ fontFamily: MONO }}>{fmtUtc(bet.start)}</td>
                  <td style={{ fontFamily: MONO }}>{BUCKET_NAMES[bet.bucket]}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtVtru(bet.amount)} VTRU</td>
                  <td style={{ textAlign: 'right' }}>{cell}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** @param {{ about?: import('react').ReactNode }} props */
export function GameApp({ about = null }) {
  const { address, chain, isConnected } = useAccount();
  const wagmiConfig = useConfig();
  const { writeContractAsync } = useWriteContract();
  const { switchChainAsync } = useSwitchChain();
  const onVitruveo = chain?.id === vitruveo.id;

  const [cfg, setCfg] = useState(null);
  const [cfgError, setCfgError] = useState(null);
  const [live, setLive] = useState(null);
  const [windowInfo, setWindowInfo] = useState(null); // frozen thresholds for the current window
  const [lbRows, setLbRows] = useState([]);
  const [stake, setStake] = useState(null); // whole VTRU
  const [betStatus, setBetStatus] = useState(null);
  const [entry, setEntry] = useState(null);
  const [result, setResult] = useState(null);
  const [awaiting, setAwaiting] = useState(null); // settle response while the result is not yet on-chain
  const [claimingStart, setClaimingStart] = useState(null);
  const [error, setError] = useState(null);
  const [eligible, setEligible] = useState(false);
  const [bets, setBets] = useState([]);
  const onEligibility = useCallback((e) => setEligible(!!e?.eligible), []);

  const win = useLiveWindow(live);
  const thresholds = (windowInfo && windowInfo.start === win?.start ? windowInfo.thresholds : null) || live?.thresholds || FALLBACK_THRESHOLDS;
  const bLimit = bLimitFor(thresholds);

  const game = cfg?.game;
  const gameMin = game ? BigInt(game.gameMin) : 0n;
  const gameMax = game ? BigInt(game.gameMax) : 0n;
  const creditBps = game?.creditBps || 0;
  const creditsPerNft = game ? BigInt(game.creditsPerNft || '0') : 0n;
  const gameLive = gameMax > 0n && creditsPerNft > 0n;
  const minVtru = gameLive ? Number(formatEther(gameMin)) : 100;
  const maxVtru = gameLive ? Number(formatEther(gameMax)) : 1000;
  const freePlays = game?.freePlays ?? 5;

  useEffect(() => {
    getGameConfig().then(setCfg).catch((e) => setCfgError(e.message));
    getLive().then(setLive).catch((e) => setCfgError(e.message));
    getLeaderboard().then((r) => setLbRows(r.rows)).catch(() => {});
    // re-read the clock, calibration and settings every few minutes
    const id = setInterval(() => {
      getLive().then(setLive).catch(() => {});
      getGameConfig().then(setCfg).catch(() => {});
    }, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Freeze the bucket edges for each new window on the server.
  useEffect(() => {
    if (!win?.start) return;
    getWindow(win.start).then(setWindowInfo).catch(() => {});
  }, [win?.start]);

  useEffect(() => {
    if (stake === null && gameLive) setStake(Math.ceil(minVtru));
  }, [gameLive, minVtru, stake]);


  const stakeWei = stake !== null ? parseEther(String(stake)) : 0n;
  const creditWei = (stakeWei * BigInt(creditBps || 0)) / 10000n;

  const { data: balance, refetch: refetchBalance } = useBalance({ address, chainId: vitruveo.id, query: { enabled: !!address, refetchInterval: 30000 } });
  const { data: player, refetch: refetchPlayer } = useReadContract({
    address: NFT,
    abi: NFT_ABI,
    functionName: 'playerOf',
    args: [address],
    chainId: vitruveo.id,
    query: { enabled: !!address, refetchInterval: 60000 },
  });

  // The player's bet in the current window, straight from the contract.
  const { data: chainBet, refetch: refetchBet } = useReadContract({
    address: NFT,
    abi: NFT_ABI,
    functionName: 'getBet',
    args: [address, BigInt(win?.start || 0)],
    chainId: vitruveo.id,
    query: { enabled: !!address && !!win?.start, refetchInterval: 15000 },
  });

  useEffect(() => {
    setEntry(null);
    setResult(null);
    setAwaiting(null);
    setError(null);
    setBets(loadBets(address));
  }, [address]);

  useEffect(() => {
    if (!chainBet || !win?.start || !address) return;
    const [amount, bucket] = chainBet;
    if (amount === 0n) return;
    const remembered = loadBets(address).find((b) => b.start === win.start);
    setEntry((e) => (e && e.start === win.start ? e : {
      gameId: gameIdFor(win.start),
      start: win.start,
      bucket: Number(bucket),
      amount: amount.toString(),
      credit: ((amount * BigInt(creditBps || 0)) / 10000n).toString(),
      b: remembered?.b ?? null,
    }));
  }, [chainBet, win?.start, address, creditBps]);

  // Once the player's window has ended, poll the server until the contract
  // holds the result, then show it.
  useEffect(() => {
    if (!entry || result || !win || !address) return undefined;
    const ph = phaseOf(entry.start, win.now);
    if (ph !== 'settling' && ph !== 'ended') return undefined;
    let stop = false;
    const poll = async () => {
      try {
        const r = await getSettle(entry.gameId);
        if (stop || !r.settled) return;
        if (!r.resolved) { setAwaiting(r); return; }
        // result() settles the bet on-chain; a stake still claimable means the push missed it.
        const [refund] = await readContract(wagmiConfig, { address: NFT, abi: NFT_ABI, functionName: 'claimable', args: [address, BigInt(entry.start)], chainId: vitruveo.id }).catch(() => [0n]);
        if (stop) return;
        if (r.voided || r.void) {
          setResult({ ...r, void: true, start: entry.start, bucket: -1, betBucket: entry.bucket, amount: entry.amount, credit: '0', win: false, claimed: refund === 0n });
          return;
        }
        const won = r.onchainBucket === entry.bucket;
        setResult({
          ...r,
          start: entry.start,
          bucket: r.onchainBucket,
          betBucket: entry.bucket,
          amount: entry.amount,
          credit: entry.credit,
          win: won,
          claimed: refund === 0n,
        });
        refetchPlayer();
        refetchBalance();
        setAwaiting(null);
        getLeaderboard().then((lb) => setLbRows(lb.rows)).catch(() => {});
      } catch (e) {
        // next poll retries
      }
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => { stop = true; clearInterval(id); };
  }, [entry, result, win?.phase, win?.start, address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Status of remembered past bets (not the current window): result, winner, claimable.
  const pastBets = useMemo(() => bets.filter((b) => !win || b.start !== win.start).slice().reverse(), [bets, win?.start]); // eslint-disable-line react-hooks/exhaustive-deps
  const pastReads = useReadContracts({
    contracts: pastBets.flatMap((b) => [
      { address: NFT, abi: NFT_ABI, functionName: 'gameResult', args: [BigInt(b.start)], chainId: vitruveo.id },
      { address: NFT, abi: NFT_ABI, functionName: 'isWinner', args: [address, BigInt(b.start)], chainId: vitruveo.id },
      { address: NFT, abi: NFT_ABI, functionName: 'claimable', args: [address, BigInt(b.start)], chainId: vitruveo.id },
    ]),
    query: { enabled: !!address && pastBets.length > 0, refetchInterval: 30000 },
  });
  const pastStatuses = useMemo(() => {
    const out = {};
    const d = pastReads.data;
    if (!d) return out;
    pastBets.forEach((b, i) => {
      const gr = d[i * 3]?.result;
      const winner = d[i * 3 + 1]?.result;
      const cl = d[i * 3 + 2]?.result;
      if (!gr) return;
      out[b.start] = { resolved: gr[0], bucket: Number(gr[1]), voided: !!gr[2], winner: !!winner, refund: cl?.[0] ?? 0n, credit: cl?.[1] ?? 0n };
    });
    return out;
  }, [pastReads.data, pastBets]);

  const placeBet = useCallback(async (b, bucket) => {
    if (!win || !address || !gameLive) return;
    setError(null);
    const start = win.start;
    try {
      if (!onVitruveo) {
        setBetStatus('switching');
        await switchChainAsync({ chainId: vitruveo.id });
      }
      setBetStatus('wallet');
      const hash = await writeContractAsync({
        address: NFT,
        abi: NFT_ABI,
        functionName: 'placeBet',
        args: [BigInt(start), stakeWei, bucket],
        value: stakeWei,
        chainId: vitruveo.id,
      });
      setBetStatus('mining');
      const rc = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: vitruveo.id });
      if (rc.status !== 'success') throw new Error('Bet transaction reverted');
      const remembered = [...loadBets(address).filter((x) => x.start !== start), { start, bucket, b, amount: stakeWei.toString() }];
      saveBets(address, remembered);
      setBets(remembered);
      setResult(null);
      setEntry({ gameId: gameIdFor(start), start, bucket, amount: stakeWei.toString(), credit: creditWei.toString(), b });
      refetchBet();
      refetchBalance();
      refetchPlayer();
    } catch (e) {
      setError(e.shortMessage || e.message);
    } finally {
      setBetStatus(null);
    }
  }, [win, address, gameLive, onVitruveo, switchChainAsync, writeContractAsync, stakeWei, creditWei, wagmiConfig, refetchBet, refetchBalance, refetchPlayer]);

  const claim = useCallback(async (start) => {
    if (!address) return;
    setError(null);
    setClaimingStart(start);
    try {
      if (!onVitruveo) await switchChainAsync({ chainId: vitruveo.id });
      const hash = await writeContractAsync({ address: NFT, abi: NFT_ABI, functionName: 'claim', args: [BigInt(start)], chainId: vitruveo.id });
      const rc = await waitForTransactionReceipt(wagmiConfig, { hash, chainId: vitruveo.id });
      if (rc.status !== 'success') throw new Error('Claim transaction reverted');
      setResult((r) => (r && r.start === start ? { ...r, claimed: true } : r));
      refetchBalance();
      refetchPlayer();
      pastReads.refetch();
      getLeaderboard().then((lb) => setLbRows(lb.rows)).catch(() => {});
    } catch (e) {
      setError(e.shortMessage || e.message);
    } finally {
      setClaimingStart(null);
    }
  }, [address, onVitruveo, switchChainAsync, writeContractAsync, wagmiConfig, refetchBalance, refetchPlayer, pastReads]);

  const dismiss = () => {
    setResult(null);
    setEntry(null);
    setAwaiting(null);
    refetchBet();
  };

  const balanceWei = balance?.value ?? 0n;
  const stakeInRange = stakeWei >= gameMin && stakeWei <= gameMax;
  const canAfford = balanceWei >= stakeWei + GAS_RESERVE;
  const canBet = isConnected && eligible && gameLive && !!win && !entry && stakeInRange && canAfford && !betStatus;
  const betHint = !isConnected
    ? 'connect your wallet on Vitruveo to play'
    : !eligible
      ? `you have played ${freePlays} times without a Tier 1 Archive Shard: hold one to keep playing`
      : !gameLive
        ? 'the game contract is not live yet'
        : !stakeInRange
          ? `stake must be ${minVtru}–${maxVtru} VTRU`
          : !canAfford
            ? `you need ${fmtVtru(stakeWei + GAS_RESERVE)} VTRU in this wallet`
            : !onVitruveo
              ? 'betting switches your wallet to Vitruveo'
              : 'aim your line, then place your bet';

  // While the player's own window is settling, keep showing the live feed
  // but with their entry in view; the result replaces it once it lands.
  const entryIsCurrent = entry && win && entry.start === win.start;

  return (
    <div className="aw" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <Ticker win={win} thresholds={thresholds} calibration={live?.calibration} burned={game ? game.totalBurned : null} creditBps={creditBps} />

      {/* The play area: chart, aim, stake and bet, your numbers, the rules line and access, in one frame. */}
      <div className="aw-panel aw-play p-3 p-md-4 mt-4">
        {win ? (
          <>
            <GameRound
              key={result ? `r${result.start}` : 'live'}
              win={win}
              thresholds={result?.thresholds || thresholds}
              bLimit={result?.bLimit || bLimit}
              entry={entryIsCurrent || result ? entry : null}
              result={result}
              canBet={canBet}
              betHint={betHint}
              betLabel={`Bet ${stake ?? ''} VTRU`}
              betting={betStatus ? BET_LABELS[betStatus] : null}
              onBet={placeBet}
              claiming={claimingStart !== null}
              onClaim={() => result && claim(result.start)}
              fmtVtru={fmtVtru}
              onDismiss={dismiss}
              hitCredits={gameLive ? fmtVtru(creditWei) : null}
              stakeControl={
                <div className="aw-stake d-flex align-items-center gap-2 flex-wrap">
                  <span className="aw-stat-label mb-0">Stake</span>
                  <input
                    type="range"
                    className="form-range aw-range"
                    style={{ width: '170px' }}
                    min={Math.ceil(minVtru)}
                    max={Math.floor(maxVtru)}
                    step={1}
                    value={stake ?? minVtru}
                    disabled={!gameLive || !!entry}
                    onChange={(e) => setStake(parseInt(e.target.value, 10))}
                    aria-label="Stake in VTRU"
                  />
                  <input
                    type="number"
                    className="aw-input"
                    style={{ width: '6.5rem' }}
                    min={Math.ceil(minVtru)}
                    max={Math.floor(maxVtru)}
                    step={1}
                    value={stake ?? ''}
                    disabled={!gameLive || !!entry}
                    onChange={(e) => setStake(e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0))}
                    aria-label="Stake in VTRU"
                  />
                  <span className="aw-faint">VTRU</span>
                </div>
              }
            />
            {entry && !entryIsCurrent && !result && (
              <p className="text-center mt-2 mb-0 aw-faint" style={{ fontFamily: MONO, fontSize: '0.85rem', letterSpacing: '0.1em' }}>
                {awaiting
                  ? awaiting.serviceConfigured
                    ? `YOUR ${fmtUtc(entry.start)} GAME: WAITING FOR THE RESULT TO LAND ON-CHAIN (${BUCKET_NAMES[awaiting.bucket]?.toUpperCase() ?? '…'})…`
                    : `YOUR ${fmtUtc(entry.start)} GAME SETTLED ${BUCKET_NAMES[awaiting.bucket]?.toUpperCase() ?? '…'} BUT NO RESULT SERVICE IS CONFIGURED`
                  : `YOUR ${fmtUtc(entry.start)} GAME IS SETTLING…`}
              </p>
            )}
          </>
        ) : (
          <div style={{ minHeight: '420px' }} className="d-flex align-items-center justify-content-center aw-faint">
            <span style={{ fontFamily: MONO, letterSpacing: '0.2em' }}>
              {cfgError ? 'GAME SERVICE UNREACHABLE' : 'CONNECTING TO TRENDPULSE…'}
            </span>
          </div>
        )}

        {(error || cfgError || (cfg && !gameLive) || (cfg && !cfg.game?.serviceConfigured)) && (
          <div className="aw-play-section" style={{ fontFamily: MONO, fontSize: '0.85rem', color: '#f87171' }}>
            {cfgError
              ? `Game service unreachable: ${cfgError}`
              : error
                ? error
                : !gameLive
                  ? 'The AIWarsNFT game contract has not been upgraded to the v3 rules yet.'
                  : 'Results are not being posted: no result signer is configured on the server.'}
          </div>
        )}

        <Eligibility
          onChange={onEligibility}
          embedded
          actions={
            <a href="#rulebook" className="aw-btn aw-rulebook-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Rulebook
            </a>
          }
        />
      </div>

      <p className="aw-faint mt-3 mb-0" style={{ fontFamily: MONO, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {FEED.note}
      </p>

      {isConnected && <PastBets bets={pastBets} statuses={pastStatuses} claimingStart={claimingStart} onClaim={claim} />}

      <Leaderboard rows={lbRows} myAddress={address} />

      {about}

      <Rulebook game={gameLive ? game : null} />
    </div>
  );
}
