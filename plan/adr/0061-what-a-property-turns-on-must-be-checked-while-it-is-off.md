---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0058-the-master-facts-nothing-was-reading.md (the Boolean checks this completes)
  - plan/adr/0060-bound-is-not-the-same-as-bound-correctly.md (the same session, one layer down)
  - plan/adr/0055-invalid-is-not-a-colour.md (the overlay idiom these findings are about)
---

# ADR-0061: What a property turns on has to be checked while it is off

## Status

Accepted. Adds `[OVERLAY]` and `[BOOL-UNSPECED]` to `check:figma`, and reads overlay
layers through the snapshot probe rather than the deep read.

## Context

A Figma Boolean binds to exactly one thing: a layer's visibility (ADR-0055). So every
state a master expresses through a Boolean is drawn by a layer that is **hidden by
default** — and hidden is precisely what the per-component deep read discards. The
snapshot's own `walk()` opened with `if (node.visible === false) return`, and the read
feeding it had already dropped those nodes anyway.

That made the overlays the one part of every master no check could reach. What was
sitting there:

- **90 `_disabled-overlay` rectangles filled with `color/surface` at full opacity.**
  Switched on, they do not dim the control — they **erase** it. `--ui-opacity-disabled`
  is 0.5, which a surface overlay expresses at 50%, not 100%. (The sibling idiom is
  right for the right reason: `.atl-input.is-readonly input` sets
  `background-color: surface-sunken`, so `_readonly-surface` *should* be opaque.)
- **78 of 90 sat in the wrong place**, and 34 of those lay **entirely outside** the box
  they were meant to cover — AtlCheckbox's was 115×24 at x=123 in a 113×24 control, i.e.
  parked to the right of it. They had been created as flow children and flipped to
  `ABSOLUTE` without resetting x/y.
- **34 `_invalid-border` rectangles carried a raw stroke colour.** The snapshot *does*
  collect stroke paints — it never reached these nodes to look.
- **14 `_invalid-border` rectangles were the size of the label row** rather than the box
  that carries the border. `.atl-checkbox.is-invalid input[type='checkbox']` colours the
  18×18 square, not the 113×24 row.
- **8 `_loading-spinner` layers drew a state nothing renders.** AtlTable and
  AtlTabGroup each declared a `loading` Boolean bound to one. `AtlTableSpec` is
  `{ variant, size, stickyHeader }`; `AtlTabGroupSpec` is
  `{ selectedIndex, onSelectedIndexChange, variant }`; the word `loading` does not occur
  in the table or tabs component of *any* of the three frameworks. Only AtlButton has a
  spinner, and only `AtlButtonSpec` has the flag.

The last one exposed a gap in the Boolean checks themselves. `[BOOL-MISSING]` goes
spec → master. `[BOOL-INERT]` asks whether a declared Boolean toggles any layer. **The
third direction — does a declared Boolean correspond to a field of this component's own
spec — was asked by nobody**, and it is the direction that catches a master inventing
API. Both existing checks passed a Boolean that toggles a real layer drawing a state
that does not exist.

## Decision

**1. Overlay facts come from the probe, not the deep read.** The one `figma_execute`
round trip already reading properties and glyphs now also records every layer whose name
starts with `_`: its type, fill and stroke variable, its box relative to its parent,
whether it is visible, and which property drives it. `walk()` no longer skips hidden
nodes either, so the day the upstream read includes them the facts agree.

**2. `[OVERLAY]`** — CRITICAL when an overlay paints a raw fill or stroke; when a layer
the size of its parent does not sit at 0,0; when a layer lies entirely outside its
parent, whatever its size; and when a hidden layer is bound to no property at all, so
nothing can ever show it.

**3. `[BOOL-UNSPECED]`** — BLOCKER when a master declares a Boolean whose name is not a
field of its own spec chain and is not claimed in prose as mapping to another
interface. A master can invent API as easily as it can omit it, and an invented property
is a state a designer can draw that no component renders.

**4. The findings, fixed.** All 90 disabled overlays carry the complement of
`--ui-opacity-disabled`; every cover overlay sits at 0,0 at its parent's size; every
`_invalid-border` traces the box that actually carries the border, with its stroke bound
to `color/input-border-invalid` at that component's own border width (2px on
checkbox/radio, 1px on toggle/combobox/select); `_shimmer` is the `linear-gradient` its
CSS describes rather than a flat fill; and `loading` — plus AtlTable's and
AtlTabGroup's equally unspec'd `disabled` — is gone along with the layers it switched.

**5. `color-mix()` and gradients are two different problems.** A gradient's bindings
live on its **stops**, not on the paint, so a paint-level read called the bound shimmer
raw. The probe now resolves gradient stops and treats a fully-transparent stop as
absence rather than an unbound colour. `color-mix()` remains genuinely inexpressible
(ADR-0060).

**6. Three of AtlTable's Booleans stay, allowlisted with the reason.** `sortable`,
`selectable` and `empty` are fields of `AtlThSpec`, `AtlTrSpec` and `AtlTbodySpec`. A
`maps to` claim would fail `[BOOL-CLAIM]`, correctly: `AtlTableSpec` does not resolve to
those interfaces, which is exactly ADR-0056's rule that a container must not claim its
children's states. They stay declared only until those child masters exist to carry
them.

## Consequences

- The overlays are checked, and the check can fail: verified by injecting a raw paint, a
  cover overlay at 7,7, a layer parked entirely outside its parent, and an invented
  Boolean, then restoring. `check:all` exits 0.
- **A default state is not a neutral state — it is an unexamined one.** Every one of
  these defects was latent because the layer's default is `visible: false`. Nobody had
  switched a `disabled` Boolean on, so nobody saw that it blanks the control. When a
  check is scoped to what is visible, the hidden half becomes the place defects
  accumulate.
- **The three directions of one relationship each need their own question.** spec →
  master, master → layer, master → spec. Two of them had been asked for weeks, and the
  third was where the invented API was.
- The Boolean overlays now say what the CSS says at the property level. What remains
  unchecked is the *geometry* of what they cover — an overlay can be at 0,0 at the right
  size around a box whose own padding is wrong. That is the `[LAYER-PAINT]` work
  recorded in `tasks/todo.md`.
