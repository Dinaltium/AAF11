# SDK Integration Guide

How to connect a project to AAF11 Nexus with the connector SDK — JavaScript
(`aaf11-sdk` on npm) or Python (`aaf11`). Once wired, your project reports health
and metrics to the Hub and accepts control actions.

- [Mental model](#mental-model)
- [Before you start](#before-you-start)
- [Install](#install)
- [JavaScript](#javascript) — Express · Fastify · raw http · Next.js
- [Python](#python) — FastAPI · Flask
- [Config reference](#config-reference)
- [Custom metrics & actions](#custom-metrics--actions)
- [How it connects](#how-it-connects)
- [Verify the connection](#verify-the-connection)
- [Troubleshooting](#troubleshooting)

---

## Mental model

The SDK runs **inside your project's backend** and exposes a few HTTP endpoints
under `/aaf11/*`. The Hub reads those endpoints to track health/metrics and posts
to them to trigger actions. On startup the SDK **registers** the project with the
Hub.

```
your backend  ──exposes──►  /aaf11/health, /aaf11/metrics, /aaf11/actions ...
     │                                   ▲
     └────── connector.start() ──────────┘  Hub reads these + dispatches actions
```

It must live in a **backend** (something that serves HTTP). A pure browser
frontend (React/Vue SPA) has no server to host it — put the SDK in whatever
backend serves that app, or skip it.

## Before you start

You need three things, all from the Hub side:

1. **`AAF11_HUB_URL`** — where the Hub runs (`http://localhost:3000` in test).
2. **`AAF11_MEMBER_TOKEN`** — a `mbr_*` token that **already exists** in the Hub's
   Members collection (Payload admin → Members → set `memberToken`). It ties the
   project to its owner and authorizes control actions.
3. **`AAF11_PROJECT_KEY`** — a `proj_*` key you mint for this project (any unique
   string, e.g. `proj_buslink_a7f3k2x9`). The Hub records it on first registration.

Put these in your project's env (`.env`).

## Install

**JavaScript:**
```bash
npm install aaf11-sdk        # or: pnpm add aaf11-sdk / yarn add aaf11-sdk
```

**Python:**
```bash
pip install aaf11            # FastAPI adapter: pip install "aaf11[fastapi]"
```

---

## JavaScript

### Express

```js
import express from 'express';
import { AAF11Connector, nexusMiddleware } from 'aaf11-sdk';

export const connector = new AAF11Connector({
  projectKey: process.env.AAF11_PROJECT_KEY,
  memberToken: process.env.AAF11_MEMBER_TOKEN,
  name: 'BusLink',
  version: '1.2.0',
  environment: 'production',
  hubUrl: process.env.AAF11_HUB_URL,
  connectorUrl: 'https://buslink.example.com', // where THIS app is reachable
});

const app = express();
app.use(express.json());            // required so req.body is parsed
app.use(nexusMiddleware(connector)); // mounts /aaf11/*

app.listen(8080, () => connector.start()); // register after the server is up
```

### Fastify

```js
import Fastify from 'fastify';
import { AAF11Connector } from 'aaf11-sdk';

const connector = new AAF11Connector({ /* ...config... */ });
const app = Fastify();

app.all('/aaf11/*', async (req, reply) => {
  const { status, body } = await connector.handle({
    method: req.method,
    path: req.url.split('?')[0],
    headers: req.headers,
    body: req.body,
  });
  reply.code(status).send(body);
});

app.listen({ port: 8080 }, () => connector.start());
```

### Raw Node http (no framework)

```js
import { createServer } from 'node:http';
import { AAF11Connector } from 'aaf11-sdk';

const connector = new AAF11Connector({ /* ...config... */ });

createServer(async (req, res) => {
  const path = (req.url ?? '').split('?')[0];
  if (path.startsWith('/aaf11/')) {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const { status, body } = await connector.handle({
      method: req.method,
      path,
      headers: req.headers,
      body: raw ? JSON.parse(raw) : undefined,
    });
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
    return;
  }
  // ...your app...
}).listen(8080, () => connector.start());
```

### Next.js (App Router)

`lib/connector.ts`:
```ts
import { AAF11Connector } from 'aaf11-sdk';
export const connector = new AAF11Connector({ /* ...config... */ });
```

`app/aaf11/[...path]/route.ts`:
```ts
import { connector } from '@/lib/connector';

async function handler(req: Request) {
  const url = new URL(req.url);
  const body = req.method !== 'GET' ? await req.json().catch(() => undefined) : undefined;
  const { status, body: out } = await connector.handle({
    method: req.method,
    path: url.pathname,
    headers: Object.fromEntries(req.headers),
    body,
  });
  return Response.json(out, { status });
}
export const GET = handler;
export const POST = handler;
```
Call `connector.start()` once at boot (e.g. in `instrumentation.ts`).

---

## Python

### FastAPI

```python
import os
from fastapi import FastAPI
from aaf11 import AAF11Connector, create_router

connector = AAF11Connector(
    project_key=os.environ['AAF11_PROJECT_KEY'],
    member_token=os.environ['AAF11_MEMBER_TOKEN'],
    name='Medicine Assistant',
    version='2.0.1',
    environment='production',
    hub_url=os.environ['AAF11_HUB_URL'],
    connector_url='https://medassist.example.com',
)

app = FastAPI()
app.include_router(create_router(connector))

@app.on_event('startup')
def _register():
    connector.start()
```

### Flask (uses the framework-agnostic core)

```python
from flask import Flask, request, jsonify
from aaf11 import AAF11Connector

connector = AAF11Connector(project_key=..., member_token=..., name=..., version=..., hub_url=...)
app = Flask(__name__)

@app.route('/aaf11/<path:sub>', methods=['GET', 'POST'])
def aaf11(sub):
    status, body = connector.handle(
        request.method, request.path, dict(request.headers), request.get_json(silent=True)
    )
    return jsonify(body), status

connector.start()
```

---

## Config reference

| Option (JS / Python) | Required | Description |
|----------------------|----------|-------------|
| `projectKey` / `project_key` | ✓ | `proj_*` key for this project |
| `memberToken` / `member_token` | ✓ | `mbr_*` token of the owning member (must exist in Hub) |
| `name` | ✓ | Project display name |
| `version` | ✓ | Project version string |
| `environment` | | `production` (default) \| `staging` \| `development` |
| `hubUrl` / `hub_url` | | Hub base URL; without it `start()` skips registration |
| `connectorUrl` / `connector_url` | | Public URL where this app is reachable (so the Hub can poll it) |
| `description`, `tags`, `members` | | Metadata shown in the Hub |
| `basePath` / `base_path` | | Route prefix, default `/aaf11` |
| `healthProvider` / `health_provider` | | Function returning `healthy`/`degraded`/`down` |

## Custom metrics & actions

**Metrics** — any number the Hub should chart:
```js
connector.registerMetric('active_buses', () => tracker.count());
connector.trackRequest();  // call per inbound request to populate requestCount
connector.trackError();    // call on errors to populate errorRate
```
```python
connector.register_metric('active_patients', lambda: db.count_active())
connector.track_request(); connector.track_error()
```

**Actions** — what the Hub/desktop can trigger (owner-token gated):
```js
connector.registerAction('restart', async () => { await gracefulRestart(); });
connector.registerAction('clear_cache', async () => { await cache.flush(); return { cleared: true }; });
```
```python
connector.register_action('restart', lambda _payload=None: graceful_restart())
```

## How it connects

1. On `start()`, the SDK POSTs to `<hubUrl>/api/register` with the project key,
   member token, name, version, environment, and connector URL.
2. The Hub validates the member token, then **upserts** the project in its
   registry (same project key = update, not duplicate).
3. From then on the Hub can read `/aaf11/health` + `/aaf11/metrics` and POST to
   `/aaf11/actions/:id`.
4. `start()` **never throws** if the Hub is unreachable — your app keeps running.
   It returns `{ ok: false, error }` you can log.

## Verify the connection

```bash
# 1. Your endpoints are live:
curl http://localhost:8080/aaf11/health
curl http://localhost:8080/aaf11/meta

# 2. Registration succeeded — check the Hub:
curl http://localhost:3000/api/public/projects     # should list your project (if visible)
```
Then open the **desktop app** or the **Payload admin → Projects** — your project
appears with live status.

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| `start()` returns `Unknown member token` | The `mbr_*` token isn't in the Hub. Create the member in Payload admin and set its `memberToken`. |
| `start()` returns `Hub registration failed` | Wrong `hubUrl` or Hub not running. App still runs; fix the URL. |
| `401 Unauthorized` on an action | The action POST needs `Authorization: Bearer <member token>`. The Hub control plane sends this automatically; only matters if you call `/aaf11/actions/:id` by hand. |
| Endpoints 404 | `nexusMiddleware`/route not mounted, or `basePath` mismatch. Confirm the prefix is `/aaf11`. |
| `req.body` undefined (Express) | Mount `express.json()` **before** `nexusMiddleware`. |
| Project not in Hub | `start()` wasn't called, or the Hub was down at boot. Restart the app with the Hub up. |

See also: [MANUAL](MANUAL.md) · [DEPLOYMENT](DEPLOYMENT.md) (publishing) · [SECURITY](SECURITY.md) (tokens).
