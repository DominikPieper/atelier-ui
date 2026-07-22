#!/usr/bin/env node
/**
 * gen-figma-library-tokens.mjs
 *
 * Parse the canonical tokens.css (the create-workspace preset copy — same
 * source sync-tokens.mjs projects into the framework libs) into a
 * Figma-variable definition list for the "Library Tokens" collection:
 * one entry per token with { name, type, scopes, light, dark, aliasOf }.
 *
 * Name transformation (documented in tasks/figma-audit-2026-07-22.md):
 *   --ui-color-text        → color/text
 *   --ui-spacing-4         → spacing/4
 *   --ui-radius-md         → radius/md
 *   --ui-font-size-xs      → font-size/xs
 *   --ui-font-weight-*     → font-weight/*
 *   --ui-line-height-*     → line-height/*
 *   --ui-opacity-disabled  → opacity/disabled
 *   --ui-font-family       → font/family
 *
 * rem values are converted to px at the 16px root the docs site uses.
 * var() references become in-collection aliases (aliasOf) when both modes
 * point at the same target; otherwise per-mode literals.
 *
 * Deliberately skipped (not representable as simple Figma variables):
 *   shadows (Effect territory), easings/durations/transitions (Motion
 *   Tokens collection), letter-spacing (em-relative), z-index (code-only),
 *   the composite --ui-focus-ring.
 *
 * Usage: node tools/scripts/gen-figma-library-tokens.mjs   # JSON on stdout
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = resolve(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);

const SKIP = /^--ui-(shadow|ease|duration|transition|z|focus-ring|letter-spacing)/;

function parseBlock(css, selectorRe) {
  const m = selectorRe.exec(css);
  if (!m) return {};
  // Match the block by brace counting from the selector.
  let depth = 0;
  let i = css.indexOf('{', m.index);
  const start = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  const body = css.slice(start, i);
  const out = {};
  for (const decl of body.matchAll(/(--ui-[\w-]+)\s*:\s*([^;]+);/g)) {
    out[decl[1]] = decl[2].replace(/\s+/g, ' ').trim();
  }
  return out;
}

function cssName(name) {
  const bare = name.replace(/^--ui-/, '');
  if (bare === 'font-family') return { token: 'font/family', type: 'STRING' };
  let m;
  if ((m = /^font-size-(.+)$/.exec(bare))) return { token: `font-size/${m[1]}`, type: 'FLOAT' };
  if ((m = /^font-weight-(.+)$/.exec(bare))) return { token: `font-weight/${m[1]}`, type: 'FLOAT' };
  if ((m = /^line-height-(.+)$/.exec(bare))) return { token: `line-height/${m[1]}`, type: 'FLOAT' };
  if ((m = /^spacing-(.+)$/.exec(bare))) return { token: `spacing/${m[1]}`, type: 'FLOAT' };
  if ((m = /^radius-(.+)$/.exec(bare))) return { token: `radius/${m[1]}`, type: 'FLOAT' };
  if ((m = /^opacity-(.+)$/.exec(bare))) return { token: `opacity/${m[1]}`, type: 'FLOAT' };
  if ((m = /^color-(.+)$/.exec(bare))) return { token: `color/${m[1]}`, type: 'COLOR' };
  return null;
}

function parseValue(raw, type) {
  if (type === 'STRING') return raw;
  const varRef = /^var\((--ui-[\w-]+)\)$/.exec(raw);
  if (varRef) return { ref: varRef[1] };
  if (type === 'FLOAT') {
    const rem = /^([\d.]+)rem$/.exec(raw);
    if (rem) return parseFloat(rem[1]) * 16;
    const px = /^([\d.]+)px$/.exec(raw);
    if (px) return parseFloat(px[1]);
    const num = /^-?[\d.]+$/.exec(raw);
    if (num) return parseFloat(raw);
    return null;
  }
  // COLOR
  const hex = /^#([0-9a-f]{6})$/i.exec(raw);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 };
  }
  const rgba = /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/.exec(raw);
  if (rgba) {
    return {
      r: parseInt(rgba[1]) / 255,
      g: parseInt(rgba[2]) / 255,
      b: parseInt(rgba[3]) / 255,
      a: parseFloat(rgba[4]),
    };
  }
  return null;
}

const SCOPE_RULES = [
  [/^color\/(text|placeholder)/, ['TEXT_FILL']],
  [/^color\/.*-text$/, ['TEXT_FILL']],
  [/^color\/(surface|overlay|input-bg|.*-bg)/, ['FRAME_FILL', 'SHAPE_FILL']],
  [/^color\/(border|input-border)/, ['STROKE_COLOR']],
  [/^color\//, ['ALL_FILLS', 'STROKE_COLOR']],
  [/^spacing\//, ['GAP']],
  [/^radius\//, ['CORNER_RADIUS']],
  [/^font-size\//, ['FONT_SIZE']],
  [/^font-weight\//, ['FONT_WEIGHT']],
  [/^line-height\//, ['LINE_HEIGHT']],
  [/^opacity\//, ['OPACITY']],
  [/^font\/family$/, ['FONT_FAMILY']],
];
function scopesFor(token) {
  for (const [re, scopes] of SCOPE_RULES) if (re.test(token)) return scopes;
  return ['ALL_SCOPES'];
}

export function buildDefs() {
  const css = readFileSync(SOURCE, 'utf8');
  const light = parseBlock(css, /:root\s*/);
  const dark = parseBlock(css, /\[data-theme="dark"\]\s*/);

  const defs = [];
  for (const [cssVar, rawLight] of Object.entries(light)) {
    if (SKIP.test(cssVar)) continue;
    const named = cssName(cssVar);
    if (!named) continue;
    const rawDark = dark[cssVar] ?? rawLight;
    const lightVal = parseValue(rawLight, named.type);
    const darkVal = parseValue(rawDark, named.type);
    if (lightVal === null || darkVal === null) {
      console.error(`skip (unparsed): ${cssVar} = ${rawLight} / ${rawDark}`);
      continue;
    }
    const entry = {
      cssVar,
      name: named.token,
      type: named.type,
      scopes: scopesFor(named.token),
    };
    // Same var() target in both modes → a real in-collection alias.
    if (lightVal?.ref && darkVal?.ref && lightVal.ref === darkVal.ref) {
      entry.aliasOf = cssName(lightVal.ref)?.token ?? null;
    } else {
      // Resolve any single-mode ref to its literal in that mode.
      const resolveRef = (val, table) =>
        val?.ref ? parseValue(table[val.ref] ?? '', named.type) : val;
      entry.light = resolveRef(lightVal, light);
      entry.dark = resolveRef(darkVal, { ...light, ...dark });
    }
    defs.push(entry);
  }
  return defs;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const defs = buildDefs();
  process.stdout.write(JSON.stringify(defs, null, 2) + '\n');
  console.error(`${defs.length} token definitions (source: ${SOURCE.replace(ROOT + '/', '')})`);
}
