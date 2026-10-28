import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import { isAddress } from "viem";
import { PERSONA, KNOWLEDGE, visitorBlock } from "@/lib/mystery/prompt";
import { FRAGMENTS, heldFragments, isComplete } from "@/lib/mystery/win";
import { bumpTurns, grantFragment, readProgress } from "@/lib/mystery/db";

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
  try {
    if (address) await bumpTurns(address);
    progress = await readProgress(address);
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
  const turns = address ? progress.turns : messages.filter((m) => m.role === "user").length;

  const result = streamText({
    model: MODEL,
    system: [PERSONA, KNOWLEDGE, visitorBlock({ address, fragments: progress.fragments, turns, rank: progress.rank, winners: progress.winners })].join("\n\n"),
    messages,
    reasoning: "low",
    maxOutputTokens: 600,
    stopWhen: stepCountIs(3),
    providerOptions: { gateway: { caching: "auto" } },
    tools: {
      grant_fragment: tool({
        description: "Record that the connected visitor has earned one of the three understandings. Call only when their own words genuinely show it.",
        inputSchema: z.object({ fragment: z.number().int().min(1).max(FRAGMENTS.length).describe("Fragment number, 1 to 3") }),
        execute: async ({ fragment }) => {
          if (!address) return { ok: false, reason: "wallet not connected; nothing can be recorded" };
          const mask = await grantFragment(address, fragment);
          return { ok: true, held: heldFragments(mask), complete: isComplete(mask) };
        },
      }),
    },
    onError: ({ error }) => console.error("[mystery]", error),
  });

  return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
}
