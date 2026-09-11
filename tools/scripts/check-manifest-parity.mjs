#!/usr/bin/env node
/**
 * check-manifest-parity.mjs — ADR-0121 Decision 5 / S6(a): "cross-framework
 * parity is a diff of the three manifests" — no longer keyed on
 * `libs/spec/src/index.ts`.
 *
 * check-prop-surface.js (check:props, ADR-0093) compares each framework's OWN
 * declared prop surface against its `Atl<X>Spec` interface — it can only see a
 * cross-framework divergence that the spec is a party to. This gate instead
 * diffs the three frameworks' Storybook docgen manifests against EACH OTHER,
 * for every component reachable in at least two of them, so a divergence the
 * spec never modelled (Vue's dialog hardcoding its own `headerId` — ADR-0093
 * Consequences) is visible even though there is nothing to key it against.
 *
 * Docgen recipe (Angular/Vue worker, React's own react-docgen, story-file ->
 * component resolution) is shared with check-contracts.mjs via
 * ./lib/docgen.mjs — see that file's header. `PROP_SURFACE_EXEMPT`
 * (tools/scripts/lib/allowlists.js) is READ, never written: an exempted
 * `<prop>:<fw>` is printed as a known `[GAP]`, grouped by reason exactly like
 * check:props does. A divergence the allowlist does not know about is a new
 * finding — reported and left red, not swept into a new exemption (the brief
 * for this gate is explicit: do not grow the allowlist here).
 *
 * Seven report tags:
 *   [NAME]    error   — a prop/event present in one framework, absent in
 *                        another (after the on<X>Change equivalence below).
 *   [MEMBERS] error   — an enum prop whose literal members differ (set
 *                        inequality, verbatim — no allowlist path; the
 *                        allowlist has no entries for VALUE-level drift).
 *   [DEFAULT] error   — an enum/boolean prop whose default differs. This is
 *                        check:defaults' cross-framework half; the docs-table
 *                        half (adapters vs docs/src/data/components.ts) stays
 *                        there.
 *   [KIND]    error   — the same name typed differently per framework (enum
 *                        vs string, say).
 *   [DOCGEN-FAILED] error — one story file's docgen call failed outright (the
 *                        worker threw / returned an empty payload / set
 *                        `payload.error`, or react-docgen threw). Distinct
 *                        from "no component here": a failure used to collapse
 *                        into the same silent skip as a story with no
 *                        resolvable component (ADR-0124).
 *   [ROSTER]  error   — a framework's manifest measured nothing it should
 *                        have (at least one story had a resolvable
 *                        `meta.component` but `byComponent` stayed empty), or
 *                        a framework pair compared zero components. The
 *                        assertion this gate's roster never carried: an empty
 *                        map used to read as "nothing to report", not "the
 *                        gate is blind" (ADR-0034's roster-derivation
 *                        convention, applied to this gate by ADR-0124).
 *   [UNKEYED] warning — a component present in only ONE framework's manifest
 *                        (e.g. a Toast whose stories carry no dedicated
 *                        `meta.component` in two of three frameworks) — never
 *                        compared, only noted.
 *
 * Equivalence (ADR-0093's own domain rule, reproduced exactly — not widened):
 * React `on<X>Change` <-> Angular `model('<x>')`'s auto `<x>Change` output (or
 * an explicit `output('<x>Change')`) <-> Vue `update:<x>` (or an `<x>Change`
 * emit). Every OTHER event name (Alert's `dismissed`/`onDismissed`) is
 * compared verbatim, camelized — exactly as far as check:props' own
 * CHANGE_PROP_RE ever reaches; the gate does not invent a broader "on<X> ~
 * bare <x>" mapping the brief does not ask for.
 *
 * Native-passthrough and generic-ignore silences are copied from
 * check-prop-surface.js's own two constants (never surfaced as findings
 * there, allowlisted or not, so replicated as silent skips here too):
 * `id`/`aria-label`/`aria-labelledby`/`aria-describedby`/`type` absent from
 * React (its `{...rest}` passthrough, invisible to react-docgen); React's own
 * `className`/`children`/`ref`; Angular's Signal-Forms-only `touched`/
 * `formField` (and their auto `<x>Change` companions).
 *
 * Run via:  node tools/scripts/check-manifest-parity.mjs [--report] [--compare-props]
 *           (or  npm run check:manifest-parity)
 */
