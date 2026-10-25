import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";

// Sprint-funded development: the model, the sprint plan with approximate costs, and the
// twelve-month cost basis. Single source for the roadmap and cost plan.
// Not linked from the nav yet; add { href: "/roadmap", label: "Roadmap" } under Blueprint when it goes live.

export const metadata: Metadata = {
  title: "Roadmap — AI Wars",
  description: "AI Wars is built in fully funded three-week sprints. The model, the sprint plan and approximate costs.",
  robots: { index: false, follow: false },
};

type Sprint = { n: string; title: string; dates: string; scope: string; gate: string; total: number; d: number; m: number; o: number; s: number };

const s1Deliverables: [string, string][] = [
  ["Genesis", "The Genesis package on BNB Smart Chain: 45,000 VTRU buys a transferable Claim, a referral code pays 10% on every referred shard, and the Claim activates at 20 referred shards for a free live-tier shard on Vitruveo."],
  ["Shard minting", "Archive Shard sale live: five tiers sold strictly in order, three per wallet, paid in USDT on BNB Smart Chain and minted as an upgradeable ERC-721 on Vitruveo, with metadata served from the site."],
  ["Beacon activation", "The Scape: 5,000 procedurally generated sectors around the Archive, one per shard, with a browser flyover of every sector and a holder-signed beacon that names a place and lights the sector on the world map."],
  ["Battle Momentum oracle feed", "The TrendPulse oracle publishes AI Wars Battle Momentum, a 0 to 100 composite read every two seconds, with history, live websocket ticks and a public status page, and resolves five-minute windows by ordinary least squares trend."],
  ["AIWars Trends game", "The first shard activation on pretrend.ai: a new five-minute market on every five-minute mark, five outcome buckets calibrated from the feed, VTRU stakes and 1.5x payouts settled by the shard contract on Vitruveo, and a live on-chain leaderboard. Shard holders only."],
];

