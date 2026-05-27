# Inventory generation — Build sub-mode

A Build sub-mode that scans the current file (or a specific page / section) and emits a **standardized visual gallery** — one card per published Component / Component Set, grouped by slash-namespace, on a dedicated page. The gallery is a *data card*, not just an asset dump: header + status badge + preview + meta row + property table + optional description footer.

It is the visual artifact the Document phase produces when the user wants a library overview a designer or downstream agent can scan cold.

## When to run this sub-mode

Triggered by *generate inventory, build gallery, library catalog, stickersheet, library overview, audit visual* (when paired with a request to *render* the audit).

Run it:

- After **Validate** in a regular Build run, when the build's deliverable includes a catalog page.
- On its own against an existing library — no Build loop needed; the sub-mode is self-contained.
- After a **Migrate** when the user wants a fresh visual reference of the new state.

Do **not** run it:

- Before Validate in a build — half-shipped components pollute the gallery.
- In place of `figma_audit_design_system` — the inventory shows what *is*, not what's wrong.

## Output target

A new page named `📋 Inventory` is created at the end of the page list. If one already exists, it is **wiped and rebuilt** (not appended) so re-runs are idempotent. Components that existed on the old page but no longer in the file end up in a `_Skipped` frame with reason `removed`.

## Pipeline overview

Seven phases. The skill agent orchestrates the call sequence; each phase below is one (or N) `figma_execute` calls. The function is **stateless across calls** — every call receives the IDs it needs and returns IDs the next call uses.

| Phase | Calls | Purpose |
|---|---|---|
| 1. Discover | 1 | Enumerate Components / Component Sets, return light index |
| 2. Group | 0 (pure JS) | Build nested map by slash segments → emit Section plan |
| 3. Scaffold | 1 | Create the Inventory page + one Section per top-level category |
| 4. Populate | **N** (one per Section) | Build cards in chunks of 25, yielding between chunks |
| 5. Card builder | (inside Phase 4) | Atomic structure per card; metadata extraction |
| 6. Mark Ready + index | 1 | `devStatus = READY_FOR_DEV` on each Section + write a TOC |
| 7. Validate | 1 per Section | `figma_capture_screenshot` per Section + coverage report |

`inventory-payload.md` carries the ready-to-paste `figma_execute` snippets for each phase.

## Phase 1 — Discover (one read-only call)

Returns a *light* index — `id`, `name`, `type` only — so the payload stays small even on 1000+ component files.

```js
await figma.loadAllPagesAsync();
figma.skipInvisibleInstanceChildren = true;

const all = await figma.root.findAllAsync(
  n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET'
);

// Defaults — agents can override via skipNamespaces / skipPages.
// Icons live on a dedicated `Icons` page in a properly-structured library
// (see naming-and-file-structure.md). They typically number in the dozens
// and would dominate the gallery — exclude by default.
const SKIP_NS    = new Set(['Icon']);
const SKIP_PAGES = new Set(['Icons', '🔣 Icons']);

const skipped = [];
const sources = all.filter(n => {
  // Skip variant children — the parent COMPONENT_SET is the unit of inventory
  if (n.type === 'COMPONENT' && n.parent?.type === 'COMPONENT_SET') return false;
  // Skip private prefix (matches naming-and-file-structure.md:49)
  const leaf = n.name.split('/').pop();
  if (/^[_.]/.test(leaf)) {
    skipped.push({ id: n.id, name: n.name, reason: 'private prefix' });
    return false;
  }
  // Skip configured top-level slash namespaces
  const top = n.name.split('/')[0];
  if (SKIP_NS.has(top)) {
    skipped.push({ id: n.id, name: n.name, reason: `namespace skip: ${top}` });
    return false;
  }
  // Skip components that live on a dedicated icon/asset page
  let cursor = n.parent;
  while (cursor && cursor.type !== 'PAGE') cursor = cursor.parent;
  if (cursor && SKIP_PAGES.has(cursor.name)) {
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

`loadAllPagesAsync()` is required — without it `findAllAsync` does not see components on unloaded pages. The host plugin's manifest must declare `documentAccess: "dynamic-page"`; figma-console-mcp does this by default but new self-hosted plugins need it.

**Why icons are excluded by default.** Icons live on a dedicated `Icons` page in a properly-structured library (per `naming-and-file-structure.md`). That page is *itself* the icon gallery — re-rendering every icon as an inventory card produces a wall of mostly-empty cells (one tiny glyph each, no Variant Properties to display, identical descriptions) that drowns the actual component cards. The agent should treat the dedicated Icons page as the canonical icon reference and keep the inventory focused on Components. Override the defaults when an icon library legitimately lives outside its own page (rare).

## Phase 2 — Group (no `figma_execute`)

The skill walks `sources` in JS and builds a nested map keyed by slash segments. The first N-1 segments are the category path; the last segment is the leaf label.

```ts
type GroupNode = {
  components: LightRef[];                  // direct children at this level
  children: Record<string, GroupNode>;     // sub-categories
};
```

Then it emits the **Section plan** — one entry per top-level category, with subgroups flattened to one level for layout:

```ts
type SectionPlan = {
  sectionName: string;                                      // first slash segment
  groups: Array<{ groupName: string; componentIds: string[] }>;
};
```

Sort: alphabetical at every level; components by leaf name.

## Phase 3 — Scaffold (one call)

Create the Inventory page + one Section per top-level category. Sections do not support Auto Layout, so each Section gets a vertical-flow Frame inside as the real container.

```js
const PAGE_NAME = '📋 Inventory';

