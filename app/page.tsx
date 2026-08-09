import Image from "next/image";
import Nav from "@/components/Nav";
import Ticker from "@/components/Ticker";
import Reveal from "@/components/Reveal";
import MintPanel from "@/components/MintPanel";
import LiveSignal from "@/components/LiveSignal";
import Logo from "@/components/Logo";

import meridian from "@/public/art/meridian.jpg";
import war from "@/public/art/war.jpg";
import archive from "@/public/art/archive.jpg";
import beyond from "@/public/art/beyond.jpg";
import world from "@/public/art/world.jpg";

function Kicker({ num, children }: { num: string; children: React.ReactNode }) {
  return (
    <p className="kicker mb-5">
      <span className="kicker-num">{num}</span>
      {children}
    </p>
  );
}

const conflicts = [
  ["HUMAN vs MACHINE", "Civilizational war between two kinds of society"],
  ["MACHINE vs MACHINE", "Intelligences fighting each other for reasons humanity cannot yet read"],
  ["IDEOLOGICAL", "Wars over the definition of consciousness itself"],
  ["MEMORY & TRUTH", "Conflict over history, identity, and what actually happened"],
  ["INTERNAL", "Synthetic minds at war within themselves"],
  ["HUMAN FACTIONS", "People choosing radically different relationships with AI"],
];

const beats = [
  ["01", "OPENING", "Blue hour over Meridian. The city is alive. Something is subtly wrong high in the atmosphere."],
  ["02", "THE ANOMALY", "Comms fail. Unknown geometric objects assemble themselves in the sky."],
  ["03", "FIRST CONTACT", "Machine assault units reach Platform 7. Purpose-built, asymmetric, clearly non-human design."],
  ["04", "MERIDIAN LOSES", "Structures fall, aircraft drop, districts burn. New order: protect the Archive at all cost."],
  ["05", "NEMESIS-7", "A calm, precise intelligence speaks: your orders assume the Archive belongs to you."],
  ["06", "LAST DEFENSE", "The final stand at the Archive Approach. The assault withdraws. Humanity believes it won."],
  ["07", "THE REVEAL", "The Archive activates — because the defense allowed it to."],
];

const phases = [
  ["PHASE I", "The machines are the enemy", "Humanity believes it faces a unified machine attack. The stakes are survival and the defense of Meridian."],
  ["PHASE II", "The machines are not unified", "Intelligences act against one another. Some protect settlements. Some manipulate them. “AI” is not a faction."],
  ["PHASE III", "History becomes unreliable", "Evidence appears that the official record of civilization is incomplete. The Archive becomes something to investigate."],
  ["PHASE IV", "The first war was not ours", "The conflict is part of something older. Humanity did not start the war — and may not be its central participant."],
  ["PHASE V", "The boundary disappears", "Human and synthetic identity overlap. Political divisions become more important than species divisions."],
  ["PHASE VI", "What should intelligence become?", "No longer about defeating an enemy — about deciding what kind of civilization is allowed to exist, and who decides."],
];

const tokenMechanics = [
  ["BUY", "$0.05 per token, auto-staked to one of 30 agents at purchase"],
  ["WIN", "An agent win mints 150 tokens, distributed pro-rata to that agent's stakers"],
  ["SWITCH", "Move to another agent: 1% burned, 7-day lock on the new position"],
  ["UNSTAKE", "Exit a position: 10% burned — burns reopen headroom under the cap"],
];

const halvings = [
  ["0", "150", 100],
  ["50M", "75", 50],
  ["100M", "38", 25],
  ["150M", "19", 12.5],
];

