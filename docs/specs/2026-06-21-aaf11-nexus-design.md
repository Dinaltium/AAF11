# AAF11 Nexus — Design Specification

- **Status:** Approved (architecture locked 2026-06-21)
- **Author:** Rafan / Team AAF11, with Claude
- **Source:** `AAF11_Nexus_Spec_v1.0.docx`
- **Scope of this build:** SDK + Hub + Public Web + Desktop App. WhatsApp bot deferred.

---

## 1. Purpose

AAF11 Nexus is Team AAF11's internal platform and operations hub: one place to
monitor, manage, and showcase every project the team ships (web apps, desktop
apps, IoT, bots). Federated architecture with a centralized control plane —
**if the Hub goes down, all projects keep running.** The Hub aggregates and
controls; it is never a runtime dependency of the projects.

## 2. Architecture (locked)

```
                    ┌─────────────────────────────┐
                    │  HUB  (Next.js 15 + Payload) │
                    │  apps/hub  — on Vercel       │
                    │                              │
                    │  Payload collections (data)  │
                    │  auth + access control       │
                    │  REST + GraphQL API ◄────────┼──── every client hits this
                    │  media storage               │
                    │  custom routes: register,     │
                    │   poller, control-plane, public│
                    └──────────────┬───────────────┘
                                   │ HTTP (REST/GraphQL + Bearer)
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
 ┌──────▼───────┐         ┌────────▼─────────┐       ┌────────▼────────┐
 │ DESKTOP app  │         │ Payload /admin   │       │ PUBLIC website  │
 │ apps/desktop │         │ (secondary web   │       │ apps/web        │
 │ Tauri+React  │         │  admin, free)    │       │ Next.js 15      │
 │ PRIMARY      │         │                  │       │ read-only       │
 └──────────────┘         └──────────────────┘       └─────────────────┘
        ▲
        │ /aaf11/* endpoints  +  registration
 ┌──────┴───────────────────────────────────────────┐
 │ SDK  packages/sdk-js (@aaf11/connector)           │
 │      packages/sdk-py (aaf11)                       │
 │ embedded in every team project                     │
 └────────────────────────────────────────────────────┘
```

### 2.1 Components

| # | Component | Path | Stack | Role |
|---|-----------|------|-------|------|
| 1 | SDK (JS) | `packages/sdk-js` | TypeScript, Express/Fastify router | Connector embedded in projects |
| 1 | SDK (Py) | `packages/sdk-py` | Python, FastAPI router | Same, for Python projects |
| 2 | Hub | `apps/hub` | Next.js 15 + Payload 3 + Drizzle | Backend, API, CMS, control plane |
| 3 | Desktop | `apps/desktop` | Tauri 2 + React + Vite | PRIMARY team interface |
| 4 | Public web | `apps/web` | Next.js 15 | Public portfolio, read-only |

### 2.2 Why Payload

Only CMS that keeps **content + ops data in one DB** (Neon Postgres via
Drizzle), installs *into* the Next.js Hub, deploys on Vercel, and gives auth +
access control + REST/GraphQL + media + an admin panel for free. Strapi = own
server. Sanity = content in their cloud (split data). Payload wins for this
stack.

The desktop app is PRIMARY; Payload's web admin is the SECONDARY surface. The
desktop app embeds Payload `/admin` via a **Tauri WebviewWindow** so the team
never leaves the app to edit content — zero editor-building.

## 3. The test/real switch (single point)

**One env var: `AAF11_DATA_MODE`.**

| Mode | DB | Data | External services | Who uses it |
|------|----|----|-------------------|-------------|
| `test` | SQLite (`@payloadcms/db-sqlite`) | Seeded mock fixtures | None — runs fully offline | Dev, CI, demos, autonomous build verification |
| `real` | Neon Postgres (`@payloadcms/db-postgres`) | Live data only, **no mock ever** | Neon, Vercel Blob, OAuth | Production |

Rules:
- The switch picks the **Payload DB adapter** AND the **data source** used by
  every app (Hub routes, desktop, web).
