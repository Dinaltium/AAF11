import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataMode, isTest, isReal, assertReal, assertTest } from './data-mode.js';

function withMode<T>(value: string | undefined, fn: () => T): T {
  const prev = process.env.AAF11_DATA_MODE;
  if (value === undefined) delete process.env.AAF11_DATA_MODE;
  else process.env.AAF11_DATA_MODE = value;
  try {
    return fn();
  } finally {
    if (prev === undefined) delete process.env.AAF11_DATA_MODE;
    else process.env.AAF11_DATA_MODE = prev;
  }
}

test('defaults to test when unset', () => {
  withMode(undefined, () => {
    assert.equal(dataMode(), 'test');
    assert.equal(isTest(), true);
    assert.equal(isReal(), false);
  });
});

test('reads real', () => {
  withMode('real', () => {
    assert.equal(dataMode(), 'real');
    assert.equal(isReal(), true);
  });
});

test('is case-insensitive and trims', () => {
  withMode('  REAL ', () => assert.equal(dataMode(), 'real'));
  withMode('Test', () => assert.equal(dataMode(), 'test'));
});

test('throws on garbage', () => {
  withMode('prod', () => assert.throws(() => dataMode(), /Invalid AAF11_DATA_MODE/));
});

test('assertReal guards real-only code', () => {
  withMode('test', () => assert.throws(() => assertReal('db'), /requires AAF11_DATA_MODE=real/));
  withMode('real', () => assert.doesNotThrow(() => assertReal('db')));
});

test('assertTest guards mock-only code', () => {
  withMode('real', () => assert.throws(() => assertTest('seed'), /mock-only/));
  withMode('test', () => assert.doesNotThrow(() => assertTest('seed')));
});
