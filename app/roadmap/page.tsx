import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Shard from "@/components/Shard";
import world from "@/public/art/world.jpg";
import beyond from "@/public/art/beyond.jpg";

// Sprint-funded development: the model, the sprint plan with approximate costs, and the
// twelve-month cost basis. Single source for the roadmap and cost plan.

export const metadata: Metadata = {
  title: "Roadmap — AI Wars",
  description: "AI Wars is built in fully funded three-week sprints. The model, the sprint plan and approximate costs.",
  robots: { index: false, follow: false },
};

type Sprint = { n: string; title: string; dates: string; scope: string; gate: string; total: number; d: number; m: number; o: number; s: number };

const s1Deliverables: [string, string, boolean][] = [
  ["Genesis", "The Genesis package on BNB Smart Chain: 45,000 VTRU buys a transferable Claim, a referral code pays 10% on every referred shard, and the Claim activates at 20 referred shards for a free live-tier shard on Vitruveo.", true],
  ["Shard minting", "Archive Shard sale live: five tiers sold strictly in order, three per wallet, paid in USDT on BNB Smart Chain and minted as an upgradeable ERC-721 on Vitruveo, with metadata served from the site.", true],
  ["Beacon activation", "The Scape: 5,000 procedurally generated sectors around the Archive, one per shard, with a browser flyover of every sector and a holder-signed beacon that names a place and lights the sector on the world map.", true],
  ["Battle Momentum oracle feed", "The TrendPulse oracle publishes AI Wars Battle Momentum, a 0 to 100 composite read every two seconds, with history, live websocket ticks and a public status page, and resolves five-minute windows by ordinary least squares trend.", true],
  ["AIWars Trends game", "The first shard activation on pretrend.ai: a new five-minute market on every five-minute mark, five outcome buckets calibrated from the feed, VTRU stakes settled by the shard contract on Vitruveo (losing stakes burned, winners earn credits toward Tier 5 shards), and a live on-chain leaderboard. You can play five times without holding a Tier 1 shard.", true],
  ["Enlist activation", "Every shard enlists one survivor into the Fall of Meridian: the holder names them and picks a role and origin, the Archive writes their backstory and paints their portrait, and a daily Field Dispatch written from the Battle Momentum feed names survivors from the roster. The survivor stays with the shard and carries into the game.", true],
];

