/**
 * Wire-format types for the connector. Self-contained so the published
 * `aaf11-sdk` package has no workspace dependency. These mirror the canonical
 * definitions in the Hub's @aaf11/shared — keep them in sync if the wire format
 * changes.
 */

export type HealthStatus = 'healthy' | 'degraded' | 'down';
export type Environment = 'production' | 'staging' | 'development';

export interface ProjectMeta {
  name: string;
  version: string;
  environment: Environment;
  description?: string;
  tags?: string[];
  members?: string[];
}

export interface HealthReport {
  status: HealthStatus;
  uptimeSeconds: number;
  lastRestart?: string;
  timestamp: string;
}

export interface MetricsReport {
  requestCount: number;
  activeUsers?: number;
  errorRate: number;
  custom?: Record<string, number>;
  timestamp: string;
}

export interface ActionDescriptor {
  id: string;
  label: string;
  description?: string;
}

export interface ActionResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

export interface RegistrationPayload {
  projectKey: string;
  memberToken: string;
  projectName: string;
  version: string;
  environment: Environment;
  connectorUrl: string;
}

export interface RegistrationResponse {
  ok: boolean;
  projectId?: string;
  error?: string;
}
