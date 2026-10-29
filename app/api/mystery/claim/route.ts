import { NextResponse } from "next/server";
import { isAddress, verifyMessage, type Address } from "viem";
import { claimPeriod, readProgress } from "@/lib/mystery/db";
import { AWARDS_OPEN, claimMessage, isComplete, periodIndex, periodLabel } from "@/lib/mystery/win";

// Claim: a wallet holding every understanding signs claimMessage(address, ts). The first such claim in
// the current twelve-hour window takes that window's shard. A wallet wins once. Delivery is manual.

export const dynamic = "force-dynamic";
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  if (!AWARDS_OPEN) return NextResponse.json({ error: "not open" }, { status: 403 });
  try {
    const body = (await req.json()) as { address: Address; ts: number; signature: `0x${string}` };
    const ts = Number(body.ts);
    if (!isAddress(body.address)) return NextResponse.json({ error: "bad address" }, { status: 400 });
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > WINDOW_MS) return NextResponse.json({ error: "stale signature" }, { status: 400 });
    const ok = await verifyMessage({ address: body.address, message: claimMessage(body.address, ts), signature: body.signature });
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });

    const p = await readProgress(body.address);
    if (p.award) return NextResponse.json({ ...p.award, label: periodLabel(p.award.period) });
    if (!isComplete(p.fragments)) return NextResponse.json({ error: "not yet" }, { status: 403 });
    const i = periodIndex();
    if (i < 0) return NextResponse.json({ error: "not open", opensAt: periodLabel(0) }, { status: 403 });
    const r = await claimPeriod(body.address, i);
    if (r === "taken") return NextResponse.json({ error: "taken", next: periodLabel(i + 1) }, { status: 409 });
    return NextResponse.json({ ...r, label: periodLabel(r.period) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
