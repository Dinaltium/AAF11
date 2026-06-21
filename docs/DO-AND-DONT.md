# What to use — and what not to

A quick reference for working in this codebase correctly.

## Use

- **`pnpm`** (v10+) as the package manager. The repo is a pnpm workspace.
- **`AAF11_DATA_MODE`** as the *only* way to switch test/real. Read it through
  `@aaf11/shared` (`dataMode()`), never `process.env.AAF11_DATA_MODE` directly.
- **`@aaf11/shared` types** for anything crossing a component boundary. Don't
  redefine wire shapes locally.
- **Payload Local API** (`payloadClient()`) inside Hub route handlers, with
  `overrideAccess: true` for server-side reads, and **whitelist fields** for
  anything public.
- **`assertReal()` / `assertTest()`** to guard mode-specific code.
- **The OS keychain** (`save_token`/`get_token`) for the member token on desktop.
- **SVG `Chart`** (`apps/desktop/src/components/Chart.tsx`) for metrics — no chart
  library dependency.
- **`pnpm tauri dev`** to run the desktop app; **`pnpm tauri icon`** before
  release builds.

## Don't

- **Don't read `AAF11_DATA_MODE` directly** anywhere except `data-mode.ts`.
- **Don't run the seed in real mode** — it is guarded and will throw, but never
  attempt it.
- **Don't commit `.env`** or hardcode `proj_*` / `mbr_*` tokens. Only
  `.env.example` (valueless) is committed.
- **Don't expose project keys, member tokens, or internal fields** through the
  public API. Map to the `Public*` types in `logic/public.ts`.
- **Don't add `.js` extensions** to relative TS imports in code that Next.js
  webpacks (Hub `src/`, `@aaf11/shared`). Use extensionless imports — tsx, tsc,
  and webpack all resolve them. (tsx-only scripts tolerate either.)
- **Don't ship the dev `PAYLOAD_SECRET`** to production.
- **Don't make the Hub a runtime dependency** of a project. Projects must keep
  running if the Hub is down; the SDK's `start()` never throws on Hub failure.
- **Don't use `WidthType.PERCENTAGE`-style brittle choices** — prefer the
  patterns already in the codebase; match surrounding style.

## Gotchas already handled (don't "fix" them)

- Node 20 doesn't glob-expand `--test src/*.test.ts`; test scripts point at
  explicit files on purpose.
- Next must `transpilePackages: ['@aaf11/shared']` to compile the workspace TS.
- The Hub's two route groups — `(payload)` and `(frontend)` — each need their own
  root layout. This is intentional.
- Blog `body` is a `textarea` (not Lexical rich text) in v1 to keep seeding and
  the public API simple. The Lexical editor is configured and ready to upgrade.
