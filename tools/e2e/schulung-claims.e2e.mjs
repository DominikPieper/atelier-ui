#!/usr/bin/env node
/**
 * schulung-claims.e2e.mjs
 *
 * The training curriculum (docs/src/pages/schulung.astro) makes checkable
 * claims about this repo — a gate count, a set of MCP tools, a list of
 * commands, a set of Figma references — and until now nothing checked them.
 * Three of the four blockers in tasks/schulung-review-2026-09-05.md were
 * claims that had quietly gone false: a command nobody could run, a gate
 * that verified nothing, a prop that didn't exist. This is the test that
 * finds the next one.
 *
 * It asserts four things, each read live from docs/src/pages/schulung.astro
 * rather than hard-coded, so a reworded claim is re-verified against the new
 * wording (or the script fails loudly pointing at the anchor that moved),
 * not silently checked against a stale copy:
 *
 *   1. The Day-2 gate-count claim (B02): reproduces the review's method —
 *      synthesize a throwaway single-framework component, run the named
 *      gates, and assert the EXACT set that goes red for "spec in its own
 *      file" vs. "spec landed in the shared master". Restores the tree in a
 *      `finally`. Also runs `check:manifests` (added after that review) in
 *      both scenarios and reports whether it belongs in either red set —
 *      the curriculum's claimed number depends on the answer.
 *   2. The local Storybook MCP surface Day 2 depends on (B02/B03): starts a
 *      real local Storybook per framework, speaks MCP to it over HTTP
 *      (streamable-HTTP: initialize → notifications/initialized →
 *      tools/list), and asserts the tools the curriculum names by name are
 *      present. Shuts every server down in a `finally`.
 *   3. Every `npm run <script>` and `nx <target> <project>` invocation named
 *      on the page resolves — script in package.json, target on the
 *      project. Cheap, and exactly what would have caught a renamed MCP
 *      tool or npm script before it shipped.
 *   4. Every Figma node/frame the page cites (the kata node, the five
 *      workshop starter frames) is present in the committed
 *      tools/figma/snapshot.json. Read offline — no Figma call.
 *
 * Extraction quirk worth knowing: the page uses "nicht über X" / "nicht X"
 * a few times to name a command it explicitly says NOT to use (e.g. "nx
 * storybook <fw>, nicht über nx serve workshop-<fw>" — that second command
 * only exists in the CLI-scaffolded standalone workspace, not this repo).
 * A match is dropped if "nicht" appears within 15 characters before it —
 * tight enough to catch "nicht über nx serve" and "nicht npm run
 * check:parity" without also swallowing "... Toolset nicht, ihr Loop bleibt
 * nx test <lib>", where "nicht" negates an earlier noun and `nx test <lib>`
 * is a real, positive claim a few words later. If this script ever reports
 * a suspiciously-shaped project/script name, check whether the anchor
 * distance assumption still holds against the current wording.
 *
 * OUT OF SCOPE, on purpose: Figma actions (this only reads the committed
 * snapshot), Claude Design, anything needing the Desktop Bridge, agent/
 * prompt behaviour, and the hosted (production) MCP endpoints — those need
 * a human or a network call and belong in a real dry run, not here.
 * Everything this script does is offline and deterministic against the
 * current working tree.
 *
 * Deliberately NOT in `npm run check:all` — it starts three Storybook dev
 * servers and mutates/restores the tree twice, taking minutes rather than
 * seconds. It gets its own CI job, the way `create-atelier-ui-workspace:e2e`
 * (libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs) does — same idiom, a
 * plain .mjs run via an `nx:run-commands` target.
 *
 * Run via:  node tools/e2e/schulung-claims.e2e.mjs
 *           (or  npx nx run @atelier-ui/source:schulung-claims-e2e)
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCHULUNG_REL = 'docs/src/pages/schulung.astro';
const SCHULUNG_PATH = join(ROOT, SCHULUNG_REL);
const SNAPSHOT_PATH = join(ROOT, 'tools/figma/snapshot.json');
const PKG_PATH = join(ROOT, 'package.json');

const FRAMEWORKS = ['angular', 'react', 'vue'];
const STORYBOOK_PORTS = { angular: 4400, react: 4401, vue: 4402 };

// ---------------------------------------------------------------------------
// Small harness — matches the idiom of
// libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs (section/ok console
// helpers, per-unit try/finally with cleanup, collect-then-report failures).
// ---------------------------------------------------------------------------
function section(msg) {
  console.log(`\n=== ${msg} ===`);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function warn(msg) {
  console.log(`  ⚠ ${msg}`);
}

function readAstro() {
  return readFileSync(SCHULUNG_PATH, 'utf8');
}
function readPkg() {
  return JSON.parse(readFileSync(PKG_PATH, 'utf8'));
}
function decodeEntities(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
/** See the header comment: a 15-char lookback for a preceding "nicht". */
function isNegated(text, matchIndex) {
  const windowStart = Math.max(0, matchIndex - 15);
  return /nicht/i.test(text.slice(windowStart, matchIndex));
}

