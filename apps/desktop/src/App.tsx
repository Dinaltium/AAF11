import React, { useCallback, useEffect, useState } from 'react';
import type {
  ProjectRecord,
  ActionLogEntry,
  HealthStatus,
  ActionDescriptor,
} from '@aaf11/shared';
import { openAdminWindow } from './tauri';
import { isTestMode, getProjects, getActionLog, getActions, triggerAction } from './api';
import { useAuth } from './auth';
import { AppSidebar, type View } from '@/components/AppSidebar';
import { Sales } from '@/pages/Sales';
import { Logs } from '@/pages/Logs';
import { Users } from '@/pages/Users';
import { CreateUser } from '@/pages/CreateUser';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const HUB = (import.meta.env as Record<string, string | undefined>).AAF11_HUB_URL ?? 'http://localhost:3000';
const MEMBER_TOKEN =
  (import.meta.env as Record<string, string | undefined>).AAF11_MEMBER_TOKEN ?? 'mbr_rafan_test0001';

const TITLES: Record<View, string> = {
  sales: 'Sales',
  logs: 'Logs',
  users: 'Users',
  'create-user': 'Add user',
  projects: 'Projects',
  actions: 'Actions',
  incidents: 'Incidents',
  content: 'Content',
};

const LEGACY: View[] = ['projects', 'actions', 'incidents'];

/** Dot-free status label (no colored/glowing dots anywhere by design). */
function Status({ status }: { status: HealthStatus }) {
  const label = status === 'healthy' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Down';
  return <span className={`badge s-${status}`}>{label}</span>;
}

export function App() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>('sales');
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [log, setLog] = useState<ActionLogEntry[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProjects(await getProjects(MEMBER_TOKEN));
      setLog(await getActionLog(MEMBER_TOKEN).catch(() => []));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <SidebarProvider>
      <AppSidebar view={view} setView={setView} email={user?.email ?? null} onSignOut={signOut} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <div className="text-sm">
            <span className="text-muted-foreground">AAF11 Nexus</span>
            <span className="text-muted-foreground mx-1.5">/</span>
            <span className="font-medium">{TITLES[view]}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-[11px] tracking-wide uppercase">
              {isTestMode() ? 'Test' : 'Live'}
            </span>
            {LEGACY.includes(view) && (
              <Button size="sm" variant="outline" onClick={() => load()} disabled={loading}>
                {loading ? 'Syncing…' : 'Refresh'}
              </Button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-5">
          {view === 'sales' && <Sales />}
          {view === 'logs' && <Logs />}
          {view === 'users' && <Users onCreate={() => setView('create-user')} />}
          {view === 'create-user' && (
            <CreateUser
              onCancel={() => setView('users')}
              onCreated={(m) => {
                showToast(m);
                setView('users');
              }}
            />
          )}
          {view === 'projects' && <Projects projects={projects} />}
          {view === 'actions' && (
            <Actions
              projects={projects}
              onTrigger={async (pid, action) => {
                const r = await triggerAction(pid, action, MEMBER_TOKEN);
                showToast(r.ok ? `${action} dispatched` : `${r.error ?? 'failed'}`);
                setLog(await getActionLog(MEMBER_TOKEN).catch(() => log));
              }}
            />
          )}
          {view === 'incidents' && <Incidents log={log} />}
          {view === 'content' && <Content />}
        </div>
      </SidebarInset>

      {toast && <div className="toast">{toast}</div>}
    </SidebarProvider>
  );
}

/* ---- legacy views (kept, dot-free; restyled one at a time) --------------- */

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
        incident trail.
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
        <p className="muted" style={{ fontSize: 13 }}>loading actions…</p>
      ) : !reachable ? (
        <p className="muted" style={{ fontSize: 13 }}>Connector unreachable — is the project running?</p>
      ) : actions.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>This project exposes no actions.</p>
      ) : (
        <div className="row">
          {actions.map((a) => (
            <button key={a.id} className={classFor(a.id)} title={a.description ?? a.id} onClick={() => onTrigger(pid, a.id)}>
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
        Blog posts, services, and team profiles are edited in the Payload admin, embedded here in a
        native window.
      </p>
      <button className="btn btn-primary" onClick={() => openAdminWindow(`${HUB}/admin`)}>
        Open content editor →
      </button>
      <p className="mono muted" style={{ marginTop: 16, fontSize: 11 }}>{HUB}/admin</p>
    </div>
  );
}
