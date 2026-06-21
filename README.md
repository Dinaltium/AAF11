# AAF11 Nexus

Internal platform and operations hub for Team AAF11 — monitor, manage, and
showcase every project the team ships, from one federated system.

> **Full documentation lives in [`docs/`](docs/README.md).** This file is just a
> pointer.

## Quick start (test mode, no secrets)

```bash
pnpm install
cp .env.example .env

# Hub (backend + admin)
cd apps/hub && AAF11_DATA_MODE=test PAYLOAD_SECRET=dev pnpm seed && \
  AAF11_DATA_MODE=test PAYLOAD_SECRET=dev pnpm dev        # :3000/admin

# Public website
cd apps/web && AAF11_DATA_MODE=test pnpm dev              # :3001

# Desktop app (primary interface)
cd apps/desktop && pnpm tauri dev
```

## The one switch

`AAF11_DATA_MODE=test|real` — test = SQLite + mock data (offline), real = Neon
Postgres + live data. See [docs/TEST-VS-REAL.md](docs/TEST-VS-REAL.md).

## Structure

`packages/{shared,sdk-js,sdk-py}` · `apps/{hub,web,desktop}` · `docs/`

Read [docs/MANUAL.md](docs/MANUAL.md) next.
