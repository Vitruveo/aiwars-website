import { makeNoise2D, fbm, ridged, mulberry32, hashSeed, type Noise2D } from "@/lib/scape/noise";
import { cellAt } from "@/lib/scape/layout";
import { TIERS } from "@/lib/shards";
import { tierAtPosition, isLegacy } from "@/lib/scape/places";

// One sector of the Scape: a position on the spiral and the ground there. Everything here is a pure
// function of the position (and, for grandfathered shards, the token id), so the client, the server and
// the video renderer all agree.

export const SECTOR_SIZE = 400; // world units across
export const SEA = -6; // haze floor height

export type Biome = "meridian" | "ruins" | "highland" | "wastes" | "haze";

export type Palette = {
  low: string;
  mid: string;
  high: string;
  peak: string;
  vein: string;
  fog: string;
  sky: string;
  structure: string;
  structureGlow: string;
};

const PALETTES: Record<Biome, Palette> = {
  meridian: { low: "#060c1a", mid: "#0d1a33", high: "#1b2f55", peak: "#3a5a8f", vein: "#2d8cff", fog: "#060b14", sky: "#04070d", structure: "#0b1326", structureGlow: "#2d8cff" },
  ruins: { low: "#07090f", mid: "#121724", high: "#242c3f", peak: "#4a5368", vein: "#2d8cff", fog: "#070a12", sky: "#04070d", structure: "#161b28", structureGlow: "#f0954f" },
  highland: { low: "#050a12", mid: "#0f1b2b", high: "#2a3b55", peak: "#8fa0ba", vein: "#5aa6ff", fog: "#08101c", sky: "#04070d", structure: "#101827", structureGlow: "#2d8cff" },
  wastes: { low: "#0a0806", mid: "#1b140f", high: "#3a2a1e", peak: "#6b4a33", vein: "#f0954f", fog: "#0d0a08", sky: "#05040a", structure: "#1a1410", structureGlow: "#f0954f" },
  haze: { low: "#05070c", mid: "#0b0f18", high: "#161d2c", peak: "#2a3344", vein: "#8fa0ba", fog: "#0a0e16", sky: "#04070d", structure: "#0e1320", structureGlow: "#8fa0ba" },
};

const NAMES = [
  "ATLAS", "AEGIS", "CIPHER", "DELTA", "ECHO", "FULCRUM", "GHOST", "HELIX", "IRIS", "JAVELIN", "KESTREL", "LUMEN",
  "MIRAGE", "NOVA", "ONYX", "PYRE", "QUARK", "RIGEL", "SABLE", "TALON", "UMBRA", "VECTOR", "WARDEN", "XENON",
  "YONDER", "ZENITH", "ORACLE", "VESPER", "LATTICE", "SOLSTICE",
];
const FORMS: Record<Biome, string[]> = {
  meridian: ["DISTRICT", "TERRACE", "SPIRE", "QUARTER", "CONCOURSE"],
  ruins: ["RUIN", "BREACH", "HOLLOW", "WRECK", "FALL"],
  highland: ["RIDGE", "ASCENT", "CREST", "PASS", "SHELF"],
  wastes: ["REACH", "FLAT", "SCAR", "EXPANSE", "DRIFT"],
  haze: ["VEIL", "SHROUD", "MARGIN", "VERGE", "DUSK"],
};

export type Structure = {
  kind: "tower" | "slab" | "ring" | "pylon" | "wreck";
  x: number;
  z: number;
  h: number;
  w: number;
  rot: number;
  lean: number;
};

export type Sector = {
  position: number; // 1-5000, the sector number
  tokenId: number | null; // the shard placed here, if any
  tier: number; // tier of the band this position is in
  tierName: string;
  serial: number; // place within that tier's band
  cell: { x: number; y: number };
  biome: Biome;
  name: string;
  code: string;
  palette: Palette;
  seed: number;
  height: (x: number, z: number) => number;
  structures: Structure[];
  path: [number, number, number][];
  fogDensity: number;
  veins: number;
};

function biomeFor(tier: number, r: () => number): Biome {
  const roll = r();
  switch (tier) {
    case 1: return roll < 0.8 ? "meridian" : "ruins";
    case 2: return roll < 0.55 ? "ruins" : roll < 0.85 ? "meridian" : "highland";
    case 3: return roll < 0.6 ? "highland" : roll < 0.85 ? "ruins" : "wastes";
    case 4: return roll < 0.65 ? "wastes" : roll < 0.9 ? "highland" : "haze";
    default: return roll < 0.7 ? "haze" : "wastes";
  }
}

function makeHeight(biome: Biome, n: Noise2D, n2: Noise2D) {
  const s = 1 / SECTOR_SIZE;
  switch (biome) {
    case "meridian":
      return (x: number, z: number) => {
        const base = fbm(n, x * s * 1.2, z * s * 1.2, 4) * 10;
        const plateau = Math.tanh(fbm(n2, x * s * 0.6, z * s * 0.6, 3) * 3) * 8;
        return base + plateau + 4;
      };
    case "ruins":
      return (x: number, z: number) => {
        const base = fbm(n, x * s * 1.6, z * s * 1.6, 5) * 14;
        const craters = -Math.max(0, fbm(n2, x * s * 2.5, z * s * 2.5, 2)) * 18;
        return base + craters + 2;
      };
    case "highland":
      return (x: number, z: number) => {
        const r = ridged(n, x * s * 1.1, z * s * 1.1, 5) * 34;
        const roll = fbm(n2, x * s * 0.5, z * s * 0.5, 3) * 12;
        return r + roll + 6;
      };
    case "wastes":
      return (x: number, z: number) => {
        const dunes = Math.abs(fbm(n, x * s * 2.2, z * s * 0.9, 4)) * 9;
        const scar = -Math.pow(Math.max(0, 1 - Math.abs(fbm(n2, x * s * 0.8, z * s * 0.8, 2)) * 6), 2) * 16;
        return dunes + scar + 1;
      };
    default:
      return (x: number, z: number) => fbm(n, x * s * 0.9, z * s * 0.9, 4) * 7 + fbm(n2, x * s * 4, z * s * 4, 2) * 1.5 - 1;
  }
}

