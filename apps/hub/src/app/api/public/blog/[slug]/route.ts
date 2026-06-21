import { NextResponse } from 'next/server';
import { payloadClient } from '@/lib/payload';
import { getPublicBlogPost } from '@/logic/public';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await payloadClient();
  const post = await getPublicBlogPost(payload, slug);
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ post }, { headers: { 'access-control-allow-origin': '*' } });
}
