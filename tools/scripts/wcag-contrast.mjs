#!/usr/bin/env node
// WCAG 2.2 contrast ratio checker for the design-rebrief R1 token swap.
// No dependencies; run with: node tools/scripts/wcag-contrast.mjs

const hexToRgb = (hex) => {
  const m = hex.replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) throw new Error(`bad hex: ${hex}`);
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const channelToLinear = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

const luminance = ([r, g, b]) =>
  0.2126 * channelToLinear(r) +
  0.7152 * channelToLinear(g) +
  0.0722 * channelToLinear(b);

const ratio = (a, b) => {
  const la = luminance(hexToRgb(a));
  const lb = luminance(hexToRgb(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

const grade = (r, role) => {
  if (role === 'decorative') {
    // WCAG 1.4.11 exemption: borders that don't identify a UI component
    // (component identified by fill, elevation, or label) are exempt.
    return { pass: true, target: 0, mark: 'INFO' };
  }
  const target = role === 'large' || role === 'ui' ? 3.0 : 4.5;
  const pass = r >= target;
  return { pass, target, mark: pass ? 'PASS' : 'FAIL' };
};

// The palette is READ from the token source, never copied here. The previous
// version of this script kept its own hardcoded duplicate of every hex value,
// which is why it could only ever be a one-off report: nothing stopped
// tokens.css and this file from disagreeing silently.
//
// Source of truth is the generator preset (tools/scripts/sync-tokens.mjs
// propagates it into the three framework libs).
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const TOKENS_FILE = resolve(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);
const css = readFileSync(TOKENS_FILE, 'utf-8');

/** Every `--ui-color-*: value;` inside one brace-balanced block, keyed without the prefix. */
const declarationsIn = (block) => {
  const out = {};
  for (const m of block.matchAll(/--ui-color-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim();
  }
  return out;
};

/** The block a selector opens, up to its matching close brace. */
const blockFor = (selector) => {
  const at = css.indexOf(selector);
  if (at === -1) throw new Error(`token source has no \`${selector}\` block`);
  let i = css.indexOf('{', at);
  if (i === -1) throw new Error(`\`${selector}\` has no opening brace`);
  let depth = 0;
  const from = i;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(from, i);
  }
  throw new Error(`unbalanced braces after \`${selector}\``);
};

/** Resolve `var(--ui-color-x)` chains within one mode; unresolved aliases are an error. */
const resolveAliases = (mode, map) => {
  const seen = new Map();
  const resolve1 = (key, trail) => {
    if (seen.has(key)) return seen.get(key);
    const raw = map[key];
    if (raw === undefined) return undefined;
    const alias = /^var\(\s*--ui-color-([a-z0-9-]+)\s*\)$/.exec(raw);
    let value = raw;
    if (alias) {
      if (trail.includes(key)) throw new Error(`circular alias: ${trail.join(' -> ')} -> ${key}`);
      const target = resolve1(alias[1], [...trail, key]);
      if (target === undefined) {
        throw new Error(`${mode}: --ui-color-${key} aliases --ui-color-${alias[1]}, which this mode does not define`);
      }
      value = target;
    }
    seen.set(key, value);
    return value;
  };
  const out = {};
  for (const key of Object.keys(map)) out[key] = resolve1(key, []);
  return out;
};

// Light lives on :root. Dark: the media-query block is the baseline, and
// [data-theme="dark"] is the explicit escape hatch — both are checked, because a
// pair that passes under one and fails under the other is still a real failure.
const lightRoot = declarationsIn(blockFor(':root'));
const darkMedia = declarationsIn(blockFor('@media (prefers-color-scheme: dark)'));
const darkAttr = declarationsIn(blockFor('[data-theme="dark"]'));
const lightAttr = declarationsIn(blockFor('[data-theme="light"]'));

// A malformed token source is a gate failure, not a crash — so the parse is
// guarded the same way the comparison is.
let tokens;
try {
  tokens = {
    light: resolveAliases('light', lightRoot),
    'light (data-theme)': resolveAliases('light (data-theme)', { ...lightRoot, ...lightAttr }),
    dark: resolveAliases('dark', { ...lightRoot, ...darkMedia }),
    'dark (data-theme)': resolveAliases('dark (data-theme)', { ...lightRoot, ...darkAttr }),
  };
} catch (err) {
  console.error(`\u2717 contrast gate cannot read the token source — ${err.message}`);
  process.exit(1);
}

// pairs format: [fgKey, bgKey, role: 'normal' | 'large' | 'ui', note]
const pairs = [
  // Body text on every surface tier
  ['text', 'surface', 'normal', 'body text'],
  ['text', 'surface-raised', 'normal', 'body text on raised'],
  ['text', 'surface-sunken', 'normal', 'body text on sunken (code blocks)'],
  ['text-muted', 'surface', 'normal', 'secondary text'],
  ['text-muted', 'surface-raised', 'normal', 'secondary on raised'],
  ['text-muted', 'surface-sunken', 'normal', 'secondary on sunken'],
  // Primary axis
  ['primary', 'surface', 'large', 'primary heading / focus ring'],
  ['primary', 'surface-raised', 'large', 'primary on raised'],
  ['primary', 'surface-sunken', 'large', 'primary on sunken'],
  ['text-on-primary', 'primary', 'normal', 'button label on primary fill'],
  ['text-on-primary', 'primary-hover', 'normal', 'button label on primary hover'],
  ['text-on-primary', 'primary-active', 'normal', 'button label on primary active'],
  // Semantic — text on tinted bg (Badge / Alert / Toast)
  ['danger-text', 'danger-bg', 'normal', 'danger text on danger callout'],
  ['success-text', 'success-bg', 'normal', 'success text on success callout'],
  ['warning-text', 'warning-bg', 'normal', 'warning text on warning callout'],
  ['info-text', 'info-bg', 'normal', 'info text on info callout'],
  // Semantic — text on neutral surface (alert title)
  ['danger', 'surface', 'normal', 'danger heading on neutral'],
  ['danger', 'surface-raised', 'normal', 'danger heading on raised'],
  ['success', 'surface', 'normal', 'success heading on neutral'],
  ['success', 'surface-raised', 'normal', 'success heading on raised'],
  ['warning', 'surface', 'normal', 'warning heading on neutral'],
  ['info', 'surface', 'normal', 'info heading on neutral'],
  // Borders — split decorative from functional
  ['border', 'surface', 'decorative', 'card border (card fill identifies, WCAG 1.4.11 exempt)'],
  ['border', 'surface-raised', 'decorative', 'card border on raised (decorative)'],
  ['border-strong', 'surface', 'ui', 'input / outline-button border (functional, must ≥3:1)'],
  ['border-strong', 'surface-raised', 'ui', 'input border on raised (functional)'],
];

// A gate is quiet on success: --check prints only the verdict.
const QUIET = process.argv.includes('--check');

const colorize = (s, ok) => (ok ? `\x1b[32m${s}\x1b[0m` : `\x1b[31m${s}\x1b[0m`);

const runMode = (mode) => {
  const t = tokens[mode];
  const lines = [];
  let pass = 0;
  let fail = 0;
  lines.push(`\n# ${mode.toUpperCase()} MODE\n`);
  lines.push('| pair | role | ratio | target | result | note |');
  lines.push('|---|---|---|---|---|---|');
  for (const [fg, bg, role, note] of pairs) {
    for (const [label, key] of [['foreground', fg], ['background', bg]]) {
      if (!t[key]) {
        throw new Error(`${mode}: pair "${fg} on ${bg}" names ${label} --ui-color-${key}, which the token source does not define in this mode`);
      }
    }
    const r = ratio(t[fg], t[bg]);
    const g = grade(r, role);
    if (g.pass) pass++;
    else fail++;
    const rounded = r.toFixed(2);
    const targetCell = g.target === 0 ? 'n/a' : g.target;
    lines.push(
      `| \`${fg}\` on \`${bg}\` | ${role} | **${rounded}** | ${targetCell} | ${g.mark} | ${note} |`
    );
    if (!QUIET)
      console.log(
      colorize(`  ${g.mark}`, g.pass),
      `${rounded.padStart(5)}`,
      `(target ${targetCell})`,
      `— ${fg} on ${bg}`,
      `(${note})`
    );
  }
  lines.push(`\n**${mode}: ${pass} pass / ${fail} fail**`);
  return { lines: lines.join('\n'), pass, fail };
};

const MODES = Object.keys(tokens);
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const reportAt = args.includes('--report') ? args[args.indexOf('--report') + 1] : null;

let results;
try {
  results = MODES.map((mode) => ({ mode, ...runMode(mode) }));
} catch (err) {
  // A malformed token source is a gate failure, not a crash: print the reason,
  // not a stack trace.
  console.error(`\u2717 contrast gate cannot read the token source — ${err.message}`);
  process.exit(1);
}
const total = results.reduce((n, r) => n + r.pass, 0);
const failures = results.reduce((n, r) => n + r.fail, 0);

if (!checkOnly) {
  console.log(`\nTotal: ${total} pass / ${failures} fail across ${MODES.length} modes.`);
}

if (reportAt) {
  const out = [
    '# Contrast verification',
    '',
    `_Generated by \`node tools/scripts/wcag-contrast.mjs --report ${reportAt}\`._`,
    '',
    'Palette read from the generator preset token source, not copied. Targets:',
    'WCAG 2.2 AA — normal text 4.5:1, large text and UI components 3:1.',
    'Decorative borders are exempt per WCAG 1.4.11 (the component is identified',
    'by its fill, elevation, or label rather than its outline).',
    '',
    ...results.map((r) => r.lines),
    '',
    '## Summary',
    '',
    ...results.map((r) => `- ${r.mode}: ${r.pass} pass / ${r.fail} fail`),
    `- total: ${total} pass / ${failures} fail`,
    '',
  ].join('\n');
  const { writeFileSync } = await import('node:fs');
  writeFileSync(reportAt, out);
  console.log(`\nWrote ${reportAt}`);
}

if (failures > 0) {
  console.error(
    `\n\u2717 ${failures} token pair(s) below their WCAG 2.2 AA target across ${MODES.length} modes. ` +
      `Adjust the hex values in the token source — this gate reads them, so there is nothing else to update.`
  );
  process.exit(1);
}
console.log(
  `\u2713 contrast in sync (${total} pair(s) at or above WCAG 2.2 AA across ${MODES.length} modes: ${MODES.join(', ')}).`
);
