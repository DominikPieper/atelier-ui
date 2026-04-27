# Inventory generation — `figma_execute` payloads

Ready-to-paste payload templates for the seven phases of the Inventory sub-mode. Adapt names and ids for the file at hand. The structure is fixed; the values come from the Section plan emitted in Phase 2 (see `inventory-generation.md`).

The shared constants below are inlined into every payload — there is no plugin-side state across calls.

```js
// Layout tokens
const GAP_SECTION = 80;
const GAP_GROUP   = 48;
const GAP_CARD    = 32;
const CARD_WIDTH  = 320;
const CARD_PADDING = 24;
const CARD_ITEM_SPACING = 12;
const PREVIEW_PAD = 16;
const PREVIEW_MIN_H = 160;
const BADGE_PAD = { x: 6, y: 4 };

// Palettes
const PALETTE = {
  light: { surface: '#FFFFFF', preview: '#F4F4F5', fg: '#0A0A0A', muted: '#6B7280' },
  dark:  { surface: '#0A0A0A', preview: '#1F1F23', fg: '#FAFAFA', muted: '#9CA3AF' },
};
const STATUS = {
  ready:      { color: '#10B981', fg: '#FFFFFF', label: 'READY' },
  beta:       { color: '#F59E0B', fg: '#000000', label: 'BETA' },
  wip:        { color: '#6366F1', fg: '#FFFFFF', label: 'WIP' },
  deprecated: { color: '#EF4444', fg: '#FFFFFF', label: 'DEPRECATED' },
  unmarked:   { color: '#9CA3AF', fg: '#FFFFFF', label: '—' },
};

// Hex → rgb in 0..1 (Figma colors are 0–1, not 0–255)
function hex(h) {
  const v = h.replace('#', '');
  return {
    r: parseInt(v.slice(0, 2), 16) / 255,
    g: parseInt(v.slice(2, 4), 16) / 255,
    b: parseInt(v.slice(4, 6), 16) / 255,
  };
}
function solid(h) { return [{ type: 'SOLID', color: hex(h) }]; }
```

## Phase 1 — Discover

Read-only. Returns the light index. Heavy metadata is deferred to Phase 4.

```js
// figma_execute payload — Phase 1
// Inputs (inlined by the skill agent):
//   skipNamespaces: string[]    // top-level slash segments to drop, e.g. ['Icon']
//   skipPages: string[]         // page names to drop, e.g. ['Icons', '🔣 Icons']

await figma.loadAllPagesAsync();
figma.skipInvisibleInstanceChildren = true;

const all = await figma.root.findAllAsync(
  n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
);

// Default skip lists — `Icon` namespace and common icon page names.
// Icons live on a dedicated `Icons` page (see naming-and-file-structure.md);
// dumping them into the component inventory drowns it in single-cell cards.
const defaultSkipNamespaces = new Set(skipNamespaces || ['Icon']);
const defaultSkipPages      = new Set(skipPages || ['Icons', '🔣 Icons']);

const skipped = [];
const sources = all.filter(n => {
  if (n.type === 'COMPONENT' && n.parent?.type === 'COMPONENT_SET') return false;
  const leaf = n.name.split('/').pop();
  if (/^[_.]/.test(leaf)) {
    skipped.push({ id: n.id, name: n.name, reason: 'private prefix' });
    return false;
  }
  const top = n.name.split('/')[0];
  if (defaultSkipNamespaces.has(top)) {
    skipped.push({ id: n.id, name: n.name, reason: `namespace skip: ${top}` });
    return false;
  }
  // Walk up to find the parent page
  let cursor = n.parent;
  while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent;
  if (cursor && defaultSkipPages.has(cursor.name)) {
    skipped.push({ id: n.id, name: n.name, reason: `page skip: ${cursor.name}` });
    return false;
  }
  return true;
});

return {
  sources: sources.map(n => ({ id: n.id, name: n.name, type: n.type })),
  skipped,
};
```

## Phase 3 — Scaffold

Wipes any existing `📋 Inventory` page, recreates it, drops a Section + inner Frame per top-level category. The skill agent passes `sectionPlans` from Phase 2.

