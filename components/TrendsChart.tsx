"use client";

import { useEffect, useMemo, useState } from "react";

// Live AIWars Trends window, as drawn on pretrend.ai/market/aiwars: the trailing five minutes of
// the Battle Momentum pulse from TrendPulse, the live OLS line and the five outcome buckets.
// Spectator view only; betting happens on Pretrend.
const TRENDPULSE_BASE = "https://d3ulpbw76ladhl.cloudfront.net";
const SOURCE = "aiwars-momentum";
const GAME_S = 300;
const LOCK_S = 240;
const THRESHOLDS = [-34.5, -10.8, 11.9, 34.2]; // fallback quintile edges; Pretrend recalibrates live
const BUCKET_NAMES = ["Crash", "Bear", "Flat", "Bull", "Moon"];
const BUCKET_COLORS = ["#ef4444", "#f97316", "#a3a3a3", "#4ade80", "#8b5cf6"];
const RANGE: [number, number] = [0, 100];

const PX0 = 60, PX1 = 600, PY0 = 25, PY1 = 250, PB0 = 300, PBH = 10, BX0 = 632, BX1 = 838;
const FONT = "var(--font-mono), ui-monospace, monospace";
const SIGNAL = "#2d8cff";
const EMBER = "#f0954f";

type Pt = [number, number];
type Fit = { n: number; xbar: number; ybar: number; a: number; b: number; span: number; trendAbs: number };

function rgba(bucket: number, alpha: number) {
  const hex = BUCKET_COLORS[bucket];
  return `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${alpha})`;
}

function tsOls(points: Pt[], x0: number): Fit | null {
  const n = points.length;
  if (n < 2) return null;
  let xbar = 0, ybar = 0;
  for (const [ts, v] of points) { xbar += ts - x0; ybar += v; }
  xbar /= n; ybar /= n;
  let sxx = 0, sxy = 0;
  for (const [ts, v] of points) {
    const dx = ts - x0 - xbar;
    sxx += dx * dx;
    sxy += dx * (v - ybar);
  }
  if (sxx === 0) return null;
  const b = sxy / sxx;
  const span = points[n - 1][0] - points[0][0];
  return { n, xbar, ybar, a: ybar - b * xbar, b, span, trendAbs: b * span };
}

const trendAbsOf = (b: number) => b * (GAME_S - 1);
const bucketOf = (t: number) => THRESHOLDS.filter((e) => t >= e).length;
const fmtAbs = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(1)}`;
const fmtClock = (s: number) => { const t = Math.max(0, Math.ceil(s)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
const fmtUtc = (ts: number) => { const d = new Date(ts * 1000); return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`; };

type Win = { start: number; trailing: Pt[]; elapsed: number; now: number; fit: Fit | null };

function useLiveWindow(): Win | null {
  const [win, setWin] = useState<Win | null>(null);
  useEffect(() => {
    let stop = false;
    let ws: WebSocket | undefined;
    const cur: { start: number | null; map: Map<number, number> } = { start: null, map: new Map() };
    const nowS = () => Date.now() / 1000;

    async function load(start: number) {
      try {
        const to = Math.min(Math.floor(nowS()), start + GAME_S - 1);
        const r = await fetch(`${TRENDPULSE_BASE}/series?source=${SOURCE}&from=${start - GAME_S}&to=${to}`);
        const d = await r.json();
        if (stop || cur.start !== start) return;
        for (const p of (d.points || []) as Pt[]) cur.map.set(p[0], p[1]);
      } catch {
        // the refill retries
      }
    }
    function connect() {
      if (stop) return;
      try {
        ws = new WebSocket(`${TRENDPULSE_BASE.replace(/^http/, "ws")}/feed`);
      } catch {
        return;
      }
      ws.onmessage = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === "tick" && m.source === SOURCE && cur.start !== null && m.ts >= cur.start - GAME_S) cur.map.set(m.ts, m.value);
        } catch {
          // ignore malformed frames
        }
      };
      ws.onclose = () => { if (!stop) setTimeout(connect, 3000); };
      ws.onerror = () => {};
    }
    connect();
    const tick = () => {
      const t = nowS();
      const start = Math.floor(t / GAME_S) * GAME_S;
      if (cur.start !== start) { cur.start = start; load(start); }
      const floor = Math.floor(t) - GAME_S;
      for (const ts of cur.map.keys()) if (ts < floor) cur.map.delete(ts);
      const trailing = [...cur.map.entries()].sort((a, b) => a[0] - b[0]) as Pt[];
      setWin({ start, trailing, elapsed: t - start, now: t, fit: trailing.length >= 2 ? tsOls(trailing, start) : null });
    };
    tick();
    const clock = setInterval(tick, 1000);
    const refill = setInterval(() => { if (cur.start !== null) load(cur.start); }, 15000);
    return () => { stop = true; clearInterval(clock); clearInterval(refill); ws?.close(); };
  }, []);
  return win;
}

