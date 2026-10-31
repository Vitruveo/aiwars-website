"use client";

import { useEffect, useState } from "react";
import Shard from "@/components/Shard";
import ActivationScape from "@/components/ActivationScape";
import TrendsChart from "@/components/TrendsChart";

// Mint page: what a shard switches on. One tab per activation; the first is live,
// the second is the Pretrend trend game, the rest are still sealed.
const TABS = ["Beacon", "Trends", "Unknown", "Unknown"];

export default function ActivationTabs() {
  const [tab, setTab] = useState(0);
  // The flyover and the live chart are desktop only; on phones they are not mounted at all.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="panel panel-flat sweep p-7 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">Shard Activations</p>
        <div role="tablist" aria-label="Shard activations" className="flex flex-wrap gap-2">
          {TABS.map((name, i) => {
            const active = i === tab;
            return (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(i)}
                className={`border px-4 py-2 font-mono text-base uppercase tracking-[0.25em] transition-all ${
                  active
                    ? "border-signal bg-signal/15 text-signal"
                    : "border-hairline text-dim hover:border-dim hover:text-ink"
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rule my-6" />

      {tab === 0 && (
        <a href="/scape" className="group flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="shrink-0">
            <Shard tier={1} size={84} float />
          </div>
          <div className="flex-1">
            <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">Plant your beacon</p>
            <p className="display mt-2 text-2xl text-ink sm:text-3xl">Every shard owns a sector of the Scape</p>
            <p className="mt-2 max-w-2xl text-lg text-dim">
              Five thousand sectors spiral out from the Archive, one per shard. Fly yours, pick a place in it and name it. Your beacon lights your tile on the world map for everyone to see.
            </p>
          </div>
          <span className="shrink-0 border border-signal bg-signal/15 px-6 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all group-hover:bg-signal/25">
            Open the Scape
          </span>
        </a>
      )}

      {tab === 1 && (
        <a
          href="/trends"
          className="group flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8"
        >
          <div className="shrink-0">
            <Shard tier={3} size={84} float />
          </div>
          <div className="flex-1">
            <p className="font-mono text-base uppercase tracking-[0.35em] text-ember">Trade the battle</p>
            <p className="display mt-2 text-2xl text-ink sm:text-3xl">AIWars Trends</p>
            <p className="mt-2 max-w-2xl text-lg text-dim">
              Pretrend reads live Battle Momentum from the Fall of Meridian and opens a new five-minute trend market on every five-minute mark. Stake 100 to 1,000 VTRU on which of five buckets the trend settles in. Hit and your stake comes back with 0.5x in credits; every 100 credits mints you a Tier 5 shard, at most one a day. Miss and the stake is burned. You can play five times without holding a Tier 1 shard.
            </p>
          </div>
          <span className="shrink-0 border border-signal bg-signal/15 px-6 py-4 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all group-hover:bg-signal/25">
            Play Trends
          </span>
        </a>
      )}

      {tab >= 2 && (
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="shrink-0 opacity-40">
            <Shard tier={tab + 2} size={84} />
          </div>
          <div className="flex-1">
            <p className="font-mono text-base uppercase tracking-[0.35em] text-faint">Sealed</p>
            <p className="display mt-2 text-2xl text-ink sm:text-3xl">More Shard activations coming</p>
            <p className="mt-2 max-w-2xl text-lg text-dim">
              This activation is still sealed in the Archive. Holders will be the first to know.
            </p>
          </div>
        </div>
      )}

      {wide && tab === 0 && (
        <div className="mt-6">
          <ActivationScape />
        </div>
      )}
      {wide && tab === 1 && (
        <div className="mt-6">
          <TrendsChart />
        </div>
      )}
    </div>
  );
}