'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { loadCsf } from 'storybook/internal/csf-tools';
import {
  findStoryFiles,
  resolveWithExtensions,
  makeWorkerDocgen,
  normalizeAngular,
  normalizeVue,
  makeReactDocgenTools,
  normalizeReactDocgen,
  errorMessage,
} from './lib/docgen.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const CWD = process.cwd();
const require = createRequire(import.meta.url);
const cwdRequire = createRequire(path.join(CWD, 'package.json'));
const { reactParseFile } = makeReactDocgenTools(cwdRequire);

const { PROP_SURFACE_EXEMPT } = require('./lib/allowlists.js');
const { keyedSpecs, componentNameOf } = require('./lib/component-map.js');

const FRAMEWORKS = ['angular', 'react', 'vue'];
const PAIRS = [
  ['angular', 'react'],
  ['angular', 'vue'],
  ['react', 'vue'],
];

// ─── CLI args ───────────────────────────────────────────────────────────────

const args = { report: false, compareProps: false };
for (const a of process.argv.slice(2)) {
  if (a === '--report') args.report = true;
  else if (a === '--compare-props') args.compareProps = true;
  else {
    console.error(`Unknown flag '${a}'`);
    process.exit(2);
  }
}

// ─── component name -> spec name (the reverse of component-map.js's own
// componentNameOf, needed here because a manifest is keyed by the docgen's
// component display name, not the spec interface name) ────────────────────

const SPEC_NAME_BY_COMPONENT = new Map();
for (const specName of Object.keys(keyedSpecs())) {
  SPEC_NAME_BY_COMPONENT.set(componentNameOf(specName), specName);
}

// ─── Findings ───────────────────────────────────────────────────────────────
// Declared here (before discoverFramework() is ever CALLED, in module
// execution order) rather than beside the comparison loop below, because
// discoverFramework() itself now reports [DOCGEN-FAILED] findings as it
// discovers each framework's manifest — moved up so those calls don't hit a
// `findings` still in its temporal dead zone.

const findings = []; // {level, tag, msg}
function reportError(tag, msg) {
  findings.push({ level: 'error', tag, msg });
}
function reportWarning(tag, msg) {
  findings.push({ level: 'warning', tag, msg });
}

// ─── Per-framework discovery: story file -> component -> docgen props ──────
// Mirrors check-contracts.mjs's runFramework() discovery loop (same
// meta.component / react import-specifier resolution), stripped of the
// snapshot/contract machinery this gate does not need.
//
// [DOCGEN-FAILED] / [ROSTER] (ADR-0034's "a gate's roster is derived from the
// source of truth, never from the gate's own artifacts" convention, applied
// to this gate by ADR-0124): a docgen call that throws, returns nothing, or
// is explicitly flagged (`{ ok: false, reason }` — see lib/docgen.mjs) used
// to collapse into the same silent `continue` as "this story has no
// resolvable component", so a broken docgen worker read as an empty,
// comparable roster instead of a failure. `measurableCount` — story files
// whose `meta.component` resolved to SOME name, independent of whether
// docgen then succeeded — is what
// distinguishes the two: a framework with `measurableCount > 0` but an empty
// `byComponent` map measured nothing and must fail loud, not print
// `0 component(s) compared` and exit 0.