export default function TrendsChart() {
  const win = useLiveWindow();
  const n = GAME_S;
  const pts = win?.trailing ?? [];
  const start = win?.start ?? 0;
  const viewEnd = win ? Math.floor(win.now) : 0;
  const viewStart = viewEnd - (n - 1);
  const elapsed = win?.elapsed ?? 0;
  const fit = win?.fit ?? null;
  const phase = elapsed < LOCK_S ? "open" : "locked";

  const [yLo, yHi] = useMemo(() => {
    if (pts.length < 2) return [0, 100];
    let lo = Infinity, hi = -Infinity;
    for (const [, v] of pts) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const pad = Math.max(10, (hi - lo) * 0.12);
    return [Math.max(RANGE[0], lo - pad), Math.min(RANGE[1], hi + pad)];
  }, [pts]);

  const px = (ts: number) => PX0 + ((PX1 - PX0) * (ts - viewStart)) / (n - 1);
  const py = (v: number) => PY0 + ((yHi - v) / (yHi - yLo)) * (PY1 - PY0);
  const xbar = fit ? fit.xbar : (n - 1) / 2;
  const ybar = fit ? fit.ybar : (yLo + yHi) / 2;
  const liveTrend = fit ? trendAbsOf(fit.b) : null;
  const liveBucket = liveTrend === null ? -1 : bucketOf(liveTrend);
  const lineColor = liveBucket >= 0 ? rgba(liveBucket, 0.95) : "#8fa0ba";

  const pivotTs = start + xbar;
  const rayY = (t: number, ts: number) => py(ybar + (t / (n - 1)) * (ts - pivotTs));
  const coneX0 = Math.max(PX0, px(pivotTs));
  const coneTs0 = Math.max(viewStart, pivotTs);
  const wedges = BUCKET_NAMES.map((_, i) => {
    const hiT = i === 4 ? null : THRESHOLDS[i];
    const loT = i === 0 ? null : THRESHOLDS[i - 1];
    const yTopEnd = hiT === null ? PY0 : rayY(hiT, viewEnd);
    const yBotEnd = loT === null ? PY1 : rayY(loT, viewEnd);
    const yTop0 = hiT === null ? PY0 : rayY(hiT, coneTs0);
    const yBot0 = loT === null ? PY1 : rayY(loT, coneTs0);
    return `${coneX0},${yTop0} ${PX1},${yTopEnd} ${PX1},${yBotEnd} ${coneX0},${yBot0}`;
  });
  const tsAtX = (x: number) => viewStart + ((x - PX0) / (PX1 - PX0)) * (n - 1);
  const clampY = (y: number) => Math.max(PY0, Math.min(PY1, y));
  const BOX_H = (PY1 - PY0) / 5;
  const stripBoxes = BUCKET_NAMES.map((_, i) => {
    if (!fit) return [PY1 - (i + 1) * BOX_H, PY1 - i * BOX_H];
    const top = i === 4 ? PY0 : clampY(rayY(THRESHOLDS[i], tsAtX(BX0)));
    const bottom = i === 0 ? PY1 : clampY(rayY(THRESHOLDS[i - 1], tsAtX(BX0)));
    return [top, bottom];
  });
  const hl = (i: number) => i === liveBucket;
  const progress = Math.max(0, Math.min(1, elapsed / n));
  const lockFrac = LOCK_S / n;
  const last = pts.length ? pts[pts.length - 1] : null;

  return (
    <div className="panel panel-flat p-4 sm:p-5">
      <style>{`@keyframes aw-live-pulse { 0% { r: 3; opacity: 1; } 100% { r: 9; opacity: 0; } }`}</style>
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 font-mono text-base" style={{ color: "#8fa0ba" }}>
        <span>
          <span style={{ color: SIGNAL }}>BATTLE MOMENTUM</span> · game {win ? fmtUtc(start) : "…"} · second {Math.min(n, Math.floor(elapsed))} / {n}
        </span>
        <span>{!win ? "Connecting to TrendPulse…" : phase === "open" ? `Betting closes in ${fmtClock(LOCK_S - elapsed)}` : `Locked — resolves in ${fmtClock(n - elapsed)}`}</span>
      </div>

      {[{ strip: true, id: "d", cls: "hidden md:block" }, { strip: false, id: "m", cls: "md:hidden" }].map(({ strip, id, cls }) => (
        <svg key={id} className={cls} viewBox={strip ? "0 0 850 332" : "0 0 620 332"} role="img" aria-label="Live AI Wars Battle Momentum with the OLS trend and outcome buckets" style={{ width: "100%", height: "auto" }}>
          <defs>
            <clipPath id={`aw-plot-${id}`}><rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} /></clipPath>
            <pattern id={`aw-hatch-${id}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="rgba(240,149,79,0.18)" /></pattern>
            <linearGradient id={`aw-prog-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0b5cff" /><stop offset="1" stopColor="#2d8cff" /></linearGradient>
          </defs>
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          {fit && (
            <g clipPath={`url(#aw-plot-${id})`}>
              {wedges.map((p, i) => <polygon key={i} points={p} fill={rgba(i, hl(i) ? 0.28 : 0.09)} />)}
              {THRESHOLDS.map((t, i) => <line key={i} x1={PX0} y1={rayY(t, viewStart)} x2={PX1} y2={rayY(t, viewEnd)} stroke="rgba(238,243,251,0.22)" strokeWidth="1" />)}
            </g>
          )}
          {strip && BUCKET_NAMES.map((name, i) => {
            const [top, bottom] = stripBoxes[i];
            const h = bottom - top;
            if (h < 1) return null;
            const fs = h >= 26 ? 19 : h >= 14 ? 12 : 0;
            return (
              <g key={name}>
                <rect x={BX0} y={top} width={BX1 - BX0} height={h} rx={h >= 12 ? 6 : 2} fill={rgba(i, hl(i) ? 0.3 : 0.08)} stroke={rgba(i, hl(i) ? 1 : 0.45)} strokeWidth="1.5" />
                {fs > 0 && <text x={(BX0 + BX1) / 2} y={(top + bottom) / 2 + fs * 0.35} textAnchor="middle" fill={hl(i) ? "#ffffff" : rgba(i, 0.9)} fontSize={fs} fontWeight="600" fontFamily={FONT}>{name}</text>}
              </g>
            );
          })}
          {strip && fit && (
            <>
              {THRESHOLDS.map((t, i) => <line key={i} x1={PX1} y1={rayY(t, viewEnd)} x2={BX0} y2={rayY(t, tsAtX(BX0))} stroke="rgba(238,243,251,0.16)" strokeWidth="1" />)}
              <line x1={PX1} y1={py(fit.a + fit.b * (viewEnd - start))} x2={BX0 - 2} y2={py(fit.a + fit.b * (tsAtX(BX0 - 2) - start))} stroke={lineColor} strokeWidth="2.5" strokeDasharray="5 6" opacity="0.9" />
            </>
          )}
          <g clipPath={`url(#aw-plot-${id})`}>
            {pts.length > 1 && <polyline points={pts.map(([ts, v]) => `${px(ts).toFixed(1)},${py(v).toFixed(1)}`).join(" ")} fill="none" stroke="rgba(45,140,255,0.85)" strokeWidth="1.5" />}
            {last && (
              <>
                <circle cx={px(last[0])} cy={py(last[1])} r="3" fill={SIGNAL} />
                <circle cx={px(last[0])} cy={py(last[1])} r="3" fill="none" stroke={SIGNAL} strokeWidth="1.5" style={{ animation: "aw-live-pulse 1s ease-out infinite" }} />
              </>
            )}
          </g>
          {fit && (
            <>
              <g clipPath={`url(#aw-plot-${id})`}>
                <line x1={PX0} y1={py(fit.a + fit.b * (viewStart - start))} x2={PX1} y2={py(fit.a + fit.b * (viewEnd - start))} stroke={lineColor} strokeWidth="2.5" strokeDasharray="5 6" />
              </g>
              {pivotTs >= viewStart && pivotTs <= viewEnd && <circle cx={px(pivotTs)} cy={py(ybar)} r="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />}
            </>
          )}
          <text x={PX0} y={276} fill="rgba(255,255,255,0.55)" fontSize="20" fontFamily={FONT}>-5 min</text>
          <text x={PX1} y={276} textAnchor="end" fill="rgba(255,255,255,0.55)" fontSize="20" fontFamily={FONT}>now</text>
          <rect x={PX0} y={PB0} width={PX1 - PX0} height={PBH} fill="rgba(6,11,20,0.9)" stroke="#1b2a44" strokeWidth="1" />
          <rect x={PX0 + (PX1 - PX0) * lockFrac} y={PB0} width={(PX1 - PX0) * (1 - lockFrac)} height={PBH} fill={`url(#aw-hatch-${id})`} />
          {progress > 0 && (
            <>
              <rect x={PX0} y={PB0} width={(PX1 - PX0) * Math.min(progress, lockFrac)} height={PBH} fill={`url(#aw-prog-${id})`} />
              {progress > lockFrac && <rect x={PX0 + (PX1 - PX0) * lockFrac} y={PB0} width={(PX1 - PX0) * (progress - lockFrac)} height={PBH} fill={EMBER} opacity="0.85" />}
              <rect x={PX0 + (PX1 - PX0) * progress - 1} y={PB0 - 3} width="2" height={PBH + 6} fill="#eef3fb" />
            </>
          )}
          <rect x={PX0 + (PX1 - PX0) * lockFrac - 1} y={PB0 - 4} width="2" height={PBH + 8} fill="rgba(238,243,251,0.6)" />
          <text x={PX0 + (PX1 - PX0) * lockFrac} y={PB0 - 8} textAnchor="middle" fill="#8fa0ba" fontSize="12" letterSpacing="2" fontFamily={FONT}>LOCK</text>
          <text x={PX0} y={PB0 + PBH + 20} fill="#8fa0ba" fontSize="14" fontFamily={FONT}>game {win ? fmtUtc(start) : "…"}</text>
          <text x={(PX0 + PX1) / 2} y={PB0 + PBH + 20} textAnchor="middle" fill="#b9c5da" fontSize="14" fontFamily={FONT}>
            {!win ? "connecting…" : phase === "open" ? `betting open · closes in ${fmtClock(LOCK_S - elapsed)}` : `locked · resolves in ${fmtClock(n - elapsed)}`}
          </text>
          <text x={PX1} y={PB0 + PBH + 20} textAnchor="end" fill="#8fa0ba" fontSize="14" fontFamily={FONT}>{win ? fmtUtc(start + n) : "…"}</text>
          <text x={PX0 - 8} y={PY0 + 6} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize="13" fontFamily={FONT}>{Math.round(yHi)}</text>
          <text x={PX0 - 8} y={PY1} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize="13" fontFamily={FONT}>{Math.round(yLo)}</text>
        </svg>
      ))}

      <div className="mt-2 flex gap-1 md:hidden">
        {BUCKET_NAMES.map((name, i) => (
          <div key={name} className="flex-1 py-2 text-center font-mono text-sm font-semibold" style={{ background: rgba(i, hl(i) ? 0.3 : 0.08), border: `1.5px solid ${rgba(i, hl(i) ? 1 : 0.45)}`, borderRadius: 6, color: hl(i) ? "#fff" : rgba(i, 0.9) }}>
            {name}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center font-mono text-base" style={{ color: "#8fa0ba" }}>
        Live OLS <span style={{ color: lineColor, fontWeight: 600 }}>{liveTrend === null ? "…" : fmtAbs(liveTrend)}</span>
        {liveBucket >= 0 && <> · in <span style={{ color: lineColor, fontWeight: 600 }}>{BUCKET_NAMES[liveBucket]}</span></>}
        {" "}· stake VTRU on the bucket in AIWars Trends
      </p>
    </div>
  );
}
