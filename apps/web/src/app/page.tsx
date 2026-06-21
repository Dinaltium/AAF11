import React from 'react';
import { getProjects, getServices } from '@/lib/api';
import { StatusBadge, Tags } from '@/components/ui';

export default async function Home() {
  const [projects, services] = await Promise.all([getProjects(), getServices()]);
  const healthy = projects.filter((p) => p.status === 'healthy').length;

  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="container">
          <div className="eyebrow rise">
            <span className="dot" style={{ background: 'var(--accent-2)' }} />
            TEAM AAF11 · OPERATIONS PLATFORM
          </div>
          <h1 className="h1 rise rise-2" style={{ marginTop: 18, maxWidth: '16ch' }}>
            We build products.
            <br />
            <span style={{ color: 'var(--text-mute)' }}>Nexus keeps them alive.</span>
          </h1>
          <p className="lede rise rise-3" style={{ marginTop: 24 }}>
            Web apps, desktop tools, IoT systems, and bots — designed, shipped, and
            monitored from one federated platform. If the hub goes down, everything keeps
            running.
          </p>
          <div className="rise rise-4" style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <a href="/projects" className="btn btn-primary">
              View live projects →
            </a>
            <a href="/services" className="btn btn-ghost">
              What we do
            </a>
          </div>

          <div className="stat-row rise rise-4">
            <div>
              <div className="stat-num">{projects.length}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div>
              <div className="stat-num" style={{ color: 'var(--ok)' }}>
                {healthy}
              </div>
              <div className="stat-label">Operational</div>
            </div>
            <div>
              <div className="stat-num">{services.length}</div>
              <div className="stat-label">Services</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow">LIVE STATUS</div>
          <h2 className="h2" style={{ marginTop: 12, marginBottom: 8 }}>
            Everything we run, in real time
          </h2>
          <p className="lede" style={{ marginBottom: 36 }}>
            Each project reports health through the AAF11 SDK. Status here is live from the
            Hub.
          </p>
          <div className="grid grid-3">
            {projects.slice(0, 6).map((p) => (
              <a key={p.id} href="/projects" className="card">
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span className="card-title">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                  {p.description ?? 'A Team AAF11 project.'}
                </p>
                <Tags tags={p.tags} />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="eyebrow">CAPABILITIES</div>
          <h2 className="h2" style={{ marginTop: 12, marginBottom: 36 }}>
            What we build for clients
          </h2>
          <div className="grid grid-3">
            {services.map((s) => (
              <div key={s.id} className="card">
                <span className="card-title">{s.title}</span>
                <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                  {s.description}
                </p>
                <Tags tags={s.tags} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}>
            <a href="/contact" className="btn btn-primary">
              Start a project →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
