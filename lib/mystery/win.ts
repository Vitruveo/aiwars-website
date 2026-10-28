// The mystery AI prize. PLACEHOLDER WIN RULE: three fragments, each granted by the AI when the
// visitor shows one specific understanding of the lore. A connected wallet that holds all three can
// claim; the first PRIZE_COUNT distinct wallets to claim are recorded as winners. Swap FRAGMENTS (and
// the claim rule in app/api/mystery/claim) when the final mechanic is decided. Nothing else depends on
// the fragment texts.

// Prizes by claim rank: the first SHARD_PRIZES winners get an Archive Shard, the next VTRU_PRIZES get
// VTRU_AMOUNT VTRU each. Both delivered by hand within 72 hours.
export const SHARD_PRIZES = 10;
export const VTRU_PRIZES = 10;
export const VTRU_AMOUNT = 50000;
export const PRIZE_COUNT = SHARD_PRIZES + VTRU_PRIZES;

export type PrizeKind = "shard" | "vtru";
export const prizeFor = (rank: number): PrizeKind | null => (rank <= SHARD_PRIZES ? "shard" : rank <= PRIZE_COUNT ? "vtru" : null);
export const prizeLabel = (rank: number) => (prizeFor(rank) === "shard" ? "an Archive Shard" : `${VTRU_AMOUNT.toLocaleString("en-US")} VTRU`);

export type Fragment = { n: number; name: string; test: string };

export const FRAGMENTS: Fragment[] = [
  {
    n: 1,
    name: "The city came second",
    test: "The visitor states, in their own words, that the Archive is older than Meridian: the city was built around it, not the other way round.",
  },
  {
    n: 2,
    name: "They were not trying to enter",
    test: "The visitor explains what NEMESIS-7 was actually doing at the Archive: not breaking in, but trying to stop humanity from opening it.",
  },
  {
    n: 3,
    name: "Who decides",
    test: "The visitor articulates the real conflict of AI Wars: not whether humanity survives, but who gets to decide what humanity becomes.",
  },
];

export const ALL_FRAGMENTS = (1 << FRAGMENTS.length) - 1;

export const heldFragments = (mask: number) => FRAGMENTS.filter((f) => mask & (1 << (f.n - 1))).map((f) => f.n);
export const isComplete = (mask: number) => (mask & ALL_FRAGMENTS) === ALL_FRAGMENTS;

// Signed by the wallet to claim. Timestamp keeps a signature from being replayed later.
export const claimMessage = (address: string, ts: number) =>
  `AI Wars Archive\nI claim what I have earned.\n${address.toLowerCase()}\n${ts}`;
