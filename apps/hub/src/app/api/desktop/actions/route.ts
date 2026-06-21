import { NextResponse } from 'next/server';
import type { ActionDescriptor } from '@aaf11/shared';
import { payloadClient } from '@/lib/payload';
import { cors, preflight, memberTokenFrom, findMember } from '@/lib/desktop-auth';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

// Returns the live action list a project exposes, by fetching its connector
// server-side (avoids CORS — the desktop can't reach the connector directly).
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
  const project = await payload
    .findByID({ collection: 'projects', id: projectId, overrideAccess: true, depth: 0 })
    .catch(() => null);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404, headers: cors });
  }

  const base = String(project.connectorUrl).replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/aaf11/actions`, { signal: AbortSignal.timeout(5000) });
    const data = (await res.json()) as { actions?: ActionDescriptor[] };
    return NextResponse.json(
      { actions: data.actions ?? [], reachable: true },
      { headers: cors },
    );
  } catch {
    return NextResponse.json({ actions: [], reachable: false }, { headers: cors });
  }
}
