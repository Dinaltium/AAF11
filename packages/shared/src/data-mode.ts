/**
 * The single switch: test vs real.
 *
 * `AAF11_DATA_MODE` is read in EXACTLY one place — here. Every component that
 * needs to know the mode imports `dataMode()` / `isTest()` / `isReal()` from
 * this module. This guarantees:
 *   - test  → SQLite + seeded mock data, no external services.
 *   - real  → Neon Postgres + live data only; mock code paths are unreachable.
 *
 * `assertReal()` is the guard that makes mock leakage into production
 * impossible: any code that must never run with mock data calls it and throws
 * loudly if the mode is wrong.
 */

export type DataMode = 'test' | 'real';

function readEnv(): string {
  // Node / Next.js server / Tauri sidecar all expose process.env.
  // Browsers do not read this flag — they consume the Hub API instead.
  // Access via globalThis so this stays type-safe without @types/node.
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const raw = g.process?.env?.AAF11_DATA_MODE;
  return (raw ?? 'test').toLowerCase().trim();
}

/** Returns the active data mode, defaulting to `test`. Throws on garbage. */
export function dataMode(): DataMode {
  const v = readEnv();
  if (v === 'real') return 'real';
  if (v === 'test') return 'test';
  throw new Error(
    `Invalid AAF11_DATA_MODE="${v}". Expected "test" or "real". ` +
      `Set it in .env (default: test).`,
  );
}

export function isTest(): boolean {
  return dataMode() === 'test';
}

export function isReal(): boolean {
  return dataMode() === 'real';
}

/**
 * Guard for code that must only run against real data. Call at the top of any
 * branch that talks to live external services or returns production data.
 */
export function assertReal(context: string): void {
  if (!isReal()) {
    throw new Error(
      `[${context}] requires AAF11_DATA_MODE=real but mode is "${dataMode()}".`,
    );
  }
}

/**
 * Guard for code that must only run with mock data. Call at the top of any
 * fixture/seed branch so mock data can never execute in real mode.
 */
export function assertTest(context: string): void {
  if (!isTest()) {
    throw new Error(
      `[${context}] is mock-only and must not run in real mode ` +
        `(AAF11_DATA_MODE=${dataMode()}).`,
    );
  }
}
