'use strict';
/**
 * Reads the documented props of every component out of a built docgen manifest
 * (`dist/storybook/<fw>/manifests/components.json`), whatever shape the
 * framework's docgen gives them. Shared by check-manifests.js (the
 * [NO-DESCRIPTION] finding) and by the docs app's build-time loader
 * (docs/src/data/manifest-props.ts), which renders the prop tables from it.
 *
 * `rowsOf(fw, doc)` returns one normalised row per documented member:
 *   { name, type, default, description, required, kind }
 * with `kind` one of
 *   input   — Angular `input()` / `model()`            (argTypes category `inputs`)
 *   output  — Angular `output()` / `model()` change    (argTypes category `outputs`)
 *   prop    — React prop, Vue prop
 *   event   — Vue emitted event
 *   slot    — Vue slot
 * `type` and `default` are display strings; an absent default is '—'.
 *
 * `allProps(fw, dir, components)` is the narrower view the description gate
 * needs: [{ id, name, description }] for the prop-like kinds only (not Vue
 * events/slots, whose docgen carries no description to enforce, and not Vue's
 * `global` attributes — `class`/`style`/`key`/`ref` are not API).
 */

const fs = require('fs');
const path = require('path');

const NO_DEFAULT = '—';
const PROP_KINDS = new Set(['prop', 'input', 'output']);

const oneLine = (s) =>
  typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : '';

