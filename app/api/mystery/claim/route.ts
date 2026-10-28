import { NextResponse } from "next/server";
import { isAddress, verifyMessage, type Address } from "viem";
import { readProgress, recordWinner } from "@/lib/mystery/db";
import { PRIZE_COUNT, claimMessage, isComplete } from "@/lib/mystery/win";

// Claim: a wallet holding all fragments signs claimMessage(address, ts); the first PRIZE_COUNT
// distinct wallets are recorded. Delivery of the shard itself is manual (owner mint on Vitruveo).

export const dynamic = "force-dynamic";
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { address: Address; ts: number; signature: `0x${string}` };
    const ts = Number(body.ts);
    if (!isAddress(body.address)) return NextResponse.json({ error: "bad address" }, { status: 400 });
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > WINDOW_MS) return NextResponse.json({ error: "stale signature" }, { status: 400 });
    const ok = await verifyMessage({ address: body.address, message: claimMessage(body.address, ts), signature: body.signature });
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });

    const p = await readProgress(body.address);
    if (p.rank) return NextResponse.json({ rank: p.rank, prizes: PRIZE_COUNT });
    if (!isComplete(p.fragments)) return NextResponse.json({ error: "not yet" }, { status: 403 });
    const rank = await recordWinner(body.address);
    if (!rank) return NextResponse.json({ error: "all ten are gone" }, { status: 409 });
    return NextResponse.json({ rank, prizes: PRIZE_COUNT });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
