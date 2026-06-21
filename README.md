# AAF11 Nexus

Internal platform and operations hub for Team AAF11 — monitor, manage, and
showcase every project the team ships, from one federated system.

> **Full documentation lives in [`docs/`](docs/README.md).** This file is just a
> pointer.

## Quick start (test mode, no secrets)

```bash
pnpm install
cp .env.example .env          # ONE env file for all 3 apps (already defaults to test)

cd apps/hub && pnpm seed && pnpm dev      # :3000/admin
cd apps/web && pnpm dev                   # :3001
cd apps/desktop && pnpm tauri dev         # primary interface
```

No per-command env vars — every app reads the single **root `.env`**.

## The one switch — one file

Edit **`.env`** (root). Flip `AAF11_DATA_MODE=test|real` and (for real) paste your
`DATABASE_URL`. test = SQLite + mock (offline), real = Neon Postgres + live data.
All three apps read this one file. See [docs/TEST-VS-REAL.md](docs/TEST-VS-REAL.md).

## Structure

`packages/{shared,sdk-js,sdk-py}` · `apps/{hub,web,desktop}` · `docs/`

Read [docs/MANUAL.md](docs/MANUAL.md) next.
