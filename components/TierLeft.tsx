"use client";

import { fmt } from "@/lib/shards";
import { useSaleTiers } from "@/lib/useSaleTiers";

// Shards remaining in the live tier, read from the sale contract.
export default function TierLeft() {
  const { live, minted, supply } = useSaleTiers();
  return <>{fmt(supply[live] - minted[live])}</>;
}
