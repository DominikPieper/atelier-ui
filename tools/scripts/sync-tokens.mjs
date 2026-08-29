#!/usr/bin/env node
/**
 * Copy the design tokens stylesheet from the create-workspace preset (the
 * seed scaffolded into every new Atelier workspace) into each framework
 * lib's own styles/tokens.css. The preset copy is the source of truth so a
 * freshly generated workspace and the shipped libs always agree.
 *
 * The atelier-design skill's token sheet is a fourth target. It called itself a
 * mirror of libs/react/src/styles/tokens.css while it was hand-maintained, and by
 * 2026-08-28 it had drifted all the way back to the retired Inter / Fira Code brand
 * with no --ui-font-display and no --ui-font-mono — so the skill painted the
 * pre-redesign brand into every artifact it generated. Same drift class as the
 * artboard palette (ADR-0071): the remedy is that the copy is generated, not
 * maintained.
 *
 * Run locally or as a pre-build step. --check fails non-zero on drift
 * (used by CI / the `check:tokens` script).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = resolve(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);
const TARGETS = [
  resolve(ROOT, 'libs/angular/src/styles/tokens.css'),
  resolve(ROOT, 'libs/react/src/styles/tokens.css'),
  resolve(ROOT, 'libs/vue/src/styles/tokens.css'),
  resolve(ROOT, 'skills/atelier-design/assets/colors_and_type.css'),
];

// The Storybook Foundation/Typography page is a fifth mirror, and the one a
// workshop participant actually reads (the hosted Storybooks' MDX docs). It
// cannot be a byte copy — it is prose plus <Typeset> samples — so it is checked
// rather than written: every family tokens.css declares must be named on the
// page, and no family it does NOT declare may be. Measured, not theorised: on
// 2026-08-29 all three pages still taught "the design system uses Inter",
// months after the brand moved to Instrument Sans, because check:tokens only
// ever looked at the CSS copies.
const TYPEFACE_DOCS = ['angular', 'react', 'vue'].map((fw) =>
  resolve(ROOT, `libs/${fw}/src/lib/foundation/typography.mdx`)
);

/** The first quoted family of each --ui-font-* declaration in the source sheet. */
function declaredFamilies(css) {
  const names = [];
  for (const m of css.matchAll(/--ui-font-(?:family|display|mono)\s*:\s*'([^']+)'/g)) {
    names.push(m[1]);
  }
  return names;
}

/** Every quoted family named on a typography page, from its `export const font*` lines. */
function documentedFamilies(mdx) {
  const names = [];
  for (const line of mdx.split('\n')) {
    if (!/^export const font/.test(line)) continue;
    for (const m of line.matchAll(/'([^']+)'/g)) names.push(m[1]);
  }
  return names;
}

function typefaceDocDrift(css) {
  const declared = declaredFamilies(css);
  const problems = [];
  for (const file of TYPEFACE_DOCS) {
    let mdx;
    try {
      mdx = readFileSync(file, 'utf-8');
    } catch {
      problems.push(`  - ${file} is missing`);
      continue;
    }
    for (const family of declared) {
      if (!mdx.includes(family)) {
        problems.push(`  - ${file} never names ${family}, which tokens.css declares`);
      }
    }
    for (const family of documentedFamilies(mdx)) {
      // A generic keyword or fallback stack entry is not a brand claim.
      if (!declared.includes(family) && /[A-Z]/.test(family[0]) && !/^(Georgia|Times|Courier|Segoe|Roboto|Menlo|Monaco|Helvetica|Arial)/.test(family)) {
        problems.push(`  - ${file} names ${family}, which tokens.css does not declare`);
      }
    }
  }
  return problems;
}

const mode = process.argv[2];
const expected = readFileSync(SOURCE, 'utf-8');

if (mode === '--check') {
  const typefaceProblems = typefaceDocDrift(expected);
  if (typefaceProblems.length) {
    console.error('Storybook Foundation/Typography pages disagree with tokens.css:');
    for (const p of typefaceProblems) console.error(p);
    console.error(
      'Update libs/{angular,react,vue}/src/lib/foundation/typography.mdx to the shipped families.'
    );
    process.exit(1);
  }
  const drift = TARGETS.filter((t) => {
    try {
      return readFileSync(t, 'utf-8') !== expected;
    } catch {
      return true;
    }
  });
  if (drift.length) {
    console.error('token copies are out of sync:');
    for (const f of drift) console.error(`  - ${f}`);
    console.error('Run: node tools/scripts/sync-tokens.mjs');
    process.exit(1);
  }
  console.log('token copies are in sync');
  process.exit(0);
}

for (const t of TARGETS) {
  writeFileSync(t, expected);
  console.log(`wrote ${t}`);
}
