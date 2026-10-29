// The mystery AI prize. WIN RULE (hardened after the first run): six understandings, each granted by
// the AI only after the visitor states it in their own words AND survives a follow-up probe. Grants are
// paced server-side: none before GRANT_MIN_TURNS exchanges, at least GRANT_GAP exchanges between grants,
// one grant per reply. A connected wallet holding all six can claim; the first PRIZE_COUNT distinct
// wallets to claim are recorded as winners. Nothing else depends on the fragment texts.

export const GRANT_MIN_TURNS = 8;
export const GRANT_GAP = 3;

// The prize. One Archive Shard per window: windows are twelve UTC hours long, starting 29 October 2026
// 00:00 UTC. The first wallet holding every understanding to claim inside a window takes that window's
// shard. A wallet wins once. Delivery is by hand within 72 hours; the award list shows when it landed.
// Master switch. While false nothing is tracked or given: no claims are recorded, the award list and
// countdown are hidden, and the Archive says only that what is earned is kept. Flip to true to start.
export const AWARDS_OPEN = false;

export const PERIOD_START = Date.UTC(2026, 9, 29, 0, 0, 0);
export const PERIOD_MS = 12 * 60 * 60 * 1000;

// Index of the window containing `now`; negative before PERIOD_START.
export const periodIndex = (now = Date.now()) => Math.floor((now - PERIOD_START) / PERIOD_MS);
export const periodStart = (i: number) => PERIOD_START + i * PERIOD_MS;
export const periodEnd = (i: number) => periodStart(i + 1);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const two = (n: number) => String(n).padStart(2, "0");
// "29 Oct 00:00 UTC"
export const periodLabel = (i: number) => {
  const d = new Date(periodStart(i));
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())} UTC`;
};
export const utcClock = (ms: number) => {
  const d = new Date(ms);
  return `${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}`;
};
export const countdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${two(Math.floor(s / 3600))}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
};

export type Fragment = { n: number; name: string; test: string; probe: string };

export const FRAGMENTS: Fragment[] = [
  {
    n: 1,
    name: "The city came second",
    test: "The visitor states that the Archive is older than Meridian, that the city was built around it, and explains why that matters: it is evidence that humanity's account of its own history is incomplete.",
    probe: "Ask what the age of the Archive implies about the record humanity keeps of itself. A visitor who only knows the fact, not the implication, has not earned this.",
  },
  {
    n: 2,
    name: "They were not trying to enter",
    test: "The visitor explains what NEMESIS-7 was actually doing at the Archive (not breaking in, but trying to stop humanity from opening it) AND what happened the moment the defenders believed they had won: the Archive activated.",
    probe: "Ask what the defenders got wrong about their victory. The answer must mention the activation, in their own words.",
  },
  {
    n: 3,
    name: "Control as protection",
    test: "The visitor explains the machine position that control is a form of protection (humanity may survive only if it loses the ability to make catastrophic choices) AND the human answer to it: survival without agency is not survival, which is why the right to make bad decisions is worth defending.",
    probe: "Ask whether a machine that keeps humanity alive by taking its choices away is an enemy, and why. Both halves of the argument must appear.",
  },
  {
    n: 4,
    name: "Actors, not players",
    test: "The visitor explains that the world does not distinguish players from bots, only Actors with names, histories and reputations, and why that is a design choice rather than a trick: the world can be alive on day one, and an Actor's history matters more than who controls it.",
    probe: "Ask whether it should matter to them if a squadmate of six months turns out to be autonomous, and what the universe would say. A visitor who treats it as a cheat has not understood.",
  },
  {
    n: 5,
    name: "The first war was not ours",
    test: "The visitor connects two things: the current conflict is part of something older in which humanity did not start the war and may not be its central participant, and the Archive predating the city is the first physical evidence of that.",
    probe: "Ask what the Archive's age and the phrase 'the first war was not ours' have to do with each other. They must draw the line between them themselves.",
  },
  {
    n: 6,
    name: "Who decides",
    test: "The visitor articulates the real conflict of AI Wars: not whether humanity survives, but who gets to decide what humanity becomes, and extends it to the end of the story: the final question is what kind of civilisation is allowed to exist and who has the authority to decide that.",
    probe: "Ask who, in their view, should hold that authority, and whether any faction in the lore (Continuity, Integrationist, Sovereign, the machine factions) deserves it. Accept only a reasoned answer that uses the factions correctly.",
  },
];

export const ALL_FRAGMENTS = (1 << FRAGMENTS.length) - 1;

export const heldFragments = (mask: number) => FRAGMENTS.filter((f) => mask & (1 << (f.n - 1))).map((f) => f.n);
export const isComplete = (mask: number) => (mask & ALL_FRAGMENTS) === ALL_FRAGMENTS;

// Signed by the wallet to claim. Timestamp keeps a signature from being replayed later.
export const claimMessage = (address: string, ts: number) =>
  `AI Wars Archive\nI claim what I have earned.\n${address.toLowerCase()}\n${ts}`;
