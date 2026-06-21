import React from 'react';

export const metadata = { title: 'Contact — AAF11 Nexus' };

export default function ContactPage() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="eyebrow">GET IN TOUCH</div>
          <h1 className="h2" style={{ marginTop: 12 }}>
            Let&apos;s build something
          </h1>
          <p className="lede" style={{ marginTop: 12 }}>
            Tell us about the product. We design, ship, and keep it running.
          </p>
        </div>
      </header>
      <section className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="grid grid-2">
            <a className="card" href="mailto:rafan79200@gmail.com">
              <div className="eyebrow" style={{ color: 'var(--accent)' }}>
                EMAIL
              </div>
              <div className="card-title" style={{ marginTop: 10 }}>
                rafan79200@gmail.com
              </div>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                Fastest way to reach the team.
              </p>
            </a>
            <a className="card" href="https://github.com/rafan">
              <div className="eyebrow" style={{ color: 'var(--accent)' }}>
                GITHUB
              </div>
              <div className="card-title" style={{ marginTop: 10 }}>
                Team AAF11
              </div>
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                See what we ship in the open.
              </p>
            </a>
          </div>
          <p className="muted mono" style={{ marginTop: 32, fontSize: 13 }}>
            A full contact form posts to the Hub in a later phase — for now, email is live.
          </p>
        </div>
      </section>
    </>
  );
}
