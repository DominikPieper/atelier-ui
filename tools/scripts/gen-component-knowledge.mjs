#!/usr/bin/env node
/**
 * gen-component-knowledge.mjs
 *
 * Generates docs/public/.well-known/components/<slug>.json (one per docs
 * component that has metadata) plus components/index.json.
 *
 * Why this exists: an agent that reaches for a component needs, in one place,
 * what it is for, which rules apply, HOW STRONGLY, and HOW EACH RULE IS
 * VERIFIED, plus where Figma and code differ on purpose. The repo already owns
 * every one of those facts — in the metadata module, behaviors.json + the
 * covers() tests, the Figma contract and the token manifest — but in four
 * places, in four formats. This file JOINS them. It is a projection, never a
 * source: nothing here is hand-written, every value traces to an owner file
 * (listed per file under `provenance.sources`), and the owner is edited, never
 * the output. Same idiom as gen-cookbook-manifest.mjs: one source → projection
 * → `--check` gate. Shaped after DSDS (designsystemdocspec.org: rules with a
 * level, an audience and how they are checked; point at the owning format
 * instead of restating it), but deliberately smaller and our own.
 *
 * Output schema (version "1"), one file per component:
 *   {
 *     "version": "1",
 *     "slug": "button",                       // docs slug
 *     "name": "AtlButton",                    // primary spec minus "Spec"
 *     "url": "https://atelier.pieper.io/components/button",
 *     "specs": ["AtlButtonSpec"],             // metadata.specNames
 *     "purpose": "...",                       // metadata.purpose
 *     "rules": [
 *       {
 *         "id": "disabled-state",             // behaviours only (behaviors.json id)
 *         "level": "must" | "should" | "should-not",
 *         "statement": "...",
 *         "useInstead": "...",                // should-not only: metadata useInstead, verbatim
 *         "alternatives": ["toggle"],         // should-not only: slugs of Atl* names found in
 *                                             //   useInstead; omitted when none is recognisable
 *         "source": "libs/spec/src/metadata/button.metadata.ts",
 *         "verifiedBy": "test" | "none",
 *         "checks": [                         // verifiedBy "test": one per bound test
 *           { "framework": "angular", "file": "libs/angular/src/lib/button/atl-button.spec.ts",
 *             "test": "<title string of the covers(...)(title, fn) call>" }
 *         ]
 *       }
 *     ],
 *     "accessibility": { ...metadata.accessibility, verbatim },
 *     "related": [{ "spec": "AtlToggleSpec", "slug": "toggle" }],  // slug omitted if unresolved
 *     "figma": {
 *       "fileKey": "...",                     // tools/figma/snapshot.json meta.fileKey
 *       "masters": [{                         // one per contract that belongs to the unit
 *         "component": "AtlButton", "nodeId": "129:20", "url": "https://www.figma.com/design/...",
 *         "contract": "libs/spec/src/contracts/button.contract.ts",
 *         "mismatches": [{ "kind": "figmaOnly" | "codeOnly" | "impliesBoolean" | "axisMap" | "probes",
 *                          "name": "...", "reason": "...", ...kind fields }]
 *       }]
 *     },
 *     "api": {                                // pointers only; the framework manifests own prop tables
 *       "storybookMcp": { "angular": "https://.../storybook-angular/mcp", ... },
 *       "docsId": { "angular": "components-inputs-atlbutton", ... }   // from the story `title`
 *     },
 *     "tokens": [{ "name": "--ui-...", "intent": "...", "constraints": [...],
 *                  "source": "libs/styles/src/tokens.css" }],   // referenced by the unit's stylesheets; no values
 *     "provenance": { "generatedBy": "tools/scripts/gen-component-knowledge.mjs", "sources": [...] }
 *   }
 *
 * Policy defaults (the data carries none of these; they are this script's
 * mapping, so change them here, not in the output):
 *   - metadata.whenToUse      → level "should",     verifiedBy "none"
 *   - metadata.antiPatterns   → level "should-not", verifiedBy "none"
 *   - behaviors.json entries  → level "must",       verifiedBy "test" (or "none"
 *     if no live covers() call is found, so a claim is never made untraced)
 *   - nothing is marked verified for the a11y role: no test is bound to it.
 *
 * index.json: { version, site, generatedBy, components: [{slug, name, url}],
 *               missing: [{slug, reason}] }. Components without a metadata file
 * (toast, code-block) are SKIPPED and listed under `missing`: with no purpose,
 * rules or a11y facts they would be a hollow file, and filling them from the
 * hand-written docs data would break "one owner per fact".
 *
 * Usage:
 *   node tools/scripts/gen-component-knowledge.mjs           # write files
 *   node tools/scripts/gen-component-knowledge.mjs --check   # exit 1 on drift or stale files (CI)
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  unlinkSync,
} from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { findBinderBindings } from '../parity/behavior-coverage.mjs';

const require = createRequire(import.meta.url);
const { parseExportedVars } = require('./lib/ts-eval.js');
const { maps, keyedSpecs, componentNameOf } = require('./lib/component-map.js');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = resolve(ROOT, 'docs/public/.well-known/components');
const GENERATED_BY = 'tools/scripts/gen-component-knowledge.mjs';
const SITE_URL = 'https://atelier.pieper.io';
const SCHEMA_VERSION = '1';

const rel = (p) => relative(ROOT, p).split('\\').join('/');
const abs = (p) => resolve(ROOT, p);

const FRAMEWORKS = ['angular', 'react', 'vue'];
const TOKENS_CSS = 'libs/styles/src/tokens.css';
const TOKENS_MANIFEST = 'libs/spec/src/tokens.manifest.ts';
const SNAPSHOT = 'tools/figma/snapshot.json';
const BEHAVIORS = 'libs/spec/src/behaviors.json';
const METADATA_DIR = 'libs/spec/src/metadata';
const CONTRACT_DIR = 'libs/spec/src/contracts';

const uniqSorted = (xs) => [...new Set(xs)].sort();
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// ---------------------------------------------------------------------------
// Load the owners.
// ---------------------------------------------------------------------------

const { registry, docsPrimary, subcomponentParents } = maps();
const EXTRA_DIRS = keyedSpecs(); // spec -> adapter directory / metadata module
const behaviors = JSON.parse(readFileSync(abs(BEHAVIORS), 'utf-8'));
const behaviorConfig = (
  await import(pathToFileURL(abs('tools/parity/behavior.config.mjs')).href)
).default;
const tokenManifest = parseExportedVars(abs(TOKENS_MANIFEST)).tokens;
const fileKey = JSON.parse(readFileSync(abs(SNAPSHOT), 'utf-8')).meta.fileKey;
const docsSlugs = uniqSorted(
  Object.values(
    parseExportedVars(abs('docs/src/data/components.ts')).COMPONENT_CATEGORIES,
  ).flat(),
);

// metadata module (registry value) -> docs slug, via the primary spec.
const moduleToSlug = {};
for (const [spec, slug] of Object.entries(docsPrimary)) {
  if (registry[spec]) moduleToSlug[registry[spec]] = slug;
}

// Atl<Name> -> docs slug, for resolving names found in prose and spec lists.
const nameToSlug = {};
for (const [spec, mod] of Object.entries(registry)) {
  if (moduleToSlug[mod]) nameToSlug[componentNameOf(spec)] = moduleToSlug[mod];
}
for (const [spec, slug] of Object.entries(docsPrimary)) {
  nameToSlug[spec.replace(/(Spec|Options)$/, '')] = slug;
}
for (const [child, parent] of Object.entries(subcomponentParents)) {
  if (!nameToSlug[child] && nameToSlug[parent])
    nameToSlug[child] = nameToSlug[parent];
}

// ---------------------------------------------------------------------------
// Contracts: contract file -> owning slug.
// ---------------------------------------------------------------------------

function loadContracts() {
  return readdirSync(abs(CONTRACT_DIR))
    .filter((f) => f.endsWith('.contract.ts'))
    .sort()
    .map((f) => {
      const file = `${CONTRACT_DIR}/${f}`;
      return { file, contract: parseExportedVars(abs(file)).contract };
    });
}

function slugOfContract(component) {
  if (nameToSlug[component]) return nameToSlug[component];
  // Last resort for sub-parts no map names (AtlChatTyping): the longest known
  // component name that prefixes it.
  const prefix = Object.keys(nameToSlug)
    .filter((n) => component.startsWith(n))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? nameToSlug[prefix] : undefined;
}

const figmaUrl = (nodeId) =>
  `https://www.figma.com/design/${fileKey}?node-id=${nodeId.replace(':', '-')}`;

function mismatchesOf(c) {
  const out = [];
  const add = (kind, name, reason, extra = {}) =>
    out.push({ kind, name, ...extra, reason });
  for (const e of c.figmaOnly ?? []) add('figmaOnly', e.name, e.reason);
  for (const e of c.codeOnly ?? []) add('codeOnly', e.name, e.reason);
  for (const e of c.impliesBoolean ?? [])
    add('impliesBoolean', e.codeProp, e.reason, {
      figmaBoolean: e.figmaBoolean,
    });
  for (const e of c.axisMap ?? [])
    add('axisMap', e.figmaAxis, e.reason, {
      codeProp: e.codeProp,
      ...(e.values ? { values: e.values } : {}),
    });
  for (const e of c.probes ?? [])
    add('probes', e.part, e.reason, { selector: e.selector });
  return out;
}

// ---------------------------------------------------------------------------
// Per-unit builders.
// ---------------------------------------------------------------------------

/** Adapter/stylesheet directories that belong to the unit. */
function unitDirs(slug, specNames) {
  const dirs = [slug];
  for (const s of specNames) if (EXTRA_DIRS[s]) dirs.push(EXTRA_DIRS[s]);
  return uniqSorted(dirs);
}

