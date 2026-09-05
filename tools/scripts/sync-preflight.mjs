#!/usr/bin/env node
/**
 * sync-preflight.mjs
 *
 * `tools/scripts/preflight.mjs` ships twice: once as this canonical copy, and
 * once verbatim inside `create-workspace`'s preset, written into every
 * scaffolded workspace (preset.ts's `readTemplate('tools/scripts/preflight.mjs')`).
 * The two must stay byte-identical — preflight.mjs itself now branches its
 * port checks on which of the two trees it is running in (ADR-0090), and
 * that only works if a fix applied to one copy always reaches the other.
 *
 * Nothing enforced that until this script existed: `check-sync.js` checks
 * Angular/React/Vue component-directory drift only and never looks under
 * `libs/create-workspace/`, and `preset.spec.ts` only asserts the scaffolded
 * file exists and contains a title substring — neither compares content.
 *
 * This is its own gate rather than folded into `check-sync.js`, because
 * `check-sync.js`'s contract (and its [DRIFT]/[NO-STORY] tags) is
 * specifically the three framework libraries — a two-file byte-identity
 * check is a different shape of problem and belongs with the `sync-*.mjs
 * --check` family (sync-spec.mjs, sync-tokens.mjs) that already owns exactly
 * this shape: one canonical source, one generated copy.
 *
 * Run via:  node tools/scripts/sync-preflight.mjs [--check]
 *           (or  npm run check:preflight / npm run sync:preflight)
 *
 * --check fails non-zero on drift (used by CI / `check:preflight`, folded
 * into `check:all`). Without --check, overwrites the preset copy with the
 * canonical one.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = 'tools/scripts/preflight.mjs';
const TARGET =
  'libs/create-workspace/src/generators/preset/files/tools/scripts/preflight.mjs';

const expected = readFileSync(resolve(ROOT, SOURCE), 'utf-8');

const mode = process.argv[2];

if (mode === '--check') {
  let actual = null;
  try {
    actual = readFileSync(resolve(ROOT, TARGET), 'utf-8');
  } catch {
    // actual stays null — reported as drift below
  }
  if (actual !== expected) {
    console.error(`[DRIFT] ${SOURCE} and ${TARGET} are not byte-identical.`);
    console.error(`Run: node tools/scripts/sync-preflight.mjs`);
    process.exit(1);
  }
  console.log(`✓ preflight.mjs copies are in sync (${SOURCE} ↔ ${TARGET})`);
  process.exit(0);
}

writeFileSync(resolve(ROOT, TARGET), expected);
console.log(`wrote ${TARGET}`);
