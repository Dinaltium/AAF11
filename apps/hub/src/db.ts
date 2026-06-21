import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { dataMode } from '@aaf11/shared';

// Load SQLite lazily so its native binding is never bundled into the
// serverless (real-mode/Vercel) build — real mode uses Postgres only.
const require = createRequire(import.meta.url);

const here = path.dirname(fileURLToPath(import.meta.url));
const hubRoot = path.resolve(here, '..');

/**
 * The test/real switch at the database layer.
 *   real → Neon Postgres (requires DATABASE_URL)
 *   test → local SQLite file, no external service
 */
export function makeDbAdapter() {
  if (dataMode() === 'real') {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'AAF11_DATA_MODE=real requires DATABASE_URL (Neon Postgres connection string).',
      );
    }
    // push: sync the schema on boot (Neon free tier). Keeps the free deploy
    // zero-step — no separate migration job. Revisit with real migrations
    // once the schema stabilises (see docs/DEPLOY-FREE.md).
    return postgresAdapter({ pool: { connectionString }, push: true });
  }

  // test mode — SQLite on local disk (lazily required, see top of file)
  const { sqliteAdapter } = require('@payloadcms/db-sqlite');
  const dataDir = path.join(hubRoot, '.aaf11', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const file = process.env.AAF11_SQLITE_URL ?? `file:${path.join(dataDir, 'test.db')}`;
  return sqliteAdapter({ client: { url: file } });
}
