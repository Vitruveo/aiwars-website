import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { awardForPeriod, readAwards, readProgress } from "@/lib/mystery/db";
import { AWARDS_OPEN, FRAGMENTS, PERIOD_START, PERIOD_MS, heldFragments, isComplete, periodEnd, periodIndex, periodLabel, periodStart } from "@/lib/mystery/win";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const address = new URL(req.url).searchParams.get("address");
  const a = address && isAddress(address) ? address : null;
  try {
    const now = Date.now();
    const i = periodIndex(now);
    const [p, current, awards] = await Promise.all([readProgress(a), AWARDS_OPEN && i >= 0 ? awardForPeriod(i) : null, AWARDS_OPEN ? readAwards(12) : []]);
    return NextResponse.json({
      now,
      awardsOpen: AWARDS_OPEN,
      fragments: heldFragments(p.fragments),
      total: FRAGMENTS.length,
      complete: isComplete(p.fragments),
      period: {
        index: i,
        open: AWARDS_OPEN && i >= 0,
        startsAt: i >= 0 ? periodStart(i) : PERIOD_START,
        endsAt: i >= 0 ? periodEnd(i) : PERIOD_START,
        label: periodLabel(Math.max(0, i)),
        taken: current ? current.address : null,
        ms: PERIOD_MS,
      },
      award: p.award ? { ...p.award, label: periodLabel(p.award.period) } : null,
      awards: awards.map((w) => ({ ...w, label: periodLabel(w.period) })),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
