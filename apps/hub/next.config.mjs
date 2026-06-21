import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withPayload } from '@payloadcms/next/withPayload';

// Load the single root .env (one file for Hub, Web, Desktop).
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compile the workspace TS package that the Hub imports.
  transpilePackages: ['@aaf11/shared'],
  // Keep the DB adapters (and SQLite's native `libsql` binding) external so
  // Next traces them from node_modules instead of bundling.
  serverExternalPackages: [
    '@payloadcms/db-sqlite',
    '@payloadcms/db-postgres',
    'libsql',
    '@libsql/client',
  ],
  // db.ts imports the SQLite adapter at module load (kept static so the hub
  // logic tests stay deterministic). In real mode SQLite is never *used*, but
  // the import still resolves `libsql` at runtime — and Next's tracer misses
  // its native binding in the pnpm store, causing "Cannot find module 'libsql'"
  // on Vercel. Force the whole libsql install (JS + every platform binary) into
  // the serverless function. Tracing root is the monorepo so the pnpm store is
  // in scope.
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    '/**': [
      '../../node_modules/.pnpm/libsql@*/node_modules/libsql/**',
      '../../node_modules/.pnpm/@libsql+*/node_modules/@libsql/**',
    ],
  },
};

export default withPayload(nextConfig);
