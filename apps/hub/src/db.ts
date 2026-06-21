import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { dataMode } from '@aaf11/shared';

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
    return postgresAdapter({ pool: { connectionString } });
  }

  // test mode — SQLite on local disk
  const dataDir = path.join(hubRoot, '.aaf11', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const file = process.env.AAF11_SQLITE_URL ?? `file:${path.join(dataDir, 'test.db')}`;
  return sqliteAdapter({ client: { url: file } });
}
