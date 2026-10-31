import { handleLive } from '@/lib/trends/core';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [status, body] = await handleLive();
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
