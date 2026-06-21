# AAF11 Nexus — Operations Manual

Complete guide to what AAF11 Nexus is, how it is built, how to run it, and what
to use (and not use). This is the canonical documentation. For the original
design rationale see [`specs/2026-06-21-aaf11-nexus-design.md`](specs/2026-06-21-aaf11-nexus-design.md).

> Companion docs: [TEST-VS-REAL](TEST-VS-REAL.md) · [SECURITY](SECURITY.md) ·
> [DEPLOYMENT](DEPLOYMENT.md)

---

## 1. What it is

AAF11 Nexus is Team AAF11's internal platform and operations hub. One place to:

- **Monitor** the health and metrics of every project the team ships.
- **Manage** them — restart, rollback, kill — from a desktop app.
- **Showcase** the team's work on a public website.

It is **federated**: each project runs independently and embeds a small SDK.
The Hub aggregates and controls but is never a runtime dependency. **If the Hub
goes down, every project keeps running.**

## 2. The pieces (and what each uses)

| Component | Path | Stack | What it does |
|-----------|------|-------|--------------|
| **SDK (JS)** | `packages/sdk-js` | TypeScript | `@aaf11/connector` — embed in a Node project; exposes `/aaf11/*`, registers with the Hub |
| **SDK (Python)** | `packages/sdk-py` | Python 3.10+ | `aaf11` — same surface for Python projects (optional FastAPI router) |
| **Shared** | `packages/shared` | TypeScript | Wire-format types, the `test/real` switch, mock fixtures |
| **Hub** | `apps/hub` | Next.js 15 + Payload 3 + Drizzle | Backend, API, CMS, control plane, admin UI |
| **Public web** | `apps/web` | Next.js 15 | World-facing portfolio, read-only |
| **Desktop** | `apps/desktop` | Tauri 2 + React + Vite | **Primary** team interface |

**Why Payload:** it is the only CMS that keeps content *and* ops data in one
Postgres database, installs into the Next.js Hub, and gives auth + access
control + REST/GraphQL + media + an admin panel for free. The desktop app is the
primary surface; Payload's web admin is embedded in the desktop via a native
webview window so the team never leaves the app.

## 3. Architecture at a glance

```
 SDK (in each project)  ──/aaf11/* + register──►  HUB (Payload + Next.js)
                                                   │  collections, auth,
                                                   │  REST+GraphQL, control plane
                          ┌────────────────────────┼───────────────────────┐
                   Desktop app (primary)     Payload /admin (web)     Public website
                   reads private API         embedded in desktop      reads public API
```

Data lives in **one database**: SQLite in test mode, Neon Postgres in real mode.

## 4. Prerequisites

- **Node 20+** and **pnpm 10+** (`npm i -g pnpm`)
- **Rust** (stable) + platform webview — for the desktop app. Windows 11 ships
  WebView2. (`rustup` if missing.)
- **Python 3.10+** — only to develop/test the Python SDK.

## 5. First-time setup

```bash
git clone <repo> && cd AAF11
pnpm install
cp .env.example .env          # defaults to AAF11_DATA_MODE=test
```

## 6. Running everything (test mode — no secrets needed)

Each component runs independently. Test mode means SQLite + mock data, zero
external services.

### 6.1 Hub
```bash
cd apps/hub
AAF11_DATA_MODE=test PAYLOAD_SECRET=dev pnpm seed   # one-time: load mock data
AAF11_DATA_MODE=test PAYLOAD_SECRET=dev pnpm dev
```
- Admin UI: <http://localhost:3000/admin> — log in with **rafan79200@gmail.com /
  test-rafan-pw** (seeded).
- Public API: <http://localhost:3000/api/public/projects>

### 6.2 Public website
```bash
cd apps/web
AAF11_DATA_MODE=test pnpm dev      # http://localhost:3001
```
With no Hub running, the site renders from mock fixtures and shows a PREVIEW
banner. To pull live content from the Hub, set
`NEXT_PUBLIC_HUB_URL=http://localhost:3000`.

### 6.3 Desktop app
```bash
cd apps/desktop
pnpm tauri dev        # builds the Rust shell + opens the window
```
In test mode the dashboard, charts, projects, actions, and incident log all
populate from bundled mock fixtures — no backend required. Frontend-only preview
(no Rust): `pnpm dev` → <http://localhost:1420>.

### 6.4 The poller (optional in test)
```bash
cd apps/hub
AAF11_DATA_MODE=test PAYLOAD_SECRET=dev pnpm poll   # polls every 60s
```

## 7. Using the SDK in a project

**JavaScript / Node (Express):**
```js
import express from 'express';
import { AAF11Connector, nexusMiddleware } from '@aaf11/connector';

const connector = new AAF11Connector({
  projectKey: process.env.AAF11_PROJECT_KEY,
  memberToken: process.env.AAF11_MEMBER_TOKEN,
  name: 'BusLink', version: '1.2.0', environment: 'production',
  hubUrl: process.env.AAF11_HUB_URL,
  connectorUrl: 'https://buslink.aaf11.com',
});

const app = express();
app.use(express.json());
app.use(nexusMiddleware(connector));   // mounts /aaf11/*
connector.registerMetric('active_buses', () => tracker.count());
connector.registerAction('restart', async () => { await restart(); });
await connector.start();               // register with the Hub
```

**Python (FastAPI):**
```python
from fastapi import FastAPI
from aaf11 import AAF11Connector, create_router

connector = AAF11Connector(
    project_key=os.environ['AAF11_PROJECT_KEY'],
    member_token=os.environ['AAF11_MEMBER_TOKEN'],
    name='Medicine Assistant', version='2.0.1',
    hub_url='https://hub.aaf11.com',
)
app = FastAPI()
app.include_router(create_router(connector))
connector.start()
```

Connector endpoints exposed: `/aaf11/meta`, `/health`, `/metrics`, `/actions`,
`POST /actions/{id}` (owner-token gated), `POST /config`.

## 8. Hub API reference

**Public (no auth, read-only, whitelisted):**
- `GET /api/public/projects` · `/api/public/team` · `/api/public/services`
- `GET /api/public/blog` · `GET /api/public/blog/:slug`

**SDK-facing:**
- `POST /api/register` — `{ projectKey, memberToken, projectName, version, environment, connectorUrl }`

**Control plane (Bearer member token):**
- `POST /api/control/:projectId/:actionId` — verifies ownership, dispatches to
  the project, logs to `actions_log`.

**Poller:**
- `GET /api/poll` — runs one poll cycle (real mode requires `CRON_SECRET`).

**Payload (auth):** full REST at `/api/<collection>` and GraphQL at `/api/graphql`.

## 9. Testing

```bash
pnpm -r test          # all packages
pnpm --filter @aaf11/shared test       # data-mode switch (6 tests)
pnpm --filter @aaf11/connector test     # JS SDK (10 tests)
pnpm --filter @aaf11/hub test           # Hub logic vs SQLite (6 tests)
cd packages/sdk-py && python -m unittest discover -s tests   # Python SDK (11)
```

## 10. Repository layout

```
AAF11/
├─ packages/
│  ├─ shared/        types, dataMode(), fixtures
│  ├─ sdk-js/        @aaf11/connector
│  └─ sdk-py/        aaf11 (Python)
├─ apps/
│  ├─ hub/           Payload + Next.js backend
│  ├─ web/           public website
│  └─ desktop/       Tauri desktop app
├─ docs/             this manual + companions
├─ .env.example      environment contract
└─ PROGRESS.md       build log / resume record
```

See [DO-AND-DONT](DO-AND-DONT.md) for the rules of the road.
