#!/usr/bin/env node
/**
 * gen-artboard-palette.mjs
 *
 * The `:root` palette every Claude Design artboard uses, derived from the canonical
 * tokens.css.
 *
 *   node tools/scripts/gen-artboard-palette.mjs            write tools/design/artboard-palette.css
 *   node tools/scripts/gen-artboard-palette.mjs --check    fail on drift  (npm run check:artboard-palette)
 *
 * Why a copy exists at all: an artboard renders STANDALONE in Claude Design, where the
 * library's tokens.css is not loaded. `_sheet.css` therefore carries the light-mode
 * values as literals — deliberately, and its own header says so. That is not the defect.
 *
 * The defect is that the copy was hand-maintained, and on 2026-08-27 it had drifted in
 * **7 of 40 values** — including `--success`, `--warning` and `--info`, the three status
 * colours ADR-0054's ramps changed, so all 31 artboards were still painting the pre-ramp
 * palette (ADR-0071).
 *
 * The recorded remedy was to GATE raw hex in artboards (ADR-0032 alternative 4). That
 * fights the medium: an artboard must carry literals. The remedy `check:tokens` already
 * uses for the three framework copies of tokens.css is the right one — the copy is
 * GENERATED, and a generated copy cannot drift.
 *
 * Why the file lands in the repo rather than in Claude Design: the Claude Design MCP is
 * interactively authenticated, so a spawned script cannot reach it. This splits the chain
 * into a gated hop and a manual one:
 *
 *   tokens.css  --(this script, gated by check:artboard-palette)-->  artboard-palette.css
 *   artboard-palette.css  --(an agent with MCP access)-->  _sheet.css in Claude Design
 *
 * The second hop is still by hand, but it now copies one generated block instead of
 * retyping forty values, and any difference is a diff rather than an archaeology problem.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const TOKENS = resolve(ROOT, 'libs/create-workspace/src/generators/preset/files/styles/tokens.css');
const OUT = resolve(ROOT, 'tools/design/artboard-palette.css');

/**
 * The artboard's short name -> the `--ui-*` token it mirrors.
 *
 * The short names are the artboards' own, and they stay: `--primary` reads better in a
 * sheet than `--ui-color-primary`, and 31 files already use them. What matters is that
 * each one has exactly one source, named here.
 */
const MAP = [
  ['— colour'],
  ['primary', 'color-primary'],
  ['primary-hover', 'color-primary-hover'],
  ['primary-light', 'color-primary-light'],
  ['danger', 'color-danger'],
  ['danger-text', 'color-danger-text'],
  ['success', 'color-success'],
  ['warning', 'color-warning'],
  ['info', 'color-info'],
  ['surface', 'color-surface'],
  ['sunken', 'color-surface-sunken'],
  ['border', 'color-border'],
  ['border-strong', 'color-border-strong'],
  ['border-hover', 'color-border-hover'],
  ['placeholder', 'color-placeholder'],
  ['text', 'color-text'],
  ['text-on-primary', 'color-text-on-primary'],
  ['muted', 'color-text-muted'],
  ['disabled', 'opacity-disabled'],
  ['— radius'],
  ['r-sm', 'radius-sm'],
  ['r-md', 'radius-md'],
  ['r-lg', 'radius-lg'],
  ['r-xl', 'radius-xl'],
  ['r-full', 'radius-full'],
  ['— the control ladder'],
  ['h-sm', 'control-height-sm'],
  ['h-md', 'control-height-md'],
  ['h-lg', 'control-height-lg'],
  ['— borders and leading'],
  ['bw', 'border-width'],
  ['bw-thick', 'border-width-thick'],
  ['lh-tight', 'line-height-tight'],
  ['lh-normal', 'line-height-normal'],
  ['— spacing'],
  ['s1', 'spacing-1'],
  ['s2', 'spacing-2'],
  ['s3', 'spacing-3'],
  ['s4', 'spacing-4'],
  ['s5', 'spacing-5'],
  ['s6', 'spacing-6'],
  ['s8', 'spacing-8'],
  ['— type'],
  ['sans', 'font-family'],
  ['serif', 'font-display'],
  ['mono', 'font-mono'],
  ['— effects'],
  ['shadow-md', 'shadow-md'],
  ['shadow-lg', 'shadow-lg'],
];

/** The row ladder is DERIVED in tokens.css and stays derived here, so the relationship
 *  survives the copy instead of being flattened into three numbers. */
