# Security

## Tokens

| Token | Prefix | Identifies | Privilege | Storage |
|-------|--------|-----------|-----------|---------|
| Project key | `proj_` | a project | low — metrics reporting | project env var |
| Member token | `mbr_` | a person | high — control plane | OS keychain (desktop), env var (CI) |

- The **member token gates control actions** and proves ownership. Treat it like
  a password.
- The **project key** lets a connector report metrics. Lower privilege, still
  private.
- Control actions require a valid member token **and** project ownership (or the
  `admin` role). A non-owner, non-admin gets `403`.

## Credential management

- All tokens live in **environment variables** or a `.env` file that is **never
  committed** (`.gitignore` excludes `.env*` except `.env.example`).
- `.env.example` documents every variable **without values**.
- `PAYLOAD_SECRET` must be a strong random value in real mode
  (`openssl rand -hex 32`). The committed default is for test/dev only.

## Desktop app

- The member token is stored in the **OS keychain** (Windows Credential Manager /
  macOS Keychain / Linux Secret Service) via the `keyring` crate —
  `save_token` / `get_token` Rust commands. Not in localStorage, not in a plain
  file. (The browser-preview fallback uses localStorage and is dev-only.)
- The app is a desktop binary — not reachable from the network, not exposed to a
  browser.

## API security

- **Private API** (Payload REST/GraphQL, control plane) requires a valid token.
- **Public API** is read-only and returns only whitelisted fields — project
  keys, member tokens, and internal fields are never exposed. See
  `apps/hub/src/logic/public.ts`.
- Control-plane endpoints additionally verify ownership before acting.
- Real-mode traffic must be **HTTPS only**.

## Local servers (future, per spec)

Home/fallback servers are exposed through **Cloudflare Tunnel** (TLS + DDoS
protection), never by opening router ports. The Hub validates the project key on
every connector registration and report.

## What NOT to do

- Do **not** hardcode `AAF11_PROJECT_KEY` / `AAF11_MEMBER_TOKEN` or commit them.
- Do **not** ship the test `PAYLOAD_SECRET` to production.
- Do **not** expose the Payload private API or admin to the public internet
  without auth in front (the desktop reaches it over an authenticated channel).
- Do **not** run the seed script in real mode (it is guarded, but never try).
