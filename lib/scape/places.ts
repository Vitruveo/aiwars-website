import { TIERS } from "@/lib/shards";

// Where a shard sits in the Scape. Since v5 a token's tier is written at mint and every token has a serial
// within its tier; its sector is that tier's band of the spiral plus the serial. Tier 1 holds positions
// 1-125 beside the Archive, Tier 5 positions 2251-5000 at the margin. Token ids no longer decide anything.

export type Place = { tokenId: number; tier: number; serial: number };

// First position of each tier's band, minus one.
const BAND_START = TIERS.map((_, i) => TIERS.slice(0, i).reduce((a, t) => a + t.supply, 0));

export function positionOf(tier: number, serial: number) {
  return BAND_START[tier - 1] + serial;
}

// The tier whose band holds a position (1-based).
export function tierAtPosition(position: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) if (position > BAND_START[i]) return i + 1;
  return 1;
}

// Tokens 1-115 were minted before v5, when the position was the token id. They keep the terrain of the
// sector they first had (grandfathered), wherever they sit now.
export const LEGACY_MAX_ID = 115;
export const isLegacy = (tokenId: number) => tokenId >= 1 && tokenId <= LEGACY_MAX_ID;

// Lookups over the full placement list.
export function placeIndex(places: Place[]) {
  const byToken = new Map<number, Place & { position: number }>();
  const byPosition = new Map<number, number>();
  for (const p of places) {
    const position = positionOf(p.tier, p.serial);
    byToken.set(p.tokenId, { ...p, position });
    byPosition.set(position, p.tokenId);
  }
  return { byToken, byPosition };
}
