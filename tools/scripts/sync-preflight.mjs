#!/usr/bin/env node
/**
 * sync-preflight.mjs
 *
 * A handful of tools/scripts files ship twice: once as the canonical copy in
 * this repo, and once verbatim inside `create-workspace`'s preset, written
 * into every scaffolded workspace (preset.ts's `readTemplate(...)` calls).
 * The two copies of each must stay byte-identical:
 *
 *   - `tools/scripts/preflight.mjs` itself branches its port checks on which
 *     of the two trees it is running in (ADR-0090), and that only works if a
 *     fix applied to one copy always reaches the other.
 *   - `tools/scripts/check-contracts.mjs`, `tools/scripts/lib/ts-eval.js` and
 *     `tools/scripts/figma-snapshot-contracts.mjs` are the contract-loop
 *     scripts the scaffold ships (ADR-0121 S4) — the same "one canonical
 *     source, one generated copy" problem, just three more files.
 *
 * Originally a single-file check (preflight.mjs only); generalised to a FILES
 * list here without renaming the script or changing its `--check` semantics,
 * the `[DRIFT]` tag, or the `check:preflight-clone-sync` npm script name a
 * rename would otherwise force a `check:all` edit for.
 *
 * Nothing else enforces this: `check-sync.js` checks Angular/React/Vue
 * component-directory drift only and never looks under
 * `libs/create-workspace/`, and `preset.spec.ts` only asserts the scaffolded
 * files exist and contain expected substrings — neither compares content
 * byte-for-byte.
 *
 * This is its own gate rather than folded into `check-sync.js`, because
 * `check-sync.js`'s contract (and its [DRIFT]/[NO-STORY] tags) is
 * specifically the three framework libraries — a byte-identity check across a
 * short, fixed file list is a different shape of problem and belongs with the
 * `sync-*.mjs --check` family (sync-spec.mjs, sync-tokens.mjs) that already
 * owns exactly this shape: one canonical source, one generated copy.
 *
 * Run via:  node tools/scripts/sync-preflight.mjs [--check]
 *           (or  npm run check:preflight-clone-sync / npm run sync:preflight)
 *
 * --check fails non-zero on drift (used by CI / `check:preflight-clone-sync`, folded
 * into `check:all`). Without --check, overwrites every preset copy with its
 * canonical source.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PRESET_FILES_DIR = 'libs/create-workspace/src/generators/preset/files';

// source (repo-root-relative) -> target (repo-root-relative). Every entry is
// byte-identical between the two paths; `mode` is informational only (shown
// in the drift message).
const FILES = [
  {
    source: 'tools/scripts/preflight.mjs',
    target: `${PRESET_FILES_DIR}/tools/scripts/preflight.mjs`,
  },
  {
    source: 'tools/scripts/check-contracts.mjs',
    target: `${PRESET_FILES_DIR}/tools/scripts/check-contracts.mjs`,
  },
  {
    source: 'tools/scripts/lib/ts-eval.js',
    target: `${PRESET_FILES_DIR}/tools/scripts/lib/ts-eval.js`,
  },
  {
    source: 'tools/scripts/lib/docgen.mjs',
    target: `${PRESET_FILES_DIR}/tools/scripts/lib/docgen.mjs`,
  },
  {
    source: 'tools/scripts/figma-snapshot-contracts.mjs',
    target: `${PRESET_FILES_DIR}/tools/scripts/figma-snapshot-contracts.mjs`,
  },
  // `.ts.template`, not `.ts`: preset.ts's own `storybookTemplateName()` comment
  // explains why — tsconfig.lib.json's `include: ["src/**/*.ts"]` compiles any
  // literal `.ts` file under `files/` (which sits inside `src/`) into `.js`/
  // `.d.ts` as part of THIS package's own build, so a template literally named
  // `types.ts` never reaches dist/ under a name `readTemplate()` can find at
  // runtime — verified the hard way: the packed npm tarball threw
  // `ENOENT .../files/contracts/types.ts` when create-atelier-ui-workspace's
  // e2e actually ran the published preset.
  {
    source: 'libs/spec/src/contracts/types.ts',
    target: `${PRESET_FILES_DIR}/contracts/types.ts.template`,
  },
  {
    source: 'libs/spec/src/contracts/README.md',
    target: `${PRESET_FILES_DIR}/contracts/README.md`,
  },
  {
    source: 'libs/spec/src/contracts/button.contract.ts',
    target: `${PRESET_FILES_DIR}/contracts/button.contract.ts.template`,
  },
];

const mode = process.argv[2];

if (mode === '--check') {
  let drifted = false;
  for (const { source, target } of FILES) {
    const expected = readFileSync(resolve(ROOT, source), 'utf-8');
    let actual = null;
    try {
      actual = readFileSync(resolve(ROOT, target), 'utf-8');
    } catch {
      // actual stays null — reported as drift below
    }
    if (actual !== expected) {
      console.error(`[DRIFT] ${source} and ${target} are not byte-identical.`);
      drifted = true;
    }
  }
  if (drifted) {
    console.error(`Run: node tools/scripts/sync-preflight.mjs`);
    process.exit(1);
  }
  console.log(`✓ ${FILES.length} preset-clone file(s) in sync`);
  process.exit(0);
}

for (const { source, target } of FILES) {
  const expected = readFileSync(resolve(ROOT, source), 'utf-8');
  const targetPath = resolve(ROOT, target);
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, expected);
  console.log(`wrote ${target}`);
}
