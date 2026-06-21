import { NextResponse } from 'next/server';
import { payloadClient, bearerToken } from '@/lib/payload';
import { cors, preflight, memberTokenFrom } from '@/lib/desktop-auth';
import { dispatchAction } from '@/logic/control';

export const dynamic = 'force-dynamic';

export function OPTIONS() {
  return preflight();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; actionId: string }> },
) {
  const memberToken = memberTokenFrom(req) ?? bearerToken(req);
  if (!memberToken) {
    return NextResponse.json(
      { ok: false, error: 'Missing member token' },
      { status: 401, headers: cors },
    );
  }
  const { projectId, actionId } = await params;
  let payloadBody: unknown = {};
  try {
    payloadBody = await req.json();
  } catch {
    /* empty body is fine */
  }
  const payload = await payloadClient();
  const result = await dispatchAction(payload, {
    projectId,
    actionId,
    memberToken,
    payload: payloadBody,
  });
  return NextResponse.json(result.body, { status: result.status, headers: cors });
}
