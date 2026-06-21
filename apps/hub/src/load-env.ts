// Loads the single root .env for tsx scripts (seed, poller-worker).
// Import this FIRST, before payload.config, so the DB adapter sees the vars.
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// src -> hub -> apps -> repo root
config({ path: path.resolve(here, '../../../.env') });
