/** Data shaping for the desktop app's private (member-token authed) endpoints. */
import type { Payload } from 'payload';
import type { ActionLogEntry, MetricsSnapshot, ProjectRecord, HealthStatus } from '@aaf11/shared';

function tagList(tags: unknown): string[] {
  return Array.isArray(tags) ? (tags.filter((t) => typeof t === 'string') as string[]) : [];
}

export async function listProjects(payload: Payload): Promise<ProjectRecord[]> {
  const res = await payload.find({
    collection: 'projects',
    limit: 200,
    overrideAccess: true,
    depth: 1,
  });
  return res.docs.map((d) => ({
    id: String(d.id),
    name: d.name,
    connectorUrl: d.connectorUrl,
    projectKey: d.projectKey,
    ownerId: typeof d.owner === 'object' && d.owner ? String(d.owner.id) : String(d.owner ?? ''),
    ownerName: typeof d.owner === 'object' && d.owner ? d.owner.name : undefined,
    status: (d.status ?? 'healthy') as HealthStatus,
    environment: (d.environment ?? 'production') as ProjectRecord['environment'],
    lastSeen: d.lastSeen ?? undefined,
    tags: tagList(d.tags),
  }));
}

export async function listSnapshots(
  payload: Payload,
  projectId: string,
): Promise<MetricsSnapshot[]> {
  const res = await payload.find({
    collection: 'metrics_snapshots',
    where: { project: { equals: projectId } },
    sort: 'timestamp',
    limit: 50,
    overrideAccess: true,
    depth: 0,
  });
  return res.docs.map((d) => ({
    projectId: String(projectId),
    timestamp: d.timestamp,
    health: (d.health ?? 'healthy') as HealthStatus,
    requestCount: d.requestCount ?? 0,
    errorRate: d.errorRate ?? 0,
    customData: (d.customData as Record<string, number>) ?? undefined,
  }));
}

export async function listActionLog(payload: Payload): Promise<ActionLogEntry[]> {
  const res = await payload.find({
    collection: 'actions_log',
    sort: '-timestamp',
    limit: 100,
    overrideAccess: true,
    depth: 1,
  });
  return res.docs.map((d) => ({
    id: String(d.id),
    projectId: typeof d.project === 'object' && d.project ? String(d.project.id) : String(d.project),
    projectName: typeof d.project === 'object' && d.project ? d.project.name : undefined,
    memberId: typeof d.member === 'object' && d.member ? String(d.member.id) : String(d.member),
    memberName: typeof d.member === 'object' && d.member ? d.member.name : undefined,
    action: d.action,
    timestamp: d.timestamp,
    result: d.result ?? '',
  }));
}