```js
// figma_execute payload — Phase 3
// Inputs (inlined by the skill agent):
//   sectionPlans: Array<{ sectionName: string }>

const PAGE_NAME = '📋 Inventory';
const existing = figma.root.children.find(p => p.name === PAGE_NAME);
if (existing) existing.remove();

const page = figma.createPage();
page.name = PAGE_NAME;
await figma.setCurrentPageAsync(page);

const sectionRefs = {};
let cursorX = 0;

for (const plan of sectionPlans) {
  const section = figma.createSection();
  section.name = `${plan.sectionName} — Inventory`;
  section.x = cursorX;
  section.y = 0;

  const inner = figma.createFrame();
  inner.name = `${plan.sectionName} · groups`;
  inner.layoutMode = 'VERTICAL';
  inner.layoutSizingHorizontal = 'HUG';
  inner.layoutSizingVertical = 'HUG';
  inner.itemSpacing = 48;
  inner.paddingTop = inner.paddingBottom = 32;
  inner.paddingLeft = inner.paddingRight = 32;
  inner.fills = [];
  section.appendChild(inner);

  sectionRefs[plan.sectionName] = { sectionId: section.id, innerId: inner.id };
  cursorX += 1600; // placeholder; reflowed at the end of Phase 4
}

return { sectionRefs };
```

## Phase 4 — Populate one Section (one call per Section)

The hot loop — one `figma_execute` call per top-level Section. Card builder helpers are inlined at the bottom.

