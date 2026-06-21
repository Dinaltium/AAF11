import { NextResponse } from 'next/server';
import { payloadClient } from '@/lib/payload';
import { getPublicBlog } from '@/logic/public';

export const dynamic = 'force-dynamic';

export async function GET() {
  const payload = await payloadClient();
  const posts = await getPublicBlog(payload);
  return NextResponse.json({ posts }, { headers: { 'access-control-allow-origin': '*' } });
}
