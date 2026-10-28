import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureMysterySchema } from "@/lib/mystery/db";
import { PRIZE_COUNT } from "@/lib/mystery/win";

// Winner list for manual fulfilment: rank, wallet, time of claim. Public; the wallets receive an
// on-chain shard anyway. Mint with: npx hardhat --network vitruveo mint AIWarsNFT <address>

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureMysterySchema();
    const rows = await sql()`SELECT rank, address, created_at FROM mystery_winners ORDER BY rank`;
    return NextResponse.json({
      prizes: PRIZE_COUNT,
      claimed: rows.length,
      winners: rows.map((r) => ({ rank: Number(r.rank), address: r.address, claimedAt: r.created_at })),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
