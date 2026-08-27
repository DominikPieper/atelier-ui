---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0056-a-master-models-one-thing.md (the gate this corrects and extends)
  - plan/adr/0057-the-icon-set-was-text-in-figma-too.md (the same defect, one page over)
  - plan/adr/0050-a-glyph-in-a-string-map-is-still-an-icon.md (the rule, fourth and fifth homes)
---

# ADR-0058: The master facts nothing was reading

## Status

Accepted. Extends the snapshot and `check:figma`; restates Phase 3's remaining work
order, which turned out to be the inverse of what it looked like.

## Context

ADR-0056 built `[BOOL-MISSING]` on the masters' prose descriptions, because that is
where Boolean properties were recorded — the snapshot captured `variantAxes` and
nothing else about properties. It reported nine masters that "declare no Boolean" for
a spec flag.

Setting out to draw those nine states, one question came first: **what can a Figma
Boolean actually bind to?** Reading the existing bindings answered it and produced
two findings that matter more than the nine.

A Boolean binds to exactly one thing: a layer's `visible`. AtlButton shows the idiom
— `disabled` drives a `_disabled-overlay` rectangle, `loading` drives a
`_loading-spinner`.

I first concluded from that that **a state differing only by colour cannot be a
Boolean**, and wrote it into this ADR. It is wrong, and the file had already solved
it: AtlSelect, AtlCombobox and AtlCheckbox each carry an `_invalid-border` rectangle
whose `visible` is bound to their `invalid` Boolean. An overlay layer that paints the
new colour turns any colour state into a visibility state. The constraint is narrower
than it looked — a Boolean needs *a layer to toggle*, and one can always be added.

Then: AtlInput declares three Booleans and only `disabled` is bound. `readonly` and
`required` reference nothing. Extending the read across the file:

- **Nineteen declared Boolean properties toggle no layer**, across twelve masters —
  all five on AtlTable (`sortable`, `selectable`, `stickyHeader`, `empty`, `error`),
  `readonly` and `required` on AtlInput and AtlTextarea, `hasIcon` on AtlButton,
  `dismissible` on AtlAlert and AtlToast, `indeterminate` on AtlProgress, `linear` on
  AtlStepper, `open` on AtlChat. Switching any of them changes nothing.
- **Forty-two pictograms are drawn as TEXT characters**, across fifteen masters:
  AtlBadge's eight, AtlMenu's seven, AtlToast's and AtlChat's five each, AtlAlert's
  four, AtlCombobox's three, and four `⟳` spinners. ADR-0057 found this on the Icons
  page and rebuilt it; the masters were full of it too.

So `[BOOL-MISSING]` was telling the reader to add properties while twenty existing
ones did nothing, and every icon in the file was a character.

## Decision

**Capture the facts, then gate them.** `figma-snapshot.mjs` gains one probe round
trip that records, per master: the property definitions with their types, the set of
properties anything references, and every TEXT node holding a short non-ASCII string.

Two new codes:

- **`[BOOL-INERT]`** — a declared Boolean nothing references. The mirror of
  `[BOOL-MISSING]` and, measured, four times more common.
- **`[MASTER-GLYPH]`** — a pictogram drawn as a text character inside a master.

And two corrections to what ADR-0056 shipped:

- **`[BOOL-MISSING]` reads the real property definitions**, with the prose kept only
  for the *mappings*, which exist nowhere else. That alone moved four masters out of
  it: AtlAlert, AtlProgress, AtlTable and AtlChat do declare their Booleans — the
  properties are inert, not absent, which is a different repair.
- **Its message now says what a Boolean can express.** "Declare a Boolean" is wrong
  advice for a colour-only state. Use a Boolean where the state adds an element, a
  variant axis where it changes a colour, and a stated opt-out where it has nothing to
  draw.

## Consequences

- **The work order is the inverse of what it looked like.** Not "add nine
  properties": bind nineteen that exist, replace forty-two glyphs with instances of
  the Icon library, and add five properties that are genuinely absent — AtlToggle
  (`invalid`, `required`), AtlRadioGroup (`invalid`, `required`, `readonly`),
  AtlSkeleton (`animated`), AtlPagination (`showFirstLast`), AtlCombobox
  (`readonly`).
- **The icon rebuild has somewhere to land.** ADR-0057's 25 vector components exist
  and are generated from the spec, so each of the forty-two glyphs has a named
  replacement waiting.
- **A colour state can be a Boolean after all**, via an overlay layer — the
  `_invalid-border` idiom three masters already use. My first reading of the binding
  rule said otherwise and this ADR said so for an hour. Both the ADR and the gate
  message are corrected: a Boolean needs a layer to toggle, not a particular kind of
  difference.
- **Deleting AtlRadio's `invalid` Boolean was the wrong repair, and it orphaned the
  layer that draws the state.** `[BOOL-CLAIM]` was right that the mapping to
  `AtlFormFieldSpec.invalid` was false — `AtlRadioSpec` extends nothing — but the
  property was driving `_invalid-border`, and an invalid radio is a real rendered
  state: `atl-radio.tsx` computes `ctx.invalid && 'is-invalid'` from the group's
  context and `atl-radio.css` has three rules for it. The property is restored, the
  four overlays rebound, and the description now states the honest mapping —
  *inherited from* `AtlRadioGroupSpec.invalid`, not owned here. A false claim about a
  property is a reason to correct the claim, not to remove the property.
- **A gate built on prose reported the wrong half of a problem.** ADR-0056 chose the
  description because that was the only place the data existed; the fix was to make
  the data exist. Worth remembering the next time a check has to read prose: it is a
  measurement of the writing, not of the thing.
- **Open: `[MASTER-GLYPH]` and `[BOOL-INERT]` are warnings, not blockers.** They
  describe 61 findings across the redesign-phase masters, which are due to be rebuilt.
  They become blockers when the redesign banner comes down.
