import React, { useEffect, useMemo, useState } from 'react';
import type { ProjectRecord, ActionLogEntry, MetricsSnapshot, HealthStatus } from '@aaf11/shared';
import { Chart } from './components/Chart';
import { openAdminWindow, notify } from './tauri';
import {
  isTestMode,
  getProjects,
  getSnapshots,
  getActionLog,
  triggerAction,
} from './api';

const HUB = (import.meta.env as Record<string, string | undefined>).AAF11_HUB_URL ?? 'http://localhost:3000';
const MEMBER_TOKEN =
  (import.meta.env as Record<string, string | undefined>).AAF11_MEMBER_TOKEN ?? 'mbr_rafan_test0001';

type View = 'dashboard' | 'projects' | 'actions' | 'incidents' | 'content';

const NAV: { id: View; label: string; ico: string }[] = [
  { id: 'dashboard', label: 'Dashboard', ico: '◧' },
  { id: 'projects', label: 'Projects', ico: '▤' },
  { id: 'actions', label: 'Actions', ico: '⚡' },
  { id: 'incidents', label: 'Incidents', ico: '⚑' },
  { id: 'content', label: 'Content', ico: '✎' },
];

function Status({ status }: { status: HealthStatus }) {
  const label = status === 'healthy' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Down';
  return (
    <span className={`badge s-${status}`}>
      <span className="dot" />
      {label}
    </span>
  );
}

