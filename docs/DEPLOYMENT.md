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

## 2. Hub → Vercel

1. Set env vars in the Vercel project:
   `AAF11_DATA_MODE=real`, `DATABASE_URL`, `PAYLOAD_SECRET`,
   `BLOB_READ_WRITE_TOKEN`.
2. Generate and run Payload migrations against Neon (don't use dev push in prod):
   ```bash
   cd apps/hub
   AAF11_DATA_MODE=real DATABASE_URL=... pnpm payload migrate:create
   AAF11_DATA_MODE=real DATABASE_URL=... pnpm payload migrate
   ```
3. Deploy (Vercel auto-builds from GitHub). The admin is at `/admin`.
4. Create the first admin member in the Payload admin UI.

### Polling (disabled for now)
Scheduled health/metrics polling is **turned off** at the moment — there is no
cron route or worker. Snapshots come from the seed (test) or can be pushed by
projects. The `pollAll` logic (`apps/hub/src/logic/poller.ts`) is kept so polling
can be re-enabled later as a Vercel Cron route or a standalone worker.

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

## 5. Publish + embed the SDK

The JS SDK is published as **`aaf11-sdk`** (self-contained, no workspace dep).

```bash
cd packages/sdk-js
pnpm build                 # tsup → dist/ (ESM + CJS + .d.ts)
npm publish                # unscoped public package; bump version first
# or, to install without publishing:
npm pack                   # → aaf11-sdk-0.1.0.tgz, then `npm i ./aaf11-sdk-0.1.0.tgz` in a project
```

Then in each project:
```bash
npm install aaf11-sdk
```
Set `AAF11_PROJECT_KEY`, `AAF11_MEMBER_TOKEN`, `AAF11_HUB_URL` in that project's
env and call `connector.start()` (see the package README / MANUAL §7). The member
token must already exist in the Hub's Members. Local backends reach the Hub via
Cloudflare Tunnel.

**Python SDK** (`aaf11`) ships to PyPI separately:
```bash
cd packages/sdk-py
python -m build            # → dist/*.whl
twine upload dist/*        # or `pip install dist/*.whl` locally
```

## Deferred (not in this build)

WhatsApp bot, Cloudflare Tunnel automation, fallback server failover, org-level
tokens, WebSocket transport, Lexical rich-text for blog bodies. Contracts exist;
implementation is future work (see PROGRESS.md).
