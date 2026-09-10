#!/usr/bin/env node
/**
 * check-contracts.mjs — ADR-0121 Decision 4, stage 1 of "the stories are the spec".
 *
 * Offline, no Storybook build, no browser: joins three DERIVED inputs with the
 * hand-written micro-contracts (`libs/spec/src/contracts/*.contract.ts`) and reports
 * drift. One process per framework, driven by the recipe proven in
 * `tasks/docgen-spike-2026-09-10.md`:
 *
 *   1. Docgen per component — Angular/Vue via the Storybook framework worker
 *      (`@storybook/{angular-vite,vue3}/internal/docgen-worker`, story file as the
 *      entry point); React via `react-docgen`'s own `parse()` directly (the worker's
 *      React export is the react-component-meta engine, inactive in this repo).
 *   2. Story `args` per story via `storybook/internal/csf-tools`
 *      (`loadCsf(...).parse()` + `createStoryArgsResolver`).
 *   3. The Figma snapshot, `tools/figma/snapshot.json`.
 *   4. The contracts, read statically with `tools/scripts/lib/ts-eval.js`.
 *
 * Rules, tags, and the CLI surface are documented in `libs/spec/src/contracts/README.md`
 * and this file's own comments above each check. Run via `npm run check:contracts`.
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { loadCsf, createStoryArgsResolver } from 'storybook/internal/csf-tools';

const require = createRequire(import.meta.url);
const { parseExportedVars } = require('./lib/ts-eval.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const FRAMEWORKS = ['angular', 'react', 'vue'];

// Interaction values on a `state` axis (ADR-0114): CSS pseudo-classes, not code-modelled
// state. Every OTHER value on a `state` axis (completed, optional, error, filled, open,
// invalid, checked, filtered, selected, ...) is data-flavoured and must be covered by an
// `axisMap` entry or a `figmaOnly` entry named `state=<value>`.
const INTERACTION_STATE_VALUES = new Set(['default', 'hover', 'focus', 'focus-visible', 'active', 'pressed']);

const UNRESOLVABLE = Symbol('unresolvable');

const TAG_LEVEL = {
  'CONTRACT-MISSING': 'error',
  'CONTRACT-ORPHAN': 'warning',
  'CONTRACT-NODE': 'error',
  AXIS: 'error',
  BOOLEAN: 'error',
  'FIGMA-ONLY': 'warning',
  'STALE-EXEMPTION': 'error',
  'FW-ONLY': 'warning',
  'ENUM-UNDRAWN': 'error',
  'NO-MASTER': 'warning',
  COVERAGE: 'error',
  'COVERAGE-BOOL': 'warning',
  'DOCGEN-EMPTY': 'error',
  'UNRESOLVED-ARGS': 'warning',
  UNMIRRORED: 'warning',
  'NO-STORY-META': 'warning',
};

// ─── CLI args ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { fw: null, snapshot: null, report: false, emit: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fw') out.fw = argv[++i];
    else if (a === '--snapshot') out.snapshot = argv[++i];
    else if (a === '--report') out.report = true;
    else if (a === '--emit') out.emit = argv[++i];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const targetFrameworks = args.fw ? [args.fw] : FRAMEWORKS;
for (const fw of targetFrameworks) {
  if (!FRAMEWORKS.includes(fw)) {
    console.error(`Unknown --fw '${fw}' — expected one of ${FRAMEWORKS.join(', ')}`);
    process.exit(2);
  }
}

// ─── Findings ───────────────────────────────────────────────────────────────

const findings = [];
function report(tag, fw, msg) {
  const level = TAG_LEVEL[tag];
  if (!level) throw new Error(`unknown tag '${tag}'`);
  findings.push({ tag, level, fw, msg });
}

// ─── codeOnly cross-framework staleness tracking (R1d) ─────────────────────
// `codeOnly` staleness can only be judged once every requested framework has run:
// a prop absent from one framework's manifest but present in another is
// [FW-ONLY] (ADR-0093 territory), not a stale exemption. Populated per-framework
// inside processComponent, evaluated once in runCodeOnlyStalenessChecks() after
// the whole `targetFrameworks` loop completes.
const reachedByFw = new Map(); // selector -> Set<fw> the component's docgen was reached in
const codeOnlyPresentByFw = new Map(); // selector -> Map<entryName, Set<fw>> where the prop exists

// ─── Snapshot ───────────────────────────────────────────────────────────────

const snapshotPath = args.snapshot ? path.resolve(args.snapshot) : path.join(ROOT, 'tools/figma/snapshot.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
const snapshotBySelector = new Map(snapshot.components.map((c) => [c.selector, c]));

function stripId(name) {
  const i = name.indexOf('#');
  return i === -1 ? name : name.slice(0, i);
}

// ─── Contracts ──────────────────────────────────────────────────────────────

const CONTRACTS_DIR = path.join(ROOT, 'libs/spec/src/contracts');
const contractFiles = fs
  .readdirSync(CONTRACTS_DIR)
  .filter((f) => f.endsWith('.contract.ts'))
  .sort();

/** selector -> contract object (plain literal, per ts-eval's static read) */
const contractsBySelector = new Map();
for (const file of contractFiles) {
  const full = path.join(CONTRACTS_DIR, file);
  const vars = parseExportedVars(full);
  const contract = vars.contract;
  if (!contract || typeof contract !== 'object') {
    console.error(`${file}: 'contract' did not evaluate to a static object literal — skipped.`);
    continue;
  }
  contractsBySelector.set(contract.component, { ...contract, __file: file });
}

// ─── Global (framework-independent) checks ─────────────────────────────────
// CONTRACT-ORPHAN, CONTRACT-NODE, FIGMA-ONLY (UNEXPLAINED), the "no longer on the
// master" half of STALE-EXEMPTION, and UNMIRRORED only need the contract and the
// snapshot — run once, not once per framework.

function isNameOnMaster(master, name) {
  if (!master) return false;
  if (Object.prototype.hasOwnProperty.call(master.variantAxes || {}, name)) return true;
  for (const key of Object.keys(master.properties || {})) {
    if (stripId(key) === name) return true;
  }
  return false;
}

function isStateValueOnMaster(master, value) {
  return !!(master && (master.variantAxes || {}).state || []).includes(value);
}

