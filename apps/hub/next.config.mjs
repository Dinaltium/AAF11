import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withPayload } from '@payloadcms/next/withPayload';

// Load the single root .env (one file for Hub, Web, Desktop).
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compile the workspace TS package that the Hub imports.
  transpilePackages: ['@aaf11/shared'],
  // Keep the DB adapters (and SQLite's native `libsql` binding) external so
  // Next traces them from node_modules into the serverless function instead of
  // bundling. Without this, real-mode deploys throw "Cannot find module
  // 'libsql'" because db.ts imports the SQLite adapter at module load.
  serverExternalPackages: [
    '@payloadcms/db-sqlite',
    '@payloadcms/db-postgres',
    'libsql',
    '@libsql/client',
  ],
};

export default withPayload(nextConfig);
