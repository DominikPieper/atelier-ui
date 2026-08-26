#!/usr/bin/env node
/**
 * gen-design-status.mjs
 *
 * One table answering "what state is each component's design in" — the view you
 * need before transferring anything into Figma, and the one nothing in the repo
 * gave you: the facts were spread across a Figma snapshot, a parity record, an
 * a11y baseline directory, 88 stylesheets, and a Claude Design project that is
 * not in the repo at all.
 *
 * Every column but one is DERIVED, so the table cannot drift from the sources:
 *   Figma master + axes  tools/figma/snapshot.json
 *   parity verified      tools/figma/parity.json
 *   a11y baseline        tools/parity/a11y/
 *   type roles adopted   grep --ui-type-* in the component's own CSS
 *   font respecified     grep --ui-font-family in the component's own CSS
 *   artboard             tools/design/artboards.json  ← hand-maintained
 *
 * The artboard column is hand-maintained because Claude Design lives outside the
 * repo. It is also the column that matters most right now, which is why the
 * registry distinguishes "covers" from "appears as a fragment": a button drawn
 * small inside a typography study is not a designed button.
 *
 *   node tools/scripts/gen-design-status.mjs            write plan/design-status.md
 *   node tools/scripts/gen-design-status.mjs --check    fail on drift
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FRAMEWORKS, isComponentDir, getComponentDirs } = require('./lib/component-discovery.js');
const { moduleForSelector } = require('./lib/parity-inputs.js');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'plan/design-status.md');
const readJson = (p) => JSON.parse(readFileSync(resolve(ROOT, p), 'utf8'));

const snapshot = readJson('tools/figma/snapshot.json');
const parity = readJson('tools/figma/parity.json');
const registry = readJson('tools/design/artboards.json');

// ── the roster: component dirs, the same discovery the structural gates use ──
const dirs = new Set();
for (const fw of FRAMEWORKS) {
  const base = join(ROOT, 'libs', fw, 'src/lib');
  for (const d of getComponentDirs(base)) {
    if (isComponentDir(join(base, d))) dirs.add(d);
  }
}

// ── derived facts per component dir ──
const A11Y_DIR = resolve(ROOT, 'tools/parity/a11y');
const a11yFrameworks = (dir) => {
  if (!existsSync(A11Y_DIR)) return [];
  const prefix = `atl-${dir}.`;
  return readdirSync(A11Y_DIR)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.json'))
    .map((f) => f.slice(prefix.length, -'.json'.length))
    .sort();
};

const cssOf = (dir) => {
  const out = [];
  for (const fw of FRAMEWORKS) {
    const p = join(ROOT, 'libs', fw, 'src/lib', dir);
    if (!existsSync(p) || !statSync(p).isDirectory()) continue;
    for (const f of readdirSync(p).filter((f) => f.endsWith('.css'))) {
      out.push(readFileSync(join(p, f), 'utf8'));
    }
  }
  return out.join('\n');
};

// selector -> snapshot entry, via the registry's module mapping
const snapshotByDir = new Map();
for (const c of snapshot.components || []) {
  const mod = moduleForSelector(c.selector);
  if (mod) snapshotByDir.set(mod, c);
}
const parityByDir = new Map();
for (const [selector, rec] of Object.entries(parity.components || {})) {
  const mod = moduleForSelector(selector);
  if (mod) parityByDir.set(mod, { selector, ...rec });
}

// artboards
const covers = new Map();
const fragments = new Map();
for (const a of registry.artboards || []) {
  for (const sel of a.covers || []) {
    const mod = moduleForSelector(sel) || sel;
    covers.set(mod, a);
  }
  for (const sel of a.appearsAsFragment || []) {
    const mod = moduleForSelector(sel) || sel;
    if (!fragments.has(mod)) fragments.set(mod, a);
  }
}

const rows = [...dirs].sort().map((dir) => {
  const snap = snapshotByDir.get(dir);
  const par = parityByDir.get(dir);
  const a11y = a11yFrameworks(dir);
  const css = cssOf(dir);
  return {
    dir,
    selector: par?.selector ?? snap?.selector ?? '—',
    axes: snap ? Object.keys(snap.variantAxes || {}) : null,
    variants: snap ? (snap.variants || []).length : null,
    verifiedAt: par?.verifiedAt ? par.verifiedAt.slice(0, 10) : null,
    verifiedSha: par?.verifiedSha ?? null,
    a11y,
    roles: /var\(\s*--ui-type-/.test(css),
    respecifiesFont: /var\(\s*--ui-font-family/.test(css),
    artboard: covers.get(dir) ?? null,
    fragment: fragments.get(dir) ?? null,
  };
});

const tick = (b) => (b ? 'yes' : '—');
const a11yCell = (fw) =>
  fw.length === 0 ? '—' : fw.length === FRAMEWORKS.length ? 'all 3' : fw.join(', ');
const artboardCell = (r) =>
  r.artboard
    ? `**${r.artboard.file}**`
    : r.fragment
      ? `fragment only`
      : '—';

const designed = rows.filter((r) => r.artboard).length;
const fragmentOnly = rows.filter((r) => !r.artboard && r.fragment).length;

const lines = [
  '# Design status per component',
  '',
  '<!-- GENERATED by tools/scripts/gen-design-status.mjs — do not edit by hand.',
  '     Every column but "Artboard" is derived from the repo; that one comes from',
  '     tools/design/artboards.json, because Claude Design is not in the repo. -->',
  '',
  `**${rows.length} components.** Claude Design coverage: **${designed} designed**, ` +
    `${fragmentOnly} appearing only as a fragment inside a study, ` +
    `${rows.length - designed - fragmentOnly} untouched.`,
  '',
  // The redesign phase changes how the "Parity verified" column should be read, so
  // it belongs next to the table rather than only inside check:parity's output.
  ...(registry.meta?.redesignPhase?.active
    ? [
        `> **Redesign phase, active since ${registry.meta.redesignPhase.since}.** Figma is the *target* of`,
        '> the transfer, not the reference for it, so the masters are stale by definition until they are',
        '> rebuilt. A "Parity verified" date older than the last component change is therefore expected',
        '> here, and `check:parity` reports it as a warning instead of a blocker. Every one of them still',
        `> owes a re-verify: ${registry.meta.redesignPhase.clearedBy || 'rebuild the masters, then re-verify every component.'}`,
        '',
      ]
    : []),
  'Read the columns as a pipeline: a component is ready to transfer into Figma when',
  'it has an artboard, a current parity verification, and an a11y baseline in all',
  'three frameworks. "Fragment only" is not coverage — a control drawn small inside',
  'a typography study says nothing about how the component should look.',
  '',
  '| Component | Artboard | Figma axes | Variants | Parity verified | a11y baseline | Type roles | Respecifies font |',
  '|---|---|---|---|---|---|---|---|',
  ...rows.map((r) =>
    [
      `\`${r.dir}\``,
      artboardCell(r),
      r.axes ? (r.axes.length ? r.axes.join(' · ') : 'none') : '— *(no master)*',
      r.variants ?? '—',
      r.verifiedAt ? `${r.verifiedAt} (\`${r.verifiedSha}\`)` : '— *(never)*',
      a11yCell(r.a11y),
      tick(r.roles),
      r.respecifiesFont ? 'yes' : '—',
    ].join(' | ')
  ).map((l) => `| ${l} |`),
  '',
  '## How to read the last two columns',
  '',
  '**Type roles** is empty everywhere today: ADR-0036 declared the `--ui-type-*`',
  'roles and nothing consumes them yet. **Respecifies font** is the mirror image —',
  '`--ui-font-family` restated per component, against its own manifest constraint',
  '("apply on :root or the app shell"). The migration turns the second column into',
  'the first.',
  '',
  '## Artboards',
  '',
  ...(registry.artboards || []).flatMap((a) => {
    const project = registry.meta?.projects?.[a.project];
    return [
      `### ${a.file}`,
      '',
      `- Project: ${project ? `[${a.project}](${project.url})` : a.project}`,
      `- Kind: **${a.kind}** · subject: ${a.subject}`,
      `- Covers: ${a.covers?.length ? a.covers.join(', ') : '**nothing** — see note'}`,
      ...(a.appearsAsFragment?.length
        ? [`- Appears as a fragment: ${a.appearsAsFragment.join(', ')}`]
        : []),
      ...(a.note ? ['', a.note] : []),
      '',
    ];
  }),
];

const out = lines.join('\n') + '\n';

if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  if (current !== out) {
    console.error(
      '✗ plan/design-status.md is out of sync with its sources.\n  Run: node tools/scripts/gen-design-status.mjs'
    );
    process.exit(1);
  }
  console.log(
    `✓ design status in sync (${rows.length} components; ${designed} with an artboard, ${fragmentOnly} fragment-only).`
  );
  process.exit(0);
}

writeFileSync(OUT, out);
console.log(
  `wrote ${OUT.replace(ROOT + '/', '')} — ${rows.length} components, ${designed} designed, ${fragmentOnly} fragment-only`
);
