#!/usr/bin/env node
/**
 * check-primitives.js
 *
 * ADR-0018 tiers the tokens primitive → semantic → component. The semantic tier
 * is the one component CSS is meant to address: `--ui-color-primary`, not the
 * ramp step behind it; `--ui-type-code`, not the font stack it names. A
 * component that reaches past the semantic tier re-decides, in one stylesheet,
 * something the token layer already decided for everyone — and it does so
 * invisibly, because the result looks right in that one component.
 *
 * Two ADRs left exactly this hole open, in the same shape:
 *   - ADR-0036: nothing stopped a component naming `--ui-font-display` directly
 *     and pairing it with a weight the face does not have.
 *   - ADR-0038: nothing stopped a component naming a `--ui-color-teal-*` step
 *     directly, which pins it to one theme's shade of the brand colour.
 *
 * This gate closes both. The primitive list and its exemptions live in
 * lib/allowlists.js next to the other gates' exceptions; `design` exemptions are
 * silent (a closed question), `gap` exemptions warn on every run so an
 * unfinished migration keeps nagging instead of settling in.
 *
 * Scope is deliberately component CSS only. The token source declares
 * primitives (that is its job) and the docs app is a consumer like any other
 * product surface.
 *
 * Run via:  node tools/scripts/check-primitives.js  (or npm run check:primitives)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { FRAMEWORKS, isComponentDir, getComponentDirs } = require('./lib/component-discovery');
const { PRIMITIVE_TOKENS, PRIMITIVE_EXEMPTIONS } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');

const errors = [];
const warnings = [];

/** Every `var(--ui-…)` reference in a stylesheet, with its line number. */
function referencesIn(file) {
  const out = [];
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--ui-[a-z0-9-]+)/g)) {
      out.push({ token: m[1], line: i + 1 });
    }
  });
  return out;
}

const seenExemptions = new Set();
let filesScanned = 0;
let referencesScanned = 0;

for (const fw of FRAMEWORKS) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  for (const dir of [...getComponentDirs(base)].sort()) {
    const dirPath = path.join(base, dir);
    if (!isComponentDir(dirPath)) continue;
    for (const entry of fs.readdirSync(dirPath).filter((f) => f.endsWith('.css'))) {
      const file = path.join(dirPath, entry);
      filesScanned++;
      for (const { token, line } of referencesIn(file)) {
        referencesScanned++;
        const primitive = PRIMITIVE_TOKENS.find((p) => p.match.test(token));
        if (!primitive) continue;

        const key = `${dir}:${token}`;
        const exemption = PRIMITIVE_EXEMPTIONS.get(key);
        const where = `${path.relative(ROOT, file)}:${line}`;

        if (!exemption) {
          errors.push(
            `[PRIMITIVE] ${where} references ${token} (${primitive.label}). Use ${primitive.useInstead}. ${primitive.why}`
          );
          continue;
        }
        seenExemptions.add(key);
        if (exemption.kind === 'gap') {
          warnings.push(`[GAP] ${key} — ${exemption.reason}`);
        }
      }
    }
  }
}

// Allowlist hygiene: an exemption nothing triggers has outlived its migration.
for (const [key, entry] of PRIMITIVE_EXEMPTIONS) {
  if (!seenExemptions.has(key)) {
    errors.push(
      `[STALE] PRIMITIVE_EXEMPTIONS carries '${key}' (${entry.kind}) but no component CSS references it any more. Remove the entry.`
    );
  }
}

// Warn once per exemption key rather than once per occurrence — the output
// should scale with unfinished migrations, not with how many lines they span.
const uniqueWarnings = [...new Set(warnings)];

const total =
  `${referencesScanned} token reference(s) across ${filesScanned} component stylesheet(s); ` +
  `${PRIMITIVE_TOKENS.length} primitive pattern(s), ${PRIMITIVE_EXEMPTIONS.size} exemption(s)`;

if (errors.length === 0 && uniqueWarnings.length === 0) {
  console.log(`✓ no component CSS reaches past the semantic tier (${total}).`);
  process.exit(0);
}
for (const w of uniqueWarnings) console.warn(`⚠ [WARNING] ${w}`);
for (const e of errors) console.error(`✗ ${e}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} primitive-tier issue(s). ${total}.`);
  process.exit(1);
}
console.warn(`\n${uniqueWarnings.length} primitive-tier warning(s) (non-blocking). ${total}.`);
