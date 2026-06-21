# Deployment (real mode)

This is the checklist to take Nexus from `test` to `real`. None of it can be
done without your own credentials — that is by design.

## 1. Provision services

| Service | Purpose | Variable |
|---------|---------|----------|
| Neon Postgres | Hub + CMS database | `DATABASE_URL` |
| Vercel | Host Hub + public website | (project link) |
| Vercel Blob (or S3) | Media uploads | `BLOB_READ_WRITE_TOKEN` |
| — | Payload auth signing | `PAYLOAD_SECRET` (`openssl rand -hex 32`) |
| — | Protect the poll cron | `CRON_SECRET` |

## 2. Hub → Vercel

1. Set env vars in the Vercel project:
   `AAF11_DATA_MODE=real`, `DATABASE_URL`, `PAYLOAD_SECRET`,
   `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`.
2. Generate and run Payload migrations against Neon (don't use dev push in prod):
   ```bash
   cd apps/hub
   AAF11_DATA_MODE=real DATABASE_URL=... pnpm payload migrate:create
   AAF11_DATA_MODE=real DATABASE_URL=... pnpm payload migrate
   ```
3. Deploy (Vercel auto-builds from GitHub). The admin is at `/admin`.
4. Create the first admin member in the Payload admin UI.

### Polling on Vercel
Vercel Cron on the Hobby plan runs **once per day** only; per-minute needs Pro.
Two supported options:
- **Vercel Cron (Pro):** add a cron hitting `GET /api/poll` every minute with
  `Authorization: Bearer $CRON_SECRET`.
- **Home-server worker:** run `pnpm --filter @aaf11/hub poll` on the Ubuntu home
  server (set `AAF11_POLL_INTERVAL_MS`). Recommended if you stay on Hobby.

## 3. Public website → Vercel

- Env: `NEXT_PUBLIC_HUB_URL=https://hub.aaf11.com`, `AAF11_DATA_MODE=real`.
- Deploy as a separate Vercel project. It only reads the public API.

## 4. Desktop app → team machines

```bash
cd apps/desktop
# point at the real Hub:
#   VITE_AAF11_DATA_MODE=real
#   VITE_AAF11_HUB_URL=https://hub.aaf11.com
pnpm tauri build       # produces installers in src-tauri/target/release/bundle
```
Before a release build, regenerate the full icon set if you change the logo:
`pnpm tauri icon src-tauri/icons/icon.png`. Distribute the installer to the team;
each member signs in and their token is saved to the OS keychain.

## 5. Projects → embed the SDK

Each project sets `AAF11_PROJECT_KEY`, `AAF11_MEMBER_TOKEN`, `AAF11_HUB_URL` and
calls `connector.start()`. Local backends are exposed to the Hub via Cloudflare
Tunnel.

## Deferred (not in this build)

WhatsApp bot, Cloudflare Tunnel automation, fallback server failover, org-level
tokens, WebSocket transport, Lexical rich-text for blog bodies. Contracts exist;
implementation is future work (see PROGRESS.md).
