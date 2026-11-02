import { POWER, POWER_SLOTS, TIERS } from "@/lib/shards";
import { mulberry32, hashSeed } from "@/lib/scape/noise";

// Enlist: one survivor per shard. Shared by the form, the signing client and the verifying routes.

// The seven identities from the whitepaper.
export const ROLES: { name: string; what: string }[] = [
  { name: "Guardian", what: "Protects settlements and people" },
  { name: "Ghost", what: "Operates inside machine-controlled systems" },
  { name: "Seeker", what: "Recovers lost history" },
  { name: "Maker", what: "Rebuilds and modifies technology" },
  { name: "Diplomat", what: "Deals with factions and machine intelligences" },
  { name: "Commander", what: "Coordinates operations at scale" },
  { name: "Augment", what: "Blurs the line between human and machine" },
];

export const ORIGINS: { name: string; what: string }[] = [
  { name: "Meridian native", what: "Born in the city before it fell" },
  { name: "Platform crew", what: "Served on the orbital defense platforms" },
  { name: "Wasteland scavenger", what: "Survived the margins on salvage" },
  { name: "Machine-zone escapee", what: "Got out of territory the machines hold" },
  { name: "Archive keeper", what: "Tended the Archive before it woke" },
];

export const NAME_MAX = 24;
export const LINE_MAX = 100;
export const PORTRAIT_REGENS = 3; // extra portraits after the first
export const SIGN_WINDOW_MS = 10 * 60 * 1000;

export const cleanName = (s: unknown) => String(s ?? "").replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
export const cleanLine = (s: unknown) => String(s ?? "").replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").trim().slice(0, LINE_MAX);

export type Gender = "woman" | "man";

// Broad ancestries, drawn evenly so the roster spans the world's people.
export const ANCESTRIES = [
  "West African", "East African", "Afro-Caribbean", "North African", "Middle Eastern", "South Asian", "East Asian",
  "Southeast Asian", "Central Asian", "Pacific Islander", "Indigenous American", "Latin American", "Northern European",
  "Southern European", "Eastern European",
];

// The survivor's default gender and ancestry, an even draw seeded by the shard id. The player's name or
// lines override it when they imply otherwise.
export function appearanceDraw(tokenId: number): { gender: Gender; ancestry: string } {
  const r = mulberry32(hashSeed(tokenId, 0x475245));
  return { gender: r() < 0.5 ? "woman" : "man", ancestry: ANCESTRIES[Math.floor(r() * ANCESTRIES.length)] };
}

export type EnlistForm = { name: string; role: string; origin: string; before: string; look: string };

export function enlistMessage(tokenId: number, f: EnlistForm, ts: number) {
  return [
    "AI Wars Enlist",
    `Survivor for shard ${tokenId}`,
    `Name: ${f.name}`,
    `Role: ${f.role}`,
    `Origin: ${f.origin}`,
    `Before the fall: ${f.before || "-"}`,
    `Look: ${f.look || "-"}`,
    `Time: ${ts}`,
  ].join("\n");
}

export function portraitMessage(tokenId: number, ts: number) {
  return `AI Wars Enlist\nNew portrait for shard ${tokenId}\nTime: ${ts}`;
}

// The shard's Power bonuses: POWER_SLOTS[tier] of the five, picked by the token id, value by tier.
export function powerRolls(tokenId: number, tierIndex: number) {
  const r = mulberry32(hashSeed(tokenId, 0x504f57));
  const pool = POWER.map((p, i) => ({ i, k: r() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, POWER_SLOTS[tierIndex])
    .map(({ i }) => i)
    .sort((a, b) => a - b);
  return pool.map((i) => ({ name: POWER[i].name, pct: POWER[i].pct[tierIndex] }));
}

export const rankOf = (tierIndex: number) => TIERS[tierIndex]?.name ?? "Survivor";

export type Survivor = {
  tokenId: number;
  name: string;
  role: string;
  origin: string;
  epithet: string;
  backstory: string;
  gender: Gender;
  tier: number; // 1..5
  rank: string;
  sector: string;
  owner: string;
  portraitV: number;
  regens: number;
  createdAt: string;
};

export type Dispatch = { day: string; title: string; body: string; momentum: string; featured: number[] };

export const portraitUrl = (tokenId: number, v: number, thumb = false) => `/api/enlist/portrait/${tokenId}?v=${v}${thumb ? "&size=thumb" : ""}`;
