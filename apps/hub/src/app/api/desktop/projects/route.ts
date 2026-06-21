import { NextResponse } from 'next/server';
import { payloadClient } from '@/lib/payload';
import { cors, preflight, memberTokenFrom, findMember } from '@/lib/desktop-auth';
import { listProjects } from '@/logic/desktop';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const token = memberTokenFrom(req);
  if (!token) {
    return NextResponse.json({ error: 'Missing member token' }, { status: 401, headers: cors });
  }
  const payload = await payloadClient();
  const member = await findMember(payload, token);
  if (!member) {
    return NextResponse.json({ error: 'Invalid member token' }, { status: 401, headers: cors });
  }
  const projects = await listProjects(payload);
  return NextResponse.json({ projects }, { headers: cors });
}
