/**
 * AAF11 Nexus — shared contract types.
 *
 * These types are the single source of truth for the shapes that cross
 * component boundaries: SDK connector endpoints, SDK→Hub registration/ingest,
 * and Hub→public-website read APIs. Every component imports from here so the
 * wire format can never drift between SDK, Hub, desktop, and web.
 */

// ---------------------------------------------------------------------------
// Core enums
// ---------------------------------------------------------------------------

export type HealthStatus = 'healthy' | 'degraded' | 'down';
export type Environment = 'production' | 'staging' | 'development';
export type MemberRole = 'admin' | 'member';

// ---------------------------------------------------------------------------
// Connector endpoints — what each project's SDK exposes under /aaf11/*
// ---------------------------------------------------------------------------

/** GET /aaf11/meta */
export interface ProjectMeta {
  name: string;
  version: string;
  environment: Environment;
  description?: string;
  tags?: string[];
  members?: string[];
}

/** GET /aaf11/health */
export interface HealthReport {
  status: HealthStatus;
  uptimeSeconds: number;
  lastRestart?: string; // ISO 8601
  timestamp: string; // ISO 8601
}

/** GET /aaf11/metrics */
export interface MetricsReport {
  requestCount: number;
  activeUsers?: number;
  errorRate: number; // 0..1
  /** Project-specific stats registered via the SDK. */
  custom?: Record<string, number>;
  timestamp: string; // ISO 8601
}

/** One entry of GET /aaf11/actions */
export interface ActionDescriptor {
  id: string;
  label: string;
  description?: string;
}

/** Result of POST /aaf11/actions/:id */
export interface ActionResult {
  ok: boolean;
  result?: unknown;
  error?: string;
}

// ---------------------------------------------------------------------------
// SDK → Hub
// ---------------------------------------------------------------------------

/** POST /api/register — sent by the SDK on startup. */
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

/** A health+metrics snapshot the Hub stores (poller-produced or pushed). */
export interface MetricsSnapshot {
  projectId: string;
  timestamp: string; // ISO 8601
  health: HealthStatus;
  requestCount: number;
  errorRate: number;
  customData?: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Hub → Desktop (private, authed) — registry view
// ---------------------------------------------------------------------------

export interface ProjectRecord {
  id: string;
  name: string;
  connectorUrl: string;
  projectKey: string;
  ownerId: string;
  ownerName?: string;
  status: HealthStatus;
  environment: Environment;
  lastSeen?: string; // ISO 8601
  tags?: string[];
}

export interface ActionLogEntry {
  id: string;
  projectId: string;
  projectName?: string;
  memberId: string;
  memberName?: string;
  action: string;
  timestamp: string; // ISO 8601
  result: string;
}

// ---------------------------------------------------------------------------
// Hub → Public website (read-only, whitelisted fields only)
// ---------------------------------------------------------------------------

export interface PublicProject {
  id: string;
  name: string;
  description?: string;
  status: HealthStatus;
  environment: string;
  tags?: string[];
}

export interface PublicTeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  github?: string;
  photoUrl?: string;
}

export interface PublicService {
  id: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  authorName?: string;
  publishedAt?: string; // ISO 8601
}
