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

const tokens = {
  light: {
    surface: '#f7f5f0',
    'surface-raised': '#ffffff',
    'surface-sunken': '#ece9e1',
    primary: '#0a2540',
    'primary-hover': '#143659',
    'primary-active': '#061a30',
    accent: '#506c36',
    'accent-bg': '#e8efde',
    text: '#0f172a',
    'text-muted': '#48556e',
    border: '#d8d3c5',
    'border-strong': '#76716a',
    danger: '#9b1c1c',
    'danger-bg': '#fbe7e7',
    'danger-text': '#7a1414',
    success: '#1f6b3e',
    'success-bg': '#e2f1e6',
    'success-text': '#155228',
    warning: '#985808',
    'warning-bg': '#fbeed4',
    'warning-text': '#7a4607',
    info: '#0050a0',
    'info-bg': '#dde8f6',
    'info-text': '#063872',
    'text-on-primary': '#ffffff',
    'text-on-accent': '#ffffff',
    'text-on-danger': '#ffffff',
  },
  dark: {
    surface: '#0c1620',
    'surface-raised': '#13202c',
    'surface-sunken': '#08111a',
    primary: '#5fa7ff',
    'primary-hover': '#82bbff',
    'primary-active': '#a6cffe',
    accent: '#a3c87a',
    'accent-bg': '#1c2618',
    text: '#f1f5f9',
    'text-muted': '#a4b4ce',
    border: '#2a3a4d',
    'border-strong': '#5d6f8c',
    danger: '#f87a7a',
    'danger-bg': '#3a1414',
    'danger-text': '#fca5a5',
    success: '#7ed99e',
    'success-bg': '#0f3320',
    'success-text': '#9ee9b8',
    warning: '#f5c161',
    'warning-bg': '#3a2510',
    'warning-text': '#f7d28b',
    info: '#7ab7ff',
    'info-bg': '#102338',
    'info-text': '#a3cdff',
    'text-on-primary': '#0a2540',
    'text-on-accent': '#0c1620',
    'text-on-danger': '#0c1620',
  },
};

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
  // Accent axis (workshop affordances)
  ['accent', 'surface', 'large', 'accent text/icon'],
  ['accent', 'surface-raised', 'large', 'accent on raised'],
  ['accent', 'accent-bg', 'normal', 'accent text on accent-tinted callout'],
  ['text-on-accent', 'accent', 'normal', 'label on accent fill'],
  ['text', 'accent-bg', 'normal', 'body text on accent callout'],
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
    const r = ratio(t[fg], t[bg]);
    const g = grade(r, role);
    if (g.pass) pass++;
    else fail++;
    const rounded = r.toFixed(2);
    const targetCell = g.target === 0 ? 'n/a' : g.target;
    lines.push(
      `| \`${fg}\` on \`${bg}\` | ${role} | **${rounded}** | ${targetCell} | ${g.mark} | ${note} |`
    );
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

console.log('\n=== WCAG 2.2 contrast verification — design rebrief R1 ===');
const light = runMode('light');
const dark = runMode('dark');
const total = light.pass + dark.pass;
const failures = light.fail + dark.fail;
console.log(`\nTotal: ${total} pass / ${failures} fail across both modes.`);

const out = [
  '# Design rebrief — contrast verification log (R1)',
  '',
  '_Generated 2026-04-26 by `tools/scripts/wcag-contrast.mjs`._',
  '',
  'Direction C, Q1–Q5 decisions per `~/.claude/plans/atelier-design-rebrief.md` §15.',
  'Targets: WCAG 2.2 AA — normal text 4.5:1, large text/UI 3:1.',
  '',
  light.lines,
  dark.lines,
  '',
  '## Summary',
  '',
  `- light: ${light.pass} pass / ${light.fail} fail`,
  `- dark:  ${dark.pass} pass / ${dark.fail} fail`,
  `- total: ${total} pass / ${failures} fail`,
  '',
  failures === 0
    ? 'All proposed token pairs meet WCAG 2.2 AA. Cleared to ship as R1.'
    : `**${failures} pair(s) fail AA** — adjust hex values before R1 lands.`,
  '',
].join('\n');

import('node:fs').then((fs) => {
  fs.writeFileSync('tasks/design-rebrief-contrast-2026-04-26.md', out);
  console.log(
    '\nWrote tasks/design-rebrief-contrast-2026-04-26.md',
    failures === 0 ? '— all pass' : `— ${failures} fail`
  );
  process.exit(failures === 0 ? 0 : 1);
});
