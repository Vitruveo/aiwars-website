import { neon } from "@neondatabase/serverless";

// Neon Postgres over HTTP. DATABASE_URL comes from the Neon integration.
export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

let ready: Promise<void> | null = null;
export function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`CREATE TABLE IF NOT EXISTS beacons (
        token_id integer PRIMARY KEY,
        name text NOT NULL,
        x real NOT NULL,
        z real NOT NULL,
        owner text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}
