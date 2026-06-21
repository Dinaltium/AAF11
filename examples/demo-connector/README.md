# demo-connector

A minimal project that connects to AAF11 Nexus using the published `aaf11-sdk`.

```bash
npm install
cp .env.example .env     # then set AAF11_MEMBER_TOKEN to your token (e.g. aaf11_cto)
npm start                # starts on :8080 and registers with the Hub
```

Requires the Hub running (`http://localhost:3000`) and a member whose
`memberToken` matches `AAF11_MEMBER_TOKEN`. `npm start` loads `.env` via Node's
built-in `--env-file` (Node 20.6+), no extra deps.

Verify:
```bash
curl http://localhost:8080/aaf11/health
curl http://localhost:3000/api/public/projects   # "Demo Project" appears
```
Then refresh the desktop dashboard.

Override defaults via env: `AAF11_PROJECT_KEY`, `AAF11_MEMBER_TOKEN`,
`AAF11_HUB_URL`, `CONNECTOR_URL`.
