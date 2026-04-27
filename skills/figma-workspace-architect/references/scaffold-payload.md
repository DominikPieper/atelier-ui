# Scaffold sub-mode — one-shot starter file

A sub-mode of Build for the case where the user wants a **lauffähiges Anfangsfile** in one turn, not a guided iterative build. Triggers on phrases like *scaffold, template, starter, quickstart, bootstrap a new file*.

The scaffold produces a **skeleton** — Cover + Tokens + Components pages with placeholder content that the user is expected to replace. It is not a finished design system; it is the structural decision-set, materialized.

## When to use the scaffold sub-mode

✅ Use it when the user says:
- "Set up a new Figma file from scratch"
- "Bootstrap our token system + a starter component"
- "I want a starter / template / scaffold for a new design system"

❌ Don't use it when:
- The user already has a file and wants additions — that's the regular Build loop, with discovery first.
- The user wants a *finished* design system — the scaffold is intentionally placeholder-quality.
- The user has specific brand values to seed — run the regular Build loop and use the user's values; don't paste over them with placeholders.

The trade-off is speed vs. specificity. The scaffold gets to a working file in one turn but bakes generic placeholder values; the regular Build loop produces specific values but takes 4–6 turns of dialogue.

## What the scaffold produces

After running the recipe below, the file contains:

```
Page: Cover
  - Title text + author/date placeholders
  - "Edit this skeleton" callout pointing at the next steps

Page: Tokens
  - Variable Collection: "UI Tokens"
  - Modes: Light, Dark
  - Variables (12 placeholders):
      primitive/teal/600           color, both modes
      primitive/teal/700           color, both modes
      primitive/slate/100          color, both modes
      primitive/slate/700          color, both modes
      color/primary                semantic, alias to primitive/teal/600
      color/primary-hover          semantic, alias to primitive/teal/700
      color/text                   semantic, alias to primitive/slate/700 (Light) / primitive/slate/100 (Dark)
      color/surface                semantic, alias to white (Light) / primitive/slate/700 (Dark)
      color/border                 semantic, alias to primitive/slate/100 (Light) / primitive/slate/700 (Dark)
      spacing/2 / spacing/4 / spacing/6   float, mode-invariant
      radius/md                    float, mode-invariant

Page: Components
  - One Component Set: ExampleButton
    - 3 variants × 2 sizes = 6 frames, arranged with figma_arrange_component_set
    - Fills bound to color/primary; text bound to a constant white for the demo
    - Description on the set: "Replace with your real Button. This is a structural placeholder."
```

Total writes: ~25 Variables, 1 Component Set, 3 page descriptions, 1 set description. ≈10 seconds end-to-end.

## The recipe — three tool calls

### Call 1 — `figma_setup_design_tokens`

Bootstraps the tokens in one atomic operation. Payload:

```json
{
  "collectionName": "UI Tokens",
  "modes": ["Light", "Dark"],
  "variables": [
    { "name": "primitive/teal/600",  "type": "COLOR", "scopes": ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"], "valuesByMode": { "Light": "#007070", "Dark": "#0a8080" } },
    { "name": "primitive/teal/700",  "type": "COLOR", "scopes": ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"], "valuesByMode": { "Light": "#005858", "Dark": "#0a6868" } },
    { "name": "primitive/slate/100", "type": "COLOR", "scopes": ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"], "valuesByMode": { "Light": "#f1f5f9", "Dark": "#334155" } },
    { "name": "primitive/slate/700", "type": "COLOR", "scopes": ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"], "valuesByMode": { "Light": "#334155", "Dark": "#cbd5e1" } },
    { "name": "color/primary",       "type": "COLOR", "scopes": ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR"], "valuesByMode": { "Light": { "alias": "primitive/teal/600" }, "Dark": { "alias": "primitive/teal/600" } } },
    { "name": "color/primary-hover", "type": "COLOR", "scopes": ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR"], "valuesByMode": { "Light": { "alias": "primitive/teal/700" }, "Dark": { "alias": "primitive/teal/700" } } },
    { "name": "color/text",          "type": "COLOR", "scopes": ["TEXT_FILL"],                              "valuesByMode": { "Light": { "alias": "primitive/slate/700" }, "Dark": { "alias": "primitive/slate/100" } } },
    { "name": "color/surface",       "type": "COLOR", "scopes": ["FRAME_FILL", "SHAPE_FILL"],               "valuesByMode": { "Light": "#ffffff", "Dark": { "alias": "primitive/slate/700" } } },
    { "name": "color/border",        "type": "COLOR", "scopes": ["STROKE_COLOR"],                          "valuesByMode": { "Light": { "alias": "primitive/slate/100" }, "Dark": { "alias": "primitive/slate/700" } } },
    { "name": "spacing/2",           "type": "FLOAT", "scopes": ["GAP", "WIDTH_HEIGHT"],                    "valuesByMode": { "Light": 8,  "Dark": 8 } },
    { "name": "spacing/4",           "type": "FLOAT", "scopes": ["GAP", "WIDTH_HEIGHT"],                    "valuesByMode": { "Light": 16, "Dark": 16 } },
    { "name": "spacing/6",           "type": "FLOAT", "scopes": ["GAP", "WIDTH_HEIGHT"],                    "valuesByMode": { "Light": 24, "Dark": 24 } },
    { "name": "radius/md",           "type": "FLOAT", "scopes": ["CORNER_RADIUS"],                          "valuesByMode": { "Light": 8, "Dark": 8 } }
  ]
}
```

