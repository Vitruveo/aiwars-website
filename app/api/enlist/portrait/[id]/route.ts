import { NextResponse } from "next/server";
import { verifyMessage, isAddress, type Address } from "viem";
import { readPortrait, getSurvivor, savePortrait } from "@/lib/enlist/db";
import { ownerOf, paintPortrait } from "@/lib/enlist/generate";
import { PORTRAIT_REGENS, SIGN_WINDOW_MS, portraitMessage } from "@/lib/enlist/profile";

// GET serves a survivor's portrait (or its thumbnail with ?size=thumb). URLs carry ?v=<portrait version>,
// so a response never changes and can be cached for good. POST paints a new portrait for the holder,
// at most PORTRAIT_REGENS times per survivor.

export const maxDuration = 60;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokenId = Number(id);
  if (!Number.isInteger(tokenId) || tokenId < 1) return new NextResponse("bad id", { status: 400 });
  const thumb = new URL(req.url).searchParams.get("size") === "thumb";
  const img = await readPortrait(tokenId, thumb).catch(() => null);
  if (!img) return new NextResponse("not found", { status: 404 });
  return new NextResponse(new Uint8Array(img), {
    headers: { "content-type": "image/webp", "cache-control": "public, max-age=31536000, immutable" },
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tokenId = Number(id);
    const body = (await req.json()) as { ts: number; address: Address; signature: `0x${string}` };
    const ts = Number(body.ts);
    if (!Number.isInteger(tokenId) || tokenId < 1 || !isAddress(body.address)) return NextResponse.json({ error: "bad request" }, { status: 400 });
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > SIGN_WINDOW_MS) return NextResponse.json({ error: "signature expired, try again" }, { status: 400 });
    const ok = await verifyMessage({ address: body.address, message: portraitMessage(tokenId, ts), signature: body.signature }).catch(() => false);
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });
    const owner = await ownerOf(tokenId);
    if (!owner || owner.toLowerCase() !== body.address.toLowerCase()) return NextResponse.json({ error: "you do not hold this shard" }, { status: 403 });
    const s = await getSurvivor(tokenId);
    if (!s) return NextResponse.json({ error: "no survivor for this shard" }, { status: 404 });
    if (s.regens >= PORTRAIT_REGENS) return NextResponse.json({ error: "no new portraits left" }, { status: 409 });

    const { portrait, thumb } = await paintPortrait(s.visual, s.role, s.origin);
    await savePortrait(tokenId, portrait, thumb, true);
    return NextResponse.json({ tokenId, portraitV: s.portraitV + 1, regens: s.regens + 1 });
  } catch (e) {
    console.error("enlist portrait:", (e as Error).message);
    return NextResponse.json({ error: "The portrait could not be painted. Try again." }, { status: 500 });
  }
}
