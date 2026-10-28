#!/usr/bin/env node
/**
 * Contract check: the hub's Kessel mock must expose every export the real
 * @project-kessel/react-kessel-access-check exposes. When the SDK adds an
 * export, this fails the build until the mock catches up — keeping the mock
 * in sync with the real package is a mechanical gate, not a hope.
 *
 * Extra mock-only exports (e.g. test helpers) are allowed; missing ones are not.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const real = require('@project-kessel/react-kessel-access-check');
let mock;
try {
  mock = require('../dist/mocks/kesselAccessCheck.js');
} catch {
  console.error('[kessel-contract] dist/mocks/kesselAccessCheck.js not found — run the build first.');
  process.exit(1);
}

const realKeys = Object.keys(real).sort();
const mockKeys = new Set(Object.keys(mock));
const missing = realKeys.filter((key) => !mockKeys.has(key));

if (missing.length > 0) {
  console.error(
    `[kessel-contract] The Kessel mock is missing exports present in the real package:\n  ${missing.join('\n  ')}\n` +
      'Extend lib/mocks/kesselAccessCheck.tsx so journeys keep exercising the real SDK surface.'
  );
  process.exit(1);
}

console.log(`[kessel-contract] OK — all ${realKeys.length} real exports are mocked: ${realKeys.join(', ')}`);
