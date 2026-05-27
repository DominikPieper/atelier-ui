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
figma_get_file_data           → file structure, pages, top-level frames; capture `lastModified`
figma_get_variables           → all collections, modes, variables
figma_get_styles              → legacy styles still in use
figma_get_component on samples → spot-check a few representative components
```

If a Design System Dashboard run is available (MCP App), include its overall score and category scores in the audit context.

### Pin the snapshot

Audits go stale fast. Before writing the report, capture two pins so a later reader (including future-you) can tell whether findings still apply:

- **Git SHA** — if there's a paired code repo, run `git rev-parse --short HEAD` in it and put the value into the report's `Generated against` line.
- **Figma `lastModified`** — from `figma_get_file_data`, in the same line.

If either pin moves before someone acts on a finding, that finding needs re-verification, not blind execution.

### Cross-source check (when there's a paired code repo)

Token-architecture findings often look very different once you check the code side. Two cheap, high-signal greps before writing TA, N, or ES findings:

- For each Variable named in a finding (e.g. `color/on-primary`), grep the repo's token CSS / SCSS / TS / JSON for the matching code-side identifier (`--ui-color-on-primary`, `colorOnPrimary`, etc.). A "duplicate Figma variable" with zero code references is a different fix than one with active code usage and *different mode behavior*.
- For each Component-Set Variant Property value (e.g. `variant=outline`), grep for the literal in component source (`variant: 'outline'`, `<LlmButton variant="outline">`). Mismatch is an N1 / ES2 finding even if both sides individually look fine.

Treat the grep result as part of the finding's State block — at minimum a count of matches and one representative path.

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

**Exclude from this check:** `BOOLEAN` variables (typically feature flags like `feature/reduce-motion`). They are never bound into design properties, so `ALL_SCOPES` on them is a no-op, not a finding. Filter `resolvedType === 'BOOLEAN'` out of the count before reporting.

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| All non-BOOLEAN variables default-scoped (`ALL_SCOPES`)              | Critical   | Set scopes per variable purpose. See `token-architecture.md` scope table.                  |
| Color tokens appear in spacing pickers (or vice versa)               | Critical   | Scope mismatch. Re-scope the offending variables.                                          |
| Scopes set deliberately, no cross-contamination                      | (pass)     | —                                                                                          |

### TA5 — Coverage of Variables vs. Styles

Check: is the system on Variables, or still on legacy Styles?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Color and number tokens still on Styles, not migrated to Variables   | Critical   | Migrate. Variables support modes; Styles don't. New work should be Variable-first.         |
| Mixed: some on Styles, some on Variables, no clear policy            | Warning    | Pick one (Variables for color/number/string/boolean; Styles only for text/effect for now). |
| Effect Styles for shadows                                            | (pass)     | Variables don't fully replace effect styles yet — Styles is still the right place.        |

### TA6 — Variable mode count vs. plan tier

Check: how many Modes does each Collection have, relative to the team's plan tier limit (Free=1, Pro=4, Org=10, Enterprise=40)?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Mode count = tier ceiling                                            | Blocker    | Cannot add another mode without paid upgrade or restructure. Lift one axis (e.g. Brand) into a separate library file consuming a shared Foundations library. |
| Mode count = tier ceiling − 1                                        | Warning    | Next axis exhausts the budget. Discuss before agreeing to a new mode.                      |
| Plan tier unknown but designs assume ≥4 modes                        | Suggestion | Confirm tier with the user; default planning assumption is Pro (4).                        |
| Mode count comfortably below ceiling                                 | (pass)     | —                                                                                          |

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

### CD6 — Component description content (intent + use)

Check: do Components have descriptions in the asset panel, *and* do the descriptions tell an agent **when to use** the component, **when not to use** it, and **what it signals** to the user?

A description that only repeats the component's name doesn't fix the underlying drift problem: an agent that picks by shape rather than by intent will misuse a destructive button as a generic secondary, or grab a Toast for a modal flow. The description is what tells the agent *why the component exists*.

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| 0% of components have descriptions                                   | Critical   | Set descriptions for every Component. Bulk operation via `figma_set_description`.          |
| <50% have descriptions                                                | Warning    | Fill gaps; require descriptions for new components going forward.                          |
| Descriptions exist but only restate the component name               | Critical   | Rewrite using the template in `build-workflow.md`. The description must surface intent — without it, an agent picks components by shape, not by purpose, and library-as-source-of-truth slowly erodes. |
| Descriptions list props but no usage guidance                        | Warning    | Add `Use when…`, `Don't use when…`, `Signals…` sentences. Two lines is enough for most components. |
| Descriptions are markdown but inconsistent in shape                  | Suggestion | Adopt one structure across all components: 1-line summary → bullet list of props → `Use when` → `Don't use when` → `Signals`. |
| Non-trivial interactive component has zero **Dev-Mode annotations** on implementation-detail spots (focus-ring delivery, tap-target extension, animation easing, A11y exceptions) | Warning | Add annotations via `figma_set_annotations`. Description = big picture; annotations = surgical implementation details surfaced in Inspect panel. |