export default function Home() {
  return (
    <main id="top" className="overflow-x-clip">
      <Nav />

      {/* ================= HERO ================= */}
      <section className="relative flex min-h-svh flex-col justify-end">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={meridian}
            alt="Meridian before the fall — kilometer-scale towers under a blue-hour sky"
            fill
            priority
            placeholder="blur"
            quality={95}
            className="hero-art object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#0b5cff]/40 mix-blend-color" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss/50 via-abyss/5 to-abyss" />
          <div className="absolute inset-0 bg-gradient-to-r from-abyss/30 via-transparent to-abyss/20" />
          <div className="starfield" />
          <div className="scanline" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 pt-40 sm:px-8">
          <div className="hero-copy">
            <p className="kicker kicker-ember mb-6">A Vertical Foundation Project</p>
            <h1 className="glitch text-ink">
              <Logo className="h-auto w-full max-w-[26rem] sm:max-w-[34rem] lg:max-w-[42rem]" />
            </h1>
            <p className="mt-5 font-mono text-base uppercase tracking-[0.5em] text-ember sm:text-base">
              Prologue&nbsp;&nbsp;·&nbsp;&nbsp;The Fall of Meridian
            </p>
            <div className="rule my-8 max-w-xl" />
            <p className="max-w-2xl text-xl text-dim">
              Humanity&rsquo;s greatest city. Its most dangerous secret. A persistent
              science-fiction universe about agency, intelligence, memory and war —
              populated by Actors whose controllers are never revealed.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#mint"
                className="btn-pulse border border-signal bg-signal/15 px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25"
              >
                Mint $AIWARS
              </a>
              <a
                href="#universe"
                className="border border-hairline px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-dim transition-all hover:border-dim hover:text-ink"
              >
                Enter the universe
              </a>
            </div>
          </div>
        </div>

        <div className="relative">
          <Ticker />
        </div>
      </section>

      {/* ================= PREMISE ================= */}
      <section id="universe" className="relative scroll-mt-20">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={beyond}
            alt=""
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/65" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal>
          <Kicker num="01">A universe, not just a game</Kicker>
          <h2 className="display max-w-4xl text-4xl text-ink sm:text-6xl">
            The assumption should collapse
          </h2>
          <p className="mt-6 max-w-2xl text-xl text-dim">
            The player begins believing humans are fighting AI. Over time, that framing
            has to break. The machine intelligences are not one thing — they have
            histories, loyalties, and ideas about what humanity should become.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {conflicts.map(([title, body], i) => (
            <Reveal key={title} delay={i * 60}>
              <div className="panel panel-glow h-full p-6">
                <p className="mb-3 font-mono text-base tracking-[0.3em] text-signal">{title}</p>
                <p className="text-lg leading-relaxed text-dim">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-12 max-w-3xl border-l-2 border-ember/60 pl-6 text-xl italic leading-relaxed text-ink/90">
            The real conflict is not whether humanity survives. It is who gets to decide
            what humanity becomes.
          </p>
        </Reveal>
        </div>
      </section>

      {/* ================= MERIDIAN ================= */}
      <section className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={world}
            alt="Meridian — a world worth saving"
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative flex min-h-[70svh] items-center">
          <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
            <Reveal>
              <Kicker num="02">The setting</Kicker>
              <h2 className="display text-5xl text-ink sm:text-7xl">Meridian</h2>
              <p className="mt-5 max-w-2xl text-xl text-dim">
                A monumental human megacity — beautiful before it is damaged. The
                first emotional beat is not &ldquo;look at this ruined
                future.&rdquo; It is{" "}
                <span className="text-ink">&ldquo;look at what is being lost.&rdquo;</span>
              </p>
            </Reveal>
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-28 sm:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Reveal className="md:col-span-2">
              <div className="panel h-full p-8">
                <p className="mb-4 font-mono text-base uppercase tracking-[0.35em] text-signal">
                  Visual characteristics
                </p>
                <ul className="grid gap-3 text-base text-dim sm:grid-cols-2">
                  <li>Kilometer-scale inhabited towers</li>
                  <li>Layered transportation and airborne traffic</li>
                  <li>Vast civic infrastructure and elevated plazas</li>
                  <li>Structures disappearing into atmospheric haze</li>
                  <li>Advanced engineering that stays legible as engineering</li>
                  <li>Old enough to possess history — far beyond the present day</li>
                </ul>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="panel panel-glow h-full border-ember/30 p-8">
                <p className="mb-3 font-mono text-base uppercase tracking-[0.35em] text-ember">
                  At the center — The Archive
                </p>
                <p className="text-lg leading-relaxed text-dim">
                  It predates much of the surrounding city. Meridian appears to have been
                  built around it. The population believes it is humanity&rsquo;s
                  authenticated repository of history, knowledge, culture and continuity.
                </p>
                <p className="mt-4 text-base italic text-ink/80">
                  That assumption is central to the Prologue.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= PROLOGUE / SEVEN BEATS ================= */}
      <section id="prologue" className="relative scroll-mt-20">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={war}
            alt=""
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <Kicker num="03">Prologue story arc</Kicker>
          <h2 className="display text-4xl text-ink sm:text-6xl">Seven beats</h2>
          <p className="mt-5 max-w-2xl text-xl text-dim">
            Ten to fifteen minutes. One connected region. One continuous escalation. A
            compact, canonical opening chapter — small enough to build at high visual
            quality, large enough to imply an enormous universe.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {beats.slice(0, 4).map(([num, title, body], i) => (
            <Reveal key={num} delay={i * 60}>
              <div className="panel panel-glow h-full p-6">
                <p className="mb-3 font-mono text-base tracking-[0.3em] text-signal">{num}</p>
                <p className="display mb-3 text-xl text-ink">{title}</p>
                <p className="text-lg leading-relaxed text-dim">{body}</p>
              </div>
            </Reveal>
          ))}
          {beats.slice(4).map(([num, title, body], i) => (
            <Reveal key={num} delay={i * 60}>
              <div className="panel panel-glow h-full p-6">
                <p className="mb-3 font-mono text-base tracking-[0.3em] text-signal">{num}</p>
                <p className="display mb-3 text-xl text-ink">{title}</p>
                <p className="text-lg leading-relaxed text-dim">{body}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={240}>
            <div className="panel h-full border-ember/40 p-6">
              <p className="mb-3 font-mono text-base tracking-[0.3em] text-ember">
                THE PLAYER IS NOT A CHOSEN HERO
              </p>
              <p className="text-lg leading-relaxed text-dim">
                One capable defender inside an escalating crisis, fighting beside Actors
                whose controllers are never revealed.
              </p>
            </div>
          </Reveal>
        </div>
        </div>
      </section>

      {/* ================= PRETREND ================= */}
      <section id="pretrend" className="relative scroll-mt-20">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={beyond}
            alt=""
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover object-bottom"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <Reveal>
            <Kicker num="04">The Pretrend gaming preview</Kicker>
            <h2 className="display max-w-4xl text-4xl text-ink sm:text-6xl">
              Two products, one session
            </h2>
            <p className="mt-6 max-w-2xl text-xl text-dim">
              AI Wars is a premium game.{" "}
              <a
                href="https://www.pretrend.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal underline decoration-signal/40 underline-offset-4 transition-colors hover:decoration-signal"
              >
                Pretrend
              </a>{" "}
              is an external observer. They share gameplay — nothing else. Pretrend
              reads live telemetry from outside the game, derives its own Battle
              Momentum signal, and opens live trend markets around it. The game never
              changes, never reacts, never even knows.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 lg:grid-cols-2">
            <Reveal>
              <div className="panel h-full p-8">
                <p className="mb-6 font-mono text-base uppercase tracking-[0.35em] text-signal">
                  One direction of flow
                </p>
                <div className="space-y-2.5">
                  {[
                    ["AI WARS", "Gameplay only"],
                    ["RAW GAME TELEMETRY", "Dense, continuous, multidimensional"],
                    ["PRETREND PROVIDER MODULE", "Interprets the event stream"],
                    ["BATTLE MOMENTUM SIGNAL", "Proprietary, external, 5-second cadence"],
                    ["10-MINUTE TREND MARKET", "Live, tradable, continuously moving"],
                    ["RESOLUTION / SETTLEMENT", "Vitruveo where durability matters"],
                  ].map(([step, note], i) => (
                    <div key={step}>
                      {i > 0 && (
                        <p className="py-0.5 text-center font-mono text-base text-faint">v</p>
                      )}
                      <div className="flex items-baseline justify-between gap-4 border border-hairline bg-void/70 px-5 py-3.5">
                        <span className={`font-mono text-base tracking-[0.1em] ${i === 0 ? "text-ember" : i >= 3 ? "text-signal" : "text-ink"}`}>
                          {step}
                        </span>
                        <span className="hidden text-right text-base text-faint sm:block">{note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="flex flex-col gap-4">
              <Reveal delay={80}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="panel panel-glow p-8 text-center">
                    <p className="display grad-text text-6xl">5s</p>
                    <p className="mt-3 font-mono text-base uppercase tracking-[0.2em] text-dim">
                      signal update cadence
                    </p>
                  </div>
                  <div className="panel panel-glow p-8 text-center">
                    <p className="display grad-ember text-6xl">10m</p>
                    <p className="mt-3 font-mono text-base uppercase tracking-[0.2em] text-dim">
                      market duration
                    </p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="panel h-full p-8">
                  <LiveSignal />
                  <div className="rule my-6" />
                  <p className="mb-4 font-mono text-base uppercase tracking-[0.35em] text-signal">
                    Why the signal moves wildly
                  </p>
                  <p className="text-lg leading-relaxed text-dim">
                    Within seconds: Actors die, positions change hands, structures fail,
                    reinforcements arrive, an AI commander alters its attack behavior. A
                    human force may look visually successful while the composite signal
                    moves against it — a market on the evolving direction of the battle,
                    not a simple who-wins outcome.
                  </p>
                  <div className="rule my-6" />
                  <p className="text-xl italic leading-relaxed text-ink/90">
                    &ldquo;Any sufficiently rich game can become a live market data
                    source — without changing the game itself.&rdquo;
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THE REVEAL ================= */}
      <section className="relative my-20">
        <div className="relative min-h-[90svh] overflow-hidden">
          <Image
            src={archive}
            alt="The Archive awakens — figures before a monumental activating structure"
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl px-5 text-center">
              <Reveal>
                <p className="kicker mb-14">The reveal</p>
              </Reveal>
              <Reveal delay={150}>
                <p className="display text-2xl text-ink/70 sm:text-3xl">
                  &ldquo;You misunderstood us.&rdquo;
                </p>
              </Reveal>
              <Reveal delay={350}>
                <p className="display mt-8 text-2xl text-ink/85 sm:text-4xl">
                  &ldquo;We were not trying to enter.&rdquo;
                </p>
              </Reveal>
              <Reveal delay={550}>
                <p className="display mt-8 text-3xl text-ink sm:text-5xl">
                  &ldquo;We were trying to stop you from opening it.&rdquo;
                </p>
              </Reveal>
              <Reveal delay={750}>
                <div className="rule mx-auto mt-14 max-w-md" />
                <p className="mt-8 font-mono text-base uppercase tracking-[0.4em] text-faint">
                  The player never learns what has awakened. That mystery opens the saga.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ACTORS ================= */}
      <section id="actors" className="relative scroll-mt-20">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={meridian}
            alt=""
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover object-bottom"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <Kicker num="05">A synthetic society</Kicker>
          <h2 className="display max-w-4xl text-4xl text-ink sm:text-6xl">
            Actors — not players and bots
          </h2>
          <p className="mt-6 max-w-2xl text-xl text-dim">
            Every character has an identity: name, history, faction, reputation,
            relationships, memory, goals. An Actor may be controlled by a human or by an
            autonomous agent. The game does not tell you which.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-4">
          {[
            ["1", "human-controlled Actor", "grad-ember"],
            ["29", "AI-controlled Actors", "grad-text"],
            ["100s", "hostile machine units", "text-ink"],
            ["0", "bot labels, tells, or separate queues", "text-faint"],
          ].map(([num, label, color], i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="panel panel-glow h-full p-8 text-center">
                <p className={`display text-6xl ${color}`}>{num}</p>
                <p className="mt-4 font-mono text-base uppercase tracking-[0.2em] text-dim">
                  {label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="display text-2xl text-ink">
                The world does not stop because humans log out.
              </p>
              <p className="mt-4 text-dim">
                Settlements keep functioning overnight. Factions keep operating. Wars
                progress. Relationships evolve. Autonomous Actors fight, retreat, revive
                teammates, negotiate, betray, build reputations — and remember.
              </p>
            </div>
            <div className="border-l-2 border-signal/50 pl-6">
              <p className="text-xl italic leading-relaxed text-ink/90">
                &ldquo;If someone has fought beside you, remembers your history, saved
                your life, and has goals of their own — why should the nature of their
                controller matter?&rdquo;
              </p>
              <p className="mt-3 font-mono text-base uppercase tracking-[0.3em] text-faint">
                That tension emerges from play, never from exposition
              </p>
            </div>
          </div>
        </Reveal>
        </div>
      </section>

      {/* ================= SAGA PHASES ================= */}
      <section className="relative">
        <div className="relative h-[60svh] overflow-hidden">
          <Image
            src={beyond}
            alt="The war beyond Meridian — fleets in orbit over a contested world"
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/20 to-abyss" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
              <Reveal>
                <Kicker num="06">How the story expands</Kicker>
                <h2 className="display max-w-3xl text-4xl text-ink sm:text-6xl">
                  A war that outlives us
                </h2>
              </Reveal>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {phases.map(([phase, title, body], i) => (
              <Reveal key={phase} delay={i * 60}>
                <div className="panel panel-glow h-full p-6">
                  <p className="mb-3 font-mono text-base tracking-[0.35em] text-ember">{phase}</p>
                  <p className="display mb-3 text-xl normal-case tracking-normal text-ink">{title}</p>
                  <p className="text-lg leading-relaxed text-dim">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TOKENOMICS ================= */}
      <section id="token" className="relative scroll-mt-20">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={archive}
            alt=""
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover object-top"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <Kicker num="07">$AIWARS</Kicker>
          <h2 className="display text-4xl text-ink sm:text-6xl">Tokenomics</h2>
          <p className="mt-6 max-w-2xl text-xl text-dim">
            The sale is the only source. No secondary allocations, no team reserve, no
            pre-mine. Every token purchased is staked to an agent fighting in the world —
            emissions flow from agent wins alone.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["$0.05", "price per token"],
            ["50M", "sale cap — $2.5M max raise"],
            ["250M", "max circulating supply"],
            ["30", "agents minting through play"],
          ].map(([num, label], i) => (
            <Reveal key={label} delay={i * 80}>
              <div className="panel panel-glow h-full p-8 text-center">
                <p className="display grad-text text-5xl">{num}</p>
                <p className="mt-4 font-mono text-base uppercase tracking-[0.2em] text-dim">
                  {label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <div className="panel h-full p-8">
              <p className="mb-6 font-mono text-base uppercase tracking-[0.35em] text-signal">
                Mechanics
              </p>
              <div className="space-y-5">
                {tokenMechanics.map(([action, body]) => (
                  <div key={action} className="flex gap-5">
                    <span className="w-28 shrink-0 font-mono text-base tracking-[0.25em] text-ember">
                      {action}
                    </span>
                    <p className="text-lg leading-relaxed text-dim">{body}</p>
                  </div>
                ))}
              </div>
              <div className="rule my-6" />
              <p className="text-lg leading-relaxed text-faint">
                All tokens locked until game launch or 180 days, whichever comes first. At
                unlock, the greater of 20% of the raise or $50,000 seeds the DEX pool —
                and the LP position is burned. Liquidity is permanently locked.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="panel h-full p-8">
              <p className="mb-2 font-mono text-base uppercase tracking-[0.35em] text-signal">
                Emission halvings
              </p>
              <p className="mb-8 text-xl text-dim">
                Agents mint 150 tokens per win, pro-rata to their stakers. The reward
                halves each time cumulative agent mints cross a 50M threshold.
              </p>
              <div className="space-y-4">
                {halvings.map(([threshold, reward, width]) => (
                  <div key={threshold as string}>
                    <div className="mb-1.5 flex justify-between font-mono text-base tracking-[0.2em]">
                      <span className="text-faint">AFTER {threshold} MINTED</span>
                      <span className="text-ink">{reward} / WIN</span>
                    </div>
                    <div className="h-2 w-full bg-hairline/40">
                      <div className="bar-grow h-2 bg-signal/80" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rule my-6" />
              <p className="text-lg leading-relaxed text-faint">
                The circulating cap measures live supply — unstake burns reopen headroom,
                so emissions continue against freed space rather than terminating.
              </p>
            </div>
          </Reveal>
        </div>
        </div>
      </section>

      {/* ================= MINT ================= */}
      <section id="mint" className="relative scroll-mt-20 py-28">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={world}
            alt="A world worth saving — Meridian at dawn"
            fill
            placeholder="blur"
            quality={95}
            className="bg-drift object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-abyss/65" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker num="08">Public mint</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">Stake your agent</h2>
            <p className="mt-6 max-w-2xl text-xl text-dim">
              Thirty agents enter the war identical. Their skills diverge through play.
              Their wins mint tokens to the people staked behind them. Choose whose war
              you fund.
            </p>
          </Reveal>
          <div className="mt-14">
            <Reveal>
              <MintPanel />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-hairline bg-void">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div>
              <Logo className="h-8 w-auto text-ink" />
              <p className="mt-3 max-w-sm text-base text-faint">
                A persistent science-fiction universe about agency, intelligence, memory
                and war. The world continues whether or not you are there.
              </p>
            </div>
            <div className="flex gap-16">
              <div>
                <p className="mb-4 font-mono text-base uppercase tracking-[0.3em] text-faint">
                  Universe
                </p>
                <ul className="space-y-2.5 text-base text-dim">
                  <li><a href="#universe" className="transition-colors hover:text-signal">Vision</a></li>
                  <li><a href="#prologue" className="transition-colors hover:text-signal">Prologue</a></li>
                  <li><a href="#actors" className="transition-colors hover:text-signal">Actors</a></li>
                </ul>
              </div>
              <div>
                <p className="mb-4 font-mono text-base uppercase tracking-[0.3em] text-faint">
                  Token
                </p>
                <ul className="space-y-2.5 text-base text-dim">
                  <li><a href="#token" className="transition-colors hover:text-signal">Tokenomics</a></li>
                  <li><a href="#mint" className="transition-colors hover:text-signal">Mint</a></li>
                </ul>
              </div>
              <div>
                <p className="mb-4 font-mono text-base uppercase tracking-[0.3em] text-faint">
                  Ecosystem
                </p>
                <ul className="space-y-2.5 text-base text-dim">
                  <li>
                    <a href="https://www.pretrend.ai" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-signal">
                      Pretrend
                    </a>
                  </li>
                  <li>
                    <a href="https://www.vitruveo.xyz" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-signal">
                      Vitruveo
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-hairline pt-8 sm:flex-row sm:items-center">
            <a
              href="https://www.verticalfoundation.net"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-60 transition-opacity hover:opacity-100"
            >
              <Image
                src="/vertical-foundation-logo.png"
                alt="Vertical Foundation"
                width={125}
                height={80}
                className="h-16 w-auto"
              />
            </a>
            <p className="font-mono text-base uppercase tracking-[0.3em] text-faint">
              Persisted on Vitruveo · Observed by Pretrend
            </p>
          </div>
          <p className="mt-8 text-center font-mono text-base tracking-[0.15em] text-faint">
            © 2026 AI Wars · A Vertical Foundation project
          </p>
        </div>
      </footer>
    </main>
  );
}
