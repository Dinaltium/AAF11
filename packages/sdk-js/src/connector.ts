import type {
  ActionDescriptor,
  ActionResult,
  Environment,
  HealthReport,
  HealthStatus,
  MetricsReport,
  ProjectMeta,
  RegistrationPayload,
  RegistrationResponse,
} from './types.js';

export interface ConnectorConfig {
  /** proj_* key for this project (from env: AAF11_PROJECT_KEY). */
  projectKey: string;
  /** mbr_* token of the owning member (from env: AAF11_MEMBER_TOKEN). */
  memberToken: string;
  name: string;
  version: string;
  environment?: Environment;
  /** Base URL of the Hub API (from env: AAF11_HUB_URL). */
  hubUrl?: string;
  /** Public URL where this connector is reachable (for registration). */
  connectorUrl?: string;
  description?: string;
  tags?: string[];
  members?: string[];
  /** Mount prefix for the connector routes. Default '/aaf11'. */
  basePath?: string;
  /** Optional custom health resolver; defaults to 'healthy'. */
  healthProvider?: () => HealthStatus | Promise<HealthStatus>;
}

export interface ConnectorRequest {
  method: string;
  path: string;
  headers?: Record<string, string | undefined>;
  body?: unknown;
}

export interface ConnectorResponse {
  status: number;
  body: unknown;
}

type MetricFn = () => number | Promise<number>;
type ActionFn = (payload?: unknown) => unknown | Promise<unknown>;

interface RegisteredAction {
  fn: ActionFn;
  descriptor: ActionDescriptor;
}

/**
 * The connector embedded in a team project. It:
 *  - exposes the standard /aaf11/* endpoints (via handle(), express(), or http()),
 *  - registers the project with the Hub on start(),
 *  - tracks request/error counters and custom metrics,
 *  - runs owner-authenticated control actions.
 */
export class AAF11Connector {
  readonly config: Required<
    Pick<ConnectorConfig, 'basePath' | 'environment'>
  > &
    ConnectorConfig;

  private readonly startedAtMs = Date.now();
  private lastRestart: string;
  private requestCount = 0;
  private errorCount = 0;
  private readonly metrics = new Map<string, MetricFn>();
  private readonly actions = new Map<string, RegisteredAction>();
  private lastConfig: unknown = null;

  constructor(config: ConnectorConfig) {
    this.config = {
      basePath: config.basePath ?? '/aaf11',
      environment: config.environment ?? 'production',
      ...config,
    };
    this.lastRestart = new Date(this.startedAtMs).toISOString();
  }

  // ---- instrumentation -----------------------------------------------------

  /** Call once per inbound request in the host app to populate metrics. */
  trackRequest(): void {
    this.requestCount += 1;
  }

  /** Call when a request errors. */
  trackError(): void {
    this.errorCount += 1;
  }

  /** Register a custom numeric metric exposed under metrics.custom. */
  registerMetric(name: string, fn: MetricFn): void {
    this.metrics.set(name, fn);
  }

  /** Register a triggerable control action. */
  registerAction(
    id: string,
    fn: ActionFn,
    opts: { label?: string; description?: string } = {},
  ): void {
    this.actions.set(id, {
      fn,
      descriptor: { id, label: opts.label ?? id, description: opts.description },
    });
  }

  // ---- endpoint payloads ---------------------------------------------------

  meta(): ProjectMeta {
    return {
      name: this.config.name,
      version: this.config.version,
      environment: this.config.environment,
      description: this.config.description,
      tags: this.config.tags,
      members: this.config.members,
    };
  }

  async health(): Promise<HealthReport> {
    const status = this.config.healthProvider
      ? await this.config.healthProvider()
      : 'healthy';
    return {
      status,
      uptimeSeconds: Math.floor((Date.now() - this.startedAtMs) / 1000),
      lastRestart: this.lastRestart,
      timestamp: new Date().toISOString(),
    };
  }

  async metricsReport(): Promise<MetricsReport> {
    const custom: Record<string, number> = {};
    for (const [name, fn] of this.metrics) {
      custom[name] = await fn();
    }
    return {
      requestCount: this.requestCount,
      errorRate: this.requestCount === 0 ? 0 : this.errorCount / this.requestCount,
      custom,
      timestamp: new Date().toISOString(),
    };
  }

  listActions(): ActionDescriptor[] {
    return [...this.actions.values()].map((a) => a.descriptor);
  }

  async runAction(id: string, payload?: unknown): Promise<ActionResult> {
    const action = this.actions.get(id);
    if (!action) return { ok: false, error: `Unknown action "${id}"` };
    try {
      const result = await action.fn(payload);
      return { ok: true, result };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // ---- registration --------------------------------------------------------

  /** Register this project with the Hub. Never throws — logs and returns. */
  async start(): Promise<RegistrationResponse> {
    const hubUrl = this.config.hubUrl;
    if (!hubUrl) {
      return { ok: false, error: 'No hubUrl configured; skipping registration.' };
    }
    const payload: RegistrationPayload = {
      projectKey: this.config.projectKey,
      memberToken: this.config.memberToken,
      projectName: this.config.name,
      version: this.config.version,
      environment: this.config.environment,
      connectorUrl: this.config.connectorUrl ?? '',
    };
    try {
      const res = await fetch(`${hubUrl.replace(/\/$/, '')}/api/register`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as RegistrationResponse;
      return data;
    } catch (err) {
      // The Hub being unreachable must never crash the host project.
      return {
        ok: false,
        error: `Hub registration failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // ---- request handling (framework-agnostic) -------------------------------

  private bearer(req: ConnectorRequest): string | null {
    const h = req.headers?.['authorization'] ?? req.headers?.['Authorization'];
    if (!h) return null;
    const m = /^Bearer\s+(.+)$/i.exec(h);
    return m ? m[1]!.trim() : null;
  }

  private authorized(req: ConnectorRequest): boolean {
    return this.bearer(req) === this.config.memberToken;
  }

  /**
   * Core router. Returns a status + JSON body for any request. Adapters
   * (express, node http) wrap this.
   */
  async handle(req: ConnectorRequest): Promise<ConnectorResponse> {
    const base = this.config.basePath;
    const path = req.path.replace(/\/+$/, '') || req.path;
    const method = req.method.toUpperCase();

    if (path === `${base}/meta` && method === 'GET') {
      return { status: 200, body: this.meta() };
    }
    if (path === `${base}/health` && method === 'GET') {
      return { status: 200, body: await this.health() };
    }
    if (path === `${base}/metrics` && method === 'GET') {
      return { status: 200, body: await this.metricsReport() };
    }
    if (path === `${base}/actions` && method === 'GET') {
      return { status: 200, body: { actions: this.listActions() } };
    }

    const actionMatch = new RegExp(`^${base}/actions/([^/]+)$`).exec(path);
    if (actionMatch && method === 'POST') {
      if (!this.authorized(req)) {
        return { status: 401, body: { ok: false, error: 'Unauthorized' } };
      }
      const result = await this.runAction(actionMatch[1]!, req.body);
      return { status: result.ok ? 200 : 400, body: result };
    }

    if (path === `${base}/config` && method === 'POST') {
      if (!this.authorized(req)) {
        return { status: 401, body: { ok: false, error: 'Unauthorized' } };
      }
      this.lastConfig = req.body;
      return { status: 200, body: { ok: true } };
    }

    return { status: 404, body: { ok: false, error: 'Not found' } };
  }

  /** Last config received via POST /aaf11/config (Phase 3). */
  getLastConfig(): unknown {
    return this.lastConfig;
  }
}
