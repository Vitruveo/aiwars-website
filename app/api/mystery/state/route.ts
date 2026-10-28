import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { readProgress } from "@/lib/mystery/db";
import { PRIZE_COUNT, SHARD_PRIZES, VTRU_AMOUNT, heldFragments, isComplete, FRAGMENTS, prizeFor } from "@/lib/mystery/win";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("address");
  const a = address && isAddress(address) ? address : null;
  try {
    const p = await readProgress(a);
    return NextResponse.json({
      fragments: heldFragments(p.fragments),
      total: FRAGMENTS.length,
      complete: isComplete(p.fragments),
      rank: p.rank,
      winners: p.winners,
      prizes: PRIZE_COUNT,
      shardPrizes: SHARD_PRIZES,
      vtruAmount: VTRU_AMOUNT,
      prize: p.rank ? prizeFor(p.rank) : null,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
