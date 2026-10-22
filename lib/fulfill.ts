export type Fulfilled = { minted: { purchase: number; tokenId: number; to: string }[]; mintTx?: string; recordTx?: string };

// Asks the server to mint every paid-but-unminted purchase. Returns the token ids minted for `wallet`,
// or null if the call failed (the shard is still minted on a later call; the owner list keeps polling).
export async function requestFulfill(wallet: string): Promise<number[] | null> {
  try {
    const res = await fetch("/api/fulfill", { method: "POST" });
    if (!res.ok) return null;
    const data = (await res.json()) as Fulfilled;
    return data.minted.filter((m) => m.to.toLowerCase() === wallet.toLowerCase()).map((m) => m.tokenId);
  } catch {
    return null;
  }
}