```js
// figma_execute payload — Phase 4 (one Section)
// Inputs (inlined by the skill agent):
//   innerId: string                   // Frame inside the Section, from Phase 3
//   sectionName: string
//   groups: Array<{ groupName: string; componentIds: string[] }>

await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

const inner = await figma.getNodeByIdAsync(innerId);

// — helpers —————————————————————————————————————————————————————————————

function makeText(content, { size = 12, weight = 'Regular', color = '#0A0A0A', uppercase = false } = {}) {
  const t = figma.createText();
  t.fontName = { family: 'Inter', style: weight };
  t.characters = uppercase ? content.toUpperCase() : content;
  t.fontSize = size;
  t.fills = solid(color);
  return t;
}

function autoFrame({ name, mode = 'VERTICAL', pad = 0, gap = 0, fill, radius = 0, sizing = 'HUG' }) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = mode;
  f.itemSpacing = gap;
  f.paddingTop = f.paddingBottom = (typeof pad === 'object' ? pad.y : pad);
  f.paddingLeft = f.paddingRight = (typeof pad === 'object' ? pad.x : pad);
  f.layoutSizingHorizontal = sizing === 'FILL' ? 'FILL' : 'HUG';
  f.layoutSizingVertical = 'HUG';
  if (radius) f.cornerRadius = radius;
  f.fills = fill ? solid(fill) : [];
  return f;
}

function makeGroupFrame(groupName) {
  const wrap = autoFrame({ name: `group · ${groupName}`, mode: 'VERTICAL', gap: 16, sizing: 'HUG' });
  wrap.appendChild(makeText(groupName, { size: 16, weight: 'Semi Bold', color: '#0A0A0A' }));
  return wrap;
}

function makeCardsRow() {
  const row = figma.createFrame();
  row.name = 'cards';
  row.layoutMode = 'HORIZONTAL';
  row.layoutWrap = 'WRAP';
  row.itemSpacing = GAP_CARD;
  row.counterAxisSpacing = GAP_CARD;
  row.layoutSizingHorizontal = 'FIXED';
  row.resize(1480, 1);                               // wide enough for ~4 cards across; HUG resizes vertically
  row.layoutSizingVertical = 'HUG';
  row.fills = [];
  return row;
}

function resolveStatus(node) {
  const pd = node.getSharedPluginData('inventory', 'status');
  if (pd) {
    const v = pd.trim().toLowerCase();
    if (['ready', 'beta', 'wip', 'deprecated'].includes(v)) return v;
  }
  if (node.devStatus?.type === 'READY_FOR_DEV') return 'ready';
  const tag = (node.description || '').match(/\[(stable|ready|beta|wip|deprecated)\]/i);
  if (tag) return tag[1].toLowerCase().replace('stable', 'ready');
  return 'unmarked';
}

function detectContextualBg(node) {
  // 1. Layer-name hint — explicit dark/inverse marker on any descendant flips to dark
  const hint = node.findOne?.(n => /(^|[\s/])(dark|inverse|on[\s\-_]?dark)([\s/]|$)/i.test(n.name));
  if (hint) return 'dark';
  // 2. Cached
  const cached = node.getSharedPluginData('inventory', 'contextualBg');
  if (cached === 'dark' || cached === 'light') return cached;
  // 3. Walk UP — sample the first ancestor with a visible SOLID fill.
  //    The previewNode's own root fill is usually the component itself
  //    (Button = teal, Tooltip = dark, Toast = colored); that's not its
  //    contextual surface. The actual surface is the Section/Frame the
  //    component sits inside. Walk parents until one has a fill.
  let cursor = node.parent;
  while (cursor && cursor.type !== 'PAGE' && cursor.type !== 'DOCUMENT') {
    const fill = (cursor.fills || []).find(f => f.type === 'SOLID' && f.visible !== false);
    if (fill) {
      const { r, g, b } = fill.color;
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const result = L < 0.5 ? 'dark' : 'light';
      node.setSharedPluginData('inventory', 'contextualBg', result);
      return result;
    }
    cursor = cursor.parent;
  }
  // 4. Fallback — the component sits on the page background, which is
  //    light by Figma default. The layer-name hint above covers
  //    intentionally-dark components.
  const fallback = 'light';
  node.setSharedPluginData('inventory', 'contextualBg', fallback);
  return fallback;
}

function extractMetadata(node) {
  const isSet = node.type === 'COMPONENT_SET';
  const previewNode = isSet ? node.defaultVariant : node;
  const properties = [];
  if (isSet) {
    for (const [key, def] of Object.entries(node.componentPropertyDefinitions || {})) {
      properties.push({
        key: key.split('#')[0],
        type: def.type,
        defaultValue: def.defaultValue,
        variantOptions: def.variantOptions,
      });
    }
  }
  return {
    description: node.description || '',
    documentationLinks: (node.documentationLinks || []).map(d => d.uri),
    properties,
    size: { width: previewNode.width, height: previewNode.height },
    status: resolveStatus(node),
    contextualBg: detectContextualBg(previewNode),
    previewNode,
    isSet,
  };
}

async function buildCard(node) {
  const meta = extractMetadata(node);
  const bg = PALETTE[meta.contextualBg];
  const status = STATUS[meta.status];

  const card = autoFrame({
    name: `card · ${node.name}`,
    mode: 'VERTICAL',
    pad: CARD_PADDING,
    gap: CARD_ITEM_SPACING,
    fill: bg.surface,
    radius: 8,
    sizing: 'HUG',
  });
  card.layoutSizingHorizontal = 'FIXED';
  card.resize(CARD_WIDTH, 1);
  card.layoutSizingVertical = 'HUG';

  // — Header ——————————————————————————————————
  const header = autoFrame({ name: 'header', mode: 'HORIZONTAL', gap: 8, sizing: 'FILL' });
  header.primaryAxisAlignItems = 'SPACE_BETWEEN';
  header.counterAxisAlignItems = 'CENTER';
  header.appendChild(makeText(node.name.split('/').pop(), { size: 14, weight: 'Semi Bold', color: bg.fg }));
  const badge = autoFrame({
    name: 'status', mode: 'HORIZONTAL', pad: BADGE_PAD, fill: status.color, radius: 12, sizing: 'HUG',
  });
  badge.appendChild(makeText(status.label, { size: 10, weight: 'Medium', color: status.fg, uppercase: true }));
  header.appendChild(badge);
  card.appendChild(header);

  // — Preview ——————————————————————————————————
  const preview = autoFrame({
    name: 'preview', mode: 'VERTICAL', pad: PREVIEW_PAD, fill: bg.preview, radius: 6, sizing: 'FILL',
  });
  preview.primaryAxisAlignItems = 'CENTER';
  preview.counterAxisAlignItems = 'CENTER';
  preview.minHeight = PREVIEW_MIN_H;
  try {
    const instance = meta.previewNode.createInstance();
    preview.appendChild(instance);
  } catch (e) {
    preview.appendChild(makeText('(preview unavailable)', { size: 11, color: bg.muted }));
  }
  card.appendChild(preview);

  // — Meta row ——————————————————————————————————
  const metaRow = autoFrame({ name: 'meta', mode: 'HORIZONTAL', gap: 8, sizing: 'FILL' });
  metaRow.appendChild(makeText(
    `${meta.isSet ? 'COMPONENT_SET' : 'COMPONENT'} · ${Math.round(meta.size.width)}×${Math.round(meta.size.height)}px`,
    { size: 11, color: bg.muted },
  ));
  card.appendChild(metaRow);

  // — Property table ——————————————————————————————————
  if (meta.properties.length) {
    const table = autoFrame({ name: 'properties', mode: 'VERTICAL', gap: 4, sizing: 'FILL' });
    for (const p of meta.properties) {
      const row = autoFrame({ name: `prop · ${p.key}`, mode: 'HORIZONTAL', gap: 8, sizing: 'FILL' });
      row.appendChild(makeText(p.key, { size: 12, weight: 'Medium', color: bg.fg }));
      row.appendChild(makeText(p.type, { size: 11, color: bg.muted }));
      row.appendChild(makeText(`default: ${p.defaultValue}`, { size: 11, color: bg.muted }));
      table.appendChild(row);
    }
    card.appendChild(table);
  }

  // — Description footer ——————————————————————————————————
  if (meta.description) {
    card.appendChild(makeText(meta.description, { size: 12, color: bg.muted }));
  }

  return card;
}

// — main loop ——————————————————————————————————————————————————————————

const built = [];
for (const group of groups) {
  const groupFrame = makeGroupFrame(group.groupName);
  inner.appendChild(groupFrame);

  const cardsRow = makeCardsRow();
  groupFrame.appendChild(cardsRow);

  for (let i = 0; i < group.componentIds.length; i += 25) {
    const slice = group.componentIds.slice(i, i + 25);
    for (const id of slice) {
      const node = await figma.getNodeByIdAsync(id);
      if (!node) continue;
      const card = await buildCard(node);
      cardsRow.appendChild(card);
      built.push({ componentId: id, cardId: card.id });
    }
    await new Promise(r => setTimeout(r, 0));      // YIELD between chunks
  }
}

return { sectionName, built };
```

