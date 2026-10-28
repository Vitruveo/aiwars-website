import { sql } from "@/lib/db";

// Mystery AI state in Neon: per-wallet fragment progress and the award list (one shard per twelve-hour
// window). mystery_winners is the first run's rank list (20 prizes, all fulfilled) and is kept for the
// record only.

let ready: Promise<void> | null = null;
export function ensureMysterySchema() {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`CREATE TABLE IF NOT EXISTS mystery_progress (
        address text PRIMARY KEY,
        fragments integer NOT NULL DEFAULT 0,
        turns integer NOT NULL DEFAULT 0,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
      await q`ALTER TABLE mystery_progress ADD COLUMN IF NOT EXISTS last_grant_turn integer NOT NULL DEFAULT 0`;
      await q`CREATE TABLE IF NOT EXISTS mystery_winners (
        address text PRIMARY KEY,
        rank integer NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await q`CREATE TABLE IF NOT EXISTS mystery_awards (
        period integer PRIMARY KEY,
        address text NOT NULL UNIQUE,
        claimed_at timestamptz NOT NULL DEFAULT now(),
        awarded_at timestamptz,
        token_id integer,
        tx text
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

export type Award = { period: number; address: string; claimedAt: string; awarded: boolean; awardedAt: string | null; tokenId: number | null; tx: string | null };
export type Progress = { fragments: number; turns: number; lastGrantTurn: number; award: Award | null };

const toAward = (r: Record<string, unknown>): Award => ({
  period: Number(r.period),
  address: String(r.address),
  claimedAt: String(r.claimed_at),
  awarded: r.awarded_at != null,
  awardedAt: r.awarded_at == null ? null : String(r.awarded_at),
  tokenId: r.token_id == null ? null : Number(r.token_id),
  tx: r.tx == null ? null : String(r.tx),
});

export async function readProgress(address: string | null): Promise<Progress> {
  await ensureMysterySchema();
  if (!address) return { fragments: 0, turns: 0, lastGrantTurn: 0, award: null };
  const q = sql();
  const a = address.toLowerCase();
  const rows = await q`SELECT fragments, turns, last_grant_turn FROM mystery_progress WHERE address = ${a}`;
  const win = await q`SELECT * FROM mystery_awards WHERE address = ${a}`;
  return {
    fragments: rows[0] ? Number(rows[0].fragments) : 0,
    turns: rows[0] ? Number(rows[0].turns) : 0,
    lastGrantTurn: rows[0] ? Number(rows[0].last_grant_turn) : 0,
    award: win[0] ? toAward(win[0]) : null,
  };
}

export async function bumpTurns(address: string) {
  await ensureMysterySchema();
  await sql()`INSERT INTO mystery_progress (address, turns) VALUES (${address.toLowerCase()}, 1)
    ON CONFLICT (address) DO UPDATE SET turns = mystery_progress.turns + 1, updated_at = now()`;
}

// Sets the bit and stamps the exchange it was earned on (used by the pacing gate in the chat route).
export async function grantFragment(address: string, n: number): Promise<number> {
  await ensureMysterySchema();
  const bit = 1 << (n - 1);
  const rows = await sql()`INSERT INTO mystery_progress (address, fragments) VALUES (${address.toLowerCase()}, ${bit})
    ON CONFLICT (address) DO UPDATE SET fragments = mystery_progress.fragments | ${bit}, last_grant_turn = mystery_progress.turns, updated_at = now()
    RETURNING fragments`;
  return Number(rows[0].fragments);
}

// Newest windows first.
export async function readAwards(limit = 20): Promise<Award[]> {
  await ensureMysterySchema();
  const rows = await sql()`SELECT * FROM mystery_awards ORDER BY period DESC LIMIT ${limit}`;
  return rows.map(toAward);
}

export async function awardForPeriod(period: number): Promise<Award | null> {
  await ensureMysterySchema();
  const rows = await sql()`SELECT * FROM mystery_awards WHERE period = ${period}`;
  return rows[0] ? toAward(rows[0]) : null;
}

// Takes the window for this wallet if nobody has it yet. "taken" when another wallet got there first.
export async function claimPeriod(address: string, period: number): Promise<Award | "taken"> {
  await ensureMysterySchema();
  const a = address.toLowerCase();
  const rows = await sql()`INSERT INTO mystery_awards (period, address) VALUES (${period}, ${a})
    ON CONFLICT (period) DO NOTHING RETURNING *`;
  return rows[0] ? toAward(rows[0]) : "taken";
}

// Fulfilment: called by scripts/mystery-award.mjs after the shard is minted.
export async function markAwarded(period: number, tokenId: number, tx: string): Promise<Award | null> {
  await ensureMysterySchema();
  const rows = await sql()`UPDATE mystery_awards SET awarded_at = now(), token_id = ${tokenId}, tx = ${tx} WHERE period = ${period} RETURNING *`;
  return rows[0] ? toAward(rows[0]) : null;
}

// Tokens given through the Archive are Tier 5 Survivor shards whatever their id; the metadata route asks.
// Returns the token's 1-based position among given shards, or null if it was sold or gifted elsewhere.
export async function givenSerial(tokenId: number): Promise<number | null> {
  await ensureMysterySchema();
  const rows = await sql()`SELECT count(*)::int AS n FROM mystery_awards WHERE token_id IS NOT NULL AND token_id <= ${tokenId}
    AND EXISTS (SELECT 1 FROM mystery_awards WHERE token_id = ${tokenId})`;
  const n = rows[0] ? Number(rows[0].n) : 0;
  return n > 0 ? n : null;
}