function buildRules(slug, md, mdFile, dirs, sources) {
  const rules = [];
  for (const statement of md.whenToUse) {
    rules.push({
      level: 'should',
      statement,
      source: mdFile,
      verifiedBy: 'none',
      checks: [],
    });
  }
  for (const ap of md.antiPatterns) {
    const alts = uniqSorted(
      (ap.useInstead.match(/\bAtl[A-Z][A-Za-z]*/g) ?? [])
        .map((n) => nameToSlug[n])
        .filter((s) => s && s !== slug),
    );
    rules.push({
      level: 'should-not',
      statement: ap.pattern,
      useInstead: ap.useInstead,
      ...(alts.length ? { alternatives: alts } : {}),
      source: mdFile,
      verifiedBy: 'none',
      checks: [],
    });
  }

  const subjects = dirs.filter((d) => behaviors[d]);
  for (const subject of subjects) {
    // Every live covers(subject, id)(title, fn) binding, per framework.
    const bound = {};
    for (const fw of FRAMEWORKS) {
      const dir = abs(
        behaviorConfig.implementations[fw].replace('{subject}', subject),
      );
      if (!existsSync(dir)) continue;
      for (const f of readdirSync(dir).filter((n) =>
        behaviorConfig.filePattern.test(n),
      )) {
        for (const b of findBinderBindings(
          join(dir, f),
          behaviorConfig.binder,
        )) {
          if (b.subject !== subject) continue;
          (bound[b.id] ??= []).push({
            framework: fw,
            file: rel(join(dir, f)),
            test: b.title,
          });
        }
      }
    }
    for (const { id, describe } of behaviors[subject]) {
      const checks = (bound[id] ?? []).sort(
        (a, b) =>
          cmp(a.framework, b.framework) ||
          cmp(a.file, b.file) ||
          cmp(a.test, b.test),
      );
      checks.forEach((c) => sources.add(c.file));
      rules.push({
        id,
        level: 'must',
        statement: describe,
        source: BEHAVIORS,
        verifiedBy: checks.length ? 'test' : 'none',
        checks,
      });
    }
  }
  return rules;
}

