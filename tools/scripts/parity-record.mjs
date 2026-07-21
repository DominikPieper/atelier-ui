#!/usr/bin/env node
/**
 * parity-record.mjs
 *
 * Persist a design-parity result so check-parity.js can later catch drift.
 * Run this right after figma_check_design_parity, while you know the score:
 *
 *   npm run parity:record -- --component AtlButton --score 0.98
 *   npm run parity:record -- --component AtlCard --score 0.97 --node 55:65
 *
 * It records the component's Figma node (looked up from the snapshot when --node
 * is omitted), the score, the verifying git sha + timestamp, and an inputsHash
 * over the component's files across all three frameworks (lib/parity-inputs.js).
 * The hash is what check-parity compares against on a later run — if any of those
 * files changed since this record, the gate asks for a re-verify. See plan/adr/0024.
 *
 * This is the ONE part of the parity loop that depends on a human/agent having run
 * the (bridge-connected) verify; the gate itself is fully offline.
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
  fail('missing --component <Selector> (e.g. --component AtlButton). Usage:\n  npm run parity:record -- --component AtlButton --score 0.98 [--node 129:20]');
}
const selector = args.component;

const moduleName = moduleForSelector(selector);
if (!moduleName) fail(`${selector} has no COMPONENT_METADATA_REGISTRY entry, so its parity inputs cannot be located.`);

let score = null;
if (args.score !== undefined) {
  score = Number(args.score);
  if (Number.isNaN(score)) fail(`--score "${args.score}" is not a number.`);
}

// Resolve the Figma node id: explicit --node wins, else look it up in the snapshot.
let figmaNodeId = args.node || null;
if (!figmaNodeId && existsSync(SNAPSHOT_FILE)) {
  try {
    const snap = JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'));
    figmaNodeId = (snap.components || []).find((c) => c.selector === selector)?.nodeId || null;
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
  parityScore: score,
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
console.log(`✓ recorded parity for ${selector} (node ${figmaNodeId || '?'}, score ${score ?? 'n/a'}, ${inputs.length} input file(s)).`);

function gitSha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}
