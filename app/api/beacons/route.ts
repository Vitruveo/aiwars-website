import { NextResponse } from "next/server";
import { createPublicClient, http, verifyMessage, type Address } from "viem";
import { vitruveo } from "@/lib/chains";
import { NFT_ADDRESS, NFT_ABI } from "@/lib/contracts";
import { sql, ensureSchema } from "@/lib/db";
import { SECTOR_SIZE } from "@/lib/scape/sector";
import { beaconMessage } from "@/lib/scape/beaconMessage";
import { wonTokenIds } from "@/lib/scape/won";

// Beacons: one named point per sector, set by whoever holds that shard on Vitruveo.
// Ownership is proven by a signed message and checked against ownerOf on chain.

export const dynamic = "force-dynamic";

const NAME_MAX = 24;
const WINDOW_MS = 10 * 60 * 1000;

export async function GET() {
  try {
    await ensureSchema();
    const [rows, won] = await Promise.all([
      sql()`SELECT token_id, name, x, z, owner FROM beacons ORDER BY token_id`,
      wonTokenIds().catch(() => [] as number[]), // sectors whose shard was won in AI Wars Trends
    ]);
    return NextResponse.json({ beacons: rows.map((r) => ({ tokenId: Number(r.token_id), name: r.name, x: Number(r.x), z: Number(r.z), owner: r.owner })), won });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { tokenId: number; name: string; x: number; z: number; ts: number; address: Address; signature: `0x${string}` };
    const tokenId = Number(body.tokenId);
    const name = String(body.name ?? "").trim().replace(/[^\x20-\x7e]/g, "").slice(0, NAME_MAX);
    const x = Number(body.x);
    const z = Number(body.z);
    const ts = Number(body.ts);
    if (!Number.isInteger(tokenId) || tokenId < 1) return NextResponse.json({ error: "bad token id" }, { status: 400 });
    if (name.length < 2) return NextResponse.json({ error: "name too short" }, { status: 400 });
    const half = SECTOR_SIZE / 2;
    if (![x, z].every((v) => Number.isFinite(v) && Math.abs(v) <= half)) return NextResponse.json({ error: "out of sector" }, { status: 400 });
    if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > WINDOW_MS) return NextResponse.json({ error: "stale signature" }, { status: 400 });
    if (!NFT_ADDRESS) return NextResponse.json({ error: "NFT not deployed" }, { status: 500 });

    const ok = await verifyMessage({ address: body.address, message: beaconMessage(tokenId, name, x, z, ts), signature: body.signature });
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });

    const client = createPublicClient({ chain: vitruveo, transport: http(process.env.VITRUVEO_RPC_URL || vitruveo.rpcUrls.default.http[0]) });
    const owner = (await client.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "ownerOf", args: [BigInt(tokenId)] })) as Address;
    if (owner.toLowerCase() !== body.address.toLowerCase()) return NextResponse.json({ error: "not the holder of this shard" }, { status: 403 });

    await ensureSchema();
    await sql()`INSERT INTO beacons (token_id, name, x, z, owner) VALUES (${tokenId}, ${name}, ${x}, ${z}, ${owner.toLowerCase()})
      ON CONFLICT (token_id) DO UPDATE SET name = EXCLUDED.name, x = EXCLUDED.x, z = EXCLUDED.z, owner = EXCLUDED.owner, updated_at = now()`;
    return NextResponse.json({ beacon: { tokenId, name, x, z, owner: owner.toLowerCase() } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
