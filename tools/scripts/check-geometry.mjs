#!/usr/bin/env node
/**
 * check-geometry.mjs
 *
 * Renders every control that claims a `--ui-control-height-*` token, in all three
 * frameworks, and asserts the box it actually produces is the height it claims.
 *
 * This gate exists because that claim was false for months and nothing noticed.
 * AtlInput declared `min-height: 2.5rem` and rendered 46px; AtlButton md declared
 * the same and rendered 40, so an input and a button in the same form row sat 6px
 * apart (ADR-0041). `check:parity` compares against Figma by hand, the a11y
 * baselines do not record geometry, and nothing else measured a rendered box.
 *
 * A real browser does the measuring. Re-implementing the box model here would be
 * the same mistake the contrast checker made with its hardcoded palette: a second
 * copy of the truth, free to disagree with the first.
 *
 * TWO THINGS THIS GATE LEARNED THE HARD WAY (ADR-0043):
 *
 * 1. It measured React only, on the stated grounds that "check:sync guarantees the
 *    CSS is mirrored". It does not — check:sync compares directory and story
 *    presence, never CSS. Angular's styles are structurally different (`:host`,
 *    no `.atl-*` classes), and an Angular button at size=md rendered 60px against
 *    a 40px token while this gate reported the library green. Every framework is
 *    measured now.
 * 2. Its fixture injected `* { box-sizing: border-box }`. That silently supplied
 *    the very thing consumers were missing, so it measured a best case nobody
 *    ships. The fixture now supplies NO reset: what it measures is what an app
 *    with no reset of its own gets.
 * 3. It measured with whatever fonts the machine happens to have. AtlSelect and
 *    AtlCombobox derived nothing and inherited their line-height, so they were
 *    40px with Instrument Sans installed and 41px with the fallback — green on a
 *    developer's machine, red in CI (ADR-0048). Every case is now measured twice,
 *    once with the shipped stack and once with a font that cannot resolve, and a
 *    difference between the two is itself a failure: a control whose height moves
 *    with the font is not a control of a stated height.
 *
 * The roster is DISCOVERED: any component stylesheet referencing a
 * `--ui-control-height-*` token must appear in CONTROLS below, and every entry in
 * CONTROLS must still reference one.
 *
 *   node tools/scripts/check-geometry.mjs            measure and report
 *   node tools/scripts/check-geometry.mjs --check    quiet unless something is wrong
 */
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
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
 * The discriminator for "is this height content-driven?". `line-height` inherits,
 * and `*` matches every element, so this declaration lands directly on any element
 * that does not state its own — while losing (specificity 0) to every element that
 * does. A box whose height moves under it is sized by inherited text metrics, which
 * is the same thing as being sized by whichever font happens to be installed.
 *
 * Deliberately not a font override: the difference AtlSelect showed between
 * Instrument Sans and the CI fallback was a fraction of a pixel — under the
 * tolerance, and therefore undetectable that way. Perturbing the metric directly
 * is what makes the dependency visible.
 */
const INHERITED_METRIC_PROBE = {
  /* A control owns every element inside it, so it must survive the strict form:
     a declaration landing directly on each descendant. */
  control: '* { line-height: 3; }',
  /* A row may host content the consuming app supplies — AtlCheckbox and
     AtlToggle render their children with no wrapper of their own. Overriding
     that content's metrics would be worse than the defect, so a row is held to
     the hazard that is actually real: leading arriving by inheritance. A row
     that states its own line-height shrugs this off; one that does not grows,
     which is the regression this catches. Content that is genuinely taller — a
     label wrapping to two lines — still grows the row, and should.

     The perturbation is an absolute leading, not a multiplier: a row states a
     height in the 32–56px band while its text is 12–16px, so a factor of 3
     stays inside that headroom and would pass a row that never declared a
     line-height at all (verified — it let a stripped table cell through).
     A leading taller than every rung on the ladder has no such blind spot. */
  row: 'body { line-height: 100px; }',
};

