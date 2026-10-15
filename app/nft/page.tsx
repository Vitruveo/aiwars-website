import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Shard from "@/components/Shard";
import TierFlow from "@/components/TierFlow";
import HoldDiagram from "@/components/HoldDiagram";
import CountUp from "@/components/CountUp";
import MintTicker from "@/components/MintTicker";
import MyShards from "@/components/MyShards";
import SaleLabel from "@/components/SaleLabel";
import war from "@/public/art/war.jpg";
import archive from "@/public/art/archive.jpg";
import beyond from "@/public/art/beyond.jpg";
import { TIERS, MINTED, POWER, POWER_SLOTS, SCAPE, SCAPE_SLOTS, DUO, TRIO, TOTAL_SUPPLY, MAX_PER_WALLET, liveTierIndex, actsCount, fmt } from "@/lib/shards";

export const metadata: Metadata = {
  title: "Archive Shard — AI Wars",
  description:
    "5,000 Archive Shards. Five tiers minted in order. Three per wallet. Holders are the exclusive beta testers of AI Wars.",
};

const th = "sticky top-16 z-10 border-b border-signal/40 bg-abyss px-4 py-5 text-left align-bottom";

function Dot({ on = false }: { on?: boolean }) {
  return on ? (
    <span className="inline-block h-4 w-4 rounded-full bg-signal shadow-[0_0_12px_rgba(45,140,255,0.8)]" />
  ) : (
    <span className="inline-block h-4 w-4 rounded-full border border-hairline" />
  );
}

function SlotsRow({ label, slots, of }: { label: string; slots: number[]; of: number }) {
  return (
    <tr className="border-t border-hairline">
      <td className="px-6 py-3 font-mono text-sm uppercase tracking-[0.2em] text-ember">{label}</td>
      {slots.map((n, i) => (
        <td key={i} className="px-4 py-3">
          <span className="display text-2xl text-ink">{n}</span>
          <span className="ml-1 font-mono text-sm text-faint">of {of}</span>
        </td>
      ))}
    </tr>
  );
}

function GroupRow({ name, hold, note }: { name: string; hold: string; note: string }) {
  return (
    <tr className="border-t-2 border-signal/30 bg-signal/5">
      <td colSpan={TIERS.length + 1} className="px-6 pb-3 pt-5">
        <span className="display text-2xl text-ink">{name}</span>
        <span className="ml-4 font-mono text-sm uppercase tracking-[0.2em] text-ember">{hold}</span>
        <span className="mt-1 block text-base text-dim">{note}</span>
      </td>
    </tr>
  );
}

function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="kicker mb-4">
      <span className="kicker-num">{n}</span>
      {children}
    </p>
  );
}

