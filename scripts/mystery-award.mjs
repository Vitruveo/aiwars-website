// Marks a window's shard as delivered. Usage (after minting in aiwars-contracts):
//   node --env-file=.env scripts/mystery-award.mjs <period> <tokenId> <txHash>
import { neon } from "@neondatabase/serverless";

const [period, tokenId, tx] = process.argv.slice(2);
if (!/^\d+$/.test(period || "") || !/^\d+$/.test(tokenId || "") || !/^0x[0-9a-fA-F]{64}$/.test(tx || "")) {
  console.error("usage: node --env-file=.env scripts/mystery-award.mjs <period> <tokenId> <txHash>");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`UPDATE mystery_awards SET awarded_at = now(), token_id = ${Number(tokenId)}, tx = ${tx} WHERE period = ${Number(period)} RETURNING period, address, token_id, awarded_at`;
if (!rows[0]) { console.error("no claim recorded for period " + period); process.exit(1); }
console.log(`period ${rows[0].period} -> ${rows[0].address} token ${rows[0].token_id} awarded ${rows[0].awarded_at}`);