/** `title:` of the story file(s) in libs/<fw>/src/lib/<slug>/ ending in the primary name. */
function docsIds(slug, name, sources) {
  const ids = {};
  for (const fw of FRAMEWORKS) {
    const dir = abs(`libs/${fw}/src/lib/${slug}`);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) {
      if (!/\.stories\.tsx?$/.test(f)) continue;
      const text = readFileSync(join(dir, f), 'utf-8');
      const m = [...text.matchAll(/\btitle:\s*'([^']+)'/g)]
        .map((x) => x[1])
        .find((t) => t.split('/').pop() === name);
      if (m) {
        ids[fw] = m.toLowerCase().replace(/\//g, '-');
        sources.add(rel(join(dir, f)));
        break;
      }
    }
  }
  return ids;
}

function buildTokens(dirs, sources) {
  const names = new Set();
  for (const d of dirs) {
    const dir = abs(`libs/styles/src/${d}`);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.css'))) {
      sources.add(rel(join(dir, f)));
      const css = readFileSync(join(dir, f), 'utf-8');
      for (const m of css.matchAll(/var\(\s*(--ui-[\w-]+)/g)) names.add(m[1]);
    }
  }
  // Only tokens the manifest annotates: component-local custom properties
  // (declared and consumed inside one stylesheet) have no manifest entry.
  return [...names]
    .filter((n) => tokenManifest[n])
    .sort()
    .map((name) => ({
      name,
      intent: tokenManifest[name].intent,
      constraints: tokenManifest[name].constraints,
      source: TOKENS_CSS,
    }));
}