### CD7 — Complete interactive-state variant coverage

**Tool:** `figma_analyze_component_set` extracts the variant state-machine + cross-variant diffs + CSS pseudo-class mapping. It's the right tool for this check — it surfaces which states exist, which are missing, and which differ only cosmetically vs. semantically.

Check: does every interactive component cover all the states an agent will need to compose a real screen — **default, hover, focus, disabled, error, loading**?

Gaps in the state matrix force an agent to improvise the missing variant. Improvisation is where drift starts: the agent fills the gap with something that looks plausible, and the library quietly stops being the source of truth.

This check applies to **interactive** components only (Button, Input, Select, Combobox, Checkbox, Radio, Toggle, Tabs, Table-row, Stepper-step, etc.). Pure display components (Badge, Avatar, Skeleton, Card, Alert, Toast) need fewer states — apply judgement.

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| An interactive component has only `state=default`                    | Critical   | Add the missing `state=hover`, `state=focus`, `state=disabled`, `state=error`, `state=loading` variants. Match the visual treatment to the code-side rendering. |
| Interactive component covers some states (e.g. default + disabled) but not all of {hover, focus, error, loading} | Critical   | Fill the gaps. List the missing ones explicitly in the report so the fix is mechanical.   |
| Variant Property uses non-standard names (`state=on/off`, `state=invalid`) for conceptually-equivalent states | Warning    | Rename to the standard vocabulary (`default / hover / focus / disabled / error / loading`). Cuts down on audit-tool false-positives — see false-positives section below. |
| All six states present, named per the standard vocabulary            | (pass)     | —                                                                                          |

Edge cases:
- **Hover** is a no-op on touch devices but still required in Figma — the `state=hover` variant is what agents and code-gen tools read to render the desktop hover.
- **Focus** must be a visible difference, not only a stroke that the audit tool reads as ~1.2:1 (see false-positives below). If focus is delivered via drop-shadow, document that in the description.
- **Loading** is sometimes redundant with a separate `Loading: boolean` Component Property — that's fine if the Boolean is what code uses. Pick one and cross-link in the description.

### CD8 — Token-linked styles (no hardcoded values)

Check: every fill, stroke, text style, spacing, and effect on a Component bound to a Variable — *not* a hardcoded hex / px / number?

Hardcoded values break propagation: a primary-color tweak should ripple through every component that uses `color/primary`. If a component declares `#006470` directly, the propagation stops there and the library drifts every time tokens move. Same for spacing (`16px` vs `space/md`) and typography (a literal font-size vs a `text/body-md` style).

Sample 5–8 representative Components per category. Every node with a fill/stroke/text/spacing/effect must show `boundVariables` on `figma_get_component_for_development_deep` (or the equivalent property in `figma_get_component`).

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Hardcoded fill / stroke colors on a Component (e.g. raw hex on a node, no `boundVariables.fills`) | Critical   | Bind via `figma_set_fills` / `figma_set_strokes` referencing the matching Semantic Variable. Rebuild any node that's still using a legacy Style if the system has migrated to Variables. |
| Hardcoded text properties (font-size / line-height / font-family) where a Text Style or Variable exists | Critical   | Apply the corresponding Text Style. If the team still uses Variables for typography, bind via `boundVariables.textProperties`. |
| Hardcoded spacing on Auto Layout (literal `padding: 16` instead of `padding: {spaceMd}`) | Critical   | Bind padding / itemSpacing to spacing Variables. This is what lets density modes work later. |
| Hardcoded values on *demo* / decoration nodes (placeholder swatches, mock charts, in-component examples) | Warning    | Bind these too if the goal is reusable demo content. Mark the section as decorative if the values are intentionally one-off. |
| Mode-aware Variables used everywhere, no raw values                  | (pass)     | —                                                                                          |

