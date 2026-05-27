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
| `figma_get_design_system_kit` | One-call snapshot of tokens + components + styles + visualSpec. **Prefer this** over orchestrating `figma_get_variables` + `figma_get_styles` + several `figma_get_component` calls when the goal is a complete read of the design system. |
| `figma_get_design_system_summary` | Counts only — components, collections, styles, pages. Cheap pre-flight before deciding which deeper read to run. |
| `figma_get_variables`         | Extract all Variables and Collections, including Modes. Works without Enterprise via the Desktop Bridge — that's the main reason this MCP exists. |
| `figma_get_styles`            | Color, text, and effect Styles (the legacy layer — most modern setups should be on Variables). |
| `figma_get_text_styles`       | Local text styles with IDs, font, size, line-height. Use when audit needs typography coverage and `figma_get_styles` returns the legacy bundle. |
| `figma_get_component`         | One component's data. Two output shapes: `metadata` (descriptive) or `reconstruction` (programmatic spec for re-creating it). |
| `figma_get_component_for_development` | Component data + rendered image, for handoff or visual diff. |
| `figma_get_component_for_development_deep` | Unlimited-depth tree, resolved Variable / token names per node, includes reactions. Use for compound components where the standard depth-limited read drops nested context. |
| `figma_get_component_details` | Full metadata by `componentKey` — variant property definitions, descriptions, instance counts. The right read when you have a key from `figma_search_components` but no node ID. |
| `figma_get_component_image`   | Just the image. Cheap. Useful for spot-checks during a build.                              |
| `figma_get_library_components` | Browse another file's published library. Cross-file discovery — the Tokens-library + Component-library pattern needs this. |
| `figma_search_components`     | Find components by name in current file or a linked library. Discovery before re-creating: search-then-instantiate beats build-from-scratch when the component already exists. |
| `figma_take_screenshot`       | Full canvas screenshot. Standard post-write check — but note it goes through the REST API and **may be cache-stale immediately after a write**. Prefer `figma_capture_screenshot` (Validate section) for the first screenshot after a write. |
| `figma_navigate`              | Move the canvas to a node / page. Use to disambiguate "this component" without asking the user. |
| `figma_get_selection`         | What is currently selected in Figma. Lets the agent act on the user's literal pick instead of guessing. |
| `figma_list_open_files`       | Multi-file workspaces — which Figma files are open in Desktop. Needed before `figma_navigate` across files. |

**Discovery pattern.** Before a build, this is the typical order: `figma_get_status` → `figma_get_file_data` (or `figma_get_design_system_kit` for a one-call full snapshot) → (if Variables matter) `figma_get_variables` → (if components matter) `figma_search_components` then `figma_get_component` on the relevant ones.

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

## Targeted node writes — Local Mode only

These tools mutate one specific property on one node. They are **safer** than `figma_execute` (typed API, validated input) and **faster** to write because there is no Plugin API boilerplate. Reach for them first; reserve `figma_execute` for compound mutations.

| Tool                     | Use when…                                                                  |
|--------------------------|----------------------------------------------------------------------------|
| `figma_clone_node`       | Duplicate a node with all its bindings preserved.                          |
| `figma_create_child`     | Add a child of a known type (FRAME / TEXT / RECTANGLE / etc.) to a parent. |
| `figma_delete_node`      | Remove one node. Confirm with the user if it might be referenced.          |
| `figma_move_node`        | Reposition by `x`/`y` or reparent.                                         |
| `figma_rename_node`      | Single-property rename without writing a Plugin API payload.               |
| `figma_resize_node`      | Set width / height. For Auto-Layout containers this also sets `layoutSizing*`. |
| `figma_set_fills`        | Bind a fill or set a raw paint. Validates the paint shape.                 |
| `figma_set_strokes`      | Same, for strokes.                                                         |
| `figma_set_image_fill`   | Image-fill specifically — wraps the imageHash + scaling-mode dance.        |
| `figma_set_text`         | Replace the characters of a TEXT node. **Note:** for instances, use `figma_set_instance_properties` instead — bare-text edits on instance children fail silently. |

