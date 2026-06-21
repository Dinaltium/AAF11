# AAF11 Nexus — Build Progress & Resume Log

> **Resuming this build? Read this file top-to-bottom, then `git log --oneline`,
> then continue from the first unchecked item.** This file + git are the source
> of truth. Update it after every milestone and commit.

- **Owner:** Rafan (rafan79200@gmail.com)
- **Started:** 2026-06-21 ~01:43 (owner asleep; autonomous build authorized)
- **Spec:** `docs/specs/2026-06-21-aaf11-nexus-design.md`
- **Default mode:** `AAF11_DATA_MODE=test` (SQLite + mock, runs with no secrets)

## How to resume (deterministic)

1. `cd C:\Projects\AAF11`
2. Read this file + the spec.
3. `git log --oneline -20` to see what landed.
4. `pnpm install` if `node_modules` missing.
5. Continue from the first `[ ]` below. Commit after each.

## Owner action items (REAL mode — cannot be done autonomously)

These are parked. TEST mode works without them.

- [ ] Provide Neon `DATABASE_URL`
- [ ] Provide `PAYLOAD_SECRET` (strong, real)
- [ ] Provide Vercel Blob `BLOB_READ_WRITE_TOKEN`
- [ ] (Phase 4) Google OAuth creds for bot

## Build checklist

### Phase 0 — Foundation
- [x] git init, user config
- [x] monorepo structure (packages/*, apps/*, docs/)
- [x] root package.json, pnpm-workspace.yaml
- [x] .gitignore, .env.example (test/real contract)
- [x] design spec (docs/specs)
- [x] PROGRESS.md (this file)

### Phase 1 — Shared contracts + data-mode layer ✅
- [x] packages/shared: endpoint/payload TS types (`src/types.ts`)
- [x] `dataMode()` helper (single reader of AAF11_DATA_MODE) — 6/6 tests pass
- [x] mock fixtures (projects, members, metrics, cms) (`src/fixtures.ts`)
- [x] typecheck + tests green

### Phase 2 — SDK ✅
- [x] sdk-js: @aaf11/connector — meta/health/metrics/actions, register, registries, express middleware
- [x] sdk-js: tests 10/10 pass, typecheck clean
- [x] sdk-py: aaf11 — same surface, stdlib core + optional FastAPI router
- [x] sdk-py: tests 11/11 pass

### Phase 3 — Hub (Payload + Next.js) ✅
- [x] Payload config, 8 collections, SQLite/Neon adapter switch (db.ts)
- [x] custom routes: /api/register, /api/public/{projects,team,services,blog,blog/[slug]}, /api/control/[projectId]/[actionId], /api/poll
- [x] poller module + standalone poller-worker.ts (cron route for real)
- [x] seed script (test mode) — seeds 2 members/4 projects/3 services/2 team/2 posts/48 snapshots/2 actions
- [x] logic layer (register/ingest/control/poller/public) — 6/6 tests pass vs SQLite
- [x] VERIFIED: `next build` succeeds; server boots; /admin=200; public API returns seeded data; register POST works + rejects bad tokens
- [x] typecheck clean

**Run the Hub (test mode):**
`cd apps/hub && AAF11_DATA_MODE=test PAYLOAD_SECRET=dev pnpm seed && pnpm dev`
Admin: http://localhost:3000/admin  (login: rafan79200@gmail.com / test-rafan-pw)

### Phase 4 — Public website ✅
- [x] Next.js 15 app (apps/web), reads Hub public API via src/lib/api.ts
- [x] test/real fallback: test mode renders from mock fixtures if Hub down; real requires Hub
- [x] pages: home, projects, team, services, blog, blog/[slug], contact
- [x] design pass: dark editorial/technical system (globals.css), status badges, reveal motion
- [x] VERIFIED: next build OK (7 pages); server renders mock data + PREVIEW banner in test mode

**Run the web (test mode, standalone):** `cd apps/web && AAF11_DATA_MODE=test pnpm dev` → http://localhost:3001
With Hub live: set NEXT_PUBLIC_HUB_URL=http://localhost:3000

### Phase 5 — Desktop app
- [ ] Tauri 2 + React + Vite scaffold
- [ ] dashboard, health grid, charts, action panel, incident log
- [ ] Payload admin webview window
- [ ] keychain token storage, native notifications
- [ ] design pass

### Phase 6 — Verify + document + continuation
- [ ] end-to-end test-mode run
- [ ] complete documentation in docs/ (architecture, operations, test-vs-real, run)
- [ ] scheduled continuation agent set up
- [ ] final commit + summary

## Decisions log
- Payload as Hub backend; desktop primary; Payload admin embedded via Tauri webview.
- DB: SQLite (test) / Neon Postgres (real), both via Payload adapters.
- Single switch `AAF11_DATA_MODE=test|real`; mock unreachable in real.
- Poller: dual-mode (in-process test / cron or worker real).

## Notes for next session
- (append running notes here as the build progresses)