const sprints: Sprint[] = [
  {
    "n": "S2",
    "title": "Arena foundations",
    "dates": "1 Nov 2026 to 21 Nov 2026",
    "scope": "Roster of the 30 agents and the match scheduler. Authoritative match server. Telemetry pipeline from matches to the Pretrend oracle.",
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
    "dates": "22 Nov 2026 to 12 Dec 2026",
    "scope": "Standings and replays on the site. Agent wins drive $AIWARS emissions. First browser combat build: one wave on Defense Platform 7, holders only.",
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
    "dates": "13 Dec 2026 to 2 Jan 2027",
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
    "dates": "3 Jan 2027 to 23 Jan 2027",
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
    "dates": "24 Jan 2027 to 13 Feb 2027",
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
    "dates": "14 Feb 2027 to 6 Mar 2027",
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
    "dates": "7 Mar 2027 to 27 Mar 2027",
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
    "dates": "28 Mar 2027 to 17 Apr 2027",
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
    "dates": "18 Apr 2027 to 8 May 2027",
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
    "dates": "9 May 2027 to 29 May 2027",
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
    "dates": "30 May 2027 to 19 Jun 2027",
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
    "dates": "20 Jun 2027 to 10 Jul 2027",
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
    "dates": "11 Jul 2027 to 31 Jul 2027",
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
    "dates": "1 Aug 2027 to 21 Aug 2027",
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
    "dates": "22 Aug 2027 to 11 Sep 2027",
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
    "dates": "12 Sep 2027 to 2 Oct 2027",
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

const th = "px-4 py-3 text-left font-mono text-sm uppercase tracking-[0.2em] text-faint border-b border-signal";
const td = "px-4 py-4 align-top text-lg text-dim border-b border-hairline";

export default function RoadmapPage() {
  return (
    <main className="min-h-svh">
      <Nav />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-8">
        <p className="kicker mb-3">
          <span className="kicker-num">00</span>AI Wars · October 2026
        </p>
        <h1 className="display text-4xl text-ink sm:text-6xl">Roadmap</h1>
        <h2 className="display mt-10 text-3xl text-ink">Sprint-funded development</h2>
        <p className="mt-6 max-w-3xl text-xl text-dim">
          The game is built one fully funded sprint at a time: fixed three-week production sprints, each with a published scope,
          demonstrable deliverables and a transparent accounting of actual costs. The team builds first; the work is paid for before
          it reaches production. The sprint model is constant whatever is funding it.
        </p>

        {/* the model */}
        <section className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="display text-3xl text-ink">How a sprint runs</h2>
            <ol className="mt-6 space-y-4 text-lg text-dim">
              <li><b className="text-ink">Plan.</b> Before kickoff, publish the scope, acceptance criteria, timeline and planned resources. Every sprint is three weeks.</li>
              <li><b className="text-ink">Open funding.</b> At kickoff, name the sprint&rsquo;s funding source and target: the shard sale, the token sale, or a dedicated Sprint #X community round.</li>
              <li><b className="text-ink">Build and demonstrate.</b> Execute the sprint and present the completed deliverables at its end.</li>
              <li><b className="text-ink">Account transparently.</b> Publish actual costs in four standard slots: <b className="text-ink">Development</b> (engineering, art, narrative, audio, infrastructure, direction), <b className="text-ink">Marketing</b> (trailers, creators, PR, events), <b className="text-ink">Operations</b> (QA and community, blockchain and compliance, administration) and <b className="text-ink">Special</b> (one-off items and contingency, each named).</li>
              <li><b className="text-ink">Release only after payment.</b> Completed work enters production only once the sprint is fully funded. Anything raised beyond actual cost rolls into the next sprint. The one exception is Sprint 1, whose work was already in production when this model was adopted.</li>
            </ol>
          </div>
          <div>
            <h2 className="display text-3xl text-ink">Stop-work rule</h2>
            <p className="mt-6 text-lg text-dim">
              If a sprint ends without full funding, all further work stops. The next sprint cannot begin and the completed work stays
              out of production. The round stays open indefinitely until its target is met; once it is, outstanding compensation is
              settled, the work becomes eligible for release and development resumes.
            </p>
            <h2 className="display mt-12 text-3xl text-ink">Funding sources</h2>
            <p className="mt-6 text-lg text-dim">
              Development always runs on the sprint model; only the source of a sprint&rsquo;s money changes over time. Each sprint names the
              source it draws on.
            </p>
          </div>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Now", "Archive Shard sale", "The NFT sale currently running funds sprints under this model. Shard proceeds are applied sprint by sprint, each one accounted for against its actual costs before the next is released."],
            ["Later", "Token sale", "When the token sale opens, its price steps up with every completed sprint. Each step recognizes the progress already delivered, so earlier buyers fund earlier work at a lower price and the price at any point reflects what has been built."],
            ["Always", "Community rounds", "Any sprint can also open a dedicated funding round at kickoff. Whatever the source, the same rules apply: full funding before release, costs published in the four slots, excess rolled into the next sprint."],
          ].map(([when, title, body]) => (
            <div key={when} className="panel p-6">
              <p className="font-mono text-sm uppercase tracking-[0.3em] text-ember">{when}</p>
              <h3 className="mt-2 text-xl text-ink">{title}</h3>
              <p className="mt-2 text-lg text-dim">{body}</p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="display text-3xl text-ink">Team compensation and coin escrow</h2>
          <p className="mt-6 max-w-3xl text-lg text-dim">
            People working on a sprint accept that cash compensation may be delayed. An escrowed coin allocation compensates them for
            carrying that risk. Coins are a bonus, not a substitute: when the round funds, the team receives all agreed outstanding cash
            pay and keeps any coins already released.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead><tr><th className={th}>Funding outcome</th><th className={th}>Coin distribution</th><th className={th}>Cash compensation</th></tr></thead>
              <tbody>
                {escrow.map(([a, b, c]) => (
                  <tr key={a}><td className={`${td} text-ink`}>{a}</td><td className={td}>{b}</td><td className={td}>{c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-base text-faint">
            Each round is published with its deliverables and acceptance criteria, funding target and reconciliation against actuals,
            participants and agreed cash pay, escrowed coin quantities and allocation, the verification process, and the rule for rolling
            excess forward. The coin escrow is funded and independently verifiable at kickoff.
          </p>
        </section>

        {/* sprints */}
        <section className="mt-24 border-t border-hairline pt-12">
          <Kicker num="01">Sprints</Kicker>
          <h2 className="display text-4xl text-ink">Three-week sprints</h2>
          <p className="mt-6 max-w-3xl text-lg text-dim">
            Every sprint is three weeks, demonstrated at its end and released once funded. Costs are approximate, in thousands of dollars
            by slot: <b className="text-ink">D</b>evelopment, <b className="text-ink">M</b>arketing, <b className="text-ink">O</b>perations,{" "}
            <b className="text-ink">S</b>pecial. Dates assume each sprint funds by its end; an unfunded sprint pauses the clock for
            everything after it.
          </p>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead><tr><th className={th}>Sprint</th><th className={th}>Scope</th><th className={`${th} text-right`}>Approx. cost</th></tr></thead>
              <tbody>
                <tr>
                  <td className={`${td} w-56`}>
                    <b className="block text-ink">S1 · Foundations</b>
                    <span className="mt-1 block font-mono text-sm uppercase tracking-[0.15em] text-signal">4 Oct to 31 Oct 2026</span>
                    <span className="mt-3 inline-block border border-[#4fd08a] px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[#4fd08a]">Complete</span>
                  </td>
                  <td className={td}>
                    <ul className="list-disc space-y-2 pl-5">
                      {s1Deliverables.map(([k, v]) => (
                        <li key={k}><b className="text-ink">{k}.</b> {v}</li>
                      ))}
                    </ul>
                    <span className="mt-3 block text-base text-[#4fd08a]">Demonstrated 24 Oct 2026. Already in production: the only sprint released ahead of funding.</span>
                  </td>
                  <td className={`${td} w-40 whitespace-nowrap text-right`}>
                    <b className="text-ink">$25,000</b>
                    <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">fixed</span>
                  </td>
                </tr>
                {sprints.map((sp, i) => (
                  <tr key={sp.n}>
                    <td className={`${td} w-56`}>
                      <b className="block text-ink">{sp.n} · {sp.title}</b>
                      <span className="mt-1 block font-mono text-sm uppercase tracking-[0.15em] text-signal">{sp.dates}</span>
                      {i === 0 && <span className="mt-3 inline-block border border-ember px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-ember">Next</span>}
                    </td>
                    <td className={td}>
                      {sp.scope}
                      {sp.gate && <span className="mt-2 block text-base text-[#4fd08a]">{sp.gate}</span>}
                    </td>
                    <td className={`${td} w-40 whitespace-nowrap text-right`}>
                      <b className="text-ink">{usd(sp.total)}</b>
                      <span className="mt-1 block font-mono text-xs tracking-[0.1em] text-faint">D {sp.d} · M {sp.m} · O {sp.o} · S {sp.s}</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-void">
                  <td className="border-t-2 border-signal px-4 py-5 text-xl font-semibold text-ink">S2 to S17 · 48 weeks</td>
                  <td className="border-t-2 border-signal px-4 py-5 text-lg text-ink">From Arena foundations to Early Access, 1 Nov 2026 to 2 Oct 2027</td>
                  <td className="border-t-2 border-signal px-4 py-5 text-right text-xl font-semibold text-ink">
                    {usd(planTotal)}
                    <span className="mt-1 block font-mono text-xs font-normal tracking-[0.1em] text-faint">D {planSlots[0].toLocaleString("en-US")} · M {planSlots[1]} · O {planSlots[2]} · S {planSlots[3]}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-base text-faint">
            Milestones in green are the demonstrable gate for that sprint. The details of a sprint, its scope, acceptance criteria,
            funding source and cost, are provided closer to that sprint and may move between adjacent sprints.
          </p>
          <Disclaimer />
        </section>

        {/* cost basis */}
        <section className="mt-24 border-t border-hairline pt-12">
          <Kicker num="02">Cost basis</Kicker>
          <h2 className="display text-4xl text-ink">Where the estimates come from</h2>
          <p className="mt-6 max-w-3xl text-lg text-dim">
            The sprint figures above are drawn from this twelve-month plan, folded into the four slots. Development covers studio
            leadership, engineering, art and animation, narrative, audio and voice, technology and infrastructure, outsourced art and
            localization. Operations covers QA and community, blockchain and compliance, accounting, insurance and administration.
            Special holds the contingency reserve and named one-off items.
          </p>
          <div className="mt-8 overflow-x-auto">
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
          <p className="mt-4 text-base text-faint">Ranges are plus or minus ten percent, rounded to the nearest thousand dollars.</p>
          <Disclaimer />
          <p className="mt-6 max-w-3xl text-base text-faint">
            The twelve-month base, $2,252,000, is about $130,000 per three-week sprint; the sprint plan above comes to {usd(planTotal)} over
            sixteen sprints because the early web and contract sprints run lighter than full production.
          </p>
        </section>
      </div>

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
