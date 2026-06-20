import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AAF11Connector } from './connector.js';
import type { HealthReport, MetricsReport, ProjectMeta } from '@aaf11/shared';

function make() {
  return new AAF11Connector({
    projectKey: 'proj_test_001',
    memberToken: 'mbr_test_001',
    name: 'TestProj',
    version: '1.0.0',
    environment: 'development',
  });
}

const auth = { authorization: 'Bearer mbr_test_001' };

test('meta endpoint', async () => {
  const c = make();
  const res = await c.handle({ method: 'GET', path: '/aaf11/meta' });
  assert.equal(res.status, 200);
  assert.equal((res.body as ProjectMeta).name, 'TestProj');
});

test('health endpoint defaults healthy', async () => {
  const c = make();
  const res = await c.handle({ method: 'GET', path: '/aaf11/health' });
  assert.equal(res.status, 200);
  const body = res.body as HealthReport;
  assert.equal(body.status, 'healthy');
  assert.ok(body.uptimeSeconds >= 0);
});

test('metrics counters and custom metric', async () => {
  const c = make();
  c.trackRequest();
  c.trackRequest();
  c.trackError();
  c.registerMetric('widgets', () => 42);
  const res = await c.handle({ method: 'GET', path: '/aaf11/metrics' });
  const body = res.body as MetricsReport;
  assert.equal(body.requestCount, 2);
  assert.equal(body.errorRate, 0.5);
  assert.equal(body.custom?.widgets, 42);
});

test('actions list', async () => {
  const c = make();
  c.registerAction('restart', () => ({ restarted: true }), { label: 'Restart' });
  const res = await c.handle({ method: 'GET', path: '/aaf11/actions' });
  const body = res.body as { actions: { id: string }[] };
  assert.equal(body.actions.length, 1);
  assert.equal(body.actions[0]!.id, 'restart');
});

test('action requires owner token', async () => {
  const c = make();
  c.registerAction('restart', () => ({ ok: 1 }));
  const noAuth = await c.handle({ method: 'POST', path: '/aaf11/actions/restart' });
  assert.equal(noAuth.status, 401);
  const wrong = await c.handle({
    method: 'POST',
    path: '/aaf11/actions/restart',
    headers: { authorization: 'Bearer wrong' },
  });
  assert.equal(wrong.status, 401);
});

test('action runs with valid token', async () => {
  const c = make();
  c.registerAction('clear_cache', () => ({ cleared: true }));
  const res = await c.handle({
    method: 'POST',
    path: '/aaf11/actions/clear_cache',
    headers: auth,
  });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true, result: { cleared: true } });
});

test('unknown action returns 400', async () => {
  const c = make();
  const res = await c.handle({ method: 'POST', path: '/aaf11/actions/nope', headers: auth });
  assert.equal(res.status, 400);
});

test('config requires auth then stores', async () => {
  const c = make();
  const denied = await c.handle({ method: 'POST', path: '/aaf11/config', body: { a: 1 } });
  assert.equal(denied.status, 401);
  const ok = await c.handle({
    method: 'POST',
    path: '/aaf11/config',
    headers: auth,
    body: { a: 1 },
  });
  assert.equal(ok.status, 200);
  assert.deepEqual(c.getLastConfig(), { a: 1 });
});

test('unknown route 404', async () => {
  const c = make();
  const res = await c.handle({ method: 'GET', path: '/aaf11/nope' });
  assert.equal(res.status, 404);
});

test('start without hubUrl does not throw', async () => {
  const c = make();
  const res = await c.start();
  assert.equal(res.ok, false);
  assert.match(res.error ?? '', /registration/i);
});
