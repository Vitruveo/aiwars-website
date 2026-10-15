"use client";

import { useReadContract } from "wagmi";
import { PAY_CHAIN } from "@/lib/web3";
import { SALE_ADDRESS, SALE_ABI } from "@/lib/contracts";

/// True only when ShardSale is deployed and unpaused on BSC. Defaults to false until the read resolves.
export function useSaleOpen(): boolean {
  const { data } = useReadContract({
    address: SALE_ADDRESS,
    abi: SALE_ABI,
    functionName: "paused",
    chainId: PAY_CHAIN.id,
    query: { enabled: Boolean(SALE_ADDRESS), refetchInterval: 15_000 },
  });
  return Boolean(SALE_ADDRESS) && data === false;
}
