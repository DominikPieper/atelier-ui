---
status: accepted
date: 2026-10-08
sources:
  - libs/styles/src/tokens.css (--ui-color-placeholder, --ui-color-disabled-*)
  - libs/styles/src/button/atl-button.css (.atl-button.is-disabled)
  - libs/spec/src/tokens.manifest.ts (--ui-opacity-disabled, --ui-color-disabled-*)
  - tools/scripts/wcag-contrast.mjs (placeholder and disabled pairs)
  - tools/scripts/gen-figma-library-tokens.mjs (dark-block parse)
  - Figma Inputs/AtlButton (129:20) — `label` text property, `_disabled-overlay` frame
  - .impeccable/critique/2026-10-07T19-11-21Z__docs-src-pages.md (findings 5a/5b)
---

# ADR-0159: A disabled button is not a dimmed one (revises ADR-0061 §4 for the button)

## Status

Accepted. The light placeholder colour is `#566579`. The button's disabled and loading
state uses three new neutral tokens, `--ui-color-disabled-bg`, `-text` and `-border`,
instead of `opacity: var(--ui-opacity-disabled)`. Every other component keeps the opacity
rule. The Figma button master draws the same thing with an opaque overlay and a `label`
text property. Recorded at decision time.

## Context

The docs critique of 2026-10-07 found two library defects while reviewing the docs site.

- **5a.** `--ui-color-placeholder` `#64748b` on the input fill (`surface-sunken`, `#f1f5f9`)
  is 4.34:1, below WCAG AA for text. `check:contrast` passed because its hand-written pair
  list never contained a placeholder pair.
- **5b.** In dark mode a disabled `.atl-button` was the enabled button at 0.65 opacity. A
  disabled primary was still a saturated teal fill at 5.09:1 against the page. It read as
  a slightly quieter enabled button, and loading (which sets `is-disabled`) read the same.

The token manifest said, for `--ui-opacity-disabled`, "apply via opacity on the disabled
element — do not bake into colour tokens". Opacity keeps the hue, and that was the defect.

## Decision

1. **Placeholder `#566579` in light.** 5.43:1 on the resting fill, 5.94:1 on the focus fill
   (`surface`), and 3.00:1 against entered text, so a placeholder still looks like one.
   Rejected: `#5b6b80` (4.97:1, little margin) and `#475569`, which is `text-muted`, and
   would make placeholder and muted copy the same colour. Dark `#94a3b8` already passed.
2. **Dedicated disabled tokens for the button.** From the existing slate scale, no hue:
   light `#e2e8f0` / `#64748b` / `#cbd5e1`, dark `#1e293b` / `#94a3b8` / `#334155`. All four
   variants use them; outline keeps a transparent fill. The danger inset shadow is cleared.
   The spinner draws in `currentColor`, so loading follows. Rejected: lowering the dark
   `--ui-opacity-disabled` globally (about 15 components move, and teal stays teal), and
   adding only a non-colour cue (weakest signal).
3. **The gate learns the pairs.** `check:contrast` gains placeholder on `input-bg` and on
   `input-bg-focus` (4.5:1), disabled label on disabled fill (3:1 legibility floor, since
   WCAG exempts disabled controls), and disabled fill against the enabled `primary` fill.
   That last pair compares two fills that never touch. It stands in for "cannot be
   mistaken for the enabled button". A real adjacency pair, disabled fill on the page,
   is about 1.3:1 by design, and the label and border carry the signal.
4. **Figma draws the same state.** Before this ADR, `_disabled-overlay` was a rectangle in
   `color/surface` at a fixed 0.5 (not bound to `opacity/disabled`), and a Boolean cannot
   recolour the label beneath it. The button master gains a `label` text property, bound
   to the label and to a label inside an opaque `_disabled-overlay` frame in
   `color/disabled-bg` / `-border` / `-text`. Outline's overlay uses its own resting fill.
   The seven instances kept their text as the property's value. Rejected: a
   `state=disabled` variant (12 more variants plus an axis map for a code Boolean), and
   recolouring the translucent overlay (the label shows through, so parity stays only
   approximate).

## Consequences

- The manifest's opacity rule now names the button as the exception and points here.
  ADR-0061 §4 ("all 90 disabled overlays carry the complement of `--ui-opacity-disabled`")
  no longer holds for the button's 24.
- Light disabled buttons change too. They are a flat slate rather than a washed-out
  brand colour, and the label is 3.86:1, close to its floor.
- **The Figma token sync had been writing light values into Dark mode.** The generator
  matched `[data-theme="dark"]`, while `tokens.css` writes single quotes, and a missing
  block parsed as empty and fell back to light without a word. The first sync in this work
  overwrote the Figma Dark mode with light values (77 updates); the fixed generator
  restored it (39 updates back to the CSS values). `parseBlock` now throws on a missing or
  empty block, and `buildDefs` throws if `--ui-color-surface` is equal in both modes.
  `gen-foundations-sheet.mjs` had the same bug and the same fix. No gate compares
  Figma's Dark values with the CSS, which is why this was silent.
- **`check:paint` learns what a Boolean turns on.** Opacity left the computed background
  equal to the enabled fill, so the gate had nothing to compare; the new tokens made 12
  findings (Disabled/Loading × background/border × 3 frameworks) against the master's root
  row. Recording them would have baselined a blind spot. Instead `figma-snapshot.mjs`
  records, per `rootPaint` row, every opaque child at 0,0 at the variant's size whose
  visibility is bound to a Boolean (`booleanCover`), and the gate compares a story that
  switches that Boolean on against the cover's fill and stroke. A code prop that implies a
  Figma Boolean is stated in the contract, not the gate: `button.contract.ts` gains
  `impliesBoolean: loading → disabled`.
- The first capture found opaque covers where none were meant: 14 `_disabled-overlay`
  rectangles on AtlMenuItem, AtlTab, AtlStep, AtlOption and AtlAccordionItem were
  `color/surface` at full opacity on top of the content, so switching `disabled` on erased
  the control. That is ADR-0061 §4's defect, missed there for these five masters. They are
  at 0.5 now, like every other dimming overlay. The capture also picked up the legitimate
  `readonly` surfaces of AtlInput, AtlTextarea and AtlCombobox, which surfaced one
  pre-existing difference: AtlTextarea Readonly on hover renders a transparent border in
  Angular and Vue where Figma and React draw `surface-sunken`. It is recorded in the paint
  baseline, not fixed here.
- Weakest point: the other ~15 components still dim by opacity, and a disabled input in
  dark mode may have the same "reads as enabled" problem. That was not measured here.
