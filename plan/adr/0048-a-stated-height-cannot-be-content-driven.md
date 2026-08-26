---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0041-control-height-is-the-primitive.md
  - plan/adr/0042-a-gate-that-measures-rendered-geometry.md
  - plan/adr/0047-bind-the-literals-that-duplicate-a-token.md (the commit whose CI run found this)
---

# ADR-0048: A stated height cannot be content-driven

## Status

Accepted. AtlSelect, AtlCombobox, AtlTab, AtlMenuItem and AtlCodeBlock's header
state their control line-height and derive their block padding, and
`check:geometry` now perturbs inherited line-heights to prove that no measured box
depends on text metrics.

## Context

ADR-0047's commit went red in CI on a gate that had passed locally:

```
✗ [HEIGHT] react/AtlSelect size=md renders 41px but --ui-control-height-md claims 40px
✗ [HEIGHT] react/AtlCombobox size=md renders 41px but --ui-control-height-md claims 40px
```

Both components used `min-height: var(--ui-control-height-md)` with an authored
`0.625rem` block padding and **no line-height of their own**, so the content box was
whatever the inherited `normal` line-height made it. On a machine with Instrument
Sans installed that lands at 40.4px and reports 40; with the CI runner's fallback
face it lands at 40.7px and reports 41. The components were never deterministic —
they were within a rounding step of correct on one machine.

That is precisely what ADR-0041 was about, and neither component had been
converted: they had simply *happened* to land on the token.

## Decision

**A control that states a height states its line-height too.** Both are needed:
the derived padding computes the block space from `height − line-height × font-size`,
which is only true if the line-height is the one in the formula. AtlSelect and
AtlCombobox now declare `--ui-line-height-tight` and derive their padding, exactly
as AtlInput has since ADR-0041.

**The gate needed a discriminator, and the obvious one does not work.** The first
attempt measured each box twice, once with the shipped stack and once with a font
family that cannot resolve. It found nothing — and a negative test proved why:
reverting AtlSelect to its broken form still passed, because the difference between
two locally available fallback faces is a fraction of a pixel, under the 0.5px
tolerance. A check that cannot detect its own failure class is worse than no check,
so it was replaced rather than kept.

**What works is perturbing the metric instead of the font:**

```js
const INHERITED_METRIC_PROBE = '* { line-height: 3; }';
```

`line-height` inherits and `*` matches everything, so this lands directly on any
element that does not state its own line-height, while losing (specificity 0) to
every element that does. A box whose height moves under it is sized by inherited
text metrics — the same thing as being sized by whichever font is installed. Each
of the 36 measurements now runs twice, and a difference is a `[CONTENT-DRIVEN]`
failure in its own right, independent of whether the number happens to be right.

It immediately found three more: **AtlTab (40 → 64.5px), AtlMenuItem (32 → 50px)
and AtlCodeBlock's header (40 → 49px)** were all stable by slack rather than by
construction — their content simply fit inside the min-height on this machine. All
three now state their line-height; the tab's pills variant and the compact menu
item also derive their padding.

## Consequences

- **Five controls became deterministic**, and the property is now checked rather
  than assumed: the negative test (removing the tab's line-height) fails the gate.
- **`min-height` plus authored padding is now a recognisable anti-pattern** in this
  repo: it says a height and delivers the content's height. Where the two agree it
  is luck, and luck is machine-specific.
- **The lesson generalises past geometry.** Local green and CI red differed by a
  font that was installed on one machine — a gate that measures rendered output is
  only as reproducible as the environment it measures in. The fix was not to pin
  the environment but to remove the dependency from the thing being measured.
- **A discarded check is recorded here on purpose.** The font-substitution probe
  looked reasonable, shipped nothing, and would have read as coverage. Its failure
  is the reason the metric probe exists.
