import { NextResponse } from 'next/server';
import { payloadClient } from '@/lib/payload';
import { getPublicServices } from '@/logic/public';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await payloadClient();
  const services = await getPublicServices(payload);
  return NextResponse.json({ services }, { headers: { 'access-control-allow-origin': '*' } });
}
