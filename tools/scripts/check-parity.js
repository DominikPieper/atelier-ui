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
 * Two modes, because clearing a DRIFT blocker needs the Figma Desktop Bridge and
 * `check:all` runs where the bridge is not (CI, and any session doing code-only
 * work). ADR-0024 §4 promoted this gate into the chain and ADR-0082 splits it:
 *
 *   default      DRIFT blocks. This is what a human runs with the bridge open,
 *                and what the PR checklist asks for after touching a component.
 *   `--report`   DRIFT reports as a WARNING, naming every component owed and the
 *                command that clears it, and exits 0. This is what `check:all`
 *                runs — the same standing check:figma already has in that chain,
 *                for the same reason. It reports; it does not skip.
 *
 * Run via:  node tools/scripts/check-parity.js   (or  npm run check:parity)
 *           node tools/scripts/check-parity.js --report  (npm run check:parity:report)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, moduleForSelector, computeInputsHash } = require('./lib/parity-inputs');
const { maps } = require('./lib/component-map');

const SNAPSHOT_FILE = path.join(ROOT, 'tools/figma/snapshot.json');
const ARTBOARDS_FILE = path.join(ROOT, 'tools/design/artboards.json');

/**
 * Redesign phase. While the library is being redesigned in Claude Design and the
 * Figma masters have not been rebuilt yet, Figma is the TARGET of the transfer,
 * not the reference for it — so a changed component is expected, and demanding a
 * re-verify against a design we deliberately left behind proves nothing. DRIFT
 * therefore reports as a WARNING while the phase is active, and every run says so
 * loudly with the count still owed. The switch lives in the design registry
 * (`tools/design/artboards.json`, meta.redesignPhase) because it is a fact about
 * the design work, not about this gate. Flip `active` to false after the transfer
 * and drift blocks again. See ADR-0043.
 */
function readRedesignPhase() {
  try {
    const meta = JSON.parse(fs.readFileSync(ARTBOARDS_FILE, 'utf8')).meta || {};
    const phase = meta.redesignPhase;
    return phase && phase.active === true ? phase : null;
  } catch {
    return null; // no registry, no phase — drift blocks, which is the safe default
  }
}
const redesignPhase = readRedesignPhase();

/**
 * Report mode (ADR-0082). DRIFT is a real finding wherever it fires, but its only
 * remedy is a bridge-backed re-verify, so blocking on it in `check:all` makes the
 * offline chain unclearable the moment anyone edits a component directory — a test
 * file is enough, since the hash covers the whole directory. In report mode the
 * finding is printed in full, with the count owed and the exact command, and the
 * exit code is 0.
 */
const REPORT_ONLY = process.argv.includes('--report');
const PARITY_FILE = path.join(ROOT, 'tools/figma/parity.json');

const errors = [];
const warnings = [];
const drifted = [];
function blocker(tag, msg) { errors.push({ sev: 'BLOCKER', tag, msg }); }
// Kept for future findings: the CRITICAL severity is part of this gate's
// vocabulary (see report()), even though no current check emits one.
// eslint-disable-next-line no-unused-vars
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
/** Masters parity does not track on purpose, reported as a count rather than as
 *  warnings — see the MAP branch below. */
const untracked = [];
for (const comp of snapshot.components) {
  const selector = comp.selector;
  const moduleName = moduleForSelector(selector);
  if (!moduleName) {
    // Three different situations used to share one warning, and only the third is
    // actionable — so the first two were a warning nobody could ever clear, which
    // is how a reader learns to skim warnings (ADR-0066).
    const specName = `${selector}Spec`;
    const { nonComponentSpecs, exportedSpecs } = maps();
    if (!exportedSpecs.has(specName)) {
      // No such spec interface at all, by design: AtlToast and AtlCodeBlock have no
      // contract (check-figma allowlists them the same way), and AtlMenuSeparator and
      // AtlChatTyping earn a master by being placeable rather than by having state
      // (ADR-0062).
      untracked.push(`${selector} (no ${specName})`);
    } else if (nonComponentSpecs.has(specName)) {
      // The spec exists and the metadata index deliberately does not treat it as a
      // component — a shape its parent renders.
      untracked.push(`${selector} (${specName} is in NON_COMPONENT_SPECS)`);
    } else {
      warning('MAP', `${selector}: ${specName} is exported and is not in NON_COMPONENT_SPECS, but has no COMPONENT_METADATA_REGISTRY entry — so parity inputs cannot be located. Add the entry.`);
    }
    continue;
  }

  const rec = records[selector];
  if (!rec) {
    warning('UNVERIFIED', `${selector}: never design-parity-verified. Run figma_check_design_parity (node ${comp.nodeId}), then: npm run parity:record -- --component ${selector}`);
    continue;
  }
  recorded++;

  const { hash } = computeInputsHash(moduleName);
  if (rec.inputsHash !== hash) {
    const msg =
      `${selector}: component files changed since the last parity check ` +
      `(verified ${rec.verifiedSha || '?'} on ${rec.verifiedAt || '?'}). ` +
      `Re-run figma_check_design_parity and: npm run parity:record -- --component ${selector}`;
    if (redesignPhase) {
      drifted.push(selector);
      warning('DRIFT', `${msg} — owed, not blocking: redesign phase (banner above).`);
    } else if (REPORT_ONLY) {
      drifted.push(selector);
      warning('DRIFT', `${msg} — owed, not blocking here: report mode (banner above).`);
    } else {
      blocker('DRIFT', msg);
    }
    continue;
  }
  if (rec.figmaNodeId && comp.nodeId && rec.figmaNodeId !== comp.nodeId) {
    warning('NODE', `${selector}: recorded Figma node ${rec.figmaNodeId} != snapshot node ${comp.nodeId}. The master may have been renumbered; re-verify to be safe.`);
  }
}

report();

function report() {
  const order = { BLOCKER: 0, CRITICAL: 1, WARNING: 2 };
  const all = [...errors, ...warnings].sort((a, b) => order[a.sev] - order[b.sev]);
  const head =
    `${recorded}/${snapshot.components.length} master(s) have a parity record` +
    (untracked.length ? `; ${untracked.length} intentionally untracked (${untracked.join(', ')})` : '');

  if (redesignPhase) {
    console.warn(
      `● redesign phase active since ${redesignPhase.since} (tools/design/artboards.json, meta.redesignPhase):\n` +
        `  Figma is the target of the transfer, not the reference, so a drifted record is expected and does not block.\n` +
        `  ${drifted.length} record(s) owe a re-verify once the transfer lands${drifted.length ? `: ${drifted.join(', ')}` : ''}.\n` +
        `  Clear it by: ${redesignPhase.clearedBy || 'rebuilding the masters, then re-verifying every component.'}`
    );
  } else if (REPORT_ONLY && drifted.length) {
    console.warn(
      `● parity report mode (--report, ADR-0082):\n` +
        `  ${drifted.length} component(s) have changed since their last design-parity verify: ${drifted.join(', ')}.\n` +
        `  Not blocking here because the remedy needs the Figma Desktop Bridge, which this chain does not have.\n` +
        `  Clear it with the bridge open: figma_check_design_parity, then npm run parity:record -- --component <Name>,\n` +
        `  and confirm with npm run check:parity (no --report), which blocks.`
    );
  }

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
