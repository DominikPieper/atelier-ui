#!/usr/bin/env node
/**
 * Builds one framework's Storybook and records which source it was built from.
 *
 *   node tools/scripts/storybook-build.mjs <angular|react|vue>
 *
 * This is what every `build-storybook` target runs instead of calling `storybook
 * build` directly, so the stamp (`dist/storybook/<fw>/.atelier-inputs.json`) cannot be
 * forgotten. The hash is taken BEFORE the build starts: a file edited while it runs
 * leaves the build stamped with the older hash and reads as stale afterwards, which is
 * the safe direction. See `lib/storybook-build-stamp.js` and `check:paint`.
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { rmSync } from 'node:fs';

const require = createRequire(import.meta.url);
const {
  computeStamp,
  writeStamp,
  stampPath,
} = require('./lib/storybook-build-stamp.js');

const fw = process.argv[2];
if (!['angular', 'react', 'vue'].includes(fw)) {
  console.error(`usage: storybook-build.mjs <angular|react|vue> (got ${fw})`);
  process.exit(2);
}

rmSync(stampPath(fw), { force: true }); // a failed build must not stay vouched for
const stamp = computeStamp(fw);
const r = spawnSync(
  'npx',
  [
    'storybook',
    'build',
    '--config-dir',
    `libs/${fw}/.storybook`,
    '--output-dir',
    `dist/storybook/${fw}`,
  ],
  { stdio: 'inherit' },
);
if (r.status !== 0) process.exit(r.status ?? 1);
writeStamp(fw, stamp);
console.log(`stamped dist/storybook/${fw} (${stamp.hash.slice(0, 19)}…)`);
