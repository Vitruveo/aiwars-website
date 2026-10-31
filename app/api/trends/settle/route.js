import { handleSettle } from '@/lib/trends/core';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  try {
    const [status, body] = await handleSettle(new URL(req.url).searchParams.get('gameId') || '');
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