function gitStatusPorcelain() {
  const res = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  if (res.status !== 0) throw new Error(`git status failed: ${res.stderr}`);
  return res.stdout;
}
function assertCleanTree(label) {
  const out = gitStatusPorcelain();
  if (out.trim().length > 0) {
    throw new Error(`working tree is not clean (${label}):\n${out}`);
  }
}

function runNpmScript(name) {
  const res = spawnSync('npm', ['run', name], { cwd: ROOT, encoding: 'utf8' });
  return { status: res.status, output: `${res.stdout || ''}${res.stderr || ''}` };
}

// =============================================================================
// Part 1 — the gate-count claim (Day 2, Block 02;
// tasks/schulung-review-2026-09-05.md, finding B1)
// =============================================================================

const BULLET_START = 'Drei Gates werden dabei erwartungsgemäß rot';
const BULLET_MID = 'kommen drei weitere dazu';
const BULLET_END = 'die Spec liegt im Master';

/**
 * Parse the gate-count claim straight out of the page: the three gates that
 * go red for an own-file spec, and the three MORE that go red once the spec
 * also lands in the shared master. Throws (rather than falling back to a
 * hard-coded list) if the anchors don't match the current wording — a test
 * that quietly asserts yesterday's claim against today's code is exactly the
 * failure mode this script exists to close.
 */
function extractGateClaim(astroText) {
  const startIdx = astroText.indexOf(BULLET_START);
  if (startIdx === -1) {
    throw new Error(
      `could not find the gate-count claim in ${SCHULUNG_REL} (anchor "${BULLET_START}" not found). ` +
        `Either the claim was reworded (update this script's anchors) or removed (Part 1 no longer applies).`
    );
  }
  const endIdx = astroText.indexOf(BULLET_END, startIdx);
  if (endIdx === -1) {
    throw new Error(
      `found the start of the gate-count claim but not its end anchor ("${BULLET_END}") in ${SCHULUNG_REL}.`
    );
  }
  const bullet = astroText.slice(startIdx, endIdx + BULLET_END.length);
  const midIdx = bullet.indexOf(BULLET_MID);
  if (midIdx === -1) {
    throw new Error(
      `found the gate-count claim but not the middle anchor ("${BULLET_MID}") that separates the ` +
        `"own file" gates from the "in the shared master" gates.`
    );
  }
  const partA = bullet.slice(0, midIdx);
  const partB = bullet.slice(midIdx);
  const extract = (s) => [...new Set([...s.matchAll(/check:[a-zA-Z0-9-]+/g)].map((m) => m[0]))];
  const ownFileGates = extract(partA);
  const extraInMasterGates = extract(partB);
  if (ownFileGates.length === 0) {
    throw new Error(`parsed the gate-count claim but found zero 'check:*' names before the split.`);
  }
  if (extraInMasterGates.length === 0) {
    throw new Error(`parsed the gate-count claim but found zero 'check:*' names after the split.`);
  }
  return { ownFileGates, extraInMasterGates };
}

const WSDEMO_DIR = join(ROOT, 'libs/angular/src/lib/wsdemo');
const SPEC_FILE = join(ROOT, 'libs/spec/src/index.ts');