async function discoverFramework(fw) {
  const storyFiles = findStoryFiles(fw, { root: ROOT });
  const workerDocgen =
    fw !== 'react' ? await makeWorkerDocgen(fw, cwdRequire, ROOT) : null;
  const byComponent = new Map(); // name -> { props: NormalizedProp[] }
  let measurableCount = 0;
  let docgenFailedCount = 0;

  for (const storyFile of storyFiles) {
    const source = fs.readFileSync(storyFile, 'utf-8');
    let csf;
    try {
      csf = loadCsf(source, {
        makeTitle: (t) => t,
        fileName: storyFile,
      }).parse();
    } catch {
      continue; // a story csf-tools can't parse is surfaced by check-contracts.mjs already
    }
    const metaComponent =
      typeof csf._meta.component === 'string' ? csf._meta.component : null;
    if (!metaComponent) continue;
    measurableCount++;

    let docgenResult = null;
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
            const match =
              docgens.find((d) => d.displayName === localName) ||
              docgens.find((d) => d.displayName === metaComponent);
            if (match)
              docgenResult = {
                name: match.displayName,
                props: normalizeReactDocgen(match),
              };
          } catch (e) {
            docgenFailedCount++;
            reportError(
              'DOCGEN-FAILED',
              `${fw}: ${path.relative(ROOT, storyFile)} — react-docgen failed: ${errorMessage(e)}`,
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
        docgenResult = { name: payload.name, props: normalized.props };
      } else {
        docgenFailedCount++;
        reportError(
          'DOCGEN-FAILED',
          `${fw}: ${path.relative(ROOT, storyFile)} — docgen failed: ${result.reason}`,
        );
      }
    }

    if (!docgenResult) continue;
    if (!byComponent.has(docgenResult.name))
      byComponent.set(docgenResult.name, docgenResult);
  }
  return {
    byComponent,
    measurableCount,
    docgenFailedCount,
    storyFileCount: storyFiles.length,
  };
}

// ─── Naming equivalences (ADR-0093, reproduced — not widened) ──────────────

