---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0063-the-layer-name-is-the-selector.md (the convention this extends)
  - plan/adr/0076-the-padding-nobody-compared.md (the block that led here)
  - plan/adr/0070-the-catalogue-is-generated.md (the "derive, do not maintain" rule reused)
---

# ADR-0077: An unresolved layer is an unchecked layer

## Status

Accepted. Adds two mechanical selector shapes and a state-class cascade to
`[LAYER-PAINT]`, which switched on comparisons for layers that had never been checked at
all, and corrects AtlToggle, AtlCombobox and AtlDrawer.

## Context

Eleven masters sat outside the `ROOT_PAINT` table by design: their paint sits on an inner
box — the field, the track, a cell, a page button — while the Figma root is a transparent
container. The recorded plan was "a per-LAYER map".

The premise turned out to be wrong in two ways, and both were found by reading rather than
building.

**First, `[LAYER-PAINT]` already compared the box.** Not just fill, radius and stroke:
`min-height`, `height`, all four padding sides, `gap`, `font-size` and `line-height`, with
a tolerance for ADR-0041's derived padding against ADR-0048's centred box. A first version
of this decision added a redundant `[LAYER-BOX]` comparison, written after reading the
first forty lines of a four-hundred-line function and generalising. It was removed.
**Reading a sample of a function and concluding what it does not do is the same mistake as
treating an absent value as a compatible one.**

**Second, the real defect was resolution, not comparison.** ADR-0063's convention is "the
layer name IS the selector", and `[LAYER-PAINT]` resolved a layer named `track` to `.track`.
But the CSS writes `.atl-toggle .track`, and the combobox writes `.atl-combobox-input` for a
layer named `input`. When no rule matched, the check did `continue` — so those layers were
not *partly* checked, they were **not checked at all**: fill, radius, stroke, box, nothing.

## Decision

**1. Two mechanical shapes, derived rather than tabled.** For a layer named `x` under a
master whose root selector is `R`, try `.x`, then `R .x`, then `R-x`. Both extra shapes are
mechanical, and a hand-maintained alias table would need an entry per layer per master —
the kind of hand-written fact about a generated thing that has rotted four times in this
repo (ADR-0059, ADR-0064, ADR-0070, ADR-0072). `LAYER_ALIASES` stays for genuine
exceptions.

Adding the rule produced **13 blockers immediately**, on layers with no prior coverage:

- **AtlToggle** — the track painted `color/border` with no border where the CSS says
  `color/input-bg` with a 1px `color/border-strong`; the thumb painted `color/surface` at
  20px where the CSS says `color/border-strong` at 18px.
- **AtlCombobox** — the field painted `color/surface-sunken` / `radius/sm` /
  `color/border`, against `color/input-bg` / `radius/md` / `color/input-border`; no
  `min-height` against a stated 40px; padding 0/12/0/12 against 9/56/9/16.
- **AtlDrawer** — a mis-resolution, below.

**2. A rule that exists can still be the wrong element.** The drawer's layer was named
`panel`, and `.atl-drawer-host .panel` really exists — the inner flex wrapper, which paints
nothing. The layer carrying `surface` + `shadow-xl` is the `<dialog>`. So the resolution
matched a real rule about a different element. The layer is renamed `dialog` and aliased to
`.atl-drawer-host dialog`, because an element selector is not mechanically derivable. **The
guard against this class is that a mechanical shape is a guess until the paint agrees with
it.**

**3. State-like axes were compared against base rules — ten masters, silently.** The
cascade builder knew `.variant-*` and nothing else. But ten masters carry a state-like axis
that is not called `state`: `selection`, `expanded`, `current`, `selected`,
`sortDirection`. Their CSS lives in an `.is-*` class, so every one of those variants was
judged against the component's **base** rule. AtlToggle's checked track was reported wrong
for exactly that reason while Figma was right.

The mapping is mechanical, so it is derived: `expanded=true` → `.is-expanded` (a boolean
axis names the state), `selection=checked` → `.is-checked` (an enum axis's value names it).
A candidate no rule matches is not added, so a value without a state class correctly falls
through to the base.

**4. AtlToggle's axis values were the outlier, and renaming them was the fix.**
`selection=off|on` could not derive `.is-checked`. AtlCheckbox and AtlRadio already said
`unchecked|checked`, and so does the CSS class — so the toggle was renamed to match rather
than given a special case in the resolver. Three of the four form toggles now agree, and
the resolver needs no table.

## Consequences

- `check:figma` exits 0 with 14 warnings (8 `[ROOT-PAINT]` pseudo-class variants, 6
  `[ROOT-BOX]` derived paddings). `check:all` exits 0; `nx run-many test lint` over
  angular/react/vue/spec exits 0.
- **Fail-tested where it matters.** Setting the checked track's stroke to
  `color/border-strong` is now reported as wrong because `.is-checked` says
  `color/primary` — the exact value that would have been *accepted* before, since it is the
  base rule's.
- **The states the gate skips are the states I nearly got wrong.** `[LAYER-PAINT]` skips
  variants whose `state` axis is not `default`, so nothing would have told me that setting
  the hover and focus tracks to `border-strong` was wrong: both CSS state rules say
  `border-color: primary`. Caught by reading the rules, not by the gate.
- One exemption added with its arithmetic stated: AtlCombobox's field padding is
  `9px 56px 9px 16px`, and only 16px has a token — 9px is ADR-0041's derivation and 56px is
  the inline padding plus room for the chevron and clear buttons. `[TOKEN]` would otherwise
  demand a binding that cannot exist; the values are still compared by `[LAYER-PAINT]`.
- The catalogue was re-synced for the renamed toggle instance, and its second run reported
  0 updated.
- **Eleven masters are no longer a category.** What kept them outside the gate was never a
  missing map — it was two selector shapes and a state class. The remaining genuinely
  unreachable cases are AtlProgress's track and fill, AtlRadio's circle and dot and
  AtlMenuSeparator's rule, which are `layoutMode: NONE` rectangles with no padding to
  compare (their paint *is* checked), and AtlChat, whose layers are an illustrative app
  mockup rather than the component.
