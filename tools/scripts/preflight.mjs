#!/usr/bin/env node
/**
 * preflight.mjs
 *
 * Pre-workshop self-check. Verifies the local environment is ready for the
 * Atelier UI workshop (Figma + Claude Code + Storybook MCP).
 *
 * Run via:  node tools/scripts/preflight.mjs
 *           (or  npm run preflight)
 *
 * Exits non-zero if any hard check fails. Warnings do not block.
 */

import { execSync, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '../..');

// ── Styling ──────────────────────────────────────────────────────────
const supportsColor = process.stdout.isTTY && process.env.NO_COLOR === undefined;
const c = (code, s) => (supportsColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = (s) => c('31', s);
const green = (s) => c('32', s);
const yellow = (s) => c('33', s);
const dim = (s) => c('2', s);
const bold = (s) => c('1', s);

const OK = green('✓');
const FAIL = red('✗');
const WARN = yellow('⚠');

// ── Result accumulator ───────────────────────────────────────────────
const results = [];
function record(level, label, detail, fix) {
  results.push({ level, label, detail, fix });
  const icon = level === 'ok' ? OK : level === 'fail' ? FAIL : WARN;
  const labelStr = level === 'fail' ? bold(label) : label;
  console.log(`  ${icon} ${labelStr}${detail ? dim(` — ${detail}`) : ''}`);
  if (fix && level !== 'ok') {
    console.log(`      ${dim('→')} ${fix}`);
  }
}
const ok = (label, detail) => record('ok', label, detail);
const fail = (label, detail, fix) => record('fail', label, detail, fix);
const warn = (label, detail, fix) => record('warn', label, detail, fix);

// ── Helpers ──────────────────────────────────────────────────────────
function which(cmd) {
  const finder = process.platform === 'win32' ? 'where' : 'which';
  const res = spawnSync(finder, [cmd], { encoding: 'utf8' });
  if (res.status === 0 && res.stdout.trim()) return res.stdout.trim().split('\n')[0];
  return null;
}

function parseMajorMinor(version) {
  const match = /(\d+)\.(\d+)\.?(\d+)?/.exec(version);
  if (!match) return null;
  return { major: +match[1], minor: +match[2], patch: +(match[3] ?? 0) };
}

function isAtLeast(actual, required) {
  if (!actual) return false;
  if (actual.major !== required.major) return actual.major > required.major;
  if (actual.minor !== required.minor) return actual.minor > required.minor;
  return actual.patch >= required.patch;
}

// ── MCP probing ──────────────────────────────────────────────────────
// A plain GET only proves a URL answers, not that the MCP behind it works:
// the hosted Storybook MCP once answered every reachability check with a
// harmless status while every actual tool call failed (broken manifest fetch
// inside the worker, surfaced as HTTP 200 + isError). So the probe speaks
// real JSON-RPC: initialize → tools/list, and — on Atelier Storybook
// endpoints — one real tool call.

async function mcpPost(url, body, sessionId, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    };
    if (sessionId) headers['mcp-session-id'] = sessionId;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return {
      status: res.status,
      contentType: res.headers.get('content-type') ?? '',
      text: await res.text(),
      sessionId: res.headers.get('mcp-session-id') ?? undefined,
    };
  } catch (err) {
    return { error: err?.name === 'AbortError' ? 'timeout' : String(err?.message ?? err) };
  } finally {
    clearTimeout(timer);
  }
}

/** Extract the JSON-RPC message with the given id from a JSON or SSE body. */
function parseJsonRpc(contentType, text, id) {
  const candidates = contentType.includes('text/event-stream')
    ? text
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
    : [text];
  for (const candidate of candidates) {
    try {
      const msg = JSON.parse(candidate);
      if (msg?.id === id) return msg;
    } catch {
      // keep scanning — an SSE stream may carry unrelated events
    }
  }
  return null;
}