Notes about the choices:

- **Two primitives per family** is the minimum that makes the alias layer demonstrate value. A real system has 8–10 stops per family; the scaffold ships 2 to keep the example readable.
- **`color/text` etc. are semantic.** Note the inverted aliasing in Dark mode — same Variable, different alias per mode. This is the canonical Mode pattern; the scaffold demonstrates it intentionally.
- **Scopes are tightened on every semantic.** `color/text` is `TEXT_FILL` only — won't appear in stroke pickers, won't appear in spacing pickers. Default `ALL_SCOPES` is the most-common architectural mistake; the scaffold sets the right example.
- **`spacing/*` and `radius/md` are mode-invariant.** Most spacing systems are. Modes are reserved for theming axes.

### Call 2 — `figma_execute` for pages + example Component

Creates Cover / Tokens / Components pages, builds the example Button variant frames, and binds their fills.

```js
// figma_execute payload
await figma.loadAllPagesAsync();
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });

// 1. Pages — create if not present
function ensurePage(name) {
  let page = figma.root.children.find(p => p.name === name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
  }
  return page;
}
const cover = ensurePage('Cover');
const tokens = ensurePage('Tokens');
const components = ensurePage('Components');

// 2. Cover page — title + edit-me callout
figma.currentPage = cover;
const title = figma.createText();
title.fontName = { family: 'Inter', style: 'Semi Bold' };
title.fontSize = 64;
title.characters = 'Design system — replace this title';
title.x = 80; title.y = 80;
cover.appendChild(title);

const note = figma.createText();
note.fontName = { family: 'Inter', style: 'Medium' };
note.fontSize = 16;
note.characters =
  'This file is a scaffold. Replace the placeholder primary colour, ' +
  'the example Button component, and this title with your real values.';
note.x = 80; note.y = 200;
note.resize(640, note.height);
cover.appendChild(note);

// 3. Components page — build a 3×2 ExampleButton variant grid
figma.currentPage = components;

const primaryVar = figma.variables.getLocalVariables('COLOR')
  .find(v => v.name === 'color/primary');
const primaryHoverVar = figma.variables.getLocalVariables('COLOR')
  .find(v => v.name === 'color/primary-hover');
const radiusVar = figma.variables.getLocalVariables('FLOAT')
  .find(v => v.name === 'radius/md');

const variantConfigs = [
  { variant: 'primary',   size: 'sm', fillVar: primaryVar, padX: 12, padY: 6,  fontSize: 13 },
  { variant: 'primary',   size: 'md', fillVar: primaryVar, padX: 16, padY: 8,  fontSize: 14 },
  { variant: 'secondary', size: 'sm', fillVar: null,       padX: 12, padY: 6,  fontSize: 13 },
  { variant: 'secondary', size: 'md', fillVar: null,       padX: 16, padY: 8,  fontSize: 14 },
  { variant: 'outline',   size: 'sm', fillVar: null,       padX: 12, padY: 6,  fontSize: 13 },
  { variant: 'outline',   size: 'md', fillVar: null,       padX: 16, padY: 8,  fontSize: 14 },
];

const variantNodes = [];
for (const cfg of variantConfigs) {
  const frame = figma.createFrame();
  frame.name = `variant=${cfg.variant}, size=${cfg.size}`;
  frame.layoutMode = 'HORIZONTAL';
  frame.layoutSizingHorizontal = 'HUG';
  frame.layoutSizingVertical = 'HUG';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.paddingLeft = frame.paddingRight = cfg.padX;
  frame.paddingTop  = frame.paddingBottom = cfg.padY;
  frame.itemSpacing = 8;
  frame.cornerRadius = 8;

  // Bind corner radius to radius/md
  if (radiusVar) frame.setBoundVariable('topLeftRadius', radiusVar);

  // Bind fill or stroke per variant
  if (cfg.variant === 'primary' && cfg.fillVar) {
    const fill = { type: 'SOLID', color: { r: 0, g: 0.44, b: 0.44 } };
    frame.fills = [figma.variables.setBoundVariableForPaint(fill, 'color', cfg.fillVar)];
  } else if (cfg.variant === 'secondary') {
    frame.fills = [{ type: 'SOLID', color: { r: 0.27, g: 0.33, b: 0.42 } }];
  } else {
    frame.fills = []; // outlined
    frame.strokes = [{ type: 'SOLID', color: { r: 0, g: 0.44, b: 0.44 } }];
    frame.strokeWeight = 1;
  }

  // Label
  const label = figma.createText();
  label.fontName = { family: 'Inter', style: 'Medium' };
  label.characters = 'Button';
  label.fontSize = cfg.fontSize;
  label.fills = [{
    type: 'SOLID',
    color: cfg.variant === 'outline'
      ? { r: 0, g: 0.44, b: 0.44 }
      : { r: 1, g: 1, b: 1 },
  }];
  frame.appendChild(label);

  // Promote to Component
  const component = figma.createComponentFromNode(frame);
  variantNodes.push(component.id);
}

return { variantNodeIds: variantNodes, coverPageId: cover.id, tokensPageId: tokens.id, componentsPageId: components.id };
```

