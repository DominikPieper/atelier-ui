#!/usr/bin/env node
/**
 * check-exports.js
 *
 * Validates that every component the spec promises is actually reachable BY
 * NAME from its framework's public barrel (src/index.ts) — not just that its
 * directory is mentioned there.
 *
 * Before this gate compared component *directory names* only: it asserted the
 * barrel text contained the substring `lib/<dir>/` somewhere. That passes the
 * moment ONE symbol in a directory is exported, regardless of how many other
 * symbols that directory's files declare. check-sync.js (directory existence)
 * and the old substring check together left a real blind spot: a component
 * added as a SECOND symbol inside an already-exported directory — the
 * multi-symbol-per-directory pattern this repo already uses (`atl-dialog`,
 * `atl-table`, `atl-avatar`) — could ship un-exported and neither gate would
 * notice, because the directory was already "covered" by its first symbol.
 *
 * Fixed by checking the actual export identifier, via the real TypeScript
 * checker rather than a text search: `ts.createProgram` + `getExportsOfModule`
 * on each barrel resolves what a consumer's `import { X } from
 * '@atelier-ui/<fw>'` would actually see, which is the only thing a text
 * search over the barrel cannot get right for React. React re-exports a whole
 * component MODULE per line (`export * from './lib/avatar/atl-avatar'`) rather
 * than naming each symbol — so a literal identifier-text search over the
 * barrel would report every wildcard-re-exported name as missing, a false
 * positive on nearly the entire React barrel. `getExportsOfModule` resolves
 * `export *` the same way tsc and every bundler does (confirmed against this
 * repo's actual `nx build react` output and an esbuild bundle of it), so it
 * treats React's module-per-line style and Angular/Vue's explicit
 * `export { X, Y } from` style identically — both are just "is X reachable
 * from this barrel's module symbol", no per-framework special-casing needed.
 *
 * [NAMED] rule: for every `Atl<X>Spec` the spec declares a component for
 * (`lib/component-map.js`'s `keyedSpecs()` — the same "component the spec
 * promises" set check-prop-surface.js compares props against, extracted there
 * so the two gates cannot silently disagree on it), `Atl<X>` must be in the
 * barrel's resolved export names.
 *
 * [NO-EXPORT] rule kept as a baseline under the OLD name: a handful of real
 * components have no spec interface at all (AtlCodeBlock, AtlThead, …ADR-
 * pending, see check-prop-surface.js's UNKEYED_COMPONENTS) and so are outside
 * "what the spec promises" — for those, and as a catch-all in case a whole
 * directory's barrel line goes missing entirely, the directory-substring
 * check still runs unchanged. [NAMED] is additive rigor, not a replacement:
 * every directory still needs SOME barrel reference, and every keyed
 * component additionally needs to be BY NAME reachable from it.
 *
 * Run via:  node tools/scripts/check-exports.js
 *           (or  npm run check:exports)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { FRAMEWORKS, isComponentDir } = require('./lib/component-discovery');
const { keyedSpecs, componentNameOf } = require('./lib/component-map');

const ROOT = path.resolve(__dirname, '../..');

const errors = [];

// ---------------------------------------------------------------------------
// [NAMED]: resolve each barrel's real export names via the TypeScript checker.
// ---------------------------------------------------------------------------

/** @returns {Set<string>} the names actually reachable via `import { X } from` on this module. */
function resolvedExportNames(entryFile) {
  const program = ts.createProgram([entryFile], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    jsx: ts.JsxEmit.ReactJSX,
    experimentalDecorators: true,
    noEmit: true,
    allowJs: false,
  });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(entryFile);
  const moduleSymbol =
    sourceFile &&
    (checker.getSymbolAtLocation(sourceFile) || sourceFile.symbol);
  if (!moduleSymbol) return new Set();
  return new Set(
    checker.getExportsOfModule(moduleSymbol).map((s) => s.getName()),
  );
}

const KEYED_SPECS = keyedSpecs();

for (const framework of FRAMEWORKS) {
  const barrelPath = path.join(ROOT, 'libs', framework, 'src', 'index.ts');
  if (!fs.existsSync(barrelPath)) {
    errors.push(`[NO-BARREL] ${framework}: src/index.ts not found`);
    continue;
  }

  const exportNames = resolvedExportNames(barrelPath);
  for (const [specName, dir] of Object.entries(KEYED_SPECS)) {
    const componentName = componentNameOf(specName);
    if (!exportNames.has(componentName)) {
      errors.push(
        `[NAMED] ${framework}/${dir}: '${componentName}' (${specName}) is not reachable ` +
          `from src/index.ts — a consumer's \`import { ${componentName} } from '@atelier-ui/${framework}'\` would fail.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// [NO-EXPORT]: baseline directory-substring check, unchanged from before —
// covers components with no spec interface (outside [NAMED]'s scope) and
// guards against a directory with no barrel reference at all.
// ---------------------------------------------------------------------------

for (const framework of FRAMEWORKS) {
  const libDir = path.join(ROOT, 'libs', framework, 'src', 'lib');
  const barrelPath = path.join(ROOT, 'libs', framework, 'src', 'index.ts');
  if (!fs.existsSync(barrelPath)) continue; // already reported as [NO-BARREL] above
  // Strip block + line comments so a commented-out export does not count.
  const barrel = fs
    .readFileSync(barrelPath, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
  for (const name of fs.readdirSync(libDir)) {
    const dirPath = path.join(libDir, name);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    if (!isComponentDir(dirPath)) continue;
    if (!barrel.includes(`lib/${name}/`)) {
      errors.push(
        `[NO-EXPORT] ${framework}/${name}: component directory is not referenced at all from src/index.ts`,
      );
    }
  }
}

if (errors.length > 0) {
  errors.sort();
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(
    `\n${errors.length} export issue(s). Add the missing re-export to the framework barrel (src/index.ts).`,
  );
  process.exit(1);
} else {
  console.log(
    `✓ every spec-keyed component is reachable by name, and every component directory is referenced, from each framework barrel (${Object.keys(KEYED_SPECS).length} keyed component(s) checked)`,
  );
}
