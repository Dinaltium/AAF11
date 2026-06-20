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

### Phase 2 — SDK
- [ ] sdk-js: @aaf11/connector — meta/health/metrics/actions, register, registries
- [ ] sdk-js: tests
- [ ] sdk-py: aaf11 — same surface
- [ ] sdk-py: tests

### Phase 3 — Hub (Payload + Next.js)
- [ ] Payload config, collections, SQLite/Neon adapter switch
- [ ] custom routes: /api/register, ingest, /api/public/*, /api/control/*
- [ ] poller module (in-process for test; cron/worker for real)
- [ ] seed script (test mode)
- [ ] verify: hub boots in test mode, admin loads, public API returns seeded data

### Phase 4 — Public website
- [ ] Next.js app, reads Hub public API
- [ ] pages: home, projects, team, services, blog, blog/[slug], contact
- [ ] design pass (high-end skills)

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