/** `"a" | "b"` (vue-component-meta's quoting) → `'a' | 'b'`. */
const singleQuote = (s) => s.replace(/"([^"'\\]*)"/g, "'$1'");

function reactType(t) {
  if (!t) return '';
  if (t.raw) return t.raw;
  if (t.name === 'literal') return String(t.value);
  return t.name || '';
}

function reactRows(doc) {
  const props = (doc.reactDocgen && doc.reactDocgen.props) || {};
  return Object.entries(props).map(([name, p]) => ({
    name,
    type: reactType(p.tsType),
    default: p.defaultValue ? String(p.defaultValue.value) : NO_DEFAULT,
    description: oneLine(p.description),
    required: Boolean(p.required),
    kind: 'prop',
  }));
}

function vueRows(doc) {
  const meta = doc.vueComponentMeta;
  if (!meta) return null;
  const rows = [];
  for (const p of meta.props || []) {
    if (p.global) continue;
    const required = Boolean(p.required);
    let type = singleQuote(String(p.type || ''));
    if (!required) type = type.replace(/ \| undefined$/, '');
    const d = p.default;
    rows.push({
      name: p.name,
      type,
      default:
        d === undefined || d === 'undefined' || d === ''
          ? NO_DEFAULT
          : singleQuote(String(d)),
      description: oneLine(p.description),
      required,
      kind: 'prop',
    });
  }
  for (const e of meta.events || []) {
    rows.push({
      name: e.name,
      type: String(e.type || ''),
      default: NO_DEFAULT,
      description: oneLine(e.description),
      required: false,
      kind: 'event',
    });
  }
  for (const s of meta.slots || []) {
    rows.push({
      name: s.name,
      type: String(s.type || ''),
      default: NO_DEFAULT,
      description: oneLine(s.description),
      required: false,
      kind: 'slot',
    });
  }
  return rows;
}

function angularType(a) {
  // An alias such as `AtlButtonSize` says nothing to a reader; the enum values
  // the docgen also records do.
  const t = a.type;
  if (t && t.name === 'enum' && Array.isArray(t.value) && t.value.length) {
    const vals = t.value.map((v) =>
      typeof v === 'string' ? `'${v}'` : String(v),
    );
    return vals.join(' | ');
  }
  return singleQuote((a.table.type && a.table.type.summary) || '');
}

function angularDefault(a) {
  const summary =
    a.table && a.table.defaultValue && a.table.defaultValue.summary;
  if (summary === undefined) return NO_DEFAULT;
  if (typeof summary !== 'string') return String(summary);
  // Angular's docgen prints a string default bare (`md`), and an empty string
  // as `""` — the docs show source, so quote it, unless it is a literal like [].
  const declared = angularType(a);
  const looksLikeCode = /^[[{(]/.test(summary);
  return /string|'/.test(declared) && !looksLikeCode ? `'${summary}'` : summary;
}

function angularRows(doc) {
  if (!doc.argTypes) return null;
  const rows = [];
  for (const [name, a] of Object.entries(doc.argTypes)) {
    const cat = a && a.table && a.table.category;
    if (cat !== 'inputs' && cat !== 'outputs') continue;
    rows.push({
      name,
      type: angularType(a),
      default: cat === 'outputs' ? NO_DEFAULT : angularDefault(a),
      description: oneLine(a.description),
      required: Boolean(a.type && a.type.required),
      kind: cat === 'inputs' ? 'input' : 'output',
    });
  }
  return rows;
}

/** Normalised rows of one docgen payload, or null when the entry carries none. */
function rowsOf(fw, doc) {
  if (!doc || typeof doc !== 'object') return null;
  if (fw === 'react') return doc.reactDocgen ? reactRows(doc) : null;
  if (fw === 'vue') return vueRows(doc);
  return angularRows(doc);
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

/**
 * Every component of one framework's built manifest, keyed by story id:
 *   { [id]: { name, rows | null } }   (`rows` is null when docgen found no component)
 * Throws — never returns an empty result — when the manifest is missing,
 * unparsable or has no components, so a caller cannot render an empty table by
 * accident (ADR-0149).
 */
function loadManifest(fw, root) {
  const dir = path.join(root, 'dist/storybook', fw, 'manifests');
  const file = path.join(dir, 'components.json');
  if (!fs.existsSync(file)) {
    throw new Error(
      `${fw} manifest not found at ${file}. Build it with ` +
        '`npx nx run-many -t build-storybook -p angular,react,vue`.',
    );
  }
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`${file} is not valid JSON: ${e.message}`);
  }
  const components = json && json.components;
  if (!components || Object.keys(components).length === 0) {
    throw new Error(`${file} has no components.`);
  }
  const out = {};
  for (const [id, entry] of Object.entries(components)) {
    if (!entry || typeof entry !== 'object') continue;
    out[id] = {
      name: entry.name,
      rows: rowsOf(fw, docgenOf(dir, entry)),
    };
  }
  return out;
}

function allProps(fw, manifestDir, components) {
  const out = [];
  for (const [id, entry] of Object.entries(components)) {
    if (!entry || typeof entry !== 'object') continue;
    const rows = rowsOf(fw, docgenOf(manifestDir, entry)) || [];
    for (const r of rows) {
      if (PROP_KINDS.has(r.kind))
        out.push({ id, name: r.name, description: r.description });
    }
  }
  return out;
}

/**
 * Docs components whose main table is NOT the story component's props, so the
 * manifest cannot serve it. Each keeps its hand-written `props` in
 * docs/src/data/components.ts. TODO(tasks/todo.md, P4a): resolve these.
 *  - toast: the docs describe the service / hook options (variant, duration,
 *    ...), not the inputs of the AtlToast component the story renders; React
 *    and Vue's docgen finds no component at all for that story.
 */
const MANIFEST_GAPS = {
  toast:
    'documents the service / hook options, not the props of the rendered component',
};

/**
 * What one framework's manifest says about every documented component:
 *   { [slug]: { props: Row[] | null, parts: { [partName]: Row[] | null } } }
 *
 * `docs` is componentDocs; `idOf(slug, category, selector)` yields the story id
 * the manifest is keyed by (docs/src/lib/storybook-id.ts). `props` is null only
 * for a MANIFEST_GAPS component; a `parts` entry is null where the part is not
 * a story's `meta.component` in this framework, so the manifest has no entry
 * for it and the caller falls back to the rows components.ts still carries.
 * Throws on a missing manifest, a component with no entry, or one with no props.
 */
function docsApi(fw, root, docs, idOf) {
  const manifest = loadManifest(fw, root);
  const byName = Object.values(manifest).filter((e) => e.rows);
  const out = {};
  for (const [slug, doc] of Object.entries(docs)) {
    const id = idOf(slug, doc.category, doc.selector);
    const entry = manifest[id];
    if (!entry) {
      throw new Error(
        `docs component '${slug}' has no entry '${id}' in the ${fw} manifest. ` +
          'Add a story titled for it, or fix the selector in components.ts.',
      );
    }
    const gap = slug in MANIFEST_GAPS;
    if (!gap && (!entry.rows || entry.rows.length === 0)) {
      throw new Error(
        `the ${fw} manifest entry '${id}' for '${slug}' lists no props ` +
          '(does the story set meta.component?).',
      );
    }
    const parts = {};
    for (const part of doc.composition || []) {
      const found = byName.find((e) => e.name === part.name);
      parts[part.name] = found ? found.rows : null;
    }
    out[slug] = { props: gap ? null : entry.rows, parts };
  }
  return out;
}

/**
 * Load a dependency-free `.ts` module (no imports) as CommonJS. Used for the one
 * pure helper the docs app and these scripts share, docs/src/lib/storybook-id.ts,
 * so its logic has a single source.
 */
function loadTsModule(filePath) {
  const ts = require('typescript');
  const out = ts.transpileModule(fs.readFileSync(filePath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const mod = { exports: {} };
  new Function('module', 'exports', out.outputText)(mod, mod.exports);
  return mod.exports;
}

/** docsApi for scripts: loads the story-id helper from the docs app itself. */
function docsApiFromRepo(fw, root, docs) {
  const { storybookComponentId } = loadTsModule(
    path.join(root, 'docs/src/lib/storybook-id.ts'),
  );
  return docsApi(fw, root, docs, storybookComponentId);
}

module.exports = {
  allProps,
  docsApiFromRepo,
  rowsOf,
  loadManifest,
  docsApi,
  MANIFEST_GAPS,
  NO_DEFAULT,
};