### Splitting a Section that exceeds 150 components

For the second + third + … call against the same Section, the same payload is reused with two changes:

- `groups` is the **next contiguous slice** of the original group plan (the skill agent slices it up-front).
- The first call may need to *reuse* a `groupFrame` instead of creating a new one. Pass an optional `appendIntoGroupId` and have the payload fetch and reuse it instead of calling `makeGroupFrame()`. Same logic; the payload conditionally creates vs. resolves.

## Phase 6 — Mark Ready + index

```js
// figma_execute payload — Phase 6
// Inputs:
//   sectionRefs: Record<string, { sectionId: string }>
//   counts: Record<string, number>          // section name → component count
//   inventoryPageId: string

await figma.setCurrentPageAsync(await figma.getNodeByIdAsync(inventoryPageId));
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

// 1. Mark each Section ready for dev
for (const name of Object.keys(sectionRefs)) {
  const sec = await figma.getNodeByIdAsync(sectionRefs[name].sectionId);
  sec.devStatus = { type: 'READY_FOR_DEV' };
}

// 2. Reflow Section X positions with GAP_SECTION = 80
let cursorX = 0;
for (const name of Object.keys(sectionRefs)) {
  const sec = await figma.getNodeByIdAsync(sectionRefs[name].sectionId);
  sec.x = cursorX;
  sec.y = 200;                                  // leaves room above for the TOC
  cursorX += sec.width + 80;
}

// 3. TOC card
const toc = figma.createFrame();
toc.name = '📋 Inventory · TOC';
toc.x = 0;
toc.y = 0;
toc.layoutMode = 'VERTICAL';
toc.itemSpacing = 8;
toc.paddingTop = toc.paddingBottom = toc.paddingLeft = toc.paddingRight = 24;
toc.layoutSizingHorizontal = 'HUG';
toc.layoutSizingVertical = 'HUG';
toc.cornerRadius = 8;
toc.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
const heading = figma.createText();
heading.fontName = { family: 'Inter', style: 'Semi Bold' };
heading.characters = 'Inventory';
heading.fontSize = 18;
toc.appendChild(heading);
for (const [name, n] of Object.entries(counts)) {
  const row = figma.createText();
  row.fontName = { family: 'Inter', style: 'Regular' };
  row.characters = `${name} — ${n}`;
  row.fontSize = 12;
  toc.appendChild(row);
}

return { ready: Object.keys(sectionRefs).length, tocId: toc.id };
```

## Phase 7 — Validate

Skill-orchestrated, not a single payload. Per top-level Section the agent calls:

```
figma_capture_screenshot   // live, post-write — see tool-map.md:97
```

…with the section's bounding rect and returns the image to the user.

Coverage check is data-only:

```
expected = sources.length - skipped.length
actual   = sum(built.length across all Phase-4 returns)
```

If `actual < expected`, render a `_Skipped` frame on the Inventory page listing the missing components with reasons.

## Re-run idempotency

Phase 3 wipes the existing `📋 Inventory` page before recreating it. Per-component `setSharedPluginData('inventory', 'contextualBg', …)` cache survives the wipe (it lives on the source component, not the inventory page) so re-runs are fast on unchanged components.

To force a fresh contextual-background recompute, the skill agent first runs:

```js
// figma_execute payload — clear contextualBg cache
await figma.loadAllPagesAsync();
const all = await figma.root.findAllAsync(
  n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
);
for (const n of all) n.setSharedPluginData('inventory', 'contextualBg', '');
return { cleared: all.length };
```

This is opt-in only — the user must request it explicitly (trigger: *recompute backgrounds, refresh contextual backgrounds, full rebuild*).
