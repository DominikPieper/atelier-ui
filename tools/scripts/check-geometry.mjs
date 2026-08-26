#!/usr/bin/env node
/**
 * check-geometry.mjs
 *
 * Renders every control that claims a `--ui-control-height-*` token and asserts
 * the box it actually produces is the height it claims.
 *
 * This gate exists because that claim was false for months and nothing noticed.
 * AtlInput declared `min-height: 2.5rem` and rendered 46px; AtlButton md
 * declared the same and rendered 40, so an input and a button in the same form
 * row sat 6px apart in all three frameworks. `check:parity` compares against
 * Figma by hand, the a11y baselines do not record geometry, and nothing else
 * measured a rendered box — so the defect was invisible to a green suite. See
 * ADR-0041.
 *
 * A real browser does the measuring. Re-implementing the box model here would be
 * the same mistake the contrast checker made with its hardcoded palette: a second
 * copy of the truth, free to disagree with the first.
 *
 * The roster is DISCOVERED: any component stylesheet referencing a
 * `--ui-control-height-*` token must appear in CONTROLS below, and every entry in
 * CONTROLS must still reference one. So a control that migrates onto the token
 * and is not added here fails, and an entry left behind after a control moves
 * away fails too.
 *
 *   node tools/scripts/check-geometry.mjs            measure and report
 *   node tools/scripts/check-geometry.mjs --check    quiet unless something is wrong
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FRAMEWORKS, isComponentDir, getComponentDirs } = require('./lib/component-discovery.js');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const QUIET = process.argv.includes('--check');
const TOL = 0.5; // px — sub-pixel rounding is not a defect; 6px is.

/**
 * Markup per control. This is knowledge, not something to derive: only the
 * component knows which element carries its height. Sizes list the
 * `--ui-control-height-*` step each variation should land on.
 */
const CONTROLS = [
  {
    dir: 'button',
    label: 'AtlButton',
    sizes: [
      { step: 'sm', html: '<button class="atl-button variant-primary size-sm">Label</button>' },
      { step: 'md', html: '<button class="atl-button variant-primary size-md">Label</button>' },
      { step: 'lg', html: '<button class="atl-button variant-primary size-lg">Label</button>' },
    ],
    measure: '.atl-button',
  },
  {
    dir: 'input',
    label: 'AtlInput',
    sizes: [
      {
        step: 'md',
        html: '<div class="atl-input" style="width:240px"><div class="input-field"><input value="Value"></div></div>',
      },
    ],
    measure: '.atl-input input',
  },
];

const errors = [];
const rows = [];

// ── the heights the tokens claim ──────────────────────────────────────────────
const tokensCss = readFileSync(
  resolve(ROOT, 'libs/create-workspace/src/generators/preset/files/styles/tokens.css'),
  'utf8'
);
const claimed = {};
for (const m of tokensCss.matchAll(/--ui-control-height-([a-z]+)\s*:\s*([\d.]+)rem\s*;/g)) {
  claimed[m[1]] = parseFloat(m[2]) * 16; // the token file is rem-based; 1rem = 16px at the default root
}
if (Object.keys(claimed).length === 0) {
  console.error('✗ the token source declares no --ui-control-height-* tokens; nothing to check.');
  process.exit(1);
}