function makeStructures(biome: Biome, r: () => number, height: Sector["height"]): Structure[] {
  const out: Structure[] = [];
  const half = SECTOR_SIZE * 0.46;
  const counts: Record<Biome, number> = { meridian: 140, ruins: 70, highland: 26, wastes: 30, haze: 16 };
  const n = counts[biome];
  for (let i = 0; i < n; i++) {
    const x = (r() * 2 - 1) * half;
    const z = (r() * 2 - 1) * half;
    if (Math.hypot(x, z) < 26) continue; // keep the beacon clear
    const y = height(x, z);
    if (y < SEA) continue;
    const roll = r();
    let kind: Structure["kind"];
    let h: number;
    let w: number;
    if (biome === "meridian") {
      kind = roll < 0.75 ? "tower" : roll < 0.9 ? "slab" : "pylon";
      h = kind === "tower" ? 18 + r() * 60 : kind === "slab" ? 6 + r() * 10 : 40 + r() * 50;
      w = kind === "tower" ? 4 + r() * 6 : kind === "slab" ? 12 + r() * 20 : 1.5;
    } else if (biome === "ruins") {
      kind = roll < 0.5 ? "wreck" : roll < 0.8 ? "tower" : "ring";
      h = kind === "tower" ? 10 + r() * 35 : kind === "ring" ? 14 + r() * 14 : 5 + r() * 10;
      w = kind === "ring" ? h : 4 + r() * 8;
    } else if (biome === "highland") {
      kind = roll < 0.6 ? "pylon" : "ring";
      h = kind === "pylon" ? 30 + r() * 40 : 12 + r() * 10;
      w = kind === "pylon" ? 1.2 : h;
    } else if (biome === "wastes") {
      kind = roll < 0.6 ? "wreck" : roll < 0.85 ? "slab" : "ring";
      h = kind === "wreck" ? 6 + r() * 14 : kind === "slab" ? 3 + r() * 5 : 20 + r() * 20;
      w = kind === "ring" ? h : 6 + r() * 14;
    } else {
      kind = roll < 0.7 ? "pylon" : "ring";
      h = kind === "pylon" ? 50 + r() * 60 : 30 + r() * 30;
      w = kind === "pylon" ? 1 : h;
    }
    out.push({ kind, x, z, h, w, rot: r() * Math.PI, lean: kind === "wreck" ? (r() - 0.5) * 0.9 : (r() - 0.5) * 0.06 });
  }
  return out;
}

// Looping flight path: a wobbling ring around the beacon at varying altitude and radius.
function makePath(r: () => number, height: Sector["height"]): [number, number, number][] {
  const pts: [number, number, number][] = [];
  const n = 10;
  const phase = r() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    const rad = 90 + r() * 70;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    const ground = Math.max(height(x, z), SEA);
    pts.push([x, ground + 28 + r() * 30, z]);
  }
  return pts;
}

const cache = new Map<string, Sector>();

// The sector at `position`, holding `tokenId` if a shard is placed there. A grandfathered shard (minted
// before v5) keeps the ground it was first given: seeded by its token id, terrain of its original tier.
export function sectorFor(position: number, tokenId: number | null = null): Sector {
  const key = `${position}:${tokenId ?? 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const tier = tierAtPosition(position);
  const legacy = tokenId !== null && isLegacy(tokenId);
  const seed = legacy ? hashSeed(0x5ca9e, tokenId) : hashSeed(0x5ca9f, position);
  const r = mulberry32(seed);
  const biome = biomeFor(legacy ? tierAtPosition(tokenId) : tier, r);
  const n = makeNoise2D(hashSeed(seed, 1));
  const n2 = makeNoise2D(hashSeed(seed, 2));
  // Offset the sample so the beacon never sits on the noise origin, which is always flat or a crest.
  const ox = (r() - 0.5) * 4000;
  const oz = (r() - 0.5) * 4000;
  const raw = makeHeight(biome, n, n2);
  const height = (x: number, z: number) => raw(x + ox, z + oz);
  const structures = makeStructures(biome, r, height);
  const path = makePath(r, height);
  const name = `${NAMES[Math.floor(r() * NAMES.length)]} ${FORMS[biome][Math.floor(r() * FORMS[biome].length)]}`;
  const sector: Sector = {
    position,
    tokenId,
    tier,
    tierName: TIERS[tier - 1].name,
    serial: position - TIERS.slice(0, tier - 1).reduce((a, t) => a + t.supply, 0),
    cell: cellAt(position),
    biome,
    name,
    code: `SECTOR ${String(position).padStart(4, "0")}`,
    palette: PALETTES[biome],
    seed,
    height,
    structures,
    path,
    fogDensity: biome === "haze" ? 0.0065 : biome === "wastes" ? 0.004 : 0.0032,
    veins: biome === "meridian" ? 0.9 : biome === "highland" ? 0.5 : biome === "haze" ? 0.2 : 0.35,
  };
  cache.set(key, sector);
  return sector;
}

export const BIOME_LABEL: Record<Biome, string> = {
  meridian: "Meridian · inner ring",
  ruins: "Fallen districts",
  highland: "Highland approaches",
  wastes: "Outer wastes",
  haze: "The haze margin",
};
