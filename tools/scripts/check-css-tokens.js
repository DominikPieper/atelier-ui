#!/usr/bin/env node
/**
 * check-css-tokens.js
 *
 * Two passes enforcing CSS token DISCIPLINE — is component/docs CSS actually
 * built out of `--ui-*` tokens, in both directions:
 *
 *   Pass A (raw-literal pass):
 *     Enforces token discipline in component CSS — a raw color literal
 *     (hex, rgb/rgba, hsl/hsla) must not appear as a declaration value.
 *     Colours come from `--ui-*` custom properties. This keeps the
 *     design system the single source of colour and prevents palette
 *     drift (a one-off `#006470` that does not track the token).
 *
 *   Pass C (declaration pass):
 *     Every `--ui-*` token a component stylesheet READS must be declared in the
 *     token source. A `var(--ui-x, fallback)` that names an undeclared token
 *     renders plausibly at a value the design system does not control — which is
 *     how every code block ran on the Menlo fallback, and how AtlTooltip's
 *     stacking level was a literal 200 (ADR-0075).
 *
 * A third pass used to live here (manifest-annotation coverage: does every
 * declared token have a populated `tokens.manifest.ts` entry?) and has been
 * split out to `check-token-annotations.js` (`check:token-annotations`). That
 * pass answers a different question — AI-readiness documentation completeness,
 * not CSS discipline — and shared only a name with these two, not a failure
 * domain: a manifest-annotation gap said nothing about whether THIS gate's raw
 * colours or undeclared reads were clean, and vice versa. `declaredTokens`
 * (what `tokens.css` declares) is still computed here, independently, because
 * Pass C needs it; `check-token-annotations.js` derives its own copy from the
 * same file rather than importing this one, so the two gates stay fully
 * independent processes with separate error collection (this was already true
 * before the split — see that file's header for why it re-derives rather than
 * requires this module).
 *
 * Allowances in Pass A (intentional, not drift):
 *   - inside `var(--token, <fallback>)` — a literal fallback is good defensive
 *     practice; the token still drives the value when defined.
 *   - on `box-shadow` / `text-shadow` — shadows legitimately carry rgba alpha
 *     and are an accepted literal (or come from `--ui-shadow-*`).
 *   - on `mask-image` / `-webkit-mask-image` — a gradient stop like `#000`
 *     sets the mask's alpha (opaque vs. transparent), not a rendered colour.
 *
 * Pass A scans the component CSS under each framework lib, PLUS (ADR-0089
 * §2) the docs site's own chrome CSS: `docs/src/styles/global.css` and every
 * `<style>` block inside `docs/src/components/*.astro` (Astro files are not
 * pure CSS, so only their style blocks are scanned, with line numbers
 * reported relative to the `.astro` file). Token sources are exempt, same
 * rule on both sides: each framework's `styles/tokens.css` for the libs,
 * `docs/src/styles/docs-theme.css` and `docs/src/styles/tokens.css` for the
 * docs — all four are scanned only by Pass C, never Pass A.
 * A docs-only `DOCS_ALLOW` list (below) covers any literal that is
 * deliberate and can't be token-ized; each entry carries a one-line reason.
 *
 * Run via:  node tools/scripts/check-css-tokens.js
 *           (or  npm run check:css-tokens)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const LIB_DIRS = ['angular', 'react', 'vue'].map((f) =>
  path.join(ROOT, 'libs', f, 'src', 'lib'),
);
const TOKEN_CSS = path.join(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css',
);

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
const SHADOW_PROP = /^-?(webkit-)?(box|text)-shadow$/;
const MASK_PROP = /^-?(webkit-)?mask-image$/;

const DOCS_GLOBAL_CSS = path.join(ROOT, 'docs/src/styles/global.css');
const DOCS_COMPONENTS_DIR = path.join(ROOT, 'docs/src/components');
const DOCS_THEME_CSS = path.join(ROOT, 'docs/src/styles/docs-theme.css');

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

/** Pass C's evidence: every `var(--ui-…)` a component stylesheet READS, and where.
 *  Collected here because Pass A already walks every file; compared after the
 *  declared-token set (below) has been read. */
const consumedTokens = new Map();