const sprints: Sprint[] = [
  {
    "n": "S2",
    "title": "Arena foundations",
    "dates": "9 Nov 2026 to 29 Nov 2026",
    "scope": "Roster of the 30 agents and the match scheduler. Authoritative match server. Telemetry pipeline from matches to the Pretrend oracle. Activation, Agent Draft: each shard drafts a squad of three agents and scores on their match results, with a holder leaderboard.",
    "gate": "",
    "total": 84000,
    "d": 61,
    "m": 6,
    "o": 11,
    "s": 6
  },
  {
    "n": "S3",
    "title": "Arena live",
    "dates": "30 Nov 2026 to 20 Dec 2026",
    "scope": "Standings and replays on the site. Agent wins drive $AIWARS emissions. First browser combat build: one wave on Defense Platform 7, holders only. Activation, Arena Calls: a pretrend.ai market on every match, settled by the shard contract like Trends. Activation, Arena dispatch: enlisted survivors are written into the daily match reports.",
    "gate": "Arena live. First playable.",
    "total": 94000,
    "d": 66,
    "m": 11,
    "o": 11,
    "s": 6
  },
  {
    "n": "S4",
    "title": "Platform 7 ground",
    "dates": "21 Dec 2026 to 10 Jan 2027",
    "scope": "Defense Platform 7 environment at final quality. Three machine unit families. Netcode for sessions of 1 to 4 humans on authoritative servers.",
    "gate": "",
    "total": 121000,
    "d": 88,
    "m": 6,
    "o": 16,
    "s": 11
  },
  {
    "n": "S5",
    "title": "Platform 7 minds",
    "dates": "11 Jan 2027 to 31 Jan 2027",
    "scope": "Squad Actors with memory. NEMESIS-7 as a system: comms failure, sky assembly, synchronized machines. Closed alpha for holders.",
    "gate": "Closed alpha for holders.",
    "total": 127000,
    "d": 94,
    "m": 11,
    "o": 16,
    "s": 6
  },
  {
    "n": "S6",
    "title": "Prologue, beats 1 to 4",
    "dates": "1 Feb 2027 to 21 Feb 2027",
    "scope": "The Fall of Meridian, beats one to four playable from a link. Shard perks in the HUD. NEMESIS-7 casting and recording begins.",
    "gate": "",
    "total": 137000,
    "d": 99,
    "m": 11,
    "o": 16,
    "s": 11
  },
  {
    "n": "S7",
    "title": "Prologue launch",
    "dates": "22 Feb 2027 to 14 Mar 2027",
    "scope": "Beats five to seven. NEMESIS-7 voiced. Six languages. Trailer one captured from the browser build. First canon entries written to Vitruveo.",
    "gate": "Prologue launch.",
    "total": 154000,
    "d": 94,
    "m": 33,
    "o": 16,
    "s": 11
  },
  {
    "n": "S8",
    "title": "World server",
    "dates": "15 Mar 2027 to 4 Apr 2027",
    "scope": "Persistent world server running with no one online. Scape sector terrain becomes playable ground, a holder's beacon as spawn mark.",
    "gate": "",
    "total": 133000,
    "d": 94,
    "m": 6,
    "o": 22,
    "s": 11
  },
  {
    "n": "S9",
    "title": "Sector weekends",
    "dates": "5 Apr 2027 to 25 Apr 2027",
    "scope": "Holder sector weekends with state that carries over between sessions. Sector performance pass for phones and tablets deferred to S17.",
    "gate": "A holder stands on their own sector.",
    "total": 126000,
    "d": 88,
    "m": 11,
    "o": 16,
    "s": 11
  },
  {
    "n": "S10",
    "title": "Settlements loop",
    "dates": "26 Apr 2027 to 16 May 2027",
    "scope": "Build, produce, defend. Persistent state for every holder. Production chains and defenses that survive logout.",
    "gate": "",
    "total": 144000,
    "d": 105,
    "m": 6,
    "o": 22,
    "s": 11
  },
  {
    "n": "S11",
    "title": "Settlements anchored",
    "dates": "17 May 2027 to 6 Jun 2027",
    "scope": "Duo squads. Second machine intelligence revealed. First settlement founded and anchored on chain.",
    "gate": "First settlement anchored on chain.",
    "total": 143000,
    "d": 99,
    "m": 11,
    "o": 22,
    "s": 11
  },
  {
    "n": "S12",
    "title": "Factions",
    "dates": "7 Jun 2027 to 27 Jun 2027",
    "scope": "Factions, territory and Faction Command. Arena battles become sector battles.",
    "gate": "",
    "total": 144000,
    "d": 105,
    "m": 6,
    "o": 22,
    "s": 11
  },
  {
    "n": "S13",
    "title": "Machine Parley",
    "dates": "28 Jun 2027 to 18 Jul 2027",
    "scope": "Machine Parley. Trio activations live. First Chapter 2 missions for 1 to 4 players.",
    "gate": "Trio live.",
    "total": 149000,
    "d": 105,
    "m": 11,
    "o": 22,
    "s": 11
  },
  {
    "n": "S14",
    "title": "Chapter 2 missions",
    "dates": "19 Jul 2027 to 8 Aug 2027",
    "scope": "Remaining Chapter 2 missions: the machines are not unified. Machine ruins and corrupted archive fragments.",
    "gate": "",
    "total": 149000,
    "d": 105,
    "m": 6,
    "o": 22,
    "s": 16
  },
  {
    "n": "S15",
    "title": "Open beta",
    "dates": "9 Aug 2027 to 29 Aug 2027",
    "scope": "Open beta of the persistent world. Trailer two. Load and abuse testing at beta scale.",
    "gate": "Open beta.",
    "total": 155000,
    "d": 94,
    "m": 33,
    "o": 22,
    "s": 6
  },
  {
    "n": "S16",
    "title": "Live world events",
    "dates": "30 Aug 2027 to 19 Sep 2027",
    "scope": "Live world event system: the first city outside Meridian falls or holds on player and Actor action.",
    "gate": "",
    "total": 143000,
    "d": 99,
    "m": 6,
    "o": 22,
    "s": 16
  },
  {
    "n": "S17",
    "title": "Early Access",
    "dates": "20 Sep 2027 to 10 Oct 2027",
    "scope": "Phone and tablet browser pass. Early Access launch with Chapter 2 and the persistent sector world.",
    "gate": "Early Access launch.",
    "total": 160000,
    "d": 94,
    "m": 38,
    "o": 22,
    "s": 6
  }
];