// ── roster: who references the token, and does CONTROLS agree ────────────────
const referencing = new Set();
for (const fw of FRAMEWORKS) {
  const base = join(ROOT, 'libs', fw, 'src/lib');
  for (const dir of getComponentDirs(base)) {
    const dirPath = join(base, dir);
    if (!isComponentDir(dirPath)) continue;
    for (const f of readdirSync(dirPath).filter((f) => f.endsWith('.css'))) {
      if (/var\(\s*--ui-control-height-/.test(readFileSync(join(dirPath, f), 'utf8'))) {
        referencing.add(dir);
      }
    }
  }
}
const registered = new Set(CONTROLS.map((c) => c.dir));
for (const dir of referencing) {
  if (!registered.has(dir)) {
    errors.push(
      `[ROSTER] ${dir} references a --ui-control-height-* token but is not in CONTROLS in this file, so its height is never measured. Add it.`
    );
  }
}
for (const dir of registered) {
  if (!referencing.has(dir)) {
    errors.push(
      `[STALE] CONTROLS lists ${dir}, but no ${dir} stylesheet references a --ui-control-height-* token any more. Remove the entry.`
    );
  }
}

// ── measure, in a real browser, against the shipped CSS ──────────────────────
let chromium;
try {
  ({ chromium } = await import('@playwright/test'));
} catch {
  console.error(
    '✗ this gate needs a browser: @playwright/test is not resolvable. Run npm ci, then npx playwright install chromium.'
  );
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), 'atl-geometry-'));
const fw = 'react'; // one framework is enough: check:sync guarantees the CSS is mirrored
const cssFiles = [resolve(ROOT, `libs/${fw}/src/styles/tokens.css`)];
for (const c of CONTROLS) {
  const dirPath = join(ROOT, 'libs', fw, 'src/lib', c.dir);
  for (const f of readdirSync(dirPath).filter((f) => f.endsWith('.css'))) {
    cssFiles.push(join(dirPath, f));
  }
}
const css = cssFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

// The reset is deliberate and named: the library ships none (a known gap), and a
// consumer without one gets different geometry. Measuring with border-box states
// the assumption instead of inheriting it silently.
const page = `<!doctype html><html><head><style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; }
${css}
</style></head><body>
${CONTROLS.flatMap((c) =>
  c.sizes.map((s) => `<div data-case="${c.dir}:${s.step}">${s.html}</div>`)
).join('\n')}
</body></html>`;
const fixture = join(work, 'geometry.html');
writeFileSync(fixture, page);

let browser;
try {
  browser = await chromium.launch();
} catch (err) {
  console.error(
    `✗ this gate needs a browser and could not launch one — ${String(err.message).split('\n')[0]}\n` +
      '  Run: npx playwright install chromium'
  );
  process.exit(1);
}
const tab = await browser.newPage({ viewport: { width: 900, height: 600 } });
await tab.goto('file://' + fixture);
await tab.waitForTimeout(150);

for (const c of CONTROLS) {
  for (const s of c.sizes) {
    const height = await tab.evaluate(
      ([caseId, sel]) => {
        const scope = document.querySelector(`[data-case="${caseId}"]`);
        const el = scope && scope.querySelector(sel);
        return el ? el.getBoundingClientRect().height : null;
      },
      [`${c.dir}:${s.step}`, c.measure]
    );
    const want = claimed[s.step];
    if (height === null) {
      errors.push(
        `[MARKUP] ${c.label} ${s.step}: the fixture markup in CONTROLS does not produce an element matching \`${c.measure}\`. Fix the entry.`
      );
      continue;
    }
    if (want === undefined) {
      errors.push(`[TOKEN] ${c.label} ${s.step}: the token source declares no --ui-control-height-${s.step}.`);
      continue;
    }
    const off = Math.abs(height - want);
    rows.push({ label: c.label, step: s.step, height, want, ok: off <= TOL });
    if (off > TOL) {
      errors.push(
        `[HEIGHT] ${c.label} size=${s.step} renders ${height}px but --ui-control-height-${s.step} claims ${want}px ` +
          `(off by ${off.toFixed(2)}px). Derive the block padding from the height instead of authoring it — see ADR-0041.`
      );
    }
  }
}
await browser.close();

// ── report ───────────────────────────────────────────────────────────────────
if (!QUIET) {
  for (const r of rows) {
    console.log(
      `  ${r.ok ? 'PASS' : 'FAIL'}  ${r.label.padEnd(12)} size=${r.step.padEnd(3)} ${String(r.height).padStart(6)}px  (token ${r.want}px)`
    );
  }
}
const summary = `${rows.length} control size(s) measured across ${CONTROLS.length} component(s)`;
if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} geometry issue(s). ${summary}.`);
  process.exit(1);
}
console.log(`✓ every control renders the height its token claims (${summary}).`);