Cross-check signal: if the file declares Light + Dark modes but switching modes produces visible artefacts on a Component (a hardcoded `#fff` showing on a dark surface), that Component is failing CD8 — even if every *other* fill is bound.

### CD9 — Auto Layout adoption

Check: are Component frames built with Auto Layout (`layoutMode: HORIZONTAL` or `VERTICAL`), or are they fixed positions?

Fixed frames produce fixed output. If the agent cannot resize a component to fit its context — a button label that grows to a translated string twice as long, a card stretched to fill a column — it either breaks the component (overflowing children) or skips it and inlines an ad-hoc replacement. Auto Layout is the mechanism that lets components reflow, and reflow is what keeps a library composable.

This check applies to **container** components (Card, Section, ListRow, TableCell, Alert, Dialog/Drawer surfaces) and to interactive components whose internal padding/gap should track typography (Button, Input, Select, Combobox).

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Component root frames have `layoutMode: NONE` (no Auto Layout at all) | Critical   | Convert to Auto Layout. `figma_execute` payload that walks COMPONENT_SET children and sets `layoutMode = 'HORIZONTAL'` (or `'VERTICAL'`) plus appropriate `primaryAxisSizingMode` / `counterAxisSizingMode`. |
| Auto Layout enabled at the root but inner content nodes are absolutely positioned | Critical   | Re-parent inner nodes into Auto Layout sub-frames so they participate in resize.            |
| Auto Layout used but with `*_AXIS_SIZING_MODE: FIXED` in places that should hug content | Warning    | Switch the offending axis to `AUTO`. A common cause of "this card stretches funny when the title is long". |
| Auto Layout throughout, with sensible Hug / Fill choices              | (pass)     | —                                                                                          |

Effort: Auto-Layout retrofits are typically L (multi-day) on existing libraries because every Variant frame needs the conversion. Don't propose this as a same-sprint fix unless the component count is small.

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

### FS4 — Sections vs. Frames misuse

Check: are component-internal layouts built inside Sections instead of Frames?

Sections are organizational only — no Auto Layout, no constraints, no clip, can't nest inside Frames. Frames carry the actual layout primitives. Using a Section as an internal layout container breaks every reflow assumption downstream.

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Component / variant inner content lives inside a Section             | Critical   | Convert to a Frame with `layoutMode: HORIZONTAL` or `VERTICAL`. Sections are for page-level grouping only. |
| Sections used at the page level for grouping (correct)               | (pass)     | —                                                                                          |
| Sections nested inside Frames                                        | Warning    | Inverted hierarchy. Sections cannot live inside Frames; lift them out or replace with a Frame. |

### FS5 — "Ready for dev" coverage

Check: do published components / patterns / sections carry a `devStatus = READY_FOR_DEV` marker?

Without it, downstream Dev-Mode UI and code-gen agents treat the artifact as work-in-progress and skip it. The agent that consumes the library can't tell "draft" from "shipped".

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| 0% of published components / sections marked Ready for dev           | Warning    | Set `devStatus` on each shipped Section / Component via `figma_execute`. See `build-workflow.md` Phase 8. |
| Mixed coverage with no policy                                        | Suggestion | Adopt the rule: any shipped artifact gets the marker before publish.                       |
| Whole pages marked Ready for dev (too coarse)                        | Suggestion | Mark at the Section / Component scope, not the page. Pages are organizational.             |

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

### ES3 — Naming-alignment as the code bridge

This skill explicitly does **not** recommend Figma's official Dev-Mode MCP or Code Connect. The bridge to code in this toolchain is **naming alignment** alone — Component names, Variant Property names/values, and Variable names matching the codebase exactly. When alignment is tight, code-gen tools infer the rest.

Check: is naming alignment hard enough that an agent could map Figma↔code without an explicit Code Connect file?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Components and Variant Properties match code exactly (CD2 + N1 pass) | (pass)     | Naming alignment is the mapping. No further action.                                        |
| Some misalignment in Variant Property values (e.g. `Small` vs `sm`)  | Critical   | Rename in Figma to match code. See CD2.                                                    |
| Component names abbreviated or stylized differently than code         | Critical   | Rename. See N1.                                                                            |
| User asks about Code Connect / Dev-Mode MCP                           | (info)     | Out of scope for this skill. Use figma-console-mcp; rely on naming alignment. Don't pretend the official MCP is being recommended here. |

