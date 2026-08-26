#!/usr/bin/env node
/**
 * check-token-bypass.js
 *
 * Catches a literal whose value a token already holds — the one kind of
 * unbound value that is objectively wrong.
 *
 * This gate deliberately does NOT demand that every value be a token. Of the
 * ~190 literals in the component stylesheets, most are component dimensions
 * (an avatar size, a toggle track, a step circle) with exactly one user;
 * tokenising them would produce a hundred single-use tokens — the rule of three
 * violated in token form. Seventeen are viewport units, which no token can hold.
 *
 * What IS wrong is a literal that duplicates a token in the family its property
 * should draw from. Thirteen of those existed when this gate was written, and
 * two of them were live defects: AtlTab and AtlCodeBlock's header both hardcoded
 * `2.5rem` where `--ui-control-height-md` already said 2.5rem — so they were
 * invisible to `check:geometry`, whose roster is built from token *references*,
 * and both rendered the wrong height (41px and 43px against 40). See ADR-0047.
 *
 * Family per property, so the gate never suggests a spacing token for a width:
 *   z-index → --ui-z-*      opacity → --ui-opacity-*     font-size → --ui-font-size-*
 *   line-height → --ui-line-height-*                     letter-spacing → --ui-letter-spacing-*
 *   border-radius → --ui-radius-*                        box-shadow → --ui-shadow-*
 *   padding/margin/gap → --ui-spacing-*                  min-height/height → --ui-control-height-*
 *   border widths → --ui-border-width*
 *
 * Exceptions live in lib/allowlists.js (TOKEN_BYPASS_EXEMPT), split into
 * `design` (the shared value is a coincidence — silent) and `gap` (should bind,
 * has not yet — warns every run).
 *
 * Run via:  node tools/scripts/check-token-bypass.js  (or  npm run check:token-bypass)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { FRAMEWORKS } = require('./lib/component-discovery');
const { TOKEN_BYPASS_EXEMPT } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const TOKEN_SOURCE = path.join(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);

/** Which token family a property may draw from. */
const FAMILY = {
  'z-index': /^--ui-z-/,
  opacity: /^--ui-opacity-/,
  'letter-spacing': /^--ui-letter-spacing-/,
  'font-size': /^--ui-font-size-/,
  'line-height': /^--ui-line-height-/,
  'border-radius': /^--ui-radius-/,
  'box-shadow': /^--ui-shadow-/,
  'transition-duration': /^--ui-duration-/,
  'animation-duration': /^--ui-duration-/,
  padding: /^--ui-spacing-/,
  'padding-top': /^--ui-spacing-/,
  'padding-right': /^--ui-spacing-/,
  'padding-bottom': /^--ui-spacing-/,
  'padding-left': /^--ui-spacing-/,
  margin: /^--ui-spacing-/,
  'margin-top': /^--ui-spacing-/,
  'margin-right': /^--ui-spacing-/,
  'margin-bottom': /^--ui-spacing-/,
  'margin-left': /^--ui-spacing-/,
  gap: /^--ui-spacing-/,
  'row-gap': /^--ui-spacing-/,
  'column-gap': /^--ui-spacing-/,
  'min-height': /^--ui-control-height-/,
  height: /^--ui-control-height-/,
  width: /^--ui-control-height-/,
  'min-width': /^--ui-control-height-/,
};

/** Border widths get their own rule: any literal length is a bypass. */
const BORDER_PROP = /^border(-top|-right|-bottom|-left)?(-width)?$/;

/** Values that mean "nothing", not "a measurement". */
const STRUCTURAL = new Set(['0', 'none', 'auto', 'inherit', 'initial', 'unset', 'currentColor', 'transparent']);

const errors = [];
const warnings = [];
const exemptSeen = new Set();

// ── the token values, as declared in the light (`:root`) block ───────────────
const tokensCss = fs.readFileSync(TOKEN_SOURCE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const darkAt = tokensCss.indexOf('@media (prefers-color-scheme: dark)');
const lightBlock = darkAt === -1 ? tokensCss : tokensCss.slice(0, darkAt);
const tokenValue = {};
for (const m of lightBlock.matchAll(/(--ui-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  const value = m[2].trim();
  if (value.startsWith('var(')) continue; // an alias, not a value of its own
  tokenValue[m[1]] = value;
}

function tokensHolding(value, family) {
  return Object.keys(tokenValue).filter((name) => family.test(name) && tokenValue[name] === value);
}

for (const fw of FRAMEWORKS) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  if (!fs.existsSync(base)) continue;
  for (const dir of fs.readdirSync(base)) {
    const dirPath = path.join(base, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const file of fs.readdirSync(dirPath).filter((f) => f.endsWith('.css'))) {
      const rel = `libs/${fw}/src/lib/${dir}/${file}`;
      // Comments are stripped: a rule's own explanation may quote the literal it replaced.
      const css = fs.readFileSync(path.join(dirPath, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

      for (const m of css.matchAll(/(^|[;{])\s*([a-z-]+)\s*:\s*([^;{}]+)/g)) {
        const prop = m[2];
        const value = m[3].trim().replace(/\s+/g, ' ');
        if (value.includes('var(--ui-')) continue;
        if (STRUCTURAL.has(value)) continue;

        // border widths: any literal length, whether shorthand or not
        if (BORDER_PROP.test(prop)) {
          const width = value.match(/^([\d.]+)(px|rem|em)\b/);
          if (!width) continue;
          const key = `${dir}:${prop}:${width[0]}`;
          const exempt = TOKEN_BYPASS_EXEMPT[key];
          if (exempt) {
            exemptSeen.add(key);
            if (exempt.kind === 'gap') {
              warnings.push(`[GAP] ${rel} — ${prop}: ${width[0]} still unbound. ${exempt.why}`);
            }
            continue;
          }
          errors.push(
            `[BORDER] ${rel} sets ${prop}: ${value} with a literal width. Use var(--ui-border-width) ` +
              `or var(--ui-border-width-thick); if the value is a graphic device rather than a border ` +
              `weight, exempt it in TOKEN_BYPASS_EXEMPT with a reason.`
          );
          continue;
        }

        const family = FAMILY[prop];
        if (!family) continue;
        const holders = tokensHolding(value, family);
        if (holders.length === 0) continue;

        const key = `${dir}:${prop}:${value}`;
        const exempt = TOKEN_BYPASS_EXEMPT[key];
        if (exempt) {
          exemptSeen.add(key);
          if (exempt.kind === 'gap') {
            warnings.push(`[GAP] ${rel} — ${prop}: ${value} should bind to var(${holders[0]}). ${exempt.why}`);
          }
          continue;
        }
        errors.push(
          `[BYPASS] ${rel} sets ${prop}: ${value}, which is exactly what ${holders
            .map((h) => `var(${h})`)
            .join(' / ')} holds. Bind it, or exempt it in TOKEN_BYPASS_EXEMPT with a reason.`
        );
      }
    }
  }
}

// A stale exemption is its own kind of lie.
for (const key of Object.keys(TOKEN_BYPASS_EXEMPT)) {
  if (!exemptSeen.has(key)) {
    errors.push(
      `[STALE-EXEMPT] TOKEN_BYPASS_EXEMPT lists '${key}', but no stylesheet has that literal any more. Remove the entry.`
    );
  }
}

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} token-bypass issue(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(
  `✓ no literal duplicates a token in its family (${Object.keys(TOKEN_BYPASS_EXEMPT).length} documented exception(s)` +
    `${warnings.length ? `, ${warnings.length} warning(s)` : ''}).`
);
