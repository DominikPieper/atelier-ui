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
 *   - `libs/design-contracts/{bin,src}/*` is the self-contained contract-loop
 *     package (`@conciso/design-contracts`: `check-contracts`,
 *     `figma-snapshot-contracts`, their docgen/config/ts-eval plumbing). The
 *     scaffold vendors it under `tools/design-contracts/` (ADR-0121 S4) — the
 *     same "one canonical source, one generated copy" problem, just more files.
 *     The package's `src/types.d.ts` (the `ComponentContract` type) is also
 *     projected into `libs/spec/src/contracts/types.ts`, which this repo's
 *     contracts import as `./types`.
 *   - `tools/stylelint-rules/{index,utils,no-raw-color-literal,
 *     no-undeclared-token,no-primitive-token,no-token-bypass}.js` are the
 *     ported CSS-discipline stylelint rules the scaffold ships (ADR-0130) —
 *     six more files, same shape again. `no-primitive-token.js` ships even
 *     though the scaffold's own stylelint.config.mjs (written by preset.ts,
 *     not cloned) never wires it: `index.js` requires all four rule files
 *     unconditionally, and a byte-identical `index.js` is worth more than a
 *     scaffold-specific fork that drops one `require()` — see preset.ts's
 *     comment on that decision.
 *   - `tools/eslint-rules/{angular-template,atl-button-icon-only-needs-name,
 *     atl-sub-component-needs-parent}.js` are the two Angular template rules the
 *     Angular scaffold wires (ADR-0152), plus the plugin file that exposes them.
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
  // The contract-loop package, vendored whole into the scaffold. `.mjs`/`.cjs`
  // only, so the scaffold needs no package.json of its own for it: the file
  // extension fixes the module format whatever the workspace's root `type` is.
  {
    source: 'libs/design-contracts/bin/check-contracts.mjs',
    target: `${PRESET_FILES_DIR}/tools/design-contracts/bin/check-contracts.mjs`,
  },
  {
    source: 'libs/design-contracts/bin/figma-snapshot-contracts.mjs',
    target: `${PRESET_FILES_DIR}/tools/design-contracts/bin/figma-snapshot-contracts.mjs`,
  },
  {
    source: 'libs/design-contracts/src/codespec.mjs',
    target: `${PRESET_FILES_DIR}/tools/design-contracts/src/codespec.mjs`,
  },
  {
    source: 'libs/design-contracts/src/config.mjs',
    target: `${PRESET_FILES_DIR}/tools/design-contracts/src/config.mjs`,
  },
  {
    source: 'libs/design-contracts/src/docgen.mjs',
    target: `${PRESET_FILES_DIR}/tools/design-contracts/src/docgen.mjs`,
  },
  {
    source: 'libs/design-contracts/src/ts-eval.cjs',
    target: `${PRESET_FILES_DIR}/tools/design-contracts/src/ts-eval.cjs`,
  },
  // The `ComponentContract` type: canonical in the package, projected into this
  // repo's own contracts directory (its `*.contract.ts` files import `./types`)
  // and into the scaffold's template.
  {
    source: 'libs/design-contracts/src/types.d.ts',
    target: 'libs/spec/src/contracts/types.ts',
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
    source: 'libs/design-contracts/src/types.d.ts',
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
  // Ported CSS-discipline stylelint rules (ADR-0130). Six files, same
  // "one canonical source, one generated copy" shape as everything above —
  // no `.template` suffix needed, since these are `.js`, not `.ts` (the
  // extension the scaffold package's own tsconfig.lib.json would otherwise
  // try to compile away — see the comment on the two `.template` entries
  // above).
  {
    source: 'tools/stylelint-rules/index.js',
    target: `${PRESET_FILES_DIR}/tools/stylelint-rules/index.js`,
  },
  {
    source: 'tools/stylelint-rules/utils.js',
    target: `${PRESET_FILES_DIR}/tools/stylelint-rules/utils.js`,
  },
  {
    source: 'tools/stylelint-rules/no-raw-color-literal.js',
    target: `${PRESET_FILES_DIR}/tools/stylelint-rules/no-raw-color-literal.js`,
  },
  {
    source: 'tools/stylelint-rules/no-undeclared-token.js',
    target: `${PRESET_FILES_DIR}/tools/stylelint-rules/no-undeclared-token.js`,
  },
  {
    source: 'tools/stylelint-rules/no-primitive-token.js',
    target: `${PRESET_FILES_DIR}/tools/stylelint-rules/no-primitive-token.js`,
  },
  {
    source: 'tools/stylelint-rules/no-token-bypass.js',
    target: `${PRESET_FILES_DIR}/tools/stylelint-rules/no-token-bypass.js`,
  },
  // Ships for the same reason no-primitive-token.js does: index.js requires every rule
  // file, and index.js stays byte-identical. The scaffold's config does not wire it;
  // its own CSS has no `.atl-` root. Its test file stays in this repo.
  {
    source: 'tools/stylelint-rules/rooted-selector.js',
    target: `${PRESET_FILES_DIR}/tools/stylelint-rules/rooted-selector.js`,
  },
  // The two Angular template rules the Angular scaffold wires (ADR-0152), and the
  // plugin file that exposes them. `angular-template.js` is its own entry point
  // rather than a shared `index.js`: the repo's `index.js` carries repo-only rules
  // the scaffold has no use for. The rules' tests and the story-template processor
  // stay in this repo (they read the library's component sources and its stories).
  {
    source: 'tools/eslint-rules/angular-template.js',
    target: `${PRESET_FILES_DIR}/tools/eslint-rules/angular-template.js`,
  },
  {
    source: 'tools/eslint-rules/atl-button-icon-only-needs-name.js',
    target: `${PRESET_FILES_DIR}/tools/eslint-rules/atl-button-icon-only-needs-name.js`,
  },
  {
    source: 'tools/eslint-rules/atl-sub-component-needs-parent.js',
    target: `${PRESET_FILES_DIR}/tools/eslint-rules/atl-sub-component-needs-parent.js`,
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