### ES4 — Documentation handoff

Check: does the library produce useful documentation for engineering?

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| No component docs anywhere                                           | Warning    | Use `figma_generate_component_doc` per component to produce Markdown handoff.             |
| Component descriptions exist in Figma but aren't surfaced elsewhere  | Suggestion | If the team uses zeroheight, Storybook MDX, or similar, mirror descriptions there.        |

### ES5 — Branching workflow (Org / Enterprise)

Check: when migrations are planned on a file with Branching available, do they happen on a branch or directly on main?

Library Publishing only happens from main; landing risky structural changes directly on main means there's no review buffer. Branching is the buffer.

| State                                                                | Severity   | Fix                                                                                        |
|----------------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|
| Recent migrations landed directly on main (Org+ team)                | Warning    | Adopt the migration-playbook branching step. Run additive coordination on a branch, merge, then publish from main. |
| Branching not available (Free / Pro)                                 | (n/a)      | —                                                                                          |
| Branches in use, merged before publish                               | (pass)     | —                                                                                          |

### ES6 — Library analytics review (Enterprise)

Check: is the team correlating component-insertion analytics against the library to spot dead components?

Figma Library Analytics (Enterprise REST API) reports per-component insertion / detachment counts. Components with zero insertions over 90 days are deprecation candidates; high detachment rates are a design-debt signal that the component doesn't fit real use cases.

| State                                                                | Severity    | Fix                                                                                        |
|----------------------------------------------------------------------|-------------|--------------------------------------------------------------------------------------------|
| No regular review (Enterprise team)                                  | Suggestion  | Run `figma_audit_design_system` monthly + pull insertion counts via the REST API. Flag zero-insertion components for deprecation. |
| Regular review in place                                              | (pass)      | —                                                                                          |
| Free / Pro / Org team (no Library Analytics access)                  | (n/a)       | —                                                                                          |

The skill doesn't itself integrate Library Analytics — it only flags this as a process recommendation when the team has the access.

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

## Known audit-tool false-positives

The figma-console-mcp `figma_audit_component_accessibility` tool has a small
set of recurring false-positives. Recognise these patterns instead of
re-flagging items as real issues — they waste designer time and make audit
diffs look noisier than they are.

### Focus indicator delivered via drop-shadow reads as ~1.2:1 stroke contrast

The audit tool measures focus-ring contrast on the *stroke* of the focus
variant. When the design uses a `--ui-focus-ring`-style **drop-shadow**
(double-ring surface gap + primary outer ring), the stroke itself is often
just the component's normal border, which can be ~1.2:1 against the surface.
The actual rendered ring is delivered by the drop-shadow effect at ~6:1+,
which the audit tool doesn't read.

**Action:** if the component has a `state=focus` variant whose focus ring
is implemented as a drop-shadow (not a stroke), tag the finding as
*"audit-tool false positive — drop-shadow delivers ~6:1 actual"* in the
report. Don't fix in Figma; verify in code with `references/code-verify.md`
instead. Common offenders historically: TabGroup, Select, Combobox.

### Variant `state=default` / `state=error` flagged missing when names differ

The audit tool maps interactive-state coverage to a fixed vocabulary
(`default`, `hover`, `focus`, `disabled`, `error`, `active`, `loading`).
Components whose Variants use names like `state=off|on`, `state=disabled-off`,
or `state=invalid` will be reported as missing `default` and/or `error`,
even when the conceptually-equivalent variants exist.

**Action:** check the Variant Property values. If equivalents exist under
different names, tag as *"variant-naming mismatch with audit-tool vocabulary
— equivalent variants exist as `state=<name>`"* and propose a one-time
rename to align with the standard names (this is a Migrate operation,
not a Build one). Common offenders historically: Toggle, Checkbox,
RadioGroup.

### Hardcoded inset shadow on a fill is *not* a stroke fail

Some components use a 1px `inset` shadow inside a fill to deliver
non-color differentiation (WCAG 1.4.1) — for example, a danger button's
silhouette in greyscale/protanopia. The audit tool only reads explicit
strokes and may report "no border" or low contrast on the silhouette.

**Action:** confirm the inset-shadow approach via `figma_get_component`
on a representative variant. If present, tag *"non-color cue delivered
via inset shadow on fill (audit tool reads strokes only)"* and skip.
Common offenders: Button (danger variant), Toast (variant border-left).
