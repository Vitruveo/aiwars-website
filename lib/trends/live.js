// Server-side access to the TrendPulse oracle for the live game: window
// series fetches and quintile calibration of the bucket thresholds.

import { SOURCE, GAME_S, FALLBACK_THRESHOLDS, MIN_SETTLE_POINTS, TRENDPULSE_BASE, tsOls } from './gamemath';
import { kvGet, kvSet } from './kv';

const CAL_DAYS = 3; // history used for quintiles (oracle serves max 1 day per call)
const CAL_TTL_S = 900; // recalibrate every 15 min (the simulated feed is still being tuned)
const CAL_KEY = `trends:cal:${SOURCE}`;

export async function fetchSeries(fromS, toS) {
  const res = await fetch(`${TRENDPULSE_BASE}/series?source=${SOURCE}&from=${fromS}&to=${toS}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`oracle series ${res.status}`);
  const d = await res.json();
  if (!Array.isArray(d.points)) throw new Error(d.error || 'oracle series malformed');
  return d.points;
}

// Quintile edges of trendAbs over every complete 5-minute window in the
// last CAL_DAYS. Windows with too few points are skipped.
async function computeCalibration() {
  const now = Math.floor(Date.now() / 1000);
  const windows = new Map();
  for (let d = 0; d < CAL_DAYS; d++) {
    const to = now - d * 86400;
    const from = to - 86400;
    let pts;
    try {
      pts = await fetchSeries(from, to);
    } catch (e) {
      break; // older days may not exist yet
    }
    if (!pts.length) break;
    for (const p of pts) {
      const k = Math.floor(p[0] / GAME_S) * GAME_S;
      if (k + GAME_S > now) continue; // current window is incomplete
      let w = windows.get(k);
      if (!w) windows.set(k, (w = []));
      w.push(p);
    }
  }
  const vals = [];
  for (const w of windows.values()) {
    if (w.length < MIN_SETTLE_POINTS) continue;
    w.sort((x, y) => x[0] - y[0]);
    const fit = tsOls(w);
    if (fit) vals.push(fit.trendAbs);
  }
  vals.sort((x, y) => x - y);
  if (vals.length < 30) return null;
  const q = (p) => vals[Math.min(vals.length - 1, Math.floor(p * (vals.length - 1)))];
  return {
    thresholds: [0.2, 0.4, 0.6, 0.8].map((p) => Math.round(q(p) * 100) / 100),
    windows: vals.length,
    calibratedAt: now,
  };
}

let memo = null; // { value, expiresAt }
let inflight = null;

// Calibration with three layers: process memo, the shared kv table, fresh compute. Falls back to
// measured constants.
export async function getCalibration() {
  const now = Math.floor(Date.now() / 1000);
  if (memo && memo.expiresAt > now) return memo.value;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const raw = await kvGet(CAL_KEY).catch(() => null);
      if (raw) {
        const v = JSON.parse(raw);
        memo = { value: v, expiresAt: now + 60 };
        return v;
      }
      let v = null;
      try {
        v = await computeCalibration();
      } catch (e) {
        console.error('[trends] calibration failed:', e.message);
      }
      if (!v) v = { thresholds: FALLBACK_THRESHOLDS, windows: 0, calibratedAt: null, fallback: true };
      if (!v.fallback) await kvSet(CAL_KEY, JSON.stringify(v), { ttlMs: CAL_TTL_S * 1000 }).catch(() => {});
      memo = { value: v, expiresAt: now + 60 };
      return v;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