function buildUnit(slug, primarySpec, contracts) {
  const mdModule = registry[primarySpec];
  const mdFile = `${METADATA_DIR}/${mdModule}.metadata.ts`;
  const md = parseExportedVars(abs(mdFile)).metadata;
  const sources = new Set([mdFile]);
  const name = componentNameOf(primarySpec);
  const dirs = unitDirs(slug, md.specNames);

  const rules = buildRules(slug, md, mdFile, dirs, sources);
  if (rules.some((r) => r.id)) sources.add(BEHAVIORS);

  const masters = contracts
    .filter((c) => slugOfContract(c.contract.component) === slug)
    .map((c) => {
      sources.add(c.file);
      return {
        component: c.contract.component,
        nodeId: c.contract.figmaNodeId,
        url: figmaUrl(c.contract.figmaNodeId),
        contract: c.file,
        mismatches: mismatchesOf(c.contract),
      };
    })
    .sort(
      (a, b) =>
        (b.component === name) - (a.component === name) ||
        cmp(a.component, b.component),
    );
  if (masters.length) sources.add(SNAPSHOT);

  const tokens = buildTokens(dirs, sources);
  if (tokens.length) {
    sources.add(TOKENS_MANIFEST);
    sources.add(TOKENS_CSS);
  }

  const docsId = docsIds(slug, name, sources);

  return {
    version: SCHEMA_VERSION,
    slug,
    name,
    url: `${SITE_URL}/components/${slug}`,
    specs: md.specNames,
    purpose: md.purpose,
    rules,
    accessibility: md.accessibility,
    related: md.relatedComponents
      .map((spec) => {
        const s = nameToSlug[spec.replace(/(Spec|Options)$/, '')];
        return s ? { spec, slug: s } : { spec };
      })
      .sort((a, b) => cmp(a.spec, b.spec)),
    figma: { fileKey, masters },
    api: {
      storybookMcp: Object.fromEntries(
        FRAMEWORKS.map((fw) => [fw, `${SITE_URL}/storybook-${fw}/mcp`]),
      ),
      docsId,
    },
    tokens,
    provenance: { generatedBy: GENERATED_BY, sources: [...sources].sort() },
  };
}

