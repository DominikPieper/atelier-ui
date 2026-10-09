#!/usr/bin/env node
/**
 * figma-snapshot-contracts
 *
 * A snapshot generator whose roster is the contracts, not a hand-maintained
 * master list. It reads whichever `<name>.contract.ts` files exist under the
 * contracts directory (the same settings as `check-contracts`) and, for each
 * one's `figmaNodeId`, writes exactly the master-entry fields `check-contracts`
 * consumes: `selector`, `nodeId`, `name`, `description`, `variantAxes`,
 * `properties`, `variants`.
 *
 *   figma-snapshot-contracts --file <figmaFileKey> [--out <path>] [--contracts <dir>]
 *   figma-snapshot-contracts --file <figmaFileKey> --dry-run
 *
 * Settings: `--contracts` / `contracts` (required), `--out` / `snapshot`
 * (required: where to write), `mcpConfig` (optional, default `.mcp.json`: the
 * MCP client config, relative to the working directory, that pins the
 * `figma-console` server version). All from CLI flags or `contracts.config.json`
 * in the working directory — nothing is derived from where this package lives.
 *
 * Requirements: Figma Desktop running with the file open and the figma-console
 * Desktop Bridge plugin connected. Fails loud (exit 2) if the bridge is not
 * connected — never a silent/empty write.
 *
 * --dry-run prints the roster (selector -> nodeId) and the figma_execute
 * plugin code that would run for the first master, then exits 0 WITHOUT
 * connecting to Figma at all — the only mode that can run where there is no
 * Figma Desktop Bridge.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { die, readConfigFile, CONFIG_FILE_NAME } from '../src/config.mjs';

const CWD = process.cwd();

// ts-eval.cjs ships in this package and is loaded by a path relative to THIS
// file, so it works from node_modules and from a vendored copy alike.
const require = createRequire(import.meta.url);
const { parseExportedVars } = require('../src/ts-eval.cjs');

// ─── CLI args ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { file: null, out: null, contracts: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file') out.file = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--contracts') out.contracts = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (!args.file) {
  die(
    'Usage: figma-snapshot-contracts --file <figmaFileKey> [--out <path>] [--contracts <dir>] [--dry-run]',
  );
}

// ─── Settings (CLI flag > contracts.config.json in the working directory;
//     no built-in locations) ────────────────────────────────────────────────
const fileConfig = readConfigFile(CWD);

const contractsSetting = args.contracts ?? fileConfig?.contracts;
if (!contractsSetting) {
  die(
    `No contracts directory set — pass --contracts <dir> or set "contracts" in ${CONFIG_FILE_NAME}.`,
  );
}
const CONTRACTS_DIR = resolve(CWD, contractsSetting);
if (!existsSync(CONTRACTS_DIR)) {
  die(`Contracts directory not found: ${CONTRACTS_DIR}`);
}

const outSetting = args.out ?? fileConfig?.snapshot;
if (!outSetting) {
  die(
    `No output path set — pass --out <file> or set "snapshot" in ${CONFIG_FILE_NAME}.`,
  );
}
const OUT_PATH = resolve(CWD, outSetting);

// The MCP client config that pins the figma-console server version.
const MCP_CONFIG_PATH = resolve(CWD, fileConfig?.mcpConfig ?? '.mcp.json');

// ─── The roster: every contract's { component, figmaNodeId } ──────────────

function loadRoster(contractsDir) {
  const fs = require('node:fs');
  const path = require('node:path');
  const files = fs
    .readdirSync(contractsDir)
    .filter((f) => f.endsWith('.contract.ts'))
    .sort();
  const roster = [];
  for (const file of files) {
    const full = path.join(contractsDir, file);
    const vars = parseExportedVars(full);
    const contract = vars.contract;
    if (
      !contract ||
      typeof contract !== 'object' ||
      !contract.component ||
      !contract.figmaNodeId
    ) {
      console.error(
        `${file}: 'contract' did not evaluate to a static { component, figmaNodeId, ... } object — skipped.`,
      );
      continue;
    }
    roster.push({
      selector: contract.component,
      nodeId: contract.figmaNodeId,
      file,
    });
  }
  return roster;
}

const roster = loadRoster(CONTRACTS_DIR);
if (roster.length === 0) {
  console.error(
    `No contracts found under ${CONTRACTS_DIR} — nothing to snapshot.`,
  );
  process.exit(2);
}

// ─── The figma_execute plugin code, one master per call ────────────────────
// componentPropertyDefinitions
// for `properties`/`variantAxes`, and each variant child's `name` (the
// "axis=value, axis=value" convention) for `variants`. A single node lookup
// per master rather than a whole-file walk.
function pluginCodeFor(nodeId) {
  return `
    await figma.loadAllPagesAsync();
    const node = await figma.getNodeByIdAsync('${nodeId}');
    if (!node) return null;
    const isSet = node.type === 'COMPONENT_SET';
    const properties = {};
    const variantAxes = {};
    for (const [key, def] of Object.entries(node.componentPropertyDefinitions || {})) {
      properties[key] = def.type;
      if (def.type === 'VARIANT' && Array.isArray(def.variantOptions)) {
        variantAxes[key] = def.variantOptions;
      }
    }
    function parseVariantName(name) {
      if (!name || name.indexOf('=') === -1) return null;
      const out = {};
      for (const part of name.split(',')) {
        const kv = part.split('=');
        const k = (kv[0] || '').trim();
        const v = kv[1] === undefined ? undefined : kv[1].trim();
        if (k && v !== undefined) out[k] = v;
      }
      return Object.keys(out).length ? out : null;
    }
    const variants = isSet
      ? (node.children || []).map((c) => parseVariantName(c.name)).filter(Boolean)
      : [];
    return {
      name: node.name,
      description: node.description || '',
      properties,
      variantAxes,
      variants,
    };
  `;
}

// ─── --dry-run: print the roster and the plugin code, never connect ───────

if (args.dryRun) {
  console.log(`Contracts dir: ${CONTRACTS_DIR}`);
  console.log(`Would write:   ${OUT_PATH}`);
  console.log(`\nRoster (selector -> nodeId):`);
  for (const { selector, nodeId, file } of roster) {
    console.log(`  ${selector.padEnd(24)} -> ${nodeId}  (${file})`);
  }
  console.log(
    `\nfigma_execute plugin code (shown for the first master, ${roster[0].selector} / ${roster[0].nodeId} — the same shape runs once per master, with 'nodeId' substituted):`,
  );
  console.log(pluginCodeFor(roster[0].nodeId));
  console.log(`\n(dry run — no connection made, nothing written)`);
  process.exit(0);
}

// ─── Resolve the pinned figma-console-mcp package spec from the MCP config ─
// The server version is pinned there rather than left to `@latest`, so a run
// is reproducible.

function resolveFigmaConsolePackageSpec() {
  let config;
  try {
    config = JSON.parse(readFileSync(MCP_CONFIG_PATH, 'utf8'));
  } catch (err) {
    throw new Error(
      `could not read/parse ${MCP_CONFIG_PATH}: ${err?.message ?? err}`,
    );
  }
  const serverArgs = config?.mcpServers?.['figma-console']?.args;
  const spec = Array.isArray(serverArgs)
    ? serverArgs.find((a) => /^figma-console-mcp@/.test(a))
    : undefined;
  if (!spec) {
    throw new Error(
      `${MCP_CONFIG_PATH} has no mcpServers['figma-console'].args entry matching ` +
        `/^figma-console-mcp@/ — refusing to fall back to @latest (the server version must be pinned).`,
    );
  }
  return spec;
}

function versionFromPackageSpec(spec) {
  const idx = String(spec).lastIndexOf('@');
  return idx > 0 ? String(spec).slice(idx + 1) : null;
}

function isConnected(status) {
  return Boolean(
    status?.connected ||
    status?.plugin?.connected ||
    status?.details?.plugin?.connected ||
    status?.probeResult?.success ||
    status?.setup?.probeResult?.success ||
    status?.setup?.valid ||
    status?.transport?.websocket?.available,
  );
}

async function call(client, name, toolArgs) {
  const res = await client.callTool({ name, arguments: toolArgs });
  const text = res?.content?.find((c) => c.type === 'text')?.text ?? '';
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${name} returned non-JSON output`);
  }
}

main().catch((err) => {
  console.error(`✗ figma:snapshot-contracts failed: ${err?.message ?? err}`);
  process.exit(2);
});

async function main() {
  const client = new Client(
    { name: 'figma-snapshot-contracts', version: '1.0.0' },
    { capabilities: {} },
  );
  const figmaConsolePackageSpec = resolveFigmaConsolePackageSpec();
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', figmaConsolePackageSpec],
    env: { ...process.env },
  });
  await client.connect(transport);
  const reportedServerVersion = client.getServerVersion?.();

  try {
    // Probe the bridge — fail loud if the plugin is not connected. Retry:
    // the plugin attaches ~0.5s after a
    // freshly-spawned server starts.
    let status = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      status = await call(client, 'figma_get_status', { probe: true });
      if (isConnected(status)) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!isConnected(status)) {
      console.error(
        '✗ Figma Desktop Bridge not connected. Open Figma Desktop with the file and the\n' +
          '  figma-console Desktop Bridge plugin running, and ensure no other MCP client holds\n' +
          '  the bridge, then re-run this script.',
      );
      process.exit(2);
    }
    const declaredServerVersion = versionFromPackageSpec(
      figmaConsolePackageSpec,
    );
    const serverVersion =
      reportedServerVersion?.version ??
      status?.serverVersion ??
      status?.details?.serverVersion ??
      (declaredServerVersion
        ? `${declaredServerVersion} (declared in ${MCP_CONFIG_PATH}; server did not report)`
        : null);

    // ─── Verify --file actually names the open file ────────────────────────
    // The Bridge reads whichever file is open in Figma Desktop, regardless of
    // what --file claims, so the open file cannot be assumed to match (a
    // participant works in their own duplicate). figma.fileKey is the ground truth reported from inside
    // the plugin sandbox itself.
    const openFile = (
      await call(client, 'figma_execute', {
        code: `
          await figma.loadAllPagesAsync();
          return { fileKey: figma.fileKey ?? null, fileName: figma.root.name };
        `,
        timeout: 10000,
      })
    )?.result;
    if (openFile?.fileKey && openFile.fileKey !== args.file) {
      console.error(
        `✗ --file ${args.file} does not match the file open in Figma Desktop ` +
          `(${openFile.fileKey}, "${openFile.fileName}"). Open the file you meant to ` +
          `snapshot, or pass --file ${openFile.fileKey}, and re-run.`,
      );
      process.exit(2);
    }

    const components = [];
    for (const { selector, nodeId } of roster) {
      const result = (
        await call(client, 'figma_execute', {
          code: pluginCodeFor(nodeId),
          timeout: 15000,
        })
      )?.result;
      if (!result) {
        console.warn(`⚠ skipped ${selector} (${nodeId}): node not found`);
        continue;
      }
      components.push({
        selector,
        nodeId,
        name: result.name,
        description: result.description ?? '',
        variantAxes: result.variantAxes ?? {},
        properties: result.properties ?? {},
        variants: result.variants ?? [],
      });
    }

    if (components.length === 0) throw new Error('no components captured');

    const snapshot = {
      meta: {
        fileKey: args.file,
        generatedAt: new Date().toISOString(),
        serverVersion,
        generator: 'figma-snapshot-contracts',
      },
      components,
    };
    writeFileSync(OUT_PATH, JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`✓ wrote ${components.length} master(s) to ${OUT_PATH}`);
  } finally {
    await client.close();
  }
}
