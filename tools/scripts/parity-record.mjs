#!/usr/bin/env node
/**
 * parity-record.mjs
 *
 * Persist a design-parity result so check-parity.js can later catch drift.
 * Run this right after figma_check_design_parity:
 *
 *   npm run parity:record -- --component AtlButton
 *   npm run parity:record -- --component AtlCard --node 55:65
 *
 * It records the component's Figma node (looked up from the snapshot when --node
 * is omitted), the verifying git sha + timestamp, and an inputsHash over the
 * component's files across all three frameworks (lib/parity-inputs.js).
 *
 * The parity SCORE is deliberately not stored. It is not comparable across
 * runs: it tracks how much of `codeSpec` you declared and which node you
 * sampled, not the component's state. Three runs on one commit for AtlStepper
 * returned 70, 52 and 83 — see ADR-0024's 2026-08-26 amendment. `--score` is
 * still accepted so muscle memory and older notes keep working; it is echoed
 * and dropped.
 * The hash is what check-parity compares against on a later run — if any of those
 * files changed since this record, the gate asks for a re-verify. See plan/adr/0024.
 *
 * This is the ONE part of the parity loop that depends on a human/agent having run
 * the (bridge-connected) verify; the gate itself is fully offline.
 *
 * The record also carries `figmaLastModified` — the Figma file's last-modified
 * stamp, copied from `tools/figma/snapshot.json`'s `meta.figmaLastModified`
 * (the same field `figma-snapshot.mjs` and `check-figma.js` already know by that
 * name; see ADR-0019/ADR-0034). It costs nothing extra here: the snapshot is
 * already read above to resolve the Figma node id. It is purely informational —
 * `check-parity.js` stays fully offline and asserts nothing about it — because
 * no content hash can tell you the Figma *master* itself moved; a record only
 * ever knew about the code side of parity. Populating the snapshot's own
 * `figmaLastModified` (still `null` as of this writing — a separate, open gap,
 * see ADR-0019/ADR-0034) is what would make this field meaningful; until then
 * it is copied through as whatever the snapshot has, `null` included. ADR-0104.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { moduleForSelector, computeInputsHash } = require('./lib/parity-inputs.js');

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const SNAPSHOT_FILE = resolve(ROOT, 'tools/figma/snapshot.json');
const PARITY_FILE = resolve(ROOT, 'tools/figma/parity.json');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--component' || a === '-c') out.component = argv[++i];
    else if (a === '--score' || a === '-s') out.score = argv[++i];
    else if (a === '--node' || a === '-n') out.node = argv[++i];
  }
  return out;
}

function fail(msg) {
  console.error(`✗ parity:record — ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
if (!args.component) {
  fail('missing --component <Selector> (e.g. --component AtlButton). Usage:\n  npm run parity:record -- --component AtlButton [--node 129:20]');
}
const selector = args.component;

const moduleName = moduleForSelector(selector);
if (!moduleName) fail(`${selector} has no COMPONENT_METADATA_REGISTRY entry, so its parity inputs cannot be located.`);

// Accepted, echoed, and deliberately NOT stored — see the header note.
if (args.score !== undefined) {
  console.log(
    `note: --score ${args.score} is not stored. The score is not comparable across runs ` +
      `(it tracks how much codeSpec was declared and which node was sampled). ADR-0024.`
  );
}

// Resolve the Figma node id: explicit --node wins, else look it up in the snapshot.
// Also carry the snapshot's figmaLastModified stamp through — see the header note.
let figmaNodeId = args.node || null;
let figmaLastModified = null;
if (existsSync(SNAPSHOT_FILE)) {
  try {
    const snap = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'));
    if (!figmaNodeId) {
      figmaNodeId = (snap.components || []).find((c) => c.selector === selector)?.nodeId || null;
    }
    figmaLastModified = snap.meta?.figmaLastModified ?? null;
  } catch {
    /* snapshot optional here; --node can supply it */
  }
}

const { hash, inputs } = computeInputsHash(moduleName);

const parity = existsSync(PARITY_FILE)
  ? JSON.parse(readFileSync(PARITY_FILE, 'utf8'))
  : { meta: { fileKey: 'QMnDD8uZQPldPrlCwZZ58T' }, components: {} };
parity.components = parity.components || {};

parity.components[selector] = {
  figmaNodeId,
  figmaLastModified,
  verifiedAt: new Date().toISOString(),
  verifiedSha: gitSha(),
  inputsHash: hash,
  inputs,
};
parity.meta = parity.meta || {};
parity.meta.generatedAt = new Date().toISOString();

// Stable key order so diffs stay readable.
const ordered = {};
for (const k of Object.keys(parity.components).sort()) ordered[k] = parity.components[k];
parity.components = ordered;

writeFileSync(PARITY_FILE, JSON.stringify(parity, null, 2) + '\n');
console.log(`✓ recorded parity for ${selector} (node ${figmaNodeId || '?'}, ${inputs.length} input file(s)).`);

function gitSha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
