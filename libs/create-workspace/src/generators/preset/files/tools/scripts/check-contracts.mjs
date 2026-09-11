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
 *
 * [CONTRACT-IMPORT] (S5b): a component story file whose component has a contract
 * must import it — by the `@atelier-ui/spec/contracts/<name>.contract` alias here,
 * or by a relative path to the contracts directory in a scaffold — and set
 * `contract` in the meta's `parameters`; error where `docs-block.ts` ships beside
 * the contracts, warning otherwise — a textual check, the same heuristic
 * `check-story-descriptions.js` uses for `component: metadata.purpose`.
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { loadCsf, createStoryArgsResolver } from 'storybook/internal/csf-tools';
import {
  findStoryFiles,
  resolveWithExtensions,
  makeWorkerDocgen,
  normalizeAngular,
  normalizeVue,
  makeReactDocgenTools,
  normalizeReactDocgen,
  findExternalPackageDir,
  errorMessage,
} from './lib/docgen.mjs';

// ts-eval.js is always required relative to THIS script's own directory
// (`lib/ts-eval.js` beside it, via createRequire(import.meta.url) — not the
// cwd) so a copied pair (canonical script + lib/ts-eval.js) works unmodified
// wherever it is dropped, including inside a scaffolded workspace.
const require = createRequire(import.meta.url);
const { parseExportedVars } = require('./lib/ts-eval.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ROOT is likewise derived from the script's own location, not the cwd — a
// byte-identical copy at <scaffold>/tools/scripts/check-contracts.mjs
// therefore defaults to the SCAFFOLD's own tree (its own libs/spec,
// tools/figma/snapshot.json) with zero changes below, whenever CLI flags and
// contracts.config.json don't override a given path.
const ROOT = path.resolve(__dirname, '../..');
// Framework docgen packages (react-docgen, the Storybook framework workers),
// by contrast, are resolved from the CWD's node_modules — not this script's
// own directory — so that running `node tools/scripts/check-contracts.mjs`
// from inside a scaffold picks up the scaffold's own installed Storybook
// packages rather than whatever happens to be findable by walking up from
// this file (which, for a copied pair, is usually the same tree anyway, but
// CWD is the explicit, unambiguous contract).
const CWD = process.cwd();
const cwdRequire = createRequire(path.join(CWD, 'package.json'));
const { reactParseFile } = makeReactDocgenTools(cwdRequire);
const FRAMEWORKS = ['angular', 'react', 'vue'];

// Interaction values on a `state` axis (ADR-0114): CSS pseudo-classes, not code-modelled
// state. Every OTHER value on a `state` axis (completed, optional, error, filled, open,
// invalid, checked, filtered, selected, ...) is data-flavoured and must be covered by an
// `axisMap` entry or a `figmaOnly` entry named `state=<value>`.
const INTERACTION_STATE_VALUES = new Set([
  'default',
  'hover',
  'focus',
  'focus-visible',
  'active',
  'pressed',
]);

const UNRESOLVABLE = Symbol('unresolvable');

const TAG_LEVEL = {
  'CONTRACT-MISSING': 'error',
  'CONTRACT-DUPLICATE': 'error',
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
  'DOCGEN-FAILED': 'error',
  'UNRESOLVED-ARGS': 'warning',
  UNMIRRORED: 'warning',
  'NO-STORY-META': 'warning',
  ROSTER: 'error',
  // 'CONTRACT-IMPORT' is set below, once CONTRACTS_DIR is resolved — its
  // severity (error vs. warning) depends on whether this tree ships
  // `docs-block.ts` beside its contracts (see the assignment near CONTRACTS_DIR).
};

// ─── CLI args ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {
    fw: null,
    snapshot: null,
    report: false,
    emit: null,
    contracts: null,
    stories: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--fw') out.fw = argv[++i];
    else if (a === '--snapshot') out.snapshot = argv[++i];
    else if (a === '--report') out.report = true;
    else if (a === '--emit') out.emit = argv[++i];
    else if (a === '--contracts') out.contracts = argv[++i];
    else if (a === '--stories') out.stories.push(argv[++i]);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

// ─── Resolution layer (portable across the monorepo and a scaffolded
//     single-framework workspace) ────────────────────────────────────────────
// Precedence per field: CLI flag > `contracts.config.json` at the cwd root >
// monorepo default. Nothing below changes what a plain
// `node tools/scripts/check-contracts.mjs` run from the repo root does — no
// flags, no contracts.config.json at the repo root, so every field falls
// through to the same defaults this script always used.
const CONFIG_PATH = path.join(CWD, 'contracts.config.json');
let fileConfig = null;
if (fs.existsSync(CONFIG_PATH)) {
  try {
    fileConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch (e) {
    console.error(`${CONFIG_PATH}: invalid JSON (${e.message})`);
    process.exit(2);
  }
}

const requestedFw = args.fw || fileConfig?.framework || null;
const targetFrameworks = requestedFw ? [requestedFw] : FRAMEWORKS;
for (const fw of targetFrameworks) {
  if (!FRAMEWORKS.includes(fw)) {
    console.error(
      `Unknown framework '${fw}' — expected one of ${FRAMEWORKS.join(', ')}`,
    );
    process.exit(2);
  }
}

// `--stories` (repeatable) or config `stories: [...]` — one or more roots
// walked recursively for `**/*.stories.{ts,tsx}` (node_modules excluded).
// `null` means "no override": findStoryFiles() falls back to its historic
// per-framework `libs/<fw>/src/lib` walk.
const STORIES_DIRS = args.stories.length
  ? args.stories.map((d) => path.resolve(CWD, d))
  : Array.isArray(fileConfig?.stories) && fileConfig.stories.length
    ? fileConfig.stories.map((d) => path.resolve(CWD, d))
    : null;

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

const snapshotPath = args.snapshot
  ? path.resolve(CWD, args.snapshot)
  : fileConfig?.snapshot
    ? path.resolve(CWD, fileConfig.snapshot)
    : path.join(ROOT, 'tools/figma/snapshot.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
const snapshotBySelector = new Map(
  snapshot.components.map((c) => [c.selector, c]),
);

function stripId(name) {
  const i = name.indexOf('#');
  return i === -1 ? name : name.slice(0, i);
}

// ─── Contracts ──────────────────────────────────────────────────────────────

const CONTRACTS_DIR = args.contracts
  ? path.resolve(CWD, args.contracts)
  : fileConfig?.contracts
    ? path.resolve(CWD, fileConfig.contracts)
    : path.join(ROOT, 'libs/spec/src/contracts');

// Whether CONTRACTS_DIR is this repo's own monorepo contracts directory — the
// only place the `@atelier-ui/spec/contracts/<base>` path alias actually
// resolves (a scaffold neither ships nor depends on a `@atelier-ui/spec`
// package). Named once here so `hasContractImport` (accepting the alias) and
// `suggestedContractSpecifier` (suggesting it) read the same test rather than
// each re-deriving it and risking drift.
const CONTRACTS_DIR_IS_MONOREPO =
  CONTRACTS_DIR === path.join(ROOT, 'libs/spec/src/contracts');

// [CONTRACT-IMPORT] exists because `libs/spec/src/contracts/docs-block.ts`'s
// `ContractBlock` reads `parameters.contract` off the story meta and renders
// it — an unwired story is a real gap in THIS repo (error) because that block
// ships here. A fresh `create-atelier-ui-workspace` scaffold doesn't ship
// `docs-block.ts` yet (S5b's "block that displays it" is monorepo-only so
// far), so the identical finding has nothing to render into there — downgrade
// to a warning rather than fail a scaffold's `check:contracts` over wiring
// with no visible effect yet. Set once here (CONTRACTS_DIR is resolved by
// this point) rather than in the TAG_LEVEL literal above.
const CONTRACT_IMPORT_HAS_DOCS_BLOCK = fs.existsSync(
  path.join(CONTRACTS_DIR, 'docs-block.ts'),
);
TAG_LEVEL['CONTRACT-IMPORT'] = CONTRACT_IMPORT_HAS_DOCS_BLOCK
  ? 'error'
  : 'warning';

const contractFiles = fs
  .readdirSync(CONTRACTS_DIR)
  .filter((f) => f.endsWith('.contract.ts'))
  .sort();

/** selector -> contract object (plain literal, per ts-eval's static read).
 * `.set(contract.component, …)` below silently keeps only the LAST of two
 * contract files declaring the same `component:` — the same class of bug
 * allowlists.js's own SCAFFOLD_PORT_EXEMPT collision guard exists to stop
 * (see that file's comment), just against a hand-maintained Map instead of a
 * generated one. Detected here, before the overwrite, and reported as
 * [CONTRACT-DUPLICATE] naming both files — a silently dropped contract is
 * exactly the kind of measurement gap this whole change exists to close. */
const contractsBySelector = new Map();
for (const file of contractFiles) {
  const full = path.join(CONTRACTS_DIR, file);
  const vars = parseExportedVars(full);
  const contract = vars.contract;
  if (!contract || typeof contract !== 'object') {
    console.error(
      `${file}: 'contract' did not evaluate to a static object literal — skipped.`,
    );
    continue;
  }
  const existing = contractsBySelector.get(contract.component);
  if (existing) {
    report(
      'CONTRACT-DUPLICATE',
      null,
      `${contract.component}: declared by both ${existing.__file} and ${file} — only ${file} is kept, ${existing.__file}'s contract is silently dropped`,
    );
  }
  contractsBySelector.set(contract.component, { ...contract, __file: file });
}

// ─── Global (framework-independent) checks ─────────────────────────────────
// CONTRACT-ORPHAN, CONTRACT-NODE, FIGMA-ONLY (UNEXPLAINED), the "no longer on the
// master" half of STALE-EXEMPTION, and UNMIRRORED only need the contract and the
// snapshot — run once, not once per framework.

function isNameOnMaster(master, name) {
  if (!master) return false;
  if (Object.prototype.hasOwnProperty.call(master.variantAxes || {}, name))
    return true;
  for (const key of Object.keys(master.properties || {})) {
    if (stripId(key) === name) return true;
  }
  return false;
}

function isStateValueOnMaster(master, value) {
  return !!((master && (master.variantAxes || {}).state) || []).includes(value);
}

function runGlobalChecks() {
  for (const [selector, contract] of contractsBySelector) {
    const master = snapshotBySelector.get(selector);

    if (!master) {
      report(
        'CONTRACT-ORPHAN',
        null,
        `${selector} (${contract.__file}): selector is in no snapshot master`,
      );
      continue; // nothing else below is checkable without a master
    }

    if (contract.figmaNodeId !== master.nodeId) {
      report(
        'CONTRACT-NODE',
        null,
        `${selector}: contract.figmaNodeId '${contract.figmaNodeId}' ≠ snapshot nodeId '${master.nodeId}'`,
      );
    }

    for (const entry of contract.figmaOnly || []) {
      if (/UNEXPLAINED/.test(entry.reason)) {
        report(
          'FIGMA-ONLY',
          null,
          `${selector}: figmaOnly '${entry.name}' reason is UNEXPLAINED`,
        );
      }
      const m = /^state=(.+)$/.exec(entry.name);
      if (m) {
        if (!isStateValueOnMaster(master, m[1])) {
          report(
            'STALE-EXEMPTION',
            null,
            `${selector}: figmaOnly '${entry.name}' — 'state' axis no longer has value '${m[1]}'`,
          );
        }
        if (!(master.description || '').includes(m[1])) {
          report(
            'UNMIRRORED',
            null,
            `${selector}: figmaOnly '${entry.name}' — '${m[1]}' not mentioned in the master description`,
          );
        }
      } else {
        if (!isNameOnMaster(master, entry.name)) {
          report(
            'STALE-EXEMPTION',
            null,
            `${selector}: figmaOnly '${entry.name}' names a property no longer on the master`,
          );
        }
        if (!(master.description || '').includes(entry.name)) {
          report(
            'UNMIRRORED',
            null,
            `${selector}: figmaOnly '${entry.name}' not mentioned in the master description`,
          );
        }
      }
    }

    for (const entry of contract.codeOnly || []) {
      if (/UNEXPLAINED/.test(entry.reason)) {
        report(
          'FIGMA-ONLY',
          null,
          `${selector}: codeOnly '${entry.name}' reason is UNEXPLAINED`,
        );
      }
      if (!(master.description || '').includes(entry.name)) {
        report(
          'UNMIRRORED',
          null,
          `${selector}: codeOnly '${entry.name}' not mentioned in the master description`,
        );
      }
    }

    for (const entry of contract.axisMap || []) {
      if (!(master.description || '').includes(entry.figmaAxis)) {
        report(
          'UNMIRRORED',
          null,
          `${selector}: axisMap figmaAxis '${entry.figmaAxis}' not mentioned in the master description`,
        );
      }
    }
  }

  // CONTRACT-MISSING needs a docgen payload (framework-dependent), so it is emitted
  // per framework below, not here.
}

// ─── Per-framework docgen ───────────────────────────────────────────────────
// collectStoryFilesUnder / findStoryFiles / toRepoImportPath now live in
// ./lib/docgen.mjs (ADR-0121 §5 / S6(a)), shared with check-manifest-parity.mjs.
// findStoryFiles(fw) here is always findStoryFiles(fw, { root: ROOT, storiesDirs: STORIES_DIRS }).

// ─── CONTRACT-IMPORT (S5b) ──────────────────────────────────────────────────
// The Storybook docs page's `ContractBlock` (`libs/spec/src/contracts/docs-
// block.ts`) reads `parameters.contract` off the current story meta — it has
// nothing to render unless the story file imports the component's contract
// and wires it in. Textual, not AST: the same convention-following heuristic
// `check-story-descriptions.js` uses for `component: metadata.purpose`. Every
// story file in this repo follows one shape (`const meta ... export default
// meta;`), so a lexical scan for that shape is enough.

/** The `const meta = {...}; export default meta;` slice, or `null` if the file
 * doesn't follow that convention (treated as "not wired" below, not a crash). */
function extractMetaBlock(source) {
  const metaStart = source.indexOf('\nconst meta');
  if (metaStart === -1) return null;
  const exportIdx = source.indexOf('\nexport default meta;', metaStart);
  if (exportIdx === -1) return null;
  return source.slice(metaStart, exportIdx);
}

/** The text strictly inside the `parameters: { ... }` object of a meta block,
 * found by brace-depth matching (the object nests, e.g. `docs: { description:
 * { ... } }`, so a single-level `[^}]*` regex would stop too early). */
function extractParamsBody(metaBlock) {
  const paramsKeyIdx = metaBlock.indexOf('parameters:');
  if (paramsKeyIdx === -1) return null;
  const openBraceIdx = metaBlock.indexOf('{', paramsKeyIdx);
  if (openBraceIdx === -1) return null;
  let depth = 0;
  for (let i = openBraceIdx; i < metaBlock.length; i++) {
    if (metaBlock[i] === '{') depth++;
    else if (metaBlock[i] === '}') {
      depth--;
      if (depth === 0) return metaBlock.slice(openBraceIdx + 1, i);
    }
  }
  return null;
}

/** Every raw import specifier (`from '...'` / `from "..."`) appearing anywhere in
 * `source` — a lexical scan, not an AST walk, matching this file's other
 * story-meta heuristics (`extractMetaBlock`, `extractParamsBody`). */
function findImportSpecifiers(source) {
  return [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

/**
 * Whether `contract` is imported by any specifier in `source`, accepting
 * EITHER of two forms: the monorepo's `@atelier-ui/spec/contracts/<base>`
 * path alias — only accepted when `CONTRACTS_DIR_IS_MONOREPO`, since that
 * alias only ever resolves inside this repo; a scaffold neither ships nor
 * depends on a `@atelier-ui/spec` package, so the identical string in a
 * scaffold's story would be a specifier that can never resolve there, not a
 * valid wiring — or a RELATIVE specifier that, resolved from `storyFile`'s own
 * directory (a trailing `.js` stripped first — a NodeNext-style
 * `./contracts/button.contract.js` import resolves to the `.ts` source file
 * under bundler/NodeNext resolution — then `.ts` appended when the resolved
 * path doesn't already end in it), lands on the exact file `CONTRACTS_DIR`
 * holds this contract at. The relative form is what a scaffold's own contract
 * import looks like — `CONTRACTS_DIR` there is `<app>/src/contracts`, not a
 * workspace alias.
 */
function hasContractImport(storyFile, source, contract) {
  const expectedBase = contract.__file.replace(/\.ts$/, '');
  const aliasSpecifier = `@atelier-ui/spec/contracts/${expectedBase}`;
  const targetFile = path.join(CONTRACTS_DIR, contract.__file);
  return findImportSpecifiers(source).some((spec) => {
    if (CONTRACTS_DIR_IS_MONOREPO && spec === aliasSpecifier) return true;
    if (!spec.startsWith('.')) return false;
    let resolved = path.resolve(path.dirname(storyFile), spec);
    if (resolved.endsWith('.js')) resolved = resolved.slice(0, -3);
    if (!resolved.endsWith('.ts')) resolved += '.ts';
    return resolved === targetFile;
  });
}

/**
 * The specifier suggested in the [CONTRACT-IMPORT] message: the monorepo's
 * path alias when `CONTRACTS_DIR_IS_MONOREPO` (the only place that alias
 * resolves), otherwise a relative path from `storyFile`'s directory to the
 * contract file — extensionless, forward slashes, `./`-prefixed unless it
 * already climbs upward with `../` — i.e. exactly the form `hasContractImport`
 * above accepts, so following the suggestion always clears the finding.
 */
function suggestedContractSpecifier(storyFile, contract) {
  const expectedBase = contract.__file.replace(/\.ts$/, '');
  if (CONTRACTS_DIR_IS_MONOREPO) {
    return `@atelier-ui/spec/contracts/${expectedBase}`;
  }
  const rel = path
    .relative(path.dirname(storyFile), path.join(CONTRACTS_DIR, expectedBase))
    .split(path.sep)
    .join('/');
  return rel.startsWith('.') ? rel : `./${rel}`;
}

/** Reports [CONTRACT-IMPORT] when `name`'s contract exists but `storyFile`
 * neither imports it (see `hasContractImport`) nor sets `contract` in the
 * meta's `parameters`. No-op when `name` has no contract. Severity is decided
 * once, near `CONTRACTS_DIR` (`TAG_LEVEL['CONTRACT-IMPORT']`): error in this
 * repo (docs-block.ts renders the wiring), warning in a scaffold that doesn't
 * ship that block yet. */
function checkContractImport(fw, storyFile, source, name, contract) {
  if (!contract) return;
  const hasImport = hasContractImport(storyFile, source, contract);

  const metaBlock = extractMetaBlock(source);
  const paramsBody = metaBlock ? extractParamsBody(metaBlock) : null;
  const hasContractParam =
    paramsBody != null &&
    /(^|[{,\s])contract(\s*[,}]|\s*:|\s*$)/.test(paramsBody);

  if (!hasImport || !hasContractParam) {
    const suggestion = suggestedContractSpecifier(storyFile, contract);
    const suffix = CONTRACT_IMPORT_HAS_DOCS_BLOCK
      ? ''
      : ' (warning here: no docs-block.ts beside the contracts, so nothing renders the wiring yet)';
    report(
      'CONTRACT-IMPORT',
      fw,
      `${path.relative(ROOT, storyFile)}: ${name} has a contract but its story meta ` +
        `does not wire it in — add "import { contract } from '${suggestion}';" ` +
        `and set 'contract' in the meta's parameters.${suffix}`,
    );
  }
}

// --- Angular/Vue worker docgen, React's react-docgen parse(), and both
// frameworks' normalizers now live in ./lib/docgen.mjs (ADR-0121 §5 / S6(a)) —
// makeWorkerDocgen(fw, cwdRequire, ROOT), normalizeAngular, normalizeVue,
// makeReactDocgenTools(cwdRequire).reactParseFile, normalizeReactDocgen —
// shared with check-manifest-parity.mjs so the two scripts read one framework
// payload the same way.

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

const siblingRegistry = {
  angular: new Map(),
  react: new Map(),
  vue: new Map(),
};

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
      else if (
        entry.isFile() &&
        /\.(ts|tsx|vue)$/.test(entry.name) &&
        !/\.(spec|stories)\./.test(entry.name)
      ) {
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
  if (/\bboolean\b/.test(t) || literalArg === 'true' || literalArg === 'false')
    return { kind: 'boolean' };
  const segments = t
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s && s !== 'undefined' && s !== 'null');
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
        const classRe = new RegExp(
          `class\\s+${childName}\\b[\\s\\S]*?(?=\\n@Component|\\nexport class\\s|$)`,
        );
        const m = classRe.exec(src);
        if (!m) continue;
        const scoped = m[0];
        const propRe = new RegExp(
          `\\b${propName}\\s*=\\s*input(?:\\.required)?(?:<([^>]*)>)?\\(([^)]*)\\)`,
        );
        const pm = propRe.exec(scoped);
        if (!pm) return { exists: false };
        const generic = pm[1] || '';
        const arg = (pm[2] || '').trim();
        return { exists: true, ...classifyTypeText(generic, arg) };
      } else if (fw === 'vue') {
        if (
          !new RegExp(
            `defineOptions\\(\\s*\\{\\s*name:\\s*['"]${childName}['"]`,
          ).test(src)
        )
          continue;
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
        if (
          !new RegExp(
            `(?:function\\s+${childName}\\s*\\(|const\\s+${childName}\\s*=)`,
          ).test(src)
        )
          continue;
        const ifaceRe = new RegExp(
          `(?:interface|type)\\s+${childName}Props\\b[^{]*\\{([\\s\\S]*?)\\n\\}`,
        );
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
  if (resolved.kind === 'enum')
    return value === null ? true : (resolved.members || []).includes(value);
  return true; // 'other' kind: cannot verify statically, don't block on it
}

// ─── Story args (csf-tools) ─────────────────────────────────────────────────

function getStoryOwnObjectNode(csf, key) {
  const stmt = csf._storyStatements && csf._storyStatements[key];
  if (!stmt) return null;
  const varDecl = stmt.declaration || stmt;
  const decl = varDecl && varDecl.declarations && varDecl.declarations[0];
  let init = decl && decl.init;
  while (
    init &&
    (init.type === 'TSAsExpression' ||
      init.type === 'TSSatisfiesExpression' ||
      init.type === 'TSTypeAssertion')
  ) {
    init = init.expression;
  }
  return init && init.type === 'ObjectExpression' ? init : null;
}

function getOwnStoryKeys(csf, key) {
  const init = getStoryOwnObjectNode(csf, key);
  if (!init) return [];
  return init.properties
    .map((p) => (p.key && (p.key.name || p.key.value)) || null)
    .filter(Boolean);
}

/** The property names the story's OWN `args: {...}` object literal declares, or `null`
 * when the story has no own `args` object at all (R1b: "omits the prop entirely" means
 * either shape). Used only to decide whether a manifest DEFAULT value counts as covered —
 * never to resolve an actual value, which stays the resolver's job. */
function getOwnArgKeys(csf, key) {
  const init = getStoryOwnObjectNode(csf, key);
  if (!init) return null;
  const argsProp = init.properties.find(
    (p) =>
      !p.computed && p.key && (p.key.name === 'args' || p.key.value === 'args'),
  );
  if (
    !argsProp ||
    !argsProp.value ||
    argsProp.value.type !== 'ObjectExpression'
  )
    return null;
  return argsProp.value.properties
    .map((p) => (p.key && (p.key.name || p.key.value)) || null)
    .filter(Boolean);
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
      ? metaNode.properties.find(
          (p) =>
            !p.computed &&
            p.key &&
            (p.key.name === 'render' || p.key.value === 'render'),
        )
      : null;
  return metaRenderProp
    ? source.slice(metaRenderProp.start, metaRenderProp.end)
    : '';
}

/** One story's evidence blob: its own node range (from csf-tools), plus the meta's
 * `render` text when the story declares no `render` of its own. This is the scope R1a's
 * literal/object scans and the R1a forwarding check all share. */
function getStoryEvidenceBlob(csf, source, key, metaRenderText) {
  const stmt = csf._storyStatements && csf._storyStatements[key];
  if (!stmt) return '';
  let blob = source.slice(stmt.start, stmt.end);
  if (!getOwnStoryKeys(csf, key).includes('render') && metaRenderText)
    blob += `\n${metaRenderText}`;
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
  const arrayMapRe =
    /\[\s*((?:['"][\w-]+['"]\s*,?\s*)+)\]\s*(?:as const)?\s*\)?\s*\.map\(\s*(\w+)\s*=>/g;
  let m;
  while ((m = arrayMapRe.exec(text))) {
    const items = [...m[1].matchAll(/['"]([\w-]+)['"]/g)].map((x) => x[1]);
    const varName = escapeRegExp(m[2]);
    // Every attribute forwarding the loop variable verbatim is a candidate — not just
    // the first one in source order (a JSX `key={size}` list-key attribute routinely
    // precedes the real `size={size}` prop and would otherwise swallow the match).
    let usedRe;
    if (fw === 'react')
      usedRe = new RegExp(
        `\\b([A-Za-z_$][\\w-]*)\\s*=\\s*\\{\\s*${varName}\\s*\\}`,
        'g',
      );
    else if (fw === 'angular')
      usedRe = new RegExp(
        `\\[([A-Za-z_$][\\w-]*)\\]\\s*=\\s*"${varName}"`,
        'g',
      );
    else if (fw === 'vue')
      usedRe = new RegExp(`:([A-Za-z_$][\\w-]*)\\s*=\\s*"${varName}"`, 'g');
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
    const isForwardingDemo =
      isRenderOnlyDemo &&
      isForwardingRender(
        getStoryEvidenceBlob(csf, source, key, metaRenderText),
      );
    let resolved;
    try {
      resolved = resolver.resolve(key);
    } catch {
      continue;
    }
    if (resolved.unresolved && resolved.unresolved.length) {
      report(
        'UNRESOLVED-ARGS',
        fw,
        `${componentName}: story '${key}' has unresolved args`,
      );
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

function processComponent(
  fw,
  name,
  docgenResult,
  contract,
  contextDir,
  allClaims,
  sourceCoverage,
) {
  const master = snapshotBySelector.get(name);
  const docgenProps = docgenResult.props;
  const hasContract = !!contract;
  const hasSnapshot = !!master;

  if (!reachedByFw.has(name)) reachedByFw.set(name, new Set());
  reachedByFw.get(name).add(fw);

  if (hasSnapshot && !hasContract) {
    report(
      'CONTRACT-MISSING',
      fw,
      `${name}: docgen payload and snapshot master (${master.nodeId}) exist but no contract file`,
    );
  }
  if (hasContract && docgenProps.length === 0) {
    report(
      'DOCGEN-EMPTY',
      fw,
      `${name}: contract exists but the docgen payload has zero props`,
    );
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
    if (!axisMapByFigmaAxis.has(e.figmaAxis))
      axisMapByFigmaAxis.set(e.figmaAxis, []);
    axisMapByFigmaAxis.get(e.figmaAxis).push(e);
  }
  const axisMapCodeProps = new Set(
    ((contract && contract.axisMap) || []).map((e) => e.codeProp),
  );
  const codeOnlyNames = new Set(
    ((contract && contract.codeOnly) || []).map((e) => e.name),
  );

  const propByName = new Map(
    docgenProps.filter((p) => !p.isOutput).map((p) => [p.name, p]),
  );

  const enumCoverageTargets = []; // { propName, values: Set }
  const boolCoverageTargets = new Set(); // propName

  // ── AXIS ──
  if (hasSnapshot) {
    for (const [axisName, axisValues] of Object.entries(
      master.variantAxes || {},
    )) {
      if (figmaOnlyNames.has(axisName)) continue;
      const isStateAxis = axisName === 'state';
      const excluded = isStateAxis ? INTERACTION_STATE_VALUES : new Set();
      const valuesToCheck = axisValues.filter((v) => !excluded.has(v));
      const mapEntries = axisMapByFigmaAxis.get(axisName) || [];

      if (mapEntries.length > 0) {
        const covered = new Set();
        for (const entry of mapEntries) {
          const resolved = resolveCodeProp(
            fw,
            entry.codeProp,
            propByName,
            contextDir,
          );
          if (!resolved.exists) {
            report(
              'AXIS',
              fw,
              `${name}: axisMap ${axisName} -> ${entry.codeProp} — code prop not found`,
            );
            continue;
          }
          if (entry.values) {
            for (const [figVal, codeVal] of Object.entries(entry.values)) {
              covered.add(figVal);
              if (!isMemberOfType(codeVal, resolved)) {
                report(
                  'AXIS',
                  fw,
                  `${name}: axisMap ${axisName}=${figVal} -> ${entry.codeProp} value ${JSON.stringify(codeVal)} is not a member of the prop's type`,
                );
              }
            }
            if (!entry.codeProp.includes('.')) {
              if (resolved.kind === 'boolean')
                boolCoverageTargets.add(entry.codeProp);
              else if (resolved.kind === 'enum') {
                enumCoverageTargets.push({
                  propName: entry.codeProp,
                  values: new Set(Object.values(entry.values)),
                  default:
                    propByName.get(entry.codeProp) &&
                    propByName.get(entry.codeProp).default,
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
                    missing,
                  )}, extra ${JSON.stringify(extra)}`,
                );
              }
            }
            if (!entry.codeProp.includes('.')) {
              if (resolved.kind === 'boolean')
                boolCoverageTargets.add(entry.codeProp);
              else if (resolved.kind === 'enum') {
                enumCoverageTargets.push({
                  propName: entry.codeProp,
                  values: new Set(resolved.members || []),
                  default:
                    propByName.get(entry.codeProp) &&
                    propByName.get(entry.codeProp).default,
                });
              }
            }
          }
        }
        for (const v of valuesToCheck)
          if (stateValueExemptions.has(v)) covered.add(v);
        const missing = valuesToCheck.filter((v) => !covered.has(v));
        if (missing.length) {
          report(
            'AXIS',
            fw,
            `${name}: axis '${axisName}' values not covered by axisMap or figmaOnly: ${missing.join(', ')}`,
          );
        }
      } else if (isStateAxis) {
        const missing = valuesToCheck.filter(
          (v) => !stateValueExemptions.has(v),
        );
        if (missing.length) {
          report(
            'AXIS',
            fw,
            `${name}: 'state' axis values not covered by axisMap or figmaOnly: ${missing.join(', ')}`,
          );
        }
      } else {
        const prop = propByName.get(axisName);
        if (!prop) {
          report(
            'AXIS',
            fw,
            `${name}: no manifest prop named '${axisName}' for snapshot axis '${axisName}'`,
          );
        } else if (prop.kind !== 'enum' || !prop.members) {
          report(
            'AXIS',
            fw,
            `${name}: manifest prop '${axisName}' is not an enum (kind=${prop.kind})`,
          );
        } else {
          const propSet = new Set(prop.members);
          const axisSet = new Set(axisValues);
          const missing = axisValues.filter((v) => !propSet.has(v));
          const extra = prop.members.filter((v) => !axisSet.has(v));
          if (missing.length || extra.length) {
            report(
              'AXIS',
              fw,
              `${name}: axis '${axisName}' ≠ prop '${axisName}' — missing ${JSON.stringify(missing)}, extra ${JSON.stringify(extra)}`,
            );
          }
          enumCoverageTargets.push({
            propName: axisName,
            values: new Set(prop.members),
            default: prop.default,
          });
        }
      }
    }

    // ── BOOLEAN ──
    for (const [rawName, kind] of Object.entries(master.properties || {})) {
      if (kind !== 'BOOLEAN') continue;
      const propName = stripId(rawName);
      if (figmaOnlyNames.has(propName)) continue;
      if (
        axisMapCodeProps.has(propName) ||
        ((contract && contract.axisMap) || []).some(
          (e) => e.figmaAxis === propName,
        )
      )
        continue;
      const prop = propByName.get(propName);
      if (!prop || prop.kind !== 'boolean') {
        report(
          'BOOLEAN',
          fw,
          `${name}: snapshot BOOLEAN '${propName}' has no matching boolean manifest prop`,
        );
      } else {
        boolCoverageTargets.add(propName);
      }
      // R3: a figmaOnly entry claiming this same name is pointless if it DOES match.
      if (figmaOnlyNames.has(propName) && prop && prop.kind === 'boolean') {
        report(
          'STALE-EXEMPTION',
          fw,
          `${name}: figmaOnly '${propName}' — a compatible boolean manifest prop exists; the exemption suppresses nothing`,
        );
      }
    }
  }

  // ── ENUM-UNDRAWN (R1c: only for components with a snapshot master) ──
  if (!hasSnapshot) {
    report(
      'NO-MASTER',
      fw,
      `${name}: docgen payload exists but no snapshot master in tools/figma/snapshot.json — nothing to compare against Figma; ENUM-UNDRAWN and coverage skipped`,
    );
  } else {
    const axisNames = new Set(Object.keys(master.variantAxes || {}));
    for (const prop of docgenProps) {
      if (prop.isOutput) continue;
      if (prop.kind !== 'enum' || !prop.members || prop.members.length < 2)
        continue;
      if (axisNames.has(prop.name)) continue;
      if (axisMapCodeProps.has(prop.name)) continue;
      if (codeOnlyNames.has(prop.name)) continue;
      report(
        'ENUM-UNDRAWN',
        fw,
        `${name}: manifest prop '${prop.name}' (enum: ${prop.members.join('|')}) has no snapshot axis, axisMap or codeOnly entry`,
      );
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
      const equal =
        propSet.size === axisSet.size &&
        [...axisSet].every((v) => propSet.has(v));
      if (equal) {
        report(
          'STALE-EXEMPTION',
          fw,
          `${name}: figmaOnly '${axisName}' — a verbatim-matching enum manifest prop exists; the exemption suppresses nothing`,
        );
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
      allClaims.some(
        (c) => c.ownArgKeys === null || !c.ownArgKeys.includes(target.propName),
      );
    const missing = [...target.values].filter((v) => {
      if (
        allClaims.some(
          (c) =>
            Object.prototype.hasOwnProperty.call(c.values, target.propName) &&
            c.values[target.propName] === v,
        )
      ) {
        return false;
      }
      if (srcCovered && srcCovered.has(String(v))) return false;
      if (defaultOmittedSomewhere && v === target.default) return false;
      return true;
    });
    if (missing.length) {
      report(
        'COVERAGE',
        fw,
        `${name}: prop '${target.propName}' — no story sets value(s) ${JSON.stringify(missing)}`,
      );
    }
  }
  for (const propName of boolCoverageTargets) {
    const observed = allClaims.some((c) => c.values[propName] === true);
    if (!observed) {
      report(
        'COVERAGE-BOOL',
        fw,
        `${name}: boolean prop '${propName}' is never true in any story`,
      );
    }
  }

  // ── codeOnly staleness (R1d: cross-framework — tracked here, evaluated once after
  //    every requested framework has run, in runCodeOnlyStalenessChecks()) ──
  for (const entry of (contract && contract.codeOnly) || []) {
    const present =
      propByName.has(entry.name) ||
      docgenProps.some((p) => p.isOutput && p.name === entry.name);
    if (!present) continue;
    if (!codeOnlyPresentByFw.has(name))
      codeOnlyPresentByFw.set(name, new Map());
    const byEntry = codeOnlyPresentByFw.get(name);
    if (!byEntry.has(entry.name)) byEntry.set(entry.name, new Set());
    byEntry.get(entry.name).add(fw);
  }
}

// ─── Per-framework orchestration ───────────────────────────────────────────

async function runFramework(fw) {
  const t0 = performance.now();
  const storyFiles = findStoryFiles(fw, { root: ROOT, storiesDirs: STORIES_DIRS });
  const workerDocgen = fw !== 'react' ? await makeWorkerDocgen(fw, cwdRequire, ROOT) : null;

  const byComponent = new Map(); // name -> { docgenResult, contextDir, files: [csf...] }
  const reachedMeta = new Set();
  let noComponentCount = 0;
  let externalCount = 0;
  let docgenFailedCount = 0;

  // Snapshotted BEFORE the story loop (rather than after it, where this used
  // to sit) so the per-framework `warnings:`/`errors:` delta printed below
  // covers EVERYTHING this framework's run reports — the story loop's own
  // CONTRACT-IMPORT and [DOCGEN-FAILED] findings, and the [ROSTER] check
  // right after it, not just the later per-component / NO-STORY-META passes.
  // A snapshot taken after the loop silently excluded exactly the findings
  // this change exists to surface — the summary line would print `errors: 0`
  // for a framework mid docgen-blackout while the run total said otherwise.
  const errorsBefore = findings.filter((f) => f.level === 'error').length;
  const warningsBefore = findings.filter((f) => f.level === 'warning').length;

  for (const storyFile of storyFiles) {
    const source = fs.readFileSync(storyFile, 'utf-8');
    let csf;
    try {
      csf = loadCsf(source, {
        makeTitle: (t) => t,
        fileName: storyFile,
      }).parse();
    } catch (e) {
      console.error(
        `  ! ${path.relative(ROOT, storyFile)}: csf-tools failed to parse (${e.message})`,
      );
      continue;
    }
    const metaComponent =
      typeof csf._meta.component === 'string' ? csf._meta.component : null;
    if (!metaComponent) {
      noComponentCount++;
      continue;
    }

    // A component imported from an installed PACKAGE (a real scaffold's
    // `@atelier-ui/<fw>`, not this monorepo's tsconfig path alias of the same
    // name — that alias has no `node_modules` entry and so never matches
    // here) gets skipped before any docgen call, uniformly across all three
    // frameworks. Left to each engine's own accident, the three frameworks
    // disagree on what "can't read into node_modules" means: React's relative-
    // path-only resolver and Vue's worker both simply return nothing for a
    // bare specifier, but Angular's worker (`angular-component-meta` over a
    // real TS program) happily follows the import into the package's `.d.ts`
    // and returns a real, nameful payload with zero inputs/outputs — which
    // this script would otherwise mistake for a workspace component with no
    // props and fail on ([DOCGEN-EMPTY], [AXIS], [BOOLEAN], ...). Skipping the
    // call here — rather than filtering its result afterwards — is what makes
    // the scaffold's promise ("local docgen cannot read into node_modules, so
    // the check has nothing to compare and reports only [NO-STORY-META]")
    // actually true for Angular too, by construction, instead of by luck.
    if (findExternalPackageDir(storyFile, csf._rawComponentPath)) {
      externalCount++;
      continue;
    }

    let docgenResult = null;
    let docgenFailed = false;
    const contextDir = path.dirname(storyFile);

    if (fw === 'react') {
      const rawPath = csf._rawComponentPath;
      const spec = csf._componentImportSpecifier;
      const localName = spec && spec.local && spec.local.name;
      if (rawPath && localName) {
        const componentFile = resolveWithExtensions(
          path.resolve(contextDir, rawPath),
        );
        if (componentFile) {
          try {
            const docgens = reactParseFile(componentFile);
            for (const d of docgens)
              registerSibling(fw, d.displayName, normalizeReactDocgen(d));
            const match =
              docgens.find((d) => d.displayName === localName) ||
              docgens.find((d) => d.displayName === metaComponent);
            if (match) {
              docgenResult = {
                name: match.displayName,
                props: normalizeReactDocgen(match),
                description: match.description,
                slots: undefined,
              };
            }
          } catch (e) {
            docgenFailed = true;
            docgenFailedCount++;
            report(
              'DOCGEN-FAILED',
              fw,
              `${path.relative(ROOT, storyFile)}: react-docgen failed — ${errorMessage(e)}`,
            );
          }
        }
      }
    } else {
      const result = await workerDocgen(storyFile, csf);
      if (result.ok) {
        const payload = result.payload;
        const normalized =
          fw === 'angular' ? normalizeAngular(payload) : normalizeVue(payload);
        docgenResult = {
          name: payload.name,
          props: normalized.props,
          description: normalized.description,
          slots: normalized.slots,
        };
        registerSibling(fw, payload.name, normalized.props);
      } else {
        docgenFailed = true;
        docgenFailedCount++;
        report(
          'DOCGEN-FAILED',
          fw,
          `${path.relative(ROOT, storyFile)}: ${fw} docgen failed — ${result.reason}`,
        );
      }
    }

    if (!docgenResult) {
      // A docgen FAILURE (provider threw / empty payload / payload.error, or
      // react-docgen threw — reported as [DOCGEN-FAILED] just above) is kept
      // OUT of noComponentCount on purpose: this story file DID have a
      // resolvable meta.component, so it is still "measurable" for the
      // [ROSTER] check below. Folding it into noComponentCount is exactly
      // the ADR-0124 bug — it let a broken docgen worker shrink the roster
      // instead of showing up as a hole in it.
      if (!docgenFailed) noComponentCount++;
      continue;
    }

    reachedMeta.add(docgenResult.name);
    checkContractImport(
      fw,
      storyFile,
      source,
      docgenResult.name,
      contractsBySelector.get(docgenResult.name),
    );
    let entry = byComponent.get(docgenResult.name);
    if (!entry) {
      entry = { docgenResult, contextDir, files: [] };
      byComponent.set(docgenResult.name, entry);
    }
    entry.files.push({ storyFile, csf, source });
  }

  // [ROSTER]: `measurable` is every story file that COULD have contributed a
  // component — everything except a story with no meta.component at all
  // (noComponentCount) and a deliberately-skipped external-package import
  // (externalCount, see the comment above the findExternalPackageDir() call).
  // Subtracting externalCount before the floor is what keeps a scaffolded
  // one-framework workspace — whose only story imports from
  // `@atelier-ui/<fw>` — at measurable === 0 and therefore silent here,
  // exactly as that comment promises ("the check has nothing to compare and
  // reports only [NO-STORY-META]"). If there WAS something measurable and
  // byComponent still ended up empty, docgen measured nothing this run.
  const measurable = storyFiles.length - noComponentCount - externalCount;
  if (measurable > 0 && byComponent.size === 0) {
    report(
      'ROSTER',
      fw,
      `${fw}: ${measurable} of ${storyFiles.length} story file(s) were measurable ` +
        `(${noComponentCount} no-component, ${externalCount} external) but docgen produced 0 component(s) — the gate measured nothing`,
    );
  }

  for (const [name, entry] of byComponent) {
    const contract = contractsBySelector.get(name);
    const allClaims = entry.files.flatMap(({ csf, source }) =>
      collectStoryClaims(csf, fw, name, source),
    );
    const sourceCoverage = buildSourceCoverage(fw, entry.files);
    processComponent(
      fw,
      name,
      entry.docgenResult,
      contract,
      entry.contextDir,
      allClaims,
      sourceCoverage,
    );

    if (args.report) {
      console.log(
        `  ok  ${name} (props: ${entry.docgenResult.props.length}, stories: ${entry.files.reduce((n, f) => n + Object.keys(f.csf._stories || {}).length, 0)})`,
      );
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
          events: events.map((e) => ({
            name: e.name,
            type: e.typeText,
            description: e.description,
          })),
          slots: entry.docgenResult.slots,
        },
        metadata: { name, description: entry.docgenResult.description },
        tokens: { usedTokens: scanCssTokens(entry.contextDir) },
      };
      const outDir = path.join(path.resolve(args.emit), fw);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(
        path.join(outDir, `${name}.codespec.json`),
        JSON.stringify(codeSpec, null, 2),
      );
    }
  }

  // ── NO-STORY-META (R5) ──
  for (const selector of contractsBySelector.keys()) {
    if (reachedMeta.has(selector)) continue;
    if (!snapshotBySelector.has(selector)) continue; // CONTRACT-ORPHAN already covers this
    report(
      'NO-STORY-META',
      fw,
      `${selector}: has a contract and a snapshot master, but no story file's meta.component resolves to it in ${fw}`,
    );
  }

  const t1 = performance.now();
  const errorsAfter = findings.filter((f) => f.level === 'error').length;
  const warningsAfter = findings.filter((f) => f.level === 'warning').length;
  console.log(
    `[${fw}] components: ${byComponent.size}, contracts: ${contractsBySelector.size}, stories: ${storyFiles.length} ` +
      `(no-component: ${noComponentCount}, external: ${externalCount}, docgen-failed: ${docgenFailedCount}), warnings: ${warningsAfter - warningsBefore}, errors: ${errorsAfter - errorsBefore}, ${(t1 - t0).toFixed(0)} ms`,
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
      const present =
        (codeOnlyPresentByFw.get(selector) || new Map()).get(entry.name) ||
        new Set();
      const absent = [...reached].filter((fw) => !present.has(fw)).sort();
      if (absent.length === 0) continue;
      if (singleFwRun) {
        report(
          'FW-ONLY',
          absent[0],
          `${selector}: codeOnly '${entry.name}' names a prop not in the manifest — single-framework run (--fw ${targetFrameworks[0]}), cannot confirm cross-framework presence; downgraded from STALE-EXEMPTION`,
        );
      } else if (absent.length === reached.size) {
        report(
          'STALE-EXEMPTION',
          null,
          `${selector}: codeOnly '${entry.name}' names a prop no longer in any framework's manifest (checked: ${[...reached].sort().join(', ')})`,
        );
      } else {
        report(
          'FW-ONLY',
          null,
          `${selector}: codeOnly '${entry.name}' missing from ${absent.join(', ')} — present in the other framework(s) (ADR-0093 territory)`,
        );
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
