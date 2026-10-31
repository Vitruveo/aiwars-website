import { sections, shardRows } from "@/lib/whitepaper";
import { TIERS, POWER, POWER_SLOTS, SCAPE, SCAPE_SLOTS, DUO, TRIO, MAX_PER_WALLET, TOTAL_SUPPLY } from "@/lib/shards";
import { FAQ } from "@/components/scape/ScapeFaq";

// Everything the mystery AI knows, rendered once as plain text. Whitepaper, shard design, the Scape,
// Genesis, AIWars Trends, the roadmap, and the site map. Kept deterministic so the gateway can cache it.

const tierLine = (i: number) => {
  const t = TIERS[i];
  const acts = Object.entries(t.acts).filter(([, v]) => v).map(([k]) => k).join(", ");
  return `Tier ${t.n} ${t.name}: ${t.supply} shards at $${t.price}, ${POWER_SLOTS[i]} power roll(s), ${SCAPE_SLOTS[i]} scape roll(s), activations: ${acts}.`;
};

const whitepaper = sections
  .map((s) => `## ${s.num} ${s.title}\n${s.paras.join("\n")}${s.quote ? `\nQuote: ${s.quote}` : ""}`)
  .join("\n\n");

const shards = [
  "## The Archive Shard (the NFT)",
  ...shardRows.map(([k, v]) => `${k}: ${v}`),
  `Total supply ${TOTAL_SUPPLY}. Max ${MAX_PER_WALLET} per wallet.`,
  ...TIERS.map((_, i) => tierLine(i)),
  "Power bonuses (value by tier 1..5): " + POWER.map((p) => `${p.name} (${p.what}; ${p.role}) ${p.pct.join("/")}%`).join("; "),
  "Scape assists (tier they enter the pool): " + SCAPE.map((s) => `${s.name} from T${s.from}: ${s.what}`).join(" | "),
  "Duo (two shards in one wallet, both carrying Duo, each of these doubles): " + DUO.map((d) => `${d.name}: ${d.what}`).join(" | "),
  "Trio (three shards in one wallet wake these; the only way in): " + TRIO.map((t) => `${t.name}: ${t.what}`).join(" | "),
].join("\n");

const scape = ["## The Scape", ...FAQ.map((f) => `${f.q} ${f.a}`)].join("\n");

const sale = `## Sale, Genesis, activations, chains
Payment for shards is USDT on BNB Smart Chain; the NFT itself is minted on Vitruveo (an upgradeable ERC-721, ids sequential from 1). Tiers sell strictly in order; a tier opens only when the one above sells out.
Genesis is the referral package: buy() takes 45,000 VTRU on BNB Chain and mints a transferable Claim token. The buyer's referral code is the first five hex characters of their address. A shard bought with a code pays 10% to the code's owner. Every 20 referred shards activates one Claim, which can be redeemed for a free shard at the live tier.
Shard Activations are what a shard does today, before the game ships. Beacon: a holder names one point in their sector on the Scape (signed message, free). Trends: AIWars Trends at /trends on this site, a five-minute prediction market on the AI Wars Battle Momentum feed, five outcome buckets (Crash, Bear, Flat, Bull, Moon), VTRU stakes from 100 to 1,000, settled on chain by the shard contract on Vitruveo. A losing stake is burned. A winner gets the stake back plus credits worth half of it; every 100 credits mint the winner a Tier 5 shard and are deducted, at most one shard per wallet in any 24 hours; a single win at 200 VTRU or more earns enough for a shard. You can play five times without holding a Tier 1 shard; after that a Tier 1 shard is required. Every play stakes VTRU; none are free. Bets close four minutes into each window. The leaderboard shows each player's VTRU spent, credits won, games played and won, Tier 1 shards held and Tier 5 shards won. Two more activations are unannounced.
Battle Momentum is a 0 to 100 composite published by the TrendPulse oracle every two seconds; each five-minute window is resolved by an ordinary least squares trend.`;

const roadmap = `## Roadmap (sprint-funded development)
AI Wars is built in fully funded three-week sprints. Sprint 1 ran 4 to 31 October 2026 at a fixed $25,000 and delivered Genesis, shard minting, Beacon activation and the Battle Momentum oracle feed; the AIWars Trends game is the fifth deliverable, ETA 26 October. Sprints 2 to 17 run from 1 November 2026 to 2 October 2027 in three-week blocks. Milestones: S3 Arena live and first playable (browser combat, one wave on Defense Platform 7, holders only); S5 closed alpha for holders; S7 Prologue launch; S9 a holder stands on their own sector; S11 first settlement anchored on chain; S13 Machine Parley, Trio live; S15 open beta; S17 Early Access launch. Each sprint is funded before it starts, from the NFT sale now and a token sale later; cost slots are Development, Marketing, Operations and Special. All estimates are approximate and change with strategy, market and partners.`;

const site = `## The site
aiwars pages: / (home), /nft (shards), /mint, /genesis, /trends, /scape, /whitepaper, /roadmap. Minting happens at /mint. The Scape at /scape flies any sector. The Trends game lives at /trends. AI Wars is a Vertical Foundation project.`;

export const LORE = [whitepaper, shards, scape, sale, roadmap, site].join("\n\n");
