#!/usr/bin/env node
/**
 * Copy libs/spec/src/index.ts into each framework lib so the spec types
 * ship inside the framework package's own type emit. @atelier-ui/spec is
 * not published — each framework lib is self-contained.
 *
 * Run locally or as a pre-build step. --check fails non-zero on drift
 * (used by CI / the `check:sync` script).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = resolve(ROOT, 'libs/spec/src/index.ts');
const TARGETS = [
  resolve(ROOT, 'libs/angular/src/lib/spec.ts'),
  resolve(ROOT, 'libs/react/src/lib/spec.ts'),
  resolve(ROOT, 'libs/vue/src/lib/spec.ts'),
];

const HEADER = `// AUTO-GENERATED from libs/spec/src/index.ts — do not edit here.
// Run \`node tools/scripts/sync-spec.mjs\` after editing the source of truth.
// The framework libs inline these types so @atelier-ui/spec stays internal.

`;

function build() {
  return HEADER + readFileSync(SOURCE, 'utf-8');
}

const mode = process.argv[2];
const expected = build();

if (mode === '--check') {
  const drift = TARGETS.filter((t) => {
    try {
      return readFileSync(t, 'utf-8') !== expected;
    } catch {
      return true;
    }
  });
  if (drift.length) {
    console.error('spec copies are out of sync:');
    for (const f of drift) console.error(`  - ${f}`);
    console.error('Run: node tools/scripts/sync-spec.mjs');
    process.exit(1);
  }
  console.log('spec copies are in sync');
  process.exit(0);
}

for (const t of TARGETS) {
  writeFileSync(t, expected);
  console.log(`wrote ${t}`);
}
