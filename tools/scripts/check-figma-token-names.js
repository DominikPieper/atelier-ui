#!/usr/bin/env node
/**
 * check-figma-token-names.js
 *
 * Cross-checks tools/figma/snapshot.json's `uiTokens` census against the
 * canonical `--ui-*` token declarations in code (ADR-0115 names
 * `libs/create-workspace/src/generators/preset/files/styles/tokens.css` as
 * the canonical token file).
 *
 * WHY THIS EXISTS, AND WHAT IT REPLACES:
 * The only prior guard on `uiTokens` (docs/src/lib/figma-snapshot.ts's
 * `tokenCensus`) sums per-prefix counts and asserts the sum equals the
 * total it read. A snapshot that lost a real Figma variable from the list
 * still passes that check as long as whatever remains still adds up to
 * itself — it proves the census accounted for every entry it saw, nothing
 * about whether the list is complete or its names are right. This gate
 * checks NAMES instead of counts: every `color/*`, `spacing/*` and
 * `radius/*` entry in `uiTokens` must resolve to a `--ui-*` declaration
 * that actually exists in `tokens.css`.
 *
 * THE MAPPING (ADR-0030 §2's `--ui-<group>-<name>` -> `<group>/<name>`,
 * implemented by `gen-figma-library-tokens.mjs`'s `cssName()`), e.g.
 * `--ui-color-text` -> `color/text`, `--ui-spacing-4` -> `spacing/4`,
 * `--ui-radius-md` -> `radius/md`. This gate applies that mapping in
 * reverse, scoped to exactly the three groups the task named (color,
 * spacing, radius). `gen-figma-library-tokens.mjs`'s `buildDefs()` builds
 * every Library Tokens entry from a single `:root` `--ui-*` custom
 * property with no additions of its own, so for these three groups the
 * reverse mapping is total, not partial — verified by reading that
 * function, not assumed.
 *
 * WHY ONLY THESE THREE GROUPS: ADR-0030 §2 names shadows (Effects),
 * easings/durations (Motion Tokens), letter-spacing, z-index and the
 * composite focus ring as material `gen-figma-library-tokens.mjs`'s SKIP
 * regex deliberately excludes from Figma-variable generation — they are
 * not simple variables and were never meant to round-trip this way. None
 * of them land in the color/spacing/radius groups this gate checks, so
 * scoping to exactly those three (rather than every group in `uiTokens`)
 * keeps this gate inside territory the generator actually produces 1:1,
 * and a gate that flagged one of ADR-0030's deliberate exceptions as drift
 * would be worse than no gate.
 *
 * ONE-DIRECTIONAL BY DESIGN: this does not require every `--ui-color-*` /
 * `--ui-spacing-*` / `--ui-radius-*` declaration in tokens.css to have a
 * Figma `uiTokens` entry. That direction is not what drifted (a code token
 * routinely exists for a while before someone remembers to regenerate the
 * Figma collection and refresh the snapshot — that is normal lag, not a
 * bug), and checking it would make this gate fail on every ordinary token
 * addition.
 *
 * WHAT THIS GATE CANNOT PROVE:
 *   - That a matching name carries the same VALUE on both sides (the exact
 *     color hex, the exact spacing px). That is
 *     `figma_check_design_parity` / the gen-figma-library-tokens.mjs
 *     regenerate-and-diff workflow's job, not this one — this gate is
 *     name-existence only.
 *   - That `uiTokens` has not lost an entry whose `--ui-*` declaration was
 *     removed from tokens.css in the very same edit — losing both sides of
 *     a pair together leaves nothing here to disagree with. This gate
 *     catches drift where the two sides disagree, not drift where they
 *     went stale in lockstep. The `checked === 0` guard below covers the
 *     limit of that: total loss of the three groups.
 *   - Anything about the font-size/font-weight/line-height/opacity/font/
 *     control-height/row-height groups in `uiTokens` — out of scope by the
 *     task's own naming (color/spacing/radius only); see the group note
 *     above for why widening it is not free.
 *
 * Run via:  node tools/scripts/check-figma-token-names.js
 *           (or  npm run check:figma-token-names)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SNAPSHOT_FILE = path.join(ROOT, 'tools/figma/snapshot.json');
const TOKEN_CSS = path.join(
  ROOT,
  'libs/create-workspace/src/generators/preset/files/styles/tokens.css'
);

// Exactly the three prefixes the task named — see the header for why the
// rest of the uiTokens collection (font-size, opacity, ...) is out of scope.
const CHECKED_GROUPS = ['color', 'spacing', 'radius'];

const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
const uiTokens = Array.isArray(snapshot.uiTokens) ? snapshot.uiTokens : [];

const tokenCss = fs.readFileSync(TOKEN_CSS, 'utf-8');
const declaredTokens = new Set();
// Same regex check-css-tokens.js's Pass C uses to build its declared-token
// set from the identical file — one way of reading "what tokens.css
// declares", not a second, possibly-diverging one.
const tokenDecl = /(--ui-[a-zA-Z0-9-]+)\s*:/g;
{
  let m;
  while ((m = tokenDecl.exec(tokenCss)) !== null) declaredTokens.add(m[1]);
}

const errors = [];
let checked = 0;

for (const name of uiTokens) {
  const slash = name.indexOf('/');
  if (slash === -1) continue;
  const group = name.slice(0, slash);
  const rest = name.slice(slash + 1);
  if (!CHECKED_GROUPS.includes(group)) continue;
  checked += 1;
  const expected = `--ui-${group}-${rest}`;
  if (!declaredTokens.has(expected)) {
    errors.push(
      `[TOKEN-FAMILY] uiTokens '${name}' (tools/figma/snapshot.json) has no matching declaration in ` +
        `tokens.css — expected '${expected}' among the ${declaredTokens.size} --ui-* custom properties ` +
        'declared in libs/create-workspace/src/generators/preset/files/styles/tokens.css (ADR-0115). ' +
        'Either the Figma variable was renamed or removed from code without regenerating the snapshot ' +
        '(npm run figma:sync-library-tokens, then npm run figma:snapshot), or tokens.css dropped the ' +
        'declaration and the Figma side is now stale — see plan/adr/0030-library-tokens-collection.md for ' +
        'the intended --ui-<group>-<name> mapping.'
    );
  }
}

if (checked === 0) {
  console.error(
    "[TOKEN-FAMILY] snapshot.json's uiTokens carries zero color/*, spacing/*, or radius/* entries — either " +
      'the snapshot is stale/empty or the Library Tokens collection lost every entry in these three groups. ' +
      'Run npm run figma:snapshot and re-check.'
  );
  process.exit(1);
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(`\n${errors.length} of ${checked} checked uiTokens name(s) have no matching --ui-* family.`);
  process.exit(1);
} else {
  console.log(
    `✓ All ${checked} color/*, spacing/*, and radius/* names in snapshot.json's uiTokens have a matching ` +
      `--ui-* declaration in tokens.css (ADR-0030, ADR-0115).`
  );
}
