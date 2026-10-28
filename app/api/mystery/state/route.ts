import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { readProgress } from "@/lib/mystery/db";
import { PRIZE_COUNT, heldFragments, isComplete, FRAGMENTS } from "@/lib/mystery/win";

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
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
