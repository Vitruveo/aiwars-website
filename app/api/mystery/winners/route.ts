import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureMysterySchema, readAwards } from "@/lib/mystery/db";
import { periodLabel } from "@/lib/mystery/win";

// Fulfilment list. `awards`: one shard per twelve-hour window, newest first, with awarded/tokenId/tx once
// delivered. Mint with `npx hardhat --network vitruveo mint AIWarsNFT <address>` in aiwars-contracts, then
// `node --env-file=.env scripts/mystery-award.mjs <period> <tokenId> <tx>` here to mark it awarded.
// `firstRun`: the original 20-rank list (ranks 1-10 shards, 11-20 50,000 VTRU), all fulfilled 28 Oct 2026.

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureMysterySchema();
    const [awards, rows] = await Promise.all([readAwards(500), sql()`SELECT rank, address, created_at FROM mystery_winners ORDER BY rank`]);
    return NextResponse.json({
      awards: awards.map((w) => ({ ...w, label: periodLabel(w.period) })),
      pending: awards.filter((w) => !w.awarded).length,
      firstRun: rows.map((r) => ({ rank: Number(r.rank), address: r.address, prize: Number(r.rank) <= 10 ? "shard" : "vtru", claimedAt: r.created_at })),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
