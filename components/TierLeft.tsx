"use client";

import { TIERS, fmt } from "@/lib/shards";
import { useSaleTiers } from "@/lib/useSaleTiers";

// Shards remaining in the live tier, read from the sale contract.
export default function TierLeft() {
  const { live, minted } = useSaleTiers();
  return <>{fmt(TIERS[live].supply - minted[live])}</>;
}
