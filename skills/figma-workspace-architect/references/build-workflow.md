# Build workflow

The Build mode loop in detail. Always run all six phases — skipping Discovery is the single most common cause of duplicate or conflicting tokens, and skipping Validate is how silent breakage ships.

> **Local Mode required.** All write operations need NPX or Local Git installation with the Desktop Bridge plugin running. If `figma_get_status` shows the bridge isn't connected, stop and fix that first — never try to "build offline" by emitting code without execution.

## Phase 1 — Discovery

Goal: know what already exists before adding anything.

Always start with:

```
figma_get_status
```

Confirm the bridge is connected and the right file is open.

Then, depending on what you're building:

| Building…                  | Run…                                                                 |
|----------------------------|----------------------------------------------------------------------|
| A token system from scratch| `figma_get_variables` to confirm there's nothing there yet           |
| Adding tokens to existing  | `figma_get_variables` — read every existing collection and mode      |
| A new component            | `figma_search_components` (does it already exist?), then `figma_get_file_data` and `figma_get_component` on related ones |
| An icon set                | `figma_get_file_data` — find the existing Icons page if one exists   |
| Restructuring a library    | `figma_get_design_system_kit` (one-call snapshot) or `figma_get_file_data` + `figma_get_variables` |

**Search-then-instantiate over rebuild.** When the user describes a component that probably exists somewhere, run `figma_search_components` first. If a match comes back, `figma_instantiate_component` it into the target page rather than rebuilding from scratch. Re-creation is the most common cause of duplicate-component drift.

Output a brief inventory back to the user before proceeding: "I see your file has X collections (Y modes total) and Z components organized as ABC. I'm planning to add/change DEF — confirm?"

This isn't bureaucracy — it's the moment to catch "wait, we already have a `Color/Brand` collection, you don't need to make a new one."

## Phase 2 — Decide

Resolve all architectural questions before any write tool runs. Use `decision-heuristics.md` for the recurring forks.

Common decisions in a build:

- **For tokens:** Three-tier (Primitive / Semantic / Component) or two-tier? Modes at which tier? Which scopes per variable type?
- **For components:** Variant property axes — which become Variants, which become Boolean / Instance Swap properties? What's the slot strategy?
- **For naming:** Match an existing codebase convention or introduce one? PascalCase or kebab-case for variable paths?

If a decision genuinely depends on context only the user has, **ask** rather than guess. Reasonable questions to ask up front:

1. "Is there a code-side component library this should match? If yes, share the prop API of the relevant components."
2. "Will this need dark mode? Brand variants? Multi-tenant?"
3. "What's the canonical naming convention for tokens — camelCase, kebab-case, slash-separated?"
4. "Are there token names you've already committed to in code I should mirror?"

Don't ask everything — only what you can't infer.

## Phase 3 — Map tools

Translate the decisions into a tool sequence before running anything. Reference `tool-map.md` for the full menu. The most common builds:

### Build A — Bootstrap a token system

```
1. figma_setup_design_tokens  → creates collection + modes + variables atomically
2. figma_execute              → set scopes on each variable (Plugin API)
3. figma_take_screenshot      → confirm visually
```

`figma_setup_design_tokens` is preferred over orchestrating `figma_create_variable_collection` + `figma_add_mode` + `figma_batch_create_variables` separately — it's atomic, so a partial failure doesn't leave a half-built collection.

### Build B — Add a Mode (e.g. Dark) to existing tokens

```
1. figma_get_variables        → read all current variables and aliases
2. figma_add_mode             → add the new mode to each affected collection
3. figma_batch_update_variables → set values for the new mode
4. figma_take_screenshot      → confirm a sample component switches modes correctly
```

### Build C — Add a new Component

```
1. figma_get_component        → on a similar existing component for reference
2. figma_execute              → create base frame with Auto Layout, fonts loaded
3. figma_execute              → create each variant frame
4. figma_arrange_component_set → arrange variants into a proper Component Set
5. figma_set_description      → markdown description with usage notes
6. figma_take_screenshot      → confirm visually
7. figma_check_design_parity  → if a code implementation already exists
```

