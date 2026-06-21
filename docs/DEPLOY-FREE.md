# Free hosting (Vercel + Neon)

This is the zero-cost path to put **Hub** + **Web** online. Everything here fits
inside free tiers. The **Desktop** app is a native Tauri binary — it is not
web-hosted; CI builds its installer on tag push (see below).

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
- Deploy. First request syncs the schema to Neon automatically (`push: true` in
  `src/db.ts`), so there is **no separate migration step**.
- Open `/admin` and create the first admin member.

> **Schema sync vs migrations:** real mode uses `push: true` to keep the free
> deploy one-step. Once the schema stabilises, switch to generated migrations
> (`payload migrate:create` / `migrate`) and set `push: false`.

## 3. Web → Vercel (project B)

- **Import** the same repo, set **Root Directory = `apps/web`**.
- **Environment variables:**
  - `AAF11_DATA_MODE = real`
  - `NEXT_PUBLIC_HUB_URL = https://<your-hub-project>.vercel.app`
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
