import React from 'react';
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/api';

export const dynamic = 'force-dynamic';

function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <a href="/blog" className="mono muted" style={{ fontSize: 13 }}>
          ← all posts
        </a>
        <div className="mono muted" style={{ marginTop: 28, fontSize: 12 }}>
          {fmtDate(post.publishedAt)} · {post.authorName ?? 'Team AAF11'}
        </div>
        <h1 className="h2" style={{ marginTop: 12 }}>
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="lede" style={{ marginTop: 16 }}>
            {post.excerpt}
          </p>
        ) : null}
        <hr
          style={{ margin: '32px 0', border: 'none', borderTop: '1px solid var(--border)' }}
        />
        <div className="prose">
          {(post.body ?? post.excerpt ?? '').split('\n').map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : null,
          )}
        </div>
      </div>
    </article>
  );
}
