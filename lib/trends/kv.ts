import { sql } from "@/lib/db";

// Tiny shared key-value store on Neon for AI Wars Trends: frozen bucket edges per window, the settled
// oracle fit, calibration, result locks and the VNS name cache. Stands in for Redis; every value is a
// string with an optional expiry.

let ready: Promise<void> | null = null;
function ensure() {
  if (!ready) {
    ready = (async () => {
      await sql()`CREATE TABLE IF NOT EXISTS trends_kv (
        key text PRIMARY KEY,
        value text NOT NULL,
        expires_at timestamptz
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

const expiry = (ms?: number) => (ms ? new Date(Date.now() + ms).toISOString() : null);

export async function kvGet(key: string): Promise<string | null> {
  await ensure();
  const rows = await sql()`SELECT value FROM trends_kv WHERE key = ${key} AND (expires_at IS NULL OR expires_at > now())`;
  return rows[0] ? String(rows[0].value) : null;
}

// Set a value. With nx, only when the key is absent or expired; returns whether it was written.
export async function kvSet(key: string, value: string, opts: { ttlMs?: number; nx?: boolean } = {}): Promise<boolean> {
  await ensure();
  const exp = expiry(opts.ttlMs);
  const rows = opts.nx
    ? await sql()`INSERT INTO trends_kv (key, value, expires_at) VALUES (${key}, ${value}, ${exp})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
        WHERE trends_kv.expires_at IS NOT NULL AND trends_kv.expires_at <= now()
        RETURNING key`
    : await sql()`INSERT INTO trends_kv (key, value, expires_at) VALUES (${key}, ${value}, ${exp})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at
        RETURNING key`;
  return rows.length > 0;
}

export async function kvDel(key: string) {
  await ensure();
  await sql()`DELETE FROM trends_kv WHERE key = ${key}`;
}