for (const dir of LIB_DIRS) {
  for (const file of cssFiles(dir)) {
    const src = fs.readFileSync(file, 'utf-8').replace(/\/\*[\s\S]*?\*\//g, '');
    const rel = file.replace(ROOT + '/', '');
    // Match `prop: value` declarations regardless of surrounding selectors.
    for (const ref of src.matchAll(/var\(\s*(--ui-[a-z0-9-]+)/g)) {
      if (!consumedTokens.has(ref[1])) consumedTokens.set(ref[1], new Set());
      consumedTokens.get(ref[1]).add(rel);
    }
    const decl = /([\w-]+)\s*:\s*([^;{}]+)/g;
    let m;
    while ((m = decl.exec(src)) !== null) {
      const prop = m[1].toLowerCase();
      if (SHADOW_PROP.test(prop)) continue;
      const value = stripVarCalls(m[2]);
      if (COLOR_LITERAL.test(value)) {
        const literal = value.match(COLOR_LITERAL)[0];
        errors.push(
          `[RAW-COLOR] ${rel}: ${prop} uses literal '${literal.replace('(', '(…')}' — use a --ui-* token (or var(--token, fallback))`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Docs scan (ADR-0089 §2) — Pass A extended to the docs site's own CSS.
//
// Roster: docs/src/styles/global.css (plain CSS) and every <style> block in
// docs/src/components/*.astro. docs-theme.css and docs/src/styles/tokens.css
// are token sources, exactly like tokens.css is for the libs, and stay out
// of this scan. Reported line numbers are relative to the source file (or,
// for a style block, the .astro file it lives in) — comments are stripped
// but their newlines are kept so line numbers don't drift.
// ---------------------------------------------------------------------------

/** Docs-only allow list: literals that are deliberate and can't be
 *  token-ized, each with a one-line reason. Matched on the exact file +
 *  literal pair so an entry can't silently cover a different drift. Kept
 *  empty on purpose (ADR-0089 §2): the brand colours and terminal dots
 *  became --docs-* tokens instead of allow-listed literals. */
const DOCS_ALLOW = [];

const docsConsumedTokens = new Map();

/** Strip /* … *\/ comments while preserving their embedded newlines, so a
 *  1-based line count taken from the result still matches the source. */
function stripCommentsKeepLines(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, ''),
  );
}

/** Extract <style>…</style> block contents from an .astro file, each paired
 *  with the 1-based line number (in the FULL file) where the block's
 *  content starts. Every <style> tag in this repo is attribute-free, so
 *  the first '>' in the match is always the tag's close. */
function astroStyleBlocks(fileContent) {
  const blocks = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
  let m;
  while ((m = re.exec(fileContent)) !== null) {
    const openTagEnd = m.index + m[0].indexOf('>') + 1;
    const startLine = fileContent.slice(0, openTagEnd).split('\n').length;
    blocks.push({ content: m[1], startLine });
  }
  return blocks;
}

/** Pass A + Pass C token-consumption scan for one docs CSS chunk. `src` must
 *  already be comment-stripped (line-preserving); `lineOffset` is the
 *  1-based line, in the original file, where `src` begins.
 *
 *  Pass C here tracks only `--ui-*` reads, same as the lib scan — the
 *  design-token drift class Pass C exists for. `--docs-*` custom properties
 *  are docs-local plumbing (a `.docs-main`-scoped layout variable, a value
 *  BaseLayout's script writes at runtime like `--docs-drawer-top`) and are
 *  legitimately declared outside docs-theme.css, so they are not tracked. */
function scanDocsCss(src, rel, lineOffset) {
  for (const ref of src.matchAll(/var\(\s*(--ui-[a-z0-9-]+)/g)) {
    if (!docsConsumedTokens.has(ref[1]))
      docsConsumedTokens.set(ref[1], new Set());
    docsConsumedTokens.get(ref[1]).add(rel);
  }
  const decl = /([\w-]+)\s*:\s*([^;{}]+)/g;
  let m;
  while ((m = decl.exec(src)) !== null) {
    const prop = m[1].toLowerCase();
    if (SHADOW_PROP.test(prop) || MASK_PROP.test(prop)) continue;
    const value = stripVarCalls(m[2]);
    if (!COLOR_LITERAL.test(value)) continue;
    const literal = value.match(COLOR_LITERAL)[0];
    if (DOCS_ALLOW.some((a) => a.file === rel && a.literal === literal))
      continue;
    const lineNo = lineOffset + src.slice(0, m.index).split('\n').length - 1;
    errors.push(
      `[RAW-COLOR] ${rel}:${lineNo}: ${prop} uses literal '${literal.replace('(', '(…')}' — use a --ui-*/--docs-* token (or var(--token, fallback))`,
    );
  }
}

{
  const rel = DOCS_GLOBAL_CSS.replace(ROOT + '/', '');
  const src = stripCommentsKeepLines(fs.readFileSync(DOCS_GLOBAL_CSS, 'utf-8'));
  scanDocsCss(src, rel, 1);
}

for (const entry of fs.readdirSync(DOCS_COMPONENTS_DIR, {
  withFileTypes: true,
})) {
  if (!entry.isFile() || !entry.name.endsWith('.astro')) continue;
  const file = path.join(DOCS_COMPONENTS_DIR, entry.name);
  const rel = file.replace(ROOT + '/', '');
  const fileContent = fs.readFileSync(file, 'utf-8');
  for (const block of astroStyleBlocks(fileContent)) {
    scanDocsCss(stripCommentsKeepLines(block.content), rel, block.startLine);
  }
}

// ---------------------------------------------------------------------------
// Declared-token set — what Pass C compares reads against. `tokens.css` is
// the source of truth per `sync-tokens.mjs` (`check:tokens` enforces the
// three framework libs' copies stay byte-identical to it).
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Pass C — every --ui-* token a component READS must be DECLARED.
//
// The gap was not hypothetical twice over:
//
//   - all three code-block stylesheets read `var(--ui-font-mono, …)` while nothing
//     declared it, so every code block silently rendered in the Menlo fallback
//     until ADR-0035 declared the token.
//   - AtlTooltip read `var(--ui-z-tooltip, 200)`, which no token source has ever
//     declared, so the tooltip's stacking level was the literal 200 while every
//     other floating layer in the library used --ui-z-dropdown (ADR-0075).
//
// A fallback is what makes this silent: the component renders, plausibly, at a
// value the design system does not control. So a fallback does not excuse the
// reference — it is the reason to report it.
// ---------------------------------------------------------------------------

for (const [name, files] of [...consumedTokens].sort()) {
  if (declaredTokens.has(name)) continue;
  const where = [...files].sort();
  const shown =
    where.slice(0, 3).join(', ') +
    (where.length > 3 ? `, +${where.length - 3} more` : '');
  errors.push(
    `[UNDECLARED] '${name}' is read by ${where.length} component stylesheet(s) (${shown}) but is ` +
      `declared in no token source. The component silently renders at its var() fallback, which the ` +
      `design system does not control. Declare the token, or reference one that exists.`,
  );
}

// ---------------------------------------------------------------------------
// Pass C (docs) — same rule, wider declared-token set (ADR-0089 §2).
//
// Docs CSS reads --docs-* tokens too, not just --ui-*, so the declared set
// for THIS check is tokens.css (declaredTokens, above) UNION every
// --ui-*/--docs-* name docs-theme.css declares (its own tokens plus the
// --ui-* overrides it makes, e.g. --ui-color-primary-light).
// ---------------------------------------------------------------------------

const docsThemeCssSrc = fs.readFileSync(DOCS_THEME_CSS, 'utf-8');
const docsDeclaredTokens = new Set(declaredTokens);
for (const m of docsThemeCssSrc.matchAll(
  /(--(?:ui|docs)-[a-zA-Z0-9-]+)\s*:/g,
)) {
  docsDeclaredTokens.add(m[1]);
}

for (const [name, files] of [...docsConsumedTokens].sort()) {
  if (docsDeclaredTokens.has(name)) continue;
  const where = [...files].sort();
  const shown =
    where.slice(0, 3).join(', ') +
    (where.length > 3 ? `, +${where.length - 3} more` : '');
  errors.push(
    `[UNDECLARED] '${name}' is read by ${where.length} docs stylesheet(s) (${shown}) but is declared ` +
      `in neither libs/create-workspace/src/generators/preset/files/styles/tokens.css nor docs/src/styles/docs-theme.css.`,
  );
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(
    `\n${errors.length} token issue(s). Replace raw colours with --ui-* tokens, or declare the missing token.`,
  );
  process.exit(1);
}

console.log(
  `✓ component CSS uses tokens for colour (no raw literals outside var() fallbacks / shadows); ${consumedTokens.size} token(s) referenced, all declared; ` +
    `docs CSS clean too — ${docsConsumedTokens.size} token(s) referenced, all declared${DOCS_ALLOW.length ? `, ${DOCS_ALLOW.length} literal(s) allow-listed` : ''}.`,
);