// Reproduces the exact fixture from tasks/schulung-review-2026-09-05.md (B1):
// a single-framework component (Angular only) with its spec in its own file
// next to it — the Day-2 participant's starting state.
const WSDEMO_CONTRACT = `// Throwaway "own-file" component contract for the schulung gate-count e2e
// (tools/e2e/schulung-claims.e2e.mjs). Reproduces the Day-2 participant
// scenario from tasks/schulung-review-2026-09-05.md (B1): a spec that lives
// next to the component, NOT inside the shared libs/spec/src/index.ts master.
export type AtlWsdemoVariant = 'solid' | 'outline';

export interface AtlWsdemoSpec {
  variant?: AtlWsdemoVariant;
}
`;

const WSDEMO_COMPONENT = `import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { AtlWsdemoVariant } from './wsdemo.contract';

/**
 * Throwaway component synthesized by the schulung gate-count e2e
 * (tools/e2e/schulung-claims.e2e.mjs). Not a real Atelier component; it
 * exists only to reproduce the participant scenario from
 * tasks/schulung-review-2026-09-05.md (B1) and is deleted after the run.
 */
@Component({
  selector: 'atl-wsdemo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<span class="variant-{{ variant() }}"><ng-content /></span>\`,
})
export class AtlWsdemo {
  readonly variant = input<AtlWsdemoVariant>('solid');
}
`;

const WSDEMO_STORY = `import type { Meta, StoryObj } from '@storybook/angular';
import { AtlWsdemo } from './atl-wsdemo';

const meta: Meta<AtlWsdemo> = {
  title: 'Workshop/AtlWsdemo',
  component: AtlWsdemo,
};
export default meta;
type Story = StoryObj<AtlWsdemo>;
export const Default: Story = {};
`;

const MASTER_APPEND = `
// --- Throwaway scenario-B addition for the schulung gate-count e2e ---
// (tools/e2e/schulung-claims.e2e.mjs). Reproduces landing a participant's
// spec inside the shared master instead of its own file. Reverted via
// \`git checkout -- libs/spec/src/index.ts\` after the run.
export type AtlWsdemoVariant = 'solid' | 'outline';

export interface AtlWsdemoSpec {
  variant?: AtlWsdemoVariant;
}
`;

function writeOwnFileFixture() {
  mkdirSync(WSDEMO_DIR, { recursive: true });
  writeFileSync(join(WSDEMO_DIR, 'wsdemo.contract.ts'), WSDEMO_CONTRACT);
  writeFileSync(join(WSDEMO_DIR, 'atl-wsdemo.ts'), WSDEMO_COMPONENT);
  writeFileSync(join(WSDEMO_DIR, 'atl-wsdemo.stories.ts'), WSDEMO_STORY);
}
function appendSpecToMaster() {
  const original = readFileSync(SPEC_FILE, 'utf8');
  writeFileSync(SPEC_FILE, original + MASTER_APPEND);
}
function cleanupFixture() {
  if (existsSync(WSDEMO_DIR)) rmSync(WSDEMO_DIR, { recursive: true, force: true });
  spawnSync('git', ['checkout', '--', 'libs/spec/src/index.ts'], { cwd: ROOT });
}