function camelize(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
function upperFirst(s) {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
function lowerFirst(s) {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s;
}

const REACT_CHANGE_RE = /^on([A-Z]\w*)Change$/;
const TRAILING_CHANGE_RE = /^(.+)Change$/;

/** id/aria-label/aria-labelledby/aria-describedby/type — React's free `{...rest}`
 * passthrough, invisible to react-docgen. EXTRA direction only, exactly like
 * check-prop-surface.js's NATIVE_PASSTHROUGH. */
const NATIVE_PASSTHROUGH = new Set(
  ['id', 'aria-label', 'aria-labelledby', 'aria-describedby', 'type'].map(
    camelize,
  ),
);
/** Framework-wide, component-independent EXTRA ignores — check-prop-surface.js's
 * GENERIC_EXTRA_IGNORE, copied verbatim (Vue has none: its emits are exactly
 * the surface this gate exists to stop ignoring). */
const GENERIC_EXTRA_IGNORE = {
  react: new Set(['className', 'children', 'ref']),
  angular: new Set(['touched', 'formField']),
};

/** Canonicalize one prop/event name into the key this gate diffs by. Data
 * props: camelized verbatim. Events: collapsed to `on<X>Change` only when the
 * framework-local spelling follows the one convention check:props maps
 * (React `on<X>Change`; Angular `<x>Change` — a model()'s auto companion or an
 * explicit output(); Vue `update:<x>` or `<x>Change`) — every other event name
 * is compared camelized and verbatim, same reach as CHANGE_PROP_RE. */
function canonicalName(fw, rawName, isOutput) {
  if (!isOutput) return camelize(rawName);
  if (fw === 'react') {
    const m = REACT_CHANGE_RE.exec(rawName);
    return m ? `on${upperFirst(lowerFirst(m[1]))}Change` : rawName;
  }
  if (fw === 'vue' && rawName.startsWith('update:')) {
    return `on${upperFirst(camelize(rawName.slice('update:'.length)))}Change`;
  }
  const m = TRAILING_CHANGE_RE.exec(rawName);
  return m ? `on${upperFirst(camelize(m[1]))}Change` : camelize(rawName);
}

/** name -> {kind, members, default, isOutput, rawName}, with the
 * framework-wide EXTRA ignores dropped before canonicalization so they never
 * reach the diff at all (matching check-prop-surface.js's totally silent
 * behaviour for these — not even a GAP). */
function buildSurface(fw, props) {
  const surface = new Map();
  for (const p of props) {
    if (fw === 'react' && GENERIC_EXTRA_IGNORE.react.has(p.name)) continue;
    if (fw === 'angular') {
      const base = TRAILING_CHANGE_RE.exec(p.name)?.[1] ?? p.name;
      if (GENERIC_EXTRA_IGNORE.angular.has(base)) continue;
    }
    const canon = canonicalName(fw, p.name, !!p.isOutput);
    surface.set(canon, {
      kind: p.kind,
      members:
        p.kind === 'enum' && Array.isArray(p.members)
          ? new Set(p.members)
          : undefined,
      default: p.default,
      isOutput: !!p.isOutput,
      rawName: p.name,
    });
  }
  return surface;
}

// ─── Discovery ──────────────────────────────────────────────────────────────

const t0 = performance.now();
const perFw = {};
for (const fw of FRAMEWORKS) {
  const { byComponent, measurableCount, docgenFailedCount, storyFileCount } =
    await discoverFramework(fw);
  perFw[fw] = byComponent;
  console.log(
    `[${fw}] discovery: stories: ${storyFileCount}, measurable: ${measurableCount}, ` +
      `components: ${byComponent.size}, docgen-failed: ${docgenFailedCount}`,
  );
  // [ROSTER]: a framework whose docgen ran (at least one story file's
  // meta.component resolved to a name) but ended up with an EMPTY manifest
  // measured nothing — this is the assertion `check:manifest-parity` never
  // carried until ADR-0124 (the original defect: Angular's map going empty
  // produced "0 component(s) compared" and a clean exit, not a blocker).
  if (measurableCount > 0 && byComponent.size === 0) {
    reportError(
      'ROSTER',
      `${fw}: ${measurableCount} story file(s) had a resolvable meta.component but the ${fw} manifest is empty — docgen measured nothing for ${fw}`,
    );
  }
}

const allComponentNames = new Set();
for (const fw of FRAMEWORKS)
  for (const name of perFw[fw].keys()) allComponentNames.add(name);

// ─── Comparison ─────────────────────────────────────────────────────────────

/** exempted 'gap' entry for `key`, or undefined. STALE-EXEMPTION hygiene over
 * PROP_SURFACE_EXEMPT stays check:props' job — this gate reads the list, it
 * does not police it (the two gates trigger different subsets of it). */
function exemptionFor(key) {
  const e = PROP_SURFACE_EXEMPT.get(key);
  return e && e.kind === 'gap' ? e : undefined;
}

const gapGroups = new Map(); // reason -> Set<key>
function recordGap(key, reason) {
  if (!gapGroups.has(reason)) gapGroups.set(reason, new Set());
  gapGroups.get(reason).add(key);
}

function emptyPairStats() {
  return { compared: 0, name: 0, members: 0, default: 0, kind: 0, gap: 0 };
}
const pairStats = Object.fromEntries(
  PAIRS.map(([a, b]) => [`${a}-${b}`, emptyPairStats()]),
);
const overall = { ...emptyPairStats(), unkeyed: 0 };

// Evidence for the retirement decision (S6(b)) — --compare-props mode only,
// gathered unconditionally since it costs nothing extra. `manifestKeys` records
// BOTH candidate (spec:name:fw) keys per NAME divergence (whichever side ends
// up explaining it can't be known without also running check:props), so a
// bucket-(a)/(b) match is "this gate touched the same (spec,prop,fw) fact",
// not "identically attributed" it.
const manifestKeys = new Set();
const structuralFindings = []; // [KIND]/[MEMBERS]/[DEFAULT] — no (spec,prop,fw) key exists for these at all

const reportLines = [];

for (const name of [...allComponentNames].sort()) {
  const presentFws = FRAMEWORKS.filter((fw) => perFw[fw].has(name));

  if (presentFws.length === 1) {
    reportWarning(
      'UNKEYED',
      `${name}: present only in ${presentFws[0]}'s manifest`,
    );
    overall.unkeyed++;
    continue;
  }

  const specName = SPEC_NAME_BY_COMPONENT.get(name) || null;
  const surfaceByFw = {};
  for (const fw of presentFws)
    surfaceByFw[fw] = buildSurface(fw, perFw[fw].get(name).props);

  const componentIssues = [];

  for (const [a, b] of PAIRS) {
    if (!presentFws.includes(a) || !presentFws.includes(b)) continue;
    overall.compared++;
    pairStats[`${a}-${b}`].compared++;
    const sa = surfaceByFw[a];
    const sb = surfaceByFw[b];
    const union = new Set([...sa.keys(), ...sb.keys()]);

    for (const canon of [...union].sort()) {
      const ea = sa.get(canon);
      const eb = sb.get(canon);

      if (ea && eb) {
        if (ea.kind !== eb.kind) {
          const msg = `${name} (${a} vs ${b}): '${canon}' kind differs — ${a}='${ea.kind}' (${ea.rawName}), ${b}='${eb.kind}' (${eb.rawName})`;
          reportError('KIND', msg);
          overall.kind++;
          pairStats[`${a}-${b}`].kind++;
          structuralFindings.push(`[KIND] ${msg}`);
          componentIssues.push(`KIND:${canon}`);
          continue; // a kind mismatch makes MEMBERS/DEFAULT noise, not signal
        }
        if (ea.kind === 'enum') {
          const ma = ea.members || new Set();
          const mb = eb.members || new Set();
          const differs =
            ma.size !== mb.size || [...ma].some((v) => !mb.has(v));
          if (differs) {
            const msg = `${name} (${a} vs ${b}): '${canon}' enum members differ — ${a}={${[...ma].sort().join(', ')}}, ${b}={${[...mb].sort().join(', ')}}`;
            reportError('MEMBERS', msg);
            overall.members++;
            pairStats[`${a}-${b}`].members++;
            structuralFindings.push(`[MEMBERS] ${msg}`);
            componentIssues.push(`MEMBERS:${canon}`);
          }
        }
        if (!ea.isOutput && (ea.kind === 'enum' || ea.kind === 'boolean')) {
          if (
            ea.default !== undefined &&
            eb.default !== undefined &&
            ea.default !== eb.default
          ) {
            const msg = `${name} (${a} vs ${b}): '${canon}' default differs — ${a}='${ea.default}', ${b}='${eb.default}'`;
            reportError('DEFAULT', msg);
            overall.default++;
            pairStats[`${a}-${b}`].default++;
            structuralFindings.push(`[DEFAULT] ${msg}`);
            componentIssues.push(`DEFAULT:${canon}`);
          }
        }
        continue;
      }

      // presence mismatch
      const presentFw = ea ? a : b;
      const absentFw = ea ? b : a;
      const presentEntry = ea || eb;

      if (GENERIC_EXTRA_IGNORE[presentFw]?.has(presentEntry.rawName)) continue;
      if (
        absentFw === 'react' &&
        !presentEntry.isOutput &&
        NATIVE_PASSTHROUGH.has(canon)
      )
        continue;

      if (!specName) {
        const msg = `${name} (${a} vs ${b}): '${presentEntry.rawName}' present in ${presentFw}, absent from ${absentFw} — no keyed spec to exempt against`;
        reportError('NAME', msg);
        overall.name++;
        pairStats[`${a}-${b}`].name++;
        componentIssues.push(`NAME:${canon}`);
        continue;
      }

      const presentKey = `${specName}:${presentEntry.rawName}:${presentFw}`;
      const absentKey = `${specName}:${presentEntry.rawName}:${absentFw}`;
      manifestKeys.add(presentKey);
      manifestKeys.add(absentKey);

      const presentExemption = exemptionFor(presentKey);
      const absentExemption = exemptionFor(absentKey);
      const exemption = presentExemption || absentExemption;
      if (exemption) {
        recordGap(presentExemption ? presentKey : absentKey, exemption.reason);
        overall.gap++;
        pairStats[`${a}-${b}`].gap++;
        continue;
      }

      const msg = `${name} (${a} vs ${b}): '${presentEntry.rawName}' present in ${presentFw}, absent from ${absentFw}`;
      reportError('NAME', msg);
      overall.name++;
      pairStats[`${a}-${b}`].name++;
      componentIssues.push(`NAME:${canon}`);
    }
  }

  if (args.report) {
    const propCounts = presentFws
      .map((fw) => `${fw}:${surfaceByFw[fw].size}`)
      .join(' ');
    reportLines.push(
      `  ${componentIssues.length === 0 ? 'ok  ' : 'diff'} ${name} (${presentFws.join(',')}) [${propCounts}]${
        componentIssues.length ? ` — ${componentIssues.join(', ')}` : ''
      }`,
    );
  }
}

// [ROSTER]: a pair that never had a single component present in BOTH
// frameworks' manifests compared nothing — printed today as a bare
// "0 component(s) compared" line with no assertion on it at all (the second
// half of the original defect: a framework's map going empty leaves every
// pair it's in silently at 0, never [UNKEYED] because there's nothing there
// to be unkeyed against). This does not replace the per-framework empty-map
// check above — a pair can also read 0 for a framework whose OWN manifest is
// non-empty but shares no component with its partner, which the per-framework
// check alone would miss.
for (const [a, b] of PAIRS) {
  if (pairStats[`${a}-${b}`].compared === 0) {
    reportError('ROSTER', `[${a} vs ${b}] 0 component(s) compared`);
  }
}

// ─── Output ─────────────────────────────────────────────────────────────────

if (args.report) {
  console.log('--- per-component ---');
  for (const line of reportLines) console.log(line);
}

const sortedReasons = [...gapGroups.keys()].sort();
for (const reason of sortedReasons) {
  const keys = [...gapGroups.get(reason)].sort();
  console.warn(`⚠ [GAP] (${keys.length}) ${reason}`);
  for (const key of keys) console.warn(`    - ${key}`);
}

const errorOrder = {
  'DOCGEN-FAILED': -2,
  ROSTER: -1,
  NAME: 0,
  MEMBERS: 1,
  DEFAULT: 2,
  KIND: 3,
};
const errors = findings
  .filter((f) => f.level === 'error')
  .sort(
    (x, y) => errorOrder[x.tag] - errorOrder[y.tag] || (x.msg < y.msg ? -1 : 1),
  );
for (const e of errors) console.error(`✗ [${e.tag}] ${e.msg}`);

const unkeyed = findings
  .filter((f) => f.tag === 'UNKEYED')
  .sort((x, y) => (x.msg < y.msg ? -1 : 1));
for (const w of unkeyed) console.warn(`⚠ [UNKEYED] ${w.msg}`);

console.log('\n--- summary per pair ---');
for (const [a, b] of PAIRS) {
  const s = pairStats[`${a}-${b}`];
  console.log(
    `[${a} vs ${b}] ${s.compared} component(s) compared — NAME:${s.name} MEMBERS:${s.members} DEFAULT:${s.default} KIND:${s.kind} GAP:${s.gap}`,
  );
}
const t1 = performance.now();
console.log(
  `[overall] ${allComponentNames.size} component name(s) seen, ${overall.unkeyed} unkeyed, ` +
    `${overall.compared} pairwise comparison(s), ${overall.gap} known-gap divergence(s) ` +
    `in ${[...gapGroups.values()].reduce((n, s) => n + s.size, 0)} allowlist key(s) across ${gapGroups.size} reason(s), ` +
    `${overall.name} [NAME] ${overall.members} [MEMBERS] ${overall.default} [DEFAULT] ${overall.kind} [KIND] unresolved error(s), ` +
    `${(t1 - t0).toFixed(0)} ms`,
);

// ─── --compare-props: the S6(b) evidence ───────────────────────────────────
// Runs check-prop-surface.js as a subprocess (never re-implements its rules)
// and parses its own printed [GAP] keys and rule findings back out, so the
// comparison is against what check:props ACTUALLY reported this run, not a
// re-derivation of it.

function runCheckPropsKeys() {
  // spawnSync, not execFileSync: check-prop-surface.js prints its [GAP] lines via
  // console.warn and its errors via console.error — both stderr — and
  // execFileSync's return value on a clean exit is stdout ONLY, silently
  // dropping every warning. spawnSync hands back stdout/stderr separately
  // regardless of exit code, so both streams are captured either way.
  const result = spawnSync(
    'node',
    [path.join(__dirname, 'check-prop-surface.js')],
    {
      cwd: ROOT,
      encoding: 'utf-8',
    },
  );
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const keys = new Set();
  const lines = output.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^⚠ \[GAP\] \(\d+\)/.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && /^ {4}- /.test(lines[j])) {
        keys.add(lines[j].trim().slice(2));
        j++;
      }
      continue;
    }
    const m =
      /^✗ \[(MISSING|EXTRA|DEAD)\] (Atl\w+):(\S+) — .*?\b(Angular|React|Vue)\b/.exec(
        lines[i],
      );
    if (m) keys.add(`${m[2]}:${m[3]}:${m[4].toLowerCase()}`);
  }
  return keys;
}

