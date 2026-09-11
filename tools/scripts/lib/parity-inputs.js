'use strict';
/**
 * Shared input-hashing for the design-parity record/gate pair
 * (tools/scripts/parity-record.mjs writes, tools/scripts/check-parity.js reads).
 *
 * A `figma_check_design_parity` result is only valid as long as the thing it
 * was measured against has not changed (ADR-0024 §2). "The thing" is what
 * Storybook actually rendered when the score was taken: the component's
 * implementation, CSS and story — i.e. every file under
 * `libs/{angular,react,vue}/src/lib/<module>/` — **plus** the token sheet every
 * story loads regardless of which component it is (see below). We deliberately
 * hash all three frameworks: parity is a claim about the design, and "one spec,
 * three faithful adapters" means a change in any adapter can break parity with
 * Figma.
 *
 * ADR-0104 corrected this file-selection rule in two directions at once, after
 * finding the code did not match §2's own principle:
 *
 *   - NARROWED: a component directory also holds its `*.spec.ts(x)` /
 *     `*.a11y.spec.ts(x)` test files. Storybook never renders those, so they are
 *     no longer walked — a comment edit in a test file used to produce a false
 *     DRIFT.
 *   - WIDENED: `libs/{fw}/src/styles/tokens.css` — not the create-workspace
 *     *seed* copy, the one each framework's `.storybook/preview.{ts,tsx}`
 *     actually side-effect-imports into every story via Vite — is now part of
 *     the hash. ADR-0035 changed this file's typeface tokens repo-wide and
 *     triggered no DRIFT for any of the 29 components it visibly changed;
 *     ADR-0035's own Consequences section named this as a gap and deferred the
 *     fix here. `check:tokens` (sync-tokens.mjs --check) keeps this file
 *     byte-identical across all three frameworks and against the seed, but the
 *     file that is actually *loaded* — not the seed nothing loads directly — is
 *     the one hashed, so the hash still means what it says even if that gate
 *     were ever red.
 *
 * CommonJS so both the CJS gate (`require`) and the ESM writer (`createRequire`)
 * can share one implementation — the same pattern as lib/ts-eval.js.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parseExportedVars } = require('./ts-eval');
const { FRAMEWORKS } = require('./component-discovery');

// tools/scripts/lib -> repo root
const ROOT = path.resolve(__dirname, '../../..');
const METADATA_INDEX = path.join(ROOT, 'libs/spec/src/metadata/index.ts');

let _registry = null;
function registry() {
  if (!_registry) {
    _registry =
      parseExportedVars(METADATA_INDEX).COMPONENT_METADATA_REGISTRY || {};
  }
  return _registry;
}

/**
 * Map a Figma selector (e.g. `AtlButton`) to its metadata/lib module name
 * (e.g. `button`) via the authoritative COMPONENT_METADATA_REGISTRY. Returns
 * null when the selector has no spec/registry entry (e.g. AtlCodeBlock, AtlToast)
 * — the caller decides how to report an untrackable component.
 */
function moduleForSelector(selector) {
  return registry()[`${selector}Spec`] || null;
}

// Test files live alongside the implementation in a component directory but are
// never rendered by Storybook — `atl-button.spec.ts` and the a11y variant
// `atl-button.a11y.spec.ts` (`.tsx` in React) both match this on their tail.
const TEST_FILE_RE = /\.spec\.tsx?$/i;

/** Recursively collect every file under `dir` (absolute paths), skipping test files. */
function walkFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(abs, out);
    else if (entry.isFile() && !TEST_FILE_RE.test(entry.name)) out.push(abs);
  }
}

/** Sorted repo-relative paths of a module's parity inputs across all frameworks. */
function inputFiles(moduleName) {
  const found = [];
  for (const fw of FRAMEWORKS) {
    const dir = path.join(ROOT, 'libs', fw, 'src', 'lib', moduleName);
    if (fs.existsSync(dir)) {
      walkFiles(dir, found);
      // The shared token sheet this framework's Storybook loads into every
      // story (see the file header) — a rendered input for this component in
      // exactly the sense the impl/css/story are, so it belongs in the hash
      // whenever the component itself is present for this framework.
      const tokens = path.join(ROOT, 'libs', fw, 'src', 'styles', 'tokens.css');
      if (fs.existsSync(tokens)) found.push(tokens);
    }
  }
  return found
    .map((abs) => path.relative(ROOT, abs).split(path.sep).join('/'))
    .sort();
}

/**
 * Compute a stable content hash over a module's parity inputs.
 * Returns `{ hash: 'sha256:...', inputs: [relPath, ...] }`. The hash binds both
 * the path and the bytes of each file, so a rename or a content edit both move it.
 */
function computeInputsHash(moduleName) {
  const inputs = inputFiles(moduleName);
  const h = crypto.createHash('sha256');
  for (const rel of inputs) {
    h.update(rel, 'utf8');
    h.update('\0');
    h.update(fs.readFileSync(path.join(ROOT, rel)));
    h.update('\0');
  }
  return { hash: `sha256:${h.digest('hex')}`, inputs };
}

module.exports = { ROOT, moduleForSelector, inputFiles, computeInputsHash };