/**
 * Markup per control. This is knowledge, not something to derive: only the
 * component knows which element carries its height. React and Vue share their
 * class-based markup; Angular's host is a custom element, so it gets its own.
 */
const CONTROLS = [
  {
    dir: 'button',
    label: 'AtlButton',
    steps: ['sm', 'md', 'lg'],
    markup: {
      default: (s) => `<button class="atl-button variant-primary size-${s}">Label</button>`,
      angular: (s) => `<atl-button class="variant-primary size-${s}">Label</atl-button>`,
    },
    measure: { default: '.atl-button', angular: 'atl-button' },
  },
  {
    dir: 'input',
    label: 'AtlInput',
    steps: ['md'],
    markup: {
      default: () => `<div class="atl-input" style="width:240px"><div class="input-field"><input value="Value"></div></div>`,
      angular: () => `<atl-input style="display:block;width:240px"><div class="input-field"><input value="Value"></div></atl-input>`,
    },
    measure: { default: '.atl-input input', angular: 'atl-input input' },
  },
  // Everything below joined the roster when ADR-0047 bound its literal height to
  // the token. Two of them were wrong the moment they became measurable: the tab
  // rendered 41px and the code-block header 43px against a 40px token.
  {
    dir: 'select',
    label: 'AtlSelect',
    steps: ['md'],
    markup: {
      default: () => `<div class="atl-select" style="width:220px"><select><option>Option</option></select></div>`,
      angular: () => `<atl-select style="display:block;width:220px"><button type="button" class="trigger">Option</button></atl-select>`,
    },
    measure: { default: '.atl-select select', angular: 'atl-select .trigger' },
  },
  {
    dir: 'combobox',
    label: 'AtlCombobox',
    steps: ['md'],
    markup: {
      default: () =>
        `<div class="atl-combobox" style="width:220px"><div class="atl-combobox-wrapper"><input class="atl-combobox-input" value="Value"></div></div>`,
      angular: () =>
        `<atl-combobox style="display:block;width:220px"><div class="combobox-wrapper"><input class="combobox-input" value="Value"></div></atl-combobox>`,
    },
    measure: { default: '.atl-combobox-input', angular: '.combobox-input' },
  },
  {
    dir: 'tabs',
    label: 'AtlTab',
    steps: ['md'],
    markup: {
      default: () =>
        `<div class="atl-tab-group" style="width:260px"><div class="tablist"><button class="is-active">One</button><button>Two</button></div></div>`,
      angular: () =>
        `<atl-tab-group style="display:block;width:260px"><div class="tablist"><button class="is-active">One</button><button>Two</button></div></atl-tab-group>`,
    },
    measure: { default: '.tablist button', angular: '.tablist button' },
  },
  {
    dir: 'menu',
    label: 'AtlMenuItem',
    steps: ['sm'],
    markup: {
      default: () => `<div class="atl-menu variant-compact"><div class="atl-menu-item">Duplicate</div></div>`,
      angular: () => `<atl-menu class="atl-menu variant-compact"><div class="atl-menu-item">Duplicate</div></atl-menu>`,
    },
    measure: { default: '.atl-menu-item', angular: '.atl-menu-item' },
  },
  // Rows, not controls: the height is stated and the content centred (ADR-0052).
  {
    dir: 'menu',
    label: 'AtlMenuRow',
    ladder: 'row',
    steps: ['sm'],
    markup: {
      default: () => `<div class="atl-menu"><div class="atl-menu-item">Duplicate</div></div>`,
      angular: () => `<atl-menu class="atl-menu"><div class="atl-menu-item">Duplicate</div></atl-menu>`,
    },
    measure: { default: '.atl-menu-item', angular: '.atl-menu-item' },
  },
  {
    dir: 'combobox',
    label: 'AtlComboboxOption',
    ladder: 'row',
    steps: ['sm'],
    markup: {
      default: () =>
        `<div class="atl-combobox"><div class="atl-combobox-panel" style="position:static"><div class="atl-combobox-option">Angular</div></div></div>`,
      angular: () => `<atl-combobox><div class="panel"><div class="option">Angular</div></div></atl-combobox>`,
    },
    measure: { default: '.atl-combobox-option', angular: '.option' },
  },
  {
    dir: 'code-block',
    label: 'AtlCodeBlock',
    steps: ['md'],
    markup: {
      default: () => `<div class="atl-code-block" style="width:260px"><div class="code-block-header">tokens.css</div></div>`,
      angular: () => `<atl-code-block style="display:block;width:260px"><div class="code-block-header">tokens.css</div></atl-code-block>`,
    },
    measure: { default: '.code-block-header', angular: '.code-block-header' },
  },
  {
    dir: 'dialog',
    label: 'AtlDialogClose',
    steps: ['sm'],
    markup: {
      default: () => `<div class="atl-dialog-header"><button class="close-btn">x</button></div>`,
      angular: () => `<atl-dialog-header class="atl-dialog-header"><button class="close-btn">x</button></atl-dialog-header>`,
    },
    measure: { default: '.close-btn', angular: '.close-btn' },
  },
  {
    dir: 'drawer',
    label: 'AtlDrawerClose',
    steps: ['sm'],
    markup: {
      default: () => `<div class="atl-drawer-header"><button class="close-btn">x</button></div>`,
      angular: () => `<atl-drawer-header class="atl-drawer-header"><button class="close-btn">x</button></atl-drawer-header>`,
    },
    measure: { default: '.close-btn', angular: '.close-btn' },
  },
  {
    dir: 'chat',
    label: 'AtlChatClose',
    steps: ['sm'],
    markup: {
      default: () => `<div class="atl-chat-header"><button class="close-btn">x</button></div>`,
      angular: () => `<atl-chat-header><button class="close-btn">x</button></atl-chat-header>`,
    },
    measure: { default: '.close-btn', angular: '.close-btn' },
  },
  // The row ladder (ADR-0052). These state a height and centre their content;
  // the table cell uses `height` rather than `min-height` because min-height is
  // not honoured on display:table-cell, while height acts as a minimum there.
  {
    dir: 'table',
    label: 'AtlTableCell',
    ladder: 'row',
    steps: ['sm', 'md', 'lg'],
    markup: {
      default: (step) =>
        `<table class="atl-table variant-default size-${step}"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Row</td></tr></tbody></table>`,
      angular: (step) =>
        `<atl-table class="atl-table"><table class="atl-table variant-default size-${step}"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Row</td></tr></tbody></table></atl-table>`,
    },
    measure: { default: '.atl-table tbody td', angular: '.atl-table tbody td' },
  },
  {
    dir: 'table',
    label: 'AtlTableHead',
    ladder: 'row',
    steps: ['sm', 'md', 'lg'],
    markup: {
      default: (step) =>
        `<table class="atl-table variant-default size-${step}"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Row</td></tr></tbody></table>`,
      angular: (step) =>
        `<atl-table class="atl-table"><table class="atl-table variant-default size-${step}"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>Row</td></tr></tbody></table></atl-table>`,
    },
    measure: { default: '.atl-table thead th', angular: '.atl-table thead th' },
  },
  {
    dir: 'checkbox',
    label: 'AtlCheckboxRow',
    ladder: 'row',
    steps: ['sm'],
    markup: {
      default: () =>
        `<div class="atl-checkbox"><label><input type="checkbox"><span>Ship it</span></label></div>`,
      angular: () =>
        `<atl-checkbox><label><input type="checkbox"><span>Ship it</span></label></atl-checkbox>`,
    },
    measure: { default: '.atl-checkbox', angular: 'atl-checkbox' },
  },
  {
    dir: 'radio',
    label: 'AtlRadioRow',
    ladder: 'row',
    steps: ['sm'],
    markup: {
      default: () =>
        `<label class="atl-radio"><input type="radio"><span class="radio-text">Small</span></label>`,
      angular: () => `<atl-radio><input type="radio"><span class="radio-text">Small</span></atl-radio>`,
    },
    measure: { default: '.atl-radio', angular: 'atl-radio' },
  },
  {
    dir: 'toggle',
    label: 'AtlToggleRow',
    ladder: 'row',
    steps: ['sm'],
    markup: {
      default: () =>
        `<div class="atl-toggle"><label><input type="checkbox" role="switch"><span class="track"><span class="thumb"></span></span><span>Notifications</span></label></div>`,
      angular: () =>
        `<atl-toggle><label><input type="checkbox" role="switch"><span class="track"><span class="thumb"></span></span><span>Notifications</span></label></atl-toggle>`,
    },
    measure: { default: '.atl-toggle', angular: 'atl-toggle' },
  },
  {
    dir: 'accordion',
    label: 'AtlAccordionTrigger',
    ladder: 'row',
    steps: ['lg'],
    markup: {
      default: () =>
        `<div class="atl-accordion-group"><div class="atl-accordion-item"><h3 class="accordion-heading"><button class="accordion-trigger">Section</button></h3></div></div>`,
      angular: () =>
        `<atl-accordion-group class="atl-accordion-group"><atl-accordion-item class="atl-accordion-item"><h3 class="accordion-heading"><button class="accordion-trigger">Section</button></h3></atl-accordion-item></atl-accordion-group>`,
    },
    measure: { default: '.accordion-trigger', angular: '.accordion-trigger' },
  },
];

