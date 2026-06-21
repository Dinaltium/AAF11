import React from 'react';
import { getBlog } from '@/lib/api';

export const dynamic = 'force-dynamic';

function fmtDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BlogPage() {
  const posts = await getBlog();
  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="eyebrow">WRITING</div>
          <h1 className="h2" style={{ marginTop: 12 }}>
            Blog
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            Notes on what we build and how we keep it running.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <div className="grid">
            {posts.map((p) => (
              <a key={p.id} href={`/blog/${p.slug}`} className="card">
                <div className="mono muted" style={{ fontSize: 12 }}>
                  {fmtDate(p.publishedAt)} · {p.authorName ?? 'Team AAF11'}
                </div>
                <div className="card-title" style={{ marginTop: 8, fontSize: '1.35rem' }}>
                  {p.title}
                </div>
                {p.excerpt ? (
                  <p className="muted" style={{ marginTop: 10 }}>
                    {p.excerpt}
                  </p>
                ) : null}
                <span
                  className="mono"
                  style={{ marginTop: 14, display: 'inline-block', fontSize: 13, color: 'var(--accent-2)' }}
                >
                  read →
                </span>
              </a>
            ))}
            {posts.length === 0 ? <p className="muted">No posts yet.</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
