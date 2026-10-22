#!/usr/bin/env node
// Tarball smoke test over stdio. Packs @atelier-ui/mcp with `npm pack` (which runs prepack and so
// rebuilds the snapshot), unpacks the tarball into a fresh directory OUTSIDE the repo the way an
// install would, and speaks raw JSON-RPC to the `atelier-mcp` child process. It catches what unit
// tests against the source tree cannot: a missing `bin`, a `files` field that drops the snapshot,
// a dependency used but not declared, stdout pollution.
//
// Offline on purpose (check:all has no network gates): instead of `npm install`, the tarball is
// unpacked into <tmp>/node_modules/@atelier-ui/mcp and ONLY its declared dependency closure is
// symlinked beside it from the repo's node_modules. An import of something the package.json does
// not declare therefore fails here exactly as it would for a consumer.
//
// Usage: node libs/mcp/scripts/smoke-test.mjs [path-to-tarball]
//
// Checks:
//   - initialize succeeds; instructions carry the hard rules
//   - tools/list is docs-list, docs-show, docs-show-story and (layer tokens) tokens-search
//   - docs-list names AtlButton; docs-show(AtlButton) shows every input and output the packed
//     docgen documents, with `variant` and all its values, and no undocumented internals
//   - no @internal members: AtlTabGroup's helper members are neither in its docgen nor in docs-show
//   - docs-show answers for EVERY component and doc id in the packed snapshot
//   - a different installed @atelier-ui/angular version warns in instructions and on stderr
//   - layers on the packed tarball: with all on, docs-show(AtlBadge) carries "When not to use",
//     docs-show(AtlDialog) carries the composition anti-patterns (type-to-confirm) and
//     tokens-search finds --ui-focus-ring; with `api` alone all three are absent; `api,purpose`,
//     `api,tokens` and `api,composition` each deliver only their own layer
//   - ATELIER_MCP_LAYERS: an unknown layer id fails loudly
//   - every stdout line is JSON-RPC 2.0
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = join(PKG_ROOT, '..', '..');
const BUTTON_ID = 'components-inputs-atlbutton';
const TABS_ID = 'components-navigation-atltabgroup';
const BADGE_ID = 'components-display-atlbadge';
const DIALOG_ID = 'components-overlay-atldialog';
const GUIDANCE_MARKER = 'When not to use';
const COMPOSITION_MARKER = 'Composition patterns';
const TOKENS_TOOL = 'tokens-search';
const failures = [];

function check(ok, message) {
  if (!ok) failures.push(message);
}

function pack(destination) {
  const res = spawnSync(
    'npm',
    ['pack', '--json', '--pack-destination', destination],
    {
      cwd: PKG_ROOT,
      encoding: 'utf8',
    },
  );
  if (res.status !== 0)
    throw new Error(`npm pack failed (${res.status}):\n${res.stderr}`);
  return join(destination, JSON.parse(res.stdout)[0].filename);
}

function findPackageDir(name, fromDir) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) return candidate;
    if (dirname(dir) === dir) return null;
  }
}

/** Symlinks the dependency closure of `pkgJson` (as the repo resolves it) into `nodeModules`. */
function linkDependencyClosure(pkgJson, nodeModules) {
  const queue = Object.keys(pkgJson.dependencies ?? {}).map((name) => ({
    name,
    from: REPO_ROOT,
  }));
  const seen = new Set();
  while (queue.length > 0) {
    const { name, from } = queue.shift();
    if (seen.has(name)) continue;
    seen.add(name);
    const dir = findPackageDir(name, from);
    if (!dir)
      throw new Error(
        `Cannot resolve dependency "${name}" from ${from} (run npm ci).`,
      );
    const target = join(nodeModules, name);
    mkdirSync(dirname(target), { recursive: true });
    symlinkSync(dir, target, 'dir');
    const meta = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    const optionalPeers = meta.peerDependenciesMeta ?? {};
    const next = [
      ...Object.keys(meta.dependencies ?? {}),
      ...Object.keys(meta.peerDependencies ?? {}).filter(
        (peer) => !optionalPeers[peer]?.optional,
      ),
    ];
    for (const dep of next) queue.push({ name: dep, from: dir });
  }
}

