#!/usr/bin/env node
/**
 * figma-sync-library-tokens.mjs
 *
 * Push the canonical tokens.css into the Figma "Library Tokens" collection
 * (ADR-0030). Idempotent upsert: creates missing variables, updates values /
 * scopes / aliases that drifted, reports (but does not delete) variables
 * that no longer exist in the CSS. Run after editing tokens.css:
 *
 *   npm run figma:sync-tokens
 *
 * Requirements: Figma Desktop with the file open and the figma-console
 * Desktop Bridge plugin running (same setup as figma:snapshot). Afterwards
 * run `npm run figma:snapshot` so the conformance gate sees the new state.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { buildDefs } from './gen-figma-library-tokens.mjs';

const defs = buildDefs();

// The plugin-side upsert. DEFS is injected as JSON below.
const PAYLOAD = `
const DEFS = __DEFS__;
const collections = await figma.variables.getLocalVariableCollectionsAsync();
let coll = collections.find((c) => c.name === 'Library Tokens');
const report = { createdCollection: false, created: 0, valueUpdates: 0, scopeUpdates: 0, aliasUpdates: 0, unchanged: 0, orphans: [] };
if (!coll) {
  coll = figma.variables.createVariableCollection('Library Tokens');
  coll.renameMode(coll.modes[0].modeId, 'Light');
  coll.addMode('Dark');
  report.createdCollection = true;
}
const lightId = coll.modes.find((m) => m.name === 'Light').modeId;
const darkId = coll.modes.find((m) => m.name === 'Dark').modeId;
const byName = {};
for (const id of coll.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  byName[v.name] = v;
}
function sameValue(a, b) {
  if (a === b) return true;
  // Figma stores numbers as float32 (0.65 comes back as 0.6499999...), so
  // compare numerics with an epsilon instead of ===.
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-4;
  if (a && b && a.r !== undefined && b.r !== undefined) {
    const q = (x) => Math.round(x * 1e4);
    return q(a.r) === q(b.r) && q(a.g) === q(b.g) && q(a.b) === q(b.b) && q(a.a ?? 1) === q(b.a ?? 1);
  }
  return false;
}
// Pass 1: literals + scopes.
for (const d of DEFS) {
  let v = byName[d.name];
  if (!v) {
    v = figma.variables.createVariable(d.name, coll, d.type);
    v.description = 'Mirrors ' + d.cssVar + ' in tokens.css (generated — edit the CSS, not this value).';
    byName[d.name] = v;
    report.created++;
  }
  const wantScopes = d.scopes.slice().sort().join(',');
  const haveScopes = (v.scopes || []).slice().sort().join(',');
  if (wantScopes !== haveScopes) {
    try { v.scopes = d.scopes; report.scopeUpdates++; } catch (e) { /* invalid for type */ }
  }
  if ('aliasOf' in d) continue;
  let touched = false;
  for (const [modeId, want] of [[lightId, d.light], [darkId, d.dark]]) {
    const have = v.valuesByMode[modeId];
    if (have && have.type === 'VARIABLE_ALIAS') { v.setValueForMode(modeId, want); touched = true; continue; }
    if (!sameValue(have, want)) { v.setValueForMode(modeId, want); touched = true; }
  }
  if (touched) report.valueUpdates++; else report.unchanged++;
}
// Pass 2: aliases.
for (const d of DEFS) {
  if (!d.aliasOf) continue;
  const v = byName[d.name];
  const target = byName[d.aliasOf];
  let touched = false;
  for (const modeId of [lightId, darkId]) {
    const have = v.valuesByMode[modeId];
    if (!(have && have.type === 'VARIABLE_ALIAS' && have.id === target.id)) {
      v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
      touched = true;
    }
  }
  if (touched) report.aliasUpdates++; else report.unchanged++;
}
// Orphans: in the collection but no longer in the CSS. Report only —
// deleting bound variables is a Breaking op (migration playbook).
const wanted = new Set(DEFS.map((d) => d.name));
for (const name of Object.keys(byName)) {
  if (!wanted.has(name)) report.orphans.push(name);
}
return report;
`;

main().catch((err) => {
  console.error(`✗ figma:sync-tokens failed: ${err?.message ?? err}`);
  process.exit(2);
});

async function main() {
  const client = new Client(
    { name: 'atelier-figma-token-sync', version: '1.0.0' },
    { capabilities: {} }
  );
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'figma-console-mcp@latest'],
    env: { ...process.env },
  });
  await client.connect(transport);
  try {
    // Probe with retry — the plugin attaches to a fresh server ~0.5s in.
    let status = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      status = await call(client, 'figma_get_status', { probe: true });
      if (isConnected(status)) break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!isConnected(status)) {
      console.error(
        '✗ Figma Desktop Bridge not connected. Open Figma Desktop with the file and the\n' +
          '  Desktop Bridge plugin running, then re-run npm run figma:sync-tokens.'
      );
      process.exit(2);
    }
    const code = PAYLOAD.replace('__DEFS__', JSON.stringify(defs));
    const res = await call(client, 'figma_execute', { code, timeout: 30000 });
    if (!res?.success) {
      console.error(`✗ figma_execute failed: ${res?.error ?? 'unknown error'}`);
      process.exit(1);
    }
    const r = res.result;
    console.log(
      `✓ Library Tokens synced — ${defs.length} definitions: ` +
        `${r.created} created, ${r.valueUpdates} value update(s), ${r.aliasUpdates} alias update(s), ` +
        `${r.scopeUpdates} scope update(s), ${r.unchanged} unchanged.` +
        (r.createdCollection ? ' (collection created)' : '')
    );
    if (r.orphans.length) {
      console.warn(
        `⚠ ${r.orphans.length} variable(s) exist in Figma but not in tokens.css: ${r.orphans.join(', ')}.\n` +
          '  Not deleted automatically — removing bound variables is a Breaking op; clean up manually if intended.'
      );
    }
    console.log('Next: npm run figma:snapshot && npm run check:figma');
  } finally {
    await client.close();
  }
}

async function call(client, name, args) {
  const res = await client.callTool({ name, arguments: args });
  const text = res?.content?.find((c) => c.type === 'text')?.text ?? '';
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${name} returned non-JSON output`);
  }
}

function isConnected(status) {
  return Boolean(
    status?.connected ||
      status?.plugin?.connected ||
      status?.setup?.probeResult?.success ||
      status?.setup?.valid ||
      status?.transport?.websocket?.available
  );
}
