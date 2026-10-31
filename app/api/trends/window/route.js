import { handleWindow } from '@/lib/trends/core';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  try {
    const [status, body] = await handleWindow(new URL(req.url).searchParams.get('start') || '');
    return Response.json(body, { status });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 503 });
  }
}