async function probeMcp(url) {
  // 1. initialize — stateful servers hand out a session id here.
  const init = await mcpPost(url, {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'atelier-preflight', version: '1.0.0' },
    },
  });
  if (init.error) return { level: 'unreachable', detail: init.error };
  const session = init.sessionId;
  if (session) {
    await mcpPost(url, { jsonrpc: '2.0', method: 'notifications/initialized' }, session, 5000);
  }

  // 2. tools/list — must be HTTP 200 with a parseable JSON-RPC tools array.
  const list = await mcpPost(url, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }, session);
  if (list.error) return { level: 'broken', detail: `tools/list failed (${list.error})` };
  if (list.status !== 200) return { level: 'broken', detail: `tools/list → HTTP ${list.status}` };
  const listMsg = parseJsonRpc(list.contentType, list.text, 2);
  const tools = listMsg?.result?.tools;
  if (!Array.isArray(tools)) return { level: 'broken', detail: 'tools/list → no parseable result' };

  // 3. On an Atelier Storybook MCP, exercise one real tool call: manifests
  //    are only fetched inside tool calls, and a broken manifest fetch comes
  //    back as HTTP 200 + isError — invisible to anything shallower.
  if (tools.some((t) => t?.name === 'list-all-documentation')) {
    const call = await mcpPost(
      url,
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'list-all-documentation', arguments: {} },
      },
      session,
    );
    if (call.error) return { level: 'broken', detail: `list-all-documentation failed (${call.error})` };
    if (call.status !== 200) return { level: 'broken', detail: `list-all-documentation → HTTP ${call.status}` };
    const callMsg = parseJsonRpc(call.contentType, call.text, 3);
    if (!callMsg?.result || callMsg.result.isError) {
      const reason =
        callMsg?.result?.content?.[0]?.text ?? callMsg?.error?.message ?? 'no parseable result';
      const oneLine = String(reason).replace(/\s+/g, ' ').trim();
      return { level: 'broken', detail: `list-all-documentation → ${oneLine.slice(0, 120)}` };
    }
  }

  return { level: 'ok', status: list.status };
}

