#!/usr/bin/env node
/**
 * gen-props-projection.mjs
 *
 * Writes docs/src/data/props.generated.json: the API rows of every documented
 * component, per framework, read from the three built Storybook docgen
 * manifests (`dist/storybook/<fw>/manifests/components.json`).
 *
 *   one source (each framework's own types + JSDoc, via its manifest)
 *     -> projection (this file, committed)
 *     -> --check (check:props-projection)        — ADR-0009's idiom.
 *
 * Why a committed projection and not a build-time read of the manifests: the
 * docs build, gen-llms-txt.mjs (release workflow, pre-push hook) and
 * check-defaults.js all need the rows, and none of them should need three
 * Storybook builds first. The manifests are read here and only here; every
 * consumer reads the JSON. This generator owns the file's bytes (it is in
 * .prettierignore, ADR-0127).
 *
 * Shape: { [slug]: { [framework]: { props: Row[] | null, parts: { [part]: Row[] | null } } } }
 * with Row = { name, type, default, description, required, kind }. Keys are
 * sorted; rows keep the manifest's declaration order, which is the order the
 * docs tables show and is itself deterministic.
 *
 * Union member order. vue-component-meta prints a string-literal union in the
 * order the TypeScript checker happened to create the literal types, and the
 * prop's default literal can come first (`'right' | 'left' | 'top' | 'bottom'`
 * for a declared `'left' | 'right' | 'top' | 'bottom'`). That order varies
 * between Storybook builds with no source change, so check:props-projection
 * flipped red at random. The manifest's own `schema` list carries the same
 * unstable order, so there is nothing to read it from. Instead a pure
 * string-literal union in a Vue row is rewritten to the order of the same-named
 * prop in the React manifest (react-docgen keeps declaration order), else the
 * Angular one, of the same component, when both member sets are equal; with no
 * such twin the members are sorted alphabetically, which is at least stable.
 * Other types are left alone. This
 * runs inside build(), so generate and --check see the same bytes.
 *
 * Fails loudly (exit 1) on a missing or empty manifest, a documented component
 * with no manifest entry, or an entry with no props. The only declared gap is
 * MANIFEST_GAPS in tools/scripts/lib/manifest-props.js (props: null).
 *
 * Usage:
 *   node tools/scripts/gen-props-projection.mjs           # write the file
 *   node tools/scripts/gen-props-projection.mjs --check   # exit 1 on [DRIFT]
 *   (npm: gen:props-projection builds the Storybooks first; check:props-projection
 *    runs inside check:all after check:storybook-manifests, which builds them.)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { parseExportedVars } = require('./lib/ts-eval.js');
const { docsApiFromRepo } = require('./lib/manifest-props.js');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DOCS_FILE = resolve(ROOT, 'docs/src/data/components.ts');
const OUT = resolve(ROOT, 'docs/src/data/props.generated.json');
const FRAMEWORKS = ['angular', 'react', 'vue'];

const sortKeys = (o) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));

const LITERAL_UNION = /^'[^']*'( \| '[^']*')+$/;
const members = (t) => t.split(' | ');

/** Vue's union order is build-dependent; see the header. `ref` is the React twin. */
function canonicalUnion(type, refs) {
  if (!LITERAL_UNION.test(type)) return type;
  const mine = members(type);
  for (const ref of refs) {
    if (!ref || !LITERAL_UNION.test(ref)) continue;
    const theirs = members(ref);
    if (
      theirs.length === mine.length &&
      mine.every((m) => theirs.includes(m))
    ) {
      return ref;
    }
  }
  return [...mine].sort().join(' | ');
}

/**
 * `refs`: the React and Angular rows of the same component (its props and every
 * part), searched by prop name — a part such as AtlAvatarGroup has no twin part
 * in the other frameworks but shares `size` with the component's own props.
 */
function canonicalVueRows(rows, refs) {
  if (!rows) return rows;
  return rows.map((r) => {
    const twins = refs
      .filter((x) => x.name === r.name && x.kind === 'prop')
      .map((x) => x.type);
    return { ...r, type: canonicalUnion(r.type, twins) };
  });
}

const flatRows = ({ props, parts }) => [
  ...(props || []),
  ...Object.values(parts).flatMap((rows) => rows || []),
];

function build() {
  const docs = parseExportedVars(DOCS_FILE).componentDocs;
  const byFw = {};
  for (const fw of FRAMEWORKS) byFw[fw] = docsApiFromRepo(fw, ROOT, docs);
  const out = {};
  for (const slug of Object.keys(docs).sort()) {
    out[slug] = {};
    for (const fw of FRAMEWORKS) {
      let { props, parts } = byFw[fw][slug];
      if (fw === 'vue') {
        const refs = [
          ...flatRows(byFw.react[slug]),
          ...flatRows(byFw.angular[slug]),
        ];
        props = canonicalVueRows(props, refs);
        parts = Object.fromEntries(
          Object.entries(parts).map(([n, rows]) => [
            n,
            canonicalVueRows(rows, refs),
          ]),
        );
      }
      out[slug][fw] = { props, parts: sortKeys(parts) };
    }
  }
  return out;
}

const render = (projection) => JSON.stringify(projection, null, 2) + '\n';

function drift(actual, expected) {
  const found = [];
  for (const slug of new Set([
    ...Object.keys(actual),
    ...Object.keys(expected),
  ])) {
    for (const fw of FRAMEWORKS) {
      const a = JSON.stringify(actual[slug]?.[fw]);
      const e = JSON.stringify(expected[slug]?.[fw]);
      if (a !== e) found.push(`${slug} / ${fw}`);
    }
  }
  return found;
}

let projection;
try {
  projection = build();
} catch (e) {
  console.error(`gen-props-projection: ${e.message}`);
  process.exit(1);
}
const next = render(projection);

if (process.argv[2] === '--check') {
  let current = '';
  let committed = {};
  try {
    current = readFileSync(OUT, 'utf8');
    committed = JSON.parse(current);
  } catch {
    // missing or unparsable: every component/framework drifts below
  }
  if (current !== next) {
    const found = drift(committed, projection);
    for (const f of found) console.error(`[DRIFT] ${f}`);
    if (found.length === 0) {
      console.error(
        '[DRIFT] props.generated.json differs from a fresh projection in format only',
      );
    }
    console.error(
      `\n${found.length} component/framework pair(s) out of sync with the Storybook manifests.\nRun: npm run gen:props-projection`,
    );
    process.exit(1);
  }
  console.log('props.generated.json is in sync with the manifests');
  process.exit(0);
}

writeFileSync(OUT, next);
console.log(`wrote ${OUT}`);
