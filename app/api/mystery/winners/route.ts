import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureMysterySchema } from "@/lib/mystery/db";
import { PRIZE_COUNT, VTRU_AMOUNT, prizeFor } from "@/lib/mystery/win";

// Winner list for manual fulfilment: rank, wallet, prize, time of claim. Ranks 1-10 get a shard
// (npx hardhat --network vitruveo mint AIWarsNFT <address>), ranks 11-20 get 50,000 VTRU sent by hand.

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureMysterySchema();
    const rows = await sql()`SELECT rank, address, created_at FROM mystery_winners ORDER BY rank`;
    return NextResponse.json({
      prizes: PRIZE_COUNT,
      claimed: rows.length,
      winners: rows.map((r) => ({ rank: Number(r.rank), address: r.address, prize: prizeFor(Number(r.rank)), vtru: prizeFor(Number(r.rank)) === "vtru" ? VTRU_AMOUNT : 0, claimedAt: r.created_at })),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
