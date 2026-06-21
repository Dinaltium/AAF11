import { NextResponse } from 'next/server';
import { payloadClient } from '@/lib/payload';
import { getPublicTeam } from '@/logic/public';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await payloadClient();
  const team = await getPublicTeam(payload);
  return NextResponse.json({ team }, { headers: { 'access-control-allow-origin': '*' } });
}