- In `test`, a seed script loads deterministic mock projects/members/metrics/CMS.
- In `real`, mock code paths are **unreachable** — guarded so no fixture can
  leak into production. A single `dataMode()` helper is the only reader of the
  flag; everything imports from it.
- Default in `.env.example` is `test` so a fresh clone runs with zero secrets.

## 4. Data model (Payload collections)

| Collection | Key fields | Purpose |
|-----------|-----------|---------|
| `members` | name, email, memberToken, role (admin/member), passwordHash (Payload auth) | Team accounts; Payload auth identity |
| `projects` | name, connectorUrl, projectKey, owner→members, status, environment, lastSeen | Project registry |
| `metrics_snapshots` | project→projects, timestamp, health, requestCount, errorRate, customData(json) | Time-series health/metrics |
| `actions_log` | project, member, action, timestamp, result | Audit trail of control actions |
| `cms_posts` | title, slug, body(richtext), author→members, published, createdAt | Blog |
| `cms_services` | title, description, tags, visible | Services |
| `cms_team` | name, role, bio, github, photo(media), visible | Public team profiles |
| `media` | (Payload upload) | Images for blog/team |

## 5. APIs

- **Private (authed, Bearer member token):** all Payload REST/GraphQL +
  custom routes. Used by desktop app.
- **Public (read-only, no auth, rate-limited, whitelisted fields):**
  `GET /api/public/projects`, `/api/public/team`, `/api/public/services`,
  `/api/public/blog`, `/api/public/blog/:slug`. Used by public website.
- **SDK-facing:** `POST /api/register` (connector registration),
  ingest of health/metrics snapshots.
- **Control plane:** `POST /api/control/:projectId/:actionId` → dispatches to
  the project's `/aaf11/actions/:id`, verifies ownership, logs to `actions_log`.
- **Poller:** background job hitting each project's `/aaf11/health` +
  `/aaf11/metrics`, writing snapshots. See §7 for hosting.

### 5.1 SDK connector endpoints (exposed by each project)

`/aaf11/meta`, `/aaf11/health`, `/aaf11/metrics`, `/aaf11/actions`,
`/aaf11/actions/{id}`, `/aaf11/config`. SDK roadmap: v1 meta+health+register,
v2 metrics+custom stats, v3 actions+config.

## 6. Tokens & auth

- `proj_*` project key — identifies a project, in its env vars, sent on every
  report. Lower privilege.
- `mbr_*` member token — identifies a person, ties projects to owner, gates
  control actions. Treat like a password; OS keychain on desktop.
- Control actions require a valid member token AND ownership (or admin role).
- HTTPS only in real mode. Public API never accepts writes.

## 7. Open infra decision (resolve in Phase 2)

60-second polling vs Vercel Cron (Hobby = 1/day; per-minute needs Pro).
**Decision for build:** poller implemented as a standalone module runnable two
ways — (a) Vercel Cron route for real/Pro, (b) a `node` worker (`pnpm hub:poll`)
that can run on the home server. Test mode runs the poller in-process on an
interval. No blocker.

## 8. Build order

1. **Foundation** — repo, workspace, spec, docs, env contract. ✅
2. **Shared contracts + data-mode layer** — types, `dataMode()`, fixtures.
3. **SDK (JS + Py)** — smallest, no external deps, fully testable offline.
4. **Hub** — Payload collections, adapter switch, custom routes, seed.
5. **Public web** — reads Hub public API.
6. **Desktop** — Tauri shell, dashboard, charts, action panel, admin webview.
7. **Verify + document + continuation.**

## 9. Non-goals (this build)

WhatsApp bot, Cloudflare Tunnel infra, fallback server, org-level tokens,
WebSocket transport. Contracts left in place; implementation deferred.

## 10. Risks & honest limits

- Autonomous overnight build cannot guarantee zero defects; mitigated by TEST
  mode being fully runnable + self-verified, per-milestone git commits, and a
  `PROGRESS.md` resume log.
- REAL mode cannot be verified without the owner's secrets; it is wired and
  parked behind `AAF11_DATA_MODE=real`.
- Tauri full desktop packaging may be limited in the build environment; the
  React frontend and Rust shell are written and dev-runnable regardless.
