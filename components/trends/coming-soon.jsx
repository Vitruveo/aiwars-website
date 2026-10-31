// Electric "coming soon" tile shown beside the page intro while the wallet
// and scoring side of the game is parked.
export function ComingSoonBanner() {
  return (
    <div className="aw-electric h-100" role="status">
      <img src="/trends/lightning.gif" alt="" aria-hidden="true" className="aw-electric-art" />
      <div className="aw-electric-veil" />
      <div className="aw-electric-bolt" />
      <div className="aw-electric-inner">
        <p className="aw-kicker aw-kicker-ember mb-2">Archive status &middot; sealed</p>
        <div className="aw-display aw-electric-title">Preview Game Coming Soon</div>
        <p className="aw-electric-sub mb-0">
          Credits, wallets and scoring switch on when the preview opens. The Battle Momentum feed below is live now &mdash; watch the trend switch buckets.
        </p>
      </div>
    </div>
  );
}

const ERC20_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
];

const BUY_LABELS = {
  wallet: 'Confirm in wallet…',
  mining: 'Waiting for confirmation…',
  crediting: 'Crediting…',
};

// The current 5-minute window of the oracle feed, streamed straight from
// TrendPulse: a series fetch on each new window, live ticks over the
// websocket, a periodic refill for gaps, and a 1Hz clock (server-skew
// corrected) that drives phase, elapsed time and the live OLS fit.
// The live fit is over the TRAILING five minutes (reaching back into the
// previous window) so a fresh window has a full-length slope from its first
// second; by the end of the window the trailing span is the window itself.
function useLiveWindow(live) {
  const [state, setState] = useState(null);
  // Server clock skew and lock length live in refs so a refreshed `live`
  // object never tears the stream down: the chart must never blank out.
  const skewRef = useRef(0);
  const lockRef = useRef(240);
  useEffect(() => {
    if (!live) return;
    skewRef.current = live.serverNow - Date.now() / 1000;
    lockRef.current = live.lockS;
  }, [live]);
  const ready = !!live && !!TRENDPULSE_BASE;
  useEffect(() => {
    if (!ready) return undefined;
    const nowS = () => Date.now() / 1000 + skewRef.current;
    let stop = false;
    let ws;
    const cur = { start: null, map: new Map() };

    async function loadWindow(start) {
      try {
        const to = Math.min(Math.floor(nowS()), start + GAME_S - 1);
        const r = await fetch(`${TRENDPULSE_BASE}/series?source=${SOURCE}&from=${start - GAME_S}&to=${to}`);
        const d = await r.json();
        if (stop || cur.start !== start) return;
        for (const p of d.points || []) cur.map.set(p[0], p[1]);
      } catch (e) {
        // next refill retries
      }
    }

    function connect() {
      if (stop) return;
      ws = new WebSocket(`${TRENDPULSE_BASE.replace(/^http/, 'ws')}/feed`);
      ws.onmessage = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'tick' && m.source === SOURCE && cur.start !== null && m.ts >= cur.start - GAME_S) cur.map.set(m.ts, m.value);
        } catch (e) {}
      };
      ws.onclose = () => { if (!stop) setTimeout(connect, 3000); };
      ws.onerror = () => {};
    }
    connect();

    const tick = () => {
      const t = nowS();
      const start = gameStartFor(t);
      if (cur.start !== start) {
        cur.start = start;
        loadWindow(start);
      }
      const floor = Math.floor(t) - GAME_S;
      for (const ts of cur.map.keys()) if (ts < floor) cur.map.delete(ts);
      const trailing = [...cur.map.entries()].sort((a, b) => a[0] - b[0]);
      const points = trailing.filter((p) => p[0] >= start);
      // x measured from the window start, so xbar/a line up with the chart
      const liveFit = trailing.length >= 2 ? tsOls(trailing, start) : null;
      setState({ start, points, trailing, phase: phaseOf(start, t), elapsed: t - start, lockS: lockRef.current, liveFit, now: t });
    };
    tick();
    const clock = setInterval(tick, 1000);
    const refill = setInterval(() => { if (cur.start !== null) loadWindow(cur.start); }, 15000);
    return () => { stop = true; clearInterval(clock); clearInterval(refill); if (ws) ws.close(); };
  }, [ready]);
  return state;
}

function fmtClock(s) {
  const t = Math.max(0, Math.ceil(s));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function TickerRow({ items }) {
  return (
    <>
      {items.map(([label, value, tone]) => (
        <span key={label} className="aw-tick">
          <span className="aw-faint">{label}</span>
          <span className={tone === 'ember' ? 'aw-ember' : tone === 'signal' ? 'aw-signal' : 'aw-ink'}>{value}</span>
        </span>
      ))}
    </>
  );
}

// Live telemetry strip in the AI Wars ticker style, fed by the real window.
function Ticker({ win, thresholds, calibration }) {
  const last = win?.points.length ? win.points[win.points.length - 1][1] : null;
  const fit = win?.liveFit;
  const projected = fit ? trendAbsOf(fit.b) : null;
  const bucket = projected === null ? -1 : bucketOf(projected, thresholds);
  const items = [
    [FEED.name, last === null ? '…' : last.toFixed(0), 'ink'],
    ['LIVE OLS', projected === null ? '…' : fmtAbs(projected), projected !== null && projected >= 0 ? 'signal' : 'ember'],
    ['BUCKET', bucket >= 0 ? BUCKET_NAMES[bucket].toUpperCase() : '…', 'ink'],
    ['PHASE', win ? win.phase.toUpperCase() : '…', win?.phase === 'open' ? 'signal' : 'ember'],
    [win?.phase === 'open' ? 'BETTING CLOSES' : 'NEXT GAME', win ? fmtClock((win.phase === 'open' ? win.lockS : GAME_S) - win.elapsed) : '…', 'ink'],
    ['SIGNAL CADENCE', `${FEED.cadenceS}S`, 'ink'],
    ['MARKET WINDOW', '5M', 'ink'],
    ['CALIBRATION', calibration?.fallback ? 'FALLBACK' : `${calibration?.windows ?? 0} WINDOWS`, calibration?.fallback ? 'ember' : 'ink'],
    ['ARCHIVE STATUS', 'SEALED', 'ember'],
  ];
  return (
    <div className="aw-ticker">
      <div className="aw-marquee">
        <TickerRow items={items} />
        <TickerRow items={items} />
      </div>
    </div>
  );
}

// The tile beside the intro: how a round works, in three lines.
export function PreviewLiveBanner() {
  return (
    <div className="aw-electric h-100" role="status">
      <img src="/trends/lightning.gif" alt="" aria-hidden="true" className="aw-electric-art" />
      <div className="aw-electric-veil" />
      <div className="aw-electric-bolt" />
      <div className="aw-electric-inner">
        <p className="aw-kicker aw-kicker-ember mb-2">Archive status &middot; live</p>
        <div className="aw-display aw-electric-title">Play with VTRU</div>
        <p className="aw-electric-sub mb-0">
          Stake VTRU on the bucket the trend will settle in. A hit returns your stake plus credits toward a Tier 5
          shard; a miss is burned. Bets close four minutes into each game.
        </p>
      </div>
    </div>
  );
}