function runGlobalChecks() {
  for (const [selector, contract] of contractsBySelector) {
    const master = snapshotBySelector.get(selector);

    if (!master) {
      report('CONTRACT-ORPHAN', null, `${selector} (${contract.__file}): selector is in no snapshot master`);
      continue; // nothing else below is checkable without a master
    }

    if (contract.figmaNodeId !== master.nodeId) {
      report(
        'CONTRACT-NODE',
        null,
        `${selector}: contract.figmaNodeId '${contract.figmaNodeId}' ≠ snapshot nodeId '${master.nodeId}'`
      );
    }

    for (const entry of contract.figmaOnly || []) {
      if (/UNEXPLAINED/.test(entry.reason)) {
        report('FIGMA-ONLY', null, `${selector}: figmaOnly '${entry.name}' reason is UNEXPLAINED`);
      }
      const m = /^state=(.+)$/.exec(entry.name);
      if (m) {
        if (!isStateValueOnMaster(master, m[1])) {
          report(
            'STALE-EXEMPTION',
            null,
            `${selector}: figmaOnly '${entry.name}' — 'state' axis no longer has value '${m[1]}'`
          );
        }
        if (!(master.description || '').includes(m[1])) {
          report('UNMIRRORED', null, `${selector}: figmaOnly '${entry.name}' — '${m[1]}' not mentioned in the master description`);
        }
      } else {
        if (!isNameOnMaster(master, entry.name)) {
          report('STALE-EXEMPTION', null, `${selector}: figmaOnly '${entry.name}' names a property no longer on the master`);
        }
        if (!(master.description || '').includes(entry.name)) {
          report('UNMIRRORED', null, `${selector}: figmaOnly '${entry.name}' not mentioned in the master description`);
        }
      }
    }

    for (const entry of contract.codeOnly || []) {
      if (/UNEXPLAINED/.test(entry.reason)) {
        report('FIGMA-ONLY', null, `${selector}: codeOnly '${entry.name}' reason is UNEXPLAINED`);
      }
      if (!(master.description || '').includes(entry.name)) {
        report('UNMIRRORED', null, `${selector}: codeOnly '${entry.name}' not mentioned in the master description`);
      }
    }

    for (const entry of contract.axisMap || []) {
      if (!(master.description || '').includes(entry.figmaAxis)) {
        report('UNMIRRORED', null, `${selector}: axisMap figmaAxis '${entry.figmaAxis}' not mentioned in the master description`);
      }
    }
  }

  // CONTRACT-MISSING needs a docgen payload (framework-dependent), so it is emitted
  // per framework below, not here.
}

// ─── Per-framework docgen ───────────────────────────────────────────────────

function findStoryFiles(fw) {
  const base = path.join(ROOT, 'libs', fw, 'src', 'lib');
  const out = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && /\.stories\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
  })(base);
  return out.sort();
}

function toRepoImportPath(absPath) {
  return './' + path.relative(ROOT, absPath).split(path.sep).join('/');
}

// --- Angular / Vue: the Storybook framework worker, story file as entry point ---

async function makeWorkerDocgen(fw) {
  const spec = fw === 'angular' ? '@storybook/angular-vite/internal/docgen-worker' : '@storybook/vue3/internal/docgen-worker';
  const mod = await import(spec);
  const middleware = fw === 'angular' ? mod.createDocgenProvider({ propsTable: 'api' }) : mod.createDocgenProvider();
  const provider = middleware(async () => undefined);
  return async (storyFilePath, csf) => {
    const entry = {
      type: 'story',
      subtype: 'story',
      id: `${path.basename(storyFilePath)}--docgen`,
      name: 'Docgen',
      title: csf._meta.title,
      importPath: toRepoImportPath(storyFilePath),
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

function normalizeAngular(payload) {
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
      default: at.table && at.table.defaultValue ? at.table.defaultValue.summary : undefined,
      description: at.description,
      required: undefined,
      isOutput,
      typeText: at.table && at.table.type ? at.table.type.summary : undefined,
    });
  }
  return { props: out, description: payload.description, slots: undefined };
}

