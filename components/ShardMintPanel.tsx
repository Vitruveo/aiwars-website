"use client";

import { useState } from "react";
import Shard from "@/components/Shard";
import { TIERS, MINTED, MAX_PER_WALLET, liveTierIndex, fmt } from "@/lib/shards";

const STAGES = [
  { n: 1, name: "Power + Scape", body: "Stronger, and an easier way through the terrain." },
  { n: 2, name: "Duo · 2×", body: "Squad, inventory, build queue, vehicle bays, expedition window. Doubled." },
  { n: 3, name: "Trio wakes", body: "Faction Command, Augment Path, Canon Author, Machine Parley." },
];

export default function ShardMintPanel() {
  const [qty, setQty] = useState(1);
  const [notice, setNotice] = useState(false);

  const i = liveTierIndex();
  const live = TIERS[i];
  const remaining = live.supply - MINTED[i];
  const total = qty * live.price;

  return (
    <div className="panel panel-flat flex h-full flex-col p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">Mint</p>
        <span className="inline-flex items-center gap-2 font-mono text-base uppercase tracking-[0.2em] text-ember">
          <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-ember" />
          Opening soon
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
          <span className="tabular-nums text-ink">{fmt(remaining)} / {fmt(live.supply)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="text-faint">TOTAL</span>
          <span className="text-signal">${fmt(total)}</span>
        </div>
      </div>

      <button
        onClick={() => setNotice(true)}
        className="btn-pulse mt-auto w-full border border-signal bg-signal/15 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25"
      >
        Connect Wallet
      </button>
      <p className="mt-3 text-center font-mono text-sm uppercase tracking-[0.2em] text-faint">
        {notice ? "Wallet connection goes live when the mint opens." : "Holders enter the closed beta first"}
      </p>
    </div>
  );
}