const planTotal = 2163000;
const planSlots = [1490, 212, 300, 161];

const categories: [string, string, string, string, string][] = [
  [
    "Studio leadership",
    "Game direction, technical direction, art direction, production",
    "297,000",
    "330,000",
    "363,000"
  ],
  [
    "Engineering",
    "Web 3D gameplay, netcode and servers, AI systems and Actors",
    "495,000",
    "550,000",
    "605,000"
  ],
  [
    "Art and animation",
    "Stylized 3D environments and units, animation, VFX, UI",
    "238,000",
    "264,000",
    "290,000"
  ],
  [
    "Narrative, audio and voice",
    "Script, score, sound design, casting and recording",
    "89,000",
    "99,000",
    "109,000"
  ],
  [
    "QA and community",
    "Test, holder alphas and betas, Discord and events",
    "79,000",
    "88,000",
    "97,000"
  ],
  [
    "Technology and infrastructure",
    "Game servers, real-time state, CDN, AI inference, tooling",
    "148,000",
    "165,000",
    "182,000"
  ],
  [
    "Outsourced art and localization",
    "Concept art, asset packs, six languages",
    "59,000",
    "66,000",
    "73,000"
  ],
  [
    "Blockchain and compliance",
    "Contract development, independent audits, legal, KYC, chain operations",
    "178,000",
    "198,000",
    "218,000"
  ],
  [
    "Marketing",
    "Trailers, creator program, PR, events",
    "148,000",
    "165,000",
    "182,000"
  ],
  [
    "Operations",
    "Accounting, insurance, administration",
    "30,000",
    "33,000",
    "36,000"
  ],
  [
    "Contingency",
    "15 percent reserve",
    "264,000",
    "294,000",
    "323,000"
  ]
];
const categoryTotal = ["2,025,000", "2,252,000", "2,478,000"];

const escrow: [string, string, string][] = [
  ["Fully funded by sprint end", "20% of escrowed coins released as the deferral bonus.", "Agreed compensation paid."],
  ["Not fully funded at sprint end", "20% of escrowed coins released.", "Unpaid balance remains due. Work stops."],
  ["Still not funded three weeks later", "Remaining 80% released (100% total).", "Unpaid balance remains due. Round stays open."],
  ["Funding arrives later", "Team keeps every coin already released. No clawback.", "All remaining agreed compensation paid."],
];

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
// Coins are allocated at a fixed accounting price, whatever the market price: escrow = sprint cost / price.
// $0.50 per coin through S8, $1.00 from S9 on.
const coinPrice = (sprint: number) => (sprint <= 8 ? 0.5 : 1);
const RELEASE_AT_END = 0.2;
const coins = (cost: number, sprint: number) => Math.round(cost / coinPrice(sprint));
const sprintNo = (n: string) => parseInt(n.slice(1), 10);
const num = (n: number) => n.toLocaleString("en-US");
const S1_COST = 25000;
const planCoins = sprints.reduce((sum, sp) => sum + coins(sp.total, sprintNo(sp.n)), 0);

function Kicker({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <p className="kicker mb-4">
      <span className="kicker-num">{num}</span>
      {children}
    </p>
  );
}

function Disclaimer() {
  return (
    <div className="mt-8 border border-ember border-l-4 bg-ember/10 px-6 py-5 text-lg text-ink">
      <span className="mr-3 font-mono text-sm uppercase tracking-[0.2em] text-ember">Disclaimer</span>
      All estimates are approximate and based on current plans. Plans change based on many factors such as strategy, market and
      development partners. Estimates are for general guidance; sprint-specific estimates, published closer to each sprint, will be
      closer to real costs.
    </div>
  );
}

