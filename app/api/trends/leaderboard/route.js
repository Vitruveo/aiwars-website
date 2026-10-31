import { getLeaderboard } from '@/lib/trends/core';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return Response.json({ rows: await getLeaderboard() });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