export default function Mint() {
  const li = liveTierIndex();
  const live = TIERS[li];
  const left = live.supply - MINTED[li];

  return (
    <main className="min-h-svh overflow-x-clip">
      <Nav />

      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[92svh] items-center overflow-hidden">
        <Image src={war} alt="The war arrives over Meridian" fill priority placeholder="blur" quality={95} className="hero-art object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-abyss/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/10 to-abyss" />
        <div className="starfield" />
        <div className="scanline" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-[1fr_1fr]">
          <div className="hero-copy">
            <p className="kicker mb-6">
              Your shards · <span className="text-ember">max three per wallet</span>
            </p>
            <h1 className="display text-[13vw] leading-none text-ink sm:text-8xl lg:text-[8rem]">
              Archive
              <br />
              Shard
            </h1>
            <p className="mt-6 font-mono text-lg font-bold uppercase tracking-[0.4em] text-ember">
              Scarcity is key. Speed is rewarded.
            </p>
            <div className="rule my-8" />
            <p className="text-xl text-ink drop-shadow-[0_2px_10px_rgba(4,7,13,0.9)] sm:text-2xl sm:text-dim sm:drop-shadow-none">
              {fmt(TOTAL_SUPPLY)} shards. Never more. Five tiers, minted strictly in order.
              The earlier you arrive, the stronger the shard. Three per wallet, so no one buys the war.
              <span className="text-ink"> Holders play first: every shard is a seat in the closed beta.</span>
            </p>
            <p className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-l-2 border-signal pl-4 font-mono text-base uppercase tracking-[0.25em] text-signal">
              <span className="inline-flex items-center gap-2">
                <span className="live-dot inline-block h-2 w-2 rounded-full bg-signal" />
                <SaleLabel open="Minting now" closed="Opening soon" />
              </span>
              <span className="text-ink">Tier {String(live.n).padStart(2, "0")} {live.name}</span>
              <span className="text-ember">${live.price}</span>
              <span className="text-dim">{fmt(left)} of {fmt(live.supply)} left</span>
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href="/mint" className="btn-pulse border border-signal bg-signal/15 px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25">
                Mint now
              </a>
              <a href="#hold" className="border border-hairline px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-dim transition-all hover:border-dim hover:text-ink">
                What a shard does
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <MyShards size={200} />
          </div>
        </div>
      </section>

      <MintTicker />

      {/* ================= NUMBERS ================= */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: TOTAL_SUPPLY, l: "shards. fixed forever" },
              { v: 5, l: "tiers. minted in order" },
              { v: MAX_PER_WALLET, l: "per wallet. maximum" },
              { v: 4, l: "activations. hold more, unlock more" },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 80}>
                <div className="panel panel-flat tilt sweep h-full p-8 text-center" style={{ "--d": `${i * 0.7}s` } as React.CSSProperties}>
                  <p className="display grad-text text-6xl">
                    <CountUp to={s.v} />
                  </p>
                  <p className="mt-4 font-mono text-base uppercase tracking-[0.2em] text-dim">{s.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHAT A SHARD IS ================= */}
      <section id="lore" className="relative scroll-mt-20 py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Reveal>
              <div className="shard-stage relative mx-auto w-fit">
                <div className="absolute inset-0 -z-10 rounded-full bg-signal/20 blur-[80px]" />
                <div className="shard-spin">
                  <Shard tier={1} size={260} float />
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Kicker n="01">What a shard is</Kicker>
              <h2 className="display text-4xl text-ink sm:text-6xl">The Archive broke. You hold a piece.</h2>
              <p className="mt-6 text-xl text-dim sm:text-2xl">
                The night Meridian held, the Archive activated. It did not open. It fractured, and
                {" "}{fmt(TOTAL_SUPPLY)} fragments of its memory went out across the city. Whoever was standing
                closest caught the brightest ones.
              </p>
              <p className="mt-5 text-xl text-dim">
                An Archive Shard is one of those fragments. It is older than the city. It remembers the
                ground before Meridian was built on it, which is why it makes terrain easier. It remembers
                what people are capable of, which is why it makes you stronger. And fragments of one thing
                want to be whole again: bring two together and they amplify, bring three together and
                something dormant wakes.
              </p>
              <p className="mt-8 border-l-2 border-ember/60 pl-6 text-xl italic text-ink/90">
                &ldquo;Your orders assume the Archive belongs to you.&rdquo; &mdash; NEMESIS-7
              </p>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-3 md:grid-cols-5">
            {[
              ["Archivists", "were inside the Archive when it broke. Their shards came from the core."],
              ["Vanguard", "held the Archive Approach. Their shards fell at their feet."],
              ["Defenders", "stood on the platforms above the city. Their shards were carried on the wind."],
              ["Citizens", "were in the streets and towers of Meridian. Their shards landed among them."],
              ["Survivors", "were at the edges, getting out. Their shards were the last to fall, and the faintest."],
            ].map(([who, what], i) => (
              <Reveal key={who} delay={i * 60}>
                <div className="panel panel-flat tilt h-full p-6">
                  <p className="font-mono text-sm tracking-[0.25em] text-faint">TIER {String(i + 1).padStart(2, "0")}</p>
                  <p className="display mt-1 text-2xl text-ink">{who}</p>
                  <p className="mt-2 text-base text-dim">{what}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BETA ================= */}
      <section className="relative overflow-hidden py-28">
        <Image src={archive} alt="The Archive awakens" fill placeholder="blur" quality={95} className="bg-drift object-cover object-top" sizes="100vw" />
        <div className="absolute inset-0 bg-abyss/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="02">Holders play first</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">Your shard is a seat in the closed beta</h2>
            <p className="mt-6 text-xl text-dim sm:text-2xl">
              AI Wars opens to shard holders before anyone else. Not a waitlist. Not a lottery. Hold a shard,
              stand on Defense Platform 7 the night the Archive activates, and shape the game before the world sees it.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["First in", "Closed beta access from day one. Every tier, every holder."],
              ["Canon", "What happens in the beta is recorded. The first discoveries, the first foundings, the first falls."],
              ["Voice", "Holders test, break and shape the systems. Feedback goes straight to the studio."],
            ].map(([h, b], i) => (
              <Reveal key={h} delay={i * 80}>
                <div className="panel panel-flat tilt h-full p-8">
                  <p className="display text-2xl text-signal">{h}</p>
                  <p className="mt-3 text-lg text-dim">{b}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THE LADDER ================= */}
      <section id="tiers" className="relative scroll-mt-20 py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="03">Five tiers</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">One line. No skipping.</h2>
            <p className="mt-6 text-xl text-dim">
              Tier 01 mints first. When its 125 shards are gone, Tier 02 opens. Then 03, 04, 05.
              Tiers 01 to 04 cost the same. Only speed decides which one you hold.
            </p>
          </Reveal>
          <div className="mt-14">
            <Reveal>
              <TierFlow />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= HOLD 1 / 2 / 3 ================= */}
      <section id="hold" className="relative scroll-mt-20 py-28">
        <div className="absolute inset-0 overflow-hidden">
          <Image src={beyond} alt="" fill placeholder="blur" quality={95} className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-abyss/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="04">Four activations</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">Hold more. Unlock more.</h2>
            <p className="mt-6 text-xl text-dim">
              One shard makes you stronger and opens the way. Two doubles you. Three wakes what is dormant.
            </p>
          </Reveal>
          <div className="mt-12">
            <Reveal>
              <HoldDiagram />
            </Reveal>
          </div>

          {/* four cards */}
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Power", hold: "Hold 1", glyph: "1", line: "Holding a shard with the right parameters makes you more powerful in the game.", detail: "Five bonuses exist. Each shard rolls some of them at mint. Tier 01 rolls three, Tier 05 rolls one." },
              { name: "Scape", hold: "Hold 1", glyph: "1", line: "Holding a shard with the right parameters unlocks unique features in the game.", detail: "Assists in terrain. Instead of a staircase, you get an escalator. Eight exist; each shard rolls some of them." },
              { name: "Duo", hold: "Hold 2", glyph: "2×", line: "Holding two shards doubles certain capabilities.", detail: "Squad size, inventory, build queue, vehicle bays, expedition window. All of them doubled." },
              { name: "Trio", hold: "Hold 3", glyph: "3×", line: "Holding three shards is the only way to enable certain features.", detail: "Faction Command, the Augment Path, Canon Author, Machine Parley. In every shard, dormant, until three sit in one wallet." },
            ].map((a, i) => (
              <Reveal key={a.name} delay={i * 70}>
                <div className="panel panel-flat tilt sweep flex h-full flex-col p-8" style={{ "--d": `${i * 1.1}s` } as React.CSSProperties}>
                  <div className="flex items-start justify-between gap-4">
                    <p className="display text-3xl text-ink">{a.name}</p>
                    <p className="whitespace-nowrap font-mono text-sm uppercase tracking-[0.25em] text-ember">{a.hold}</p>
                  </div>
                  <p className={`display mt-6 text-7xl leading-none ${a.name === "Trio" ? "text-ember" : "text-signal"}`}>{a.glyph}</p>
                  <p className="mt-6 text-lg leading-relaxed text-ink">{a.line}</p>
                  <p className="mt-3 text-base leading-relaxed text-dim">{a.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THE TABLE ================= */}
      <section id="table" className="relative scroll-mt-20 py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="05">Exactly what each tier gets</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">The readout</h2>
          </Reveal>
          <Reveal>
            <div className="panel panel-flat mt-12 overflow-x-auto xl:overflow-visible">
              <table className="w-full min-w-[60rem] table-fixed border-collapse xl:min-w-0">
                <colgroup>
                  <col className="w-[24rem]" />
                  {TIERS.map((t) => (
                    <col key={t.n} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className={`${th} px-6 font-mono text-sm font-normal uppercase tracking-[0.25em] text-faint`}>What you get</th>
                    {TIERS.map((t) => (
                      <th key={t.n} className={th}>
                        <span className="flex items-end gap-3">
                          <Shard tier={t.n} size={28} />
                          <span>
                            <span className="display block text-3xl text-ink">{String(t.n).padStart(2, "0")}</span>
                            <span className="font-mono text-sm uppercase tracking-[0.2em] text-faint">{t.name}</span>
                          </span>
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <GroupRow name="Power" hold="Hold 1" note="Five bonuses exist. Each shard rolls some of them at mint. Which ones is random. The value is fixed by tier." />
                  <SlotsRow label="Bonuses per shard" slots={POWER_SLOTS} of={POWER.length} />
                  {POWER.map((p) => (
                    <tr key={p.name} className="border-t border-hairline">
                      <td className="px-6 py-3">
                        <span className="text-base text-ink">{p.name}</span>
                        <span className="block text-sm text-faint">{p.what}</span>
                      </td>
                      {p.pct.map((v, i) => (
                        <td key={i} className="px-4 py-3 font-mono text-lg tabular-nums text-signal">+{v}%</td>
                      ))}
                    </tr>
                  ))}

                  <GroupRow name="Scape" hold="Hold 1" note="Assistive features in terrain. Not new ground: a better way through the ground everyone has. Instead of a staircase, you get an escalator. Eight exist. Each shard rolls some of them from its tier's pool at mint. A lit dot means the feature is in that tier's pool." />
                  <SlotsRow label="Scapes per shard" slots={SCAPE_SLOTS} of={SCAPE.length} />
                  {SCAPE.map((u) => (
                    <tr key={u.name} className="border-t border-hairline">
                      <td className="px-6 py-3">
                        <span className="text-base text-ink">{u.name}</span>
                        <span className="block text-sm text-faint">{u.what}</span>
                      </td>
                      {TIERS.map((t) => (
                        <td key={t.n} className="px-4 py-3">{t.n <= u.from ? <Dot on /> : <Dot />}</td>
                      ))}
                    </tr>
                  ))}

                  <GroupRow name="Duo" hold="Hold 2" note="Hold two shards and each of these doubles. Both shards must carry Duo." />
                  {DUO.map((d) => (
                    <tr key={d.name} className="border-t border-hairline">
                      <td className="px-6 py-3">
                        <span className="text-base text-ink">{d.name}</span>
                        <span className="block text-sm text-faint">{d.what}</span>
                      </td>
                      {TIERS.map((t) => (
                        <td key={t.n} className="px-4 py-3 font-mono text-lg tabular-nums text-signal">{t.acts.duo ? "2×" : <Dot />}</td>
                      ))}
                    </tr>
                  ))}

                  <GroupRow name="Trio" hold="Hold 3" note="Dormant in every shard, every tier. Three shards in one wallet wake them. There is no other way in." />
                  {TRIO.map((d) => (
                    <tr key={d.name} className="border-t border-hairline">
                      <td className="px-6 py-3">
                        <span className="text-base text-ink">{d.name}</span>
                        <span className="block text-sm text-faint">{d.what}</span>
                      </td>
                      {TIERS.map((t) => (
                        <td key={t.n} className="px-4 py-3 font-mono text-lg tabular-nums text-ember">{t.acts.trio ? "3×" : <Dot />}</td>
                      ))}
                    </tr>
                  ))}

                  <tr className="border-t border-hairline bg-void/40">
                    <td className="px-6 py-5 font-mono text-sm uppercase tracking-[0.25em] text-faint">Activations carried</td>
                    {TIERS.map((t) => (
                      <td key={t.n} className="px-4 py-5">
                        <span className="display text-3xl text-signal">{actsCount(t)}</span>
                        <span className="ml-2 font-mono text-sm uppercase tracking-[0.2em] text-faint">of 4</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= ON CHAIN ================= */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <Reveal>
              <Kicker n="06">On chain</Kicker>
              <h2 className="display text-4xl text-ink sm:text-5xl">Written on every shard</h2>
              <p className="mt-6 text-xl text-dim">
                Written to Vitruveo at mint and never changed. No two shards need be alike:
                the powers and scapes are rolled, the tier sets how many and how strong.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="panel panel-flat divide-y divide-hairline">
                {[
                  ["Tier", "01–05", "Fixed at mint. Sets values, slots and which activations you carry."],
                  ["Powers", "1–3 of 5", "Which bonuses this shard rolled: Armor, Recovery, Salvage, Standing, Production."],
                  ["Scapes", "0–3 of 8", "Which terrain assists this shard rolled, from Haze Sight to Orbital Drop."],
                  ["Affinity", "4 kinds", "Continuity · Integrationist · Sovereign · Machine. Who trusts you first."],
                  ["Sector", "1–12", "Meridian district the shard was recovered from."],
                ].map(([k, range, v]) => (
                  <div key={k} className="grid grid-cols-[6.5rem_5.5rem_1fr] gap-4 px-6 py-4">
                    <span className="font-mono text-base uppercase tracking-[0.15em] text-ember">{k}</span>
                    <span className="font-mono text-base tabular-nums text-ink">{range}</span>
                    <span className="text-base text-dim">{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= CLOSING CTA ================= */}
      <section className="relative overflow-hidden py-32">
        <Image src={war} alt="" fill placeholder="blur" quality={95} className="bg-drift object-cover object-top" sizes="100vw" />
        <div className="absolute inset-0 bg-abyss/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        <div className="starfield" />
        <div className="relative mx-auto max-w-7xl px-5 text-center sm:px-8">
          <Reveal>
            <h2 className="display text-4xl text-ink sm:text-7xl">
              {fmt(TOTAL_SUPPLY)} shards. {fmt(live.supply)} at the top.
            </h2>
            <p className="mt-6 font-mono text-lg uppercase tracking-[0.4em] text-ember">
              Scarcity is key. Speed is rewarded.
            </p>
            <div className="mx-auto mt-12 w-fit">
              <Shard tier={1} size={140} float />
            </div>
            <a href="/mint" className="btn-pulse mt-12 inline-block border border-signal bg-signal/15 px-10 py-5 font-mono text-lg uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25">
              Mint now
            </a>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-hairline bg-void">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
          <p className="font-mono text-base tracking-[0.15em] text-faint">© 2026 AI Wars · A Vertical Foundation project</p>
          <a href="/" className="font-mono text-base uppercase tracking-[0.3em] text-dim transition-colors hover:text-signal">Back to site</a>
        </div>
      </footer>
    </main>
  );
}
