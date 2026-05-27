#!/usr/bin/env node
/**
 * check-css-tokens.js
 *
 * Enforces token discipline in component CSS: a raw color literal (hex,
 * rgb/rgba, hsl/hsla) must not appear as a declaration value — colors come
 * from `--ui-*` custom properties. This keeps the design system the single
 * source of colour and prevents palette drift (a one-off `#006470` that does
 * not track the token).
 *
 * Allowances (intentional, not drift):
 *   - inside `var(--token, <fallback>)` — a literal fallback is good defensive
 *     practice; the token still drives the value when defined.
 *   - on `box-shadow` / `text-shadow` — shadows legitimately carry rgba alpha
 *     and are an accepted literal (or come from `--ui-shadow-*`).
 *
 * Scans only the component CSS under each framework lib. The token source-of-truth
 * (styles/tokens.css) is allowed to define literals and is not scanned.
 *
 * Run via:  node tools/scripts/check-css-tokens.js
 *           (or  npm run check:css-tokens)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const LIB_DIRS = ['angular', 'react', 'vue'].map((f) => path.join(ROOT, 'libs', f, 'src', 'lib'));

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
const SHADOW_PROP = /^-?(webkit-)?(box|text)-shadow$/;

/** Walk a dir for *.css files. */
function cssFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...cssFiles(p));
    else if (entry.name.endsWith('.css')) out.push(p);
  }
  return out;
}

/** Remove every `var(...)` call (balanced parens) so fallback literals don't count. */
function stripVarCalls(value) {
  let res = '';
  let i = 0;
  while (i < value.length) {
    if (value.startsWith('var(', i)) {
      let depth = 0;
      let j = i + 3; // at '('
      for (; j < value.length; j++) {
        if (value[j] === '(') depth++;
        else if (value[j] === ')') {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      i = j;
    } else {
      res += value[i];
      i++;
    }
  }
  return res;
}

const errors = [];

for (const dir of LIB_DIRS) {
  for (const file of cssFiles(dir)) {
    const src = fs.readFileSync(file, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
    const rel = file.replace(ROOT + '/', '');
    // Match `prop: value` declarations regardless of surrounding selectors.
    const decl = /([\w-]+)\s*:\s*([^;{}]+)/g;
    let m;
    while ((m = decl.exec(src)) !== null) {
      const prop = m[1].toLowerCase();
      if (SHADOW_PROP.test(prop)) continue;
      const value = stripVarCalls(m[2]);
      if (COLOR_LITERAL.test(value)) {
        const literal = value.match(COLOR_LITERAL)[0];
        errors.push(`[RAW-COLOR] ${rel}: ${prop} uses literal '${literal.replace('(', '(…')}' — use a --ui-* token (or var(--token, fallback))`);
      }
    }
  }
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(`\n${errors.length} raw-color issue(s). Replace with a --ui-* token, wrap in var(--token, fallback), or (shadows only) keep on box-shadow.`);
  process.exit(1);
} else {
  console.log('✓ component CSS uses tokens for color (no raw literals outside var() fallbacks / shadows)');
}