### Call 3 — `figma_arrange_component_set` + `figma_set_description`

Wrap the variant frames as a proper Component Set, then attach the documentation. Without these, the set looks like a flat group and won't surface in the asset panel correctly.

```
figma_arrange_component_set(componentNodeIds: <variantNodeIds from call 2>)

figma_set_description(
  componentSetId: <returned set ID>,
  description: """
ExampleButton — placeholder

This component is part of the workspace scaffold. Use it as a starting point;
replace its visual design with your actual button. The Variant Property
structure (variant × size) is the recommended shape.

When replacing:
- Keep the Variant Property names (`variant`, `size`).
- Bind the primary fill to `color/primary` (already done).
- Bind the corner radius to `radius/md` (already done).
- Add states (hover / active / disabled) as a third Variant Property called `state`.
"""
)
```

### Call 4 (optional) — Annotations + Ready-for-Dev marker

Make the skeleton **demo-ready** instead of just rendered. One short `figma_set_annotations` call on the `ExampleButton` plus a Ready-for-dev marker on the Components Section turns the scaffold into something the user can immediately hand to engineering for orientation.

```
figma_set_annotations
  nodeId: <ExampleButton component-set ID>
  body: """
Replace this placeholder before publishing. Architectural shape (variant × size) is
intentional; visuals are not. Bind real fills to color/primary; add a `state` Variant
Property covering default / hover / focus / disabled / error / loading.
"""
```

Then mark the Components Section Ready-for-dev so the skeleton announces itself in Dev Mode:

```js
// figma_execute payload — small, atomic
const componentsPage = figma.root.children.find(p => p.name === 'Components');
const section = componentsPage?.children?.find(n => n.type === 'SECTION');
if (section) section.devStatus = { type: 'READY_FOR_DEV' };
return { sectionId: section?.id, devStatus: section?.devStatus };
```

Skip Call 4 when the user only wants the bare-bones rendering. Include it when the next person opening the file should see "this is a scaffold, here's the shape, here's where to start".

## After the scaffold — what the user has to do

Hand back this checklist verbatim:

1. **Replace the primary colour.** Open the Variables panel, find `primitive/teal/600` and `primitive/teal/700`, change the values to your brand palette. The semantic `color/primary` automatically follows the alias.
2. **Add real spacing stops.** The scaffold ships only `spacing/2 / 4 / 6`. Add the rest of your scale (typically `0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24` × 4px = your full system).
3. **Replace the ExampleButton.** It is a placeholder. Use it as a structural template (variant × size), but redraw the visuals to match your actual design.
4. **Add Modes if needed beyond Light / Dark.** Density modes (Comfortable / Compact), brand modes (Brand A / Brand B), or platform modes (Web / iOS / Android) are common.
5. **Set the file's Cover with your real title, owners, and link to your spec / Storybook.**

The scaffold is intentionally sparse — every additional placeholder is a future cleanup task.

## Variations the user might ask for

- **"Make it dark-mode-only."** Drop the `Light` mode entry from the `figma_setup_design_tokens` modes array; everything else stays.
- **"Add a `Brand A / Brand B` mode."** Extend the modes array to `['Light', 'Dark', 'Brand A']`. Note: the agent must seed values for every Variable in the new mode — the alias structure helps because most semantics already track via primitives.
- **"No example component, just tokens."** Skip Call 2's Components-page section and Call 3 entirely.
- **"Use Inter Bold instead of Semi Bold."** Single font change in the loadFontAsync calls and the title.

Decline (politely) if the user asks for the scaffold to ship "their full system, ready to go". The scaffold is a structural decision-set, not a finished system; pretending otherwise wastes both sides' time.

## Validate after the scaffold

1. `figma_take_screenshot` of the Components page bounding box.
2. `figma_get_variables` and confirm 13 Variables exist with correct scopes (semantic ones tightened, primitives broad).
3. Verify `color/primary` aliases through to `primitive/teal/600` in both modes.
4. Switch the file's Mode to Dark and re-screenshot — confirm the example Button changes color (it should, because its fill is bound to `color/primary` which aliases to a primitive that has both mode values).

If the Mode switch doesn't change the color, the alias chain broke and the agent must re-bind. Most-common cause: the alias was set with a string value instead of `{ alias: '...' }`.
