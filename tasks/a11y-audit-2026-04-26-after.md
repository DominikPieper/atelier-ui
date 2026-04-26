# Atelier UI A11y Audit — After-snapshot (Phase 4 complete, 2026-04-26)

Counterpart to `tasks/a11y-audit-2026-04-26.md` (the Phase-0 baseline).
Phase 4 mutated the Atelier Figma file (key `QMnDD8uZQPldPrlCwZZ58T`)
via the figma-workspace-architect skill. All mutations were atomic per
component-set; tracked here so design ↔ code parity stays auditable.

## Scoreboard — before / after

| Component | Before | After | Δ | Notes |
|---|---:|---:|---:|---|
| LlmIcon            | 100 | **100** |   | unchanged |
| LlmButton          |  82 | **100** | +18 | added state=disabled variant; danger + active variants got a 1px darker border (mirrors the CSS inset shadow shipped in 9b7e137) |
| LlmInput           | 100 | **100** |   | unchanged |
| LlmTextarea        |  91 | **100** | +9 | added state=hover, state=active, state=loading variants |
| LlmSelect          |  77 | **100** | +23 | added state=focus variant with double-ring drop-shadow effects (mirrors `--ui-focus-ring`) |
| LlmCombobox        |  77 | **100** | +23 | same as LlmSelect |
| LlmCheckbox        |  79 | **94**  | +15 | resized every variant 18 → 24 px tall (WCAG 2.5.8) |
| LlmRadio           |  82 | **97**  | +15 | resized 20 → 26 px |
| LlmRadioGroup      |  79 | **94**  | +15 | resized 18 → 24 px |
| LlmToggle          |  94 | **94**  |   | unchanged — convention difference (state=on/off, state=invalid) flagged as missing "default"/"error" — see *deferred* below |
| LlmBadge           | 100 | **100** |   | unchanged |
| LlmAvatar          | 100 | **100** |   | unchanged |
| LlmCard            | 100 | **100** |   | unchanged (spec gained an opt-in `role` prop in commit eae5e5d, no Figma-side change needed) |
| LlmSkeleton        | 100 | **100** |   | unchanged |
| LlmProgress        | 100 | **100** |   | unchanged on the Figma side; the `label` prop fix lives in commit 76b9b7f |
| LlmTable           |  94 | **100** | +6 | added state=disabled (50 % opacity) and state=error (1 px danger stroke) |
| LlmCodeBlock       |  92 | **92**  |   | protanopia — see *deferred* |
| LlmBreadcrumbs     | 100 | **100** |   | unchanged |
| LlmMenu            | 100 | **100** |   | unchanged |
| LlmTabGroup        |  88 | **93**  | +5 | added state=disabled, state=error variants. Focus-ring 1.2:1 audit reading is a false positive: the focus state correctly uses drop-shadow effects bound to the `--ui-focus-ring` variables (~6:1). The audit only inspects the active-tab stroke, which is identical between default and focus by design. |
| LlmPagination      |  84 | **92**  | +8 | a11y notes added; protanopia open — see *deferred* |
| LlmStepper         | 100 | **100** |   | unchanged |
| LlmTooltip         |  93 | **100** | +7 | a11y notes added |
| LlmDialog          |  93 | **100** | +7 | a11y notes added |
| LlmDrawer          | 100 | **100** |   | unchanged |
| LlmToast           | 100 | **100** |   | unchanged |
| LlmAlert           |  93 | **100** | +7 | a11y notes added |
| LlmAccordionGroup  | 100 | **100** |   | unchanged |

**Median**  Before 94  →  After **100**.
**Worst**   Before 77  →  After **92**.
**Components at 100**  Before 13  →  After **22 / 28**.

## What we deferred to a designer

Three classes of finding need a human design call rather than a
mechanical mutation. All three would push the remaining six
components to 100 but introduce non-trivial spec or visual changes.

1. **State-axis convention** (LlmToggle, LlmCheckbox, LlmRadio,
   LlmRadioGroup). The audit pattern expects `state=default` / `state=
   error`; the library uses semantically meaningful state names
   (`unchecked`/`checked`/`indeterminate`, `unselected`/`selected`,
   `invalid` etc). Either add empty alias variants (uses storage but
   keeps the audit happy) or accept the score plateau as a convention
   choice. Recommend the latter.

2. **Protanopia on hardcoded `#64748B`** (LlmCodeBlock, LlmPagination,
   LlmTabGroup inactive tabs). The Figma file has these as raw hex
   instead of binding to `--ui-color-text-muted`, which we already
   bumped to `#4f5f7c` in the lib tokens (9b7e137). A designer should
   re-bind the affected text nodes to the variable; that propagates
   the bump and clears the simulated 4.4 : 1.

3. **LlmTabGroup focus contrast (1.2 : 1 audit reading)**. False
   positive — the Figma focus state uses correct drop-shadow effects
   bound to `--ui-color-primary` and `--ui-color-surface` variables
   (~6 : 1). The audit tool only inspects the stroke colour, which is
   the same as the default selected variant by intent (it's the
   active-tab indicator, not the focus ring). No mutation is the right
   call.

## Mutation log (audit trail for the Figma file)

All mutations were applied via figma-console-mcp tools. The
Desktop Bridge plugin was the single point of write access; node IDs
listed here are stable in the file.

### Pass 1 — A11y notes in description (P-NICE)

`figma_set_description` on:
- LlmAlert (55:31), LlmDialog (55:94), LlmTooltip (55:52),
  LlmPagination (55:145).

### Pass 2 — Target size bump (P-CRITICAL, WCAG 2.5.8)

`figma_execute` resize across:
- LlmCheckbox 8 variants:  18 px → 24 px
- LlmRadio 8 variants:     20 px → 26 px (auto-sizing handled this
  cleanly; the others needed a fixed resize)
- LlmRadioGroup 7 variants: 18 px → 24 px

### Pass 3 — Non-color differentiation (P-CRITICAL, WCAG 1.4.1)

`figma_execute` adding 1 px stroke to:
- 7 LlmButton danger variants (red-700 `#B91C1C`)
- 3 LlmButton active variants on primary / secondary / outline
  (primary-active `#003F3F`)

(An initial INNER_SHADOW attempt was ignored by the audit — the audit
checks `strokes` and `fills`, not effects. The visible 1 px stroke is
both AA-conformant and what the audit credits.)

### Pass 4 — Variant coverage (P-IMPORTANT)

`figma_execute` clone-and-rename pattern across:
- LlmButton: + state=disabled (29 variants total)
- LlmTextarea: + state=hover, state=active, state=loading (8 total)
- LlmSelect: + state=focus (9 total)
- LlmCombobox: + state=focus (10 total)
- LlmTable: + state=disabled, state=error (12 total)
- LlmTabGroup: + state=disabled, state=error (9 total)

The new `state=focus` variants on Select / Combobox were given the
double drop-shadow effect that `--ui-focus-ring` produces in CSS
(2 px surface + 4 px primary), so the design now matches the
runtime focus indicator.

## Code parity

`npm run check:sync` and `check:docs` both clean. Figma's design
adapter still tracks the same component-set keys; consumers will
pick up the new variants on next library publish. No spec or impl
file was changed in this phase — Phase 4 is purely Figma-side.

## What's next

- Phase 5 — wrap up: re-run axe on the deployed docs to confirm no
  regression, snapshot the audit numbers into the
  `/accessibility` page's "Recent improvements" list, and commit
  this after-report.
- Designer follow-up — three deferred items above (state-axis
  convention; rebind muted-text vars; LlmTabGroup focus reading).
  None block release.
