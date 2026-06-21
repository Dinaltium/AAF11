import React from 'react';
import { getProjects } from '@/lib/api';
import { StatusBadge, Tags } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="eyebrow">PORTFOLIO</div>
          <h1 className="h2" style={{ marginTop: 12 }}>
            Projects
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            Live status of everything Team AAF11 operates, straight from the Nexus Hub.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            {projects.map((p) => (
              <div key={p.id} className="card">
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span className="card-title">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="muted" style={{ marginTop: 12 }}>
                  {p.description ?? 'A Team AAF11 project.'}
                </p>
                <div className="mono muted" style={{ marginTop: 10, fontSize: 12 }}>
                  env: {p.environment}
                </div>
                <Tags tags={p.tags} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
