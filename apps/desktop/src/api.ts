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
  type HealthStatus,
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
  const res = await fetch(`${HUB}/api/projects?limit=200&depth=1`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Hub /api/projects → ${res.status}`);
  const data = (await res.json()) as { docs: any[] };
  return data.docs.map((d) => ({
    id: String(d.id),
    name: d.name,
    connectorUrl: d.connectorUrl,
    projectKey: d.projectKey,
    ownerId: typeof d.owner === 'object' ? String(d.owner?.id) : String(d.owner ?? ''),
    ownerName: typeof d.owner === 'object' ? d.owner?.name : undefined,
    status: (d.status ?? 'healthy') as HealthStatus,
    environment: d.environment ?? 'production',
    lastSeen: d.lastSeen ?? undefined,
    tags: Array.isArray(d.tags) ? d.tags : [],
  }));
}

export async function getSnapshots(
  projectId: string,
  token?: string,
): Promise<MetricsSnapshot[]> {
  if (isTestMode()) {
    return mockSnapshots().filter((s) => s.projectId === projectId);
  }
  const res = await fetch(
    `${HUB}/api/metrics_snapshots?where[project][equals]=${projectId}&sort=timestamp&limit=50`,
    { headers: authHeaders(token) },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { docs: any[] };
  return data.docs.map((d) => ({
    projectId,
    timestamp: d.timestamp,
    health: d.health,
    requestCount: d.requestCount ?? 0,
    errorRate: d.errorRate ?? 0,
    customData: d.customData ?? undefined,
  }));
}

export async function getActionLog(token?: string): Promise<ActionLogEntry[]> {
  if (isTestMode()) return mockActionLog();
  const res = await fetch(`${HUB}/api/actions_log?sort=-timestamp&limit=100&depth=1`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { docs: any[] };
  return data.docs.map((d) => ({
    id: String(d.id),
    projectId: typeof d.project === 'object' ? String(d.project?.id) : String(d.project),
    projectName: typeof d.project === 'object' ? d.project?.name : undefined,
    memberId: typeof d.member === 'object' ? String(d.member?.id) : String(d.member),
    memberName: typeof d.member === 'object' ? d.member?.name : undefined,
    action: d.action,
    timestamp: d.timestamp,
    result: d.result,
  }));
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
