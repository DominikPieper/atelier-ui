'use strict';
/**
 * Reads the documented props of every component out of a built docgen manifest
 * (`dist/storybook/<fw>/manifests/components.json`), whatever shape the
 * framework's docgen gives them. Shared by check-manifests.js (the
 * [NO-DESCRIPTION] finding).
 *
 * Returns [{ id, name, description }] for each component prop:
 *   angular — `argTypes` entries whose `table.category` is `inputs` or `outputs`
 *   react   — `reactDocgen.props`
 *   vue     — `vueComponentMeta.props` that are not `global` (the `class`/`style`/
 *             `key`/`ref` attributes Vue adds to every element are not API)
 */

const fs = require('fs');
const path = require('path');

function propsOf(fw, doc) {
  if (!doc || typeof doc !== 'object') return [];
  if (fw === 'react') {
    const props = (doc.reactDocgen && doc.reactDocgen.props) || {};
    return Object.entries(props).map(([name, p]) => ({
      name,
      description: p.description,
    }));
  }
  if (fw === 'vue') {
    const props = (doc.vueComponentMeta && doc.vueComponentMeta.props) || [];
    return props
      .filter((p) => !p.global)
      .map((p) => ({ name: p.name, description: p.description }));
  }
  const argTypes = doc.argTypes || {};
  return Object.entries(argTypes)
    .filter(([, a]) => {
      const cat = a && a.table && a.table.category;
      return cat === 'inputs' || cat === 'outputs';
    })
    .map(([name, a]) => ({ name, description: a.description }));
}

/** The docgen payload of a component entry: inline, or behind a `$ref` shard. */
function docgenOf(manifestDir, entry) {
  const ref = entry.docgen && entry.docgen.$ref;
  if (typeof ref !== 'string') return entry;
  const hash = ref.indexOf('#');
  const file = path.resolve(
    manifestDir,
    hash === -1 ? ref : ref.slice(0, hash),
  );
  if (!fs.existsSync(file)) return null;
  let cur = JSON.parse(fs.readFileSync(file, 'utf8'));
  const pointer = hash === -1 ? '' : ref.slice(hash + 1);
  for (const part of pointer.split('/').filter(Boolean)) {
    if (cur == null || typeof cur !== 'object') return null;
    cur = cur[part.replace(/~1/g, '/').replace(/~0/g, '~')];
  }
  return cur || null;
}

function allProps(fw, manifestDir, components) {
  const out = [];
  for (const [id, entry] of Object.entries(components)) {
    if (!entry || typeof entry !== 'object') continue;
    const doc = docgenOf(manifestDir, entry);
    for (const p of propsOf(fw, doc)) out.push({ id, ...p });
  }
  return out;
}

module.exports = { allProps };
