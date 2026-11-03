import { createPublicClient, http, parseAbiItem } from "viem";
import { vitruveo } from "@/lib/chains";
import { NFT_ADDRESS } from "@/lib/contracts";

// Token ids minted as AI Wars Trends prizes, from the contract's PrizeMinted events. Cached for a minute.
const client = createPublicClient({ chain: vitruveo, transport: http(process.env.VITRUVEO_RPC_URL || vitruveo.rpcUrls.default.http[0]) });
const PRIZE_MINTED = parseAbiItem("event PrizeMinted(address indexed player, uint256 indexed tokenId, uint256 creditsSpent)");

let memo: { ids: number[]; at: number } | null = null;

export async function wonTokenIds(fresh = false): Promise<number[]> {
  if (!NFT_ADDRESS) return [];
  if (!fresh && memo && Date.now() - memo.at < 60_000) return memo.ids;
  const logs = await client.getLogs({ address: NFT_ADDRESS, event: PRIZE_MINTED, fromBlock: 0n, toBlock: "latest" });
  const ids = logs.map((l) => Number(l.args.tokenId)).sort((a, b) => a - b);
  memo = { ids, at: Date.now() };
  return ids;
}
