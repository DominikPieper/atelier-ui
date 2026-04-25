# figma-console-mcp tool map

A purpose-organized view of the figma-console-mcp tool surface, with the rule of thumb for when to reach for each one. Source: [southleft/figma-console-mcp](https://github.com/southleft/figma-console-mcp).

> **Mode awareness.** Write tools (anything that creates or mutates Figma content) only work in **Local Mode** (NPX or Local Git installation) with the **Desktop Bridge plugin** running in Figma Desktop. Remote SSE is read-only and exposes ~21 tools. If a write tool returns "not available" or similar, the user is on Remote SSE and must switch to Local Mode for build operations. Audits work in either mode.

## Read & extract — always available

Use these for **discovery** (before any build) and as **inputs to audits**.

| Tool                          | Use when…                                                                                  |
|-------------------------------|--------------------------------------------------------------------------------------------|
| `figma_get_status`            | Sanity check — is the bridge connected, which transport, which file?                       |
| `figma_get_file_data`         | Top-level structure of the file: pages, frames, components, hierarchy. Big payload — use early. |
| `figma_get_file_for_plugin`   | Same data, optimized for plugin-side processing. Prefer when feeding into `figma_execute`. |
| `figma_get_variables`         | Extract all Variables and Collections, including Modes. Works without Enterprise via the Desktop Bridge — that's the main reason this MCP exists. |
| `figma_get_styles`            | Color, text, and effect Styles (the legacy layer — most modern setups should be on Variables). |
| `figma_get_component`         | One component's data. Two output shapes: `metadata` (descriptive) or `reconstruction` (programmatic spec for re-creating it). |
| `figma_get_component_for_development` | Component data + rendered image, for handoff or visual diff. |
| `figma_get_component_image`   | Just the image. Cheap. Useful for spot-checks during a build.                              |
| `figma_take_screenshot`       | Full canvas screenshot. The standard validation step after every meaningful write.         |

**Discovery pattern.** Before a build, this is the typical order: `figma_get_status` → `figma_get_file_data` → (if Variables matter) `figma_get_variables` → (if components matter) `figma_get_component` on the relevant ones.

## Create & manage Variables / Tokens — Local Mode only

Variable management is the most common write workflow. Always check existing Collections via `figma_get_variables` before creating.

| Tool                                  | Use when…                                                                |
|---------------------------------------|--------------------------------------------------------------------------|
| `figma_setup_design_tokens`           | **Bootstrapping a new token system from scratch** — creates collection + modes + variables in one atomic call. By far the fastest path for a green-field design system. |
| `figma_create_variable_collection`    | Adding a single new Collection to an existing setup (e.g. introducing a `Layout` collection alongside `Color`). |
| `figma_create_variable`               | One-off variable. Avoid in loops — use `figma_batch_create_variables` instead. |
| `figma_batch_create_variables`        | Up to 100 variables in one call. **10–50× faster than looping.** Use whenever creating ≥3 variables. |
| `figma_update_variable`               | Change a variable's value in a specific mode.                            |
| `figma_batch_update_variables`        | Up to 100 value updates in one call. Use for theme migrations, semantic re-aliasing, etc. |
| `figma_rename_variable`               | Rename while preserving aliases and usages. Safer than delete + recreate. |
| `figma_delete_variable`               | Remove a single variable. Surfaces in the file as broken aliases — confirm with the user first. |
| `figma_delete_variable_collection`    | Removes the collection AND all its variables. **Destructive — confirm explicitly.** |
| `figma_add_mode`                      | Add a Mode to an existing collection (e.g. "Dark", "Mobile", "Brand-B"). |
| `figma_rename_mode`                   | Renames preserve all variable values in that mode.                       |

**Important — Variable Scopes.** None of these tools expose Scopes directly through their named API. Scopes (`FRAME_FILL`, `TEXT_FILL`, `GAP`, `STROKE_COLOR`, `WIDTH_HEIGHT`, etc.) are set via `figma_execute` running Plugin API code on the variable after creation. Default `ALL_SCOPES` makes Variables show up in every property picker, which destroys the user experience. See `token-architecture.md` for the scope-by-purpose table.

## Create & manage Components — Local Mode only

Components and frames are created via the general-purpose `figma_execute`. There are a few specialized helpers for common patterns.

| Tool                          | Use when…                                                                          |
|-------------------------------|------------------------------------------------------------------------------------|
| `figma_execute`               | The power tool. Any Plugin API JS — create frames, components, set Auto Layout, bind variables, set Variant Properties. Most component work goes through this. |
| `figma_arrange_component_set` | Take a flat group of variant frames and arrange them into a proper Component Set with the native purple dashed border, row labels, and column headers. **Always use this instead of trying to draw the container manually in `figma_execute`.** Triggers on phrases like "arrange these variants" or "organize as component set". |
| `figma_set_description`       | Set markdown-formatted descriptions on Components, Component Sets, and Styles. Surfaces in the asset panel tooltip and in Dev Mode. **Set this for every component you create** — undocumented components are invisible. |

**Pattern: build → arrange → describe.** Build the variant frames with `figma_execute`, arrange them into a Component Set with `figma_arrange_component_set`, then attach a description with `figma_set_description`. Skipping any of the three leaves the component half-finished.

## Validate — both modes

| Tool                          | Use when…                                                                          |
|-------------------------------|------------------------------------------------------------------------------------|
| `figma_take_screenshot`       | After every meaningful write. Look for: cropped text, overlapping elements, placeholder text ("Heading", "Button" still visible), wrong color due to a bad variable alias. |
| `figma_check_design_parity`   | Compare a Figma component's spec against a code implementation. Returns a scored diff report. Most useful at the end of a build to confirm Figma matches what engineering already has. |
| `figma_generate_component_doc`| Generate platform-agnostic Markdown documentation by merging Figma data with code-side info. Good handoff artifact after a build. |

## Console & debugging — out of scope for this skill

`figma_get_console_logs`, `figma_watch_console`, `figma_clear_console`, `figma_reload_plugin` exist for debugging Figma plugins. Not relevant to workspace architecture. Mention them only if the user is actually plugin-debugging.

## MCP Apps — interactive UI

When the client supports the MCP Apps protocol extension and `ENABLE_MCP_APPS=true` is set, two interactive panels are available:

- **Token Browser** — interactively browse, filter, and inspect Variables across modes. Useful as a "show me my tokens" view rather than dumping JSON into chat.
- **Design System Dashboard** — Lighthouse-style audit across six categories with severity-tagged findings. **Always run this first in Audit mode** before doing the architectural deep-audit; it covers breadth (especially A11y and Coverage) that this skill intentionally does not duplicate.

## Decision shortcuts

- **About to create ≥3 variables in a loop?** Use `figma_batch_create_variables` instead.
- **Setting up a token system from scratch?** Use `figma_setup_design_tokens` — one atomic call beats four.
- **Built variant frames, want them as a component set?** Always `figma_arrange_component_set`, never hand-drawn containers.
- **Just created a component?** Don't return until `figma_set_description` has run.
- **About to call a destructive tool (`figma_delete_*`)?** Confirm with the user in chat first, even if they previously implied permission.

## Example payloads

Working snippets for the most common build operations. Treat them as starting points — adapt the names, modes, and scopes to the file at hand.

### Bootstrap a 3-tier token system in one call

`figma_setup_design_tokens` is the fastest way to greenfield a real token architecture. The payload below sets up a `UI Tokens` collection with `Light` / `Dark` modes, a primitive primary palette, and semantic aliases that resolve through to those primitives. Variant Scopes are restricted to the slots each token actually belongs in.

```json
{
  "collectionName": "UI Tokens",
  "modes": ["Light", "Dark"],
  "variables": [
    {
      "name": "primitive/teal/600",
      "type": "COLOR",
      "scopes": ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"],
      "valuesByMode": { "Light": "#007070", "Dark": "#0a8080" }
    },
    {
      "name": "primitive/teal/700",
      "type": "COLOR",
      "scopes": ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"],
      "valuesByMode": { "Light": "#005858", "Dark": "#0a6868" }
    },
    {
      "name": "color/primary",
      "type": "COLOR",
      "scopes": ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR"],
      "valuesByMode": { "Light": { "alias": "primitive/teal/600" }, "Dark": { "alias": "primitive/teal/600" } }
    },
    {
      "name": "color/primary-hover",
      "type": "COLOR",
      "scopes": ["FRAME_FILL", "SHAPE_FILL", "STROKE_COLOR"],
      "valuesByMode": { "Light": { "alias": "primitive/teal/700" }, "Dark": { "alias": "primitive/teal/700" } }
    },
    {
      "name": "spacing/4",
      "type": "FLOAT",
      "scopes": ["GAP", "WIDTH_HEIGHT"],
      "valuesByMode": { "Light": 16, "Dark": 16 }
    }
  ]
}
```

Pattern notes:
- **Primitives** (`primitive/*`) carry the actual hex / number; their scopes are the most permissive valid set.
- **Semantic** tokens (`color/primary`, `color/primary-hover`) alias primitives via `{ "alias": "primitive/..." }`. Their scopes are tighter — semantic colors should not appear in spacing pickers.
- **Modes** carry theming. Each Variable has a value (or alias) per mode.
- **Spacing tokens** are `FLOAT`, not `COLOR`. Don't mix them in one collection unless the system genuinely treats them uniformly.

### Set Variable Scopes after creation (`figma_execute`)

`figma_setup_design_tokens` accepts `scopes` directly, but `figma_create_variable` and the batch flavors do not. Restrict scopes after creation via Plugin API:

```js
// figma_execute payload
const variable = await figma.variables.getVariableByIdAsync('VariableID:1234:5');
variable.scopes = ['FRAME_FILL', 'SHAPE_FILL', 'STROKE_COLOR'];
return { id: variable.id, scopes: variable.scopes };
```

`ALL_FILLS` is mutually exclusive with the specific fill scopes — pick one set or the other, not both.

### Create a single-variant Component with a primary fill bound to a Variable

The `build → arrange → describe` pattern in code. Three calls; `figma_execute` for the geometry, `figma_arrange_component_set` for the container, `figma_set_description` for discoverability.

```js
// figma_execute — build the variant frame
await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });

const frame = figma.createFrame();
frame.name = 'variant=primary, size=md';
frame.layoutMode = 'HORIZONTAL';
frame.primaryAxisAlignItems = 'CENTER';
frame.counterAxisAlignItems = 'CENTER';
frame.paddingLeft = frame.paddingRight = 16;
frame.paddingTop = frame.paddingBottom = 8;
frame.itemSpacing = 8;
frame.cornerRadius = 8;
frame.layoutSizingHorizontal = 'HUG';
frame.layoutSizingVertical = 'HUG';

// Bind fill to the semantic Variable
const primary = await figma.variables.getVariableByIdAsync('VariableID:1234:5');
const fill = { type: 'SOLID', color: { r: 0, g: 0.44, b: 0.44 } };
frame.fills = [figma.variables.setBoundVariableForPaint(fill, 'color', primary)];

// Label
const label = figma.createText();
label.fontName = { family: 'Inter', style: 'Medium' };
label.characters = 'Button';
label.fontSize = 14;
label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
frame.appendChild(label);

// Promote to a component
const component = figma.createComponentFromNode(frame);
return { id: component.id, name: component.name };
```

Then call `figma_arrange_component_set` with the array of component IDs (one per variant) to wrap them in the proper Component Set frame, and `figma_set_description` to attach markdown documentation.

### Add a new Mode to an existing collection

```js
// figma_execute — add a "Compact" density mode and seed its values
const collection = await figma.variables.getVariableCollectionByIdAsync('VariableCollectionId:1234:0');
const newModeId = collection.addMode('Compact');

// Seed the spacing/4 Variable in the new mode (smaller value for compact density)
const spacing4 = await figma.variables.getVariableByIdAsync('VariableID:1234:7');
spacing4.setValueForMode(newModeId, 12);

return { newModeId, modes: collection.modes.map(m => m.name) };
```

Modes scale linearly per Variable — adding a mode is cheap, but you now have **N × M** values to maintain. Audit for "hidden" Variables that fall back to default and check the user actually wants that.

### Validation pattern after any meaningful write

```js
// Right after a build, screenshot the Components page bounding box
const node = await figma.getNodeByIdAsync('123:456');           // the parent section / page
const settings = { format: 'PNG', constraint: { type: 'SCALE', value: 1 } };
const bytes = await node.exportAsync(settings);
return { bytes: bytes.length };  // confirm it rendered before pulling the image via figma_take_screenshot
```

Use `figma_take_screenshot` directly when the goal is to look at the result; use the snippet above when the goal is purely to confirm the node is renderable (catches "0×0 frame" bugs cheaply).
