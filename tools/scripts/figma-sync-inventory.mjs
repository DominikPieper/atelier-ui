#!/usr/bin/env node
/**
 * figma-sync-inventory.mjs
 *
 * Regenerate the Inventory page's cards from the masters they document.
 *
 *   npm run figma:sync-inventory
 *
 * Why this exists: the cards' facts were hand-written and drifted. AtlBreadcrumbs'
 * card still read "COMPONENT_SET · 209×17px" with an `items` VARIANT row months after
 * ADR-0056 removed that axis and collapsed the set to a plain COMPONENT — and composing
 * the master from AtlBreadcrumbItem instances (ADR-0068) made it stale a second time
 * within the day. A catalogue nobody can trust is worse than none: a reader who trusts
 * a stale card stops looking at the master.
 *
 * What it rewrites, per card:
 *   - the header name, from the master
 *   - the preview, as a fresh INSTANCE of the master's default variant
 *   - the meta line: TYPE · WIDTH×HEIGHTpx
 *   - one property row per variant axis, per BOOLEAN and per TEXT property
 *
 * What it leaves alone: the blurb (hand-written prose worth keeping) and the status
 * chip (which comes from the design-status pass, not from the master).
 *
 * It also reports, without changing anything: masters with no card, and cards whose
 * master no longer exists.
 *
 * Requirements: Figma Desktop with the file open and the figma-console Desktop Bridge
 * plugin running — the same setup as figma:snapshot, and the same caveat: run it when
 * no other figma-console client holds the bridge. Afterwards run
 * `npm run figma:snapshot` so the conformance gate sees the new state.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// The plugin-side rewrite. No backticks inside: this is embedded in a template literal.
const PAYLOAD = `
await figma.loadAllPagesAsync();
const FONTS = [['Instrument Sans','Regular'],['Instrument Sans','Medium'],['Instrument Sans','SemiBold']];
await Promise.all(FONTS.map((f) => figma.loadFontAsync({ family: f[0], style: f[1] })));

const CATEGORY = /^(Action|Form|Display|Navigation|Overlay|Feedback|AI|Data)\\//;
const masters = figma.root.findAll(
  (n) =>
    (n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && CATEGORY.test(n.name))) &&
    !(n.parent && n.parent.type === 'COMPONENT_SET')
);
const inv = figma.root.children.find((p) => p.name.indexOf('Inventory') >= 0);
if (!inv) { throw new Error('no Inventory page'); }

const cards = {};
for (const c of inv.findAll((n) => String(n.name).indexOf('card \\u00b7 ') === 0)) cards[String(n_name(c))] = c;
function n_name(c) { return String(c.name).slice('card \\u00b7 '.length); }

const report = { updated: [], unchanged: [], noCard: [], orphanCards: [] };

const axesOf = (set) => {
  const axes = {};
  for (const v of set.children) {
    for (const part of String(v.name).split(',')) {
      const kv = part.split('=');
      const k = (kv[0] || '').trim();
      const val = (kv[1] || '').trim();
      if (k && val) { axes[k] = axes[k] || []; if (axes[k].indexOf(val) < 0) axes[k].push(val); }
    }
  }
  return axes;
};

for (const m of masters) {
  const card = cards[m.name];
  if (!card) { report.noCard.push(m.name); continue; }
  delete cards[m.name];
  const changes = [];
  const comp = m.type === 'COMPONENT_SET' ? m.defaultVariant : m;

  // Header name.
  const header = card.findOne((n) => n.name === 'header');
  if (header) {
    const t = header.children.filter((c) => c.type === 'TEXT')[0];
    const leaf = m.name.split('/').pop();
    if (t && t.characters !== leaf) { changes.push('name ' + JSON.stringify(t.characters) + ' -> ' + JSON.stringify(leaf)); t.characters = leaf; t.name = leaf; }
  }

  // Preview: a fresh instance, so a recomposed master shows its real shape.
  const preview = card.findOne((n) => n.name === 'preview');
  if (preview) {
    const existing = preview.children.filter((c) => c.type === 'INSTANCE')[0];
    let main = null;
    if (existing) { try { main = await existing.getMainComponentAsync(); } catch (e) { main = null; } }
    // A preview wider than its frame is deliberately set to FILL below, which
    // changes its width for good — so comparing width to the master's would be
    // permanently true and the card would be "updated" on every single run. That
    // is exactly what happened: the second run reported 15 cards updated, and
    // ADR-0070's idempotency claim rested on a re-derivation rather than on an
    // actual second run, which had stalled. main.id already catches the case the
    // size check was for (a recomposed or swapped master).
    const filled = existing && existing.layoutSizingHorizontal === 'FILL';
    const stale = !existing || !main || main.id !== comp.id ||
      (!filled &&
        (Math.round(existing.width) !== Math.round(comp.width) ||
          Math.round(existing.height) !== Math.round(comp.height)));
    if (stale) {
      const kids = preview.children.slice();
      for (const k of kids) k.remove();
      const inst = comp.createInstance();
      preview.appendChild(inst);
      if (inst.width > preview.width - 32) { try { inst.layoutSizingHorizontal = 'FILL'; } catch (e) {} }
      changes.push('preview reinstanced');
    }
  }

  // Meta line.
  const meta = card.findOne((n) => n.name === 'meta');
  if (meta) {
    const t = meta.children.filter((c) => c.type === 'TEXT')[0];
    const want = m.type + ' \\u00b7 ' + Math.round(comp.width) + '\\u00d7' + Math.round(comp.height) + 'px';
    if (t && t.characters !== want) { changes.push('meta ' + JSON.stringify(t.characters) + ' -> ' + JSON.stringify(want)); t.characters = want; t.name = want; }
  }

  // Property rows: one per axis, then per BOOLEAN, then per TEXT.
  const props = card.findOne((n) => n.name === 'properties');
  if (props) {
    const rows = [];
    if (m.type === 'COMPONENT_SET') {
      const axes = axesOf(m);
      for (const k of Object.keys(axes)) rows.push([k, 'VARIANT', 'default: ' + axes[k][0]]);
    }
    const defs = m.componentPropertyDefinitions || {};
    for (const key of Object.keys(defs)) {
      if (defs[key].type !== 'BOOLEAN') continue;
      rows.push([key.split('#')[0], 'BOOLEAN', 'default: ' + defs[key].defaultValue]);
    }
    for (const key of Object.keys(defs)) {
      if (defs[key].type !== 'TEXT') continue;
      rows.push([key.split('#')[0], 'TEXT', 'default: ' + String(defs[key].defaultValue).slice(0, 24)]);
    }
    const existing = props.children.filter((c) => String(c.name).indexOf('prop \\u00b7 ') === 0);
    const before = existing.map((r) => r.findAll((n) => n.type === 'TEXT').slice(0, 3).map((t) => t.characters).join('|')).join(' ; ');
    const after = rows.map((r) => r.join('|')).join(' ; ');
    if (before !== after) {
      const template = existing[0] || null;
      if (template) {
        for (let i = 1; i < existing.length; i++) existing[i].remove();
        for (let i = 0; i < rows.length; i++) {
          const row = i === 0 ? template : template.clone();
          if (i > 0) props.appendChild(row);
          row.name = 'prop \\u00b7 ' + rows[i][0];
          const texts = row.findAll((n) => n.type === 'TEXT');
          for (let j = 0; j < 3 && j < texts.length; j++) { texts[j].characters = rows[i][j]; texts[j].name = rows[i][j]; }
        }
        if (!rows.length) template.remove();
        changes.push(rows.length + ' property row(s) rewritten');
      }
    }
  }

  if (changes.length) report.updated.push(m.name + ': ' + changes.join('; '));
  else report.unchanged.push(m.name);
}
report.orphanCards = Object.keys(cards);

// Sections and the TOC follow whatever the cards now measure.
for (const sec of inv.children) {
  if (sec.type !== 'SECTION' || !sec.children.length) continue;
  const needW = Math.max.apply(null, sec.children.map((c) => c.x + c.width));
  const needH = Math.max.apply(null, sec.children.map((c) => c.y + c.height));
  sec.resizeWithoutConstraints(Math.ceil(needW + 32), Math.ceil(needH + 32));
}
let x = 0;
const secs = inv.children.filter((c) => c.type === 'SECTION').sort((a, b) => a.x - b.x);
for (const s of secs) { s.x = x; s.y = 332; x += s.width + 80; }
const counts = {};
let total = 0;
for (const s of secs) {
  const n = s.findAll((c) => String(c.name).indexOf('card \\u00b7 ') === 0).length;
  counts[s.name.replace(' \\u2014 Inventory', '')] = n;
  total += n;
}
const toc = inv.children.filter((c) => String(c.name).indexOf('TOC') >= 0)[0];
if (toc) {
  for (const t of toc.findAll((n) => n.type === 'TEXT')) {
    const m2 = /^(\\w+(?: \\w+)?) \\u2014 \\d+$/.exec(t.characters);
    if (m2 && counts[m2[1]] != null) { t.characters = m2[1] + ' \\u2014 ' + counts[m2[1]]; t.name = t.characters; continue; }
    if (t.characters.indexOf('sections \\u00b7') >= 0) {
      t.characters = Object.keys(counts).length + ' sections \\u00b7 ' + total + ' components \\u00b7 generated by npm run figma:sync-inventory. Icons on the dedicated Icons page (excluded).';
      t.name = 'summary';
    }
  }
}
report.counts = counts;
report.total = total;
return report;
`;

main().catch((err) => {
  console.error(`✗ figma:sync-inventory failed: ${err?.message ?? err}`);
  process.exit(2);
});

async function main() {
  const client = new Client({ name: 'atelier-figma-sync-inventory', version: '1.0.0' }, { capabilities: {} });
  // Same invocation as figma:snapshot — pinning `@latest` and passing the environment
  // through is what makes the Desktop Bridge visible to a spawned client.
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['-y', 'figma-console-mcp@latest'],
    env: { ...process.env },
  });
  await client.connect(transport);
  try {
    let status = null;
    for (let attempt = 0; attempt < 6 && !isConnected(status); attempt++) {
      if (attempt) await new Promise((r) => setTimeout(r, 500));
      status = await call(client, 'figma_get_status', { probe: true });
    }
    if (!isConnected(status)) {
      console.error(
        '✗ figma:sync-inventory — the Desktop Bridge plugin is not connected.\n' +
          '  Open the file in Figma Desktop, run the figma-console plugin, and make sure no\n' +
          '  other figma-console client (an active Claude Code session) holds the bridge.'
      );
      process.exit(2);
    }
    const res = await call(client, 'figma_execute', { code: PAYLOAD, timeout: 60000 });
    const report = res?.result;
    if (!report) {
      console.error(`✗ figma_execute failed: ${res?.error ?? 'unknown error'}`);
      process.exit(2);
    }
    for (const line of report.updated ?? []) console.log(`  ~ ${line}`);
    for (const name of report.noCard ?? []) console.warn(`  ⚠ ${name}: no Inventory card — add one (CLAUDE.md: every master gets an INSTANCE on Inventory)`);
    for (const name of report.orphanCards ?? []) console.warn(`  ⚠ card · ${name}: no such master any more — remove the card or restore the master`);
    console.log(
      `✓ inventory in sync — ${report.updated?.length ?? 0} card(s) updated, ${report.unchanged?.length ?? 0} unchanged, ` +
        `${report.total} across ${Object.keys(report.counts ?? {}).length} section(s).`
    );
    if ((report.noCard?.length ?? 0) || (report.orphanCards?.length ?? 0)) process.exitCode = 1;
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
    return { raw: text };
  }
}

function isConnected(status) {
  // The same set of shapes figma-snapshot.mjs accepts: the field moved twice across
  // figma-console-mcp versions, and a spawned client sees whichever the installed one
  // reports.
  return Boolean(
    status?.connected ||
      status?.plugin?.connected ||
      status?.details?.plugin?.connected ||
      status?.probeResult?.success ||
      status?.setup?.probeResult?.success ||
      status?.setup?.valid ||
      status?.transport?.websocket?.available
  );
}
