/**
 * Shared docgen plumbing (ADR-0121 §5 / S6(a)).
 *
 * Extracted out of check-contracts.mjs so check-manifest-parity.mjs can reuse the
 * exact same recipe rather than re-deriving it: the framework-worker docgen call
 * for Angular/Vue (`@storybook/{angular-vite,vue3}/internal/docgen-worker`, a
 * story file as the entry point), `react-docgen`'s own `parse()` for React (the
 * worker's React export is the inactive react-component-meta engine in this
 * repo), and each framework's raw-payload normaliser into the common
 * `{ name, kind: 'enum'|'boolean'|'other', members, default, isOutput }` shape
 * check-contracts.mjs already established. Both scripts importing from one place
 * means they cannot silently diverge on what a framework's docgen payload means
 * — the exact drift class this repo's gates exist to prevent elsewhere.
 *
 * Every function here is parameterized (root, cwdRequire) rather than reading
 * module-level globals, so it works identically whichever script imports it and
 * from whatever cwd that script resolves its own framework packages.
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const FRAMEWORKS = ['angular', 'react', 'vue'];

/** Recursively collect `**\/*.stories.{ts,tsx}` under `dir`, excluding `node_modules`. */
export function collectStoryFilesUnder(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue;
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && /\.stories\.(ts|tsx)$/.test(entry.name))
        out.push(full);
    }
  })(dir);
  return out;
}

/**
 * Story files for `fw`: every `storiesDirs` root walked recursively when given
 * (a scaffold's one roster for its one framework), else the monorepo's
 * `libs/<fw>/src/lib` convention under `root`.
 */
export function findStoryFiles(fw, { root, storiesDirs } = {}) {
  if (storiesDirs) {
    const out = new Set();
    for (const dir of storiesDirs)
      for (const f of collectStoryFilesUnder(dir)) out.add(f);
    return [...out].sort();
  }
  const base = path.join(root, 'libs', fw, 'src', 'lib');
  return collectStoryFilesUnder(base).sort();
}

export function toRepoImportPath(absPath, root) {
  return './' + path.relative(root, absPath).split(path.sep).join('/');
}

