import { gameConfig } from '@/lib/trends/core';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await gameConfig());
}
