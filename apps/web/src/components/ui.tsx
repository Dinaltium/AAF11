import React from 'react';
import type { HealthStatus } from '@aaf11/shared';

export function Nav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <a href="/" className="brand">
          <span className="brand-mark" />
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
          <span className="brand-mark" />
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