/** First of `base`, `base.tsx`, `base.ts`, `base/index.tsx`, `base/index.ts` that exists as a file. */
export function resolveWithExtensions(base) {
  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, 'index.tsx'),
    path.join(base, 'index.ts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

/**
 * Angular/Vue docgen via the Storybook framework worker, story file as the
 * entry point. The worker package itself is resolved from `cwdRequire`'s
 * node_modules (the caller's cwd), not this file's own directory, so a copy
 * dropped into a scaffold picks up the scaffold's own installed Storybook —
 * same portability rule check-contracts.mjs already followed.
 */
export async function makeWorkerDocgen(fw, cwdRequire, root) {
  const spec =
    fw === 'angular'
      ? '@storybook/angular-vite/internal/docgen-worker'
      : '@storybook/vue3/internal/docgen-worker';
  const mod = await import(pathToFileURL(cwdRequire.resolve(spec)).href);
  const middleware =
    fw === 'angular'
      ? mod.createDocgenProvider({ propsTable: 'api' })
      : mod.createDocgenProvider();
  const provider = middleware(async () => undefined);
  return async (storyFilePath, csf) => {
    const entry = {
      type: 'story',
      subtype: 'story',
      id: `${path.basename(storyFilePath)}--docgen`,
      name: 'Docgen',
      title: csf._meta.title,
      importPath: toRepoImportPath(storyFilePath, root),
      tags: [],
    };
    let payload;
    try {
      payload = await provider({ entry });
    } catch {
      return null;
    }
    if (!payload || payload.error) return null;
    return payload;
  };
}

/** Angular worker payload -> `{ props, description, slots }`, `props` in the common shape. */
export function normalizeAngular(payload) {
  const out = [];
  for (const [key, at] of Object.entries(payload.argTypes || {})) {
    const category = at.table && at.table.category;
    if (category !== 'inputs' && category !== 'outputs') continue;
    const isOutput = category === 'outputs';
    let kind = 'other';
    let members;
    const typeName = at.type && at.type.name;
    if (typeName === 'enum' && Array.isArray(at.type.value)) {
      kind = 'enum';
      members = at.type.value;
    } else if (typeName === 'boolean') {
      kind = 'boolean';
    }
    out.push({
      name: key,
      kind,
      members,
      default:
        at.table && at.table.defaultValue
          ? at.table.defaultValue.summary
          : undefined,
      description: at.description,
      required: undefined,
      isOutput,
      typeText: at.table && at.table.type ? at.table.type.summary : undefined,
    });
  }
  return { props: out, description: payload.description, slots: undefined };
}

/** Vue worker payload -> `{ props, description, slots }`, `props` in the common shape (events appended, isOutput: true). */
export function normalizeVue(payload) {
  const out = [];
  const meta = payload.vueComponentMeta;
  for (const p of (meta && meta.props) || []) {
    if (p.global) continue;
    let kind = 'other';
    let members;
    const schema = p.schema;
    if (schema && schema.kind === 'enum' && Array.isArray(schema.schema)) {
      const raw = schema.schema.filter((v) => v !== 'undefined');
      const isBoolSet =
        raw.length > 0 && raw.every((v) => v === 'true' || v === 'false');
      const isStringEnum =
        raw.length > 0 &&
        raw.every(
          (v) => typeof v === 'string' && v.startsWith('"') && v.endsWith('"'),
        );
      if (isBoolSet) kind = 'boolean';
      else if (isStringEnum) {
        kind = 'enum';
        members = raw.map((v) => v.slice(1, -1));
      }
    }
    let defaultValue;
    if (p.default !== undefined) {
      try {
        defaultValue = JSON.parse(p.default);
      } catch {
        defaultValue = p.default;
      }
    }
    out.push({
      name: p.name,
      kind,
      members,
      default: defaultValue,
      description: p.description || undefined,
      required: p.required,
      isOutput: false,
      typeText: p.type,
    });
  }
  for (const e of (meta && meta.events) || []) {
    out.push({
      name: e.name,
      kind: 'other',
      description: e.description || undefined,
      isOutput: true,
      typeText: e.type,
    });
  }
  const slots = ((meta && meta.slots) || []).map((s) => ({
    name: s.name,
    description: s.description || undefined,
  }));
  return { props: out, description: payload.description, slots };
}

/**
 * React docgen tooling bound to one `cwdRequire`. `react-docgen` is required
 * lazily and from the caller's cwd (an Angular/Vue-only scaffold never installs
 * it), mirroring check-contracts.mjs's original lazy `getReactDocgen()`.
 */
export function makeReactDocgenTools(cwdRequire) {
  let _reactDocgen = null;
  function getReactDocgen() {
    if (!_reactDocgen) _reactDocgen = cwdRequire('react-docgen');
    return _reactDocgen;
  }
  function makeReactImporter() {
    const { makeFsImporter } = getReactDocgen();
    return makeFsImporter((filename, basedir) => {
      if (!filename.startsWith('.'))
        throw new Error(`non-relative import '${filename}'`);
      const resolved = resolveWithExtensions(path.resolve(basedir, filename));
      if (!resolved)
        throw new Error(`cannot resolve '${filename}' from '${basedir}'`);
      return resolved;
    });
  }
  function reactParseFile(filePath) {
    const {
      parse: rdParse,
      builtinResolvers,
      defaultHandlers,
    } = getReactDocgen();
    const code = fs.readFileSync(filePath, 'utf-8');
    const resolver = new builtinResolvers.FindExportedDefinitionsResolver();
    const importer = makeReactImporter();
    const results = rdParse(code, {
      resolver,
      handlers: defaultHandlers,
      importer,
      filename: filePath,
    });
    // Stash the raw source (and its path) on each result — normalizeReactDocgen's
    // destructuring fallback below needs both, and this is the one place a
    // component's file is actually read, so they are attached here rather than
    // re-read per component.
    for (const r of results) {
      r.__source = code;
      r.__file = filePath;
    }
    return results;
  }
  return { getReactDocgen, makeReactImporter, reactParseFile };
}

/**
 * Walk up from `startDir` looking for `libs/spec/src/index.ts` — the
 * framework-agnostic contract every `Atl<X>Spec` extends. Bounded (10 levels)
 * and returns `null` rather than throwing when nothing is found, so a
 * standalone scaffold that doesn't carry `libs/spec` at all (see this file's
 * own "parameterized, no module globals" header note) degrades to no
 * candidates instead of an error.
 */
function findSpecIndexFile(startDir) {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, 'libs', 'spec', 'src', 'index.ts');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const _formFieldStringPropsCache = new Map(); // specFile -> string[]

/**
 * The string-typed field names declared on `AtlFormFieldSpec` in
 * `libs/spec/src/index.ts` (found by walking up from `componentFilePath`) —
 * `['name']` today (`value` is `any`, `onValueChange` a callback, `disabled`/
 * `invalid`/`required` boolean). This is the ONLY candidate set the
 * destructuring fallback below considers: it is the exact, narrow class of
 * prop this fallback exists for (a string field inherited two levels deep
 * through `Atl<X>Spec extends Omit<AtlFormFieldSpec, …>`, with no default for
 * react-docgen's own heuristic to latch onto) — never a general "every
 * destructured identifier react-docgen missed" scan, which would just as
 * happily "recover" a native HTML passthrough attribute (`id`, `style`,
 * `onChange`, …) a component destructures for its own unrelated reasons.
 */
function formFieldStringProps(componentFilePath) {
  const specFile = findSpecIndexFile(path.dirname(componentFilePath));
  if (!specFile) return [];
  if (_formFieldStringPropsCache.has(specFile)) return _formFieldStringPropsCache.get(specFile);
  const src = fs.readFileSync(specFile, 'utf-8');
  const ifaceMatch = /interface\s+AtlFormFieldSpec\s*\{([\s\S]*?)\n\}/.exec(src);
  const out = [];
  if (ifaceMatch) {
    const fieldRe = /^\s*(\w+)\??:\s*(.+?);\s*$/gm;
    let fm;
    while ((fm = fieldRe.exec(ifaceMatch[1])) !== null) {
      if (fm[2].trim() === 'string') out.push(fm[1]);
    }
  }
  _formFieldStringPropsCache.set(specFile, out);
  return out;
}

/**
 * Best-effort scan of `componentName`'s OWN function declaration in `source` for
 * a destructured props parameter (`export function Name({ a, b = false, ... }:
 * Props) {`), returning `{ name, default }` for every top-level, non-rest
 * identifier found there. `default` is populated only when the destructuring
 * default is a bare string/boolean/number literal — an array, object or call
 * expression (`errors = []`) is left `undefined` rather than guessed at.
 *
 * Narrow on purpose (see normalizeReactDocgen's fallback below for why this
 * exists at all): it never inspects a TYPE, only the parameter list actually
 * written in the function signature, so it can't invent a prop that isn't
 * really destructured there. A renamed entry (`name: local`) still yields the
 * PROP name (`name`), not the local binding.
 */
function scanDestructuredReactProps(source, componentName) {
  const declRe = new RegExp(`function\\s+${componentName}\\s*\\(`);
  const declMatch = declRe.exec(source);
  if (!declMatch) return [];

  let i = declMatch.index + declMatch[0].length;
  while (i < source.length && /\s/.test(source[i])) i++;
  if (source[i] !== '{') return []; // not a destructured-object parameter

  const start = i + 1;
  let depth = 1;
  let j = start;
  for (; j < source.length && depth > 0; j++) {
    if (source[j] === '{') depth++;
    else if (source[j] === '}') depth--;
  }
  if (depth !== 0) return []; // unbalanced — bail rather than guess
  const body = source.slice(start, j - 1);

  // Split top-level entries on commas, respecting nested {}/[]/() so a default
  // like `errors = []` or a nested destructure doesn't get split mid-token.
  const items = [];
  let cur = '';
  let nestDepth = 0;
  for (const ch of body) {
    if (ch === '{' || ch === '[' || ch === '(') nestDepth++;
    else if (ch === '}' || ch === ']' || ch === ')') nestDepth--;
    if (ch === ',' && nestDepth === 0) {
      items.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) items.push(cur);

  const out = [];
  const itemRe = /^([A-Za-z_$][\w$]*)\s*(?::\s*[A-Za-z_$][\w$]*)?\s*(?:=\s*([\s\S]+))?$/;
  for (const raw of items) {
    const item = raw.trim();
    if (!item || item.startsWith('...')) continue;
    const m = itemRe.exec(item);
    if (!m) continue;
    const name = m[1];
    const defaultExpr = m[2] ? m[2].trim() : undefined;
    let literalDefault;
    if (defaultExpr !== undefined) {
      const quoted = /^(['"])([\s\S]*)\1$/.exec(defaultExpr);
      if (quoted) literalDefault = quoted[2];
      else if (defaultExpr === 'true') literalDefault = true;
      else if (defaultExpr === 'false') literalDefault = false;
      else if (/^-?\d+(\.\d+)?$/.test(defaultExpr)) literalDefault = Number(defaultExpr);
      // anything else (array/object/call expression) — left undefined
    }
    out.push({ name, default: literalDefault });
  }
  return out;
}

/** react-docgen's raw per-component payload -> array of props in the common shape. */
export function normalizeReactDocgen(d) {
  const out = [];
  const known = new Set();
  for (const [propName, info] of Object.entries(d.props || {})) {
    known.add(propName);
    const tsType = info.tsType;
    let kind = 'other';
    let members;
    if (tsType) {
      if (
        tsType.name === 'union' &&
        Array.isArray(tsType.elements) &&
        tsType.elements.every((e) => e.name === 'literal')
      ) {
        const raw = tsType.elements.map((e) =>
          typeof e.value === 'string'
            ? e.value.replace(/^['"]|['"]$/g, '')
            : e.value,
        );
        if (raw.every((v) => v === 'true' || v === 'false')) kind = 'boolean';
        else {
          kind = 'enum';
          members = raw;
        }
      } else if (tsType.name === 'boolean') {
        kind = 'boolean';
      }
    } else if (
      info.defaultValue &&
      (info.defaultValue.value === 'true' ||
        info.defaultValue.value === 'false')
    ) {
      // react-docgen sometimes resolves a prop inherited through a multi-level interface
      // chain (AtlCheckboxSpec extends AtlFormFieldSpec) without a tsType at all — seen
      // on 'disabled'/'required' here, though the sibling 'invalid' (declared one level
      // shallower) resolves fine. A literal true/false default is otherwise only ever a
      // boolean prop in this codebase, so infer the kind from it rather than losing the
      // prop to 'other' and under-reporting a real BOOLEAN drift.
      kind = 'boolean';
    }
    let defaultValue;
    if (info.defaultValue && !info.defaultValue.computed) {
      const raw = info.defaultValue.value;
      if (raw === 'true') defaultValue = true;
      else if (raw === 'false') defaultValue = false;
      else if (typeof raw === 'string')
        defaultValue = raw.replace(/^['"]|['"]$/g, '');
    }
    out.push({
      name: propName,
      kind,
      members,
      default: defaultValue,
      description: info.description || undefined,
      required: !!info.required,
      isOutput: /^on[A-Z]/.test(propName),
      typeText: (tsType && (tsType.raw || tsType.name)) || undefined,
    });
  }
  // Fallback for a prop react-docgen resolves NOTHING for at all: it can only
  // infer a boolean kind (above) from a literal true/false DEFAULT VALUE it
  // already found, which requires it to have returned an entry in the first
  // place — that happens for 'disabled'/'required' here (inherited two levels
  // deep through `AtlCheckboxSpec extends Omit<AtlFormFieldSpec, …>`, same as
  // 'name', but destructured WITH a `= false` default for react-docgen's
  // resolver to latch onto). A same-depth prop with no default at all (`name`,
  // no default) gives react-docgen nothing to find, so it is missing from
  // `d.props` entirely rather than merely untyped. Recovered from the
  // component's own destructured props parameter — same regex-over-the-source
  // idiom check-defaults.js/check-contracts.mjs use — but ONLY for the exact,
  // narrow candidate set formFieldStringProps() names (see its own doc comment
  // for why: this is not a general "every destructured identifier react-docgen
  // missed" scan, which would just as happily manufacture a finding for a
  // native HTML passthrough attribute — `id`, `style`, `onChange`, … — that a
  // component destructures for its own, unrelated reasons and that react-docgen
  // fails to resolve for a completely different reason (a generic DOM type
  // react-docgen's resolver can't traverse at all, not this two-level-Omit
  // shape).
  if (d.__source && d.displayName && d.__file) {
    const candidates = new Set(formFieldStringProps(d.__file));
    if (candidates.size > 0) {
      for (const { name, default: literalDefault } of scanDestructuredReactProps(
        d.__source,
        d.displayName,
      )) {
        if (known.has(name) || !candidates.has(name)) continue;
        out.push({
          name,
          kind: 'other',
          members: undefined,
          default: literalDefault,
          description: undefined,
          required: false,
          isOutput: /^on[A-Z]/.test(name),
          typeText: undefined,
        });
      }
    }
  }
  return out;
}
