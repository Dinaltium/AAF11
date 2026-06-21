import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Isolate these tests in a UNIQUE fresh SQLite DB per run so they never collide
// with the dev seed DB and never reuse a stale/locked file (a leftover -wal from
// a force-killed process causes libsql to hang). pid makes the name unique.
process.env.AAF11_DATA_MODE ||= 'test';
process.env.PAYLOAD_SECRET ||= 'dev-test-secret';
// Best-effort sweep of any leftover test DBs from previous runs.
try {
  for (const f of fs.readdirSync(os.tmpdir())) {
    if (f.startsWith('aaf11-logic-test-')) {
      try {
        fs.rmSync(path.join(os.tmpdir(), f));
      } catch {
        /* locked/in-use — skip */
      }
    }
  }
} catch {
  /* tmpdir unreadable — skip */
}
const TESTDB = path.join(os.tmpdir(), `aaf11-logic-test-${process.pid}.db`);
process.env.AAF11_SQLITE_URL = `file:${TESTDB}`;

import { getPayload, type Payload } from 'payload';
import { registerProject } from './registration.js';
import { recordSnapshot } from './ingest.js';
import { dispatchAction, type FetchLike } from './control.js';
import { pollAll } from './poller.js';
import { getPublicProjects, getPublicBlog } from './public.js';

let payload: Payload;
const S = 'logictest';

const mockFetch: FetchLike = async (url) => ({
  json: async () => {
    if (url.endsWith('/health')) return { status: 'healthy', uptimeSeconds: 10, timestamp: 'x' };
    if (url.endsWith('/metrics')) return { requestCount: 5, errorRate: 0.2, custom: { x: 1 } };
    return { ok: true, result: { done: true } };
  },
});

before(async () => {
  // Dynamic import AFTER AAF11_SQLITE_URL is set above — a static import would
  // hoist above the env assignment and build the adapter with the wrong path.
  const config = (await import('../payload.config.js')).default;
  payload = await getPayload({ config });
});

// Close the libsql connection after the suite. Without this teardown the open
// DB handle confuses node:test's completion detection on CI, intermittently
// cancelling the suite with "Promise resolution is still pending but the event
// loop has already resolved".
after(async () => {
  try {
    await (payload as unknown as { destroy?: () => Promise<void> })?.destroy?.();
  } catch {
    /* ignore teardown errors */
  }
});

async function makeMember(suffix: string, role: 'admin' | 'member' = 'member') {
  return payload.create({
    collection: 'members',
    data: {
      name: `M-${suffix}`,
      email: `${suffix}@aaf11.test`,
      password: 'pw-' + suffix,
      role,
      memberToken: `mbr_${suffix}`,
    },
    overrideAccess: true,
  });
}

test('registerProject creates then upserts', async () => {
  await makeMember(`${S}_owner`);
  const data = {
    projectKey: `proj_${S}_a`,
    memberToken: `mbr_${S}_owner`,
    projectName: 'LogicProj',
    version: '1.0.0',
    environment: 'production' as const,
    connectorUrl: 'https://logic.aaf11.test',
  };
  const first = await registerProject(payload, data);
  assert.equal(first.ok, true);
  assert.ok(first.projectId);

  const again = await registerProject(payload, { ...data, version: '1.1.0' });
  assert.equal(again.ok, true);
  assert.equal(again.projectId, first.projectId, 'upsert keeps same project');

  const found = await payload.find({
    collection: 'projects',
    where: { projectKey: { equals: data.projectKey } },
    overrideAccess: true,
  });
  assert.equal(found.totalDocs, 1);
});

test('registerProject rejects unknown member token', async () => {
  const res = await registerProject(payload, {
    projectKey: `proj_${S}_x`,
    memberToken: 'mbr_nobody',
    projectName: 'X',
    version: '1',
    environment: 'production',
    connectorUrl: 'https://x.test',
  });
  assert.equal(res.ok, false);
  assert.match(res.error ?? '', /member token/i);
});

test('recordSnapshot updates project status', async () => {
  const proj = (
    await payload.find({
      collection: 'projects',
      where: { projectKey: { equals: `proj_${S}_a` } },
      overrideAccess: true,
    })
  ).docs[0]!;
  await recordSnapshot(payload, {
    projectId: proj.id,
    health: 'degraded',
    requestCount: 9,
    errorRate: 0.1,
  });
  const updated = await payload.findByID({
    collection: 'projects',
    id: proj.id,
    overrideAccess: true,
  });
  assert.equal(updated.status, 'degraded');
});

test('dispatchAction enforces ownership and logs', async () => {
  const owner = await makeMember(`${S}_o2`);
  const stranger = await makeMember(`${S}_s2`);
  const proj = await payload.create({
    collection: 'projects',
    data: {
      name: 'OwnedProj',
      connectorUrl: 'https://owned.aaf11.test',
      projectKey: `proj_${S}_owned`,
      owner: owner.id,
      status: 'healthy',
    },
    overrideAccess: true,
  });

  const denied = await dispatchAction(payload, {
    projectId: proj.id,
    actionId: 'restart',
    memberToken: stranger.memberToken!,
    fetchImpl: mockFetch,
  });
  assert.equal(denied.status, 403);

  const bad = await dispatchAction(payload, {
    projectId: proj.id,
    actionId: 'restart',
    memberToken: 'mbr_nobody',
    fetchImpl: mockFetch,
  });
  assert.equal(bad.status, 401);

  const ok = await dispatchAction(payload, {
    projectId: proj.id,
    actionId: 'restart',
    memberToken: owner.memberToken!,
    fetchImpl: mockFetch,
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.body.ok, true);

  const logs = await payload.find({
    collection: 'actions_log',
    where: { project: { equals: proj.id } },
    overrideAccess: true,
  });
  assert.ok(logs.totalDocs >= 1, 'action was logged');
});

test('pollAll records snapshots for all projects', async () => {
  const before = (await payload.count({ collection: 'metrics_snapshots' })).totalDocs;
  const results = await pollAll(payload, mockFetch);
  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.ok));
  const after = (await payload.count({ collection: 'metrics_snapshots' })).totalDocs;
  assert.ok(after > before, 'new snapshots written');
});

test('public reads return whitelisted shapes', async () => {
  const projects = await getPublicProjects(payload);
  assert.ok(Array.isArray(projects));
  assert.ok(projects.every((p) => 'name' in p && 'status' in p && !('projectKey' in p)));

  const blog = await getPublicBlog(payload);
  assert.ok(Array.isArray(blog));
});
