import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { makeDbAdapter } from './db';
import { Members, Projects, MetricsSnapshots, ActionsLog } from './collections/ops';
import { Posts, Services, TeamProfiles, Media } from './collections/cms';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-only-secret-change-me-in-real-mode',
  admin: {
    user: 'members',
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— AAF11 Nexus',
    },
  },
  editor: lexicalEditor(),
  db: makeDbAdapter(),
  collections: [
    Members,
    Projects,
    MetricsSnapshots,
    ActionsLog,
    Posts,
    Services,
    TeamProfiles,
    Media,
  ],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
});
