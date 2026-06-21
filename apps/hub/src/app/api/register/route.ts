import { NextResponse } from 'next/server';
import type { RegistrationPayload } from '@aaf11/shared';
import { payloadClient } from '@/lib/payload';
import { registerProject } from '@/logic/registration';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: RegistrationPayload;
  try {
    body = (await req.json()) as RegistrationPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }
  const payload = await payloadClient();
  const result = await registerProject(payload, body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
