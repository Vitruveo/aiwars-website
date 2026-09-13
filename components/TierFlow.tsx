import Shard from "@/components/Shard";
import { TIERS, MINTED, TOTAL_SUPPLY, liveTierIndex, actsCount, fmt } from "@/lib/shards";

// Five tier nodes on one energy line. The line flows from 01 to 05; the live node pulses.
export default function TierFlow() {
  const live = liveTierIndex();
  const mintedTotal = MINTED.reduce((a, b) => a + b, 0);

  return (
    <div>
      {/* flow line + nodes (desktop) */}
      <div className="relative hidden md:block">
        <svg viewBox="0 0 1000 80" className="absolute inset-x-0 top-[3.25rem] h-20 w-full" aria-hidden>
          <line x1="100" y1="40" x2="900" y2="40" stroke="#1b2a44" strokeWidth="2" />
          <line x1="100" y1="40" x2="900" y2="40" stroke="#2d8cff" strokeWidth="2" className="flow-line" opacity="0.9" />
          {TIERS.map((t, i) => {
            const x = 100 + i * 200;
            const soldOut = MINTED[i] >= t.supply;
            const isLive = i === live;
            return (
              <g key={t.n}>
                {isLive && <circle cx={x} cy="40" r="22" fill="none" stroke="#2d8cff" strokeWidth="2" className="node-pulse" />}
                <circle cx={x} cy="40" r="16" fill="#04070d" stroke={isLive ? "#2d8cff" : soldOut ? "#8fa0ba" : "#1b2a44"} strokeWidth="2" />
                <circle cx={x} cy="40" r={isLive ? 7 : 4} fill={isLive ? "#2d8cff" : soldOut ? "#8fa0ba" : "#1b2a44"} />
              </g>
            );
          })}
        </svg>
        <div className="h-[6.5rem]" />
      </div>

      <ol className="grid gap-3 md:grid-cols-5">
        {TIERS.map((t, i) => {
          const soldOut = MINTED[i] >= t.supply;
          const isLive = i === live;
          const pct = (MINTED[i] / t.supply) * 100;
          return (
            <li
              key={t.n}
              className={`panel panel-flat tilt sweep relative flex flex-col items-center p-6 text-center ${
                isLive ? "border-signal/80 shadow-[0_0_80px_rgba(11,92,255,0.22)]" : soldOut ? "opacity-50" : "opacity-80"
              }`}
              style={{ "--d": `${i * 0.9}s` } as React.CSSProperties}
            >
              <span className={`display text-5xl ${isLive ? "grad-text" : "text-faint"}`}>{String(t.n).padStart(2, "0")}</span>
              <div className="my-3">
                <Shard tier={t.n} size={isLive ? 96 : 72} float={isLive} />
              </div>
              <p className="display text-2xl text-ink">{t.name}</p>
              <p className="mt-1 font-mono text-base tracking-[0.15em] text-dim">
                {fmt(t.supply)} SHARDS · <span className="text-ember">${t.price}</span>
              </p>
              <p className="mt-3 font-mono text-sm tracking-[0.15em] text-faint">
                {actsCount(t)} OF 4 ACTIVATIONS
              </p>
              <div className="mt-4 h-1.5 w-full bg-hairline/60">
                <div className="h-1.5 bg-signal" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 font-mono text-sm tabular-nums tracking-[0.1em] text-faint">
                {fmt(MINTED[i])} / {fmt(t.supply)} MINTED
              </p>
              <p
                className={`mt-4 inline-flex items-center gap-2 font-mono text-base uppercase tracking-[0.25em] ${
                  isLive ? "text-signal" : "text-faint"
                }`}
              >
                {isLive && <span className="live-dot inline-block h-2 w-2 rounded-full bg-signal" />}
                {soldOut ? "Sold out" : isLive ? "Minting now" : `Unlocks when ${String(t.n - 1).padStart(2, "0")} sells out`}
              </p>
            </li>
          );
        })}
      </ol>

      {/* whole-supply bar */}
      <div className="mt-10">
        <div className="mb-2 flex items-baseline justify-between font-mono text-base tracking-[0.2em]">
          <span>
            <span className="display text-3xl text-signal">{fmt(mintedTotal)}</span>
            <span className="text-faint"> / {fmt(TOTAL_SUPPLY)} MINTED</span>
          </span>
          <span className="text-faint">01 → 05</span>
        </div>
        <div className="flex h-3 w-full gap-[2px]">
          {TIERS.map((t, i) => (
            <div key={t.n} className={`h-3 ${i === live ? "bg-signal/25" : "bg-hairline/50"}`} style={{ width: `${(t.supply / TOTAL_SUPPLY) * 100}%` }}>
              <div className="bar-ember h-3" style={{ width: `${(MINTED[i] / t.supply) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="flex w-full gap-[2px] font-mono text-sm tracking-[0.15em] text-faint">
          {TIERS.map((t) => (
            <div key={t.n} className="truncate pt-1.5" style={{ width: `${(t.supply / TOTAL_SUPPLY) * 100}%` }}>
              {String(t.n).padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
