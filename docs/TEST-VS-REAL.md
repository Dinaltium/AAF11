# test vs real — the single switch

AAF11 Nexus has **one** control that decides whether the whole system runs
against **mock data** or **real data**:

```
AAF11_DATA_MODE = test | real
```

That is the single point you asked for. Nothing else needs to change. Flip this
one variable and every component switches behaviour consistently.

## What each mode means

| | `test` | `real` |
|---|--------|--------|
| Hub database | **SQLite** (local file, auto-created) | **Neon Postgres** (`DATABASE_URL`) |
| Hub data | seeded **mock fixtures** | **live data only** |
| Public website | renders mock if the Hub is down (PREVIEW banner) | must reach the Hub; **no mock fallback** |
| Desktop app | runs entirely from **bundled mock fixtures**, no backend | reads the **live Hub** API, dispatches real actions |
| External services | **none** (runs offline) | Neon, Vercel Blob, OAuth |
| Mock code paths | active | **unreachable** (guarded) |

## Where the switch lives

One module reads the flag — **`packages/shared/src/data-mode.ts`** — and
everything imports from it:

```ts
import { dataMode, isTest, isReal, assertReal, assertTest } from '@aaf11/shared';

dataMode();            // 'test' | 'real'  (defaults to 'test')
assertReal('payments') // throws unless real — guards real-only code
assertTest('seed')     // throws unless test — guards mock-only code
```

- **Hub DB adapter** (`apps/hub/src/db.ts`) picks SQLite vs Neon from `dataMode()`.
- **Hub seed** (`apps/hub/src/seed.ts`) starts with `assertTest('hub seed')` —
  it physically cannot run in real mode, so mock data can never reach production.
- **Public website** (`apps/web/src/lib/api.ts`) only falls back to mock when
  `dataMode() === 'test'`.
- **Desktop** reads `VITE_AAF11_DATA_MODE` (Vite exposes only `VITE_`-prefixed
  vars to the browser bundle) — `test` uses bundled fixtures, `real` calls the Hub.

## How to switch

### Run in test (default — no secrets)
```bash
# .env
AAF11_DATA_MODE=test
```
Seed once, then run. SQLite file lives at `apps/hub/.aaf11/data/test.db`
(gitignored).

### Run in real (production data)
```bash
# .env
AAF11_DATA_MODE=real
DATABASE_URL=postgres://...neon...
PAYLOAD_SECRET=<strong random>
BLOB_READ_WRITE_TOKEN=<vercel blob>
```
Then run Payload migrations against Neon (see [DEPLOYMENT](DEPLOYMENT.md)) — do
**not** run the seed script. The desktop app needs `VITE_AAF11_DATA_MODE=real`
and a member token (stored in the OS keychain).

## The guarantee

Mock and real never mix:

- `assertTest()` makes seed/fixture code throw in real mode.
- `assertReal()` makes live-service code throw in test mode.
- The public site's mock fallback is gated on `isTest()`.
- Real mode requires `DATABASE_URL`; its absence throws at startup rather than
  silently using SQLite.

So "test" gives you a fully working system to click around with zero setup, and
"real" guarantees that **only actual data is used and no mock comes into play.**
