import { generateText, Output } from "ai";
import { z } from "zod";
import { createPublicClient, http, type Address } from "viem";
import { vitruveo } from "@/lib/chains";
import { NFT_ADDRESS, NFT_ABI } from "@/lib/contracts";
import { fetchSeries } from "@/lib/trends/live";
import { claimDay, finishDay, releaseDay, dispatchCandidates } from "@/lib/enlist/db";
import { TEXT_MODEL, WORLD } from "@/lib/enlist/generate";

// The daily war dispatch: the last 24 hours of Battle Momentum told as a field report from the Fall of
// Meridian, naming a few enlisted survivors. One per UTC day; whoever calls first writes it.

const FEATURED = 4;
const chain = createPublicClient({ chain: vitruveo, transport: http(process.env.VITRUVEO_RPC_URL || vitruveo.rpcUrls.default.http[0]) });

// Open, close, range and the sharpest hourly moves of the momentum feed over the last day.
async function momentumDay() {
  const now = Math.floor(Date.now() / 1000);
  const pts = ((await fetchSeries(now - 86400, now)) as [number, number][]).sort((a, b) => a[0] - b[0]);
  if (pts.length < 100) return null;
  const vals = pts.map((p) => p[1]);
  const hours: number[] = [];
  for (let h = 0; h < 24; h++) {
    const from = now - 86400 + h * 3600;
    const inHour = pts.filter((p) => p[0] >= from && p[0] < from + 3600).map((p) => p[1]);
    if (inHour.length) hours.push(inHour.reduce((a, b) => a + b, 0) / inHour.length);
  }
  let rise = { d: 0, h: 0 };
  let fall = { d: 0, h: 0 };
  for (let h = 1; h < hours.length; h++) {
    const d = hours[h] - hours[h - 1];
    if (d > rise.d) rise = { d, h };
    if (d < fall.d) fall = { d, h };
  }
  const r = (x: number) => Math.round(x * 10) / 10;
  return {
    open: r(vals[0]),
    close: r(vals[vals.length - 1]),
    high: r(Math.max(...vals)),
    low: r(Math.min(...vals)),
    hourly: hours.map(r),
    sharpestRise: { points: r(rise.d), hoursAgo: hours.length - rise.h },
    sharpestFall: { points: r(fall.d), hoursAgo: hours.length - fall.h },
  };
}

// Wallets that have won at least one AI Wars Trends game.
async function trendsWinners(): Promise<Set<string>> {
  if (!NFT_ADDRESS) return new Set();
  try {
    const n = (await chain.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "playerCount" })) as bigint;
    const [addrs, stats] = (await chain.readContract({ address: NFT_ADDRESS, abi: NFT_ABI, functionName: "players", args: [0n, n] })) as [Address[], { wins: bigint }[]];
    return new Set(addrs.filter((_, i) => stats[i].wins > 0n).map((a) => a.toLowerCase()));
  } catch {
    return new Set();
  }
}

// Least featured first; a beacon or a Trends win each count as one fewer appearance, so active holders
// come round more often. Ties break at random.
async function pickFeatured() {
  const [cands, winners] = await Promise.all([dispatchCandidates(), trendsWinners()]);
  return cands
    .map((c) => ({ ...c, score: c.featuredCount - (c.beacon ? 1 : 0) - (winners.has(c.owner) ? 1 : 0) + Math.random() * 0.5 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, FEATURED);
}

const DispatchSchema = z.object({
  title: z.string().describe("a headline of 3 to 8 words, no date"),
  body: z.string().describe("180 to 240 words in 2 to 4 short paragraphs separated by blank lines"),
});

export const utcDay = (t = Date.now()) => new Date(t).toISOString().slice(0, 10);

export async function writeDispatch(day = utcDay()) {
  if (!(await claimDay(day))) return { day, written: false };
  try {
    const [m, featured] = await Promise.all([momentumDay(), pickFeatured()]);
    const momentum = m
      ? `${m.open} to ${m.close} (range ${m.low}-${m.high})`
      : "feed quiet";
    const cast = featured.length
      ? featured.map((s) => `- ${s.name}${s.epithet ? ` "${s.epithet}"` : ""}: ${s.gender}, ${s.rank} ${s.role}, ${s.origin}, home sector ${s.sector}`).join("\n")
      : "(no survivors have enlisted yet; tell it through unnamed defenders)";
    const { output } = await generateText({
      model: TEXT_MODEL,
      system: `You write the daily field dispatch for AI Wars: what happened in the last day of the war for Meridian, as read from the Battle Momentum feed. Battle Momentum runs 0 to 100: high means humanity is pressing forward, low means the machines are; sharp drops are machine offensives, sharp rises are counterattacks. Terse, grounded, cinematic; concrete places and actions; no exclamation marks, no emojis, no numbers from the feed in the prose except at most one. Each named survivor appears doing something that fits their role and origin; give each one a moment, none a death. Never contradict the setting below.

${WORLD}`,
      output: Output.object({ schema: DispatchSchema }),
      prompt: `Write the dispatch for ${day}.

Battle Momentum, last 24 hours: opened ${m?.open ?? "?"}, closed ${m?.close ?? "?"}, high ${m?.high ?? "?"}, low ${m?.low ?? "?"}.
Hourly averages, oldest first: ${m?.hourly.join(", ") ?? "unavailable"}.
Sharpest hourly rise: ${m ? `${m.sharpestRise.points} points, ${m.sharpestRise.hoursAgo} hours ago` : "?"}. Sharpest hourly fall: ${m ? `${m.sharpestFall.points} points, ${m.sharpestFall.hoursAgo} hours ago` : "?"}.

Survivors to name:
${cast}`,
    });
    if (!output) throw new Error("the writer returned nothing");
    const d = { title: output.title.trim(), body: output.body.trim(), momentum, featured: featured.map((s) => s.tokenId) };
    await finishDay(day, d);
    return { day, written: true, ...d };
  } catch (e) {
    await releaseDay(day).catch(() => {});
    throw e;
  }
}