async function checkGateExpectations() {
  const failures = [];
  section('Part 1 — gate-count claim (Day 2, Block 02)');

  assertCleanTree('before Part 1 — refusing to run against an already-dirty tree');

  const astroText = readAstro();
  const { ownFileGates, extraInMasterGates } = extractGateClaim(astroText);
  ok(
    `extracted claim: own-file → {${ownFileGates.join(', ')}} red; ` +
      `shared-master → +{${extraInMasterGates.join(', ')}} red`
  );

  const pkg = readPkg();
  for (const gate of [...ownFileGates, ...extraInMasterGates]) {
    if (!(gate in (pkg.scripts || {}))) {
      failures.push(`curriculum names '${gate}' as an expected-red gate, but package.json has no such script`);
    }
  }
  if (failures.length > 0) return failures; // nothing meaningful left to run

  const allGates = [...ownFileGates, ...extraInMasterGates, 'check:manifests'];

  try {
    writeOwnFileFixture();
    ok('wrote throwaway libs/angular/src/lib/wsdemo/ (atl-wsdemo.ts, story, wsdemo.contract.ts)');

    section('Part 1a — scenario A: spec in its own file');
    const resA = Object.fromEntries(allGates.map((g) => [g, runNpmScript(g)]));
    for (const g of ownFileGates) {
      if (resA[g].status === 0) {
        failures.push(`[scenario A] expected '${g}' to fail (own-file spec) but it exited 0`);
      } else {
        ok(`${g} red as expected (exit ${resA[g].status})`);
      }
    }
    for (const g of extraInMasterGates) {
      if (resA[g].status !== 0) {
        failures.push(
          `[scenario A] expected '${g}' to PASS (curriculum: only goes red once the spec lands in the ` +
            `shared master) but it exited ${resA[g].status}:\n${resA[g].output.slice(-2000)}`
        );
      } else {
        ok(`${g} green as expected`);
      }
    }
    if (resA['check:manifests'].status !== 0) {
      failures.push(
        `[scenario A] check:manifests went RED on a single-framework addition. The curriculum's ` +
          `"three red gates" claim does not name check:manifests — if it belongs in the red set now, ` +
          `that claim is stale by one gate:\n${resA['check:manifests'].output.slice(-2000)}`
      );
    } else {
      ok('check:manifests stays green in scenario A (does not belong in the curriculum’s red list)');
    }

    section('Part 1b — scenario B: spec also lands in libs/spec/src/index.ts');
    appendSpecToMaster();
    const resB = Object.fromEntries(allGates.map((g) => [g, runNpmScript(g)]));
    for (const g of [...ownFileGates, ...extraInMasterGates]) {
      if (resB[g].status === 0) {
        failures.push(`[scenario B] expected '${g}' to fail (spec in shared master) but it exited 0`);
      } else {
        ok(`${g} red as expected (exit ${resB[g].status})`);
      }
    }
    if (resB['check:manifests'].status !== 0) {
      failures.push(
        `[scenario B] check:manifests went RED once the spec landed in the shared master too. The ` +
          `curriculum's "six red gates" claim does not name check:manifests — if it belongs in the red ` +
          `set now, that claim is stale by one gate:\n${resB['check:manifests'].output.slice(-2000)}`
      );
    } else {
      ok('check:manifests stays green in scenario B too (does not belong in the curriculum’s red list)');
    }
  } finally {
    cleanupFixture();
    try {
      assertCleanTree('after Part 1 cleanup');
      ok('tree restored and clean');
    } catch (err) {
      failures.push(`CLEANUP FAILED: ${err.message}`);
    }
  }

  return failures;
}

// =============================================================================
// Part 2 — the local MCP surface Day 2 depends on (Day 2, Blocks 02/03)
// =============================================================================

const MCP_TOOLS_ANCHOR = 'dev/test-Tools (';

/** Parse the required local MCP tool list straight out of the page. */
function extractExpectedMcpTools(astroText) {
  const idx = astroText.indexOf(MCP_TOOLS_ANCHOR);
  if (idx === -1) {
    throw new Error(
      `could not find "${MCP_TOOLS_ANCHOR}..." in ${SCHULUNG_REL} — wording changed; update this ` +
        `script's anchor.`
    );
  }
  const closeIdx = astroText.indexOf(')', idx);
  if (closeIdx === -1) throw new Error('found the tool-list anchor but no closing paren after it');
  const inner = astroText.slice(idx + MCP_TOOLS_ANCHOR.length, closeIdx);
  const tools = inner
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (tools.length === 0) throw new Error('parsed the tool-list anchor but found zero tool names inside it');
  return tools;
}

function parseSse(text) {
  const out = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('data:')) {
      const payload = line.slice(5).trim();
      if (payload) out.push(JSON.parse(payload));
    }
  }
  return out;
}

