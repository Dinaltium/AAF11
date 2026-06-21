// Minimal project wired to AAF11 Nexus with the published aaf11-sdk.
// Run: npm install && npm start  (Hub must be running)
import express from 'express';
import { AAF11Connector, nexusMiddleware } from 'aaf11-sdk';

const connector = new AAF11Connector({
  projectKey: process.env.AAF11_PROJECT_KEY || 'proj_demo_001',
  memberToken: process.env.AAF11_MEMBER_TOKEN || 'mbr_set_your_token', // your member token (set via env)
  name: 'Demo Project',
  version: '1.0.0',
  environment: 'development',
  hubUrl: process.env.AAF11_HUB_URL || 'http://localhost:3000',
  connectorUrl: process.env.CONNECTOR_URL || 'http://localhost:8080',
  description: 'A throwaway project to test the AAF11 connector.',
  tags: ['demo', 'test'],
});

// Demo instrumentation so the Hub has something to read.
let requests = 0;
connector.registerMetric('demo_counter', () => requests);
connector.registerAction('ping', () => ({ pong: true }));
connector.registerAction('restart', () => {
  console.log('[demo] restart action received');
  return { restarted: true };
});

const app = express();
app.use(express.json());
app.use((_req, _res, next) => {
  requests++;
  connector.trackRequest();
  next();
});
app.use(nexusMiddleware(connector)); // mounts /aaf11/*
app.get('/', (_req, res) => res.send('demo project running — see /aaf11/health'));

app.listen(8080, async () => {
  console.log('Demo project on http://localhost:8080');
  const res = await connector.start();
  console.log('Hub registration:', JSON.stringify(res));
  if (!res.ok) console.log('  (is the Hub running? does the member token exist?)');
});
