'use strict';
/**
 * The join behind R-221: the text an agent reads as a component's description
 * through the Storybook MCP (`docs-list` / `docs-show`, from the built
 * `manifests/components.json`) starts with the OWNED `purpose` of
 * `libs/spec/src/metadata/<name>.metadata.ts`, in all three frameworks.
 *
 * Data source: `docs/public/.well-known/components/<slug>.json`, which
 * `gen-component-knowledge.mjs` projects from the metadata and `check:knowledge`
 * drift-gates. Reading that artefact (instead of parsing the .ts) means this
 * helper inherits the gate: a metadata edit that is not regenerated fails
 * `check:knowledge`, so the hook cannot silently serve a stale purpose.
 *
 * Shared by the React `experimental_manifests` hook, the Angular/Vue docgen
 * worker (`tools/storybook/purpose-docgen-worker.mjs`) and `check-manifests.js`.
 */

const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.resolve(
  __dirname,
  '../../../docs/public/.well-known/components',
);

/** `AtlButtonSpec` / `AtlTableOptions` -> `AtlButton` / `AtlTable`. */
function componentName(specName) {
  return specName.replace(/(Spec|Options)$/, '');
}

function readUnits(dir) {
  return fs
    .readdirSync(dir)
    .sort()
    .filter((file) => file.endsWith('.json') && file !== 'index.json')
    .map((file) => {
      const unit = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (typeof unit.purpose !== 'string' || !Array.isArray(unit.specs)) {
        throw new Error(
          `${file}: no purpose/specs; cannot build the purpose map`,
        );
      }
      return unit;
    });
}

/**
 * The documented component of each metadata file (`AtlButton`, `AtlTabGroup`),
 * as opposed to the sub-component specs it also names (`AtlTab`).
 * @param {string} [dir]
 * @returns {string[]}
 */
function loadPrimaryNames(dir = KNOWLEDGE_DIR) {
  return readUnits(dir).map((unit) => unit.name);
}

/**
 * Component name -> purpose, for every spec named by a metadata file.
 * Components without metadata (AtlToast, AtlCodeBlock) are absent.
 * Plain JSON data, so it can cross a worker boundary as a descriptor option.
 * @param {string} [dir]
 * @returns {Record<string, string>}
 */
function loadPurposes(dir = KNOWLEDGE_DIR) {
  const out = {};
  for (const unit of readUnits(dir)) {
    for (const spec of unit.specs) {
      const name = componentName(spec);
      if (!(name in out)) out[name] = unit.purpose;
    }
  }
  return out;
}

/**
 * `purpose` + blank line + the original description (just `purpose` when there
 * is none). Untouched when the component has no purpose; idempotent.
 * @param {Record<string, string>} purposes
 * @param {string} name
 * @param {string | undefined} description
 * @returns {string | undefined}
 */
function withPurpose(purposes, name, description) {
  const purpose = Object.hasOwn(purposes, name) ? purposes[name] : undefined;
  if (!purpose) return description;
  const original = typeof description === 'string' ? description.trim() : '';
  if (original.startsWith(purpose)) return description;
  return original ? `${purpose}\n\n${original}` : purpose;
}

module.exports = {
  KNOWLEDGE_DIR,
  componentName,
  loadPrimaryNames,
  loadPurposes,
  withPurpose,
};
