import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load the single root .env (one file for Hub, Web, Desktop).
config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@aaf11/shared'],
};

export default nextConfig;
