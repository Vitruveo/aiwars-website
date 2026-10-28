import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { isAddress } from "viem";
import { PERSONA, KNOWLEDGE, visitorBlock } from "@/lib/mystery/prompt";
import { FRAGMENTS, GRANT_GAP, GRANT_MIN_TURNS, heldFragments, isComplete, periodIndex } from "@/lib/mystery/win";
import { awardForPeriod, bumpTurns, grantFragment, readProgress } from "@/lib/mystery/db";

// The mystery AI. Routed through Vercel AI Gateway: AI_GATEWAY_API_KEY locally, OIDC on Vercel.
// Streams plain text; fragment grants happen server-side through the grant_fragment tool and the
// client re-reads /api/mystery/state after each reply.

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL = process.env.MYSTERY_MODEL || "anthropic/claude-opus-5.5";
const MAX_TURNS = 30;
const MAX_CHARS = 1500;

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  let body: { messages?: Msg[]; address?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: Msg[] = raw
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);
  if (!messages.length || messages[messages.length - 1].role !== "user") return new Response("no message", { status: 400 });

  const address = typeof body.address === "string" && isAddress(body.address) ? body.address.toLowerCase() : null;

  let progress;
  let currentTaken: string | null = null;
  try {
    if (address) await bumpTurns(address);
    const i = periodIndex();
    const [p, cur] = await Promise.all([readProgress(address), i >= 0 ? awardForPeriod(i) : null]);
    progress = p;
    currentTaken = cur ? cur.address : null;
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
  const turns = address ? progress.turns : messages.filter((m) => m.role === "user").length;

  // Pacing gate. The model decides whether an understanding was shown; the server decides whether a
  // grant is allowed at all: not before GRANT_MIN_TURNS exchanges, not within GRANT_GAP exchanges of the
  // previous grant, and at most one per reply. Guessing fast or spamming cannot shortcut it.
  let grantedThisReply = false;

  const result = streamText({
    model: MODEL,
    system: [PERSONA, KNOWLEDGE, visitorBlock({ address, fragments: progress.fragments, turns, award: progress.award, currentTaken })].join("\n\n"),
    messages,
    reasoning: "low",
    maxOutputTokens: 600,
    stopWhen: stepCountIs(3),
    providerOptions: { gateway: { caching: "auto" } },
    tools: {
      grant_fragment: tool({
        description: `Record that the connected visitor has earned one of the ${FRAGMENTS.length} understandings. Call only after their own words showed it and they answered your follow-up probe. The call may be refused; if so, do not acknowledge any understanding and keep testing.`,
        inputSchema: z.object({ fragment: z.number().int().min(1).max(FRAGMENTS.length).describe(`Fragment number, 1 to ${FRAGMENTS.length}`) }),
        execute: async ({ fragment }) => {
          if (!address) return { ok: false, reason: "wallet not connected; nothing can be recorded" };
          if (progress.fragments & (1 << (fragment - 1))) return { ok: false, reason: "already held" };
          if (grantedThisReply) return { ok: false, reason: "one understanding per exchange; keep this one for later" };
          if (turns < GRANT_MIN_TURNS) return { ok: false, reason: "too soon; the visitor has not spent enough time here yet. Keep testing, grant nothing" };
          if (turns - progress.lastGrantTurn < GRANT_GAP) return { ok: false, reason: "too soon after the last one; keep testing, grant nothing" };
          grantedThisReply = true;
          const mask = await grantFragment(address, fragment);
          return { ok: true, held: heldFragments(mask), complete: isComplete(mask) };
        },
      }),
    },
    onError: ({ error }) => console.error("[mystery]", error),
  });

  return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
}
