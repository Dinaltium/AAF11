/**
 * Seed the Hub with deterministic mock data. TEST MODE ONLY.
 *
 * Proves end-to-end that the Payload config, collections, and SQLite adapter
 * all work, by writing the shared fixtures via the Local API. Guarded by
 * assertTest() so it can never run against real data.
 *
 * Run: pnpm --filter @aaf11/hub seed
 */
import { getPayload } from 'payload';
import {
  assertTest,
  mockMembers,
  mockProjects,
  mockServices,
  mockTeam,
  mockBlogPosts,
  mockSnapshots,
  mockActionLog,
} from '@aaf11/shared';
import config from './payload.config.js';

process.env.PAYLOAD_SECRET ||= 'dev-seed-secret';

async function wipe(payload: Awaited<ReturnType<typeof getPayload>>, slug: string) {
  await payload.delete({ collection: slug as never, where: { id: { exists: true } } });
}

async function seed() {
  assertTest('hub seed'); // refuse to run in real mode
  const payload = await getPayload({ config });

  // Clear in reverse-dependency order for idempotent re-seeding.
  for (const slug of [
    'actions_log',
    'metrics_snapshots',
    'cms_posts',
    'cms_team',
    'cms_services',
    'projects',
    'members',
  ]) {
    await wipe(payload, slug);
  }

  const memberId = new Map<string, number>();
  for (const m of mockMembers) {
    const created = await payload.create({
      collection: 'members',
      data: {
        name: m.name,
        email: m.email,
        password: m.password,
        role: m.role,
        memberToken: m.memberToken,
      },
    });
    memberId.set(m.id, created.id as number);
  }

  const projectId = new Map<string, number>();
  for (const p of mockProjects) {
    const created = await payload.create({
      collection: 'projects',
      data: {
        name: p.name,
        connectorUrl: p.connectorUrl,
        projectKey: p.projectKey,
        owner: memberId.get(p.ownerId),
        status: p.status,
        environment: p.environment,
        lastSeen: p.lastSeen,
        description: p.description,
        tags: p.tags,
        visible: true,
      },
    });
    projectId.set(p.id, created.id as number);
  }

  for (const s of mockServices) {
    await payload.create({
      collection: 'cms_services',
      data: { title: s.title, description: s.description, tags: s.tags, visible: s.visible },
    });
  }

  for (const t of mockTeam) {
    await payload.create({
      collection: 'cms_team',
      data: { name: t.name, role: t.role, bio: t.bio, github: t.github, visible: t.visible },
    });
  }

  for (const post of mockBlogPosts) {
    await payload.create({
      collection: 'cms_posts',
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        author: memberId.get(post.authorId),
        published: post.published,
        publishedAt: post.publishedAt,
        _status: post.published ? 'published' : 'draft',
      } as never,
    });
  }

  for (const snap of mockSnapshots()) {
    const pid = projectId.get(snap.projectId);
    if (!pid) continue;
    await payload.create({
      collection: 'metrics_snapshots',
      data: {
        project: pid,
        timestamp: snap.timestamp,
        health: snap.health,
        requestCount: snap.requestCount,
        errorRate: snap.errorRate,
        customData: snap.customData,
      },
    });
  }

  for (const log of mockActionLog()) {
    await payload.create({
      collection: 'actions_log',
      data: {
        project: projectId.get(log.projectId),
        member: memberId.get(log.memberId),
        action: log.action,
        timestamp: log.timestamp,
        result: log.result,
      },
    });
  }

  const counts = {
    members: (await payload.count({ collection: 'members' })).totalDocs,
    projects: (await payload.count({ collection: 'projects' })).totalDocs,
    services: (await payload.count({ collection: 'cms_services' })).totalDocs,
    team: (await payload.count({ collection: 'cms_team' })).totalDocs,
    posts: (await payload.count({ collection: 'cms_posts' })).totalDocs,
    snapshots: (await payload.count({ collection: 'metrics_snapshots' })).totalDocs,
    actions: (await payload.count({ collection: 'actions_log' })).totalDocs,
  };
  console.log('Seed complete:', JSON.stringify(counts));
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
