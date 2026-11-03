"use client";

import { useReadContracts } from "wagmi";
import { PAY_CHAIN } from "@/lib/web3";
import { SALE_ADDRESS, SALE_ABI } from "@/lib/contracts";
import { TIERS, MINTED, liveTierIndex } from "@/lib/shards";

// Live tier, per-tier sale supply and sold counts from ShardSale on BSC. Falls back to the static table until the
// contract answers, so server and first client render agree.
export function useSaleTiers() {
  const { data } = useReadContracts({
    contracts: [
      { address: SALE_ADDRESS, abi: SALE_ABI, functionName: "liveTier", chainId: PAY_CHAIN.id },
      { address: SALE_ADDRESS, abi: SALE_ABI, functionName: "tiers", chainId: PAY_CHAIN.id },
    ],
    query: { enabled: Boolean(SALE_ADDRESS), refetchInterval: 15_000 },
  });
  const tiers = data?.[1]?.result as readonly [readonly bigint[], readonly bigint[], readonly bigint[]] | undefined;
  const liveRaw = data?.[0]?.result as bigint | undefined;
  const minted = tiers ? TIERS.map((_, i) => Number(tiers[2][i] ?? 0n)) : MINTED;
  const supply = tiers ? TIERS.map((t, i) => Number(tiers[0][i] ?? BigInt(t.sale))) : TIERS.map((t) => t.sale);
  const live = tiers && liveRaw !== undefined ? Math.min(Number(liveRaw), TIERS.length - 1) : liveTierIndex();
  return { live, minted, supply, total: minted.reduce((a, b) => a + b, 0), saleTotal: supply.reduce((a, b) => a + b, 0) };
}