function normalizeVue(payload) {
  const out = [];
  const meta = payload.vueComponentMeta;
  for (const p of (meta && meta.props) || []) {
    if (p.global) continue;
    let kind = 'other';
    let members;
    const schema = p.schema;
    if (schema && schema.kind === 'enum' && Array.isArray(schema.schema)) {
      const raw = schema.schema.filter((v) => v !== 'undefined');
      const isBoolSet = raw.length > 0 && raw.every((v) => v === 'true' || v === 'false');
      const isStringEnum = raw.length > 0 && raw.every((v) => typeof v === 'string' && v.startsWith('"') && v.endsWith('"'));
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
    out.push({ name: e.name, kind: 'other', description: e.description || undefined, isOutput: true, typeText: e.type });
  }
  const slots = ((meta && meta.slots) || []).map((s) => ({ name: s.name, description: s.description || undefined }));
  return { props: out, description: payload.description, slots };
}

// --- React: react-docgen's own parse(), mirroring @storybook/react's non-worker path ---

const {
  parse: rdParse,
  builtinResolvers,
  defaultHandlers,
  makeFsImporter,
} = require('react-docgen');

function resolveWithExtensions(base) {
  const candidates = [base, `${base}.tsx`, `${base}.ts`, path.join(base, 'index.tsx'), path.join(base, 'index.ts')];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function makeReactImporter() {
  return makeFsImporter((filename, basedir) => {
    if (!filename.startsWith('.')) throw new Error(`non-relative import '${filename}'`);
    const resolved = resolveWithExtensions(path.resolve(basedir, filename));
    if (!resolved) throw new Error(`cannot resolve '${filename}' from '${basedir}'`);
    return resolved;
  });
}

function reactParseFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const resolver = new builtinResolvers.FindExportedDefinitionsResolver();
  const importer = makeReactImporter();
  return rdParse(code, { resolver, handlers: defaultHandlers, importer, filename: filePath });
}

function normalizeReactDocgen(d) {
  const out = [];
  for (const [propName, info] of Object.entries(d.props || {})) {
    const tsType = info.tsType;
    let kind = 'other';
    let members;
    if (tsType) {
      if (tsType.name === 'union' && Array.isArray(tsType.elements) && tsType.elements.every((e) => e.name === 'literal')) {
        const raw = tsType.elements.map((e) => (typeof e.value === 'string' ? e.value.replace(/^['"]|['"]$/g, '') : e.value));
        if (raw.every((v) => v === 'true' || v === 'false')) kind = 'boolean';
        else {
          kind = 'enum';
          members = raw;
        }
      } else if (tsType.name === 'boolean') {
        kind = 'boolean';
      }
    } else if (info.defaultValue && (info.defaultValue.value === 'true' || info.defaultValue.value === 'false')) {
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
      else if (typeof raw === 'string') defaultValue = raw.replace(/^['"]|['"]$/g, '');
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
  return out;
}

// ─── Dotted child-prop resolution (R2) ──────────────────────────────────────
// `axisMap[].codeProp` may be `Child.prop`: the prop lives on a CHILD component's own
// manifest, not the story's primary component. React finds it for free — one
// `react-docgen` parse already returns every exported component in the file, so every
// sibling is registered. Angular/Vue's worker only ever returns the ONE component
// `meta.component` names, so the child's props are recovered with a lightweight
// source-level scan (the same "read the component source with a regex" idiom
// check-defaults.js already uses for cross-framework default extraction) rather than a
// second full docgen pass, which the worker's story-file-only entry point does not
// support for an arbitrary export.

const siblingRegistry = { angular: new Map(), react: new Map(), vue: new Map() };

function registerSibling(fw, name, props) {
  if (!name || siblingRegistry[fw].has(name)) return;
  siblingRegistry[fw].set(name, props);
}

function walkSourceFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  (function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && /\.(ts|tsx|vue)$/.test(entry.name) && !/\.(spec|stories)\./.test(entry.name)) {
        out.push(full);
      }
    }
  })(dir);
  return out;
}

/** Classify a TypeScript type-text fragment (a generic argument, an interface field's
 * type, ...) into the same { kind, members } shape the docgen normalizers produce, for
 * the regex fallback below. Recognises `boolean` and a closed string-literal union
 * (`'a' | 'b' | 'c'`); anything else is 'other'. */
function classifyTypeText(typeText, literalArg) {
  const t = (typeText || '').trim();
  if (/\bboolean\b/.test(t) || literalArg === 'true' || literalArg === 'false') return { kind: 'boolean' };
  const segments = t.split('|').map((s) => s.trim()).filter((s) => s && s !== 'undefined' && s !== 'null');
  const literals = segments.filter((s) => /^['"].*['"]$/.test(s));
  if (segments.length > 0 && literals.length === segments.length) {
    return { kind: 'enum', members: literals.map((s) => s.slice(1, -1)) };
  }
  return { kind: 'other' };
}

/** Best-effort existence + kind ('boolean' | 'enum' | 'other') of `propName` on Angular
 * class / Vue SFC / React function `childName`, by regex over its source — used only
 * when the sibling registry (React's free case for a JSX-shaped component) has nothing
 * for `childName`. Not a full docgen: good enough to validate an axisMap's declared
 * mapping, not to run AXIS/COVERAGE against the child itself (deferred to stage 2, see
 * [NO-STORY-META]). */
function regexResolveChildProp(fw, childName, propName, contextDir) {
  const searchDirs = [contextDir, path.join(ROOT, 'libs', fw, 'src/lib')];
  for (const dir of searchDirs) {
    for (const file of walkSourceFiles(dir)) {
      const src = fs.readFileSync(file, 'utf-8');
      if (fw === 'angular') {
        const classRe = new RegExp(`class\\s+${childName}\\b[\\s\\S]*?(?=\\n@Component|\\nexport class\\s|$)`);
        const m = classRe.exec(src);
        if (!m) continue;
        const scoped = m[0];
        const propRe = new RegExp(`\\b${propName}\\s*=\\s*input(?:\\.required)?(?:<([^>]*)>)?\\(([^)]*)\\)`);
        const pm = propRe.exec(scoped);
        if (!pm) return { exists: false };
        const generic = pm[1] || '';
        const arg = (pm[2] || '').trim();
        return { exists: true, ...classifyTypeText(generic, arg) };
      } else if (fw === 'vue') {
        if (!new RegExp(`defineOptions\\(\\s*\\{\\s*name:\\s*['"]${childName}['"]`).test(src)) continue;
        const propRe = new RegExp(`\\b${propName}\\??:\\s*([\\w'"| ]+)[;,\\n]`);
        const pm = propRe.exec(src);
        if (!pm) return { exists: false };
        return { exists: true, ...classifyTypeText(pm[1]) };
      } else if (fw === 'react') {
        // react-docgen's FindExportedDefinitionsResolver only recognises functions whose
        // body looks like a component (JSX, forwardRef, class); a pass-through function
        // (e.g. `function AtlStep({ children }) { return children; }`) is invisible to
        // it, so the sibling registry above can be empty even though the export is real.
        // Fall back to the same interface-literal regex idiom as Angular/Vue.
        if (!new RegExp(`(?:function\\s+${childName}\\s*\\(|const\\s+${childName}\\s*=)`).test(src)) continue;
        const ifaceRe = new RegExp(`(?:interface|type)\\s+${childName}Props\\b[^{]*\\{([\\s\\S]*?)\\n\\}`);
        const m = ifaceRe.exec(src);
        if (!m) return { exists: false };
        const propRe = new RegExp(`\\b${propName}\\??:\\s*([^;\\n]+)[;\\n]`);
        const pm = propRe.exec(m[1]);
        if (!pm) return { exists: false };
        return { exists: true, ...classifyTypeText(pm[1]) };
      }
    }
  }
  return { exists: false, notFound: true };
}

function resolveCodeProp(fw, codeProp, propByName, contextDir) {
  const dot = codeProp.indexOf('.');
  if (dot === -1) {
    const p = propByName.get(codeProp);
    if (!p) return { exists: false };
    return { exists: true, kind: p.kind, members: p.members };
  }
  const childName = codeProp.slice(0, dot);
  const propName = codeProp.slice(dot + 1);
  const sibling = siblingRegistry[fw].get(childName);
  if (sibling) {
    const p = sibling.find((pp) => pp.name === propName && !pp.isOutput);
    if (!p) return { exists: false };
    return { exists: true, kind: p.kind, members: p.members };
  }
  return regexResolveChildProp(fw, childName, propName, contextDir);
}

function isMemberOfType(value, resolved) {
  if (resolved.kind === 'boolean') return value === true || value === false;
  if (resolved.kind === 'enum') return value === null ? true : (resolved.members || []).includes(value);
  return true; // 'other' kind: cannot verify statically, don't block on it
}

// ─── Story args (csf-tools) ─────────────────────────────────────────────────

function getStoryOwnObjectNode(csf, key) {
  const stmt = csf._storyStatements && csf._storyStatements[key];
  if (!stmt) return null;
  const varDecl = stmt.declaration || stmt;
  const decl = varDecl && varDecl.declarations && varDecl.declarations[0];
  let init = decl && decl.init;
  while (init && (init.type === 'TSAsExpression' || init.type === 'TSSatisfiesExpression' || init.type === 'TSTypeAssertion')) {
    init = init.expression;
  }
  return init && init.type === 'ObjectExpression' ? init : null;
}

function getOwnStoryKeys(csf, key) {
  const init = getStoryOwnObjectNode(csf, key);
  if (!init) return [];
  return init.properties.map((p) => (p.key && (p.key.name || p.key.value)) || null).filter(Boolean);
}

/** The property names the story's OWN `args: {...}` object literal declares, or `null`
 * when the story has no own `args` object at all (R1b: "omits the prop entirely" means
 * either shape). Used only to decide whether a manifest DEFAULT value counts as covered —
 * never to resolve an actual value, which stays the resolver's job. */
function getOwnArgKeys(csf, key) {
  const init = getStoryOwnObjectNode(csf, key);
  if (!init) return null;
  const argsProp = init.properties.find(
    (p) => !p.computed && p.key && (p.key.name === 'args' || p.key.value === 'args')
  );
  if (!argsProp || !argsProp.value || argsProp.value.type !== 'ObjectExpression') return null;
  return argsProp.value.properties.map((p) => (p.key && (p.key.name || p.key.value)) || null).filter(Boolean);
}

// ─── Render-source literal scanning (R1a) ───────────────────────────────────
// A story that sets a variant inside a `render` function / Angular `template:`
// string / Vue template — rather than in `args` — is invisible to the args-based
// evidence above. Scan the story's own source text (plus the meta's `render`, when
// the story has none of its own) for literal prop assignments in the three idioms:
//   JSX      prop="value"   prop={'value'}
//   Angular  prop="value"   [prop]="'value'"
//   Vue      prop="value"   :prop="'value'"
// plus one more idiom explicitly carved out: a `const array = ['a','b'].map(x => ...)`
// that forwards the loop variable straight into the same prop — credit every literal
// in the array, without trying to evaluate the loop. Evidence only ever ADDS coverage;
// it never removes what the args-based resolver already found.

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addCovered(map, name, value) {
  if (!map.has(name)) map.set(name, new Set());
  map.get(name).add(value);
}

/** The meta-level `render` property's source text (`''` when the meta has none) — the
 * fallback evidence blob for a story that declares no `render` of its own. Shared by
 * `buildSourceCoverage` and `collectStoryClaims` so both scan the identical range. */
function getMetaRenderText(csf, source) {
  const metaNode = csf._metaNode;
  const metaRenderProp =
    metaNode && Array.isArray(metaNode.properties)
      ? metaNode.properties.find((p) => !p.computed && p.key && (p.key.name === 'render' || p.key.value === 'render'))
      : null;
  return metaRenderProp ? source.slice(metaRenderProp.start, metaRenderProp.end) : '';
}

/** One story's evidence blob: its own node range (from csf-tools), plus the meta's
 * `render` text when the story declares no `render` of its own. This is the scope R1a's
 * literal/object scans and the R1a forwarding check all share. */
function getStoryEvidenceBlob(csf, source, key, metaRenderText) {
  const stmt = csf._storyStatements && csf._storyStatements[key];
  if (!stmt) return '';
  let blob = source.slice(stmt.start, stmt.end);
  if (!getOwnStoryKeys(csf, key).includes('render') && metaRenderText) blob += `\n${metaRenderText}`;
  return blob;
}

/** Whether a render/template's source text forwards the resolved `args` object to the
 * component, rather than being a hardcoded demo that ignores them (R1a). Recognises:
 * React `{...args}`; Vue `v-bind="args"` / `props: args` / `...args` in a setup/render;
 * Angular `argsToTemplate(args)` / the `props: args` + `[prop]="prop"` binding idiom;
 * plus, as a catch-all, the identifier `args` appearing anywhere in the render body at
 * all — which is what actually fires for most of this codebase's
 * `render: (args) => ({ props: args, ... })` stories. Also checks a RENAMED render
 * parameter (`render: (props) => ...`) spread the same way, since "the render signature
 * names them" is an explicit case in the spec, not just literal `args`. */
function isForwardingRender(text) {
  if (!text) return false;
  if (/\bargs\b/.test(text)) return true;
  const paramMatch = /\brender\s*:\s*\(\s*([A-Za-z_$][\w$]*)/.exec(text);
  const param = paramMatch && paramMatch[1];
  if (param && param !== 'args') {
    const p = escapeRegExp(param);
    if (new RegExp(`\\{\\s*\\.\\.\\.\\s*${p}\\s*\\}`).test(text)) return true; // React spread
    if (new RegExp(`v-bind\\s*=\\s*"${p}"`).test(text)) return true; // Vue v-bind
    if (new RegExp(`\\bprops\\s*:\\s*${p}\\b`).test(text)) return true; // Angular/Vue props: X
    if (new RegExp(`\\.\\.\\.\\s*${p}\\b`).test(text)) return true; // Vue setup spread
  }
  return false;
}

/** `prop="value"` (shared literal-attribute idiom) plus each framework's own
 * bound-literal idiom, scanned generically (prop name is a capture group, not a
 * parameter) so one pass credits every prop a text blob demonstrates. */
function scanLiteralAttrs(text, fw, into) {
  const plainRe = /\b([A-Za-z_$][\w-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = plainRe.exec(text))) addCovered(into, m[1], m[2]);

  if (fw === 'react') {
    const braceRe = /\b([A-Za-z_$][\w-]*)\s*=\s*\{\s*['"]([^'"]*)['"]\s*\}/g;
    while ((m = braceRe.exec(text))) addCovered(into, m[1], m[2]);
  } else if (fw === 'angular') {
    const boundRe = /\[([A-Za-z_$][\w-]*)\]\s*=\s*"'([^']*)'"/g;
    while ((m = boundRe.exec(text))) addCovered(into, m[1], m[2]);
  } else if (fw === 'vue') {
    const boundRe = /:([A-Za-z_$][\w-]*)\s*=\s*"'([^']*)'"/g;
    while ((m = boundRe.exec(text))) addCovered(into, m[1], m[2]);
  }
}

/** `(['a', 'b'] as const).map(x => <Foo prop={x} />)` — same "read the source with a
 * regex" idiom `check-defaults.js` uses for cross-framework default extraction. Does
 * not evaluate the loop; only credits the array's literal members when the loop
 * variable is then forwarded verbatim into some prop in the same text. */
function scanArrayMapCredit(text, fw, into) {
  const arrayMapRe = /\[\s*((?:['"][\w-]+['"]\s*,?\s*)+)\]\s*(?:as const)?\s*\)?\s*\.map\(\s*(\w+)\s*=>/g;
  let m;
  while ((m = arrayMapRe.exec(text))) {
    const items = [...m[1].matchAll(/['"]([\w-]+)['"]/g)].map((x) => x[1]);
    const varName = escapeRegExp(m[2]);
    // Every attribute forwarding the loop variable verbatim is a candidate — not just
    // the first one in source order (a JSX `key={size}` list-key attribute routinely
    // precedes the real `size={size}` prop and would otherwise swallow the match).
    let usedRe;
    if (fw === 'react') usedRe = new RegExp(`\\b([A-Za-z_$][\\w-]*)\\s*=\\s*\\{\\s*${varName}\\s*\\}`, 'g');
    else if (fw === 'angular') usedRe = new RegExp(`\\[([A-Za-z_$][\\w-]*)\\]\\s*=\\s*"${varName}"`, 'g');
    else if (fw === 'vue') usedRe = new RegExp(`:([A-Za-z_$][\\w-]*)\\s*=\\s*"${varName}"`, 'g');
    else continue;
    let um;
    while ((um = usedRe.exec(text))) {
      for (const v of items) addCovered(into, um[1], v);
    }
  }
}

/** `prop: 'value'` / `prop: "value"` object-literal idiom (R1b): the imperative
 * call-site shape (Angular `AtlToast`: `toastService.show(msg, { variant: 'success' })`)
 * and any general config-object case (`{ variant: 'success', duration: 2000 }`). Same
 * scope as `scanLiteralAttrs` — the story's own node range, plus the meta's `render`
 * when the story has none. */
function scanObjectLiteralProps(text, into) {
  const re = /\b([A-Za-z_$][\w-]*)\s*:\s*(['"])([^'"]*)\2/g;
  let m;
  while ((m = re.exec(text))) addCovered(into, m[1], m[3]);
}

/** Per-component source-literal coverage: Map<propName, Set<value>>, built across every
 * story file that feeds this component's docgen. Each story contributes its own node
 * range (from csf-tools) plus the meta's `render` property text when the story has no
 * `render` of its own; the array+map idiom is checked over the whole file, per its
 * looser "present in the file" wording. */
function buildSourceCoverage(fw, files) {
  const merged = new Map();
  for (const { csf, source } of files) {
    const metaRenderText = getMetaRenderText(csf, source);

    for (const key of Object.keys(csf._stories || {})) {
      if (!csf._storyStatements || !csf._storyStatements[key]) continue;
      const blob = getStoryEvidenceBlob(csf, source, key, metaRenderText);
      scanLiteralAttrs(blob, fw, merged);
      scanObjectLiteralProps(blob, merged);
    }
    scanArrayMapCredit(source, fw, merged);
  }
  return merged;
}

function nodeToPrimitive(node) {
  if (node == null) return UNRESOLVABLE;
  if (typeof node !== 'object') return node;
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return node.value;
    case 'NullLiteral':
      return null;
    case 'Identifier':
      return node.name === 'undefined' ? undefined : UNRESOLVABLE;
    default:
      return UNRESOLVABLE;
  }
}

function collectStoryClaims(csf, fw, componentName, source) {
  const resolver = createStoryArgsResolver(csf);
  const claims = [];
  const metaRenderText = getMetaRenderText(csf, source);
  for (const key of Object.keys(csf._stories || {})) {
    const stats = csf._stories[key].__stats || {};
    const ownKeys = getOwnStoryKeys(csf, key);
    const isRenderOnlyDemo = !!stats.render && !ownKeys.includes('args');
    // R1a: a render-only story whose render/template source FORWARDS the resolved args
    // object to the component (rather than ignoring them) is a claim, not a demo — its
    // effective args are the meta args, so it participates in R1b's default-omission
    // credit below. A pure demo (render body never references args) stays excluded.
    const isForwardingDemo = isRenderOnlyDemo && isForwardingRender(getStoryEvidenceBlob(csf, source, key, metaRenderText));
    let resolved;
    try {
      resolved = resolver.resolve(key);
    } catch {
      continue;
    }
    if (resolved.unresolved && resolved.unresolved.length) {
      report('UNRESOLVED-ARGS', fw, `${componentName}: story '${key}' has unresolved args`);
    }
    if (isRenderOnlyDemo && !isForwardingDemo) continue;
    const values = {};
    for (const [k, v] of Object.entries(resolved.args || {})) {
      const prim = nodeToPrimitive(v);
      if (prim !== UNRESOLVABLE) values[k] = prim;
    }
    // R1b: null means "no own args object at all" — every prop is omitted, so the
    // manifest default is trivially demonstrated by whatever the component renders
    // unconfigured. A non-null array still counts as omitting any key it doesn't list.
    claims.push({ story: key, values, ownArgKeys: getOwnArgKeys(csf, key) });
  }
  return claims;
}

// ─── Tokens (for --emit) ────────────────────────────────────────────────────

function scanCssTokens(dir) {
  const tokens = new Set();
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.css'));
  } catch {
    /* dir missing */
  }
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), 'utf-8');
    const re = /var\(\s*(--ui-[\w-]+)/g;
    let m;
    while ((m = re.exec(src))) tokens.add(m[1]);
  }
  return [...tokens].sort();
}

// ─── Per-component checks ───────────────────────────────────────────────────

function processComponent(fw, name, docgenResult, contract, contextDir, allClaims, sourceCoverage) {
  const master = snapshotBySelector.get(name);
  const docgenProps = docgenResult.props;
  const hasContract = !!contract;
  const hasSnapshot = !!master;

  if (!reachedByFw.has(name)) reachedByFw.set(name, new Set());
  reachedByFw.get(name).add(fw);

  if (hasSnapshot && !hasContract) {
    report('CONTRACT-MISSING', fw, `${name}: docgen payload and snapshot master (${master.nodeId}) exist but no contract file`);
  }
  if (hasContract && docgenProps.length === 0) {
    report('DOCGEN-EMPTY', fw, `${name}: contract exists but the docgen payload has zero props`);
  }

  const figmaOnlyNames = new Set();
  const stateValueExemptions = new Set();
  for (const e of (contract && contract.figmaOnly) || []) {
    const m = /^state=(.+)$/.exec(e.name);
    if (m) stateValueExemptions.add(m[1]);
    else figmaOnlyNames.add(e.name);
  }
  const axisMapByFigmaAxis = new Map();
  for (const e of (contract && contract.axisMap) || []) {
    if (!axisMapByFigmaAxis.has(e.figmaAxis)) axisMapByFigmaAxis.set(e.figmaAxis, []);
    axisMapByFigmaAxis.get(e.figmaAxis).push(e);
  }
  const axisMapCodeProps = new Set(((contract && contract.axisMap) || []).map((e) => e.codeProp));
  const codeOnlyNames = new Set(((contract && contract.codeOnly) || []).map((e) => e.name));

  const propByName = new Map(docgenProps.filter((p) => !p.isOutput).map((p) => [p.name, p]));

  const enumCoverageTargets = []; // { propName, values: Set }
  const boolCoverageTargets = new Set(); // propName

  // ── AXIS ──
  if (hasSnapshot) {
    for (const [axisName, axisValues] of Object.entries(master.variantAxes || {})) {
      if (figmaOnlyNames.has(axisName)) continue;
      const isStateAxis = axisName === 'state';
      const excluded = isStateAxis ? INTERACTION_STATE_VALUES : new Set();
      const valuesToCheck = axisValues.filter((v) => !excluded.has(v));
      const mapEntries = axisMapByFigmaAxis.get(axisName) || [];

      if (mapEntries.length > 0) {
        const covered = new Set();
        for (const entry of mapEntries) {
          const resolved = resolveCodeProp(fw, entry.codeProp, propByName, contextDir);
          if (!resolved.exists) {
            report('AXIS', fw, `${name}: axisMap ${axisName} -> ${entry.codeProp} — code prop not found`);
            continue;
          }
          if (entry.values) {
            for (const [figVal, codeVal] of Object.entries(entry.values)) {
              covered.add(figVal);
              if (!isMemberOfType(codeVal, resolved)) {
                report(
                  'AXIS',
                  fw,
                  `${name}: axisMap ${axisName}=${figVal} -> ${entry.codeProp} value ${JSON.stringify(codeVal)} is not a member of the prop's type`
                );
              }
            }
            if (!entry.codeProp.includes('.')) {
              if (resolved.kind === 'boolean') boolCoverageTargets.add(entry.codeProp);
              else if (resolved.kind === 'enum') {
                enumCoverageTargets.push({
                  propName: entry.codeProp,
                  values: new Set(Object.values(entry.values)),
                  default: propByName.get(entry.codeProp) && propByName.get(entry.codeProp).default,
                });
              }
            }
          } else {
            for (const v of valuesToCheck) covered.add(v);
            if (resolved.kind === 'enum' && resolved.members) {
              const propSet = new Set(resolved.members);
              const axisSet = new Set(axisValues);
              const missing = axisValues.filter((v) => !propSet.has(v));
              const extra = resolved.members.filter((v) => !axisSet.has(v));
              if (missing.length || extra.length) {
                report(
                  'AXIS',
                  fw,
                  `${name}: axisMap ${axisName} -> ${entry.codeProp} (identity mapping) mismatch — missing ${JSON.stringify(
                    missing
                  )}, extra ${JSON.stringify(extra)}`
                );
              }
            }
            if (!entry.codeProp.includes('.')) {
              if (resolved.kind === 'boolean') boolCoverageTargets.add(entry.codeProp);
              else if (resolved.kind === 'enum') {
                enumCoverageTargets.push({
                  propName: entry.codeProp,
                  values: new Set(resolved.members || []),
                  default: propByName.get(entry.codeProp) && propByName.get(entry.codeProp).default,
                });
              }
            }
          }
        }
        for (const v of valuesToCheck) if (stateValueExemptions.has(v)) covered.add(v);
        const missing = valuesToCheck.filter((v) => !covered.has(v));
        if (missing.length) {
          report('AXIS', fw, `${name}: axis '${axisName}' values not covered by axisMap or figmaOnly: ${missing.join(', ')}`);
        }
      } else if (isStateAxis) {
        const missing = valuesToCheck.filter((v) => !stateValueExemptions.has(v));
        if (missing.length) {
          report('AXIS', fw, `${name}: 'state' axis values not covered by axisMap or figmaOnly: ${missing.join(', ')}`);
        }
      } else {
        const prop = propByName.get(axisName);
        if (!prop) {
          report('AXIS', fw, `${name}: no manifest prop named '${axisName}' for snapshot axis '${axisName}'`);
        } else if (prop.kind !== 'enum' || !prop.members) {
          report('AXIS', fw, `${name}: manifest prop '${axisName}' is not an enum (kind=${prop.kind})`);
        } else {
          const propSet = new Set(prop.members);
          const axisSet = new Set(axisValues);
          const missing = axisValues.filter((v) => !propSet.has(v));
          const extra = prop.members.filter((v) => !axisSet.has(v));
          if (missing.length || extra.length) {
            report(
              'AXIS',
              fw,
              `${name}: axis '${axisName}' ≠ prop '${axisName}' — missing ${JSON.stringify(missing)}, extra ${JSON.stringify(extra)}`
            );
          }
          enumCoverageTargets.push({ propName: axisName, values: new Set(prop.members), default: prop.default });
        }
      }
    }

    // ── BOOLEAN ──
    for (const [rawName, kind] of Object.entries(master.properties || {})) {
      if (kind !== 'BOOLEAN') continue;
      const propName = stripId(rawName);
      if (figmaOnlyNames.has(propName)) continue;
      if (axisMapCodeProps.has(propName) || ((contract && contract.axisMap) || []).some((e) => e.figmaAxis === propName)) continue;
      const prop = propByName.get(propName);
      if (!prop || prop.kind !== 'boolean') {
        report('BOOLEAN', fw, `${name}: snapshot BOOLEAN '${propName}' has no matching boolean manifest prop`);
      } else {
        boolCoverageTargets.add(propName);
      }
      // R3: a figmaOnly entry claiming this same name is pointless if it DOES match.
      if (figmaOnlyNames.has(propName) && prop && prop.kind === 'boolean') {
        report('STALE-EXEMPTION', fw, `${name}: figmaOnly '${propName}' — a compatible boolean manifest prop exists; the exemption suppresses nothing`);
      }
    }
  }

  // ── ENUM-UNDRAWN (R1c: only for components with a snapshot master) ──
  if (!hasSnapshot) {
    report(
      'NO-MASTER',
      fw,
      `${name}: docgen payload exists but no snapshot master in tools/figma/snapshot.json — nothing to compare against Figma; ENUM-UNDRAWN and coverage skipped`
    );
  } else {
    const axisNames = new Set(Object.keys(master.variantAxes || {}));
    for (const prop of docgenProps) {
      if (prop.isOutput) continue;
      if (prop.kind !== 'enum' || !prop.members || prop.members.length < 2) continue;
      if (axisNames.has(prop.name)) continue;
      if (axisMapCodeProps.has(prop.name)) continue;
      if (codeOnlyNames.has(prop.name)) continue;
      report('ENUM-UNDRAWN', fw, `${name}: manifest prop '${prop.name}' (enum: ${prop.members.join('|')}) has no snapshot axis, axisMap or codeOnly entry`);
    }
  }

  // R3, variant-axis half: a figmaOnly entry naming an axis that DOES have a matching
  // verbatim enum prop suppresses nothing.
  for (const axisName of figmaOnlyNames) {
    if (!hasSnapshot || !(master.variantAxes || {})[axisName]) continue;
    const prop = propByName.get(axisName);
    if (prop && prop.kind === 'enum' && prop.members) {
      const propSet = new Set(prop.members);
      const axisSet = new Set(master.variantAxes[axisName]);
      const equal = propSet.size === axisSet.size && [...axisSet].every((v) => propSet.has(v));
      if (equal) {
        report('STALE-EXEMPTION', fw, `${name}: figmaOnly '${axisName}' — a verbatim-matching enum manifest prop exists; the exemption suppresses nothing`);
      }
    }
  }

  // ── COVERAGE / COVERAGE-BOOL ──
  // Evidence, in order: (1) args, as resolved by the story-args resolver — unchanged,
  // still primary; (2) render-source literal scan (R1a); (3) the manifest default,
  // credited when some non-render-only story's OWN args omit the prop (R1b) — that
  // story renders the component unconfigured, which trivially demonstrates the default
  // regardless of whether the literal string appears anywhere in the file.
  for (const target of enumCoverageTargets) {
    const srcCovered = sourceCoverage.get(target.propName);
    const defaultOmittedSomewhere =
      target.default !== undefined &&
      allClaims.some((c) => c.ownArgKeys === null || !c.ownArgKeys.includes(target.propName));
    const missing = [...target.values].filter((v) => {
      if (allClaims.some((c) => Object.prototype.hasOwnProperty.call(c.values, target.propName) && c.values[target.propName] === v)) {
        return false;
      }
      if (srcCovered && srcCovered.has(String(v))) return false;
      if (defaultOmittedSomewhere && v === target.default) return false;
      return true;
    });
    if (missing.length) {
      report('COVERAGE', fw, `${name}: prop '${target.propName}' — no story sets value(s) ${JSON.stringify(missing)}`);
    }
  }
  for (const propName of boolCoverageTargets) {
    const observed = allClaims.some((c) => c.values[propName] === true);
    if (!observed) {
      report('COVERAGE-BOOL', fw, `${name}: boolean prop '${propName}' is never true in any story`);
    }
  }

  // ── codeOnly staleness (R1d: cross-framework — tracked here, evaluated once after
  //    every requested framework has run, in runCodeOnlyStalenessChecks()) ──
  for (const entry of (contract && contract.codeOnly) || []) {
    const present = propByName.has(entry.name) || docgenProps.some((p) => p.isOutput && p.name === entry.name);
    if (!present) continue;
    if (!codeOnlyPresentByFw.has(name)) codeOnlyPresentByFw.set(name, new Map());
    const byEntry = codeOnlyPresentByFw.get(name);
    if (!byEntry.has(entry.name)) byEntry.set(entry.name, new Set());
    byEntry.get(entry.name).add(fw);
  }
}

// ─── Per-framework orchestration ───────────────────────────────────────────

async function runFramework(fw) {
  const t0 = performance.now();
  const storyFiles = findStoryFiles(fw);
  const workerDocgen = fw !== 'react' ? await makeWorkerDocgen(fw) : null;

  const byComponent = new Map(); // name -> { docgenResult, contextDir, files: [csf...] }
  const reachedMeta = new Set();
  let noComponentCount = 0;

  for (const storyFile of storyFiles) {
    const source = fs.readFileSync(storyFile, 'utf-8');
    let csf;
    try {
      csf = loadCsf(source, { makeTitle: (t) => t, fileName: storyFile }).parse();
    } catch (e) {
      console.error(`  ! ${path.relative(ROOT, storyFile)}: csf-tools failed to parse (${e.message})`);
      continue;
    }
    const metaComponent = typeof csf._meta.component === 'string' ? csf._meta.component : null;
    if (!metaComponent) {
      noComponentCount++;
      continue;
    }

    let docgenResult = null;
    const contextDir = path.dirname(storyFile);

    if (fw === 'react') {
      const rawPath = csf._rawComponentPath;
      const spec = csf._componentImportSpecifier;
      const localName = spec && spec.local && spec.local.name;
      if (rawPath && localName) {
        const componentFile = resolveWithExtensions(path.resolve(contextDir, rawPath));
        if (componentFile) {
          try {
            const docgens = reactParseFile(componentFile);
            for (const d of docgens) registerSibling(fw, d.displayName, normalizeReactDocgen(d));
            const match = docgens.find((d) => d.displayName === localName) || docgens.find((d) => d.displayName === metaComponent);
            if (match) {
              docgenResult = { name: match.displayName, props: normalizeReactDocgen(match), description: match.description, slots: undefined };
            }
          } catch (e) {
            console.error(`  ! ${path.relative(ROOT, storyFile)}: react-docgen failed (${e.message})`);
          }
        }
      }
    } else {
      const payload = await workerDocgen(storyFile, csf);
      if (payload) {
        const normalized = fw === 'angular' ? normalizeAngular(payload) : normalizeVue(payload);
        docgenResult = { name: payload.name, props: normalized.props, description: normalized.description, slots: normalized.slots };
        registerSibling(fw, payload.name, normalized.props);
      }
    }

    if (!docgenResult) {
      noComponentCount++;
      continue;
    }

    reachedMeta.add(docgenResult.name);
    let entry = byComponent.get(docgenResult.name);
    if (!entry) {
      entry = { docgenResult, contextDir, files: [] };
      byComponent.set(docgenResult.name, entry);
    }
    entry.files.push({ storyFile, csf, source });
  }

  const errorsBefore = findings.filter((f) => f.level === 'error').length;
  const warningsBefore = findings.filter((f) => f.level === 'warning').length;

  for (const [name, entry] of byComponent) {
    const contract = contractsBySelector.get(name);
    const allClaims = entry.files.flatMap(({ csf, source }) => collectStoryClaims(csf, fw, name, source));
    const sourceCoverage = buildSourceCoverage(fw, entry.files);
    processComponent(fw, name, entry.docgenResult, contract, entry.contextDir, allClaims, sourceCoverage);

    if (args.report) {
      console.log(`  ok  ${name} (props: ${entry.docgenResult.props.length}, stories: ${entry.files.reduce((n, f) => n + Object.keys(f.csf._stories || {}).length, 0)})`);
    }

    if (args.emit) {
      const props = entry.docgenResult.props.filter((p) => !p.isOutput);
      const events = entry.docgenResult.props.filter((p) => p.isOutput);
      const codeSpec = {
        componentAPI: {
          props: props.map((p) => ({
            name: p.name,
            type: p.typeText || p.kind,
            values: p.kind === 'enum' ? p.members : undefined,
            defaultValue: p.default,
            description: p.description,
            required: p.required,
          })),
          events: events.map((e) => ({ name: e.name, type: e.typeText, description: e.description })),
          slots: entry.docgenResult.slots,
        },
        metadata: { name, description: entry.docgenResult.description },
        tokens: { usedTokens: scanCssTokens(entry.contextDir) },
      };
      const outDir = path.join(path.resolve(args.emit), fw);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, `${name}.codespec.json`), JSON.stringify(codeSpec, null, 2));
    }
  }

  // ── NO-STORY-META (R5) ──
  for (const selector of contractsBySelector.keys()) {
    if (reachedMeta.has(selector)) continue;
    if (!snapshotBySelector.has(selector)) continue; // CONTRACT-ORPHAN already covers this
    report('NO-STORY-META', fw, `${selector}: has a contract and a snapshot master, but no story file's meta.component resolves to it in ${fw}`);
  }

  const t1 = performance.now();
  const errorsAfter = findings.filter((f) => f.level === 'error').length;
  const warningsAfter = findings.filter((f) => f.level === 'warning').length;
  console.log(
    `[${fw}] components: ${byComponent.size}, contracts: ${contractsBySelector.size}, stories: ${storyFiles.length} ` +
      `(no-component: ${noComponentCount}), warnings: ${warningsAfter - warningsBefore}, errors: ${errorsAfter - errorsBefore}, ${(t1 - t0).toFixed(0)} ms`
  );
}

// ─── codeOnly cross-framework staleness (R1d) ──────────────────────────────
// Runs once, after every requested framework has processed every component, so a
// codeOnly entry's presence can be judged across the full set of manifests rather
// than one framework at a time. A component never reached by ANY run framework is
// silently skipped, same as before this rule existed — NO-STORY-META already
// covers "the contract exists but nothing resolves to it".
function runCodeOnlyStalenessChecks() {
  const singleFwRun = targetFrameworks.length === 1;
  for (const [selector, contract] of contractsBySelector) {
    const reached = reachedByFw.get(selector);
    if (!reached || reached.size === 0) continue;
    for (const entry of contract.codeOnly || []) {
      const present = (codeOnlyPresentByFw.get(selector) || new Map()).get(entry.name) || new Set();
      const absent = [...reached].filter((fw) => !present.has(fw)).sort();
      if (absent.length === 0) continue;
      if (singleFwRun) {
        report(
          'FW-ONLY',
          absent[0],
          `${selector}: codeOnly '${entry.name}' names a prop not in the manifest — single-framework run (--fw ${targetFrameworks[0]}), cannot confirm cross-framework presence; downgraded from STALE-EXEMPTION`
        );
      } else if (absent.length === reached.size) {
        report(
          'STALE-EXEMPTION',
          null,
          `${selector}: codeOnly '${entry.name}' names a prop no longer in any framework's manifest (checked: ${[...reached].sort().join(', ')})`
        );
      } else {
        report('FW-ONLY', null, `${selector}: codeOnly '${entry.name}' missing from ${absent.join(', ')} — present in the other framework(s) (ADR-0093 territory)`);
      }
    }
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  runGlobalChecks();
  for (const fw of targetFrameworks) {
    await runFramework(fw);
  }
  runCodeOnlyStalenessChecks();

  const byTag = new Map();
  for (const f of findings) {
    if (!byTag.has(f.tag)) byTag.set(f.tag, []);
    byTag.get(f.tag).push(f);
  }
  const tagOrder = Object.keys(TAG_LEVEL);
  console.log('\n--- findings ---');
  for (const tag of tagOrder) {
    const list = byTag.get(tag);
    if (!list || list.length === 0) continue;
    for (const f of list) {
      console.log(`[${f.tag}]${f.fw ? ` (${f.fw})` : ''} ${f.msg}`);
    }
  }

  const totalErrors = findings.filter((f) => f.level === 'error').length;
  const totalWarnings = findings.filter((f) => f.level === 'warning').length;
  console.log(`\ntotal: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
  process.exitCode = totalErrors > 0 ? 1 : 0;
  process.exit(process.exitCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
