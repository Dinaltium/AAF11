import { NextResponse } from 'next/server';
import { payloadClient } from '@/lib/payload';
import { cors, preflight, memberTokenFrom, findMember } from '@/lib/desktop-auth';
import { listSnapshots } from '@/logic/desktop';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

export async function GET(req: Request) {
  const token = memberTokenFrom(req);
  if (!token) {
    return NextResponse.json({ error: 'Missing member token' }, { status: 401, headers: cors });
  }
  const projectId = new URL(req.url).searchParams.get('projectId');
  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400, headers: cors });
  }
  const payload = await payloadClient();
  const member = await findMember(payload, token);
  if (!member) {
    return NextResponse.json({ error: 'Invalid member token' }, { status: 401, headers: cors });
  }
  const snapshots = await listSnapshots(payload, projectId);
  return NextResponse.json({ snapshots }, { headers: cors });
}
