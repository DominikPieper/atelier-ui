#!/usr/bin/env node
/**
 * Copy the design tokens stylesheet from the create-workspace preset (the
 * seed scaffolded into every new Atelier workspace) into each framework
 * lib's own styles/tokens.css. The preset copy is the source of truth so a
 * freshly generated workspace and the shipped libs always agree.
 *
 * Run locally or as a pre-build step. --check fails non-zero on drift
 * (used by CI / the `check:tokens` script).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = resolve(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);
const TARGETS = [
  resolve(ROOT, 'libs/angular/src/styles/tokens.css'),
  resolve(ROOT, 'libs/react/src/styles/tokens.css'),
  resolve(ROOT, 'libs/vue/src/styles/tokens.css'),
];

const mode = process.argv[2];
const expected = readFileSync(SOURCE, 'utf-8');

if (mode === '--check') {
  const drift = TARGETS.filter((t) => {
    try {
      return readFileSync(t, 'utf-8') !== expected;
    } catch {
      return true;
    }
  });
  if (drift.length) {
    console.error('token copies are out of sync:');
    for (const f of drift) console.error(`  - ${f}`);
    console.error('Run: node tools/scripts/sync-tokens.mjs');
    process.exit(1);
  }
  console.log('token copies are in sync');
  process.exit(0);
}

for (const t of TARGETS) {
  writeFileSync(t, expected);
  console.log(`wrote ${t}`);
}
