# Sync workflow

Sync mode handles **value drift after one side has moved**. Code-as-truth (token values, dimensions from spec) → push to Figma. Design-as-truth (frame dimensions only) → push to code. Different from Migrate: Migrate plans a coordinated structural change; Sync catches up on existing shape.

> **Bail to Migrate** the moment the diff includes adds / removes / renames rather than value updates only. Sync's batch-and-script approach won't apply the additive coordination protocol that downstream consumers need.

## When to load this file

Load it when the user says any of:

- *"propagate to Figma"*, *"sync the lib tokens"*, *"keep Figma and code in lockstep"*
- *"the code just changed X, update Figma"*
- *"make Figma match the new spec"*

If the user is planning a *structural* change (rename, split, deprecate), use `references/migration-playbook.md` instead.

## The four steps

### 1. Establish direction

Which side is the source of truth for *this* change?

- Token values from CSS / JSON / spec file → **code-as-truth** (most common — design-led shop has the values in Figma; engineering-led shop has them in code).
- Figma frame dimensions → **design-as-truth** (rarer, but real for spec-defined widths/heights).
- Bidirectional → almost never the right answer. Pick one and enforce it.

Get this wrong and you'll overwrite real work on the other side. If the user is unclear, ask.

### 2. Diff

Read the target side and list the deltas. Useful tools:

- `figma_get_variables` — Variable values per Mode.
- `figma_get_file_data` / `figma_get_design_system_kit` — full snapshot in one call.
- `figma_search_components` — locate the components affected.

Classify each delta into one of three buckets:

| Delta type                               | Approach in Sync                              |
|------------------------------------------|-----------------------------------------------|
| Variable value update (one or more modes) | Cheap, batch-able. Group into one call.       |
| Frame dimension change (per-variant)     | Per-variant, scripted. One `figma_execute`.   |
| Structural change (rename, add, remove)  | **Bail out** — switch to Migrate.             |

If any delta is a structural change, stop here and run the migration playbook. Sync continues only if the diff is value-update + dimension-update only.

### 3. Plan

Group similar deltas into the smallest number of atomic calls.

- **Variable updates:** one `figma_batch_update_variables` call per ~50–100 variables. The tool is atomic per call, so 200 updates = 2–4 calls, not 200.
- **Dimension changes:** one `figma_execute` script that walks the variants and resizes them. Returns the per-variant before/after dims for the report. See `references/code-sync.md` for the mass-resize recipe.
- **Annotations sync:** if code-side specs change in ways Figma should reflect (new easing curve, updated A11y note), use `figma_set_annotations` to write them back. Annotations are part of the value-drift surface, not just the structure surface.

Direction-of-truth patterns and code-side exporter integration live in `references/code-sync.md`.

### 4. Execute, then validate

Run the batch + scripts, then re-audit:

- `figma_audit_component_accessibility` on the touched components.
- `figma_audit_design_system` on the file overall — capture the score for the summary.
- `figma_check_design_parity` against a `codeSpec` (schema in `references/code-sync.md`) — closes the loop. If parity score < 100, the discrepancies list is the next work; classify each as Figma-side or code-side fix.

The audit + parity check is the closing-the-loop check. If scores drop after Sync, you have new work — not a finished sync.

### 5. Document

Output a Sync summary (see SKILL.md "Output expectations"). One small table beats prose:

```markdown
| Direction | Count | Detail |
|-----------|-------|--------|
| Variables updated | 47 | 23 in Light, 24 in Dark; 0 broken aliases |
| Frames resized   | 18 | Button (6 variants) + Input (12 variants) |
| Components touched | 4 | Button, IconButton, Input, Select |
| Audit scores     |    | DS 76 → 82 (+6); A11y unchanged at 91 |
| Parity score     |    | 94/100 — 1 typography discrepancy on Input/sm |
| Left undone      |    | Code-side parity for Input/sm font-size — opens new ticket |
```

## When to escalate to Migrate

Stop Sync immediately and switch modes when the diff turns out to include:

- A **rename** on either side (matched-by-name swap will break consumers).
- An **add** or **remove** affecting published library shape.
- A **Variant Property value change** (existing instances reset to default).
- A **Mode rename** (library swap matches modes by exact name).

Migrate's additive coordination protocol exists exactly because batch-update can't safely cover these.

## Common Sync traps

- **Mode-name casing mismatch.** Tokens-library has `Light` / `Dark`; consumer file has `light` / `dark`. Library swap matches by exact name — bindings break silently. Standardize before sync.
- **Hardcoded fallbacks in CSS.** `var(--ui-color-primary, #007070)` — old hex still wins when the Variable is undefined. After Sync, grep for the old hex in code; drop fallbacks or update them.
- **Aliases flattened in export.** Some exporters resolve aliases and emit only the leaf value. Sync the values; verify the exporter still preserves the semantic layer if you need it.
- **Annotations forgotten.** Variable values changed but the implementation note (animation curve, focus-ring delivery) didn't update. Catches up on `figma_set_annotations` are part of Sync, not a follow-up.
