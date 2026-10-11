import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Shard from "@/components/Shard";
import MintTicker from "@/components/MintTicker";
import ShardMintPanel from "@/components/ShardMintPanel";
import world from "@/public/art/world.jpg";
import { TIERS, MINTED, liveTierIndex, actsCount, fmt } from "@/lib/shards";

export const metadata: Metadata = {
  title: "Mint — Archive Shard — AI Wars",
  description: "Mint an Archive Shard. Pay in USDT on BNB Smart Chain; the NFT is minted to your wallet on Vitruveo.",
};

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

      {/* ================= MINT ================= */}
      <section id="mint" className="relative min-h-svh scroll-mt-20 py-24 pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <Image src={world} alt="" fill placeholder="blur" quality={95} className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-abyss/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-abyss via-transparent to-abyss" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <Kicker n="01">Mint</Kicker>
            <h2 className="display text-4xl text-ink sm:text-6xl">Claim your shard</h2>
            <p className="mt-6 text-xl text-dim">
              Tier {String(live.n).padStart(2, "0")} is open. When its {fmt(live.supply)} shards are gone, it never comes back.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-3">
              <div className="panel panel-flat sweep flex h-full flex-col justify-between p-8 sm:flex-row sm:items-center sm:gap-8">
                <div>
                  <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">Minting now</p>
                  <p className="display mt-4 text-7xl leading-none sm:text-8xl">
                    <span className="grad-text">{String(live.n).padStart(2, "0")}</span>
                  </p>
                  <p className="display mt-2 text-3xl text-ink sm:text-4xl">{live.name}</p>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      [`$${live.price}`, "per shard"],
                      [fmt(left), "left"],
                      [String(actsCount(live)), "activations"],
                    ].map(([n, l]) => (
                      <div key={l}>
                        <p className="display text-2xl text-ember sm:text-3xl">{n}</p>
                        <p className="mt-1 font-mono text-sm uppercase tracking-[0.2em] text-faint">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rule my-6" />
                  <p className="font-mono text-sm uppercase tracking-[0.25em] text-signal">
                    Holders are the closed beta. Play before anyone else.
                  </p>
                </div>
                <div className="shard-stage mx-auto mt-8 shrink-0 sm:mt-0">
                  <div className="shard-spin">
                    <Shard tier={live.n} size={180} float />
                  </div>
                </div>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-2" delay={100}>
              <ShardMintPanel />
            </Reveal>
          </div>
        </div>
      </section>

      <MintTicker />

      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
          <p className="text-xl text-dim">Five tiers, four activations, what each tier gets and why three is the number.</p>
          <a href="/nft" className="mt-8 inline-block border border-hairline px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-dim transition-all hover:border-dim hover:text-ink">
            Read the shard page
          </a>
        </div>
      </section>
    </main>
  );
}
