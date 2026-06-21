import { NextResponse } from 'next/server';
import { payloadClient } from '@/lib/payload';
import { getPublicProjects } from '@/logic/public';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await payloadClient();
  const projects = await getPublicProjects(payload);
  return NextResponse.json(
    { projects },
    { headers: { 'access-control-allow-origin': '*' } },
  );
}
