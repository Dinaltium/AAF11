/**
 * Poller logic — hits each project's /aaf11/health and /aaf11/metrics and
 * records a snapshot.
 *
 * NOTE: scheduled polling (cron route / interval worker) is currently disabled.
 * This module is retained as a library — call pollAll() from a future cron route
 * or worker to re-enable polling without rebuilding the logic. It is exercised by
 * the logic tests.
 */
import type { Payload } from 'payload';
import type { HealthReport, HealthStatus, MetricsReport } from '@aaf11/shared';
import { recordSnapshot } from './ingest';
import type { FetchLike } from './control';

export interface PollResult {
  projectId: string | number;
  ok: boolean;
  health: HealthStatus;
  error?: string;
}

export async function pollProject(
  payload: Payload,
  project: { id: string | number; connectorUrl: string },
  fetchImpl?: FetchLike,
): Promise<PollResult> {
  const f: FetchLike = fetchImpl ?? (globalThis.fetch as unknown as FetchLike);
  const base = project.connectorUrl.replace(/\/$/, '');
  try {
    const [health, metrics] = await Promise.all([
      f(`${base}/aaf11/health`).then((r) => r.json() as Promise<HealthReport>),
      f(`${base}/aaf11/metrics`).then((r) => r.json() as Promise<MetricsReport>),
    ]);
    await recordSnapshot(payload, {
      projectId: project.id,
      health: health.status,
      requestCount: metrics.requestCount,
      errorRate: metrics.errorRate,
      customData: metrics.custom,
    });
    return { projectId: project.id, ok: true, health: health.status };
  } catch (err) {
    // Unreachable connector → mark down (3 consecutive downs trigger alerts).
    await recordSnapshot(payload, {
      projectId: project.id,
      health: 'down',
      requestCount: 0,
      errorRate: 1,
    });
    return {
      projectId: project.id,
      ok: false,
      health: 'down',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function pollAll(payload: Payload, fetchImpl?: FetchLike): Promise<PollResult[]> {
  const projects = await payload.find({
    collection: 'projects',
    limit: 500,
    overrideAccess: true,
    depth: 0,
  });
  const results: PollResult[] = [];
  for (const p of projects.docs) {
    results.push(await pollProject(payload, { id: p.id, connectorUrl: p.connectorUrl }, fetchImpl));
  }
  return results;
}