if (args.compareProps) {
  const propsKeys = runCheckPropsKeys();
  const both = [...manifestKeys].filter((k) => propsKeys.has(k)).sort();
  const onlyProps = [...propsKeys].filter((k) => !manifestKeys.has(k)).sort();
  const onlyManifestNamed = [...manifestKeys]
    .filter((k) => !propsKeys.has(k))
    .sort();

  console.log('\n--- --compare-props (S6(b) evidence; informational only) ---');
  console.log(`(a) both gates know about (${both.length}):`);
  for (const k of both) console.log(`    - ${k}`);
  console.log(`(b) only check:props reports (${onlyProps.length}):`);
  for (const k of onlyProps) console.log(`    - ${k}`);
  console.log(
    `(c) only check:manifest-parity reports — name/presence-keyed (${onlyManifestNamed.length}):`,
  );
  for (const k of onlyManifestNamed) console.log(`    - ${k}`);
  console.log(
    `(c) only check:manifest-parity reports — structural, no (spec,prop,fw) key exists (${structuralFindings.length}):`,
  );
  for (const f of structuralFindings) console.log(`    - ${f}`);
}

const totalErrors = findings.filter((f) => f.level === 'error').length;
const totalWarnings = findings.filter((f) => f.level === 'warning').length;
console.log(`\ntotal: ${totalErrors} error(s), ${totalWarnings} warning(s)`);
process.exitCode = totalErrors > 0 ? 1 : 0;

