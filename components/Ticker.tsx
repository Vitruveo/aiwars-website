"use client";

import { useEffect, useState } from "react";

type Signal = {
  label: string;
  value: number;
  decimals: number;
  drift: number;
  min: number;
  max: number;
};

const INITIAL: Signal[] = [
  { label: "BATTLE MOMENTUM", value: 62.4, decimals: 1, drift: 1.6, min: 20, max: 95 },
  { label: "ACTIVE COMBATANTS", value: 30, decimals: 0, drift: 0, min: 30, max: 30 },
  { label: "MACHINE PRESSURE", value: 71.2, decimals: 1, drift: 2.1, min: 30, max: 98 },
  { label: "INFRASTRUCTURE", value: 84.6, decimals: 1, drift: 0.9, min: 40, max: 99 },
  { label: "COMBAT TEMPO", value: 47.8, decimals: 1, drift: 2.4, min: 10, max: 90 },
  { label: "ENEMY REINFORCEMENT", value: 12.1, decimals: 1, drift: 1.2, min: 0, max: 40 },
  { label: "SQUAD DISPERSION", value: 33.5, decimals: 1, drift: 1.4, min: 5, max: 70 },
  { label: "VOLATILITY", value: 18.9, decimals: 1, drift: 1.1, min: 5, max: 60 },
];

function TickerRow({ signals }: { signals: (Signal & { dir: number })[] }) {
  return (
    <>
      {signals.map((s) => (
        <span key={s.label} className="mx-6 inline-flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-faint">{s.label}</span>
          <span className="text-ink">{s.value.toFixed(s.decimals)}</span>
          {s.drift > 0 && (
            <span className={s.dir >= 0 ? "text-signal" : "text-ember"}>
              {s.dir >= 0 ? "+" : "-"}
            </span>
          )}
        </span>
      ))}
      <span className="mx-6 inline-flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-faint">SIGNAL CADENCE</span>
        <span className="text-ink">2S</span>
      </span>
      <span className="mx-6 inline-flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-faint">ARCHIVE STATUS</span>
        <span className="text-ember">SEALED</span>
      </span>
    </>
  );
}

export default function Ticker() {
  const [signals, setSignals] = useState(INITIAL.map((s) => ({ ...s, dir: 1 })));

  useEffect(() => {
    const id = setInterval(() => {
      setSignals((prev) =>
        prev.map((s) => {
          if (s.drift === 0) return s;
          const delta = (Math.random() - 0.5) * 2 * s.drift;
          const value = Math.min(s.max, Math.max(s.min, s.value + delta));
          return { ...s, value, dir: delta >= 0 ? 1 : -1 };
        })
      );
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden border-y border-hairline bg-void/90">
      <div className="marquee flex w-max py-3 font-mono text-base tracking-[0.2em]">
        <TickerRow signals={signals} />
        <TickerRow signals={signals} />
      </div>
    </div>
  );
}