async function mcpCall(url, body, sessionId) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const newSessionId = res.headers.get('mcp-session-id');
  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();
  let messages = [];
  if (contentType.includes('text/event-stream')) messages = parseSse(raw);
  else if (raw.trim()) messages = [JSON.parse(raw)];
  return { status: res.status, sessionId: newSessionId, messages };
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function portIsUp(port) {
  try {
    const res = await fetch(`http://localhost:${port}`, { signal: AbortSignal.timeout(1000) });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function killProcess(proc) {
  if (!proc || proc.exitCode !== null || proc.signalCode !== null) return;
  const exited = new Promise((r) => proc.once('exit', r));
  proc.kill('SIGTERM');
  const timeout = new Promise((r) => setTimeout(r, 5000));
  await Promise.race([exited, timeout]);
  if (proc.exitCode === null && proc.signalCode === null) {
    try {
      proc.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  }
}

async function checkMcpSurfaceForFramework(fw, expectedTools) {
  const port = STORYBOOK_PORTS[fw];
  const url = `http://localhost:${port}/mcp`;
  let proc = null;
  let weStartedIt = false;
  const failures = [];
  try {
    const already = await portIsUp(port);
    if (already) {
      warn(`${fw}: something is already listening on ${port} — reusing it read-only (not starting/stopping it)`);
    } else {
      proc = spawn(
        'npx',
        ['storybook', 'dev', '--config-dir', `libs/${fw}/.storybook`, '--port', String(port), '--ci'],
        { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }
      );
      weStartedIt = true;
      let out = '';
      proc.stdout.on('data', (d) => (out += d));
      proc.stderr.on('data', (d) => (out += d));
      const up = await waitForHttp(`http://localhost:${port}`, 90_000);
      if (!up) {
        failures.push(`${fw}: local Storybook dev server on ${port} did not come up within 90s\n${out.slice(-2000)}`);
        return failures;
      }
      ok(`${fw}: local Storybook up on ${port}`);
    }

    const init = await mcpCall(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'schulung-claims-e2e', version: '0.0.0' },
      },
    });
    if (init.status !== 200) {
      failures.push(`${fw}: MCP initialize returned HTTP ${init.status}`);
      return failures;
    }
    const sessionId = init.sessionId;
    await mcpCall(url, { jsonrpc: '2.0', method: 'notifications/initialized', params: {} }, sessionId);
    const list = await mcpCall(url, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }, sessionId);
    const toolsMsg = list.messages.find((m) => m.result && m.result.tools);
    const names = toolsMsg ? toolsMsg.result.tools.map((t) => t.name) : [];
    ok(`${fw}: tools/list → ${names.length} tools`);

    for (const expected of expectedTools) {
      if (!names.includes(expected)) {
        failures.push(
          `${fw}: curriculum requires '${expected}' from the local MCP surface, but tools/list did not ` +
            `return it. Present: ${JSON.stringify(names)}`
        );
      }
    }
  } finally {
    if (weStartedIt) await killProcess(proc);
  }
  return failures;
}

async function checkMcpSurface() {
  section('Part 2 — local MCP surface Day 2 depends on');
  const astroText = readAstro();
  const expectedTools = extractExpectedMcpTools(astroText);
  ok(`extracted required local MCP tools: ${expectedTools.join(', ')}`);
  const failures = [];
  for (const fw of FRAMEWORKS) {
    const fwFailures = await checkMcpSurfaceForFramework(fw, expectedTools);
    failures.push(...fwFailures);
  }
  return failures;
}

// =============================================================================
// Part 3 — every command the curriculum names exists
// =============================================================================

function extractNpmScripts(astroText) {
  const out = [];
  for (const m of astroText.matchAll(/npm run ([a-zA-Z0-9:_-]+)/g)) {
    if (isNegated(astroText, m.index)) continue;
    out.push(m[1]);
  }
  return [...new Set(out)];
}

function extractNxInvocations(astroText) {
  const decoded = decodeEntities(astroText);
  const out = [];
  for (const m of decoded.matchAll(/\bnx ([a-zA-Z][\w-]*) (<[a-z]+>|[a-zA-Z][\w-]*)/g)) {
    if (isNegated(decoded, m.index)) continue;
    out.push({ target: m[1], project: m[2] });
  }
  return out;
}

/** `<fw>` / `<lib>` always mean "whichever framework the participant chose". */
function expandProjectToken(token) {
  if (token === '<fw>' || token === '<lib>') return [...FRAMEWORKS];
  return [token];
}

