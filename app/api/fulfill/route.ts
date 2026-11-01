import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, parseEventLogs, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { vitruveo, bscChain as bsc } from "@/lib/chains";
import { SALE_ADDRESS, SALE_ABI, NFT_ADDRESS, NFT_ABI } from "@/lib/contracts";

// Fulfils paid-but-unminted ShardSale purchases: reads pending() on BSC, mints on Vitruveo with the
// owner key, writes the token ids back to BSC. The client calls this right after its payment confirms.
// It trusts nothing from the caller; the BSC contract is the only source of what to mint.
//
// Env: OWNER_PRIVATE_KEY (required), BSC_RPC_URL, VITRUVEO_RPC_URL, FULFILL_SKIP (owner gift mints
// made outside the sale, default 3), FULFILL_GIFT_IDS (token ids given outside the sale after it
// opened, as "a-b,c", default the first Archive run 17-26).

export const maxDuration = 120;

const BATCH = 50n;

function parseIds(spec: string): Set<number> {
  const ids = new Set<number>();
  for (const part of spec.split(",").map((p) => p.trim()).filter(Boolean)) {
    const [a, b] = part.split("-").map(Number);
    for (let id = a; id <= (b || a); id++) ids.add(id);
  }
  return ids;
}

type Minted = { purchase: number; tokenId: number; to: Address };

// Serialises passes within one function instance. Across instances the pinned nonces below make
// a second concurrent mint fail at the node instead of minting twice.
let running: Promise<unknown> | null = null;

async function pass() {
  const pk = process.env.OWNER_PRIVATE_KEY;
  if (!pk) throw new Error("OWNER_PRIVATE_KEY is not set");
  if (!SALE_ADDRESS || !NFT_ADDRESS) throw new Error("contracts not deployed");
  const account = privateKeyToAccount((pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`);
  const skip = Number(process.env.FULFILL_SKIP ?? "3");
  const gifts = parseIds(process.env.FULFILL_GIFT_IDS ?? "17-26");

  const bscTransport = http(process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org");
  const vtruTransport = http(process.env.VITRUVEO_RPC_URL || vitruveo.rpcUrls.default.http[0]);
  const salePub = createPublicClient({ chain: bsc, transport: bscTransport });
  const saleWal = createWalletClient({ chain: bsc, transport: bscTransport, account });
  const nftPub = createPublicClient({ chain: vitruveo, transport: vtruTransport });
  const nftWal = createWalletClient({ chain: vitruveo, transport: vtruTransport, account });

  const [indicesRaw, buyers] = (await salePub.readContract({ address: SALE_ADDRESS, abi: SALE_ABI, functionName: "pending", args: [1n, BATCH] })) as [bigint[], Address[]];
  const indices = indicesRaw.map(Number);
  if (indices.length === 0) return { minted: [] as Minted[] };

  const minted: Minted[] = [];

  // Recovery: tokens minted by an earlier pass whose ids never reached BSC.
  const issued = Number((await salePub.readContract({ address: SALE_ADDRESS, abi: SALE_ABI, functionName: "issued" })) as bigint);
  const total = Number((await nftPub.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "totalMinted" })) as bigint);
  let pos = 0;
  for (let id = skip + issued + 1; id <= total && pos < indices.length; id++) {
    if (gifts.has(id)) continue; // Archive gifts minted after the sale opened
    let owner: Address;
    try {
      owner = (await nftPub.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "ownerOf", args: [BigInt(id)] })) as Address;
    } catch {
      continue; // burned
    }
    // AI Wars Trends prizes are minted by the game with an explicit tier; they are not sale tokens.
    const explicit = await nftPub.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "explicitTier", args: [BigInt(id)] }).catch(() => 0);
    if (Number(explicit) !== 0) continue;
    if (owner.toLowerCase() !== buyers[pos].toLowerCase()) {
      throw new Error(`token ${id} is owned by ${owner} but purchase ${indices[pos]} belongs to ${buyers[pos]}; resolve manually`);
    }
    minted.push({ purchase: indices[pos], tokenId: id, to: buyers[pos] });
    pos++;
  }

  // Mint the rest in one transaction, in purchase order. Nonce pinned to "latest" so a racing
  // instance submitting the same nonce is rejected by the node rather than minting again.
  let mintTx: `0x${string}` | undefined;
  if (pos < indices.length) {
    const to = buyers.slice(pos);
    const nonce = await nftPub.getTransactionCount({ address: account.address, blockTag: "latest" });
    mintTx = await nftWal.writeContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "mintBatch", args: [to], nonce });
    const receipt = await nftPub.waitForTransactionReceipt({ hash: mintTx });
    if (receipt.status !== "success") throw new Error("mintBatch reverted");
    const ids = parseEventLogs({ abi: NFT_ABI, logs: receipt.logs, eventName: "Transfer" }).map((l) => Number((l.args as { tokenId: bigint }).tokenId));
    if (ids.length !== to.length) throw new Error(`minted ${ids.length} tokens for ${to.length} purchases`);
    ids.forEach((tokenId, k) => minted.push({ purchase: indices[pos + k], tokenId, to: to[k] }));
  }

  const nonce = await salePub.getTransactionCount({ address: account.address, blockTag: "latest" });
  const recordTx = await saleWal.writeContract({
    address: SALE_ADDRESS,
    abi: SALE_ABI,
    functionName: "recordTokenIds",
    args: [minted.map((m) => BigInt(m.purchase)), minted.map((m) => BigInt(m.tokenId))],
    nonce,
  });
  const r2 = await salePub.waitForTransactionReceipt({ hash: recordTx });
  if (r2.status !== "success") throw new Error("recordTokenIds reverted");

  return { minted, mintTx, recordTx };
}

export async function POST() {
  if (!running) running = pass().finally(() => (running = null));
  try {
    const result = await running;
    return NextResponse.json(result);
  } catch (e) {
    const message = (e as Error)?.message || "fulfill failed";
    console.error("fulfill:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