function install(tarball, consumerDir) {
  const nodeModules = join(consumerDir, 'node_modules');
  const extract = join(consumerDir, '.extract');
  mkdirSync(extract, { recursive: true });
  const tar = spawnSync('tar', ['-xzf', tarball, '-C', extract], {
    encoding: 'utf8',
  });
  if (tar.status !== 0) throw new Error(`tar failed: ${tar.stderr}`);
  const target = join(nodeModules, '@atelier-ui', 'mcp');
  mkdirSync(dirname(target), { recursive: true });
  renameSync(join(extract, 'package'), target);
  linkDependencyClosure(
    JSON.parse(readFileSync(join(target, 'package.json'), 'utf8')),
    nodeModules,
  );
  return target;
}

/** Minimal JSON-RPC client over the child's stdio. */
function startServer(packageDir, { cwd, env = {} }) {
  const bin = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
    .bin['atelier-mcp'];
  const child = spawn(process.execPath, [join(packageDir, bin)], {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const stdoutLines = [];
  let stderr = '';
  let buffer = '';
  const waiting = new Map();
  child.stderr.on('data', (chunk) => (stderr += chunk));
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    for (let i = buffer.indexOf('\n'); i >= 0; i = buffer.indexOf('\n')) {
      const line = buffer.slice(0, i);
      buffer = buffer.slice(i + 1);
      if (!line.trim()) continue;
      stdoutLines.push(line);
      try {
        const message = JSON.parse(line);
        waiting.get(message.id)?.(message);
      } catch {
        // Recorded in stdoutLines; the JSON-RPC check reports it.
      }
    }
  });
  const exited = new Promise((resolve) =>
    child.on('exit', (code) => resolve(code)),
  );
  let nextId = 0;
  const request = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(
        () => reject(new Error(`timeout waiting for ${method}`)),
        30_000,
      );
      waiting.set(id, (message) => {
        clearTimeout(timer);
        resolve(message);
      });
      child.stdin.write(
        JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n',
      );
    });
  const notify = (method) =>
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method }) + '\n');
  return {
    request,
    notify,
    stdoutLines,
    stderr: () => stderr,
    exited,
    stop: () => child.kill(),
  };
}

async function handshake(client) {
  const init = await client.request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'atelier-mcp-smoke', version: '0.0.0' },
  });
  client.notify('notifications/initialized');
  client.instructions = init.result?.instructions ?? '';
  return init;
}

/** What a running server delivers from L1 and L2: the facts the layer tests below compare. */
async function layerProbe(client) {
  const badge = await callTool(client, 'docs-show', { id: BADGE_ID });
  const tools =
    (await client.request('tools/list')).result?.tools?.map((t) => t.name) ??
    [];
  const dialog = await callTool(client, 'docs-show', { id: DIALOG_ID });
  let tokenFound = false;
  if (tools.includes(TOKENS_TOOL)) {
    const found = await callTool(client, TOKENS_TOOL, { query: 'focus ring' });
    tokenFound = !found.isError && found.text.includes('--ui-focus-ring');
  }
  return {
    guidance:
      badge.text.includes(GUIDANCE_MARKER) && badge.text.includes('removable'),
    badgeKeepsPurpose:
      badge.text.includes('Compact inline label') &&
      /variant\??:/.test(badge.text),
    composition:
      dialog.text.includes(COMPOSITION_MARKER) &&
      dialog.text.includes('type the project name'),
    dialogKeepsApi: /open\??:/.test(dialog.text),
    tokensTool: tools.includes(TOKENS_TOOL),
    tokenFound,
    instructions: client.instructions ?? '',
  };
}

const callTool = async (client, name, args) => {
  const res = await client.request('tools/call', { name, arguments: args });
  const text = (res.result?.content ?? [])
    .map((part) => part.text ?? '')
    .join('\n');
  return {
    res,
    text,
    isError: Boolean(res.error || res.result?.isError) || text.trim() === '',
  };
};

function readDocgen(snapshotDir, id) {
  const file = join(snapshotDir, 'services', 'core', 'docgen', `${id}.json`);
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  return Object.values(parsed.components)[0].argTypes;
}

