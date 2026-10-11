import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Shard from "@/components/Shard";
import GenesisPanel from "@/components/GenesisPanel";
import archive from "@/public/art/archive.jpg";
import { VTRU_BRIDGE_URL, GENESIS_PRICE_VTRU, GENESIS_THRESHOLD, GENESIS_COMMISSION_PCT } from "@/lib/contracts";
import { fmt } from "@/lib/shards";

export const metadata: Metadata = {
  title: "Genesis — AI Wars",
  description:
    "The AI Wars Genesis package for the Vitruveo community: a referral link paying 10% on every mint, and a transferable NFT Claim that activates at 20 sales.",
};

function Kicker({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <p className="kicker mb-4">
      <span className="kicker-num">{n}</span>
      {children}
    </p>
  );
}

const WINS = [
  { n: "01", title: "Win with referral cash", body: `${GENESIS_COMMISSION_PCT}% commission on every shard minted through your link, paid in USDT the moment the mint clears.` },
  { n: "02", title: "Win with an AI Wars NFT", body: `Once your link has ${GENESIS_THRESHOLD} sales your Claim activates. Redeem it for a shard at whichever tier is live.` },
  { n: "03", title: "Win when AI Wars succeeds", body: "Through your effort. Every Genesis holder is an early builder of the project." },
];

export default function Genesis() {
  return (
    <main className="min-h-svh overflow-x-clip">
      <Nav />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <Image src={archive} alt="" fill priority placeholder="blur" quality={95} className="hero-art object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-abyss/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/70 via-abyss/20 to-abyss" />
        <div className="starfield" />
        <div className="scanline" />
        <div className="relative mx-auto grid w-full max-w-7xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="hero-copy">
            <p className="kicker mb-6">
              For the Vitruveo community · <span className="text-ember">performance package</span>
            </p>
            <h1 className="display text-[13vw] leading-none text-ink sm:text-8xl lg:text-[7rem]">Genesis</h1>
            <p className="mt-6 font-mono text-lg font-bold uppercase tracking-[0.4em] text-ember">
              {fmt(GENESIS_PRICE_VTRU)} VTRU · on BSC
            </p>
            <div className="rule my-8" />
            <p className="text-xl text-ink drop-shadow-[0_2px_10px_rgba(4,7,13,0.9)] sm:text-2xl sm:text-dim sm:drop-shadow-none">
              For intrepid Vitruvians who want to help build AI Wars. Each Genesis package comes with a Referral Link
              and an NFT Claim, and is bought exclusively with {fmt(GENESIS_PRICE_VTRU)} VTRU tokens on BNB Smart Chain.
              <span className="text-ink"> Win, win, win.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={VTRU_BRIDGE_URL} target="_blank" rel="noreferrer" className="border border-hairline px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-dim transition-all hover:border-dim hover:text-ink">
                Bridge VTRU to BSC
              </a>
              <a href="/nft" className="border border-hairline px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-dim transition-all hover:border-dim hover:text-ink">
                What a shard is
              </a>
            </div>
          </div>
          <Reveal delay={100}>
            <GenesisPanel />
          </Reveal>
        </div>
      </section>

      {/* ================= WIN WIN WIN ================= */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="01">Win, win, win</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">Three ways it pays</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {WINS.map((w, i) => (
              <Reveal key={w.n} delay={i * 80}>
                <div className="panel panel-flat h-full p-7">
                  <p className="font-mono text-base tracking-[0.3em] text-signal">{w.n}</p>
                  <p className="display mt-4 text-2xl text-ink">{w.title}</p>
                  <p className="mt-3 text-base text-dim">{w.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= THE TWO PARTS ================= */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="02">What you get</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">Two instruments</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="panel panel-flat h-full p-8">
                <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">1 · Referral link</p>
                <p className="display mt-4 text-3xl text-ink">Exclusive to you</p>
                <p className="mt-4 text-lg text-dim">
                  Pays {GENESIS_COMMISSION_PCT}% commission for every mint. The commission comes out of the mint price and
                  lands in your wallet in the same transaction. Your own mints through your link count too.
                </p>
                <p className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-faint">Your code is the first five characters of your wallet address · stays yours even if you sell the Claim</p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="panel panel-flat relative h-full overflow-hidden p-8">
                <div className="absolute -right-6 -top-6 opacity-40"><Shard tier={1} size={120} float /></div>
                <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">2 · NFT Claim</p>
                <p className="display mt-4 text-3xl text-ink">Activated at {GENESIS_THRESHOLD} mints</p>
                <p className="mt-4 text-lg text-dim">
                  Use the activated Claim to mint an AI Wars NFT at the tier that is live when you redeem. Speed is the
                  name of the game: the faster your Claim activates, the lower the tier you can mint. Buy more than one
                  package and each extra Claim activates at the next {GENESIS_THRESHOLD} sales.
                </p>
                <p className="mt-4 font-mono text-sm uppercase tracking-[0.2em] text-faint">Claims are transferable · gift it or sell it</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= HOW ================= */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="03">How it runs</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">Four steps</h2>
          </Reveal>
          <ol className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ["Bridge", `Move ${fmt(GENESIS_PRICE_VTRU)} VTRU from Vitruveo to BNB Smart Chain.`],
              ["Buy", "Approve VTRU and buy Genesis. Your code is the first five characters of your address; the Claim is a token on BSC."],
              ["Refer", `Share your link. Each paid shard pays you ${GENESIS_COMMISSION_PCT}% and counts toward ${GENESIS_THRESHOLD}.`],
              ["Redeem", "Once active, redeem the Claim. Your shard is minted on Vitruveo like every other."],
            ].map(([t, b], i) => (
              <Reveal key={t} delay={i * 80}>
                <li className="panel panel-flat h-full p-6">
                  <p className="display text-4xl text-signal">{String(i + 1).padStart(2, "0")}</p>
                  <p className="display mt-3 text-xl text-ink">{t}</p>
                  <p className="mt-2 text-base text-dim">{b}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
