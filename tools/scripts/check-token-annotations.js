#!/usr/bin/env node
/**
 * check-token-annotations.js
 *
 * Manifest-annotation coverage: every `--ui-*` token declared in the
 * create-workspace preset's `styles/tokens.css` (the source of truth per
 * `sync-tokens.mjs` — `check:tokens` enforces the three framework libs' copies
 * stay byte-identical to it) must have an entry in
 * `libs/spec/src/tokens.manifest.ts` with a non-empty `intent` and a
 * non-empty `constraints` array. Every manifest entry must reference a
 * declared token. This is the AI-readiness annotation layer — see
 * `plan/ai-readiness.md`.
 *
 * Split out of `check-css-tokens.js` (previously "Pass B" there), which now
 * covers only CSS discipline — no raw color literal outside `var()`, no
 * `var()`-consumed token left undeclared. That gate answers "is this CSS
 * built out of tokens correctly"; this one answers "is every token
 * documented" — a different failure domain entirely (an AI-readiness
 * documentation gap, not a CSS defect), so a failure here told a reader
 * nothing about whether component CSS itself was clean, and vice versa.
 * `declaredTokens` is re-derived from tokens.css independently here rather
 * than imported from check-css-tokens.js, so the two gates run as fully
 * separate processes with their own error collection — same reasoning
 * check-css-tokens.js's header gives for why ITS docs-scan re-derives rather
 * than shares state across its own passes.
 *
 * Gated by whether the manifest has any entries at all: while it is empty
 * (initial rollout) this warns; once the first annotation lands, every
 * declared token must be annotated or the gate fails. This lets authors fill
 * the manifest incrementally without a stop-the-world flag day, while still
 * converging on 100% coverage once started.
 *
 * Run via:  node tools/scripts/check-token-annotations.js
 *           (or  npm run check:token-annotations)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { parseExportedVars } = require('./lib/ts-eval');

const ROOT = path.resolve(__dirname, '../..');
const TOKEN_CSS = path.join(ROOT, 'libs/create-workspace/src/generators/preset/files/styles/tokens.css');
const TOKEN_MANIFEST = path.join(ROOT, 'libs/spec/src/tokens.manifest.ts');

const errors = [];
const warnings = [];

// ---------------------------------------------------------------------------
// Declared tokens (tokens.css) and their manifest annotations.
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
      `[STALE-MANIFEST] tokens.manifest.ts annotates '${name}' but it is not declared in libs/create-workspace/src/generators/preset/files/styles/tokens.css.`
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
    `\n${errors.length} annotation issue(s). Fix the manifest in libs/spec/src/tokens.manifest.ts.`
  );
  process.exit(1);
}

warnings.forEach((w) => console.warn(`⚠ ${w}`));
console.log(`✓ ${annotatedTokens.size}/${declaredTokens.size} tokens annotated in tokens.manifest.ts`);
