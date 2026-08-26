#!/usr/bin/env node
/**
 * Copy the spec sources into each framework lib so they ship inside the framework
 * package's own emit. @atelier-ui/spec is not published — each framework lib is
 * self-contained.
 *
 * Two files travel: `index.ts` (the type contract) and `icons.ts` (the icon
 * geometry — runtime data, deliberately in its own module so `index.ts` stays
 * types-only; see ADR-0046).
 *
 * Run locally or as a pre-build step. --check fails non-zero on drift
 * (used by CI / the `check:spec` script).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FRAMEWORKS = ['angular', 'react', 'vue'];

/** source file → the name it takes inside each framework lib */
const FILES = [
  ['libs/spec/src/index.ts', 'spec.ts'],
  ['libs/spec/src/icons.ts', 'icons.ts'],
];

const header = (source) => `// AUTO-GENERATED from ${source} — do not edit here.
// Run \`node tools/scripts/sync-spec.mjs\` after editing the source of truth.
// The framework libs inline this so @atelier-ui/spec stays internal.

`;

/** [target path, expected content] for every file × framework */
function plan() {
  const out = [];
  for (const [source, name] of FILES) {
    const content = header(source) + readFileSync(resolve(ROOT, source), 'utf-8');
    for (const fw of FRAMEWORKS) {
      out.push([resolve(ROOT, `libs/${fw}/src/lib/${name}`), content]);
    }
  }
  return out;
}

const mode = process.argv[2];
const entries = plan();

if (mode === '--check') {
  const drift = entries.filter(([target, expected]) => {
    try {
      return readFileSync(target, 'utf-8') !== expected;
    } catch {
      return true;
    }
  });
  if (drift.length) {
    console.error('spec copies are out of sync:');
    for (const [f] of drift) console.error(`  - ${f}`);
    console.error('Run: node tools/scripts/sync-spec.mjs');
    process.exit(1);
  }
  console.log(`spec copies are in sync (${entries.length} files)`);
  process.exit(0);
}

for (const [target, expected] of entries) {
  writeFileSync(target, expected);
  console.log(`wrote ${target}`);
}