### Build D — Refactor naming across a library

This is destructive. Confirm with the user explicitly first.

```
1. figma_get_variables        → full inventory (export to chat for user review)
2. figma_get_file_data        → component inventory
3. figma_rename_variable      → one at a time (preserves aliases — safer than delete + recreate)
4. figma_execute              → component renames via Plugin API node.name = "..."
5. figma_take_screenshot      → spot check
```

## Phase 4 — Execute

Run the writes. Two non-negotiable rules:

1. **Every `figma_execute` payload that creates or mutates nodes must `return` all affected node IDs.** Subsequent calls reference those IDs. The agent only sees what's `return`ed; `console.log` output is invisible. Standard return shape:
   ```js
   return { createdNodeIds: [...], mutatedNodeIds: [...], summary: "..." };
   ```

2. **Work incrementally — small steps, not one giant payload.** A 200-line `figma_execute` script that fails atomically (Figma's `figma_execute` is atomic — failed scripts make no changes) wastes time. Build in chunks: create the structure, validate, then populate.

Common gotchas (general Plugin API knowledge — out of scope here, but the agent must respect them):

- Colors are 0–1 range, not 0–255.
- `await figma.loadFontAsync(...)` before any text mutation.
- `await` every Promise.
- `parent.appendChild(child)` before setting `layoutSizingHorizontal/Vertical = 'FILL'`.
- New top-level frames default to (0,0) — position them away from existing content.
- Page context resets between `figma_execute` calls — use `await figma.setCurrentPageAsync(page)` at the top of each one if needed.

## Phase 5 — Validate

After every meaningful write step, take a screenshot. Don't wait until the end.

```
figma_take_screenshot
```

Look for:

- **Cropped or clipped text** — line heights or fixed sizing cutting off characters.
- **Overlapping elements** — usually means an `appendChild` happened before sizing was set, or an Auto Layout direction was missed.
- **Placeholder text still visible** — "Heading", "Title", "Button" should have been replaced with the real defaults.
- **Wrong colors** — usually a missing or incorrect variable alias. Hover the layer in the screenshot panel and compare to the intended token.
- **Picker pollution** — if an audit follow-up is feasible, sample a property picker via `figma_execute` to confirm scopes are working (a color token shouldn't appear in a spacing picker).

If any issue is found, fix it with a **targeted** `figma_execute` call — don't rebuild from scratch. Atomic-ness is your friend: a small fix script that fails leaves the working state intact.

## Phase 6 — Document

Documentation is part of the build, not a follow-up. A component without a description is invisible to designers in the asset panel.

For every Component and Component Set created:

```
figma_set_description
```

Use markdown. Recommended template:

```markdown
**Purpose.** One-line description of what it's for.

**Props.**
- `Variant` — primary | secondary | ghost
- `Size` — sm | md | lg
- `Disabled` — boolean
- `HasIcon` — boolean

**Use when.** Bullet list of valid use cases.

**Don't use when.** Bullet list of misuses or alternatives.

**Code.** `<Button variant="primary" size="md">` (mirrors the engineering API).
```

Set descriptions on **shared Styles** too if you've created any — Effect Styles especially benefit from documentation.

For Variables, descriptions aren't typically per-variable (it would be too noisy). Instead, ensure the **collection** has a clear name and the variable **path** itself is self-documenting (`color/text/primary` needs no description; `color/c1/v3` needs a lot of explanation, and the right fix is renaming, not describing).

## Phase 7 — Annotate

Component descriptions explain the big picture; **annotations** carry the surgical handoff details that an engineer needs while implementing — and they surface in Dev Mode's Inspect panel, not in the asset panel. Set them after the description is in place.

Run for every non-trivial interactive component:

```
figma_set_annotations
```

Anchor each annotation to the specific node it describes — the focus ring on the focus variant, the loading spinner on the loading variant, the tap-target padding on the surface frame. Examples of annotation content:

- *"Focus ring delivered via drop-shadow (4px primary outer + 2px surface gap), not stroke. Stroke contrast measures ~1.2:1 by design — see `code-verify.md`."*
- *"Tap target extends 8 px past visible border on every side. The visible component is 32 × 32; hit-area is 48 × 48."*
- *"Loading spinner uses `cubic-bezier(0.4, 0, 0.2, 1)` over 1.2 s. Reduce-motion users get a static dot — bound to `feature/reduce-motion`."*

Use `figma_get_annotation_categories` first to learn the categories defined for the file (different teams set different category sets).

When a Component description already says it, don't duplicate in an annotation. Annotations are for things that **only matter at the implementation spot**.

## Phase 8 — Mark Ready for Dev

The final step. Without it, downstream agents and the Dev-Mode UI treat the new content as work-in-progress and skip it.

```js
// figma_execute payload
const node = await figma.getNodeByIdAsync('123:456');   // the Section/Frame/Component just built
node.devStatus = { type: 'READY_FOR_DEV' };
return { id: node.id, devStatus: node.devStatus };
```

What to mark:

- The containing **Section** when an entire grouping is shipped together.
- The **Component** or **Component Set** when shipping individually.
- The **Frame** when shipping a screen or pattern that consumers should treat as canonical.

Don't mark the whole page Ready-for-dev — too coarse. Mark the artifact at the smallest stable scope.

## Optional — Inventory generation (sub-mode)

When the build's deliverable includes a visual catalog of the library — or the user explicitly asks to *generate inventory, build a gallery, library catalog, stickersheet, library overview* — run the Inventory sub-mode after Validate (so the gallery only shows shipped components) and before Document.

The sub-mode is self-contained and lives in `references/inventory-generation.md`. Seven phases: Discover (one read-only call) → Group (pure JS) → Scaffold (one call) → Populate (one call **per top-level Section**, chunked in groups of 25 with `setTimeout(0)` yields) → Card builder (inside Populate) → Mark Ready + TOC (one call) → Validate (one screenshot per Section).

Hard rules — do not bundle multiple Sections into one `figma_execute`. Do not load every component's metadata in Phase 1 (only `id`, `name`, `type`). For Sections with more than 150 components, split across multiple calls passing the same `innerId`. The full batching contract is in `references/inventory-generation.md` § *Batching contract*.

## Pre-publish checklist

Before the user (or the agent) runs Library Publish, confirm:

- [ ] `figma_get_design_changes` shows no broken Variable / Component references introduced during the session.
- [ ] Every new Component has a description (`figma_set_description`) AND annotations on non-obvious spots.
- [ ] Slash naming consistent — Library Swap re-binds **by name match**; one typo desyncs every consumer file.
- [ ] Containing Section/Frame on Ready-for-dev.
- [ ] `figma_audit_design_system` ran at least once and the score was logged for trend tracking.
- [ ] Cover-page changelog entry drafted: what changed, why, who.
- [ ] If on **Branching** (Org/Enterprise), the work happened on a branch — publishing is from main only. Merge before publishing.

## Build summary — what to return to the user

After the loop completes, return a concise summary. Don't bury what was actually done.

Format:

```markdown
## Built

- 1 collection: `Brand Colors` (modes: Light, Dark)
- 24 variables (12 primitive + 12 semantic, all aliased)
- 3 components: `Button/Primary`, `Button/Secondary`, `Button/Ghost`
- 9 variants total (3 components × 3 states)

## Validated

- Screenshots taken: 4 (after token setup, after each component)
- All variables scoped (`FRAME_FILL` / `TEXT_FILL` / `STROKE_COLOR` per type)
- Descriptions set on all 3 components

## Not done

- Code-side mapping beyond naming alignment — figma-console-mcp doesn't implement Code Connect, and this skill explicitly does not recommend the official Figma MCP. Naming alignment is the bridge; if it's tight, code-gen tools infer the rest.
- Patterns / composition examples — recommend a follow-up to add a `Patterns` page.

## Notes

- Renamed `color/c1/v3` → `color/text/primary` during the process; references preserved.
```
