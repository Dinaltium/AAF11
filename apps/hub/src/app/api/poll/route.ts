import { NextResponse } from 'next/server';
import { isReal } from '@aaf11/shared';
import { payloadClient, bearerToken } from '@/lib/payload';
import { pollAll } from '@/logic/poller';

export const dynamic = 'force-dynamic';

/**
 * Triggered by Vercel Cron (real) or manually (test). In real mode it requires
 * CRON_SECRET so the world can't spam it; test mode is open for convenience.
 */
export async function GET(req: Request) {
  if (isReal()) {
    const secret = process.env.CRON_SECRET;
    if (!secret || bearerToken(req) !== secret) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }
  const payload = await payloadClient();
  const results = await pollAll(payload);
  return NextResponse.json({ ok: true, polled: results.length, results });
}