export function App() {
  const [view, setView] = useState<View>('dashboard');
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [snaps, setSnaps] = useState<Record<string, MetricsSnapshot[]>>({});
  const [log, setLog] = useState<ActionLogEntry[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const ps = await getProjects(MEMBER_TOKEN).catch(() => []);
      setProjects(ps);
      setLog(await getActionLog(MEMBER_TOKEN).catch(() => []));
      const map: Record<string, MetricsSnapshot[]> = {};
      for (const p of ps) map[p.id] = await getSnapshots(p.id, MEMBER_TOKEN).catch(() => []);
      setSnaps(map);
    })();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="side-brand">
          <span className="side-mark" /> AAF11 Nexus
        </div>
        {NAV.map((n) => (
          <div
            key={n.id}
            className={`nav-item ${view === n.id ? 'active' : ''}`}
            onClick={() => setView(n.id)}
          >
            <span className="nav-ico">{n.ico}</span>
            {n.label}
          </div>
        ))}
        <div className="side-foot">
          {isTestMode() ? 'test · mock data' : 'real · live hub'}
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <h1>{NAV.find((n) => n.id === view)?.label}</h1>
          <span className={`mode-pill ${isTestMode() ? 'mode-test' : 'mode-real'}`}>
            {isTestMode() ? 'TEST MODE' : 'REAL MODE'}
          </span>
        </div>
        <div className="content">
          {view === 'dashboard' && <Dashboard projects={projects} snaps={snaps} onNotify={() => notify('AAF11 Nexus', 'Test alert from the desktop app')} />}
          {view === 'projects' && <Projects projects={projects} />}
          {view === 'actions' && (
            <Actions
              projects={projects}
              onTrigger={async (pid, action) => {
                const r = await triggerAction(pid, action, MEMBER_TOKEN);
                showToast(r.ok ? `✓ ${action} dispatched` : `✕ ${r.error ?? 'failed'}`);
                setLog(await getActionLog(MEMBER_TOKEN).catch(() => log));
              }}
            />
          )}
          {view === 'incidents' && <Incidents log={log} />}
          {view === 'content' && <Content />}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Dashboard({
  projects,
  snaps,
  onNotify,
}: {
  projects: ProjectRecord[];
  snaps: Record<string, MetricsSnapshot[]>;
  onNotify: () => void;
}) {
  const healthy = projects.filter((p) => p.status === 'healthy').length;
  const degraded = projects.filter((p) => p.status === 'degraded').length;
  const down = projects.filter((p) => p.status === 'down').length;

  return (
    <>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <Stat label="Projects" value={projects.length} />
        <Stat label="Operational" value={healthy} color="var(--ok)" />
        <Stat label="Degraded" value={degraded} color="var(--warn)" />
        <Stat label="Down" value={down} color="var(--down)" />
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="section-title" style={{ margin: 0 }}>Live project health</div>
        <button className="btn" onClick={onNotify}>Test alert →</button>
      </div>
      <div className="grid grid-3">
        {projects.map((p) => {
          const series = (snaps[p.id] ?? []).map((s) => s.requestCount);
          const color =
            p.status === 'down' ? 'var(--down)' : p.status === 'degraded' ? 'var(--warn)' : 'var(--accent)';
          return (
            <div key={p.id} className="card">
              <div className="card-h">
                <span className="card-title">{p.name}</span>
                <Status status={p.status} />
              </div>
              <div style={{ margin: '14px 0 6px' }}>
                <Chart values={series} color={color} />
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="mono muted" style={{ fontSize: 11 }}>{p.environment}</span>
                <span className="mono muted" style={{ fontSize: 11 }}>
                  {series.length ? `${series[series.length - 1]} req` : '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card">
      <div className="stat-num" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Projects({ projects }: { projects: ProjectRecord[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Env</th>
            <th>Owner</th>
            <th>Connector</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td style={{ fontWeight: 600 }}>{p.name}</td>
              <td><Status status={p.status} /></td>
              <td className="mono muted">{p.environment}</td>
              <td>{p.ownerName ?? '—'}</td>
              <td className="mono muted" style={{ fontSize: 12 }}>{p.connectorUrl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Actions({
  projects,
  onTrigger,
}: {
  projects: ProjectRecord[];
  onTrigger: (projectId: string, action: string) => void;
}) {
  const [pid, setPid] = useState(projects[0]?.id ?? '');
  useEffect(() => {
    if (!pid && projects[0]) setPid(projects[0].id);
  }, [projects, pid]);

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="section-title">Dispatch a control action</div>
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
        Actions route through the Hub control plane, verify ownership, and are logged to the
        incident trail.
      </p>
      <select className="select" value={pid} onChange={(e) => setPid(e.target.value)} style={{ width: '100%', marginBottom: 16 }}>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <div className="row">
        <button className="btn btn-primary" onClick={() => onTrigger(pid, 'restart')}>↻ Restart</button>
        <button className="btn" onClick={() => onTrigger(pid, 'clear_cache')}>✸ Clear cache</button>
        <button className="btn" onClick={() => onTrigger(pid, 'rollback')}>⟲ Rollback</button>
        <button className="btn btn-danger" onClick={() => onTrigger(pid, 'kill')}>■ Kill switch</button>
      </div>
    </div>
  );
}

function Incidents({ log }: { log: ActionLogEntry[] }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table className="table">
        <thead>
          <tr>
            <th>When</th>
            <th>Project</th>
            <th>Action</th>
            <th>By</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {log.map((e) => (
            <tr key={e.id}>
              <td className="mono muted" style={{ fontSize: 12 }}>
                {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}
              </td>
              <td>{e.projectName ?? e.projectId}</td>
              <td className="mono">{e.action}</td>
              <td>{e.memberName ?? '—'}</td>
              <td className="mono muted" style={{ fontSize: 12 }}>{e.result}</td>
            </tr>
          ))}
          {log.length === 0 && (
            <tr><td colSpan={5} className="muted" style={{ padding: 24 }}>No incidents logged.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Content() {
  return (
    <div className="card" style={{ maxWidth: 620 }}>
      <div className="section-title">Content management</div>
      <p className="muted" style={{ marginBottom: 18, fontSize: 13 }}>
        Blog posts, services, and team profiles are edited in the Payload admin, embedded
        here in a native window — you never leave the app.
      </p>
      <button className="btn btn-primary" onClick={() => openAdminWindow(`${HUB}/admin`)}>
        Open content editor →
      </button>
      <p className="mono muted" style={{ marginTop: 16, fontSize: 11 }}>
        {HUB}/admin
      </p>
    </div>
  );
}