const errors = [];
const rows = [];

// ── the heights the tokens claim ──────────────────────────────────────────────
const tokensCss = readFileSync(
  resolve(ROOT, 'libs/create-workspace/src/generators/preset/files/styles/tokens.css'),
  'utf8'
);
const claimed = { control: {}, row: {} };
for (const m of tokensCss.matchAll(/--ui-control-height-([a-z]+)\s*:\s*([\d.]+)rem\s*;/g)) {
  claimed.control[m[1]] = parseFloat(m[2]) * 16; // the token file is rem-based; 1rem = 16px at the default root
}
// Row heights are a calc over the control scale plus twice the inset (ADR-0052), so
// resolve them here rather than parsing a calc: --ui-row-height-X = control X + 2 × inset.
const insetMatch = tokensCss.match(/--ui-row-inset\s*:\s*([\d.]+)rem\s*;/);
if (insetMatch) {
  const inset = parseFloat(insetMatch[1]) * 16;
  for (const [step, px] of Object.entries(claimed.control)) claimed.row[step] = px + 2 * inset;
}
if (Object.keys(claimed.control).length === 0) {
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
      if (/var\(\s*--ui-(control|row)-height-/.test(readFileSync(join(dirPath, f), 'utf8'))) {
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

/**
 * Angular compiles `:host` against the component's own element. Rewriting it to
 * the element's tag reproduces exactly that for geometry purposes: the attribute
 * selectors emulated encapsulation adds (`[_nghost-x]`) change specificity, never
 * a box. Bare selectors like `input { … }` are left alone because each component
 * is measured in a page of its own, so nothing else can match them.
 */
const hostify = (css, tag) =>
  css
    .replace(/:host\(([^)]*)\)/g, (_, inner) => {
      const sel = inner.trim();
      // `:host(atl-chat-header)` narrows the host to a *different* element than the
      // directory's own tag — one stylesheet serves several components. Rewriting it
      // to `${tag}${sel}` produced the nonsense selector `atl-chatatl-chat-header`
      // and made the rule match nothing, so the gate measured an unstyled box.
      return /^[a-z]/i.test(sel) ? sel : tag + sel;
    })
    .replace(/:host\b/g, tag);

const work = mkdtempSync(join(tmpdir(), 'atl-geometry-'));
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

for (const fw of FRAMEWORKS) {
  const tokens = readFileSync(join(ROOT, 'libs', fw, 'src/styles/tokens.css'), 'utf8');
  for (const control of CONTROLS) {
    const dirPath = join(ROOT, 'libs', fw, 'src/lib', control.dir);
    let componentCss = readdirSync(dirPath)
      .filter((f) => f.endsWith('.css'))
      .map((f) => readFileSync(join(dirPath, f), 'utf8'))
      .join('\n');
    const isNg = fw === 'angular';
    if (isNg) componentCss = hostify(componentCss, `atl-${control.dir}`);
    const markup = isNg ? control.markup.angular : control.markup.default;
    const selector = isNg ? control.measure.angular : control.measure.default;

    for (const step of control.steps) {
      // No reset: the fixture must not supply what a consuming app might not.
      const html =
        `<!doctype html><html><head><style>\nbody { margin: 0; font-family: sans-serif; }\n` +
        `${tokens}\n${componentCss}\n</style></head><body>${markup(step)}</body></html>`;
      const fixture = join(work, `${fw}-${control.dir}-${step}.html`);
      writeFileSync(fixture, html);
      await tab.goto('file://' + fixture);

      const measured = await tab.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().height : null;
      }, selector);

      // Same box, with inherited line-heights perturbed. Unchanged means the height
      // is stated; changed means it follows whatever text metrics it inherits.
      await tab.addStyleTag({ content: INHERITED_METRIC_PROBE[control.ladder || 'control'] });
      const perturbed = await tab.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().height : null;
      }, selector);

      if (measured !== null && perturbed !== null && Math.abs(measured - perturbed) > TOL) {
        errors.push(
          `[CONTENT-DRIVEN] ${fw}/${control.label} size=${step} is ${measured}px normally but ${perturbed}px once ` +
            `inherited line-heights change, so its height is decided by text metrics rather than by its token. ` +
            `It measures right here only because the content happens to fit — on a machine with different fonts it ` +
            `does not (that is how AtlSelect passed locally and failed in CI). Declare the control line-height on ` +
            `the rule and derive the block padding from the height (ADR-0041, ADR-0048).`
        );
      }

      const ladder = control.ladder || 'control';
      const want = claimed[ladder][step];
      if (measured === null) {
        errors.push(
          `[MARKUP] ${fw}/${control.label} ${step}: the fixture markup in CONTROLS produces no element matching \`${selector}\`. Fix the entry.`
        );
        continue;
      }
      if (want === undefined) {
        errors.push(`[TOKEN] ${control.label} ${step}: the token source declares no --ui-${ladder}-height-${step}.`);
        continue;
      }
      const off = Math.abs(measured - want);
      rows.push({ fw, label: control.label, step, height: measured, want, ok: off <= TOL });
      if (off > TOL) {
        errors.push(
          `[HEIGHT] ${fw}/${control.label} size=${step} renders ${measured}px but --ui-control-height-${step} claims ${want}px ` +
            `(off by ${off.toFixed(2)}px). A control derives its block padding from the height (ADR-0041); a row states the ` +
            `height, zeroes the block padding and centres its content (ADR-0052). Also check that no later ` +
            `shorthand — \`all: unset\`, \`font:\` — resets what an earlier declaration stated. And ` +
            `check the component declares its geometry contract (ADR-0043).`
        );
      }
    }
  }
}
await browser.close();

// ── report ───────────────────────────────────────────────────────────────────
if (!QUIET) {
  for (const r of rows) {
    console.log(
      `  ${r.ok ? 'PASS' : 'FAIL'}  ${r.fw.padEnd(8)} ${r.label.padEnd(11)} size=${r.step.padEnd(3)} ${String(r.height).padStart(6)}px  (token ${r.want}px)`
    );
  }
}
const summary =
  `${rows.length} measurement(s): ${CONTROLS.length} component(s) × ${FRAMEWORKS.length} framework(s), ` +
  `each measured against a perturbed inherited line-height, and no reset supplied`;
if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} geometry issue(s). ${summary}.`);
  process.exit(1);
}
console.log(`✓ every control renders the height its token claims (${summary}).`);
