import { createPublicClient, http } from "viem";
import { vitruveo } from "@/lib/chains";
import { NFT_ADDRESS, NFT_ABI } from "@/lib/contracts";
import { sql } from "@/lib/db";
import { positionOf, type Place } from "@/lib/scape/places";
import { sectorFor } from "@/lib/scape/sector";

// Every minted token's tier and serial, read from the contract (placeOf). A placement never changes once
// written, so placed tokens are kept in Neon and only new ids are read from chain. Memoized for 30 seconds.

const chain = createPublicClient({ chain: vitruveo, transport: http(process.env.VITRUVEO_RPC_URL || vitruveo.rpcUrls.default.http[0]) });

let ready: Promise<void> | null = null;
function ensurePlaces() {
  if (!ready) {
    ready = sql()`CREATE TABLE IF NOT EXISTS token_places (
      token_id integer PRIMARY KEY,
      tier integer NOT NULL,
      serial integer NOT NULL
    )`.then(() => undefined).catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

async function readChunked<T>(ids: number[], read: (id: number) => Promise<T>, size = 25): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += size) out.push(...(await Promise.all(ids.slice(i, i + size).map(read))));
  return out;
}

// Before the v5 upgrade there is no placeOf: tiers come from tierOf and serials from id order within a tier,
// which is what the one-time placement writes. Never cached.
async function legacyPlaces(total: number): Promise<Place[]> {
  const ids = Array.from({ length: total }, (_, i) => i + 1);
  const tiers = await readChunked(ids, (id) => chain.readContract({ address: NFT_ADDRESS!, abi: NFT_ABI, functionName: "tierOf", args: [BigInt(id)] }) as Promise<number>);
  const count = [0, 0, 0, 0, 0];
  return ids.map((tokenId, i) => {
    const tier = Number(tiers[i]) || 5;
    return { tokenId, tier, serial: ++count[tier - 1] };
  });
}

let memo: { places: Place[]; at: number } | null = null;

export async function getPlaces(): Promise<Place[]> {
  if (!NFT_ADDRESS) return [];
  if (memo && Date.now() - memo.at < 30_000) return memo.places;
  await ensurePlaces();
  const total = Number((await chain.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "totalMinted" })) as bigint);
  const rows = (await sql()`SELECT token_id, tier, serial FROM token_places`) as { token_id: number; tier: number; serial: number }[];
  const known = new Map(rows.map((r) => [Number(r.token_id), { tokenId: Number(r.token_id), tier: Number(r.tier), serial: Number(r.serial) }]));
  const missing = Array.from({ length: total }, (_, i) => i + 1).filter((id) => !known.has(id));
  if (missing.length) {
    let fresh: Place[];
    try {
      const read = await readChunked(missing, (id) => chain.readContract({ address: NFT_ADDRESS!, abi: NFT_ABI, functionName: "placeOf", args: [BigInt(id)] }) as Promise<readonly [number, bigint]>);
      fresh = missing.map((tokenId, i) => ({ tokenId, tier: Number(read[i][0]), serial: Number(read[i][1]) })).filter((p) => p.serial > 0);
    } catch {
      const places = await legacyPlaces(total); // contract still v4
      memo = { places, at: Date.now() };
      return places;
    }
    for (const p of fresh) {
      await sql()`INSERT INTO token_places (token_id, tier, serial) VALUES (${p.tokenId}, ${p.tier}, ${p.serial}) ON CONFLICT (token_id) DO NOTHING`;
      known.set(p.tokenId, p);
    }
  }
  const places = [...known.values()].sort((a, b) => a.tokenId - b.tokenId);
  memo = { places, at: Date.now() };
  return places;
}

export async function placeOfToken(tokenId: number): Promise<Place | null> {
  return (await getPlaces()).find((p) => p.tokenId === tokenId) ?? null;
}

// A token's sector: its position and the "NAME, sector 0000" label used on cards and in prompts.
export async function homeSector(tokenId: number) {
  const p = await placeOfToken(tokenId);
  if (!p) return null;
  const position = positionOf(p.tier, p.serial);
  const sector = sectorFor(position, tokenId);
  return { position, sector, label: `${sector.name}, sector ${String(position).padStart(4, "0")}` };
}
