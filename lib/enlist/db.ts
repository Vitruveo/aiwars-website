import { sql, ensureSchema } from "@/lib/db";
import type { Dispatch, Gender, Survivor } from "@/lib/enlist/profile";

// Enlist state in Neon: one survivor row per shard (portrait bytes inline, WebP) and one dispatch per UTC day.

let ready: Promise<void> | null = null;
export function ensureEnlistSchema() {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`CREATE TABLE IF NOT EXISTS survivors (
        token_id integer PRIMARY KEY,
        name text NOT NULL,
        role text NOT NULL,
        origin text NOT NULL,
        before_line text NOT NULL DEFAULT '',
        look_line text NOT NULL DEFAULT '',
        epithet text NOT NULL DEFAULT '',
        backstory text NOT NULL,
        visual text NOT NULL,
        tier integer NOT NULL,
        rank text NOT NULL,
        sector text NOT NULL,
        owner text NOT NULL,
        portrait bytea,
        thumb bytea,
        portrait_v integer NOT NULL DEFAULT 0,
        regens integer NOT NULL DEFAULT 0,
        featured_count integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      // Every survivor enlisted before this column existed is a man.
      await q`ALTER TABLE survivors ADD COLUMN IF NOT EXISTS gender text NOT NULL DEFAULT 'man'`;
      await q`CREATE TABLE IF NOT EXISTS dispatches (
        day date PRIMARY KEY,
        status text NOT NULL DEFAULT 'pending',
        title text NOT NULL DEFAULT '',
        body text NOT NULL DEFAULT '',
        momentum text NOT NULL DEFAULT '',
        featured integer[] NOT NULL DEFAULT '{}',
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

type Row = Record<string, unknown>;

const toSurvivor = (r: Row): Survivor => ({
  tokenId: Number(r.token_id),
  name: String(r.name),
  role: String(r.role),
  origin: String(r.origin),
  epithet: String(r.epithet),
  gender: r.gender === "woman" ? "woman" : "man",
  backstory: String(r.backstory),
  tier: Number(r.tier),
  rank: String(r.rank),
  sector: String(r.sector),
  owner: String(r.owner),
  portraitV: Number(r.portrait_v),
  regens: Number(r.regens),
  createdAt: new Date(String(r.created_at)).toISOString(),
});

const COLS = "token_id, name, role, origin, epithet, gender, backstory, tier, rank, sector, owner, portrait_v, regens, created_at";

export async function listSurvivors(): Promise<Survivor[]> {
  await ensureEnlistSchema();
  const rows = await sql().query(`SELECT ${COLS} FROM survivors WHERE portrait IS NOT NULL ORDER BY created_at DESC`);
  return (rows as Row[]).map(toSurvivor);
}

export async function getSurvivor(tokenId: number): Promise<(Survivor & { visual: string }) | null> {
  await ensureEnlistSchema();
  const rows = (await sql().query(`SELECT ${COLS}, visual FROM survivors WHERE token_id = $1`, [tokenId])) as Row[];
  return rows[0] ? { ...toSurvivor(rows[0]), visual: String(rows[0].visual) } : null;
}

export async function insertSurvivor(s: {
  tokenId: number; name: string; role: string; origin: string; before: string; look: string; epithet: string;
  gender: Gender; backstory: string; visual: string; tier: number; rank: string; sector: string; owner: string;
}) {
  await ensureEnlistSchema();
  const rows = await sql()`INSERT INTO survivors (token_id, name, role, origin, before_line, look_line, epithet, gender, backstory, visual, tier, rank, sector, owner)
    VALUES (${s.tokenId}, ${s.name}, ${s.role}, ${s.origin}, ${s.before}, ${s.look}, ${s.epithet}, ${s.gender}, ${s.backstory}, ${s.visual}, ${s.tier}, ${s.rank}, ${s.sector}, ${s.owner})
    ON CONFLICT (token_id) DO NOTHING RETURNING token_id`;
  return rows.length > 0;
}

// A survivor row without a portrait is an enlistment whose image failed; it may be finished or retried.
export async function survivorExists(tokenId: number): Promise<{ hasPortrait: boolean } | null> {
  await ensureEnlistSchema();
  const rows = await sql()`SELECT portrait IS NOT NULL AS has FROM survivors WHERE token_id = ${tokenId}`;
  return rows[0] ? { hasPortrait: Boolean(rows[0].has) } : null;
}

// Drops a failed enlistment so the holder can try again. `stale` only removes one left by a crashed request.
export async function deleteSurvivor(tokenId: number, stale = false) {
  if (stale) await sql()`DELETE FROM survivors WHERE token_id = ${tokenId} AND portrait IS NULL AND created_at < now() - interval '3 minutes'`;
  else await sql()`DELETE FROM survivors WHERE token_id = ${tokenId} AND portrait IS NULL`;
}

export async function savePortrait(tokenId: number, portrait: Buffer, thumb: Buffer, regen: boolean) {
  await sql()`UPDATE survivors SET portrait = ${portrait}, thumb = ${thumb}, portrait_v = portrait_v + 1,
    regens = regens + ${regen ? 1 : 0} WHERE token_id = ${tokenId}`;
}

export async function readPortrait(tokenId: number, thumb: boolean): Promise<Buffer | null> {
  await ensureEnlistSchema();
  const rows = thumb
    ? await sql()`SELECT thumb AS img FROM survivors WHERE token_id = ${tokenId}`
    : await sql()`SELECT portrait AS img FROM survivors WHERE token_id = ${tokenId}`;
  const img = rows[0]?.img;
  if (!img) return null;
  return typeof img === "string" ? Buffer.from(img.replace(/^\\x/, ""), "hex") : Buffer.from(img as Uint8Array);
}

// ------------------------------------------------------------------ dispatches

const toDispatch = (r: Row): Dispatch => ({
  day: new Date(String(r.day)).toISOString().slice(0, 10),
  title: String(r.title),
  body: String(r.body),
  momentum: String(r.momentum),
  featured: ((r.featured as number[]) ?? []).map(Number),
});

export async function listDispatches(limit = 7): Promise<Dispatch[]> {
  await ensureEnlistSchema();
  const rows = (await sql().query(`SELECT day, title, body, momentum, featured FROM dispatches WHERE status = 'done' ORDER BY day DESC LIMIT $1`, [limit])) as Row[];
  return rows.map(toDispatch);
}

// Claims a day for writing. Only the first caller gets true; a claim left pending for 10 minutes is reclaimable.
export async function claimDay(day: string) {
  await ensureEnlistSchema();
  const ins = await sql()`INSERT INTO dispatches (day) VALUES (${day}) ON CONFLICT (day) DO NOTHING RETURNING day`;
  if (ins.length > 0) return true;
  const stale = await sql()`UPDATE dispatches SET created_at = now() WHERE day = ${day} AND status = 'pending'
    AND created_at < now() - interval '10 minutes' RETURNING day`;
  return stale.length > 0;
}

export async function finishDay(day: string, d: { title: string; body: string; momentum: string; featured: number[] }) {
  await sql()`UPDATE dispatches SET status = 'done', title = ${d.title}, body = ${d.body}, momentum = ${d.momentum}, featured = ${d.featured}
    WHERE day = ${day}`;
  if (d.featured.length) await sql()`UPDATE survivors SET featured_count = featured_count + 1 WHERE token_id = ANY(${d.featured})`;
}

export async function releaseDay(day: string) {
  await sql()`DELETE FROM dispatches WHERE day = ${day} AND status = 'pending'`;
}

// Candidates for a dispatch: everyone with a portrait, least featured first.
export async function dispatchCandidates() {
  await Promise.all([ensureEnlistSchema(), ensureSchema()]);
  const rows = (await sql()`SELECT s.token_id, s.name, s.role, s.origin, s.epithet, s.gender, s.rank, s.sector, s.owner, s.featured_count,
      EXISTS (SELECT 1 FROM beacons b WHERE b.token_id = s.token_id) AS beacon
    FROM survivors s WHERE s.portrait IS NOT NULL`) as Row[];
  return rows.map((r) => ({
    tokenId: Number(r.token_id),
    name: String(r.name),
    role: String(r.role),
    origin: String(r.origin),
    epithet: String(r.epithet),
    gender: String(r.gender),
    rank: String(r.rank),
    sector: String(r.sector),
    owner: String(r.owner),
    featuredCount: Number(r.featured_count),
    beacon: Boolean(r.beacon),
  }));
}

export async function appearances(tokenId: number): Promise<{ day: string; title: string }[]> {
  await ensureEnlistSchema();
  const rows = (await sql()`SELECT day, title FROM dispatches WHERE status = 'done' AND ${tokenId} = ANY(featured) ORDER BY day DESC LIMIT 30`) as Row[];
  return rows.map((r) => ({ day: new Date(String(r.day)).toISOString().slice(0, 10), title: String(r.title) }));
}
