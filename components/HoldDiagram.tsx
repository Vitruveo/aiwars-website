"use client";

import { useEffect, useState } from "react";
import Shard from "@/components/Shard";
import { POWER, SCAPE, DUO, TRIO } from "@/lib/shards";

// Hold 1 / 2 / 3. Shards slide into the wallet; activations light as they arrive.
export default function HoldDiagram() {
  const [hold, setHold] = useState(1);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setHold((h) => (h % 3) + 1), 2600);
    return () => clearInterval(id);
  }, [auto]);

  const pick = (n: number) => {
    setAuto(false);
    setHold(n);
  };

  const stages = [
    { n: 1, name: "Power + Scape", kicker: "One shard", lit: hold >= 1 },
    { n: 2, name: "Duo · 2×", kicker: "Two shards", lit: hold >= 2 },
    { n: 3, name: "Trio wakes", kicker: "Three shards", lit: hold >= 3 },
  ];

  return (
    <div className="panel panel-flat p-6 sm:p-10">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* wallet */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">Your wallet</p>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => pick(n)}
                  className={`border px-4 py-2 font-mono text-base tracking-[0.2em] transition-colors ${
                    hold === n ? "border-signal bg-signal/15 text-signal" : "border-hairline text-faint hover:text-dim"
                  }`}
                >
                  HOLD {n}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-end justify-center gap-4 border border-hairline bg-void/60 px-6 py-8 sm:gap-8">
            <div className="scanline" />
            {[1, 2, 3].map((n) => (
              <div key={n} className={`slot ${hold >= n ? "" : "empty"}`}>
                <Shard tier={1} size={n === 2 ? 110 : 92} float={hold >= n} />
              </div>
            ))}
          </div>

          {/* stage strip */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {stages.map((s) => (
              <div key={s.n} className={`chip px-3 py-3 text-center ${s.lit ? (s.n === 3 ? "lit-ember" : "lit") : ""}`}>
                <p className="font-mono text-sm tracking-[0.2em]">{s.kicker.toUpperCase()}</p>
                <p className="display mt-1 text-lg">{s.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* what lights up */}
        <div className="space-y-6">
          <Group title="Power" hint="Rolled at mint. Fixed by tier." lit={hold >= 1} items={POWER.map((p) => p.name)} />
          <Group title="Scape" hint="Rolled at mint. An escalator instead of a staircase." lit={hold >= 1} items={SCAPE.map((s) => s.name)} />
          <Group title="Duo" hint="Both shards must carry it. Everything here doubles." lit={hold >= 2} items={DUO.map((d) => `${d.name} 2×`)} />
          <Group title="Trio" hint="Dormant in every shard. Three in one wallet wake it." lit={hold >= 3} ember items={TRIO.map((t) => t.name)} />
        </div>
      </div>
    </div>
  );
}

function Group({ title, hint, lit, items, ember = false }: { title: string; hint: string; lit: boolean; items: string[]; ember?: boolean }) {
  return (
    <div className={`transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-40"}`}>
      <div className="mb-2 flex items-baseline gap-3">
        <p className={`display text-xl ${lit ? (ember ? "text-ember" : "text-signal") : "text-faint"}`}>{title}</p>
        <p className="text-sm text-faint">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span
            key={it}
            className={`chip px-3 py-1.5 font-mono text-sm tracking-[0.12em] ${lit ? (ember ? "lit-ember" : "lit") : ""}`}
            style={{ transitionDelay: lit ? `${i * 60}ms` : "0ms" }}
          >
            {it.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
