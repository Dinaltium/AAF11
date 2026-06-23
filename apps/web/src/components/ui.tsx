'use client';

import React, { useEffect, useState } from 'react';
import type { HealthStatus } from '@aaf11/shared';

export function Nav() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // visible only while in the first section (near the top); hidden everywhere
    // else regardless of scroll direction.
    const onScroll = () => setHidden(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav${hidden ? ' nav--hidden' : ''}`}>
      <div className="container nav-inner">
        <a href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aaf11_logo.svg" alt="AAF11" width={26} height={26} style={{ display: 'block' }} />
          AAF11 <span className="muted" style={{ fontWeight: 400 }}>Nexus</span>
        </a>
        <div className="nav-links">
          <a href="/projects">Projects</a>
          <a href="/services">Services</a>
          <a href="/team">Team</a>
          <a href="/blog">Blog</a>
          <a href="/contact">Contact</a>
        </div>
        <a href="/contact" className="btn btn-ghost">
          Work with us
        </a>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/aaf11_logo.svg" alt="AAF11" width={24} height={24} style={{ display: 'block' }} />
          AAF11
        </div>
        <div>© 2026 Team AAF11 — built on Nexus.</div>
        <div className="mono" style={{ fontSize: 12 }}>
          monitor · manage · showcase
        </div>
      </div>
    </footer>
  );
}

const LABEL: Record<HealthStatus, string> = {
  healthy: 'Operational',
  degraded: 'Degraded',
  down: 'Offline',
};

export function StatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span className={`badge status-${status}`}>
      <span className="dot" />
      {LABEL[status]}
    </span>
  );
}

export function Tags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="tag-row">
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
        </span>
      ))}
    </div>
  );
}