**Rule of thumb.** Single-property mutation → targeted tool. Multiple mutations on the same node, or any composition / branching logic → one `figma_execute` payload. Don't loop targeted tools when the same script could do the work atomically.

## Create & manage Components — Local Mode only

Components and frames are created via the general-purpose `figma_execute`. There are a few specialized helpers for common patterns.

| Tool                          | Use when…                                                                          |
|-------------------------------|------------------------------------------------------------------------------------|
| `figma_execute`               | The power tool. Any Plugin API JS — create frames, components, set Auto Layout, bind variables, set Variant Properties. Most compound component work goes through this. |
| `figma_arrange_component_set` | Take a flat group of variant frames and arrange them into a proper Component Set with the native purple dashed border, row labels, and column headers. **Always use this instead of trying to draw the container manually in `figma_execute`.** Triggers on phrases like "arrange these variants" or "organize as component set". |
| `figma_set_description`       | Set markdown-formatted descriptions on Components, Component Sets, and Styles. Surfaces in the asset panel tooltip and in Dev Mode. **Set this for every component you create** — undocumented components are invisible. |
| `figma_instantiate_component` | Place an instance from a local or library component via `componentKey`. Pair with `figma_search_components` for the discovery → place flow. |
| `figma_set_instance_properties` | Set TEXT / BOOL / INSTANCE_SWAP / VARIANT properties on an instance. Handles the `#nodeId`-suffix that property keys carry. **Use this for text edits on instances** — `figma_set_text` on an instance child fails silently. |
| `figma_add_component_property` | Define a new Component Property (Boolean / Text / Instance Swap) on a Component or Component Set. Typed API; prefer over hand-rolling `componentPropertyDefinitions` in `figma_execute`. |
| `figma_edit_component_property` | Rename or change the default of an existing Component Property. Atomic; preserves bindings. |
| `figma_delete_component_property` | Remove a Component Property. Breaking — confirm with user, follow the migration coordination protocol if instances exist. |

**Pattern: build → arrange → describe → annotate → mark-ready.** Build the variant frames with `figma_execute`, arrange them into a Component Set with `figma_arrange_component_set`, attach a description with `figma_set_description`, attach Dev-Mode annotations with `figma_set_annotations` for non-obvious behavior, then mark the containing Section/Frame Ready-for-dev. Skipping any step leaves the component half-finished. See `build-workflow.md` Phases 6–8.

**Properties: high-level CRUD vs. `figma_execute`.** Prefer `figma_add_component_property` / `figma_edit_component_property` / `figma_delete_component_property` over manipulating `componentPropertyDefinitions` directly. The high-level tools are typed, atomic, and easier to read in chat. Reach for `figma_execute` only when defining a property must happen alongside other mutations in one atomic step (e.g. "add the property AND bind every variant's fill in one go").

**Gotcha: TEXT-property `defaultValue` coercion.** `figma_add_component_property` with `type: 'TEXT'` rejects numeric-looking string defaults — passing `defaultValue: '3'` errors with `Property "node.addComponentProperty.defaultValue" failed validation: Expected one of the following, but none matched: Expected boolean, received number; Expected string, received number; Expected object, received number`. The validator coerces the digit-only string to a number before type-checking. Workaround: define the property via `figma_execute` directly — `node.addComponentProperty('max', 'TEXT', '3')` accepts the string default. Same pattern for any TEXT default that parses cleanly as a number (`'0'`, `'42'`, `'-1'`). Non-numeric strings (`'placeholder'`, `'3 items'`) work fine through the typed CRUD tool.

**Gotcha: Auto-Layout-with-absolute-children inflates the parent.** When retrofitting Auto Layout onto an existing fixed-frame composition (the standard CD9 fix path), the obvious sequence is:

```js
// WRONG order — frame width inflates to sum of children
frame.layoutMode = 'HORIZONTAL';
for (const c of frame.children) c.layoutPositioning = 'ABSOLUTE';
```

