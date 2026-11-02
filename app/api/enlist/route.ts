import { NextResponse } from "next/server";
import { verifyMessage, isAddress, type Address } from "viem";
import { listSurvivors, listDispatches, insertSurvivor, survivorExists, deleteSurvivor, savePortrait } from "@/lib/enlist/db";
import { ownerOf, tierOf, writeSurvivor, paintPortrait } from "@/lib/enlist/generate";
import { ROLES, ORIGINS, SIGN_WINDOW_MS, cleanName, cleanLine, enlistMessage, rankOf } from "@/lib/enlist/profile";

// Enlist: GET is the public roster and recent dispatches. POST enlists one survivor for a shard the
// signer holds on Vitruveo: the writer drafts the backstory, then the portrait is painted and stored.

export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function GET() {
  try {
    const [survivors, dispatches] = await Promise.all([listSurvivors(), listDispatches(7)]);
    return NextResponse.json({ survivors, dispatches });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let claimed = 0;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const tokenId = Number(body.tokenId);
    const ts = Number(body.ts);
    const address = String(body.address ?? "") as Address;
    const form = {
      name: cleanName(body.name),
      role: String(body.role ?? ""),
      origin: String(body.origin ?? ""),
      before: cleanLine(body.before),
      look: cleanLine(body.look),
    };
    if (!Number.isInteger(tokenId) || tokenId < 1) return NextResponse.json({ error: "bad shard id" }, { status: 400 });
    if (form.name.length < 2) return NextResponse.json({ error: "name too short" }, { status: 400 });
    if (!ROLES.some((r) => r.name === form.role)) return NextResponse.json({ error: "pick a role" }, { status: 400 });
    if (!ORIGINS.some((o) => o.name === form.origin)) return NextResponse.json({ error: "pick an origin" }, { status: 400 });
    if (!isAddress(address)) return NextResponse.json({ error: "bad address" }, { status: 400 });
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > SIGN_WINDOW_MS) return NextResponse.json({ error: "signature expired, try again" }, { status: 400 });

    const ok = await verifyMessage({ address, message: enlistMessage(tokenId, form, ts), signature: body.signature as `0x${string}` }).catch(() => false);
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });
    const owner = await ownerOf(tokenId);
    if (!owner || owner.toLowerCase() !== address.toLowerCase()) return NextResponse.json({ error: "you do not hold this shard" }, { status: 403 });

    const existing = await survivorExists(tokenId);
    if (existing?.hasPortrait) return NextResponse.json({ error: "this shard already has a survivor" }, { status: 409 });
    if (existing) await deleteSurvivor(tokenId, true);

    const tier = await tierOf(tokenId);
    const draft = await writeSurvivor(tokenId, form, tier - 1);
    if (!draft.acceptable) return NextResponse.json({ error: "The Archive will not record that. Choose a different name or details." }, { status: 422 });

    const inserted = await insertSurvivor({
      tokenId, ...form, epithet: cleanLine(draft.epithet), gender: draft.gender, backstory: draft.backstory.trim(), visual: draft.visual.trim(),
      tier, rank: rankOf(tier - 1), sector: draft.sector, owner: owner.toLowerCase(),
    });
    if (!inserted) return NextResponse.json({ error: "this shard is already enlisting" }, { status: 409 });
    claimed = tokenId;

    const { portrait, thumb } = await paintPortrait(draft.visual, draft.gender, form.role, form.origin);
    await savePortrait(tokenId, portrait, thumb, false);
    claimed = 0;
    return NextResponse.json({ tokenId });
  } catch (e) {
    if (claimed) await deleteSurvivor(claimed).catch(() => {});
    console.error("enlist:", (e as Error).message);
    return NextResponse.json({ error: "The Archive could not finish this enlistment. Try again." }, { status: 500 });
  }
}
