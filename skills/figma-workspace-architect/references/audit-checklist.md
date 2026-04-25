# Audit checklist

The architectural deep-audit. Run this **after** the figma-console-mcp Design System Dashboard MCP App (it covers breadth, including A11y and Coverage). This file covers depth in five categories that the dashboard does not reach.

## Severity definitions

Use these consistently. The audit report priority list ranks findings by severity, then by effort to fix.

| Severity     | Definition                                                                          |
|--------------|-------------------------------------------------------------------------------------|
| **Blocker**  | Breaks the system's ability to function: dark mode is impossible, file won't open, library can't publish. Fix immediately. |
| **Critical** | Causes daily friction or guarantees future rework: wrong scopes, naming mismatches with code, no semantic layer. Fix this sprint. |
| **Warning**  | Adds maintenance debt: loose conventions, missing descriptions, anti-patterns that work but don't scale. Fix when you touch the area. |
| **Suggestion** | Nice-to-have: cosmetic, polish, or "consider this convention". Optional. |

A finding's severity is a function of (a) how much breakage it causes and (b) how hard it is to undo later. Naming mistakes propagate everywhere and are painful to undo — they're usually Critical even if they "work today".

## Inputs

Before running through the categories, gather:

```
figma_get_status              → confirm bridge connected
figma_get_file_data           → file structure, pages, top-level frames
figma_get_variables           → all collections, modes, variables
figma_get_styles              → legacy styles still in use
figma_get_component on samples → spot-check a few representative components
```

If a Design System Dashboard run is available (MCP App), include its overall score and category scores in the audit context.

## Category 1 — Token Architecture

### TA1 — Tier separation

Check: are Primitives, Semantics, and (optionally) Component tokens in **separate Collections**?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| All variables in one collection                                      | Critical   | Split into Primitive + Semantic collections. Move raw values to Primitives, aliases to Semantics. |
| Two collections but mixed: Primitives contain semantics or vice versa| Critical   | Re-classify each variable; raw values to Primitives, purpose-named ones to Semantics.       |
| Three+ collections, cleanly separated                                | (pass)     | —                                                                                          |

### TA2 — Mode placement

Check: where do Modes live?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Modes on the Primitive collection                                    | Critical   | Modes belong on Semantics. Move them. Primitives should be single-mode.                   |
| Modes on Semantic collection (Light/Dark, Brand-A/Brand-B)           | (pass)     | —                                                                                          |
| No modes at all but the product needs theming                        | Blocker (if dark mode is on roadmap), else Warning | Introduce a Light/Dark mode pair on the Semantic collection. |
| Mode names are vague: "Theme 1", "Default"                           | Warning    | Rename to "Light", "Dark", "Brand-A", etc.                                                |

### TA3 — Aliasing

Check: do Semantic variables alias Primitives, or hold raw values?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Semantic variables hold raw hex / numeric values                     | Critical   | Create the missing Primitive, then re-point the Semantic to alias it.                     |
| Alias chains longer than 1 hop (Semantic → Semantic → Primitive)     | Warning    | Collapse: Semantic should alias Primitive directly.                                        |
| Some Semantics alias correctly, others hold values inconsistently    | Critical   | Audit each Semantic variable; alias all of them.                                          |

### TA4 — Variable Scopes

Check: are scopes set per variable, or is everything `ALL_SCOPES`?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| All variables default-scoped (`ALL_SCOPES`)                          | Critical   | Set scopes per variable purpose. See `token-architecture.md` scope table.                  |
| Color tokens appear in spacing pickers (or vice versa)               | Critical   | Scope mismatch. Re-scope the offending variables.                                          |
| Scopes set deliberately, no cross-contamination                      | (pass)     | —                                                                                          |

### TA5 — Coverage of Variables vs. Styles

Check: is the system on Variables, or still on legacy Styles?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Color and number tokens still on Styles, not migrated to Variables   | Critical   | Migrate. Variables support modes; Styles don't. New work should be Variable-first.         |
| Mixed: some on Styles, some on Variables, no clear policy            | Warning    | Pick one (Variables for color/number/string/boolean; Styles only for text/effect for now). |
| Effect Styles for shadows                                            | (pass)     | Variables don't fully replace effect styles yet — Styles is still the right place.        |

## Category 2 — Component Design

### CD1 — Variant axis explosion

Check: any Variant set with > ~30 frames? Identify which axis is over-populated.

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Variant set has 100+ frames                                          | Critical   | One axis should be a Boolean Property or Instance Swap, not a Variant. Identify the axis with the most values that isn't a meaningful enum and convert it. |
| Variant set has 30–100 frames                                        | Warning    | Same as above, less urgent. Consider splitting.                                            |
| Variant set < 30 frames                                              | (pass)     | —                                                                                          |

### CD2 — Variant Property naming vs. code

Check: do Variant Property names and values match the code-side prop API?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Property values use friendly casing (`Small`) where code uses snake (`sm`) | Critical | Rename. The values flow through to code-gen tools verbatim.                              |
| Property names mismatched (`Type` in Figma, `variant` in code)       | Critical   | Rename. `type` is reserved in some frameworks; align to `variant` if that's the code name. |
| Boolean property names with negative phrasing (`NoIcon`)             | Warning    | Flip to positive (`HasIcon`). Boolean defaults read clearer that way.                      |

### CD3 — Show/hide encoded as Variants

Check: any Variant set where two variants differ only by an element being present vs. absent?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Variants `WithIcon` / `NoIcon` with otherwise identical structure    | Warning    | Convert to a Boolean Property `HasIcon`. Halves the variant count, doubles maintainability. |

### CD4 — Icons modeled as Variants

