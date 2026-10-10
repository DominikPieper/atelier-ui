#!/usr/bin/env node
/**
 * schulung-claims.e2e.mjs
 *
 * The training curriculum (docs/src/pages/schulung.astro, English since the
 * agenda rewrite) makes checkable claims about this repo — a set of MCP
 * tools, a list of commands, a set of Figma references — and nothing else
 * checks them. Three of the four blockers in
 * tasks/schulung-review-2026-09-05.md were claims that had quietly gone
 * false: a command nobody could run, a gate that verified nothing, a prop
 * that didn't exist. This is the test that finds the next one.
 *
 * It asserts three things, each read live from docs/src/pages/schulung.astro
 * rather than hard-coded, so a reworded claim is re-verified against the new
 * wording (or the script fails loudly pointing at the anchor that moved):
 *
 *   1. The local Storybook MCP surface Day 2 depends on: starts a real local
 *      Storybook per framework, speaks MCP to it over HTTP (streamable-HTTP:
 *      initialize -> notifications/initialized -> tools/list), and asserts
 *      the tools the curriculum names by name are present. Shuts every
 *      server down in a `finally`.
 *   2. Every `npm run <script>` and `nx <target> <project>` invocation named
 *      on the page resolves. The page mixes two worlds: this repo and the
 *      PARTICIPANT's generated workspace (create-workspace scaffold). A
 *      script or project that does not exist here is accepted only if the
 *      scaffold generator (libs/create-workspace/.../preset.ts) writes it
 *      (`pkg.scripts.<name>` / `pkg.scripts['<name>']`; `workshop-<fw>` apps
 *      are checked against the generator the same way), so a typo still
 *      fails.
 *   3. Every Figma node/frame the page cites (the kata node, the starter
 *      frames) is present in the committed tools/figma/snapshot.json. Read
 *      offline — no Figma call.
 *
 * REMOVED: the old "Part 1" gate-count claim (three expectedly red gates for
 * a workshop-case addition). The agenda no longer makes it — the page now
 * states the opposite (in the participant's own workspace red means red) —
 * so there is nothing left to verify, and the throwaway-component fixture
 * that reproduced it was deleted with it.
 *
 * Extraction quirk worth knowing: the page names a command it says NOT to use
 * ("the MCP call, not `npm run check:parity`"). A match is dropped if the
 * word "not" appears within 30 characters before it (long enough to span a
 * `<code>` tag and indentation). If this script ever reports a
 * suspiciously-shaped script/project name, check whether that distance
 * assumption still holds against the current wording.
 *
 * OUT OF SCOPE, on purpose: Figma actions, Claude Design, anything needing
 * the Desktop Bridge, agent/prompt behaviour, and the hosted (production) MCP
 * endpoints — those need a human or a network call and belong in a real dry
 * run, not here.
 *
 * Deliberately NOT in `npm run check:all` — it starts three Storybook dev
 * servers, taking minutes rather than seconds. It gets its own CI job, the
 * way `create-atelier-ui-workspace:e2e` does.
 *
 * Run via:  node tools/e2e/schulung-claims.e2e.mjs
 *           (or  npx nx run @atelier-ui/source:schulung-claims-e2e)
 */
import { readFileSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCHULUNG_REL = 'docs/src/pages/schulung.astro';
const SCHULUNG_PATH = join(ROOT, SCHULUNG_REL);
const SNAPSHOT_PATH = join(ROOT, 'tools/figma/snapshot.json');
const PKG_PATH = join(ROOT, 'package.json');
const SCAFFOLD_PRESET_PATH = join(
  ROOT,
  'libs/create-workspace/src/generators/preset/preset.ts',
);

const FRAMEWORKS = ['angular', 'react', 'vue'];
// Defaults match the repo's Storybook ports; E2E_PORT_BASE shifts all three
// when something else already holds one of them.
const PORT_BASE = Number(process.env.E2E_PORT_BASE || 4400);
const STORYBOOK_PORTS = {
  angular: PORT_BASE,
  react: PORT_BASE + 1,
  vue: PORT_BASE + 2,
};

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
/** See the header comment: a 30-char lookback for a preceding "not". */
function isNegated(text, matchIndex) {
  const windowStart = Math.max(0, matchIndex - 30);
  return /\bnot\b/i.test(text.slice(windowStart, matchIndex));
}

// =============================================================================
// Part 1 — the local MCP surface Day 2 depends on
// =============================================================================

const MCP_TOOLS_ANCHOR = 'dev/test tools (';

/** Parse the required local MCP tool list straight out of the page. */
function extractExpectedMcpTools(astroText) {
  const idx = astroText.indexOf(MCP_TOOLS_ANCHOR);
  if (idx === -1) {
    throw new Error(
      `could not find "${MCP_TOOLS_ANCHOR}..." in ${SCHULUNG_REL} — wording changed; update this ` +
        `script's anchor.`,
    );
  }
  const closeIdx = astroText.indexOf(')', idx);
  if (closeIdx === -1)
    throw new Error('found the tool-list anchor but no closing paren after it');
  const inner = astroText.slice(idx + MCP_TOOLS_ANCHOR.length, closeIdx);
  const tools = [...inner.matchAll(/`([a-z][a-z0-9-]*)`/g)].map((m) => m[1]);
  if (tools.length === 0)
    throw new Error(
      'parsed the tool-list anchor but found zero tool names inside it',
    );
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
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (sessionId) headers['mcp-session-id'] = sessionId;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
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
    const res = await fetch(`http://localhost:${port}`, {
      signal: AbortSignal.timeout(1000),
    });
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
      warn(
        `${fw}: something is already listening on ${port} — reusing it read-only (not starting/stopping it)`,
      );
    } else {
      proc = spawn(
        'npx',
        [
          'storybook',
          'dev',
          '--config-dir',
          `libs/${fw}/.storybook`,
          '--port',
          String(port),
          '--ci',
        ],
        { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
      );
      weStartedIt = true;
      let out = '';
      proc.stdout.on('data', (d) => (out += d));
      proc.stderr.on('data', (d) => (out += d));
      const up = await waitForHttp(`http://localhost:${port}`, 90_000);
      if (!up) {
        failures.push(
          `${fw}: local Storybook dev server on ${port} did not come up within 90s\n${out.slice(-2000)}`,
        );
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
    await mcpCall(
      url,
      { jsonrpc: '2.0', method: 'notifications/initialized', params: {} },
      sessionId,
    );
    const list = await mcpCall(
      url,
      { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
      sessionId,
    );
    const toolsMsg = list.messages.find((m) => m.result && m.result.tools);
    const names = toolsMsg ? toolsMsg.result.tools.map((t) => t.name) : [];
    ok(`${fw}: tools/list → ${names.length} tools`);

    for (const expected of expectedTools) {
      if (!names.includes(expected)) {
        failures.push(
          `${fw}: curriculum requires '${expected}' from the local MCP surface, but tools/list did not ` +
            `return it. Present: ${JSON.stringify(names)}`,
        );
      }
    }
  } finally {
    if (weStartedIt) await killProcess(proc);
  }
  return failures;
}

async function checkMcpSurface() {
  section('Part 1 — local MCP surface Day 2 depends on');
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
// Part 2 — every command the curriculum names exists
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
  for (const m of decoded.matchAll(
    /\bnx ([a-zA-Z][\w-]*) (<[a-z]+>|[a-zA-Z][\w-]*)/g,
  )) {
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
  section('Part 2 — every named command exists');
  const failures = [];
  const astroText = readAstro();
  const pkg = readPkg();

  const scripts = extractNpmScripts(astroText);
  ok(
    `extracted ${scripts.length} distinct 'npm run' invocation(s): ${scripts.join(', ')}`,
  );
  const preset = readFileSync(SCAFFOLD_PRESET_PATH, 'utf8');
  const scaffoldWrites = (name) =>
    preset.includes(`pkg.scripts['${name}']`) ||
    preset.includes(`pkg.scripts.${name} `) ||
    preset.includes(`pkg.scripts.${name}=`);
  for (const s of scripts) {
    if (s in (pkg.scripts || {})) continue;
    if (scaffoldWrites(s)) {
      ok(
        `'${s}' is a participant-workspace script (written by the scaffold), not a repo script`,
      );
      continue;
    }
    failures.push(
      `npm script '${s}' named in the curriculum exists neither in package.json nor in what the scaffold generator writes`,
    );
  }

  const nxInvocations = extractNxInvocations(astroText);
  const pairs = new Set();
  for (const { target, project } of nxInvocations) {
    for (const p of expandProjectToken(project)) pairs.add(`${target}::${p}`);
  }
  ok(
    `extracted ${pairs.size} distinct (target, project) pair(s) from 'nx ...' invocations`,
  );

  const projectCache = new Map();
  function getProjectTargets(name) {
    if (projectCache.has(name)) return projectCache.get(name);
    const res = spawnSync('npx', ['nx', 'show', 'project', name, '--json'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
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
    if (/^workshop-/.test(project)) {
      // The participant's own app, created by the scaffold — not a project here.
      if (!preset.includes('workshop-')) {
        failures.push(
          `curriculum names scaffold app '${project}' but the scaffold generator no longer mentions 'workshop-'`,
        );
      }
      continue;
    }
    const targets = getProjectTargets(project);
    if (targets === null) {
      failures.push(
        `nx project '${project}' (named in the curriculum via 'nx ${target} ${project}') does not exist in this workspace`,
      );
      continue;
    }
    if (!targets.has(target)) {
      failures.push(
        `nx target '${target}' (named in the curriculum via 'nx ${target} ${project}') is not defined on project '${project}'`,
      );
    }
  }
  return failures;
}

// =============================================================================
// Part 3 — the Figma references the curriculum cites
// =============================================================================

function extractNodeIds(astroText) {
  const out = [];
  for (const m of astroText.matchAll(/\bnode\s+(\d+-\d+)\b/gi)) {
    if (isNegated(astroText, m.index)) continue;
    out.push(m[1]);
  }
  // The kata target lives in the page's TARGET constant (`node: '936-2954'`),
  // which the prose interpolates as `node ${TARGET.node}`.
  for (const m of astroText.matchAll(/\bnode:\s*'(\d+-\d+)'/g)) out.push(m[1]);
  return [...new Set(out)];
}

function extractFrameNames(astroText) {
  const out = [];
  for (const m of astroText.matchAll(
    /[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*)? \/ (?:Starter|Scaffold)/g,
  )) {
    if (isNegated(astroText, m.index)) continue;
    out.push(m[0]);
  }
  return [...new Set(out)];
}

async function checkFigmaRefs() {
  section('Part 3 — Figma references cited by the curriculum');
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
        `curriculum cites Figma node ${raw} (${normalized}), not present in tools/figma/snapshot.json's referencedNodes`,
      );
    }
  }

  const frameNames = extractFrameNames(astroText);
  ok(`extracted frame name(s): ${frameNames.join(', ')}`);
  for (const name of frameNames) {
    if (!namesInSnapshot.has(name)) {
      failures.push(
        `curriculum cites starter frame '${name}', not present in tools/figma/snapshot.json's referencedNodes`,
      );
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
    ['Part 1: local MCP surface', checkMcpSurface],
    ['Part 2: command existence', checkCommandsExist],
    ['Part 3: Figma references', checkFigmaRefs],
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
