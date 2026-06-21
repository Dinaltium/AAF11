/** Snapshot ingestion — records a metrics snapshot and updates project status. */
import type { Payload } from 'payload';
import type { HealthStatus } from '@aaf11/shared';

export interface SnapshotInput {
  projectId: string | number;
  health: HealthStatus;
  requestCount: number;
  errorRate: number;
  customData?: Record<string, number>;
  timestamp?: string;
}

export async function recordSnapshot(payload: Payload, snap: SnapshotInput): Promise<void> {
  const ts = snap.timestamp ?? new Date().toISOString();
  await payload.create({
    collection: 'metrics_snapshots',
    data: {
      project: snap.projectId as number,
      timestamp: ts,
      health: snap.health,
      requestCount: snap.requestCount,
      errorRate: snap.errorRate,
      customData: snap.customData,
    },
    overrideAccess: true,
  });
  await payload.update({
    collection: 'projects',
    id: snap.projectId,
    data: { status: snap.health, lastSeen: ts },
    overrideAccess: true,
  });
}