Check: is there a single component named `Icon` with a `Name` Variant Property?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Yes — one Icon component, Name as Variant                             | Critical   | Variant pickers don't show previews. Designers can't browse icons. Convert each to a separate Component. |

### CD5 — Composition / atomic structure

Check: are common pieces (Icon, Avatar, Badge) directly drawn inside other components, or are they instances?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Vector icons drawn directly inside Button frames                     | Warning    | Replace with instances of the Icon library. Update the Button to use Instance Swap if the icon should vary. |
| Same Avatar shape redrawn in three different places                  | Warning    | Extract to an Avatar component, instance it where used.                                    |

### CD6 — Component descriptions

Check: do Components have descriptions in the asset panel?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| 0% of components have descriptions                                   | Critical   | Set descriptions for every Component. Bulk operation via `figma_set_description`.          |
| <50% have descriptions                                                | Warning    | Fill gaps; require descriptions for new components going forward.                          |
| Descriptions exist but aren't markdown / aren't useful (e.g. just the name repeated) | Warning | Rewrite using the template in `build-workflow.md`. Include props, use-when, don't-use-when. |

## Category 3 — Naming

### N1 — Component names match engineering

Check: do Component names match the code-side component names exactly?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Figma `BTN`, code `Button`                                           | Critical   | Rename to match engineering. The code name is canonical.                                  |
| Figma `Primary Button`, code `Button` (with `variant=primary`)       | Critical   | Convert to Variant set: `Button/Primary`, `Button/Secondary`, etc.                         |

### N2 — Variable path conventions

Check: are variable paths consistent across collections?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Mixed casing — `color/Primary`, `color/secondary`                    | Warning    | Pick a casing (typically lowercase-with-hyphens or camelCase). Stick to it.               |
| Inconsistent depth — `color/text/primary` and `space-md`             | Warning    | Apply consistent depth: `space/inline/md` or whatever convention the team picks.          |
| Mixing T-shirt and numeric scales (`size: sm` and `size: 4`)         | Warning    | Pick one. Match what code uses.                                                            |

### N3 — Slash naming for Variants

Check: are component names well-segmented for the picker?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Components named `Button-Primary`, `Button-Secondary` (hyphen, not slash) | Warning | Rename with slashes; this groups them in the asset panel.                                 |
| Variant Property values in the layer name (`Button/Primary` after Variant conversion) | Warning | Once converted, properties live in the panel — remove from layer names.        |

## Category 4 — File Structure

### FS1 — Working designs in the library file

Check: does the library file contain in-progress designs?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Library file has product screens / WIP designs                       | Warning    | Move to a separate working file. Library = published assets only.                          |

### FS2 — Page organization

Check: is each component category on its own page? Is there a Cover page?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Single page named "Page 1" with everything                           | Critical   | Adopt the page layout from `naming-and-file-structure.md`.                                |
| No Cover page                                                        | Suggestion | Add one with library name, version, last-updated.                                          |
| No Tokens / Icons / Patterns reference pages                         | Warning    | Add at least Tokens (visual swatch documentation).                                         |

### FS3 — Sub-components polluting the asset panel

Check: are atomic sub-components (slot placeholders, internal pieces) publishing as if they were user-facing?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| `_Slot/Default` shows up in the asset panel for designers            | Warning    | Confirm the `_` prefix is set; Figma should auto-exclude.                                  |
| Internal helpers (`ButtonContent`, `CardShell`) are publishable      | Warning    | Prefix with `_` or `.` to exclude from publishing.                                         |

## Category 5 — Engineering-Sync Readiness

### ES1 — Token names match codebase

Check: do Variable names match the token names in code?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Figma `color/text/primary`, code `--text-primary-color` (different shape) | Critical | Pick one transformation rule and document it. Or rename one side to match the other. The closer they are, the less drift. |
| Figma uses friendly names, code uses generated short names           | Warning    | If the team has a token-pipeline tool (Tokens Studio, Style Dictionary), confirm the export config produces the codebase names. |

### ES2 — Component prop API matches code

Check: do Variant Property names/values match code prop names/values?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Mismatched (Figma `Size: Small`, code `size: 'sm'`)                  | Critical   | Rename Figma to match code.                                                               |

### ES3 — Code Connect / mapping setup

Check: is there any mechanism mapping Figma components to code components?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| No mapping at all                                                    | Warning    | figma-console-mcp doesn't have a Code Connect feature. Recommend the user set up Code Connect via Figma's official MCP / Dev Mode for code-gen workflows. |
| Naming alignment is so good that code-gen tools can infer the mapping | (pass)    | —                                                                                          |

### ES4 — Documentation handoff

Check: does the library produce useful documentation for engineering?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| No component docs anywhere                                           | Warning    | Use `figma_generate_component_doc` per component to produce Markdown handoff.             |
| Component descriptions exist in Figma but aren't surfaced elsewhere  | Suggestion | If the team uses zeroheight, Storybook MDX, or similar, mirror descriptions there.        |

## Audit run order

1. Run the **Design System Dashboard MCP App** (covers breadth incl. A11y, Coverage).
2. Run the inputs (`figma_get_status`, `figma_get_file_data`, `figma_get_variables`, `figma_get_styles`, sample `figma_get_component`).
3. Walk through Categories 1–5 above. For each finding, record:
   - Category and check ID (e.g. `TA4`).
   - Current state (one line).
   - Severity tag.
   - Fix (one line, actionable).
   - Effort estimate: S (single tool call), M (a few coordinated calls), L (multi-day refactor).
4. Compile the priority list: all Blockers, then all Criticals (sorted by effort, low first), then Warnings, then Suggestions.
5. Output via `assets/audit-report-template.md`.

A good audit produces ~15–40 findings on a real-world library. Fewer than 10 means you skipped categories; more than 60 means you're listing things that should be condensed.