Setting `layoutMode = 'HORIZONTAL'` first triggers Auto Layout to flow the children horizontally — frame width grows to `sum(child.width) + spacing`. By the time the loop sets each child to `ABSOLUTE`, the frame has already been resized. A 1080-wide composition with eight children commonly inflates to 6000–10000 pixels wide.

**Correct order — flip absolute first, then enable Auto Layout:**

```js
// Snapshot original positions because flipping ABSOLUTE briefly clears them
const positions = frame.children.map(c => ({ id: c.id, x: c.x, y: c.y }));
frame.layoutMode = 'HORIZONTAL';
for (const c of frame.children) c.layoutPositioning = 'ABSOLUTE';
// Restore positions and explicitly resize the frame back
for (const p of positions) {
  const child = await figma.getNodeByIdAsync(p.id);
  if (child) { child.x = p.x; child.y = p.y; }
}
frame.resize(originalWidth, originalHeight);  // critical — Auto Layout still mutated bounds
```

The frame.resize() at the end is non-optional — even with ABSOLUTE children, the bounds set during the brief Auto-Layout pass persist. If you don't have the original size on hand, you can fall back to `Math.max(maxRight, maxBottom)` over the children, but that misses frames whose visible bounds come from their own fills (Avatar shape, Skeleton placeholder) and not from any child. For those, hardcode the canonical size from the variant name (`size=md` → 40, etc).

This is the most common single source of corrupted bounds when running a CD9 batch fix across a library.

## Validate — both modes

| Tool                          | Use when…                                                                          |
|-------------------------------|------------------------------------------------------------------------------------|
| `figma_capture_screenshot`    | **Plugin-side `exportAsync`** — captures live runtime state. **Prefer this immediately after a write**, because `figma_take_screenshot` (REST) can be cache-stale for several seconds. |
| `figma_take_screenshot`       | REST-API screenshot. Standard validation step at the end of a sequence, when REST cache has caught up. Look for: cropped text, overlapping elements, placeholder text ("Heading", "Button" still visible), wrong color due to a bad variable alias. |
| `figma_audit_design_system`   | Whole-file scorecard across six categories (Naming / Tokens / Components / A11y / Consistency / Coverage). Backs the Design System Dashboard MCP App. |
| `figma_audit_component_accessibility` | Per-component accessibility scorecard with color-blind simulation. Use when the dashboard surfaces a component as A11y-bad and a deeper read is needed. |
| `figma_lint_design`           | Rule-based linter — 14 WCAG + design-system-hygiene + layout rules, AA-tagged. Complementary to the two audit tools above; a finer-grained pass catches things the scorecards roll up. |
| `figma_analyze_component_set` | Variant state-machine + cross-variant diffs + CSS pseudo-class mapping. The right tool for CD7 (interactive-state coverage) audits — surfaces which states exist, which are missing, and where the variant diff is purely cosmetic vs. semantic. |
| `figma_get_design_changes`    | Buffered change-events since the last call (live WebSocket, **not** a historical git-style diff). Useful inside an active Build/Migrate session for "what just moved", and as a Re-verify input within the same session. |
| `figma_check_design_parity`   | Compare a Figma component's spec against a code implementation. Takes a `codeSpec` shaped as `{ visual, spacing, typography, tokens, componentAPI, accessibility, metadata }`; returns `{ score 0–100, discrepancies, actionItems }`. Most useful at the end of a Build or Sync run. |
| `figma_scan_code_accessibility` | Run axe-core against rendered HTML (Figma not required). Pairs with `figma_check_design_parity` via `mapToCodeSpec`; see `code-verify.md` for the round-trip recipe. |
| `figma_generate_component_doc`| Generate platform-agnostic Markdown documentation by merging Figma data with code-side info. Good handoff artifact after a build. |

### Three audit tiers — they don't overlap

- `figma_audit_design_system` = whole-file scorecard. Run first.
- `figma_audit_component_accessibility` = single-component A11y deep-dive with color-blind simulation. Run on flagged components.
- `figma_lint_design` = rule-based linter for WCAG + DS-hygiene + layout. Run for fine-grained findings the scorecards skip.

