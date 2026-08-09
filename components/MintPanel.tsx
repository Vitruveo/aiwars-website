"use client";

import { useMemo, useState } from "react";

const PRICE = 0.05;
const SALE_CAP = 50_000_000;

const AGENTS = [
  "ATLAS", "AEGIS", "CIPHER", "DELTA", "ECHO", "FULCRUM",
  "GHOST", "HELIX", "IRIS", "JAVELIN", "KESTREL", "LUMEN",
  "MIRAGE", "NOVA", "ONYX", "PYRE", "QUARK", "RIGEL",
  "SABLE", "TALON", "UMBRA", "VECTOR", "WARDEN", "XENON",
  "YONDER", "ZENITH", "ORACLE", "VESPER", "LATTICE", "SOLSTICE",
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function MintPanel() {
  const [usd, setUsd] = useState(500);
  const [agent, setAgent] = useState<number | null>(null);
  const [notice, setNotice] = useState(false);

  const tokens = useMemo(() => Math.floor(usd / PRICE), [usd]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* -- agent selection -- */}
      <div className="panel p-6 lg:col-span-3">
        <div className="mb-1 flex items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">
            Choose your agent
          </p>
          <p className="font-mono text-base uppercase tracking-[0.2em] text-faint">
            or auto-assign
          </p>
        </div>
        <p className="mb-5 text-xl text-dim">
          Every token is auto-staked at purchase. 30 agents launch identical — their
          skills diverge through play, and their wins mint tokens to their stakers.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
          {AGENTS.map((name, i) => (
            <button
              key={name}
              onClick={() => setAgent(agent === i ? null : i)}
              className={`agent-tile px-1 py-3 text-center ${agent === i ? "selected" : ""}`}
              style={
                {
                  "--hue": `${(160 + i * 7) % 360}`,
                  "--d": `${(i % 12) * 0.4}s`,
                } as React.CSSProperties
              }
            >
              <span className="mb-1 flex items-center justify-center gap-1.5">
                <span className="agent-dot" />
                <span className="font-mono text-sm tracking-[0.2em] text-faint">
                  AGT-{String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="block font-mono text-base tracking-[0.12em] text-ink">
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* -- purchase panel -- */}
      <div className="panel flex flex-col p-6 lg:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-base uppercase tracking-[0.35em] text-signal">
            Mint $AIWARS
          </p>
          <span className="inline-flex items-center gap-2 font-mono text-base uppercase tracking-[0.2em] text-ember">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-ember" />
            Sale opening soon
          </span>
        </div>

        <label className="mb-2 block font-mono text-base uppercase tracking-[0.3em] text-faint">
          Contribution (USD)
        </label>
        <div className="mb-4 flex items-center gap-3 border border-hairline bg-void/80 px-4 py-3">
          <span className="font-mono text-base text-faint">$</span>
          <input
            type="number"
            min={PRICE}
            step={50}
            value={usd}
            onChange={(e) => setUsd(Math.max(0, Number(e.target.value)))}
            className="w-full bg-transparent font-mono text-2xl text-ink outline-none"
          />
        </div>

        <div className="mb-4 grid grid-cols-4 gap-1.5">
          {[100, 500, 2500, 10000].map((v) => (
            <button
              key={v}
              onClick={() => setUsd(v)}
              className={`border py-1.5 font-mono text-base tracking-wide transition-colors ${
                usd === v
                  ? "border-signal/60 text-signal"
                  : "border-hairline text-faint hover:text-dim"
              }`}
            >
              ${fmt(v)}
            </button>
          ))}
        </div>

        <div className="mb-6 space-y-2.5 border-t border-hairline pt-4 font-mono text-base tracking-[0.08em]">
          <div className="flex justify-between">
            <span className="text-faint">PRICE</span>
            <span className="text-ink">$0.05 / TOKEN</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faint">YOU RECEIVE</span>
            <span className="text-signal">{fmt(tokens)} $AIWARS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-faint">STAKED TO</span>
            <span className="text-ink">
              {agent === null ? "AUTO-ASSIGNED" : `AGT-${String(agent + 1).padStart(2, "0")} ${AGENTS[agent]}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-faint">LOCK</span>
            <span className="text-ink">LAUNCH OR 180 DAYS</span>
          </div>
        </div>

        <button
          onClick={() => setNotice(true)}
          className="btn-pulse mt-auto w-full border border-signal bg-signal/15 py-3.5 font-mono text-base uppercase tracking-[0.3em] text-signal transition-all hover:bg-signal/25"
        >
          Connect Wallet
        </button>
        {notice && (
          <p className="mt-3 text-center font-mono text-base tracking-[0.15em] text-faint">
            Wallet connection goes live when the sale opens.
          </p>
        )}

        <div className="mt-6">
          <div className="mb-1.5 flex justify-between font-mono text-base tracking-[0.2em] text-faint">
            <span>SALE CAP</span>
            <span>{fmt(SALE_CAP)} TOKENS · $2.5M</span>
          </div>
          <div className="h-1 w-full bg-hairline/60">
            <div className="h-1 w-0 bg-signal" />
          </div>
        </div>
      </div>
    </div>
  );
}