async function checkCommandsExist() {
  section('Part 3 — every named command exists');
  const failures = [];
  const astroText = readAstro();
  const pkg = readPkg();

  const scripts = extractNpmScripts(astroText);
  ok(`extracted ${scripts.length} distinct 'npm run' invocation(s): ${scripts.join(', ')}`);
  for (const s of scripts) {
    if (!(s in (pkg.scripts || {}))) {
      failures.push(`npm script '${s}' named in the curriculum does not exist in package.json`);
    }
  }

  const nxInvocations = extractNxInvocations(astroText);
  const pairs = new Set();
  for (const { target, project } of nxInvocations) {
    for (const p of expandProjectToken(project)) pairs.add(`${target}::${p}`);
  }
  ok(`extracted ${pairs.size} distinct (target, project) pair(s) from 'nx ...' invocations`);

  const projectCache = new Map();
  function getProjectTargets(name) {
    if (projectCache.has(name)) return projectCache.get(name);
    const res = spawnSync('npx', ['nx', 'show', 'project', name, '--json'], { cwd: ROOT, encoding: 'utf8' });
    let targets = null;
    if (res.status === 0) {
      try {
        const json = JSON.parse(res.stdout);
        targets = new Set(Object.keys(json.targets || {}));
      } catch {
        targets = null;
      }
    }
    projectCache.set(name, targets);
    return targets;
  }

  for (const pair of pairs) {
    const [target, project] = pair.split('::');
    const targets = getProjectTargets(project);
    if (targets === null) {
      failures.push(
        `nx project '${project}' (named in the curriculum via 'nx ${target} ${project}') does not exist in this workspace`
      );
      continue;
    }
    if (!targets.has(target)) {
      failures.push(
        `nx target '${target}' (named in the curriculum via 'nx ${target} ${project}') is not defined on project '${project}'`
      );
    }
  }
  return failures;
}

// =============================================================================
// Part 4 — the Figma references the curriculum cites
// =============================================================================

function extractNodeIds(astroText) {
  const out = [];
  for (const m of astroText.matchAll(/\bNode\s+(\d+-\d+)\b/g)) {
    if (isNegated(astroText, m.index)) continue;
    out.push(m[1]);
  }
  return [...new Set(out)];
}

function extractFrameNames(astroText) {
  const out = [];
  for (const m of astroText.matchAll(/[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*)? \/ (?:Starter|Scaffold)/g)) {
    if (isNegated(astroText, m.index)) continue;
    out.push(m[0]);
  }
  return [...new Set(out)];
}

async function checkFigmaRefs() {
  section('Part 4 — Figma references cited by the curriculum');
  const failures = [];
  const astroText = readAstro();
  const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  const refNodes = snapshot.referencedNodes || [];
  const idsInSnapshot = new Set(refNodes.map((n) => n.id));
  const namesInSnapshot = new Set(refNodes.map((n) => n.name));

  const nodeIds = extractNodeIds(astroText);
  ok(`extracted node id(s): ${nodeIds.join(', ')}`);
  for (const raw of nodeIds) {
    const normalized = raw.replace('-', ':'); // schulung.astro prose uses "936-2954"; the snapshot uses "936:2954"
    if (!idsInSnapshot.has(normalized)) {
      failures.push(
        `curriculum cites Figma node ${raw} (${normalized}), not present in tools/figma/snapshot.json's referencedNodes`
      );
    }
  }

  const frameNames = extractFrameNames(astroText);
  ok(`extracted frame name(s): ${frameNames.join(', ')}`);
  for (const name of frameNames) {
    if (!namesInSnapshot.has(name)) {
      failures.push(`curriculum cites starter frame '${name}', not present in tools/figma/snapshot.json's referencedNodes`);
    }
  }
  return failures;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  section('schulung.astro claims e2e');

  const allFailures = [];
  const parts = [
    ['Part 1: gate-count claim', checkGateExpectations],
    ['Part 2: local MCP surface', checkMcpSurface],
    ['Part 3: command existence', checkCommandsExist],
    ['Part 4: Figma references', checkFigmaRefs],
  ];

  for (const [label, fn] of parts) {
    try {
      const failures = await fn();
      if (failures.length > 0) {
        console.error(`\n✗ ${label}: ${failures.length} issue(s)`);
        for (const f of failures) console.error(`  - ${f}`);
        allFailures.push(...failures.map((f) => `[${label}] ${f}`));
      } else {
        ok(`${label}: all claims verified`);
      }
    } catch (err) {
      console.error(`\n✗ ${label} crashed: ${err.stack || err.message}`);
      allFailures.push(`[${label}] CRASHED: ${err.message}`);
    }
  }

  section('Summary');
  if (allFailures.length > 0) {
    console.error(`${allFailures.length} claim(s) broken:`);
    for (const f of allFailures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('All schulung.astro claims verified.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
