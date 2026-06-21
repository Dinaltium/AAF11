# aaf11-sdk

Connector SDK for [AAF11 Nexus](https://github.com/). Embed it in a Node project
to expose the standard `/aaf11/*` health/metrics/actions endpoints and register
the project with the Hub.

```bash
npm install aaf11-sdk        # or pnpm add / yarn add
```

> **Full integration guide** (Fastify, raw http, Next.js, Python, config
> reference, troubleshooting): see `docs/SDK.md` in the AAF11 Nexus repo.

## Express

```js
import express from 'express';
import { AAF11Connector, nexusMiddleware } from 'aaf11-sdk';

const connector = new AAF11Connector({
  projectKey: process.env.AAF11_PROJECT_KEY,
  memberToken: process.env.AAF11_MEMBER_TOKEN,
  name: 'BusLink',
  version: '1.2.0',
  environment: 'production',
  hubUrl: process.env.AAF11_HUB_URL,
  connectorUrl: 'https://buslink.example.com',
});

const app = express();
app.use(express.json());
app.use(nexusMiddleware(connector)); // mounts /aaf11/*

connector.registerMetric('active_buses', () => tracker.count());
connector.registerAction('restart', async () => { await restart(); });

await connector.start(); // register with the Hub (never throws on Hub failure)
```

## Any framework (no Express)

The core is framework-agnostic — feed it a request, get a response:

```js
import { AAF11Connector } from 'aaf11-sdk';
const connector = new AAF11Connector({ /* ...config... */ });

// e.g. Node http, Fastify, Next.js route handler, etc.
const { status, body } = await connector.handle({
  method: req.method,
  path: url.pathname, // e.g. '/aaf11/health'
  headers: req.headers,
  body: parsedJsonBody,
});
```

## Endpoints exposed

`/aaf11/meta`, `/aaf11/health`, `/aaf11/metrics`, `/aaf11/actions`,
`POST /aaf11/actions/:id` (owner-token gated), `POST /aaf11/config`.

## Environment

| Var | Description |
|-----|-------------|
| `AAF11_PROJECT_KEY` | `proj_*` key identifying this project |
| `AAF11_MEMBER_TOKEN` | `mbr_*` token of the owning member |
| `AAF11_HUB_URL` | Base URL of the Hub API |

MIT © Team AAF11
