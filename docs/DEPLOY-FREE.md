# Free hosting (Vercel + Neon)

This is the zero-cost path to put **Hub** + **Web** online. Everything here fits
inside free tiers. The **Desktop** app is a native Tauri binary — it is not
web-hosted; CI builds its installer on tag push (see below).

## Live (deployed 2026-06-22)

- **Hub admin:** https://aaf-11-hub.vercel.app/admin
- **Public site:** https://aaf-11-web.vercel.app
- **DB:** Neon Free `aaf11-db` (provisioned via Vercel Storage)
- Both Vercel projects auto-deploy on every push to `main`.

## Architecture

| Piece        | Where             | Free tier        | Notes                              |
|--------------|-------------------|------------------|------------------------------------|
| Hub (Payload)| Vercel project A  | Vercel Hobby     | Admin at `/admin`, public API      |
| Web (site)   | Vercel project B  | Vercel Hobby     | Reads Hub public API               |
| Database     | Neon Postgres     | Neon Free        | `DATABASE_URL`                     |
| Media uploads| (optional) Vercel Blob | Blob Free   | Without it, text/admin still works |

Both Vercel projects import the **same GitHub repo**, distinguished by **Root
Directory**. Auto-deploy on every push to `main`.

## 1. Neon database

1. Create a free project at neon.tech (sign in with Google).
2. Copy the **pooled** connection string → this is `DATABASE_URL`.

## 2. Hub → Vercel (project A)

- **Import** the GitHub repo, set **Root Directory = `apps/hub`**.
- Framework auto-detects Next.js. Build/install are default (Vercel runs the
  pnpm workspace install at the repo root automatically).
- **Environment variables:**
  - `AAF11_DATA_MODE = real`
  - `DATABASE_URL = <neon pooled string>`
  - `PAYLOAD_SECRET = <openssl rand -hex 32>`
  - (optional) `BLOB_READ_WRITE_TOKEN = <vercel blob token>` for media uploads
- **Create the Neon schema once** (Payload ignores `push` in production, so the
  tables must be created from a local *dev* run that has push enabled):
  ```bash
  cd apps/hub
  AAF11_DATA_MODE=real DATABASE_URL="<neon unpooled string>" \
    PAYLOAD_SECRET="<same secret>" pnpm tsx -e "import('./src/payload.config.js').then(m=>import('payload').then(p=>p.getPayload({config:m.default})))"
  ```
  (Any local dev-mode Payload init against the Neon `DATABASE_URL` works — it
  runs drizzle `push` and creates every table. Done once; re-run after schema
  changes.) Then redeploy / reload the Hub.
- Use the Neon **unpooled** (direct) connection string for `DATABASE_URL` — the
  pgbouncer pooler can break Payload's prepared-statement DDL.
- Open `/admin` and create the first admin member.

> **Schema sync vs migrations:** real mode keeps `push: true` so local dev runs
> create the schema in one step. Production never auto-pushes. Once the schema
> stabilises, switch to generated migrations (`payload migrate:create` /
> `migrate`) and set `push: false`.

## 3. Web → Vercel (project B)

- **Import** the same repo, set **Root Directory = `apps/web`**.
- **Environment variables:**
  - `AAF11_DATA_MODE = real`
  - `AAF11_HUB_URL = https://<your-hub-project>.vercel.app` (server-side fetch —
    the web data layer reads `AAF11_HUB_URL`, not a `NEXT_PUBLIC_*` var)
- Deploy. The site reads the Hub's public API. (In `test` mode it falls back to
  bundled mock data, so it renders even if the Hub is down.)

## 4. CI/CD

- `.github/workflows/ci.yml` — on every push/PR to `main`: install, typecheck,
  test, build **web** and **hub** (test mode, no secrets). This gates merges.
- Vercel adds its own build + preview-deploy check per push automatically once
  the repo is connected.
- `.github/workflows/desktop-release.yml` — on `v*` tag push, builds the Tauri
  installer on Windows and attaches it to a GitHub Release.

## 5. Desktop (not hosted)

```bash
git tag v0.1.0 && git push --tags   # triggers the installer build + release
```
Or build locally: `cd apps/desktop && pnpm tauri build`. Point it at the live
Hub with `VITE_AAF11_DATA_MODE=real` and `VITE_AAF11_HUB_URL=https://<hub>.vercel.app`.
