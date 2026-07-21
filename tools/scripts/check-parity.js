#!/usr/bin/env node
/**
 * check-parity.js
 *
 * Design-parity persistence gate — closes the loop ADR-0019 left half-open.
 *
 * The design-to-code loop's fourth step is `figma_check_design_parity` ("Verify",
 * called Required-not-optional in CLAUDE.md). But that is an interactive MCP call
 * a human runs; nothing persisted the result, and nothing detected when a
 * component changed *after* it was last verified. So a component could pass every
 * gate while its rendered output had silently drifted from the Figma design since
 * the last time anyone checked.
 *
 * This gate makes the verify result a durable, checkable fact — same
 * committed-artifact + offline-`--check` idiom as check-figma.js (ADR-0019):
 *
 *   - `tools/scripts/parity-record.mjs` (`npm run parity:record`) writes a record
 *     per component after a parity check: the Figma node, the score, the verifying
 *     git sha/date, and an `inputsHash` over the component's files (all three
 *     frameworks — see lib/parity-inputs.js).
 *   - This gate reads `tools/figma/parity.json` + the snapshot's component list and,
 *     per master:
 *       · no record yet                       → WARNING  (never verified)
 *       · inputsHash changed since the record  → BLOCKER  (drifted; re-verify)
 *       · figma node id moved vs the snapshot  → WARNING  (node renumbered)
 *       · score below PARITY_MIN (if set)      → CRITICAL (low parity)
 *
 * Exit code (symmetric with the other gates): BLOCKER + CRITICAL → exit 1;
 * WARNING prints and exits 0. Fully offline and deterministic — the only step
 * that needs Figma is the interactive verify + `parity:record` refresh.
 *
 * Not in `check:all`/CI/pre-push for the same reason as check:figma: clearing a
 * drift BLOCKER means re-running figma_check_design_parity, which needs the Figma
 * Desktop Bridge. Run it before a Figma-touching release / in the verify workflow.
 * Promotion path is in plan/adr/0024.
 *
 * Run via:  node tools/scripts/check-parity.js   (or  npm run check:parity)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, moduleForSelector, computeInputsHash } = require('./lib/parity-inputs');

const SNAPSHOT_FILE = path.join(ROOT, 'tools/figma/snapshot.json');
const PARITY_FILE = path.join(ROOT, 'tools/figma/parity.json');

// Optional minimum parity score. Unset by default (figma_check_design_parity's
// scale is the verify tool's, not ours to assume) — set ATELIER_PARITY_MIN to
// enforce a floor once the team agrees on the scale.
const PARITY_MIN = process.env.ATELIER_PARITY_MIN ? Number(process.env.ATELIER_PARITY_MIN) : null;

const errors = [];
const warnings = [];
function blocker(tag, msg) { errors.push({ sev: 'BLOCKER', tag, msg }); }
function critical(tag, msg) { errors.push({ sev: 'CRITICAL', tag, msg }); }
function warning(tag, msg) { warnings.push({ sev: 'WARNING', tag, msg }); }

function loadJson(file, label) {
  if (!fs.existsSync(file)) {
    console.error(`✗ [${label}] ${path.relative(ROOT, file)} not found.`);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`✗ [${label}] ${path.relative(ROOT, file)} is not valid JSON: ${err.message}`);
    process.exit(1);
  }
}

const snapshot = loadJson(SNAPSHOT_FILE, 'SNAPSHOT');
if (!Array.isArray(snapshot.components) || snapshot.components.length === 0) {
  console.error(`✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} has no components. Run npm run figma:snapshot.`);
  process.exit(1);
}
const parity = loadJson(PARITY_FILE, 'PARITY');
const records = parity.components || {};

let recorded = 0;
for (const comp of snapshot.components) {
  const selector = comp.selector;
  const moduleName = moduleForSelector(selector);
  if (!moduleName) {
    // No spec/registry entry (e.g. AtlCodeBlock, AtlToast) — can't locate its
    // files, so parity is untrackable here. Advisory, matches check-figma's
    // treatment of spec-less masters.
    warning('MAP', `${selector}: no spec/registry mapping, parity inputs cannot be located. Add it to COMPONENT_METADATA_REGISTRY or allowlist it.`);
    continue;
  }

  const rec = records[selector];
  if (!rec) {
    warning('UNVERIFIED', `${selector}: never design-parity-verified. Run figma_check_design_parity (node ${comp.nodeId}), then: npm run parity:record -- --component ${selector} --score <score>`);
    continue;
  }
  recorded++;

  const { hash } = computeInputsHash(moduleName);
  if (rec.inputsHash !== hash) {
    blocker('DRIFT', `${selector}: component files changed since the last parity check (verified ${rec.verifiedSha || '?'} on ${rec.verifiedAt || '?'}). Re-run figma_check_design_parity and: npm run parity:record -- --component ${selector} --score <score>`);
    continue;
  }
  if (rec.figmaNodeId && comp.nodeId && rec.figmaNodeId !== comp.nodeId) {
    warning('NODE', `${selector}: recorded Figma node ${rec.figmaNodeId} != snapshot node ${comp.nodeId}. The master may have been renumbered; re-verify to be safe.`);
  }
  if (PARITY_MIN != null && typeof rec.parityScore === 'number' && rec.parityScore < PARITY_MIN) {
    critical('SCORE', `${selector}: recorded parity score ${rec.parityScore} is below the ATELIER_PARITY_MIN floor (${PARITY_MIN}).`);
  }
}

report();

function report() {
  const order = { BLOCKER: 0, CRITICAL: 1, WARNING: 2 };
  const all = [...errors, ...warnings].sort((a, b) => order[a.sev] - order[b.sev]);
  const head = `${recorded}/${snapshot.components.length} master(s) have a parity record`;

  if (all.length === 0) {
    console.log(`✓ design parity in sync (${head}).`);
    return;
  }
  for (const f of all) {
    const line = `${f.sev === 'WARNING' ? '⚠' : '✗'} [${f.sev}] [${f.tag}] ${f.msg}`;
    if (f.sev === 'WARNING') console.warn(line);
    else console.error(line);
  }
  const blockers = errors.filter((e) => e.sev === 'BLOCKER').length;
  const criticals = errors.filter((e) => e.sev === 'CRITICAL').length;
  if (errors.length > 0) {
    console.error(`\n${errors.length} parity issue(s): ${blockers} blocker, ${criticals} critical, ${warnings.length} warning. ${head}.`);
    process.exit(1);
  }
  console.warn(`\n${warnings.length} parity warning(s) (non-blocking). ${head}.`);
}
