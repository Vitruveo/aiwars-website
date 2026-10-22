"use client";

import { useEffect, useState } from "react";
import { useAccount, useChainId, useReadContracts, useSwitchChain, useWriteContract, usePublicClient } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatUnits } from "viem";
import Shard from "@/components/Shard";
import { TIERS, MAX_PER_WALLET, fmt } from "@/lib/shards";
import { PAY_CHAIN, NFT_CHAIN } from "@/lib/web3";
import { SALE_ADDRESS, SALE_ABI, NFT_ADDRESS, USDT_BSC, ERC20_ABI, GENESIS_ADDRESS, GENESIS_ABI } from "@/lib/contracts";
import { useMyShards } from "@/lib/useMyShards";
import { requestFulfill } from "@/lib/fulfill";

const STAGES = [
  { n: 1, name: "Power + Scape", body: "Stronger, and an easier way through the terrain." },
  { n: 2, name: "Duo · 2×", body: "Squad, inventory, build queue, vehicle bays, expedition window. Doubled." },
  { n: 3, name: "Trio wakes", body: "Faction Command, Augment Path, Canon Author, Machine Parley." },
];

type Step = "idle" | "switching" | "approving" | "buying" | "minting" | "done";

function short(e: unknown) {
  const m = (e as { shortMessage?: string; message?: string })?.shortMessage || (e as Error)?.message || "Transaction failed";
  return m.length > 90 ? m.slice(0, 90) + "…" : m;
}

