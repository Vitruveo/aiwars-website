import { writeDispatch } from "@/lib/enlist/dispatch";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Writes today's dispatch if it has not been written. Called once a day by the Vercel cron in vercel.json;
// any later call the same day is a no-op, so the route needs no secret.
export async function GET() {
  try {
    return Response.json(await writeDispatch());
  } catch (e) {
    console.error("dispatch:", (e as Error).message);
    return Response.json({ error: (e as Error).message }, { status: 503 });
  }
}
