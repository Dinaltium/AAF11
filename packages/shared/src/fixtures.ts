/**
 * Deterministic mock fixtures for TEST mode.
 *
 * Used by the Hub seed script and by SDK/demo paths when AAF11_DATA_MODE=test.
 * All timestamps are fixed (no clock reads) so tests and snapshots are stable.
 * NEVER imported by real-mode code paths.
 */

import type {
  ActionLogEntry,
  Environment,
  HealthStatus,
  MemberRole,
  MetricsSnapshot,
} from './types.js';

export interface MockMember {
  id: string;
  name: string;
  email: string;
  memberToken: string;
  role: MemberRole;
  password: string; // dev-only seed password for Payload auth
}

export interface MockProject {
  id: string;
  name: string;
  connectorUrl: string;
  projectKey: string;
  ownerId: string;
  status: HealthStatus;
  environment: Environment;
  lastSeen: string;
  description: string;
  tags: string[];
}

export interface MockBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorId: string;
  published: boolean;
  publishedAt: string;
}

export interface MockService {
  id: string;
  title: string;
  description: string;
  tags: string[];
  visible: boolean;
}

export interface MockTeamProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  github: string;
  visible: boolean;
}

const T0 = '2026-06-21T00:00:00.000Z';

export const mockMembers: MockMember[] = [
  {
    id: 'mbr_rafan',
    name: 'Rafan',
    email: 'rafan79200@gmail.com',
    memberToken: 'mbr_rafan_test0001',
    role: 'admin',
    password: 'test-rafan-pw',
  },
  {
    id: 'mbr_aisha',
    name: 'Aisha',
    email: 'aisha@aaf11.test',
    memberToken: 'mbr_aisha_test0002',
    role: 'member',
    password: 'test-aisha-pw',
  },
];

export const mockProjects: MockProject[] = [
  {
    id: 'proj_buslink',
    name: 'BusLink',
    connectorUrl: 'https://buslink.aaf11.test',
    projectKey: 'proj_buslink_test001',
    ownerId: 'mbr_rafan',
    status: 'healthy',
    environment: 'production',
    lastSeen: T0,
    description: 'Real-time bus tracking for commuters.',
    tags: ['web', 'iot', 'maps'],
  },
  {
    id: 'proj_medassist',
    name: 'Medicine Assistant',
    connectorUrl: 'https://medassist.aaf11.test',
    projectKey: 'proj_medassist_test002',
    ownerId: 'mbr_aisha',
    status: 'degraded',
    environment: 'production',
    lastSeen: T0,
    description: 'Prescription and reminder assistant.',
    tags: ['web', 'ai', 'health'],
  },
  {
    id: 'proj_nexus_site',
    name: 'AAF11 Website',
    connectorUrl: 'https://aaf11.test',
    projectKey: 'proj_site_test003',
    ownerId: 'mbr_rafan',
    status: 'healthy',
    environment: 'production',
    lastSeen: T0,
    description: 'The public-facing team portfolio.',
    tags: ['web', 'marketing'],
  },
  {
    id: 'proj_labbot',
    name: 'LabBot',
    connectorUrl: 'https://labbot.aaf11.test',
    projectKey: 'proj_labbot_test004',
    ownerId: 'mbr_aisha',
    status: 'down',
    environment: 'staging',
    lastSeen: '2026-06-20T23:51:00.000Z',
    description: 'Lab automation controller.',
    tags: ['iot', 'bot'],
  },
];

export const mockServices: MockService[] = [
  {
    id: 'svc_web',
    title: 'Web Application Development',
    description: 'Full-stack web apps built with Next.js and modern tooling.',
    tags: ['nextjs', 'fullstack'],
    visible: true,
  },
  {
    id: 'svc_iot',
    title: 'IoT & Embedded Systems',
    description: 'Connected devices, telemetry, and control systems.',
    tags: ['iot', 'embedded'],
    visible: true,
  },
  {
    id: 'svc_ai',
    title: 'AI Integration',
    description: 'Local and hosted LLM features embedded into products.',
    tags: ['ai', 'llm'],
    visible: true,
  },
];

export const mockTeam: MockTeamProfile[] = [
  {
    id: 'team_rafan',
    name: 'Rafan',
    role: 'Founder & Lead Engineer',
    bio: 'Builds platforms, ships products, runs Team AAF11.',
    github: 'https://github.com/rafan',
    visible: true,
  },
  {
    id: 'team_aisha',
    name: 'Aisha',
    role: 'Backend & AI Engineer',
    bio: 'Health-tech and AI systems.',
    github: 'https://github.com/aisha',
    visible: true,
  },
];

export const mockBlogPosts: MockBlogPost[] = [
  {
    id: 'post_launch',
    title: 'Introducing AAF11 Nexus',
    slug: 'introducing-aaf11-nexus',
    excerpt: 'One hub to monitor, manage, and showcase everything we build.',
    body:
      'AAF11 Nexus is our internal operations hub. It aggregates the health ' +
      'and metrics of every project, gives us one-click control, and powers ' +
      'this very website. Federated by design: if the Hub goes down, every ' +
      'project keeps running.',
    authorId: 'mbr_rafan',
    published: true,
    publishedAt: T0,
  },
  {
    id: 'post_buslink',
    title: 'How BusLink Tracks Buses in Real Time',
    slug: 'how-buslink-tracks-buses',
    excerpt: 'A look at the telemetry pipeline behind BusLink.',
    body:
      'BusLink ingests GPS pings, smooths them, and serves live positions to ' +
      'commuters. Here is how the connector reports its health to Nexus.',
    authorId: 'mbr_rafan',
    published: true,
    publishedAt: '2026-06-20T12:00:00.000Z',
  },
];

/** A short deterministic time series per project for charts in test mode. */
export function mockSnapshots(): MetricsSnapshot[] {
  const out: MetricsSnapshot[] = [];
  const baseMs = Date.parse('2026-06-21T00:00:00.000Z');
  for (const p of mockProjects) {
    for (let i = 0; i < 12; i++) {
      const ts = new Date(baseMs - (11 - i) * 60_000).toISOString();
      const degraded = p.status === 'degraded';
      const down = p.status === 'down';
      out.push({
        projectId: p.id,
        timestamp: ts,
        health: down ? 'down' : degraded && i > 6 ? 'degraded' : 'healthy',
        requestCount: 100 + i * 7 + (degraded ? 0 : 20),
        errorRate: down ? 1 : degraded ? 0.08 + i * 0.005 : 0.01,
        customData: { active_users: 10 + i * (down ? 0 : 2) },
      });
    }
  }
  return out;
}

export function mockActionLog(): ActionLogEntry[] {
  return [
    {
      id: 'log_1',
      projectId: 'proj_medassist',
      projectName: 'Medicine Assistant',
      memberId: 'mbr_aisha',
      memberName: 'Aisha',
      action: 'restart',
      timestamp: '2026-06-20T23:40:00.000Z',
      result: 'success',
    },
    {
      id: 'log_2',
      projectId: 'proj_labbot',
      projectName: 'LabBot',
      memberId: 'mbr_rafan',
      memberName: 'Rafan',
      action: 'kill',
      timestamp: '2026-06-20T23:52:00.000Z',
      result: 'success',
    },
  ];
}
