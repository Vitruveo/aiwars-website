import { NextResponse } from "next/server";
import { TIERS, TOTAL_SUPPLY, MAX_PER_WALLET, tierForTokenId } from "@/lib/shards";

// ERC-721 metadata. The contract resolves tokenURI as baseURI + tokenId, so the
// on-chain baseURI is `${SITE}/nft/metadata/` and this route answers for ids 1..TOTAL_SUPPLY.
// Set NEXT_PUBLIC_SITE_URL in production so image/animation URLs are absolute and stable.

function siteUrl(req: Request) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(req.url).origin;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  if (!/^\d+$/.test(raw)) return NextResponse.json({ error: "invalid token id" }, { status: 400 });
  const id = Number(raw);
  if (id < 1 || id > TOTAL_SUPPLY) return NextResponse.json({ error: "token id out of range" }, { status: 404 });

  const t = tierForTokenId(id);
  if (!t) return NextResponse.json({ error: "token id out of range" }, { status: 404 });

  const site = siteUrl(req);
  const acts = Object.entries(t.tier.acts)
    .filter(([, on]) => on)
    .map(([k]) => k[0].toUpperCase() + k.slice(1));

  const body = {
    name: `Archive Shard #${id}`,
    description:
      `Archive Shard ${id} of ${TOTAL_SUPPLY}. Tier ${String(t.tier.n).padStart(2, "0")} ${t.tier.name}. ` +
      `One of ${TOTAL_SUPPLY} shards, five tiers minted strictly in order, ${MAX_PER_WALLET} per wallet. ` +
      "Holders are the exclusive beta testers of AI Wars, a Vertical Foundation project.",
    image: `${site}/aiwars_nft.gif`,
    animation_url: `${site}/aiwars_nft.mp4`,
    external_url: `${site}/nft`,
    background_color: "04070d",
    attributes: [
      { trait_type: "Tier", value: t.tier.n, display_type: "number", max_value: TIERS.length },
      { trait_type: "Tier Name", value: t.tier.name },
      { trait_type: "Tier Serial", value: t.serial, display_type: "number", max_value: t.tier.supply },
      { trait_type: "Activations", value: acts.join(" · ") },
      { trait_type: "Mint Price (USD)", value: t.tier.price, display_type: "number" },
    ],
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