// Wipe existing if any (re-run idempotency)
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
  inner.layoutMode = 'VERTICAL';
  inner.layoutSizingHorizontal = 'HUG';
  inner.layoutSizingVertical = 'HUG';
  inner.itemSpacing = 48;          // GAP_GROUP
  inner.paddingTop = inner.paddingBottom = 32;
  inner.paddingLeft = inner.paddingRight = 32;
  inner.fills = [];                // Section provides background
  section.appendChild(inner);

  sectionRefs[plan.sectionName] = { sectionId: section.id, innerId: inner.id };
  cursorX += 1600;                  // rough placeholder; reflowed after Phase 4
}

return { sectionRefs };
```

The reflow at the end of Phase 4 measures actual section widths and respaces with `GAP_SECTION = 80`.

## Phase 4 — Populate (N calls — one per Section)

The hot loop. **One `figma_execute` call per top-level Section.** Within a call, components are processed in chunks of 25 with `setTimeout(0)` yields between chunks so the plugin host stays responsive.

If a single Section has more than 150 components, the skill splits it across multiple calls — each subsequent call receives the same `innerId` and a contiguous slice of `componentIds`.

```js
async function buildSection({ innerId, groups, sectionName }) {
  const inner = await figma.getNodeByIdAsync(innerId);
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

  const built = [];
  for (const group of groups) {
    const groupFrame = makeGroupFrame(group.groupName);     // see inventory-payload.md
    inner.appendChild(groupFrame);

    const cardsRow = makeCardsRow();                        // HORIZONTAL · layoutWrap='WRAP'
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
      await new Promise(r => setTimeout(r, 0));             // YIELD
    }
  }
  return { sectionName, built };
}
```

## Phase 5 — Card builder (inside Phase 4)

Atomic structure of one card:

```
Card                  Frame · VERTICAL · width 320 · HUG height · padding 24 · itemSpacing 12 · radius 8 · fill = bg.surface
├─ Header             Frame · HORIZONTAL · primaryAxis SPACE_BETWEEN · counterAxis CENTER · itemSpacing 8 · FILL horizontal
│  ├─ Name            Text  · weight 600 · size 14 · color = bg.fg
│  └─ StatusBadge     Frame · HORIZONTAL · padding [6,4] · radius 12 · fill = status.color
│     └─ Label        Text  · size 10 · uppercase · color = status.fg
├─ Preview            Frame · VERTICAL · primaryAxis CENTER · counterAxis CENTER · padding 16 · minHeight 96 · FILL horizontal · fill = bg.preview
│  └─ Instance        defaultVariant.createInstance() (or node.createInstance() for COMPONENT) · scale-fit on both axes
├─ MetaRow            Frame · HORIZONTAL · itemSpacing 8 · "{type} · {w}×{h}px"
├─ PropertyTable      Frame · VERTICAL · itemSpacing 4 · FILL horizontal
│  └─ Row × N         Frame · HORIZONTAL · itemSpacing 8 · "{key}" "{type}" "default: {default}"
└─ DescriptionFooter  Text  · size 12 · color = bg.muted   (only rendered when description ≠ '')
```

### Metadata extraction

Called once per card. All inputs come from the live node — no external state.

```js
function extractMetadata(node) {
  const isSet = node.type === 'COMPONENT_SET';
  const previewNode = isSet ? node.defaultVariant : node;

  const properties = [];
  if (isSet) {
    for (const [key, def] of Object.entries(node.componentPropertyDefinitions || {})) {
      // Non-VARIANT keys carry a #nodeId suffix; strip for display
      const displayKey = key.split('#')[0];
      properties.push({
        key: displayKey,
        type: def.type,                       // 'VARIANT' | 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP'
        defaultValue: def.defaultValue,
        variantOptions: def.variantOptions,   // VARIANT only
        preferredValues: def.preferredValues, // INSTANCE_SWAP only
      });
    }
  }

  return {
    description: node.description || '',
    documentationLinks: (node.documentationLinks || []).map(d => d.uri),
    properties,
    defaultVariantId: isSet ? node.defaultVariant.id : null,
    size: { width: previewNode.width, height: previewNode.height },
    status: resolveStatus(node),
    contextualBg: detectContextualBackground(previewNode),
  };
}
```

### Status resolution — tri-precedence

Plugin data wins over `devStatus` wins over a description tag. This lets a separate audit pass override status without mutating the source component.

```js
function resolveStatus(node) {
  const pd = node.getSharedPluginData('inventory', 'status');
  if (pd) return normalize(pd);                         // 'ready' | 'beta' | 'wip' | 'deprecated'
  if (node.devStatus?.type === 'READY_FOR_DEV') return 'ready';
  const tag = node.description?.match(/\[(stable|ready|beta|wip|deprecated)\]/i);
  if (tag) return tag[1].toLowerCase().replace('stable', 'ready');
  return 'unmarked';
}

