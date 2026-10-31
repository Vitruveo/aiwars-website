// Thin client for the AI Wars Trends API routes on this site.
async function call(path, body) {
  const res = await fetch(path, body
    ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    : { cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `game API ${res.status}`);
  return data;
}

export const getGameConfig = () => call('/api/trends/config');
export const getLive = () => call('/api/trends/live');
export const getEligibility = (address) => call(`/api/trends/eligibility?address=${address}`);
export const getLeaderboard = () => call('/api/trends/leaderboard');
export const getWindow = (start) => call(`/api/trends/window?start=${start}`);
export const getSettle = (gameId) => call(`/api/trends/settle?gameId=${encodeURIComponent(gameId)}`);
// Mints paid-but-unminted shards on Vitruveo; the BSC sale contract is its only source of truth.
export const postFulfill = async (address) => {
  const data = await call('/api/fulfill', {});
  const mine = (data.minted || []).filter((m) => (m.to || '').toLowerCase() === address.toLowerCase()).map((m) => m.tokenId);
  return { minted: mine, total: (data.minted || []).length };
};
