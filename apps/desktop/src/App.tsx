import React, { useCallback, useEffect, useState } from 'react';
import type {
  ProjectRecord,
  ActionLogEntry,
  MetricsSnapshot,
  HealthStatus,
  ActionDescriptor,
} from '@aaf11/shared';
import { Chart } from './components/Chart';
import { openAdminWindow, notify } from './tauri';
import {
  isTestMode,
  getProjects,
  getSnapshots,
  getActionLog,
  getActions,
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
  const [hubOk, setHubOk] = useState(true);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ps = await getProjects(MEMBER_TOKEN);
      setProjects(ps);
      const map: Record<string, MetricsSnapshot[]> = {};
      for (const p of ps) map[p.id] = await getSnapshots(p.id, MEMBER_TOKEN).catch(() => []);
      setSnaps(map);
      setLog(await getActionLog(MEMBER_TOKEN).catch(() => []));
      setHubOk(true);
    } catch {
      // real mode + Hub unreachable: flag it, keep last-known data
      setHubOk(false);
    } finally {
      setLastSync(Date.now());
      setLoading(false);
    }
  }, []);

  // Initial load + a slow hourly safety sync. Use the Refresh button for
  // on-demand updates while working.
  useEffect(() => {
    load();
    const id = setInterval(load, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(id);
  }, [load]);

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
          <div className="row" style={{ gap: 14 }}>
            {!isTestMode() && (
              <span
                className="mono"
                style={{ fontSize: 11, color: hubOk ? 'var(--ok)' : 'var(--down)' }}
                title={hubOk ? 'Hub reachable' : 'Hub unreachable — is it running?'}
              >
                ● {hubOk ? 'hub live' : 'hub unreachable'}
              </span>
            )}
            <span className="mono muted" style={{ fontSize: 11 }}>
              {loading ? 'syncing…' : lastSync ? `synced ${Math.round((Date.now() - lastSync) / 1000)}s ago` : '—'}
            </span>
            <button className="btn" onClick={() => load()} disabled={loading}>
              ↻ Refresh
            </button>
            <span className={`mode-pill ${isTestMode() ? 'mode-test' : 'mode-real'}`}>
              {isTestMode() ? 'TEST MODE' : 'REAL MODE'}
            </span>
          </div>
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
      {projects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div className="card-title">No projects connected</div>
          <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
            Start the Hub and connect a project with the SDK, then hit{' '}
            <span className="mono">Refresh</span>. (Auto-syncs hourly.)
          </p>
        </div>
      )}
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
  const [actions, setActions] = useState<ActionDescriptor[]>([]);
  const [reachable, setReachable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pid && projects[0]) setPid(projects[0].id);
  }, [projects, pid]);

  useEffect(() => {
    if (!pid) return;
    let cancelled = false;
    setLoading(true);
    getActions(pid, MEMBER_TOKEN)
      .then((r) => {
        if (cancelled) return;
        setActions(r.actions);
        setReachable(r.reachable);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pid]);

  function classFor(id: string): string {
    if (id === 'kill') return 'btn btn-danger';
    if (id === 'restart') return 'btn btn-primary';
    return 'btn';
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="section-title">Dispatch a control action</div>
      <p className="muted" style={{ marginBottom: 16, fontSize: 13 }}>
        Actions route through the Hub control plane, verify ownership, and are logged to the
        incident trail. Buttons reflect what this project actually exposes.
      </p>
      <select
        className="select"
        value={pid}
        onChange={(e) => setPid(e.target.value)}
        style={{ width: '100%', marginBottom: 16 }}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {loading ? (
        <p className="muted" style={{ fontSize: 13 }}>
          loading actions…
        </p>
      ) : !reachable ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Connector unreachable — can&apos;t list actions. Is the project running?
        </p>
      ) : actions.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>
          This project exposes no actions. Register some with{' '}
          <span className="mono">connector.registerAction(...)</span>.
        </p>
      ) : (
        <div className="row">
          {actions.map((a) => (
            <button
              key={a.id}
              className={classFor(a.id)}
              title={a.description ?? a.id}
              onClick={() => onTrigger(pid, a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
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
