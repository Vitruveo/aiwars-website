// Pure game math and rules shared by the API routes (server) and the chart
// (client). No dependencies.
//
// AIWars Trends is a live game on the TrendPulse aiwars-momentum feed (AI
// Wars Battle Momentum, 0-100, one point every 2 seconds). Games are wall-clock
// 5-minute windows: betting is open for the first 80%, the last 20% is a
// locked runout, and the answer is the OLS trend over the whole window,
// measured as trendAbs = slope x span (momentum points gained or lost across
// the window). Buckets are quintiles of recent history (see live.js).

export const SOURCE = 'aiwars-momentum';
export const FEED = {
  source: SOURCE,
  name: 'BATTLE MOMENTUM',
  cadenceS: 2,
  note: 'Battle Momentum is simulated AI Wars telemetry until the game\u2019s live feed is wired in.',
  unit: '', // momentum points
  range: [0, 100], // the index is bounded; the chart never pads past it
};
export const GAME_S = 300; // window length, seconds
export const LOCK_S = Math.floor(GAME_S * 0.8); // betting closes at 240s
export const SETTLE_DELAY_S = 6; // wait for the oracle to store the final seconds
export const START_POINTS = 600;
export const POINTS_PER_SEC = 2; // 600 -> 120 over the 240s betting window
export const TOLERANCE = 0.02; // win = slope within 2% of the slider's full range
export const MIN_SETTLE_POINTS = 40; // of ~150 expected; fewer stored points = void game

// Fallback quintile edges (trendAbs, momentum points over the window)
// measured on 2026-10-24 (late) from 24h / 287 windows of the regenerated
// aiwars-momentum history; the server recalibrates from the oracle.
export const FALLBACK_THRESHOLDS = [-34.5, -10.8, 11.9, 34.2];

export function gameStartFor(nowS) {
  return Math.floor(nowS / GAME_S) * GAME_S;
}

export function gameIdFor(start) {
  return `${SOURCE}:${start}`;
}

export function parseGameId(id) {
  const m = /^aiwars-momentum:(\d+)$/.exec(id || '');
  return m ? parseInt(m[1], 10) : null;
}

// Timestamp-aware OLS over [ts, value] pairs, x measured in seconds from x0.
// Same definition as the TrendPulse status page and the oracle's trendAbs.
export function tsOls(points, x0) {
  const n = points.length;
  if (n < 2) return null;
  const t0 = x0 ?? points[0][0];
  let xbar = 0;
  let ybar = 0;
  for (const [ts, v] of points) { xbar += ts - t0; ybar += v; }
  xbar /= n;
  ybar /= n;
  let sxx = 0;
  let sxy = 0;
  for (const [ts, v] of points) {
    const dx = ts - t0 - xbar;
    sxx += dx * dx;
    sxy += dx * (v - ybar);
  }
  if (sxx === 0) return null;
  const b = sxy / sxx;
  const a = ybar - b * xbar;
  const span = points[n - 1][0] - points[0][0];
  return { n, xbar, ybar, a, b, span, trendAbs: b * span };
}

// trendAbs of a slope over the full game window.
export function trendAbsOf(b) {
  return b * (GAME_S - 1);
}

// 0 = Crash ... 4 = Moon.
export function bucketOf(trendAbs, thresholds) {
  return thresholds.filter((t) => trendAbs >= t).length;
}

// Outer edges for drawing: one bucket width beyond the first and last edge.
export function stripEdges(thresholds) {
  const [t0, t1, t2, t3] = thresholds;
  return [t0 - (t1 - t0), t0, t1, t2, t3, t3 + (t3 - t2)];
}

// Slider range in momentum points per second: covers the outer edges with headroom.
export function bLimitFor(thresholds) {
  const edges = stripEdges(thresholds);
  const reach = Math.max(Math.abs(edges[0]), Math.abs(edges[5]));
  return (1.4 * reach) / (GAME_S - 1);
}

// Points a win is worth after k seconds of betting (capped at the lock).
export function pointsAt(elapsedS) {
  const k = Math.max(0, Math.min(LOCK_S, Math.floor(elapsedS)));
  return START_POINTS - POINTS_PER_SEC * k;
}

// Phase of a game at server time now (seconds).
export function phaseOf(start, nowS) {
  const e = nowS - start;
  if (e < 0) return 'upcoming';
  if (e < LOCK_S) return 'open';
  if (e < GAME_S) return 'locked';
  if (e < GAME_S + SETTLE_DELAY_S) return 'settling';
  return 'ended';
}

// Bucket names and colours, in bucket order (0 = Crash ... 4 = Moon).
export const BUCKET_NAMES = ['Crash', 'Bear', 'Flat', 'Bull', 'Moon'];
export const BUCKET_COLORS = ['#ef4444', '#f97316', '#a3a3a3', '#4ade80', '#8b5cf6'];
export function bucketRgba(bucket, alpha) {
  const hex = BUCKET_COLORS[bucket];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// TrendPulse public endpoint (CloudFront in front of the oracle's API and live feed).
export const TRENDPULSE_BASE = 'https://d3ulpbw76ladhl.cloudfront.net';
