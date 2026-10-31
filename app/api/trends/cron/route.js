import { handleSettleLatest } from '@/lib/trends/core';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Settles the last closed window. Hit it every minute from any external pinger as a backstop for
// windows no player's page polled.
export async function GET() {
  try {
    const [status, body] = await handleSettleLatest();
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
