#!/usr/bin/env node
/**
 * check-defaults.js
 *
 * Validates that the *default value* of each axis prop (variant / size / shape
 * / position) agrees across the three framework adapters and matches the docs.
 * The type contract guarantees the prop exists with the same union; it says
 * nothing about which member is the default — so React could default a Button
 * to 'primary' while Vue defaults to 'secondary', both compile, and the
 * rendered default silently diverges. This is the one drift the shape, CSS,
 * and behaviour gates all miss.
 *
 * Scoped to the axis unions in lib/component-axes.js (predictable string
 * defaults, highest visual-drift risk). Extraction per framework:
 *   Angular  `<prop> = input<…>('value')`
 *   React    `<prop> = 'value'`  (destructured default)
 *   Vue      `withDefaults(…, { <prop>: 'value' })`
 * Docs       the prop's `default` in each framework's slice of the committed props
 *            projection (docs/src/data/props.generated.json).
 *
 * Run via:  node tools/scripts/check-defaults.js  (or  npm run check:defaults)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const {
  UNION_TO_COMPONENT,
  AXIS_PREFIX,
  axisOf,
} = require('./lib/component-axes');
const { DEFAULT_PROP_EXCEPTIONS } = require('./lib/allowlists');
const { parseExportedVars } = require('./lib/ts-eval');
const { projectedApi } = require('./lib/props-projection');

const ROOT = path.resolve(__dirname, '../..');
const DOCS_FILE = path.join(ROOT, 'docs/src/data/components.ts');
const FRAMEWORKS = ['angular', 'react', 'vue'];

function componentSource(framework, component) {
  const dir = path.join(ROOT, 'libs', framework, 'src', 'lib', component);
  let src = '';
  try {
    for (const f of fs.readdirSync(dir)) {
      if (/\.(spec|stories)\./.test(f) || f.endsWith('.css')) continue;
      if (/\.(ts|tsx|vue)$/.test(f))
        src += fs.readFileSync(path.join(dir, f), 'utf-8') + '\n';
    }
  } catch {
    /* dir missing — surfaced elsewhere */
  }
  return src;
}

function angularDefault(src, prop) {
  const m = new RegExp(
    `\\b${prop}\\s*=\\s*input(?:<[^>]*>)?\\(\\s*'([^']*)'`,
  ).exec(src);
  return m ? m[1] : undefined;
}
function reactDefault(src, prop) {
  const m = new RegExp(`\\b${prop}\\s*=\\s*'([^']*)'`).exec(src);
  return m ? m[1] : undefined;
}
function vueDefault(src, prop) {
  // A component dir holds multiple .vue files (e.g. avatar + avatar-group),
  // each with its own withDefaults — scan them all for the prop, not just the
  // first block.
  const blockRe = /withDefaults\([\s\S]*?,\s*(\{[^}]*\})\s*\)/g;
  let block;
  while ((block = blockRe.exec(src)) !== null) {
    const m = new RegExp(`\\b${prop}\\s*:\\s*'([^']*)'`).exec(block[1]);
    if (m) return m[1];
  }
  return undefined;
}

/**
 * framework -> docsKey -> { prop -> default (quotes stripped) }, read from the
 * committed props projection (docs/src/data/props.generated.json), which is
 * where the docs tables get their defaults (ADR-0121). Throws when it is
 * missing, so this gate cannot pass vacuously. Reading the projection rather
 * than the manifests needs no Storybook build; check:props-projection pins the
 * projection to the manifests, so the comparison is still against them.
 */
function parseDocsDefaults() {
  const componentDocs = parseExportedVars(DOCS_FILE).componentDocs;
  const result = {};
  for (const fw of FRAMEWORKS) {
    const api = projectedApi(fw, ROOT, componentDocs);
    result[fw] = {};
    for (const [key, { props }] of Object.entries(api)) {
      if (!props) continue; // a declared MANIFEST_GAPS component
      result[fw][key] = {};
      for (const row of props) {
        if (row.default !== '—')
          result[fw][key][row.name] = row.default.replace(/^'|'$/g, '');
      }
    }
  }
  return result;
}

const docs = parseDocsDefaults();
const errors = [];
let checked = 0;

for (const [union, component] of Object.entries(UNION_TO_COMPONENT)) {
  const axis = axisOf(union);
  const prop = AXIS_PREFIX[axis];
  if (DEFAULT_PROP_EXCEPTIONS.has(`${component}:${prop}`)) continue;

  const found = {};
  for (const fw of FRAMEWORKS) {
    const src = componentSource(fw, component);
    const val =
      fw === 'angular'
        ? angularDefault(src, prop)
        : fw === 'react'
          ? reactDefault(src, prop)
          : vueDefault(src, prop);
    if (val !== undefined) found[fw] = val;
  }

  const present = Object.entries(found);
  if (present.length === 0) continue; // no extractable default anywhere — skip
  checked++;

  // Cross-framework agreement.
  const values = [...new Set(present.map(([, v]) => v))];
  if (values.length > 1) {
    errors.push(
      `[DEFAULT-DRIFT] ${component}.${prop}: adapters disagree — ` +
        present.map(([fw, v]) => `${fw}='${v}'`).join(', '),
    );
    continue;
  }
  // Found in fewer than all three (possible missing default or parse gap).
  if (present.length < FRAMEWORKS.length) {
    errors.push(
      `[DEFAULT-MISSING] ${component}.${prop}: default '${values[0]}' found only in ${present
        .map(([fw]) => fw)
        .join('+')} — confirm the others set the same default`,
    );
    continue;
  }
  // Docs cross-check.
  for (const fw of FRAMEWORKS) {
    const docsVal = docs[fw][component] && docs[fw][component][prop];
    if (docsVal !== undefined && docsVal !== values[0]) {
      errors.push(
        `[DOCS-DEFAULT-DRIFT] ${component}.${prop}: adapters default '${values[0]}' but the ${fw} projection says '${docsVal}'`,
      );
    }
  }
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(
    `\n${errors.length} default drift issue(s). Align the default across adapters + docs, or allowlist a documented divergence.`,
  );
  process.exit(1);
} else {
  console.log(
    `✓ axis-prop defaults agree across adapters + docs (${checked} props)`,
  );
}