const OK = "#4fd08a";

// Nine phases: Foundations (S1) then eight two-sprint releases.
const phaseNames = ["Foundations", "Arena", "Platform 7", "Prologue", "Sectors", "Settlements", "Factions", "Chapter 2", "Early Access"];
type Phase = { name: string; sprints: number[]; dates: string; gate: string; cost: number; scope: string[] };
const phases: Phase[] = phaseNames.map((name, i) => {
  if (i === 0) return { name, sprints: [1], dates: "4 Oct to 31 Oct 2026", gate: "Shards, Scape, Trends and Enlist live.", cost: S1_COST, scope: s1Deliverables.map(([k]) => k) };
  const pair = sprints.slice((i - 1) * 2, i * 2);
  return {
    name,
    sprints: pair.map((sp) => sprintNo(sp.n)),
    dates: `${pair[0].dates.split(" to ")[0]} to ${pair[1].dates.split(" to ")[1]}`,
    gate: pair[1].gate,
    cost: pair.reduce((t, sp) => t + sp.total, 0),
    scope: pair.map((sp) => sp.title),
  };
});

// Status as of launch of this page: S1 in progress, S2 next.
const statusOf = (n: number): "done" | "now" | "next" | "later" => (n < 1 ? "done" : n === 1 ? "now" : n === 2 ? "next" : "later");
const monthOf = (dates: string) => dates.split(" to ")[0].split(" ").slice(1).join(" ");

function Node({ n }: { n: number }) {
  const st = statusOf(n);
  const base = "flex h-7 w-7 items-center justify-center rounded-full border-2 font-mono text-xs";
  if (st === "done") return <span className={`${base} border-[#4fd08a] bg-[#4fd08a] text-abyss`}>&#10003;</span>;
  if (st === "now") return <span className={`${base} border-ember bg-ember/20 text-ember shadow-[0_0_18px_rgba(240,149,79,0.6)]`}>{n}</span>;
  if (st === "next") return <span className={`${base} border-signal bg-signal/20 text-signal shadow-[0_0_18px_rgba(45,140,255,0.5)]`}>{n}</span>;
  return <span className={`${base} border-hairline bg-void text-faint`}>{n}</span>;
}

const th = "px-4 py-3 text-left font-mono text-sm uppercase tracking-[0.2em] text-faint border-b border-signal";
const td = "px-4 py-4 align-top text-lg text-dim border-b border-hairline";