In Audit mode, run all three. They surface different signals.

## Annotations & Comments

Annotations are first-class **Dev-Mode handoff markers** — anchored to a node, surfaced in the Inspect panel, addressable via API. Comments are file-level discussion threads.

| Tool                                | Use when…                                                                              |
|-------------------------------------|----------------------------------------------------------------------------------------|
| `figma_get_annotations`             | Read designer-authored specs (markdown body + pinned properties). Sync-mode reads these as code-handoff hints. |
| `figma_set_annotations`             | Write annotations after a Build — non-obvious behaviour (focus-ring delivery, animation easing, A11y notes) belongs here, not in the Component description. |
| `figma_get_annotation_categories`   | List the available annotation categories before writing. |
| `figma_get_comments`                | File comment threads. Mostly out of scope, but useful for parity-drift notification. |
| `figma_post_comment`                | Optionally drop a comment on a frame when Sync-mode finds drift the user should see in-Figma. |
| `figma_delete_comment`              | Remove a comment posted earlier in the same workflow. |

**Where annotations belong vs. descriptions.** Component description (`figma_set_description`) explains *what the component is and when to use it*. Annotation explains *the spot-specific implementation note an engineer needs while building*: "focus ring delivered as drop-shadow, not stroke", "this transition uses cubic-bezier(0.4,0,0.2,1)", "tap target extends 8px past the visible edge". One is the big picture; the other is the surgical detail.

## Console & debugging — out of scope for this skill

`figma_get_console_logs`, `figma_watch_console`, `figma_clear_console`, `figma_reload_plugin`, `figma_reconnect` exist for debugging Figma plugins. Not relevant to workspace architecture. Mention them only if the user is actually plugin-debugging.

## FigJam & Slides — out of scope for this skill

The MCP also exposes ~10 `figjam_*` tools for FigJam boards and ~15 `figma_*_slide` / `figma_list_slides` tools for Figma Slides decks. This skill targets **Figma Design files only** — workspaces, libraries, design systems. If the user asks about FigJam-board architecture or Slides decks, say so and decline rather than improvising.

## MCP Apps — interactive UI

When the client supports the MCP Apps protocol extension and `ENABLE_MCP_APPS=true` is set, two interactive panels are available:

- **Token Browser** — interactively browse, filter, and inspect Variables across modes. Useful as a "show me my tokens" view rather than dumping JSON into chat.
- **Design System Dashboard** — Lighthouse-style audit across six categories with severity-tagged findings. **Always run this first in Audit mode** before doing the architectural deep-audit; it covers breadth (especially A11y and Coverage) that this skill intentionally does not duplicate.

## Decision shortcuts

- **About to create ≥3 variables in a loop?** Use `figma_batch_create_variables` instead.
- **Setting up a token system from scratch?** Use `figma_setup_design_tokens` — one atomic call beats four.
- **Built variant frames, want them as a component set?** Always `figma_arrange_component_set`, never hand-drawn containers.
- **Just created a component?** Don't return until `figma_set_description` AND `figma_set_annotations` have run, AND the containing Section/Frame is marked Ready-for-dev.
- **Need to do one rename / one resize / one fill?** Use the targeted node tool. Don't write a `figma_execute` for it.
- **Defining a Component Property?** Reach for `figma_add_component_property` first; only escalate to `figma_execute` if other mutations must happen atomically alongside.
- **First screenshot after a write?** `figma_capture_screenshot` (live), not `figma_take_screenshot` (REST cache).
- **About to call a destructive tool (`figma_delete_*`)?** Confirm with the user in chat first, even if they previously implied permission.
- **Generating a visual inventory / library catalog?** Don't load every component's metadata in one read. Phase 1 returns `{id, name, type}` only; Phase 4 builds cards **one Section per `figma_execute` call**, chunks of 25 with `setTimeout(0)` yields between chunks. Sections beyond ~150 components split across multiple calls. See `inventory-generation.md` § *Batching contract*.

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
