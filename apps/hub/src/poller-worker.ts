/**
 * Standalone poller worker. Runs the poll loop in-process on an interval —
 * the real-mode option for environments where Vercel Cron's per-minute limit
 * isn't available (e.g. the home server). Also the test-mode convenience.
 *
 * Run: pnpm --filter @aaf11/hub poll
 */
import './load-env';
import { getPayload } from 'payload';
import config from './payload.config.js';
import { pollAll } from './logic/poller.js';

const INTERVAL_MS = Number(process.env.AAF11_POLL_INTERVAL_MS ?? 60_000);

async function main() {
  const payload = await getPayload({ config });
  console.log(`[poller] started, interval=${INTERVAL_MS}ms`);
  const tick = async () => {
    try {
      const results = await pollAll(payload);
      const down = results.filter((r) => !r.ok).length;
      console.log(`[poller] polled ${results.length} projects, ${down} down`);
    } catch (err) {
      console.error('[poller] tick failed:', err);
    }
  };
  await tick();
  setInterval(tick, INTERVAL_MS);
}

main().catch((err) => {
  console.error('[poller] fatal:', err);
  process.exit(1);
});