const DERIVED = `  /* The row ladder (ADR-0052), derived from the control ladder exactly as tokens.css
     derives it: a row is taller than the control it holds by two insets, which is what
     makes "any control fits any row of the same step" true by construction. A row states
     its height and centres its content; a control states its height and derives its
     padding. */
  --row-inset: __ROW_INSET__;
  --h-row-sm: calc(var(--h-sm) + 2 * var(--row-inset));
  --h-row-md: calc(var(--h-md) + 2 * var(--row-inset));
  --h-row-lg: calc(var(--h-lg) + 2 * var(--row-inset));

  /* The focus rings are compositions, not tokens — they reference the palette above. */
  --ring: 0 0 0 2px var(--surface), 0 0 0 4px var(--primary);
  --ring-danger: 0 0 0 2px var(--surface), 0 0 0 4px var(--danger);`;

export function buildPalette() {
  const css = readFileSync(TOKENS, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const first = new Map();
  for (const m of css.matchAll(/(--ui-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    if (!first.has(m[1])) first.set(m[1], m[2].replace(/\s+/g, ' ').trim());
  }
  /** Resolve one `var(--ui-…)` alias chain, so the artboard gets a literal. */
  const resolve1 = (v, depth = 0) => {
    if (depth > 6) return v;
    const m = /^var\((--ui-[a-z0-9-]+)\)$/.exec(v.trim());
    return m && first.has(m[1]) ? resolve1(first.get(m[1]), depth + 1) : v;
  };

  const missing = [];
  const lines = [];
  for (const entry of MAP) {
    if (entry.length === 1) {
      lines.push(`\n  /* ${entry[0].replace(/^— /, '')} */`);
      continue;
    }
    const [short, token] = entry;
    const raw = first.get(`--ui-${token}`);
    if (raw === undefined) {
      missing.push(token);
      continue;
    }
    lines.push(`  --${short}: ${resolve1(raw)};`);
  }
  const inset = first.get('--ui-row-inset');
  if (inset === undefined) missing.push('row-inset');

  if (missing.length) {
    throw new Error(
      `tokens.css has no --ui-${missing.join(', no --ui-')} — the map in ` +
        `gen-artboard-palette.mjs names a token that no longer exists.`
    );
  }

  return (
    `/* GENERATED by tools/scripts/gen-artboard-palette.mjs — do not edit.\n` +
    ` *\n` +
    ` * The light-mode palette every Claude Design artboard uses, derived from\n` +
    ` * libs/create-workspace/src/generators/preset/files/styles/tokens.css.\n` +
    ` *\n` +
    ` * An artboard renders standalone, where tokens.css is not loaded, so it carries the\n` +
    ` * values as literals. That copy is generated rather than maintained, because when it\n` +
    ` * was maintained it drifted in 7 of 40 values (ADR-0071).\n` +
    ` *\n` +
    ` * To update Claude Design: replace the ':root { … }' block at the top of _sheet.css\n` +
    ` * in the Atelier project with this file's block.\n` +
    ` */\n\n` +
    `:root {\n` +
    lines.join('\n').replace(/^\n/, '') +
    `\n\n` +
    DERIVED.replace('__ROW_INSET__', inset) +
    `\n}\n`
  );
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  let text;
  try {
    text = buildPalette();
  } catch (err) {
    console.error(`✗ gen:artboard-palette — ${err.message}`);
    process.exit(1);
  }
  if (process.argv.includes('--check')) {
    if (!existsSync(OUT)) {
      console.error(`✗ ${OUT} is missing. Run: npm run gen:artboard-palette`);
      process.exit(1);
    }
    const have = readFileSync(OUT, 'utf8');
    if (have !== text) {
      console.error(
        `✗ tools/design/artboard-palette.css is out of sync with tokens.css.\n` +
          `  Run: npm run gen:artboard-palette — then push the block into _sheet.css in\n` +
          `  the Claude Design "Atelier" project, or the 31 artboards keep the old palette.`
      );
      process.exit(1);
    }
    const count = text.split('\n').filter((l) => /^\s+--/.test(l)).length;
    console.log(`✓ artboard palette in sync with tokens.css (${count} value(s)).`);
  } else {
    writeFileSync(OUT, text);
    const count = text.split('\n').filter((l) => /^\s+--/.test(l)).length;
    console.log(`✓ wrote tools/design/artboard-palette.css — ${count} value(s) from tokens.css.`);
  }
}
