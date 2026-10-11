"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useReadContracts, useSwitchChain, useWriteContract, usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { fmt } from "@/lib/shards";
import { PAY_CHAIN } from "@/lib/web3";
import { GENESIS_ADDRESS, GENESIS_ABI, SALE_ADDRESS, SALE_ABI, VTRU_BSC, VTRU_BRIDGE_URL, ERC20_ABI, GENESIS_PRICE_VTRU, GENESIS_THRESHOLD } from "@/lib/contracts";

const ZERO = "0x0000000000000000000000000000000000000000" as const;
type Step = "idle" | "switching" | "approving" | "buying" | "redeeming";

function short(e: unknown) {
  const m = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as Error)?.message || "Transaction failed";
  return m.length > 90 ? m.slice(0, 90) + "…" : m;
}

type Pkg = { id: number; referrer: string; activateAt: number; redeemed: boolean; activated: boolean; holder?: string; referrerMints: number };

export default function GenesisPanel() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setMounted(true);
    setOrigin(process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || window.location.origin);
  }, []);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const payClient = usePublicClient({ chainId: PAY_CHAIN.id });

  const live = Boolean(GENESIS_ADDRESS);
  const me = address ?? ZERO;

  const base = useReadContracts({
    contracts: [
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "paused", chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "price", chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "threshold", chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "totalPackages", chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "referrerPackages", args: [me], chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "balanceOf", args: [me], chainId: PAY_CHAIN.id },
      { address: VTRU_BSC, abi: ERC20_ABI, functionName: "allowance", args: [me, GENESIS_ADDRESS ?? ZERO], chainId: PAY_CHAIN.id },
      { address: VTRU_BSC, abi: ERC20_ABI, functionName: "balanceOf", args: [me], chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "codeOf", args: [me], chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "referrerMints", args: [me], chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "payoutOf", args: [me], chainId: PAY_CHAIN.id },
    ],
    query: { enabled: live, refetchInterval: 15_000 },
  });
  const b = base.data;
  const paused = live ? ((b?.[0]?.result as boolean | undefined) ?? true) : true;
  const price = (b?.[1]?.result as bigint | undefined) ?? parseUnits(String(GENESIS_PRICE_VTRU), 18);
  const threshold = Number((b?.[2]?.result as bigint | undefined) ?? BigInt(GENESIS_THRESHOLD));
  const totalPackages = Number((b?.[3]?.result as bigint | undefined) ?? 0n);
  const myCodes = ((b?.[4]?.result as readonly bigint[] | undefined) ?? []).map(Number);
  const claimCount = Number((b?.[5]?.result as bigint | undefined) ?? 0n);
  const allowance = (b?.[6]?.result as bigint | undefined) ?? 0n;
  const vtruBalance = (b?.[7]?.result as bigint | undefined) ?? 0n;
  const myCode = ((b?.[8]?.result as string | undefined) ?? "").toUpperCase();
  const myMints = Number((b?.[9]?.result as bigint | undefined) ?? 0n);
  const myPayout = (b?.[10]?.result as string | undefined) ?? "";

  // Claims this wallet holds (may include ones bought from others).
  const claimIdReads = useReadContracts({
    contracts: Array.from({ length: claimCount }, (_, i) => ({ address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "tokenOfOwnerByIndex", args: [me, BigInt(i)], chainId: PAY_CHAIN.id })),
    query: { enabled: live && claimCount > 0, refetchInterval: 15_000 },
  });
  const myClaims = (claimIdReads.data ?? []).map((x) => x.result as bigint | undefined).filter((x): x is bigint => x !== undefined).map(Number);

  const ids = Array.from(new Set([...myCodes, ...myClaims])).sort((a, c) => a - c);
  const pkgReads = useReadContracts({
    contracts: ids.flatMap((id) => [
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "packages", args: [BigInt(id)], chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "ownerOf", args: [BigInt(id)], chainId: PAY_CHAIN.id },
      { address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "isActivated", args: [BigInt(id)], chainId: PAY_CHAIN.id },
    ]),
    query: { enabled: live && ids.length > 0, refetchInterval: 15_000 },
  });
  const pkgs: Pkg[] = ids.map((id, i) => {
    const p = pkgReads.data?.[i * 3]?.result as readonly [string, bigint, boolean] | undefined;
    const holder = pkgReads.data?.[i * 3 + 1]?.result as string | undefined;
    const activated = Boolean(pkgReads.data?.[i * 3 + 2]?.result);
    const referrer = p?.[0] ?? "";
    return { id, referrer, activateAt: Number(p?.[1] ?? 0n), redeemed: Boolean(p?.[2]), activated, holder, referrerMints: referrer.toLowerCase() === me.toLowerCase() ? myMints : 0 };
  });
  // Claims bought from someone else: fetch that referrer's count so the holder sees progress too.
  const otherReferrers = Array.from(new Set(pkgs.filter((p) => p.referrer && p.referrer.toLowerCase() !== me.toLowerCase()).map((p) => p.referrer)));
  const otherMintReads = useReadContracts({
    contracts: otherReferrers.map((r) => ({ address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "referrerMints", args: [r as `0x${string}`], chainId: PAY_CHAIN.id })),
    query: { enabled: live && otherReferrers.length > 0, refetchInterval: 15_000 },
  });
  for (const p of pkgs) {
    const k = otherReferrers.indexOf(p.referrer);
    if (k >= 0) p.referrerMints = Number((otherMintReads.data?.[k]?.result as bigint | undefined) ?? 0n);
  }

  const onPayChain = chainId === PAY_CHAIN.id;
  const busy = step !== "idle";

  async function ensureChain() {
    if (!onPayChain) {
      setStep("switching");
      await switchChainAsync({ chainId: PAY_CHAIN.id });
    }
  }

  async function buy() {
    setError(null);
    setNotice(null);
    if (!isConnected) return openConnectModal?.();
    if (!live || !GENESIS_ADDRESS || !payClient) return;
    try {
      await ensureChain();
      if (allowance < price) {
        setStep("approving");
        const h = await writeContractAsync({ address: VTRU_BSC, abi: ERC20_ABI, functionName: "approve", args: [GENESIS_ADDRESS, price], chainId: PAY_CHAIN.id });
        await payClient.waitForTransactionReceipt({ hash: h });
      }
      setStep("buying");
      const h = await writeContractAsync({ address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "buy", chainId: PAY_CHAIN.id });
      const rc = await payClient.waitForTransactionReceipt({ hash: h });
      if (rc.status !== "success") throw new Error("Purchase reverted");
      setNotice("Package bought. Your referral link and Claim are below.");
      base.refetch();
    } catch (e) {
      setError(short(e));
    } finally {
      setStep("idle");
    }
  }

  async function redeem(id: number) {
    setError(null);
    setNotice(null);
    if (!SALE_ADDRESS || !payClient) return;
    try {
      await ensureChain();
      setStep("redeeming");
      const h = await writeContractAsync({ address: SALE_ADDRESS, abi: SALE_ABI, functionName: "redeemClaim", args: [BigInt(id)], chainId: PAY_CHAIN.id });
      const rc = await payClient.waitForTransactionReceipt({ hash: h });
      if (rc.status !== "success") throw new Error("Redemption reverted");
      setNotice(`Claim #${id} redeemed. Your shard is being minted on Vitruveo.`);
      base.refetch();
    } catch (e) {
      setError(short(e));
    } finally {
      setStep("idle");
    }
  }

  const myLink = myCode ? `${origin}/mint?ref=${myCode}` : "";
  function copy() {
    navigator.clipboard?.writeText(myLink).then(() => {
      setCopied(1);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const priceLabel = `${fmt(Number(formatUnits(price, 18)))} VTRU`;
  const label = !mounted || !isConnected
    ? "Connect Wallet"
    : !live || paused
      ? "Genesis opens soon"
      : step === "switching"
        ? "Switch to BNB Smart Chain…"
        : step === "approving"
          ? "Approving VTRU…"
          : step === "buying"
            ? "Confirming purchase…"
            : !onPayChain
              ? `Switch to BNB Chain · ${priceLabel}`
              : `Buy Genesis · ${priceLabel}`;
  const disabled = mounted && isConnected && (!live || paused || busy);
  const lowBalance = mounted && isConnected && live && vtruBalance < price;

  return (
    <div className="panel panel-flat flex h-full flex-col p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">Genesis</p>
        <span className={`inline-flex items-center gap-2 font-mono text-base uppercase tracking-[0.2em] ${live && !paused ? "text-signal" : "text-ember"}`}>
          <span className={`live-dot inline-block h-1.5 w-1.5 rounded-full ${live && !paused ? "bg-signal" : "bg-ember"}`} />
          {live && !paused ? "Live" : "Opening soon"}
        </span>
      </div>

      <div className="mb-5 space-y-2 border-t border-hairline pt-4 font-mono text-base tracking-[0.08em]">
        <div className="flex justify-between"><span className="text-faint">PRICE</span><span className="text-ink">{priceLabel}</span></div>
        <div className="flex justify-between"><span className="text-faint">PAID ON</span><span className="text-ink">BNB SMART CHAIN</span></div>
        <div className="flex justify-between"><span className="text-faint">COMMISSION</span><span className="text-ink">10% OF EVERY MINT</span></div>
        <div className="flex justify-between"><span className="text-faint">CLAIM ACTIVATES AT</span><span className="text-ink">{threshold} SALES</span></div>
        <div className="flex justify-between"><span className="text-faint">PACKAGES SOLD</span><span className="tabular-nums text-ink">{totalPackages}</span></div>
      </div>

      <button
        onClick={buy}
        disabled={disabled}
        className="btn-pulse w-full border border-signal bg-signal/15 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      <p className={`mt-3 text-center font-mono text-sm uppercase tracking-[0.2em] ${error ? "text-ember" : "text-faint"}`}>
        {error ?? notice ?? (lowBalance ? `Needs ${priceLabel} on BNB Chain` : "VTRU on BNB Chain · bridge from Vitruveo")}
      </p>
      <a href={VTRU_BRIDGE_URL} target="_blank" rel="noreferrer" className="mt-1 text-center font-mono text-sm tracking-[0.15em] text-signal underline-offset-4 hover:underline">
        BRIDGE VTRU TO BSC
      </a>

      {mounted && isConnected && live && myCode && (
        <div className="mt-6 border-t border-hairline pt-4">
          <div className="flex items-center justify-between font-mono text-base tracking-[0.08em]">
            <span className="text-faint">YOUR CODE</span>
            <span className="text-signal">{myCode}</span>
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-base tracking-[0.08em]">
            <span className="text-faint">SALES REFERRED</span>
            <span className="tabular-nums text-ink">{myMints}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate border border-hairline px-3 py-2 font-mono text-sm text-dim">{myLink}</code>
            <button onClick={copy} className="border border-hairline px-3 py-2 font-mono text-sm uppercase tracking-[0.2em] text-dim transition-all hover:border-signal hover:text-signal">
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {myPayout && myPayout.toLowerCase() !== me.toLowerCase() && (
            <p className="mt-2 font-mono text-sm uppercase tracking-[0.2em] text-faint">Commissions pay {myPayout.slice(0, 6)}…{myPayout.slice(-4)}</p>
          )}
        </div>
      )}

      {mounted && isConnected && live && (
        <div className="mt-6 border-t border-hairline pt-4">
          <p className="mb-3 font-mono text-base uppercase tracking-[0.3em] text-faint">Your claims</p>
          {pkgs.length === 0 && <p className="font-mono text-sm uppercase tracking-[0.2em] text-faint">None yet</p>}
          <div className="space-y-4">
            {pkgs.map((p) => {
              const mine = p.referrer.toLowerCase() === me.toLowerCase();
              const holdsClaim = (p.holder ?? "").toLowerCase() === me.toLowerCase();
              const pct = p.activateAt > 0 ? Math.min(100, Math.round((p.referrerMints / p.activateAt) * 100)) : 0;
              return (
                <div key={p.id} className="border border-hairline bg-void/60 p-4">
                  <div className="flex items-center justify-between font-mono text-base tracking-[0.08em]">
                    <span className="text-ink">CLAIM #{p.id}</span>
                    <span className={p.redeemed ? "text-faint" : p.activated ? "text-signal" : "text-ember"}>
                      {p.redeemed ? "REDEEMED" : p.activated ? "ACTIVE" : `${p.referrerMints} / ${p.activateAt} SALES`}
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-hairline">
                    <div className="h-1 bg-signal transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  {!mine && holdsClaim && (
                    <p className="mt-2 font-mono text-sm uppercase tracking-[0.2em] text-faint">Acquired from {p.referrer.slice(0, 6)}… · activates on their sales</p>
                  )}
                  {holdsClaim && !p.redeemed && (
                    <button
                      onClick={() => redeem(p.id)}
                      disabled={!p.activated || busy || !SALE_ADDRESS}
                      className="mt-3 w-full border border-signal bg-signal/15 py-3 font-mono text-sm uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {step === "redeeming" ? "Redeeming…" : p.activated ? "Redeem Claim · mint a shard" : `Locked until ${p.activateAt} sales`}
                    </button>
                  )}
                  {mine && !holdsClaim && !p.redeemed && (
                    <p className="mt-2 font-mono text-sm uppercase tracking-[0.2em] text-faint">Claim transferred · commissions still pay you</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