// Established: CI run 34562307047's "Sync checks" job and Publish's "Verify (release gate)" both
// hung ~110 min on this gate — it printed the full output above 11 s in, then never exited, and
// GitHub's orphan reaper killed the tree at cancellation.
// Established: the only long-lived resource here is makeWorkerDocgen()'s Angular/Vue docgen workers,
// which lazily start a storybook/internal ComponentMetaManager whose startWatching() opens recursive
// fs.watch() handles, with no way to shut it down from here: both @storybook/angular-vite's and
// @storybook/vue3's internal/docgen-worker export only createDocgenProvider(), the manager lives in
// a private closure, and the base class's dispose()/stopWatching() is unreachable.
// Not established: why it holds on Linux and not macOS. The handles are unref()'d, so they should
// not block exit at all, and a local process.getActiveResourcesInfo() snapshot showed only a
// transient FSReqCallback. One candidate is Node's non-macOS recursive-watch implementation creating
// inner per-directory watchers that need not inherit the outer unref.
// The decision: the gate's product is its findings and exit code, both already printed, so force
// the exit rather than leave a green run hanging on an unexplained handle — check-contracts.mjs,
// which uses the same workers, has always done this. Switch back to a real disposer if Storybook
// ever exports one.
process.exit(process.exitCode);
