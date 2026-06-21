import React from 'react';
import { getServices } from '@/lib/api';
import { Tags } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="eyebrow">CAPABILITIES</div>
          <h1 className="h2" style={{ marginTop: 12 }}>
            Services
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            From idea to shipped product — and kept running afterwards.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container">
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
          <div style={{ marginTop: 48 }}>
            <a href="/contact" className="btn btn-primary">
              Tell us what you need →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
