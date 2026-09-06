#!/usr/bin/env node
/**
 * check-a11y-parity.js
 *
 * Cross-framework accessibility-parity gate (ADR-0025). The repo's reason to exist
 * is "one spec, three faithful adapters", but every existing gate compares names /
 * ids / class strings — none compares what the three adapters actually EXPOSE to
 * assistive tech. covers() proves the same behaviour id is bound in each framework,
 * not that the rendered accessibility tree is the same.
 *
 * This gate closes that hole with the committed-artifact + offline-`--check` idiom:
 *   - `npm run gen:a11y` runs each framework's `*.a11y.spec.*` (UPDATE_A11Y=1) which
 *     renders the component's canonical scenarios in jsdom, normalizes the
 *     accessibility tree (libs/<fw>/src/testing/a11y-tree.ts), and writes
 *     `tools/parity/a11y/<component>.<framework>.json`.
 *   - This gate reads those committed snapshots, groups them by component, and
 *     asserts the three frameworks are deep-equal. A divergence (e.g. one adapter
 *     omits an aria state, or exposes a different role/name) is a BLOCKER.
 *   - A component missing one framework's snapshot is a WARNING.
 *   - The ROSTER comes from the component dirs, not from the snapshot directory: a
 *     component with zero snapshots must be named in A11Y_PARITY_EXEMPT (with a
 *     reason) or the gate fails. Globbing the snapshots for the roster made an
 *     uncovered component invisible — no comparison, no warning, exit 0.
 *
 * The per-framework drift guard lives in the `*.a11y.spec.*` themselves (run by
 * `nx test`): they assert the live render still matches the committed snapshot.
 * This gate is the *cross-framework* half. Both are deterministic + offline, so
 * unlike check:figma this one is safe in check:all/CI.
 *
 * WHAT A GREEN RUN PROVES, AND WHAT IT CANNOT. This gate proves the three
 * adapters' jsdom-rendered, normalized accessibility trees agree with each
 * other — real cross-framework equivalence, exactly what ADR-0025 built it to
 * prove. It cannot prove the rendered UI is accessible in a real browser,
 * because jsdom itself cannot see whole classes of defect — and "the three
 * adapters agree" is no evidence against a defect all three share. Three such
 * defects were measured on 2026-09-06, all invisible to this gate the entire
 * time it stayed green:
 *   - Layout and focus order. jsdom never lays out or paints, so there is no
 *     tab order to probe. AtlStepper's three committed snapshots were
 *     byte-identical — zero divergence reported — while a real Chromium
 *     whole-document Tab probe on the same markup showed two of three step
 *     headers were not reachable by keyboard at all
 *     (`atl-step-1 -> atl-step-panel-1 -> BODY`). Fixed and verified natively
 *     in ADR-0101; this gate could not have found the defect and cannot
 *     confirm the fix either, on this input.
 *   - CSS generated content. jsdom does not compute `::before`/`::after`
 *     content, so a decorative glyph declared only in CSS is invisible to
 *     this gate in both directions. AtlBreadcrumbs' `::after` separator was
 *     exposed as its own accessible text node in Chromium's native
 *     accessibility tree and in Firefox/WebKit's `ariaSnapshot()` alike,
 *     despite a code comment claiming otherwise — this gate agreed across
 *     all three adapters, on the wrong thing, both before and after the fix.
 *     See ADR-0100.
 *   - Accessible-name computation. `a11y-tree.ts`'s name algorithm is a
 *     documented pragmatic subset of the WAI spec, and two of its shortcuts
 *     have since been measured to diverge from what a real engine computes:
 *     the committed baseline named AtlStepper's panel `"2"` (a raw
 *     `textContent` read of the labelling button) where every real engine
 *     reports `"Profile"` (the button's own computed accessible name), and
 *     before its fix, AtlChatMessages' `role="log"` baselined as the entire
 *     concatenated transcript — the visible-text fallback firing for a role
 *     that is name-from-author-only, not name-from-content. All three
 *     adapters agreed on both wrong names, because all three ran the same
 *     simplified algorithm. See ADR-0101 and the header of
 *     `libs/<fw>/src/testing/a11y-tree.ts`.
 *
 * None of this makes the gate wrong — it does exactly what ADR-0025 built it
 * for. A green `check:a11y-parity` is evidence that the three adapters agree
 * with EACH OTHER over a normalized, jsdom-derived tree; it is not evidence
 * that any of them is right, or that the UI works for an actual assistive-
 * technology user. That question needs a real engine — Playwright driving
 * Chromium's native `Accessibility.getFullAXTree` (direct evidence) or
 * `ariaSnapshot()` on Firefox/WebKit (their own ARIA-spec computation, not a
 * read of either engine's internal tree) — the method ADR-0100 and ADR-0101
 * used by hand to find all three defects above. Not yet a gate; see
 * `tasks/todo.md` for the open question of whether one is worth building.
 *
 * Run via:  node tools/scripts/check-a11y-parity.js   (or  npm run check:a11y-parity)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { FRAMEWORKS, isComponentDir, getComponentDirs } = require('./lib/component-discovery');
const { A11Y_PARITY_EXEMPT } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const A11Y_DIR = path.join(ROOT, 'tools/parity/a11y');

const errors = [];
const warnings = [];

if (!fs.existsSync(A11Y_DIR)) {
  console.error(`✗ [A11Y] ${path.relative(ROOT, A11Y_DIR)} not found. Run npm run gen:a11y.`);
  process.exit(1);
}

// Group snapshot files by component: `<component>.<framework>.json`.
const byComponent = new Map();
for (const file of fs.readdirSync(A11Y_DIR)) {
  const m = /^(.+)\.(angular|react|vue)\.json$/.exec(file);
  if (!m) continue;
  const [, component, fw] = m;
  if (!byComponent.has(component)) byComponent.set(component, {});
  try {
    byComponent.get(component)[fw] = JSON.parse(fs.readFileSync(path.join(A11Y_DIR, file), 'utf8'));
  } catch (err) {
    errors.push(`[PARSE] ${file}: ${err.message}`);
  }
}

if (byComponent.size === 0) {
  console.error(`✗ [A11Y] no a11y snapshots in ${path.relative(ROOT, A11Y_DIR)}. Run npm run gen:a11y.`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Roster. Built from the component dirs (the same discovery the structural
// gates use), never from A11Y_DIR — the snapshot directory cannot be its own
// roster, or a component with no snapshots is simply not a question the gate
// asks. Every uncovered component is either an error or a recorded exemption.
// ---------------------------------------------------------------------------
const roster = new Set();
for (const fw of FRAMEWORKS) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  for (const dir of getComponentDirs(base)) {
    if (isComponentDir(path.join(base, dir))) roster.add(dir);
  }
}

for (const dir of [...roster].sort()) {
  if (byComponent.has(`atl-${dir}`)) continue;
  const exempt = A11Y_PARITY_EXEMPT.get(dir);
  if (!exempt) {
    errors.push(
      `[ROSTER] ${dir}: no a11y snapshot and no A11Y_PARITY_EXEMPT entry. Either add ` +
        `${dir}/atl-${dir}.a11y.spec.* in all three libs and run npm run gen:a11y, or record ` +
        `why it is out of the gate in tools/scripts/lib/allowlists.js.`
    );
  } else if (exempt.kind === 'gap') {
    warnings.push(`[GAP] ${dir}: comparable but not gated \u2014 ${exempt.reason}`);
  }
}

// Allowlist hygiene \u2014 this list is load-bearing, so it must not rot.
for (const [dir, entry] of A11Y_PARITY_EXEMPT) {
  if (!roster.has(dir)) {
    errors.push(`[STALE] A11Y_PARITY_EXEMPT names '${dir}', which is not a component dir. Remove it.`);
  } else if (byComponent.has(`atl-${dir}`)) {
    errors.push(
      `[STALE] A11Y_PARITY_EXEMPT exempts '${dir}' (${entry.kind}) but snapshots exist. ` +
        `Remove the entry so the component is compared.`
    );
  }
}

let compared = 0;
for (const [component, snaps] of [...byComponent].sort()) {
  const present = FRAMEWORKS.filter((fw) => snaps[fw]);
  const missing = FRAMEWORKS.filter((fw) => !snaps[fw]);
  if (missing.length) {
    warnings.push(`[MISSING] ${component}: no snapshot for ${missing.join(', ')}. Run npm run gen:a11y.`);
  }
  if (present.length < 2) continue; // nothing to diff

  compared++;
  const [ref, ...rest] = present;
  const refJson = JSON.stringify(snaps[ref]);
  for (const fw of rest) {
    if (JSON.stringify(snaps[fw]) !== refJson) {
      errors.push(
        `[DIVERGE] ${component}: ${fw} accessibility tree differs from ${ref}.\n` +
          `    ${ref}:  ${refJson}\n` +
          `    ${fw}:  ${JSON.stringify(snaps[fw])}\n` +
          `    The adapters must expose the same role/name/ARIA state. Fix the diverging adapter, then npm run gen:a11y.`
      );
    }
  }
}

// Report (symmetric exit code with the other gates).
const total =
  `${compared} of ${roster.size} component(s) compared across ${FRAMEWORKS.length} frameworks, ` +
  `${A11Y_PARITY_EXEMPT.size} exempt`;
if (errors.length === 0 && warnings.length === 0) {
  console.log(`✓ cross-framework a11y parity in sync (${total}).`);
  process.exit(0);
}
for (const w of warnings) console.warn(`⚠ [WARNING] ${w}`);
for (const e of errors) console.error(`✗ [BLOCKER] ${e}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} a11y-parity issue(s), ${warnings.length} warning(s). ${total}.`);
  process.exit(1);
}
console.warn(`\n${warnings.length} a11y-parity warning(s) (non-blocking). ${total}.`);
