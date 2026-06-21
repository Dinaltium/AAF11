/**
 * Desktop data layer.
 *
 * test mode: everything comes from bundled mock fixtures — the app is fully
 *            usable and demoable with NO backend running. Charts populate from
 *            the 48-point mock snapshot series.
 * real mode: reads the Hub private API (Payload REST) authenticated with the
 *            member token, and dispatches control actions to /api/control.
 */
import {
  mockProjects,
  mockMembers,
  mockSnapshots,
  mockActionLog,
  type ProjectRecord,
  type MetricsSnapshot,
  type ActionLogEntry,
  type ActionDescriptor,
} from '@aaf11/shared';

const env = import.meta.env as Record<string, string | undefined>;
const MODE = env.AAF11_DATA_MODE ?? 'test';
const HUB = env.AAF11_HUB_URL ?? 'http://localhost:3000';

export function isTestMode(): boolean {
  return MODE !== 'real';
}

const ownerName = (id: string) => mockMembers.find((m) => m.id === id)?.name;

function mockProjectRecords(): ProjectRecord[] {
  return mockProjects.map((p) => ({
    id: p.id,
    name: p.name,
    connectorUrl: p.connectorUrl,
    projectKey: p.projectKey,
    ownerId: p.ownerId,
    ownerName: ownerName(p.ownerId),
    status: p.status,
    environment: p.environment,
    lastSeen: p.lastSeen,
    tags: p.tags,
  }));
}

export async function getProjects(token?: string): Promise<ProjectRecord[]> {
  if (isTestMode()) return mockProjectRecords();
  const res = await fetch(`${HUB}/api/desktop/projects`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Hub /api/desktop/projects → ${res.status}`);
  const data = (await res.json()) as { projects: ProjectRecord[] };
  return data.projects;
}

export async function getSnapshots(
  projectId: string,
  token?: string,
): Promise<MetricsSnapshot[]> {
  if (isTestMode()) {
    return mockSnapshots().filter((s) => s.projectId === projectId);
  }
  const res = await fetch(
    `${HUB}/api/desktop/snapshots?projectId=${encodeURIComponent(projectId)}`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { snapshots: MetricsSnapshot[] };
  return data.snapshots;
}

export async function getActionLog(token?: string): Promise<ActionLogEntry[]> {
  if (isTestMode()) return mockActionLog();
  const res = await fetch(`${HUB}/api/desktop/incidents`, { headers: authHeaders(token) });
  if (!res.ok) return [];
  const data = (await res.json()) as { incidents: ActionLogEntry[] };
  return data.incidents;
}

export interface ActionList {
  actions: ActionDescriptor[];
  reachable: boolean;
}

/** Fetch the live action list a project exposes (proxied by the Hub). */
export async function getActions(projectId: string, token?: string): Promise<ActionList> {
  if (isTestMode()) {
    return {
      actions: [
        { id: 'restart', label: 'Restart' },
        { id: 'clear_cache', label: 'Clear cache' },
        { id: 'rollback', label: 'Rollback' },
        { id: 'kill', label: 'Kill switch' },
      ],
      reachable: true,
    };
  }
  const res = await fetch(`${HUB}/api/desktop/actions?projectId=${encodeURIComponent(projectId)}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return { actions: [], reachable: false };
  return (await res.json()) as ActionList;
}

export interface TriggerResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

export async function triggerAction(
  projectId: string,
  actionId: string,
  token: string,
): Promise<TriggerResult> {
  if (isTestMode()) {
    // Simulate a successful dispatch in test mode.
    return { ok: true, result: { simulated: true, action: actionId } };
  }
  const res = await fetch(`${HUB}/api/control/${projectId}/${actionId}`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify({}),
  });
  return (await res.json()) as TriggerResult;
}

function authHeaders(token?: string): Record<string, string> {
  // Payload expects the members auth header; we also send Bearer for our routes.
  if (!token) return {};
  return { Authorization: `Bearer ${token}`, 'X-Member-Token': token };
}
