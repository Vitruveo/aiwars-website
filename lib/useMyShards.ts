"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { NFT_CHAIN } from "@/lib/web3";
import { NFT_ADDRESS, NFT_ABI } from "@/lib/contracts";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

// Token ids this wallet holds on Vitruveo. Polls so a freshly minted shard shows up on its own.
export function useMyShards() {
  const { address, isConnected } = useAccount();
  const enabled = Boolean(NFT_ADDRESS && address);
  const bal = useReadContracts({
    contracts: [{ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "balanceOf", args: [address ?? ZERO], chainId: NFT_CHAIN.id }],
    query: { enabled, refetchInterval: 15_000 },
  });
  const owned = Number((bal.data?.[0]?.result as bigint | undefined) ?? 0n);
  const ids = useReadContracts({
    contracts: Array.from({ length: owned }, (_, i) => ({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: "tokenOfOwnerByIndex",
      args: [address ?? ZERO, BigInt(i)],
      chainId: NFT_CHAIN.id,
    })),
    query: { enabled: owned > 0, refetchInterval: 15_000 },
  });
  const tokenIds = useMemo(
    () => (ids.data ?? []).map((x) => x.result as bigint | undefined).filter((x): x is bigint => x !== undefined).map(Number).sort((a, b) => a - b),
    [ids.data]
  );
  return { address, isConnected, owned, tokenIds, live: Boolean(NFT_ADDRESS) };
}