async function main() {
  const work = mkdtempSync(join(tmpdir(), 'atelier-mcp-smoke-'));
  try {
    const tarball = process.argv[2] ?? pack(work);
    const consumer = join(work, 'consumer');
    mkdirSync(consumer);
    const packageDir = install(tarball, consumer);
    const snapshotDir = join(packageDir, 'snapshot');
    check(
      existsSync(join(snapshotDir, 'manifests', 'components.json')),
      'tarball has no snapshot/manifests/components.json',
    );

    // Run 1: the default configuration, from a directory without @atelier-ui/angular.
    const client = startServer(packageDir, { cwd: consumer });
    const init = await handshake(client);
    check(
      init.result?.serverInfo?.name === '@atelier-ui/mcp',
      `initialize: unexpected serverInfo ${JSON.stringify(init.result?.serverInfo)}`,
    );
    const instructions = init.result?.instructions ?? '';
    check(
      instructions.includes('--ui-*') &&
        instructions.includes('styles/tokens.css'),
      'instructions lack the token and global style rules',
    );
    check(
      instructions.includes('docs-show'),
      'instructions lack the library docs workflow',
    );

    const tools = (await client.request('tools/list')).result?.tools
      ?.map((tool) => tool.name)
      .sort();
    check(
      JSON.stringify(tools) ===
        JSON.stringify([
          'docs-list',
          'docs-show',
          'docs-show-story',
          TOKENS_TOOL,
        ]),
      `tools/list: got ${JSON.stringify(tools)}`,
    );
    check(
      instructions.includes(TOKENS_TOOL) &&
        instructions.includes('atelier/no-raw-color-literal') &&
        instructions.includes(GUIDANCE_MARKER),
      'instructions lack the layer sections (tokens tool, stylelint rules, component guidance)',
    );
    const layered = await layerProbe(client);
    check(
      layered.composition && layered.dialogKeepsApi,
      'all layers on: docs-show(AtlDialog) lacks the composition block or lost its API',
    );
    check(
      instructions.includes(COMPOSITION_MARKER),
      'instructions lack the composition section',
    );
    check(
      layered.guidance,
      'all layers on: docs-show(AtlBadge) lacks the guidance block',
    );
    check(
      layered.guidance && layered.badgeKeepsPurpose,
      'all layers on: docs-show(AtlBadge) lost its purpose or API sections',
    );
    check(
      layered.tokenFound,
      'all layers on: tokens-search "focus ring" lacks --ui-focus-ring',
    );

    const list = await callTool(client, 'docs-list', {});
    check(
      !list.isError && list.text.includes(`AtlButton (${BUTTON_ID})`),
      'docs-list does not name AtlButton',
    );

    const button = await callTool(client, 'docs-show', { id: BUTTON_ID });
    check(!button.isError, 'docs-show(AtlButton) returned an error');
    const buttonArgs = readDocgen(snapshotDir, BUTTON_ID);
    for (const [name, arg] of Object.entries(buttonArgs)) {
      const category = arg.table?.category;
      if (category === 'inputs' || category === 'outputs') {
        check(
          new RegExp(`\\b${name}\\??:`).test(button.text),
          `docs-show(AtlButton) lacks documented ${category.slice(0, -1)} "${name}"`,
        );
      } else {
        check(
          !new RegExp(`\\b${name}\\b`).test(button.text),
          `docs-show(AtlButton) shows undocumented member "${name}"`,
        );
      }
    }
    const variantValues = buttonArgs.variant?.type?.value ?? [];
    check(variantValues.length > 0, 'AtlButton docgen has no variant values');
    for (const value of variantValues) {
      check(
        button.text.includes(`"${value}"`),
        `docs-show(AtlButton) lacks variant value "${value}"`,
      );
    }

    const tabs = await callTool(client, 'docs-show', { id: TABS_ID });
    const tabsArgs = readDocgen(snapshotDir, TABS_ID);
    for (const internal of [
      'tabs',
      'tabBtns',
      'hostClasses',
      'registerTab',
      'unregisterTab',
    ]) {
      check(
        !(internal in tabsArgs),
        `AtlTabGroup docgen contains @internal member "${internal}"`,
      );
      check(
        !new RegExp(`\\b${internal}\\??\\s*[:(]`).test(tabs.text),
        `docs-show(AtlTabGroup) shows @internal member "${internal}"`,
      );
    }

    // Every id in the packed snapshot must answer. Covers the `$ref` resolution path for each
    // component and doc shard, not only the one component above.
    const components = JSON.parse(
      readFileSync(join(snapshotDir, 'manifests', 'components.json'), 'utf8'),
    ).components;
    const docs = JSON.parse(
      readFileSync(join(snapshotDir, 'manifests', 'docs.json'), 'utf8'),
    ).docs;
    const ids = [...Object.keys(components), ...Object.keys(docs)];
    check(ids.length > 0, 'snapshot manifests list no ids');
    for (const id of ids) {
      const shown = await callTool(client, 'docs-show', { id });
      check(
        !shown.isError,
        `docs-show("${id}") returned an error or empty text`,
      );
    }

    check(client.stdoutLines.length > 0, 'no stdout lines at all');
    for (const line of client.stdoutLines) {
      try {
        check(
          JSON.parse(line).jsonrpc === '2.0',
          `stdout line is not JSON-RPC 2.0: ${line.slice(0, 120)}`,
        );
      } catch {
        check(false, `stdout line is not JSON: ${line.slice(0, 120)}`);
      }
    }
    client.stop();

    // Run 2: another @atelier-ui/angular installed in the consumer warns.
    const mismatch = join(work, 'mismatch');
    mkdirSync(join(mismatch, 'node_modules', '@atelier-ui', 'angular'), {
      recursive: true,
    });
    writeFileSync(
      join(mismatch, 'node_modules', '@atelier-ui', 'angular', 'package.json'),
      JSON.stringify({
        name: '@atelier-ui/angular',
        version: '0.0.1-installed',
      }),
    );
    const warned = startServer(packageDir, { cwd: mismatch });
    const warnedInit = await handshake(warned);
    check(
      (warnedInit.result?.instructions ?? '').includes('0.0.1-installed'),
      'version mismatch is not in the instructions',
    );
    check(
      warned.stderr().includes('0.0.1-installed'),
      'version mismatch is not on stderr',
    );
    check(
      warned.stdoutLines.length > 0,
      'mismatch run: server did not answer (it must not abort)',
    );
    warned.stop();

    // Run 3: the layer seam. An unknown id must fail at start; `api` alone must start.
    const bad = startServer(packageDir, {
      cwd: consumer,
      env: { ATELIER_MCP_LAYERS: 'nope' },
    });
    const badCode = await bad.exited;
    check(
      badCode !== 0 && bad.stderr().includes('unknown layer'),
      'an unknown ATELIER_MCP_LAYERS id did not fail loudly',
    );

    // Run 4: each layer switches on its own and changes nothing of the others.
    for (const [layers, wantGuidance, wantTokens, wantComposition] of [
      ['api', false, false, false],
      ['api,purpose', true, false, false],
      ['api,tokens', false, true, false],
      ['api,composition', false, false, true],
      ['api,purpose,tokens,composition', true, true, true],
    ]) {
      const run = startServer(packageDir, {
        cwd: consumer,
        env: { ATELIER_MCP_LAYERS: layers },
      });
      const runInit = await handshake(run);
      check(
        Boolean(runInit.result?.serverInfo),
        `ATELIER_MCP_LAYERS=${layers} did not start`,
      );
      const probe = await layerProbe(run);
      check(
        probe.guidance === wantGuidance,
        `ATELIER_MCP_LAYERS=${layers}: component guidance ${probe.guidance ? 'present' : 'absent'}, expected ${wantGuidance ? 'present' : 'absent'}`,
      );
      check(
        probe.tokensTool === wantTokens && probe.tokenFound === wantTokens,
        `ATELIER_MCP_LAYERS=${layers}: ${TOKENS_TOOL} ${probe.tokensTool ? 'present' : 'absent'}, expected ${wantTokens ? 'present' : 'absent'}`,
      );
      check(
        probe.composition === wantComposition,
        `ATELIER_MCP_LAYERS=${layers}: composition block ${probe.composition ? 'present' : 'absent'}, expected ${wantComposition ? 'present' : 'absent'}`,
      );
      check(
        probe.dialogKeepsApi,
        `ATELIER_MCP_LAYERS=${layers}: docs-show(AtlDialog) lost its API sections`,
      );
      check(
        probe.instructions.includes(TOKENS_TOOL) === wantTokens &&
          probe.instructions.includes(GUIDANCE_MARKER) === wantGuidance &&
          probe.instructions.includes(COMPOSITION_MARKER) === wantComposition,
        `ATELIER_MCP_LAYERS=${layers}: instructions do not match the layer set`,
      );
      check(
        probe.badgeKeepsPurpose,
        `ATELIER_MCP_LAYERS=${layers}: docs-show(AtlBadge) lost its API sections`,
      );
      run.stop();
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

try {
  await main();
} catch (err) {
  failures.push(`smoke test crashed: ${err.stack ?? err}`);
}

if (failures.length > 0) {
  console.error(
    `mcp package smoke test FAILED (${failures.length}):\n- ${failures.join('\n- ')}`,
  );
  process.exit(1);
}
console.log('mcp package smoke test passed');
