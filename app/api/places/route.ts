import { NextResponse } from "next/server";
import { getPlaces } from "@/lib/scape/placesServer";
import { wonTokenIds } from "@/lib/scape/won";

// Where every minted shard sits: [tokenId, tier, serial] rows, plus the ids won in AI Wars Trends.

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [places, won] = await Promise.all([getPlaces(), wonTokenIds().catch(() => [] as number[])]);
    return NextResponse.json(
      { places: places.map((p) => [p.tokenId, p.tier, p.serial]), won },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } }
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
