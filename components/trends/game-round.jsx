'use client';

import { useEffect, useMemo, useState } from 'react';
import { GAME_S, FEED, BUCKET_NAMES, bucketRgba, bucketOf, stripEdges, trendAbsOf } from '@/lib/trends/gamemath';

// Chart geometry
const PX0 = 60;
const PX1 = 600;
const PY0 = 25;
const PY1 = 250;
const PB0 = 300; // progress bar top
const PBH = 10; // progress bar height
const BX0 = 632;
const BX1 = 838;
const FONT = 'var(--aw-mono), ui-monospace, monospace';
const SIGNAL = '#2d8cff';
const EMBER = '#f0954f';

const CONFETTI_COLORS = ['#2d8cff', '#0b5cff', '#f0954f', '#eef3fb', '#8fa0ba'];

// Deterministic pseudo-random in [0, 1) so confetti can be derived in render.
function rnd(i, salt) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function fmtAbs(v, decimals = 1) {
  return `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}${FEED.unit ? ` ${FEED.unit}` : ''}`;
}

function fmtClock(s) {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function fmtUtc(ts) {
  const d = new Date(ts * 1000);
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} UTC`;
}

// Live round of the Battle Momentum game. `win` is the current (or, with a result,
// the settled) window: { start, points, phase, elapsed, lockS, liveFit }.
// `entry` is the player's on-chain bet in that window: { start, bucket, amount, b }.
// `result` is the settled window once the contract holds its winning bucket.
export function GameRound({
  win,
  thresholds,
  bLimit,
  entry,
  result,
  canBet,
  betHint,
  betLabel,
  betting,
  onBet,
  claiming,
  onClaim,
  fmtVtru,
  onDismiss,
  stakeControl = null,
  hitCredits = null,
  actionsEnd = null,
}) {
  const [bState, setB] = useState(0);
  const [pick, setPick] = useState(null); // bucket the player has chosen, before betting
  // With a bet on the ticket the slider is frozen at the slope it was placed
  // with (remembered by the browser); otherwise it is the player's aim.
  const b = entry && Number.isFinite(entry.b) ? entry.b : bState;

  const inGame = !!entry && !result;
  const settled = !!result;
  const { start, points, trailing, phase, elapsed, lockS } = win;
  const n = GAME_S;

  const confetti = useMemo(
    () =>
      result?.win
        ? Array.from({ length: 90 }, (_, i) => ({
            id: i,
            left: rnd(i, 1) * 100,
            delay: rnd(i, 2) * 0.4,
            duration: 1.6 + rnd(i, 3) * 1.2,
            size: 5 + rnd(i, 4) * 6,
            color: CONFETTI_COLORS[Math.floor(rnd(i, 5) * CONFETTI_COLORS.length)],
            spin: 360 + rnd(i, 6) * 540,
            drift: -40 + rnd(i, 7) * 80,
          }))
        : null,
    [result]
  );

  // Y range: extent of the points so far with padding. Points only accumulate
  // inside a window, so the range never shrinks mid-game.
  // Scrolling view: the plot always shows the trailing five minutes with the
  // newest point at the right edge; the window start and lock markers slide
  // left as time passes. A settled result shows its window exactly.
  const shownPoints = settled ? result.series : (trailing || points);
  const refStart = settled ? result.start : start;
  const viewEnd = settled ? result.start + n - 1 : Math.floor(win.now);
  const viewStart = viewEnd - (n - 1);
  const [yLo, yHi] = useMemo(() => {
    if (shownPoints.length < 2) return [0, 300];
    let lo = Infinity;
    let hi = -Infinity;
    for (const [, v] of shownPoints) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const pad = Math.max(10, (hi - lo) * 0.12);
    lo -= pad;
    hi += pad;
    if (FEED.range) {
      lo = Math.max(FEED.range[0], lo);
      hi = Math.min(FEED.range[1], hi);
    }
    return [lo, hi];
  }, [shownPoints]);

  // x is an absolute timestamp
  const px = (ts) => PX0 + ((PX1 - PX0) * (ts - viewStart)) / (n - 1);
  const inView = (ts) => ts >= viewStart && ts <= viewEnd;
  const py = (v) => PY0 + ((yHi - v) / (yHi - yLo)) * (PY1 - PY0);

  // The live fit of the points seen so far (or the settled fit).
  const fit = settled ? result.fit : win.liveFit;
  const xbar = fit ? fit.xbar : (n - 1) / 2;
  const ybar = fit ? fit.ybar : (yLo + yHi) / 2;

  // User line pivots through the mean point of the visible series.
  const userA = ybar - b * xbar;
  const userTrend = trendAbsOf(b);
  // The bucket on the ticket is what the contract holds. Before betting, the
  // player picks a bucket directly; their line is drawn through its middle.
  const aimBucket = entry ? entry.bucket : pick === null ? -1 : pick;
  // Live reading = where the window settles if the current slope holds, i.e.
  // the slope projected over the full window (the settled fit's trendAbs
  // already spans the window).
  const liveTrend = fit ? (settled ? fit.trendAbs : trendAbsOf(fit.b)) : null;
  const liveBucket = liveTrend === null ? -1 : bucketOf(liveTrend, thresholds);
  const trueBucket = settled ? result.bucket : -1;

  // Five equal boxes; index matches BUCKET_NAMES (0 = Crash bottom ... 4 = Moon top).
  const BOX_H = (PY1 - PY0) / 5;
  const boxes = Array.from({ length: 5 }, (_, i) => [PY1 - (i + 1) * BOX_H, PY1 - i * BOX_H]);
  const edges = stripEdges(thresholds);

  // Piecewise-linear projection of a trendAbs value onto the strip, so a
  // pointer always lands inside the bucket it would resolve to.
  const trendToStripY = (t) => {
    const c = Math.max(edges[0], Math.min(edges[5], t));
    let i = 0;
    while (i < 4 && c >= edges[i + 1]) i++;
    const frac = (c - edges[i]) / (edges[i + 1] - edges[i]);
    return PY1 - (i + frac) * BOX_H;
  };

  // Trend cone: each threshold is a ray through the fit's pivot with that
  // trend's slope; the wedges between rays are the buckets, drawn from the
  // pivot to the right edge so the dashed line visibly sits in its bucket.
  const pivotTs = refStart + xbar;
  const rayY = (t, ts) => py(ybar + (t / (n - 1)) * (ts - pivotTs));
  const coneX0 = Math.max(PX0, px(pivotTs));
  const coneTs0 = Math.max(viewStart, pivotTs);
  const wedges = BUCKET_NAMES.map((_, i) => {
    const hiT = i === 4 ? null : thresholds[i];
    const loT = i === 0 ? null : thresholds[i - 1];
    const yTopEnd = hiT === null ? PY0 : rayY(hiT, viewEnd);
    const yBotEnd = loT === null ? PY1 : rayY(loT, viewEnd);
    const yTop0 = hiT === null ? PY0 : rayY(hiT, coneTs0);
    const yBot0 = loT === null ? PY1 : rayY(loT, coneTs0);
    return `${coneX0},${yTop0} ${PX1},${yTopEnd} ${PX1},${yBotEnd} ${coneX0},${yBot0}`;
  });

  // The side strip continues the cone: box edges are where the rays reach
  // the strip, so the dashed line runs straight into its bucket.
  const tsAtX = (x) => viewStart + ((x - PX0) / (PX1 - PX0)) * (n - 1);
  const clampY = (y) => Math.max(PY0, Math.min(PY1, y));
  const rawStrip = BUCKET_NAMES.map((_, i) => {
    if (!fit) return boxes[i];
    const top = i === 4 ? PY0 : clampY(rayY(thresholds[i], tsAtX(BX0)));
    const bottom = i === 0 ? PY1 : clampY(rayY(thresholds[i - 1], tsAtX(BX0)));
    return [top, bottom];
  });
  // Every bucket keeps a clickable box: each gets at least MIN_BOX px, taken from the taller ones, then
  // they are stacked bottom (Crash) to top (Moon) in their original proportions.
  const MIN_BOX = 28;
  const stripBoxes = (() => {
    const avail = PY1 - PY0;
    const h = rawStrip.map(([t, b]) => Math.max(MIN_BOX, b - t));
    const excess = h.reduce((a, x) => a + x, 0) - avail;
    if (excess > 0) {
      const room = h.reduce((a, x) => a + (x - MIN_BOX), 0);
      const k = room > 0 ? Math.max(0, 1 - excess / room) : 0;
      for (let i = 0; i < h.length; i++) h[i] = MIN_BOX + (h[i] - MIN_BOX) * k;
    }
    const out = [];
    let y = PY1;
    for (let i = 0; i < h.length; i++) {
      out[i] = [y - h[i], y];
      y -= h[i];
    }
    return out;
  })();

  const canPick = !settled && !inGame && !betting && phase === 'open';
  const showAim = inGame || settled || aimBucket >= 0;
  const choose = (i) => {
    if (!canPick) return;
    const e = stripEdges(thresholds);
    setPick(i);
    setB((e[i] + e[i + 1]) / 2 / (GAME_S - 1)); // slope whose window trend is the bucket's middle
  };
  // A fresh pick each game, preselected to the bucket the live trend is in, so the bet button is ready
  // the moment the page loads. One click on another bucket changes it.
  useEffect(() => {
    setPick(null);
  }, [start]);
  useEffect(() => {
    if (pick === null && canPick && liveBucket >= 0) choose(liveBucket);
  }, [pick, canPick, liveBucket]); // eslint-disable-line react-hooks/exhaustive-deps
  // Two different marks: the bucket the trend is in (live, or the settled answer) is FILLED in its colour;
  // the player's pick is OUTLINED in ember, the colour of their line. One bucket can carry both.
  const isLive = (i) => (settled ? i === trueBucket : i === liveBucket);
  const isPick = (i) => showAim && i === aimBucket;
  const boxFill = (i) => bucketRgba(i, isLive(i) ? 0.38 : 0.06);
  const boxStroke = (i) => (isPick(i) ? EMBER : bucketRgba(i, isLive(i) ? 0.9 : 0.4));
  const boxStrokeW = (i) => (isPick(i) ? 3 : 1.5);
  const boxText = (i) => (isLive(i) || isPick(i) ? '#ffffff' : bucketRgba(i, 0.9));
  const liveTag = settled ? 'RESULT' : 'LIVE';

  const progress = settled ? 1 : Math.max(0, Math.min(1, elapsed / n));
  const lockFrac = lockS / n;
  const lastPt = shownPoints.length ? shownPoints[shownPoints.length - 1] : null;

  const liveLineColor = liveBucket >= 0 ? bucketRgba(liveBucket, 0.95) : '#8fa0ba';

  let phaseText;
  if (settled) phaseText = result.void ? 'Game void — oracle gap, no result posted' : `Settled ${fmtUtc(result.start)} game`;
  else if (phase === 'open') phaseText = `Betting closes in ${fmtClock(lockS - elapsed)}`;
  else if (phase === 'locked') phaseText = `Locked — resolves in ${fmtClock(GAME_S - elapsed)}`;
  else phaseText = 'Settling…';

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes ptg-confetti-fall {
          0% { transform: translate(0, -20px) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--drift), 340px) rotate(var(--spin)); opacity: 0; }
        }
        @keyframes ptg-live-pulse {
          0% { r: 3; opacity: 1; }
          100% { r: 9; opacity: 0; }
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-baseline flex-wrap gap-2 mb-1" style={{ fontFamily: FONT, fontSize: '1.1rem' }}>
        <span style={{ color: '#8fa0ba' }}>
          <span style={{ color: SIGNAL }}>{FEED.name}</span> &middot; game {fmtUtc(refStart)} &middot;{' '}
          {settled ? `${shownPoints.length} points` : `second ${Math.min(n, Math.floor(elapsed))} / ${n}`}
        </span>
        <span>
          {inGame && phase === 'open' ? (
            <>
              <span style={{ color: EMBER, fontWeight: 600 }}>stake back + {fmtVtru(entry.credit)} credits</span>{' '}
              <span style={{ color: '#8fa0ba' }}>if {BUCKET_NAMES[entry.bucket]} hits</span>
            </>
          ) : (
            <span style={{ color: '#8fa0ba' }}>{phaseText}</span>
          )}
        </span>
      </div>

      {[
        { withStrip: true, id: 'd', cls: 'd-none d-md-block' },
        { withStrip: false, id: 'm', cls: 'd-md-none' },
      ].map(({ withStrip, id, cls }) => (
        <svg
          key={id}
          className={cls}
          viewBox={withStrip ? '0 0 850 332' : '0 0 620 332'}
          role="img"
          aria-label="Live AI Wars Battle Momentum with the OLS trend and outcome buckets"
          style={{ width: '100%', height: 'auto' }}
        >
          <defs>
            <clipPath id={`game-plot-${id}`}>
              <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} />
            </clipPath>
            <pattern id={`game-hatch-${id}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="4" height="8" fill="rgba(240,149,79,0.18)" />
            </pattern>
            <linearGradient id={`game-prog-${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0b5cff" />
              <stop offset="1" stopColor="#2d8cff" />
            </linearGradient>
          </defs>
          <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

          {/* bucket wedges and threshold rays */}
          {fit && (
            <g clipPath={`url(#game-plot-${id})`}>
              {wedges.map((pts, i) => (
                <polygon key={`w${i}`} points={pts} fill={bucketRgba(i, isLive(i) ? 0.28 : isPick(i) ? 0.16 : 0.09)} />
              ))}
              {thresholds.map((t, i) => (
                <line
                  key={`r${i}`}
                  x1={PX0}
                  y1={rayY(t, viewStart)}
                  x2={PX1}
                  y2={rayY(t, viewEnd)}
                  stroke="rgba(238,243,251,0.22)"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* the locked runout: last 20% of the window */}
          {/* outcome buckets: side strip on wide screens only */}
          {withStrip && BUCKET_NAMES.map((name, i) => {
            const [top, bottom] = stripBoxes[i];
            const h = bottom - top;
            if (h < 1) return null;
            const fs = h >= 26 ? 19 : h >= 14 ? 12 : 0;
            return (
              <g
                key={name}
                className={canPick ? 'aw-bucket-pick' : undefined}
                onClick={() => choose(i)}
                role={canPick ? 'button' : undefined}
                aria-label={canPick ? `Pick ${name}` : undefined}
                aria-pressed={canPick ? pick === i : undefined}
              >
                <rect x={BX0} y={top} width={BX1 - BX0} height={h} rx={h >= 12 ? 6 : 2} fill={boxFill(i)} stroke={boxStroke(i)} strokeWidth={boxStrokeW(i)} />
                {h >= 26 && isPick(i) && (
                  <text x={BX0 + 8} y={top + 13} fill={EMBER} fontSize="10" fontWeight="700" letterSpacing="1.5" fontFamily={FONT}>
                    {inGame || settled ? 'YOUR BET' : 'PICK'}
                  </text>
                )}
                {h >= 26 && isLive(i) && (
                  <text x={BX1 - 8} y={top + 13} textAnchor="end" fill="rgba(255,255,255,0.75)" fontSize="10" fontWeight="700" letterSpacing="1.5" fontFamily={FONT}>
                    {liveTag}
                  </text>
                )}
                {fs > 0 && (
                  <text x={(BX0 + BX1) / 2} y={(top + bottom) / 2 + fs * 0.35} textAnchor="middle" fill={boxText(i)} fontSize={fs} fontWeight="600" fontFamily={FONT}>
                    {name}
                  </text>
                )}
                {h >= 30 && i > 0 && (
                  <text x={BX1 - 6} y={bottom - 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize="11" fontFamily={FONT}>
                    {fmtAbs(edges[i], 1)}
                  </text>
                )}
              </g>
            );
          })}

          {/* rays and the fit line continue across the gap into the strip */}
          {withStrip && fit && (
            <>
              {thresholds.map((t, i) => (
                <line key={`rg${i}`} x1={PX1} y1={rayY(t, viewEnd)} x2={BX0} y2={rayY(t, tsAtX(BX0))} stroke="rgba(238,243,251,0.16)" strokeWidth="1" />
              ))}
              <line
                x1={PX1}
                y1={py(fit.a + fit.b * (viewEnd - refStart))}
                x2={BX0 - 2}
                y2={py(fit.a + fit.b * (tsAtX(BX0 - 2) - refStart))}
                stroke={settled ? '#eef3fb' : liveLineColor}
                strokeWidth="2.5"
                strokeDasharray="5 6"
                opacity="0.9"
              />
            </>
          )}

          {/* the series */}
          <g clipPath={`url(#game-plot-${id})`}>
            {shownPoints.length > 1 && (
              <polyline
                points={shownPoints.map(([ts, v]) => `${px(ts).toFixed(1)},${py(v).toFixed(1)}`).join(' ')}
                fill="none"
                stroke="rgba(45,140,255,0.85)"
                strokeWidth="1.5"
              />
            )}
            {lastPt && (
              <>
                <circle cx={px(lastPt[0])} cy={py(lastPt[1])} r="3" fill={settled ? EMBER : SIGNAL} />
                {!settled && (
                  <circle cx={px(lastPt[0])} cy={py(lastPt[1])} r="3" fill="none" stroke={SIGNAL} strokeWidth="1.5" style={{ animation: 'ptg-live-pulse 1s ease-out infinite' }} />
                )}
              </>
            )}
          </g>

          {/* live (or settled) OLS line, colored by the bucket it is in right now */}
          {fit && (
            <>
              <g clipPath={`url(#game-plot-${id})`}>
                <line x1={PX0} y1={py(fit.a + fit.b * (viewStart - refStart))} x2={PX1} y2={py(fit.a + fit.b * (viewEnd - refStart))} stroke={settled ? '#eef3fb' : liveLineColor} strokeWidth="2.5" strokeDasharray="5 6" />
              </g>
              {inView(refStart + xbar) && (
                <circle cx={px(refStart + xbar)} cy={py(ybar)} r="4.5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
              )}
            </>
          )}

          {/* candidate line and its projection into the strip */}
          {showAim && (
            <>
              <g clipPath={`url(#game-plot-${id})`}>
                <line x1={PX0} y1={py(userA + b * (viewStart - refStart))} x2={PX1} y2={py(userA + b * (viewEnd - refStart))} stroke={EMBER} strokeWidth="2.5" />
              </g>
              {withStrip && (
                <line
                  x1={PX1}
                  y1={py(userA + b * (viewEnd - refStart))}
                  x2={BX0 - 2}
                  y2={py(userA + b * (tsAtX(BX0 - 2) - refStart))}
                  stroke={EMBER}
                  strokeWidth="2.5"
                  opacity="0.9"
                />
              )}
            </>
          )}

          <text x={PX0} y={276} fill="rgba(255,255,255,0.55)" fontSize="20" fontFamily={FONT}>
            {settled ? fmtUtc(viewStart) : '-5 min'}
          </text>
          <text x={PX1} y={276} textAnchor="end" fill="rgba(255,255,255,0.55)" fontSize="20" fontFamily={FONT}>
            {settled ? fmtUtc(viewEnd) : 'now'}
          </text>
          {/* where we are in the 5-minute game: betting, then the locked runout */}
          <rect x={PX0} y={PB0} width={PX1 - PX0} height={PBH} fill="rgba(6,11,20,0.9)" stroke="#1b2a44" strokeWidth="1" />
          <rect x={PX0 + (PX1 - PX0) * lockFrac} y={PB0} width={(PX1 - PX0) * (1 - lockFrac)} height={PBH} fill={`url(#game-hatch-${id})`} />
          {progress > 0 && (
            <>
              <rect x={PX0} y={PB0} width={(PX1 - PX0) * Math.min(progress, lockFrac)} height={PBH} fill={`url(#game-prog-${id})`} />
              {progress > lockFrac && (
                <rect x={PX0 + (PX1 - PX0) * lockFrac} y={PB0} width={(PX1 - PX0) * (progress - lockFrac)} height={PBH} fill={EMBER} opacity="0.85" />
              )}
              {!settled && (
                <rect x={PX0 + (PX1 - PX0) * progress - 1} y={PB0 - 3} width="2" height={PBH + 6} fill="#eef3fb" />
              )}
            </>
          )}
          <rect x={PX0 + (PX1 - PX0) * lockFrac - 1} y={PB0 - 4} width="2" height={PBH + 8} fill="rgba(238,243,251,0.6)" />
          <text x={PX0 + (PX1 - PX0) * lockFrac} y={PB0 - 8} textAnchor="middle" fill="#8fa0ba" fontSize="12" letterSpacing="2" fontFamily={FONT}>
            LOCK
          </text>
          <text x={PX0} y={PB0 + PBH + 20} fill="#8fa0ba" fontSize="14" fontFamily={FONT}>
            game {fmtUtc(refStart)}
          </text>
          <text x={(PX0 + PX1) / 2} y={PB0 + PBH + 20} textAnchor="middle" fill="#b9c5da" fontSize="14" fontFamily={FONT}>
            {settled ? 'settled' : phase === 'open' ? `betting open · closes in ${fmtClock(lockS - elapsed)}` : phase === 'locked' ? `locked · resolves in ${fmtClock(n - elapsed)}` : 'settling…'}
          </text>
          <text x={PX1} y={PB0 + PBH + 20} textAnchor="end" fill="#8fa0ba" fontSize="14" fontFamily={FONT}>
            {fmtUtc(refStart + n)}
          </text>

          <text x={PX0 - 8} y={PY0 + 6} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize="13" fontFamily={FONT}>
            {Math.round(yHi)}
          </text>
          <text x={PX0 - 8} y={PY1} textAnchor="end" fill="rgba(255,255,255,0.45)" fontSize="13" fontFamily={FONT}>
            {Math.round(yLo)}
          </text>
        </svg>
      ))}

      {/* The pick: five bucket buttons, on every screen size (the strip beside the chart is clickable too). */}
      <div className="aw-pick-row d-flex gap-1 mt-3">
        {BUCKET_NAMES.map((name, i) => (
          <button
            type="button"
            key={name}
            className="flex-fill text-center aw-bucket-btn"
            onClick={() => choose(i)}
            disabled={!canPick}
            aria-pressed={pick === i}
            style={{
              background: boxFill(i),
              border: `${isPick(i) ? 3 : 1.5}px solid ${boxStroke(i)}`,
              borderRadius: '6px',
              padding: '8px 0',
              fontFamily: FONT,
              fontSize: '0.85rem',
              fontWeight: 600,
              color: boxText(i),
            }}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Stake and bet, directly under the chart and buckets. The stake stays in place (locked) while a
          bet is live, so the button never jumps. */}
      <div className="aw-ticket d-flex align-items-center gap-3 flex-wrap mt-3">
        {!settled && stakeControl}
        {settled ? (
          <>
            {result.win && !result.claimed && (
              <button type="button" className="aw-btn" onClick={onClaim} disabled={claiming}>
                {claiming ? 'Claiming…' : `Claim stake + ${fmtVtru(result.credit)} credits`}
              </button>
            )}
            <button type="button" className={`aw-btn${result.win && !result.claimed ? ' aw-btn-ghost' : ''}`} onClick={onDismiss}>
              Back to live
            </button>
          </>
        ) : inGame ? (
          <button type="button" className="aw-btn" disabled>
            {phase === 'open' || phase === 'locked'
              ? `Locked in — ${fmtVtru(entry.amount)} VTRU on ${BUCKET_NAMES[entry.bucket]}`
              : 'Settling…'}
          </button>
        ) : (
          <button type="button" className="aw-btn" onClick={() => onBet(b, aimBucket)} disabled={!canBet || betting || phase !== 'open' || aimBucket < 0}>
            {betting
              ? betting
              : phase !== 'open'
                ? `Next game in ${fmtClock(GAME_S - elapsed)}`
                : aimBucket < 0
                  ? 'Pick a bucket'
                  : `${betLabel} on ${BUCKET_NAMES[aimBucket]}`}
          </button>
        )}
        {actionsEnd && <span className="ms-auto">{actionsEnd}</span>}
      </div>

      <div className="text-center mt-3" style={{ fontFamily: FONT, minHeight: '1.6em' }}>
        {settled ? (
          result.void ? (
            <span style={{ color: '#b9c5da' }}>The oracle stored too few points for this window. The game was voided and your stake returned.</span>
          ) : (
            <span style={{ color: '#b9c5da' }}>
              OLS answer <span style={{ color: '#eef3fb' }}>{result.fit ? fmtAbs(result.fit.trendAbs) : '…'}</span> ({BUCKET_NAMES[trueBucket]}) &middot;
              your bet <span style={{ color: EMBER }}>{fmtVtru(result.amount)} VTRU</span> on {BUCKET_NAMES[result.betBucket]} &middot;{' '}
              {result.win ? (
                <strong style={{ color: '#eef3fb' }}>
                  Hit &mdash; {result.claimed ? `stake returned, +${fmtVtru(result.credit)} credits` : `stake + ${fmtVtru(result.credit)} credits to claim`}
                </strong>
              ) : (
                <span>miss &mdash; stake burned</span>
              )}
            </span>
          )
        ) : (
          <span style={{ color: '#8fa0ba' }}>
            Live OLS{' '}
            <span style={{ color: liveLineColor, fontWeight: 600 }}>
              {liveTrend === null ? '…' : fmtAbs(liveTrend)}
            </span>
            {liveBucket >= 0 ? <> &middot; in <span style={{ color: liveLineColor, fontWeight: 600 }}>{BUCKET_NAMES[liveBucket]}</span></> : null}
            {inGame ? (
              <> &middot; your bet <span style={{ color: EMBER }}>{fmtVtru(entry.amount)} VTRU</span> on {BUCKET_NAMES[entry.bucket]}</>
            ) : showAim ? (
              <>
                {' '}&middot; your pick <span style={{ color: EMBER, fontWeight: 600 }}>{BUCKET_NAMES[aimBucket]}</span>
                {!canBet && phase === 'open' ? (
                  <> &middot; {betHint}</>
                ) : hitCredits ? (
                  <> &middot; a hit earns <span style={{ color: '#eef3fb' }}>{hitCredits}</span> credits</>
                ) : null}
              </>
            ) : canBet && phase === 'open' ? (
              <> &middot; pick the bucket the trend will settle in</>
            ) : (
              <> &middot; {betHint}</>
            )}
          </span>
        )}
      </div>

      {confetti && (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {confetti.map((c) => (
            <span
              key={c.id}
              style={{
                position: 'absolute',
                top: 0,
                left: `${c.left}%`,
                width: `${c.size}px`,
                height: `${c.size * 0.45}px`,
                background: c.color,
                borderRadius: '1px',
                '--drift': `${c.drift}px`,
                '--spin': `${c.spin}deg`,
                animation: `ptg-confetti-fall ${c.duration}s cubic-bezier(0.25,0.6,0.45,1) ${c.delay}s forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
