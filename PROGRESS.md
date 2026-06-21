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
- [x] custom routes: /api/register, /api/public/{projects,team,services,blog,blog/[slug]}, /api/control/[projectId]/[actionId]
- [x] poller logic (apps/hub/src/logic/poller.ts) retained as library; scheduled polling (cron route + interval worker) REMOVED for now
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

### Phase 5 — Desktop app ✅
- [x] Tauri 2 + React + Vite scaffold (apps/desktop)
- [x] dashboard (stat cards + per-project SVG charts), projects table, action panel, incident log
- [x] Payload admin webview window (open_admin_window Rust command)
- [x] OS-keychain token storage (keyring crate: save_token/get_token), native notifications
- [x] dark app-shell design, test/real mode pill, toast
- [x] test mode runs fully from bundled mock fixtures (no backend); real hits Hub
- [x] VERIFIED: tsc clean, vite build OK (40 modules), `cargo check` passes (full Rust shell compiles)

**Run the desktop app (test mode):** `cd apps/desktop && pnpm tauri dev`
(Rust + WebView2 required — both present on this Win11 machine.)
Frontend-only preview without Rust: `pnpm dev` → http://localhost:1420

### Phase 6 — Verify + document + continuation ✅
- [x] full test suite green: shared 6/6, sdk-js 10/10, hub 6/6 (isolated temp DB), sdk-py 11/11
- [x] end-to-end chain verified: web (real mode) renders LIVE Hub data, no mock fallback
- [x] complete documentation in docs/: MANUAL, TEST-VS-REAL, SECURITY, DEPLOYMENT, DO-AND-DONT, index
- [x] root README pointing into docs/
- [x] continuation: build COMPLETED in-session — durable record is git + this file.
      No recurring autonomous agent scheduled (no remaining work for it; the open
      items below need owner secrets). Resume instructions at top of this file.

## BUILD COMPLETE (2026-06-21)
All five subsystems built and verified in test mode. Remaining work is owner-gated
(needs real secrets) or explicitly deferred — see "Owner action items" and Phase 4
notes in the design spec. Nothing is half-finished.

## Decisions log
- Payload as Hub backend; desktop primary; Payload admin embedded via Tauri webview.
- DB: SQLite (test) / Neon Postgres (real), both via Payload adapters.
- Single switch `AAF11_DATA_MODE=test|real`; mock unreachable in real.
- Poller: dual-mode (in-process test / cron or worker real).

## Notes for next session
- (append running notes here as the build progresses)
