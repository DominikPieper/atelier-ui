---
status: accepted
date: 2026-08-26
sources:
  - tasks/design-findings-2026-08-26.md (Decision A — the size system states heights it does not deliver)
  - "AtlButton.dc.html and AtlInput.dc.html in the Claude Design project *Atelier* — the artboards that surfaced it"
---

# ADR-0041: The control height is the primitive; padding is derived

## Status

Accepted. Applies to AtlButton and AtlInput; the remaining controls follow.

## Context

The library stated control heights and then rendered something else.

`AtlButton.size-md` declared `min-height: 2.5rem` with `padding: 0.5625rem` and
happened to compute exactly 40px. `AtlInput` declared the same `min-height: 2.5rem`
with `padding: 0.625rem` and a prose line-height of 1.5, and computed **46px** —
`box-sizing: border-box` is explicit there, so `min-height` could not shrink it.
`AtlButton.size-lg` declared 48 and computed 48.5.

The consequence was not a rounding curiosity. **An input and a button in the same
form row sat 6px apart, in all three frameworks**, and no gate could see it:
`check:parity` compares against Figma by hand, the a11y baselines do not record
geometry, and nothing else measures a rendered box.

The root cause is which value was treated as authored. Padding was stated and
height was hoped for. Two controls with different line-heights and different
paddings will only share a height by coincidence, and here they did not.

## Decision

**The height is the token. The block padding is derived from it.**

```css
--ui-control-height-sm: 2rem;
--ui-control-height-md: 2.5rem;
--ui-control-height-lg: 3rem;
```

Every control computes its own block padding:

```css
padding-block: calc(
  (var(--ui-control-height-md) - var(--ui-line-height-tight) * var(--ui-font-size-md)) / 2 - 1px
);
min-height: var(--ui-control-height-md);
```

Two further consequences of the same decision:

- **Controls use the control line-height, not the prose one.** `AtlInput` had
  `--ui-line-height-normal` (1.5), which is a reading line-height; a single-line
  field has nothing to read across lines, and that 1.5 is precisely what made it
  6px taller than a button. It now uses `--ui-line-height-tight` (1.25) like every
  other control.
- **The derived padding is fractional** — 6.25px at sm, 11.75px at lg on the
  current type scale. That is correct and deliberate: the *height* is the round
  number a designer reasons about, and the padding is whatever makes it true.
  Stating a round padding is what produced a non-round height.

Verified against the shipped component CSS, not a fixture: buttons compute
exactly 32 / 40 / 48 and the input exactly 40.

Alternatives considered:

- **Keep padding authored, rename the heights as minimums.** Rejected: it is
  honest about the naming and does nothing about the problem. The 6px form-row
  mismatch is the defect, and this option preserves it.
- **Set `height` instead of `min-height`.** Rejected: a button with an unusually
  long label, or one rendered at a larger root font-size, should be allowed to
  grow rather than clip. `min-height` plus derived padding lands on the exact
  height in the normal case and degrades sanely outside it.
- **Match the input's padding to the button's by hand** (9px both). Rejected:
  that is the same coincidence-based approach with better luck. Any later change
  to either control's font-size or line-height breaks it again silently.
- **Do it for all controls at once.** Deferred: select, textarea, combobox and the
  rest follow the same recipe, but each is a rendered-output change that
  re-stales its parity record. Button and input are the two that are drawn and
  where the mismatch was proven.

## Consequences

- **An input and a button of the same size step are now the same height** — the
  first thing anyone building a form notices, and it was wrong until now.
- **The height becomes bindable in Figma.** It was a literal, which was part of
  Decision D in the findings: a rebuilt master cannot bind a Variable to a value
  no token holds. Three of those literals are now tokens.
- **The input's field is visually tighter** — padding 10px → 9px and a shorter
  line box. That is a real rendered change, which is why it lands with the parity
  record re-verified rather than quietly.
- **The relationship is now expressed once per control instead of guessed.** A
  future change to the type scale moves the padding automatically and leaves the
  height alone, which is the direction the dependency should run.
- **Open: the remaining controls still state their padding.** Until they are
  migrated, a select next to an input may still disagree. Tracked in
  `tasks/todo.md`.
- **Open: nothing gates this.** A gate that renders each control and asserts its
  height equals its `--ui-control-height-*` token would catch the whole class.
  That is a real gap — the defect existed for months precisely because no gate
  measures geometry.
