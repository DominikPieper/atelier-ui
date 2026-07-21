'use strict';
/**
 * Shared input-hashing for the design-parity record/gate pair
 * (tools/scripts/parity-record.mjs writes, tools/scripts/check-parity.js reads).
 *
 * A `figma_check_design_parity` result is only valid as long as the thing it
 * was measured against has not changed. "The thing" is the rendered component:
 * its implementation, CSS, story, and the component-local spec — i.e. every file
 * under `libs/{angular,react,vue}/src/lib/<module>/`. We hash that file set so a
 * later edit to any of them invalidates the recorded parity (the gate then asks
 * for a re-verify). We deliberately hash all three frameworks: parity is a claim
 * about the design, and "one spec, three faithful adapters" means a change in any
 * adapter can break parity with Figma.
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
    _registry = parseExportedVars(METADATA_INDEX).COMPONENT_METADATA_REGISTRY || {};
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

/** Recursively collect every file under `dir` (absolute paths). */
function walkFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(abs, out);
    else if (entry.isFile()) out.push(abs);
  }
}

/** Sorted repo-relative paths of a module's parity inputs across all frameworks. */
function inputFiles(moduleName) {
  const found = [];
  for (const fw of FRAMEWORKS) {
    const dir = path.join(ROOT, 'libs', fw, 'src', 'lib', moduleName);
    if (fs.existsSync(dir)) walkFiles(dir, found);
  }
  return found.map((abs) => path.relative(ROOT, abs).split(path.sep).join('/')).sort();
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
