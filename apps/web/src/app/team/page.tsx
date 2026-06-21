import React from 'react';
import { getTeam } from '@/lib/api';

export const dynamic = 'force-dynamic';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default async function TeamPage() {
  const team = await getTeam();
  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="eyebrow">PEOPLE</div>
          <h1 className="h2" style={{ marginTop: 12 }}>
            Team
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            The engineers behind every project on Nexus.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {team.map((m) => (
              <div key={m.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 680,
                      background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                      color: '#0a0a0a',
                    }}
                  >
                    {initials(m.name)}
                  </div>
                  <div>
                    <div className="card-title">{m.name}</div>
                    <div className="mono muted" style={{ fontSize: 12 }}>
                      {m.role}
                    </div>
                  </div>
                </div>
                {m.bio ? (
                  <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>
                    {m.bio}
                  </p>
                ) : null}
                {m.github ? (
                  <a
                    href={m.github}
                    className="mono"
                    style={{ marginTop: 12, display: 'inline-block', fontSize: 13, color: 'var(--accent-2)' }}
                  >
                    github ↗
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
