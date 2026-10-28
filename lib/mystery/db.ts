import { sql } from "@/lib/db";
import { PRIZE_COUNT } from "@/lib/mystery/win";

// Mystery AI state in Neon: per-wallet fragment progress and the winners list.

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
      await q`CREATE TABLE IF NOT EXISTS mystery_winners (
        address text PRIMARY KEY,
        rank integer NOT NULL UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

export type Progress = { fragments: number; turns: number; rank: number | null; winners: number };

export async function readProgress(address: string | null): Promise<Progress> {
  await ensureMysterySchema();
  const q = sql();
  const [{ count }] = await q`SELECT count(*)::int AS count FROM mystery_winners`;
  if (!address) return { fragments: 0, turns: 0, rank: null, winners: Number(count) };
  const a = address.toLowerCase();
  const rows = await q`SELECT fragments, turns FROM mystery_progress WHERE address = ${a}`;
  const win = await q`SELECT rank FROM mystery_winners WHERE address = ${a}`;
  return {
    fragments: rows[0] ? Number(rows[0].fragments) : 0,
    turns: rows[0] ? Number(rows[0].turns) : 0,
    rank: win[0] ? Number(win[0].rank) : null,
    winners: Number(count),
  };
}

export async function bumpTurns(address: string) {
  await ensureMysterySchema();
  await sql()`INSERT INTO mystery_progress (address, turns) VALUES (${address.toLowerCase()}, 1)
    ON CONFLICT (address) DO UPDATE SET turns = mystery_progress.turns + 1, updated_at = now()`;
}

export async function grantFragment(address: string, n: number): Promise<number> {
  await ensureMysterySchema();
  const bit = 1 << (n - 1);
  const rows = await sql()`INSERT INTO mystery_progress (address, fragments) VALUES (${address.toLowerCase()}, ${bit})
    ON CONFLICT (address) DO UPDATE SET fragments = mystery_progress.fragments | ${bit}, updated_at = now()
    RETURNING fragments`;
  return Number(rows[0].fragments);
}

// Records a winner if there is still room. Returns the rank, or null if the list is full.
export async function recordWinner(address: string): Promise<number | null> {
  await ensureMysterySchema();
  const q = sql();
  const a = address.toLowerCase();
  const existing = await q`SELECT rank FROM mystery_winners WHERE address = ${a}`;
  if (existing[0]) return Number(existing[0].rank);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const rows = await q`INSERT INTO mystery_winners (address, rank)
        SELECT ${a}, count(*) + 1 FROM mystery_winners HAVING count(*) < ${PRIZE_COUNT}
        RETURNING rank`;
      return rows[0] ? Number(rows[0].rank) : null;
    } catch (e) {
      // Two claims racing for the same rank: the unique index rejects one, retry it.
      if (attempt === 2) throw e;
    }
  }
  return null;
}
