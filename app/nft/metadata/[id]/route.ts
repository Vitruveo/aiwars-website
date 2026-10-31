import { NextResponse } from "next/server";
import { TIERS, TOTAL_SUPPLY, MAX_PER_WALLET, tierForTokenId } from "@/lib/shards";
import { createPublicClient, http } from "viem";
import { givenSerial } from "@/lib/mystery/db";
import { vitruveo } from "@/lib/chains";
import { NFT_ADDRESS, NFT_ABI } from "@/lib/contracts";

const chain = createPublicClient({ chain: vitruveo, transport: http(process.env.VITRUVEO_RPC_URL || vitruveo.rpcUrls.default.http[0]) });

// Tier stored on chain for tokens the contract minted with an explicit tier (AI Wars Trends prizes); 0 otherwise.
async function explicitTier(id: number): Promise<number> {
  if (!NFT_ADDRESS) return 0;
  try {
    return Number(await chain.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "explicitTier", args: [BigInt(id)] }));
  } catch {
    return 0; // contract not upgraded yet, or RPC down: fall back to sale order
  }
}

// ERC-721 metadata. The contract resolves tokenURI as baseURI + tokenId, so the
// on-chain baseURI is `${SITE}/nft/metadata/` and this route answers for ids 1..TOTAL_SUPPLY.
// Set NEXT_PUBLIC_SITE_URL in production so image URL are absolute and stable.

function siteUrl(req: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(req.url).origin;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  if (!/^\d+$/.test(raw)) return NextResponse.json({ error: "invalid token id" }, { status: 400 });
  const id = Number(raw);
  if (id < 1) return NextResponse.json({ error: "token id out of range" }, { status: 404 });

  // Shards given through the Archive (/mystery) are Tier 5 Survivor regardless of id; everything else
  // follows the sale order.
  // Tokens won in AI Wars Trends carry their tier on chain.
  let given: number | null = null;
  const [onchain, g] = await Promise.all([explicitTier(id), givenSerial(id).catch(() => null)]);
  given = g;
  const won = onchain >= 1 && onchain <= TIERS.length;
  // Past the sale's 5000 only game prizes exist.
  if (!won && id > TOTAL_SUPPLY) return NextResponse.json({ error: "token id out of range" }, { status: 404 });
  const t = won
    ? { index: onchain - 1, tier: TIERS[onchain - 1], serial: 0 }
    : given
      ? { index: TIERS.length - 1, tier: TIERS[TIERS.length - 1], serial: given }
      : tierForTokenId(id);
  if (!t) return NextResponse.json({ error: "token id out of range" }, { status: 404 });

  const site = siteUrl(req);
  const acts = Object.entries(t.tier.acts)
    .filter(([, on]) => on)
    .map(([k]) => k[0].toUpperCase() + k.slice(1));

  const body = {
    name: `Archive Shard #${id}`,
    description:
      (won
        ? `Archive Shard ${id}. Tier ${String(t.tier.n).padStart(2, "0")} ${t.tier.name}, won in AI Wars Trends. `
        : `Archive Shard ${id} of ${TOTAL_SUPPLY}. Tier ${String(t.tier.n).padStart(2, "0")} ${t.tier.name}. `) +
      `One of ${TOTAL_SUPPLY} shards, five tiers minted strictly in order, ${MAX_PER_WALLET} per wallet. ` +
      "Holders are the exclusive beta testers of AI Wars, a Vertical Foundation project.",
    image: `${site}/aiwars_nft.gif`,
    external_url: `${site}/nft`,
    background_color: "04070d",
    attributes: [
      { trait_type: "Tier", value: t.tier.n, display_type: "number", max_value: TIERS.length },
      { trait_type: "Tier Name", value: t.tier.name },
      ...(won ? [] : [{ trait_type: "Tier Serial", value: t.serial, display_type: "number", max_value: t.tier.supply }]),
      { trait_type: "Activations", value: acts.join(" · ") },
      { trait_type: "Mint Price (USD)", value: won || given ? 0 : t.tier.price, display_type: "number" },
      { trait_type: "Origin", value: won ? "Won in AI Wars Trends" : given ? "Given by the Archive" : "Sale" },
    ],
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