// ---------------------------------------------------------------------------
// Build, serialize, write / check.
// ---------------------------------------------------------------------------

function buildAll() {
  const contracts = loadContracts();
  const files = new Map();
  const components = [];
  const missing = [];
  const primaryBySlug = Object.fromEntries(
    Object.entries(docsPrimary).map(([spec, slug]) => [slug, spec]),
  );
  for (const slug of docsSlugs) {
    const spec = primaryBySlug[slug];
    if (!spec || !registry[spec]) {
      missing.push({
        slug,
        reason:
          'no metadata file (not in COMPONENT_METADATA_REGISTRY): no purpose, rules or accessibility facts to project',
      });
      continue;
    }
    const unit = buildUnit(slug, spec, contracts);
    assertProse(slug, unit);
    files.set(`${slug}.json`, unit);
    components.push({
      slug,
      name: unit.name,
      url: `${SITE_URL}/.well-known/components/${slug}.json`,
    });
  }
  files.set('index.json', {
    version: SCHEMA_VERSION,
    site: SITE_URL,
    generatedBy: GENERATED_BY,
    components,
    missing,
  });
  return files;
}

/** A prose field that evaluated to null is a source this static reader cannot
 *  read; fail loudly rather than project a hole. */
function assertProse(slug, unit) {
  const bad = [];
  const need = (v, where) => (typeof v === 'string' && v ? 0 : bad.push(where));
  need(unit.purpose, 'purpose');
  unit.rules.forEach((r, i) => need(r.statement, `rules[${i}].statement`));
  unit.figma.masters.forEach((m) =>
    m.mismatches.forEach((x) =>
      need(x.reason, `${m.component} ${x.kind} ${x.name} reason`),
    ),
  );
  unit.tokens.forEach((t) => need(t.intent, `${t.name} intent`));
  if (bad.length)
    throw new Error(`${slug}: not statically evaluable: ${bad.join(', ')}`);
}

const serialize = (o) => JSON.stringify(o, null, 2) + '\n';

function main() {
  const check = process.argv.includes('--check');
  const out = new Map(
    [...buildAll()].map(([name, obj]) => [name, serialize(obj)]),
  );
  const onDisk = existsSync(OUT_DIR)
    ? readdirSync(OUT_DIR).filter((f) => f.endsWith('.json'))
    : [];
  const stale = onDisk.filter((f) => !out.has(f));

  if (check) {
    const problems = [];
    for (const [name, text] of out) {
      const p = join(OUT_DIR, name);
      if (!existsSync(p)) problems.push(`missing: ${name}`);
      else if (readFileSync(p, 'utf-8') !== text)
        problems.push(`drift: ${name}`);
    }
    for (const f of stale) problems.push(`stale (no source): ${f}`);
    // Anything that is not a generated .json is a stray too.
    for (const f of existsSync(OUT_DIR) ? readdirSync(OUT_DIR) : []) {
      if (!f.endsWith('.json')) problems.push(`stale (no source): ${f}`);
    }
    if (problems.length) {
      problems.forEach((p) => console.error(`✗ ${p}`));
      console.error(
        'Component knowledge is out of date. Run `npm run gen:knowledge`.',
      );
      process.exit(1);
    }
    console.log(`Component knowledge OK (${out.size - 1} components + index).`);
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  for (const f of stale) unlinkSync(join(OUT_DIR, f));
  for (const [name, text] of out) writeFileSync(join(OUT_DIR, name), text);
  console.log(
    `Wrote ${out.size} files to ${rel(OUT_DIR)} (${out.size - 1} components + index, ${stale.length} stale removed).`,
  );
}

main();