export default function RoadmapPage() {
  const all = [{ n: 1, dates: "4 Oct to 31 Oct 2026", gate: "" }, ...sprints.map((sp) => ({ n: sprintNo(sp.n), dates: sp.dates, gate: sp.gate }))];
  return (
    <main className="min-h-svh">
      <Nav />

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <Image src={world} alt="" fill priority placeholder="blur" quality={95} className="bg-drift object-cover object-center" sizes="100vw" />
          <div className="absolute inset-0 bg-[#0b5cff]/30 mix-blend-color" />
          <div className="absolute inset-0 bg-abyss/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/20 to-abyss" />
          <div className="absolute inset-0 bg-gradient-to-r from-abyss/85 via-abyss/40 to-abyss/10" />
          <div className="starfield" />
          <div className="scanline" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8">
          <p className="kicker kicker-ink mb-3">
            <span className="kicker-num">00</span>AI Wars · October 2026
          </p>
          <h1 className="display glitch text-5xl text-ink sm:text-7xl">Roadmap</h1>
          <p className="mt-4 font-mono text-base uppercase tracking-[0.35em] text-ember">Sprint-funded development</p>
          <div className="rule my-8 max-w-xl" />
          <p className="max-w-2xl text-xl text-ink drop-shadow-[0_2px_10px_rgba(4,7,13,0.9)]">
            Seventeen three-week sprints from the shard sale to Early Access. Every sprint is demonstrated at its end, paid for before it
            ships, and accounted for in public.
          </p>
          <p className="mt-4 max-w-2xl text-lg text-dim drop-shadow-[0_2px_10px_rgba(4,7,13,0.9)]">
            All dates shift by as many days as funding is delayed.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["17", "sprints"],
              ["3 wk", "each"],
              ["9", "releases"],
              ["10 Oct 2027", "Early Access"],
            ].map(([v, l]) => (
              <div key={l} className="panel panel-glow sweep px-5 py-4">
                <div className="display text-2xl text-ink sm:text-3xl">{v}</div>
                <div className="mt-1 font-mono text-sm uppercase tracking-[0.25em] text-faint">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* timeline */}
      <section className="border-y border-hairline bg-void/60">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <Reveal>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="display text-3xl text-ink">The next twelve months</h2>
            <div className="flex flex-wrap gap-5 font-mono text-sm uppercase tracking-[0.2em] text-faint">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-ember" />Now</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-signal" />Next</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: OK }} />Milestone</span>
            </div>
          </div>
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1180px]">
              {/* phase bands */}
              <div className="grid gap-x-1" style={{ gridTemplateColumns: "repeat(17, minmax(0, 1fr))" }}>
                {phases.map((ph, i) => (
                  <div
                    key={ph.name}
                    style={{ gridColumn: `${ph.sprints[0]} / span ${ph.sprints.length}` }}
                    className={`border-t-2 px-2 pt-2 ${i === 0 ? "border-ember" : "border-signal/70"}`}
                  >
                    <p className={`font-mono text-xs uppercase leading-tight tracking-[0.2em] ${i === 0 ? "text-ember" : "text-signal"}`}>{ph.sprints.length === 1 ? "Start" : ph.name}</p>
                    <p className="mt-1 whitespace-nowrap text-sm text-faint">{usd(ph.cost)}</p>
                  </div>
                ))}
              </div>
              {/* milestone flags */}
              <div className="mt-6 grid h-24 items-end gap-x-1" style={{ gridTemplateColumns: "repeat(17, minmax(0, 1fr))" }}>
                {all.map((sp) =>
                  sp.gate ? (
                    <div key={sp.n} className="relative px-1 pb-3 text-center">
                      <p className="text-balance text-sm leading-tight" style={{ color: OK }}>{sp.gate.replace(/\.$/, "")}</p>
                      <span className="absolute bottom-0 left-1/2 h-3 w-px" style={{ background: OK }} />
                    </div>
                  ) : (
                    <div key={sp.n} />
                  )
                )}
              </div>
              {/* rail */}
              <div className="relative grid gap-x-1" style={{ gridTemplateColumns: "repeat(17, minmax(0, 1fr))" }}>
                <div className="absolute inset-x-0 top-[14px] h-px bg-hairline" />
                <div className="absolute left-0 top-[14px] h-px bg-ember" style={{ width: `${(0.5 / 17) * 100}%` }} />
                {all.map((sp, i) => (
                  <div key={sp.n} className="relative flex flex-col items-center">
                    {sp.gate ? (
                      <span className="relative -mt-2 flex h-11 items-center">
                        <span className="absolute inset-0 rounded-full bg-signal/20 blur-md" />
                        <Shard tier={Math.min(5, Math.max(1, Math.ceil(i / 4)))} size={26} float className="relative" />
                      </span>
                    ) : (
                      <Node n={sp.n} />
                    )}
                    <span className="mt-3 font-mono text-sm text-ink">S{sp.n}</span>
                    <span className="mt-1 whitespace-nowrap font-mono text-xs uppercase tracking-[0.1em] text-faint">{monthOf(sp.dates)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* phases */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Kicker num="01">Releases</Kicker>
        <h2 className="display text-4xl text-ink">Nine releases, two sprints each</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {phases.map((ph, i) => {
            const now = ph.sprints.includes(1);
            return (
              <Reveal key={ph.name} delay={(i % 3) * 80}>
              <div className={`panel panel-glow sweep relative flex h-full flex-col p-6 ${now ? "border-ember" : ""}`}>
                <div className="pointer-events-none absolute right-5 top-5 opacity-80">
                  <Shard tier={Math.min(5, Math.max(1, Math.ceil(i / 2)))} size={34} float />
                </div>
                <div className="flex items-baseline justify-between gap-3 pr-12">
                  <p className={`font-mono text-sm uppercase tracking-[0.3em] ${now ? "text-ember" : "text-signal"}`}>
                    {String(i).padStart(2, "0")} · S{ph.sprints[0]}{ph.sprints.length > 1 ? `–S${ph.sprints[1]}` : ""}
                  </p>
                  {now && <span className="border border-ember px-2 py-0.5 font-mono text-xs uppercase tracking-[0.2em] text-ember">ETA 26 Oct</span>}
                  {ph.sprints[0] === 2 && <span className="border border-signal px-2 py-0.5 font-mono text-xs uppercase tracking-[0.2em] text-signal">Next</span>}
                </div>
                <h3 className="display mt-3 text-2xl text-ink">{ph.name}</h3>
                <p className="mt-1 font-mono text-sm uppercase tracking-[0.15em] text-faint">{ph.dates}</p>
                <ul className="mt-4 space-y-1 text-lg text-dim">
                  {ph.scope.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="text-faint">·</span>
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-base" style={{ color: OK }}>{ph.gate}</p>
                <div className="mt-auto flex items-baseline justify-between border-t border-hairline pt-4">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-faint">approx. cost</span>
                  <span className="font-mono text-lg text-ink">{usd(ph.cost)}</span>
                </div>
              </div>
              </Reveal>
            );
          })}
        </div>
        <Disclaimer />
      </section>

      {/* how it is funded */}
      <section className="relative border-t border-hairline">
        <div className="absolute inset-0 overflow-hidden">
          <Image src={beyond} alt="" fill placeholder="blur" quality={95} className="bg-drift object-cover object-bottom" sizes="100vw" />
          <div className="absolute inset-0 bg-abyss/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <Kicker num="02">The model</Kicker>
          <h2 className="display text-4xl text-ink">Build first. Show the work. Pay before release.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Plan and open", "Before kickoff the sprint publishes its scope, acceptance criteria, timeline and cost in four slots: Development, Marketing, Operations, Special. It names its funding source and target."],
              ["02", "Build and demonstrate", "Three weeks of work, then the deliverables are shown. Actual costs are published by slot against the estimate."],
              ["03", "Fund, then release", "Completed work ships only once the sprint is fully paid. Excess rolls into the next sprint. An unfunded sprint stops the clock until its round closes."],
            ].map(([n, t, b]) => (
              <div key={n} className="panel panel-glow sweep p-6">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-ember">{n}</p>
                <h3 className="display mt-3 text-2xl text-ink">{t}</h3>
                <p className="mt-3 text-lg text-dim">{b}</p>
              </div>
            ))}
          </div>

          <h3 className="display mt-14 text-3xl text-ink">Who pays for a sprint</h3>
          <p className="mt-3 max-w-3xl text-lg text-dim">The sprint model is constant whatever is funding it. Only the source changes over time.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Now", "Archive Shard sale", "The NFT sale running today funds sprints under this model, applied sprint by sprint and accounted for before the next is released."],
              ["Later", "Token sale", "Its price steps up with every completed sprint, so earlier buyers fund earlier work at a lower price and the price reflects what has been built."],
              ["Always", "Community rounds", "Any sprint can open a dedicated round at kickoff. Same rules: full funding before release, costs in the four slots, excess rolled forward."],
            ].map(([when, title, b]) => (
              <div key={when} className="panel panel-glow sweep p-6">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-ember">{when}</p>
                <h4 className="mt-2 text-xl text-ink">{title}</h4>
                <p className="mt-2 text-lg text-dim">{b}</p>
              </div>
            ))}
          </div>

          <h3 className="display mt-14 text-3xl text-ink">The team carries the risk, and is paid for it</h3>
          <p className="mt-3 max-w-3xl text-lg text-dim">
            Cash pay can be late. Each sprint escrows coins at a fixed accounting price, $0.50 through S8 and $1.00 from S9, equal to the
            sprint&rsquo;s cost. Coins are a bonus on top of the agreed cash, never a substitute, and are paid from the treasury.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {escrow.map(([a, b, c], i) => (
              <div key={a} className="panel panel-glow p-5">
                <p className="display text-3xl" style={{ color: i === 0 || i === 3 ? OK : "#f0954f" }}>{["20%", "20%", "100%", "Kept"][i]}</p>
                <p className="mt-2 text-base text-ink">{a}</p>
                <p className="mt-2 text-base text-dim">{b}</p>
                <p className="mt-1 text-base text-faint">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* detail */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Kicker num="03">Detail</Kicker>
        <h2 className="display text-4xl text-ink">Sprint by sprint</h2>
        <p className="mt-4 max-w-3xl text-lg text-dim">
          Approximate cost by slot (<b className="text-ink">D</b>evelopment, <b className="text-ink">M</b>arketing, <b className="text-ink">O</b>perations,{" "}
          <b className="text-ink">S</b>pecial, in thousands) and coin escrow with its 20% and 80% tranches. The details of a sprint are
          provided closer to that sprint and may move between adjacent sprints.
        </p>
        <details className="group mt-6">
          <summary className="inline-block cursor-pointer border border-signal bg-signal/15 px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25">
            <span className="group-open:hidden">Show the sprint table</span>
            <span className="hidden group-open:inline">Hide the sprint table</span>
          </summary>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead><tr><th className={th}>Sprint</th><th className={th}>Scope</th><th className={`${th} text-right`}>Approx. cost</th><th className={`${th} text-right`}>Coin escrow</th></tr></thead>
              <tbody>
                <tr>
                  <td className={`${td} w-56`}>
                    <b className="block text-ink">S1 · Foundations</b>
                    <span className="mt-1 block font-mono text-sm uppercase tracking-[0.15em] text-signal">4 Oct to 31 Oct 2026</span>
                    <span className="mt-3 inline-block border border-ember px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-ember">Delivered</span>
                  </td>
                  <td className={td}>
                    <ul className="space-y-2">
                      {s1Deliverables.map(([k, v, done]) => (
                        <li key={k}>
                          <span className="mr-2 inline-block w-5 text-center" aria-label={done ? "done" : "in progress"}>{done ? "\u2705" : "\u23F3"}</span>
                          <b className="text-ink">{k}.</b> {v}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-3 block text-base" style={{ color: OK }}>All six in production. The only sprint released ahead of funding.</span>
                  </td>
                  <td className={`${td} w-40 whitespace-nowrap text-right`}>
                    <b className="text-ink">{usd(S1_COST)}</b>
                    <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">fixed</span>
                  </td>
                  <td className={`${td} w-40 whitespace-nowrap text-right`}>
                    <b className="text-ink">{num(coins(S1_COST, 1))}</b>
                    <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">20% {num(coins(S1_COST, 1) * RELEASE_AT_END)} · 80% {num(coins(S1_COST, 1) * (1 - RELEASE_AT_END))}</span>
                    <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">at $0.50</span>
                  </td>
                </tr>
                {sprints.map((sp, i) => (
                  <tr key={sp.n}>
                    <td className={`${td} w-56`}>
                      <b className="block text-ink">{sp.n} · {sp.title}</b>
                      <span className="mt-1 block font-mono text-sm uppercase tracking-[0.15em] text-signal">{sp.dates}</span>
                      {i === 0 && <span className="mt-3 inline-block border border-signal px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-signal">Next</span>}
                    </td>
                    <td className={td}>
                      {sp.scope}
                      {sp.gate && <span className="mt-2 block text-base" style={{ color: OK }}>{sp.gate}</span>}
                    </td>
                    <td className={`${td} w-40 whitespace-nowrap text-right`}>
                      <b className="text-ink">{usd(sp.total)}</b>
                      <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">D {sp.d} · M {sp.m} · O {sp.o} · S {sp.s}</span>
                    </td>
                    <td className={`${td} w-40 whitespace-nowrap text-right`}>
                      <b className="text-ink">{num(coins(sp.total, sprintNo(sp.n)))}</b>
                      <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">20% {num(coins(sp.total, sprintNo(sp.n)) * RELEASE_AT_END)} · 80% {num(coins(sp.total, sprintNo(sp.n)) * (1 - RELEASE_AT_END))}</span>
                      <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">at ${coinPrice(sprintNo(sp.n)).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-void">
                  <td className="border-t-2 border-signal px-4 py-5 text-xl font-semibold text-ink">S2 to S17 · 48 weeks</td>
                  <td className="border-t-2 border-signal px-4 py-5 text-lg text-ink">From Arena foundations to Early Access, 9 Nov 2026 to 10 Oct 2027</td>
                  <td className="border-t-2 border-signal px-4 py-5 text-right text-xl font-semibold text-ink">
                    {usd(planTotal)}
                    <span className="mt-1 block font-mono text-xs font-normal tracking-[0.1em] text-faint">D {planSlots[0].toLocaleString("en-US")} · M {planSlots[1]} · O {planSlots[2]} · S {planSlots[3]}</span>
                  </td>
                  <td className="border-t-2 border-signal px-4 py-5 text-right text-xl font-semibold text-ink">
                    {num(planCoins)}
                    <span className="mt-1 block font-mono text-xs font-normal tracking-[0.1em] text-faint">20% {num(planCoins * RELEASE_AT_END)} · 80% {num(planCoins * (1 - RELEASE_AT_END))}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="display mt-14 text-3xl text-ink">Where the estimates come from</h3>
          <p className="mt-4 max-w-3xl text-lg text-dim">
            A twelve-month plan folded into the four slots. Development covers studio leadership, engineering, art and animation,
            narrative, audio and voice, technology and infrastructure, outsourced art and localization. Operations covers QA and
            community, blockchain and compliance, accounting, insurance and administration. Special holds the contingency reserve and
            named one-off items.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead><tr><th className={th}>Category</th><th className={th}>Covers</th><th className={`${th} text-right`}>Low</th><th className={`${th} text-right`}>Base</th><th className={`${th} text-right`}>High</th></tr></thead>
              <tbody>
                {categories.map(([cat, covers, lo, base, hi]) => (
                  <tr key={cat}>
                    <td className={`${td} text-ink`}>{cat}</td>
                    <td className={`${td} text-base text-faint`}>{covers}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>${lo}</td>
                    <td className={`${td} whitespace-nowrap text-right font-semibold text-ink`}>${base}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>${hi}</td>
                  </tr>
                ))}
                <tr className="bg-void">
                  <td className="border-t-2 border-signal px-4 py-5 text-xl font-semibold text-ink">Total, 12 months</td>
                  <td className="border-t-2 border-signal" />
                  <td className="border-t-2 border-signal px-4 py-5 text-right text-xl font-semibold text-ink">${categoryTotal[0]}</td>
                  <td className="border-t-2 border-signal px-4 py-5 text-right text-xl font-semibold text-ink">${categoryTotal[1]}</td>
                  <td className="border-t-2 border-signal px-4 py-5 text-right text-xl font-semibold text-ink">${categoryTotal[2]}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-base text-faint">
            Ranges are plus or minus ten percent, rounded to the nearest thousand dollars. The twelve-month base, $2,252,000, is about
            $130,000 per three-week sprint; the sprint plan comes to {usd(planTotal)} over sixteen sprints because the early web and
            contract sprints run lighter than full production.
          </p>
        </details>
        <Disclaimer />
      </section>

      <footer className="border-t border-hairline bg-void">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
          <div className="flex items-center gap-6">
            <a href="https://www.verticalfoundation.net" target="_blank" rel="noopener noreferrer" className="opacity-60 transition-opacity hover:opacity-100">
              <Image src="/vertical-foundation-logo.png" alt="Vertical Foundation" width={125} height={80} className="h-16 w-auto" />
            </a>
            <p className="font-mono text-base tracking-[0.15em] text-faint">© 2026 AI Wars · A Vertical Foundation project</p>
          </div>
          <a href="/" className="font-mono text-base uppercase tracking-[0.3em] text-dim transition-colors hover:text-signal">Back to site</a>
        </div>
      </footer>
    </main>
  );
}