export default function ShardMintPanel() {
  const [qty, setQty] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [mintedIds, setMintedIds] = useState<number[] | null>(null);
  const [ref, setRef] = useState("");
  useEffect(() => {
    setMounted(true);
    // Genesis referral code (first 5 hex chars of the referrer's address, any case):
    // ?ref=<code> wins, otherwise the last one seen in this browser.
    try {
      const clean = (v: string | null) => (v ?? "").trim().toLowerCase().replace(/[^0-9a-f]/g, "").slice(0, 40);
      const fromUrl = clean(new URLSearchParams(window.location.search).get("ref"));
      if (fromUrl.length >= 5) {
        localStorage.setItem("aiwars-ref", fromUrl);
        setRef(fromUrl);
      } else {
        const saved = clean(localStorage.getItem("aiwars-ref"));
        if (saved.length >= 5) setRef(saved);
      }
    } catch {}
  }, []);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const payClient = usePublicClient({ chainId: PAY_CHAIN.id });

  const saleLive = Boolean(SALE_ADDRESS);
  const zero = "0x0000000000000000000000000000000000000000" as const;

  // Sale state on BSC. Polls so the tier counters move while the sale runs.
  const sale = useReadContracts({
    contracts: [
      { address: SALE_ADDRESS, abi: SALE_ABI, functionName: "paused", chainId: PAY_CHAIN.id },
      { address: SALE_ADDRESS, abi: SALE_ABI, functionName: "liveTier", chainId: PAY_CHAIN.id },
      { address: SALE_ADDRESS, abi: SALE_ABI, functionName: "tiers", chainId: PAY_CHAIN.id },
      { address: SALE_ADDRESS, abi: SALE_ABI, functionName: "quote", args: [BigInt(qty)], chainId: PAY_CHAIN.id },
      { address: SALE_ADDRESS, abi: SALE_ABI, functionName: "purchased", args: [address ?? zero], chainId: PAY_CHAIN.id },
      { address: USDT_BSC, abi: ERC20_ABI, functionName: "allowance", args: [address ?? zero, SALE_ADDRESS ?? zero], chainId: PAY_CHAIN.id },
      { address: USDT_BSC, abi: ERC20_ABI, functionName: "balanceOf", args: [address ?? zero], chainId: PAY_CHAIN.id },
      { address: USDT_BSC, abi: ERC20_ABI, functionName: "decimals", chainId: PAY_CHAIN.id },
    ],
    query: { enabled: saleLive, refetchInterval: 15_000 },
  });
  const r = sale.data;
  const paused = saleLive ? (r?.[0]?.result as boolean | undefined) ?? true : true;
  const liveIdx = Number((r?.[1]?.result as bigint | undefined) ?? 0n);
  const tiers = r?.[2]?.result as readonly [readonly bigint[], readonly bigint[], readonly bigint[]] | undefined;
  const cost = (r?.[3]?.result as bigint | undefined) ?? 0n;
  const bought = Number((r?.[4]?.result as bigint | undefined) ?? 0n);
  const allowance = (r?.[5]?.result as bigint | undefined) ?? 0n;
  const usdtBalance = (r?.[6]?.result as bigint | undefined) ?? 0n;
  const decimals = (r?.[7]?.result as number | undefined) ?? 18;

  // A referral code only applies if the Genesis contract knows it.
  const refCheck = useReadContracts({
    contracts: [{ address: GENESIS_ADDRESS, abi: GENESIS_ABI, functionName: "isCode", args: [ref], chainId: PAY_CHAIN.id }],
    query: { enabled: Boolean(GENESIS_ADDRESS && ref) },
  });
  const refValid = Boolean(GENESIS_ADDRESS && ref && refCheck.data?.[0]?.result === true);
  const refArg = refValid ? ref : "";

  const live = TIERS[liveIdx] ?? TIERS[0];
  const supply = tiers ? Number(tiers[0][liveIdx]) : live.supply;
  const soldInTier = tiers ? Number(tiers[2][liveIdx]) : 0;
  const remaining = supply - soldInTier;
  const unitPrice = tiers ? Number(formatUnits(tiers[1][liveIdx], decimals)) : live.price;
  const total = saleLive && tiers ? Number(formatUnits(cost, decimals)) : qty * live.price;
  const canBuy = Math.max(0, MAX_PER_WALLET - bought);

  const { owned, tokenIds } = useMyShards();

  const onPayChain = chainId === PAY_CHAIN.id;
  const onNftChain = chainId === NFT_CHAIN.id;
  const busy = step !== "idle" && step !== "done";

  async function buy() {
    setError(null);
    if (!isConnected) return openConnectModal?.();
    if (!saleLive || !SALE_ADDRESS || !payClient) return;
    try {
      if (!onPayChain) {
        setStep("switching");
        await switchChainAsync({ chainId: PAY_CHAIN.id });
      }
      if (allowance < cost) {
        setStep("approving");
        const h = await writeContractAsync({ address: USDT_BSC, abi: ERC20_ABI, functionName: "approve", args: [SALE_ADDRESS, cost], chainId: PAY_CHAIN.id });
        await payClient.waitForTransactionReceipt({ hash: h });
      }
      setStep("buying");
      const h = await writeContractAsync({ address: SALE_ADDRESS, abi: SALE_ABI, functionName: "buy", args: [BigInt(qty), refArg], chainId: PAY_CHAIN.id });
      const rc = await payClient.waitForTransactionReceipt({ hash: h });
      if (rc.status !== "success") throw new Error("Purchase reverted");
      setLastTx(h);
      sale.refetch();
      setStep("minting");
      setMintedIds(address ? await requestFulfill(address) : null);
      setStep("done");
    } catch (e) {
      setError(short(e));
      setStep("idle");
    }
  }

  async function viewOnVitruveo() {
    setError(null);
    try {
      await switchChainAsync({ chainId: NFT_CHAIN.id });
    } catch (e) {
      setError(short(e));
    }
  }

  const label = !mounted
    ? "Connect Wallet"
    : !isConnected
      ? "Connect Wallet"
      : !saleLive || paused
        ? "Sale opens soon"
        : canBuy === 0
          ? "Wallet limit reached"
          : step === "switching"
            ? "Switch to BNB Smart Chain…"
            : step === "approving"
              ? "Approving USDT…"
              : step === "buying"
                ? "Confirming purchase…"
                : step === "minting"
                  ? "Minting on Vitruveo…"
                : !onPayChain
                  ? `Switch to BNB Chain · Pay $${fmt(total)}`
                  : `Pay $${fmt(total)} USDT`;
  const disabled = mounted && isConnected && (!saleLive || paused || canBuy === 0 || busy || qty > canBuy);

  const status = error
    ? error
    : step === "minting"
      ? "Paid on BNB Chain. Minting your shard on Vitruveo…"
      : step === "done"
        ? mintedIds && mintedIds.length > 0
          ? `Minted on Vitruveo: Archive Shard ${mintedIds.map((n) => `#${n}`).join(", ")}`
          : "Paid on BNB Chain. Your shard is being minted on Vitruveo."
      : !mounted || !isConnected
        ? "Pay in USDT on BNB Chain · NFT minted on Vitruveo"
        : !saleLive || paused
          ? "Wallet connected. Minting opens shortly."
          : usdtBalance < cost
            ? `Needs ${fmt(total)} USDT on BNB Chain`
            : `${bought} of ${MAX_PER_WALLET} bought from this wallet`;

  return (
    <div className="panel panel-flat flex h-full flex-col p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">Mint</p>
        <span className={`inline-flex items-center gap-2 font-mono text-base uppercase tracking-[0.2em] ${saleLive && !paused ? "text-signal" : "text-ember"}`}>
          <span className={`live-dot inline-block h-1.5 w-1.5 rounded-full ${saleLive && !paused ? "bg-signal" : "bg-ember"}`} />
          {saleLive && !paused ? "Live" : "Opening soon"}
        </span>
      </div>

      <label className="mb-2 block font-mono text-base uppercase tracking-[0.3em] text-faint">
        How many · max {MAX_PER_WALLET} per wallet
      </label>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((v) => (
          <button
            key={v}
            onClick={() => setQty(v)}
            disabled={busy}
            className={`flex flex-col items-center gap-1 border py-3 transition-all ${
              qty === v ? "border-signal bg-signal/15 shadow-[0_0_30px_rgba(45,140,255,0.25)]" : "border-hairline hover:border-dim"
            }`}
          >
            <span className="flex items-end justify-center gap-0.5">
              {Array.from({ length: v }, (_, k) => (
                <Shard key={k} tier={live.n} size={v === 1 ? 34 : v === 2 ? 26 : 20} />
              ))}
            </span>
            <span className={`display text-2xl ${qty === v ? "text-signal" : "text-faint"}`}>{v}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 border border-hairline bg-void/60 px-4 py-3">
        {STAGES.filter((s) => s.n <= qty).map((s) => (
          <p key={s.n} className="flex items-baseline gap-3 py-1 text-base">
            <span className={`font-mono text-sm tracking-[0.2em] ${s.n === 3 ? "text-ember" : "text-signal"}`}>{s.n}</span>
            <span className="text-ink">{s.name}</span>
            <span className="hidden text-dim sm:inline">· {s.body}</span>
          </p>
        ))}
        {qty < 3 && (
          <p className="mt-1 font-mono text-sm tracking-[0.15em] text-faint">
            +{3 - qty} MORE TO {qty === 1 ? "DOUBLE" : "WAKE TRIO"}
          </p>
        )}
      </div>

      <div className="mb-5 space-y-2 border-t border-hairline pt-4 font-mono text-base tracking-[0.08em]">
        <div className="flex justify-between">
          <span className="text-faint">TIER</span>
          <span className="text-ink">{String(live.n).padStart(2, "0")} {live.name.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-faint">LEFT</span>
          <span className="tabular-nums text-ink">{fmt(remaining)} / {fmt(supply)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-faint">EACH</span>
          <span className="tabular-nums text-ink">${fmt(unitPrice)} USDT</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-faint">TOTAL</span>
          <span className="text-signal">${fmt(total)}</span>
        </div>
      </div>

      <button
        onClick={buy}
        disabled={disabled}
        className="btn-pulse mt-auto w-full border border-signal bg-signal/15 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      <p className={`mt-3 text-center font-mono text-sm uppercase tracking-[0.2em] ${error ? "text-ember" : "text-faint"}`}>{status}</p>
      {mounted && ref && (
        <p className="mt-2 text-center font-mono text-sm uppercase tracking-[0.2em] text-faint">
          {refValid ? <>Referred by Genesis <span className="text-signal">{ref.toUpperCase()}</span></> : GENESIS_ADDRESS ? `Referral code ${ref.toUpperCase()} not found` : `Referral ${ref.toUpperCase()} applies when Genesis opens`}
        </p>
      )}
      {lastTx && (
        <a href={`${PAY_CHAIN.blockExplorers.default.url}/tx/${lastTx}`} target="_blank" rel="noreferrer" className="mt-1 text-center font-mono text-sm tracking-[0.15em] text-signal underline-offset-4 hover:underline">
          VIEW PAYMENT ON BSCSCAN
        </a>
      )}

      {mounted && isConnected && NFT_ADDRESS && (
        <div className="mt-5 border-t border-hairline pt-4">
          <div className="flex items-center justify-between font-mono text-base tracking-[0.08em]">
            <span className="text-faint">YOUR SHARDS · VITRUVEO</span>
            <span className="tabular-nums text-ink">{owned}</span>
          </div>
          {tokenIds.length > 0 && (
            <p className="mt-2 flex flex-wrap gap-2">
              {tokenIds.map((id) => (
                <a
                  key={id}
                  href={`${NFT_CHAIN.blockExplorers.default.url}/token/${NFT_ADDRESS}/instance/${id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-hairline px-3 py-1 font-mono text-sm tracking-[0.15em] text-ink transition-colors hover:border-signal hover:text-signal"
                >
                  #{id}
                </a>
              ))}
              <a href="/nft" className="px-3 py-1 font-mono text-sm tracking-[0.15em] text-signal underline-offset-4 hover:underline">SEE THEM</a>
            </p>
          )}
          {owned > 0 && !onNftChain && (
            <button onClick={viewOnVitruveo} className="mt-3 w-full border border-hairline py-2 font-mono text-sm uppercase tracking-[0.25em] text-dim transition-all hover:border-signal hover:text-signal">
              Switch wallet to Vitruveo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
