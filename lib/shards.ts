// Archive Shard: one NFT type, five tiers, four activations.
// Tier index 0 = Tier 01 (strongest). Every array below is ordered 01..05.

export type Acts = { power: boolean; scape: boolean; duo: boolean; trio: boolean };

export type Tier = {
  n: number;
  name: string;
  supply: number;
  price: number;
  acts: Acts;
};

export const TIERS: Tier[] = [
  { n: 1, name: "Archivist", supply: 100, price: 100, acts: { power: true, scape: true, duo: true, trio: true } },
  { n: 2, name: "Vanguard", supply: 200, price: 100, acts: { power: true, scape: true, duo: true, trio: true } },
  { n: 3, name: "Defender", supply: 500, price: 100, acts: { power: true, scape: true, duo: true, trio: true } },
  { n: 4, name: "Citizen", supply: 1000, price: 100, acts: { power: true, scape: true, duo: true, trio: true } },
  { n: 5, name: "Survivor", supply: 2200, price: 50, acts: { power: true, scape: false, duo: false, trio: true } },
];

// POWER — percentage bonuses. Each shard rolls POWER_SLOTS[tier] of these five at mint;
// which ones is random, the value is fixed by tier.
export const POWER: { name: string; what: string; role: string; pct: number[] }[] = [
  { name: "Armor", what: "Damage resistance from machine weapons", role: "Guardian", pct: [20, 16, 12, 8, 4] },
  { name: "Recovery", what: "Revive and heal speed for you and anyone you revive", role: "Guardian", pct: [50, 40, 30, 20, 10] },
  { name: "Salvage", what: "Resource and artifact yield from ruins, wrecks and drops", role: "Seeker · Maker", pct: [30, 24, 18, 12, 6] },
  { name: "Standing", what: "Rate at which faction and machine-intelligence reputation accrues", role: "Diplomat", pct: [25, 20, 15, 10, 5] },
  { name: "Production", what: "Output of every settlement you hold a stake in", role: "Maker · Commander", pct: [20, 16, 12, 8, 4] },
];
export const POWER_SLOTS = [3, 2, 2, 1, 1];

// SCAPE — assistive features in terrain. Not new terrain: a better way through the terrain
// everyone already has. Instead of a staircase, you get an escalator.
// Each feature enters the pool at a tier (`from`) and stays for every stronger tier.
// A shard rolls SCAPE_SLOTS[tier] features from its pool at mint.
export const SCAPE: { name: string; what: string; from: number }[] = [
  { name: "Archive Passage", what: "Sealed corridors inside the Archive open as you approach. Everyone else goes the long way.", from: 1 },
  { name: "Orbital Drop", what: "Deploy from orbit straight onto any point you have marked on the surface. No transit, no approach.", from: 1 },
  { name: "Ruin Pathing", what: "Machine-built geometry becomes walkable: doors part, floors hold, gaps bridge.", from: 2 },
  { name: "Zone Link", what: "Comms, map and HUD keep working inside dead zones where machines jam everything.", from: 2 },
  { name: "Grapple Line", what: "Ascend tower faces and platform edges directly. Instead of a staircase, an escalator.", from: 3 },
  { name: "Transit Key", what: "Ride Meridian's suspended transport lines even where the network is dead.", from: 3 },
  { name: "Drop Rig", what: "Step off any height and land unharmed. Descend a kilometer tower in seconds.", from: 4 },
  { name: "Haze Sight", what: "See clearly through atmospheric haze, smoke and dust. No visibility penalty, ever.", from: 4 },
];
export const SCAPE_SLOTS = [3, 2, 1, 1, 0];

// DUO — hold two shards and each of these doubles. Both shards must carry Duo.
export const DUO: { name: string; what: string }[] = [
  { name: "Squad size", what: "Autonomous Actors you can lead at once. Three becomes six." },
  { name: "Inventory", what: "Slots for weapons, armor, salvage and artifacts." },
  { name: "Build queue", what: "Structures a settlement you hold can build at the same time." },
  { name: "Vehicle bays", what: "Vehicles you can keep fueled and ready." },
  { name: "Expedition window", what: "Time you can stay in machine ruins before extraction." },
];

// TRIO — dormant in every shard. Three in one wallet wake them. The only way in.
export const TRIO: { name: string; what: string }[] = [
  { name: "Faction Command", what: "Plan and lead faction-scale operations: multiple squads, multiple objectives, territory on the line." },
  { name: "Augment Path", what: "Begin the augmentation branch. Blur the line between human and machine. Irreversible." },
  { name: "Canon Author", what: "Write one entry into the canonical history on Vitruveo: name a first discovery, a founding, a fall." },
  { name: "Machine Parley", what: "Open negotiations with a machine intelligence on behalf of a faction." },
];

export const TOTAL_SUPPLY = TIERS.reduce((a, t) => a + t.supply, 0); // 4000
export const MAX_RAISE = TIERS.reduce((a, t) => a + t.supply * t.price, 0); // 290000
export const MAX_PER_WALLET = 3;

// Minted per tier. Replaced by contract reads when the sale opens.
export const MINTED = [0, 0, 0, 0, 0];

export function liveTierIndex() {
  const i = TIERS.findIndex((t, i) => MINTED[i] < t.supply);
  return i === -1 ? TIERS.length - 1 : i;
}

export function actsCount(t: Tier) {
  return Object.values(t.acts).filter(Boolean).length;
}

export function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