function portFree(port) {
  return new Promise((resolveP) => {
    const server = createServer();
    server.once('error', () => resolveP(false));
    server.once('listening', () => {
      server.close(() => resolveP(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

function loadMcpEndpoints() {
  const mcpPath = resolve(ROOT, '.mcp.json');
  if (!existsSync(mcpPath)) return [];
  try {
    const config = JSON.parse(readFileSync(mcpPath, 'utf8'));
    const servers = config.mcpServers ?? {};
    return Object.entries(servers)
      .filter(([, v]) => v?.type === 'http' && typeof v?.url === 'string')
      .map(([name, v]) => ({ name, url: v.url }));
  } catch {
    return [];
  }
}

// ── Checks ───────────────────────────────────────────────────────────
function checkNode() {
  const required = { major: 22, minor: 12, patch: 0 };
  const actual = parseMajorMinor(process.version);
  if (isAtLeast(actual, required)) {
    ok('Node.js', process.version);
  } else {
    fail(
      'Node.js',
      `found ${process.version}, need >= 22.12.0`,
      'Install via https://nodejs.org or use `nvm install 22 && nvm use 22`',
    );
  }
}

function checkNpm() {
  const required = { major: 10, minor: 0, patch: 0 };
  const path = which('npm');
  if (!path) {
    fail('npm', 'not found on PATH', 'npm ships with Node.js — reinstall Node if missing');
    return;
  }
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    const actual = parseMajorMinor(version);
    if (isAtLeast(actual, required)) {
      ok('npm', `v${version}`);
    } else {
      warn('npm', `found v${version}, recommend >= 10.0.0`, 'Run `npm install -g npm@latest`');
    }
  } catch (err) {
    fail('npm', String(err?.message ?? err), 'Reinstall Node.js');
  }
}

function checkGit() {
  const path = which('git');
  if (!path) {
    fail('git', 'not found on PATH', 'Install from https://git-scm.com or `brew install git`');
    return;
  }
  try {
    const version = execSync('git --version', { encoding: 'utf8' }).trim();
    ok('git', version);
  } catch {
    warn('git', 'installed but version check failed', 'Verify install with `git --version`');
  }
}

function checkClaudeCli() {
  const path = which('claude');
  if (!path) {
    fail(
      'Claude Code CLI',
      'not found on PATH',
      'Install: https://docs.claude.com/en/docs/claude-code/setup',
    );
    return;
  }
  try {
    const version = execSync('claude --version', { encoding: 'utf8', timeout: 5000 }).trim();
    ok('Claude Code CLI', version);
  } catch {
    warn('Claude Code CLI', 'installed but `claude --version` failed', 'Try `claude doctor`');
  }
}

async function checkFigmaSetup() {
  // 1. Desktop Bridge plugin manifest — the primary channel.
  const manifestPath = join(homedir(), '.figma-console-mcp', 'plugin', 'manifest.json');
  if (existsSync(manifestPath)) {
    ok('Figma Desktop Bridge plugin', `manifest at ${manifestPath}`);
  } else {
    warn(
      'Figma Desktop Bridge plugin',
      'manifest not found',
      'Run `npx -y figma-console-mcp@latest --help` once, then Figma → Plugins → Development → Import plugin from manifest…',
    );
  }

  // 2. Bridge WebSocket port range — at least one port must be usable.
  const bridgePorts = [9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232];
  let freeCount = 0;
  for (const p of bridgePorts) {
    if (await portFree(p)) freeCount += 1;
  }
  if (freeCount === bridgePorts.length) {
    ok('Bridge port range 9223–9232', 'all free (MCP will bind on first launch)');
  } else if (freeCount > 0) {
    ok('Bridge port range 9223–9232', `${freeCount}/10 free (bridge connection OK)`);
  } else {
    warn(
      'Bridge port range 9223–9232',
      'entire range in use',
      'Close unrelated processes holding these ports, or see /troubleshooting#figma-bridge-port-conflict',
    );
  }

  // 3. REST token — optional, only affects metadata reads.
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) {
    warn(
      'FIGMA_ACCESS_TOKEN (optional)',
      'not set — REST reads disabled, plugin tools still work',
      'See https://atelier.pieper.io/figma-token if you need metadata reads',
    );
    return;
  }
  if (token.length < 20) {
    warn(
      'FIGMA_ACCESS_TOKEN',
      'set but suspiciously short',
      'Regenerate at https://www.figma.com/developers/api#access-tokens',
    );
    return;
  }
  ok('FIGMA_ACCESS_TOKEN', `set (${token.length} chars, REST reads enabled)`);
}

async function checkMcpEndpoints() {
  const endpoints = loadMcpEndpoints();
  if (endpoints.length === 0) {
    warn(
      'MCP endpoints',
      'none configured in .mcp.json',
      'Scaffold a workspace with `npx create-atelier-ui-workspace`',
    );
    return;
  }
  for (const { name, url } of endpoints) {
    const res = await probeMcp(url);
    if (res.level === 'ok') {
      ok(`MCP: ${name}`, `${url} (HTTP ${res.status})`);
    } else if (res.level === 'broken') {
      fail(
        `MCP: ${name}`,
        `${url} ${res.detail}`,
        'Server reachable but MCP calls fail — see https://atelier.pieper.io/troubleshooting#mcp-tools-error',
      );
    } else {
      fail(
        `MCP: ${name}`,
        `${url} unreachable (${res.detail})`,
        'Check your network or proxy settings',
      );
    }
  }
}

async function checkPorts() {
  // 4200 = the dev server (every framework serves on the @nx/vite default),
  // 6006 = local Storybook. Nothing in the scaffold uses 4201/4202 — the old
  // multi-framework rig did, and checking them only confused participants.
  const ports = [4200, 6006];
  for (const p of ports) {
    const free = await portFree(p);
    if (free) ok(`Port ${p}`, 'free');
    else warn(`Port ${p}`, 'in use', `Run \`lsof -ti :${p} | xargs kill\` (macOS/Linux)`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────
function header(title) {
  console.log('');
  console.log(bold(title));
}

async function main() {
  console.log('');
  console.log(bold('Atelier UI Preflight'));
  console.log(dim('Checking your environment for the workshop…'));

  header('Runtime');
  checkNode();
  checkNpm();
  checkGit();

  header('Claude Code');
  checkClaudeCli();

  header('Figma');
  await checkFigmaSetup();

  header('MCP reachability');
  await checkMcpEndpoints();

  header('Local ports');
  await checkPorts();

  // Summary
  const failures = results.filter((r) => r.level === 'fail').length;
  const warnings = results.filter((r) => r.level === 'warn').length;
  const passes = results.filter((r) => r.level === 'ok').length;

  console.log('');
  if (failures === 0) {
    console.log(
      green(`All hard checks passed`) + dim(` · ${passes} ok, ${warnings} warning(s)`),
    );
    if (warnings > 0) {
      console.log(dim('Warnings are non-blocking — see https://atelier.pieper.io/troubleshooting'));
    }
    console.log('');
    process.exit(0);
  } else {
    console.log(
      red(`${failures} check(s) failed`) + dim(` · ${passes} ok, ${warnings} warning(s)`),
    );
    console.log(dim('Fix the items above, then re-run `npm run preflight`.'));
    console.log(dim('Full troubleshooting guide: https://atelier.pieper.io/troubleshooting'));
    console.log('');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(red('Preflight crashed:'), err);
  process.exit(2);
});
