# AAF11 Nexus — Documentation

Start here. The full picture, in order:

1. **[MANUAL.md](MANUAL.md)** — what it is, the pieces, how to run everything,
   SDK usage, API reference, testing, repo layout.
2. **[TEST-VS-REAL.md](TEST-VS-REAL.md)** — the single `AAF11_DATA_MODE` switch:
   mock data vs real data, and the guarantee they never mix.
2b. **[SDK.md](SDK.md)** — connect a project with `aaf11-sdk` / `aaf11`: install,
   every framework (Express, Fastify, http, Next.js, FastAPI, Flask), config,
   custom metrics/actions, verifying the connection, troubleshooting.
3. **[SECURITY.md](SECURITY.md)** — tokens, credentials, API security, keychain.
4. **[DEPLOYMENT.md](DEPLOYMENT.md)** — taking it to real mode (Neon, Vercel, desktop installers).
5. **[DO-AND-DONT.md](DO-AND-DONT.md)** — rules of the road for this codebase.
6. **[specs/2026-06-21-aaf11-nexus-design.md](specs/2026-06-21-aaf11-nexus-design.md)** — the original locked design.

Build status and resume log: [`../PROGRESS.md`](../PROGRESS.md).
