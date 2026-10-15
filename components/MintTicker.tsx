"use client";

import { useSaleOpen } from "@/lib/useSaleOpen";
import { TIERS, MINTED, TOTAL_SUPPLY, MAX_PER_WALLET, liveTierIndex, fmt } from "@/lib/shards";

export default function MintTicker() {
  const open = useSaleOpen();
  const i = liveTierIndex();
  const t = TIERS[i];
  const items = [
    [open ? "MINTING NOW" : "OPENING SOON", `TIER ${String(t.n).padStart(2, "0")} ${t.name.toUpperCase()}`],
    ["PRICE", `$${t.price}`],
    ["LEFT IN TIER", `${fmt(t.supply - MINTED[i])} / ${fmt(t.supply)}`],
    ["TOTAL SUPPLY", `${fmt(TOTAL_SUPPLY)} · FIXED`],
    ["PER WALLET", `MAX ${MAX_PER_WALLET}`],
    ["HOLDERS", "EXCLUSIVE BETA ACCESS"],
    ["NEXT", `TIER ${String(Math.min(t.n + 1, 5)).padStart(2, "0")} UNLOCKS WHEN ${String(t.n).padStart(2, "0")} SELLS OUT`],
  ];
  const Row = () => (
    <>
      {items.map(([k, v]) => (
        <span key={k} className="mx-8 inline-flex items-baseline gap-3 whitespace-nowrap">
          <span className="text-faint">{k}</span>
          <span className={k === "MINTING NOW" || k === "OPENING SOON" || k === "HOLDERS" ? "text-signal" : "text-ink"}>{v}</span>
        </span>
      ))}
    </>
  );
  return (
    <div className="overflow-hidden border-y border-hairline bg-void/80 py-3 font-mono text-base tracking-[0.2em]">
      <div className="marquee flex w-max">
        <Row />
        <Row />
      </div>
    </div>
  );
}
