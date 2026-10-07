'use strict';
/**
 * Reader for docs/src/data/props.generated.json, the committed projection of
 * the three Storybook docgen manifests (written by gen-props-projection.mjs).
 * gen-llms-txt.mjs and check-defaults.js read the API rows through here, so
 * neither needs a Storybook build. Same fail-loud contract as the manifest
 * loader: a missing/empty file or an unknown slug throws, never an empty table.
 */
const fs = require('fs');
const path = require('path');

const FILE = 'docs/src/data/props.generated.json';

/** `{ [slug]: { [fw]: { props, parts } } }`, or throws. */
function readProjection(root) {
  const file = path.join(root, FILE);
  if (!fs.existsSync(file)) {
    throw new Error(
      `${FILE} not found. Generate it with \`npm run gen:props-projection\`.`,
    );
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!json || Object.keys(json).length === 0) {
    throw new Error(`${FILE} has no components.`);
  }
  return json;
}

/** One framework's `{ [slug]: { props, parts } }`, as the manifest loader's docsApi returned it. */
function projectedApi(fw, root, docs) {
  const projection = readProjection(root);
  const out = {};
  for (const slug of Object.keys(docs)) {
    const api = projection[slug] && projection[slug][fw];
    if (!api) {
      throw new Error(
        `${FILE} has no '${slug}' / ${fw} entry. Run \`npm run gen:props-projection\`.`,
      );
    }
    out[slug] = api;
  }
  return out;
}

module.exports = { readProjection, projectedApi, FILE };