function normalize(s) {
  const v = s.trim().toLowerCase();
  return ['ready', 'beta', 'wip', 'deprecated'].includes(v) ? v : 'unmarked';
}
```

### Contextual background detection

Decides whether a card uses a light or dark surface so the preview reads correctly. Four signals, in order:

1. **Layer-name hint.** Any descendant whose name matches `/dark|inverse|on[-_ ]?dark/i` flips the card to dark. Use this for components intentionally designed against a dark surface (e.g. a `Toast/Dark` variant set).
2. **Cached value.** If `getSharedPluginData('inventory','contextualBg')` is already set, reuse it. Re-runs skip recompute.
3. **Ancestor fill luminance.** Walk **up** from the previewNode through its parent chain and sample the first ancestor with a visible SOLID fill. Compute relative luminance:

   ```js
   const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;   // 0..1
   const result = L < 0.5 ? 'dark' : 'light';
   node.setSharedPluginData('inventory', 'contextualBg', result);
   ```

4. **Fallback:** `'light'` — the component sits on the page background, which is light by Figma default.

**Why ancestor-up, not previewNode-root.** The previewNode's own root fill is usually the component itself — a Button frame is teal, a Tooltip is dark, a Toast is colored. That fill is not the component's *contextual* surface; it's the component's *own* paint. Sampling the root produces false-dark cards for every tinted action component, which is the most common shape in any library. The actual surface is the Section/Frame the component sits inside; the layer-name hint covers the rare "this component is intentionally dark" case.

The cached value lets re-runs skip the ancestor walk entirely.

### Palette + status tokens

Card-only constants — they describe a single artifact type, not a system rule, so they live here and not in `token-architecture.md`.

```js
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
```

## Phase 6 — Mark Ready + index (one call)

```js
for (const plan of sectionPlans) {
  const sec = await figma.getNodeByIdAsync(sectionRefs[plan.sectionName].sectionId);
  sec.devStatus = { type: 'READY_FOR_DEV' };
}
```

A TOC card sits at the top-left of the page: section names + counts, useful for jumping around in Dev Mode.

## Phase 7 — Validate (skill-orchestrated)

For each Section, the skill calls `figma_capture_screenshot` (live, post-write — `figma_take_screenshot` can be cache-stale right after writes; see `tool-map.md:97`). The screenshots come back to the user as the artifact.

Coverage check:

```
expected = sources.length - skipped.length
actual   = sum(built.length across all Phase-4 returns)
```

Mismatches render as a `_Skipped` frame on the Inventory page listing each missing component with reason: `removed`, `unrenderable`, `missing default variant`, etc.

## Layout token contract

| Token | Value | Where |
|---|---|---|
| `GAP_SECTION` | 80 | between top-level Sections (per spec) |
| `GAP_GROUP` | 48 | between subgroups inside a Section |
| `GAP_CARD` | 32 | between cards in the wrap row |
| `CARD_WIDTH` | 320 | fixed; cards wrap to grid |
| `MAX_COLS` | 4 | maximum cards per row before wrapping |
| `CARD_PADDING` | 24 | inside each card (per spec) |
| `CARD_ITEM_SPACING` | 12 | header → preview → table → footer |
| `PREVIEW_PAD` | 16 | preview frame internal |
| `PREVIEW_MIN_H` | 96 | floor — keeps tiny components (Badge, Avatar 24×24) from collapsing the card |
| `PREVIEW_MAX_H` | 240 | ceiling — caps tall compositions (Chat 1080×720, Drawer 440×320) from dominating the card |
| `PREVIEW_INNER_W` | 240 | derived: `CARD_WIDTH − 2·CARD_PADDING − 2·PREVIEW_PAD` (320 − 48 − 32) |
| `BADGE_PAD` | [6, 4] | status badge padding [x, y] |

All multiples of 4, matching the existing skill scale (`token-architecture.md:35`).

**Scale rule.** Inside the preview frame, the instance is rescaled to fit the inner box on **both** axes:

```js
const scale = Math.min(
  PREVIEW_INNER_W / instance.width,
  PREVIEW_MAX_H   / instance.height,
  1,                                  // never upscale
);
if (scale < 0.99) instance.rescale(scale);
```

A width-only clamp is the common bug — a 1080×720 chat composition scaled by width alone becomes 240×26 because the preview frame's `minHeight: 96` clips the rescaled height after the fact, leaving the instance as a thin strip in a mostly-empty card. Both-axes clamp keeps the aspect ratio and sizes the preview proportionally so even the largest compositions stay readable in their card.

For the inverse case — components whose master is *smaller* than the preview inner box (e.g. a 24×24 Avatar) — the `Math.min(..., 1)` floor keeps them at native size; the `PREVIEW_MIN_H` floor pads the preview so the card doesn't collapse around the tiny instance.

**Cards-row sizing.** The wrapping row needs a FIXED width for `layoutWrap = 'WRAP'` to know where to break, but a hardcoded "max" width (e.g. 1480 for 4 cards across) leaves single-card sections sitting in 1160px of phantom whitespace that bubbles up through the parent group, the inner Frame, and the Section bounds. Size the row to the actual card count instead:

```js
const cols = Math.min(cardCount, MAX_COLS);
const width = cols * CARD_WIDTH + Math.max(0, cols - 1) * GAP_CARD;
row.resize(width, 1);
```

A 1-card section becomes 320 wide; a 2-card section 672; a 4+-card section 1376 (the wrap-cap). Section bounds shrink in lockstep — a 7-section inventory drops from ~11800px to ~8200px page width, easier to scan in Figma's overview.

## Internal grouping schema (example)

```jsonc
{
  "Atoms": {
    "components": [],
    "children": {
      "Buttons": {
        "components": [
          {
            "id": "1:23",
            "name": "Atoms/Buttons/Primary",
            "leaf": "Primary",
            "type": "COMPONENT_SET",
            "description": "Primary CTA. Use once per screen.",
            "documentationLinks": ["https://docs.example.com/button"],
            "defaultVariantId": "1:24",
            "properties": [
              { "key": "Size",    "type": "VARIANT", "defaultValue": "md",      "variantOptions": ["sm","md","lg"] },
              { "key": "State",   "type": "VARIANT", "defaultValue": "default", "variantOptions": ["default","hover","focus","disabled"] },
              { "key": "HasIcon", "type": "BOOLEAN", "defaultValue": false },
              { "key": "Label",   "type": "TEXT",    "defaultValue": "Button" }
            ],
            "status": "ready",
            "contextualBg": "light",
            "size": { "width": 120, "height": 40 }
          }
        ],
        "children": {}
      },
      "Inputs": { "components": [/* … */], "children": {} }
    }
  },
  "Molecules": {
    "components": [],
    "children": { "Cards": { "components": [/* … */], "children": {} } }
  },
  "_skipped": [
    { "id": "1:99", "name": "_internal/scratch", "reason": "private prefix" }
  ]
}
```

## Batching contract — hard rules

1. **One Section per `figma_execute` call.** Never bundle multiple Sections into one payload.
2. **Within a call, chunk components in groups of 25.** After each chunk: `await new Promise(r => setTimeout(r, 0))`.
3. **If a single Section has more than 150 components**, split it. First call creates the inner Frame + first 150 cards; follow-up calls receive `innerId` and append the remaining ranges.
4. **Discovery is light.** Phase 1 returns only `{id, name, type}`. Heavy metadata extraction happens inside Phase 4 when the node is already in scope — keeps the discovery payload under the figma_execute size cap.
5. **Cache `contextualBg` to shared plugin data** so re-runs skip recompute.
6. **Use `findAllAsync`, not `findAll`**, for the root scan (matches `audit-verify-queries.md:145`).
7. **Set `figma.skipInvisibleInstanceChildren = true`** before scanning — large libraries with many hidden instance children otherwise pay a real cost.
8. **Do not use `figma_batch_*` here.** Those tools are for variables, not nodes. Card creation goes through plain `figma_execute` calls each containing one Section's worth of Plugin API code.

## Scope reminders

- Plugin API mechanics (`componentPropertyDefinitions`, `loadAllPagesAsync`, `findAllAsync`, `createInstance`, `defaultVariant`, plugin data) are covered here because the SKILL otherwise leaves them out — see SKILL.md line 33.
- Sections live on the page only; cards sit inside Frames inside Sections (`naming-and-file-structure.md:88–107`).
- Slash naming drives categorization (`naming-and-file-structure.md:5–47`); the inventory does not invent its own taxonomy.
- Status uses `devStatus = READY_FOR_DEV` as one of the three sources (`build-workflow.md:198`).
