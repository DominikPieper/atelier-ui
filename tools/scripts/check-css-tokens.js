#!/usr/bin/env node
/**
 * check-css-tokens.js
 *
 * Two passes against the design-token layer:
 *
 *   Pass A (raw-literal pass):
 *     Enforces token discipline in component CSS — a raw color literal
 *     (hex, rgb/rgba, hsl/hsla) must not appear as a declaration value.
 *     Colours come from `--ui-*` custom properties. This keeps the
 *     design system the single source of colour and prevents palette
 *     drift (a one-off `#006470` that does not track the token).
 *
 *   Pass B (manifest-coverage pass):
 *     Every `--ui-*` token declared in `libs/angular/src/styles/tokens.css`
 *     (the canonical copy — `check:tokens` enforces the three frameworks
 *     stay identical) must have an entry in
 *     `libs/spec/src/tokens.manifest.ts` with a non-empty `intent` and a
 *     non-empty `constraints` array. Every manifest entry must reference
 *     a declared token. This is the AI-readiness annotation layer — see
 *     `plan/ai-readiness.md`.
 *
 *     Pass B is gated by `MANIFEST_COVERAGE_REQUIRED`: while the manifest
 *     is empty (initial rollout) it warns; once an opt-in flag is
 *     flipped, missing entries fail the gate. Today it warns when the
 *     manifest has any entries (so authors get feedback as they fill it)
 *     but only fails when EVERY declared token has been annotated.
 *
 * Allowances in Pass A (intentional, not drift):
 *   - inside `var(--token, <fallback>)` — a literal fallback is good defensive
 *     practice; the token still drives the value when defined.
 *   - on `box-shadow` / `text-shadow` — shadows legitimately carry rgba alpha
 *     and are an accepted literal (or come from `--ui-shadow-*`).
 *
 * Pass A scans only the component CSS under each framework lib. The token
 * source-of-truth (styles/tokens.css) is allowed to define literals and is
 * not scanned by Pass A — only by Pass B.
 *
 * Run via:  node tools/scripts/check-css-tokens.js
 *           (or  npm run check:css-tokens)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { parseExportedVars } = require('./lib/ts-eval');

const ROOT = path.resolve(__dirname, '../..');
const LIB_DIRS = ['angular', 'react', 'vue'].map((f) => path.join(ROOT, 'libs', f, 'src', 'lib'));
const TOKEN_CSS = path.join(ROOT, 'libs/angular/src/styles/tokens.css');
const TOKEN_MANIFEST = path.join(ROOT, 'libs/spec/src/tokens.manifest.ts');

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

// ---------------------------------------------------------------------------
// Pass B — manifest coverage of every --ui-* token declared in tokens.css.
// ---------------------------------------------------------------------------

const warnings = [];

const tokenCss = fs.readFileSync(TOKEN_CSS, 'utf-8');
const declaredTokens = new Set();
// Match `--ui-foo: <value>;` declarations anywhere in the file. Each token
// may be re-declared across selectors (light / dark / [data-theme]); we
// only care that the name exists.
const tokenDecl = /(--ui-[a-zA-Z0-9-]+)\s*:/g;
{
  let m;
  while ((m = tokenDecl.exec(tokenCss)) !== null) {
    declaredTokens.add(m[1]);
  }
}

const manifestExports = parseExportedVars(TOKEN_MANIFEST);
const manifest = manifestExports.tokens && typeof manifestExports.tokens === 'object'
  ? manifestExports.tokens
  : {};

const annotatedTokens = new Set(Object.keys(manifest));

// Stale annotations — manifest entries that point at tokens which no longer
// exist in tokens.css.
for (const name of annotatedTokens) {
  if (!declaredTokens.has(name)) {
    errors.push(
      `[STALE-MANIFEST] tokens.manifest.ts annotates '${name}' but it is not declared in libs/angular/src/styles/tokens.css.`
    );
  }
}

// Validate the shape of every annotation that IS present.
for (const [name, annot] of Object.entries(manifest)) {
  if (!annot || typeof annot !== 'object') {
    errors.push(`[BAD-ANNOTATION] tokens.manifest.ts['${name}']: must be an object.`);
    continue;
  }
  if (typeof annot.intent !== 'string' || !annot.intent.trim()) {
    errors.push(`[BAD-ANNOTATION] tokens.manifest.ts['${name}']: 'intent' must be a non-empty string.`);
  }
  if (!Array.isArray(annot.constraints) || annot.constraints.length === 0) {
    errors.push(
      `[BAD-ANNOTATION] tokens.manifest.ts['${name}']: 'constraints' must be a non-empty array of strings.`
    );
  } else if (annot.constraints.some((c) => typeof c !== 'string' || !c.trim())) {
    errors.push(
      `[BAD-ANNOTATION] tokens.manifest.ts['${name}']: every 'constraints' entry must be a non-empty string.`
    );
  }
  if (annot.darkMode !== undefined && typeof annot.darkMode !== 'string') {
    errors.push(`[BAD-ANNOTATION] tokens.manifest.ts['${name}']: 'darkMode' must be a string if set.`);
  }
}

// Coverage — fail only when the manifest has reached "all declared tokens
// must be covered" mode. Today: every token must be annotated; missing
// entries fail. (Initial empty manifest is allowed — see opt-in below.)
const COVERAGE_REQUIRED = annotatedTokens.size > 0;
if (COVERAGE_REQUIRED) {
  for (const name of declaredTokens) {
    if (!annotatedTokens.has(name)) {
      errors.push(
        `[MISSING-ANNOTATION] '${name}' is declared in tokens.css but not annotated in libs/spec/src/tokens.manifest.ts.`
      );
    }
  }
} else {
  warnings.push(
    `tokens.manifest.ts is empty — manifest-coverage check is opt-in until the first annotation lands. See plan/ai-readiness.md.`
  );
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  warnings.forEach((w) => console.warn(`⚠ ${w}`));
  console.error(
    `\n${errors.length} token issue(s). Replace raw colours with --ui-* tokens, or fix the manifest in libs/spec/src/tokens.manifest.ts.`
  );
  process.exit(1);
}

warnings.forEach((w) => console.warn(`⚠ ${w}`));
console.log(
  `✓ component CSS uses tokens for colour (no raw literals outside var() fallbacks / shadows); ${annotatedTokens.size}/${declaredTokens.size} tokens annotated.`
);
