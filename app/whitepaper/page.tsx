import type { Metadata } from "next";
import Image from "next/image";
import Nav from "@/components/Nav";
import archive from "@/public/art/archive.jpg";

export const metadata: Metadata = {
  title: "Whitepaper — AI Wars",
  description:
    "AI Wars: Complete Vision. A persistent science-fiction universe about agency, intelligence, memory and war — with the Archive Shard NFT appendix.",
};

import { sections, shardRows } from "@/lib/whitepaper";

export default function Whitepaper() {
  return (
    <main className="min-h-svh">
      <Nav />

      {/* header */}
      <section className="relative flex min-h-[55svh] items-end overflow-hidden">
        <Image
          src={archive}
          alt="The Archive"
          fill
          priority
          placeholder="blur"
          quality={95}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-abyss/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/60 via-transparent to-abyss" />
        <div className="relative mx-auto w-full max-w-5xl px-5 pb-16 pt-40 sm:px-8">
          <p className="kicker mb-6">Whitepaper · Complete Vision</p>
          <h1 className="display text-5xl text-ink sm:text-7xl">AI Wars</h1>
          <p className="mt-6 max-w-2xl text-xl text-dim">
            A persistent science-fiction universe about agency, intelligence, memory
            and war — and the Archive Shard that anchors its first players.
          </p>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl gap-16 px-5 py-20 sm:px-8">
        {/* table of contents */}
        <aside className="sticky top-24 hidden h-fit w-72 shrink-0 lg:block">
          <p className="mb-5 font-mono text-base uppercase tracking-[0.3em] text-faint">
            Contents
          </p>
          <ol className="space-y-3">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex gap-3 text-base text-dim transition-colors hover:text-signal"
                >
                  <span className="font-mono text-ember">{s.num}</span>
                  {s.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#shard-appendix"
                className="flex gap-3 text-base text-dim transition-colors hover:text-signal"
              >
                <span className="font-mono text-ember">15</span>
                Appendix — Archive Shard
              </a>
            </li>
          </ol>
        </aside>

        {/* document body */}
        <article className="min-w-0 max-w-3xl">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="mb-20 scroll-mt-28">
              <p className="kicker mb-4">
                <span className="kicker-num">{s.num}</span>
                {s.title}
              </p>
              <h2 className="display mb-8 text-4xl text-ink">{s.title}</h2>
              <div className="space-y-6">
                {s.paras.map((p, i) => (
                  <p key={i} className="text-lg leading-relaxed text-dim">
                    {p}
                  </p>
                ))}
              </div>
              {s.quote && (
                <p className="mt-10 border-l-2 border-ember/60 pl-6 text-xl italic leading-relaxed text-ink/90">
                  {s.quote}
                </p>
              )}
            </section>
          ))}

          {/* token appendix */}
          <section id="shard-appendix" className="scroll-mt-28">
            <p className="kicker mb-4">
              <span className="kicker-num">15</span>
              Appendix
            </p>
            <h2 className="display mb-8 text-4xl text-ink">Archive Shard NFT</h2>
            <div className="panel divide-y divide-hairline">
              {shardRows.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:gap-6">
                  <span className="w-44 shrink-0 font-mono text-base uppercase tracking-[0.15em] text-ember">
                    {k}
                  </span>
                  <span className="text-lg text-dim">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-lg leading-relaxed text-faint">
              Shards are the durable, on-chain layer of the game. Real-time play never
              waits on them. The full tier, metadata and activation design lives on the
              shard page.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/mint"
                className="inline-block border border-signal bg-signal/15 px-8 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25"
              >
                Mint Shards
              </a>
            </div>
          </section>
        </article>
      </div>

      <footer className="border-t border-hairline bg-void">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 sm:flex-row sm:items-center sm:px-8">
          <div className="flex items-center gap-6">
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
            <p className="font-mono text-base tracking-[0.15em] text-faint">
              © 2026 AI Wars · A Vertical Foundation project
            </p>
          </div>
          <a href="/" className="font-mono text-base uppercase tracking-[0.3em] text-dim transition-colors hover:text-signal">
            Back to site
          </a>
        </div>
      </footer>
    </main>
  );
}
