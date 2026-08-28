---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0035-typography-instrument-pair.md (the --ui-font-mono defect this generalises)
  - plan/adr/0060-bound-is-not-the-same-as-bound-correctly.md (the clipping this finally gates)
  - plan/adr/0070-the-catalogue-is-generated.md (whose idempotency claim this corrects)
  - plan/adr/0074-two-roles-the-eight-did-not-span.md (whose 2px growth this caught)
---

# ADR-0075: The direction nothing checked

## Status

Accepted. Adds `[UNDECLARED]` to `check:css-tokens` and `[SET-CLIPS]` to `check:figma`,
fixes a silent stacking defect in AtlTooltip, and records what a review of the 64 open
items found.

## Context

A review of every open item, newest to oldest, asked which were still true. Four were
not — and the failure mode was worth more than the four:

- **One was fixed the day before** and nobody had gone back to the list.
- **One was contradicted by a later entry in the same file.** "Figma Toast is designed
  DARK" sat open for five weeks while an entry below it recorded *"Toast resolved: the dark
  drawing WAS the dark rendering."* Verified against `allowlists.js`, which carries no Toast
  fill exemption.
- **One described 42 tracked files** that a commit had already deleted.
- **One said `push`** on a batch that shipped in June.

Two more were closable by *building the thing they described*, and both turned out to hide
something the note did not know.

## Decision

**1. `[UNDECLARED]` — check the direction nothing checked.** `check:css-tokens` verified
that *declared* tokens are annotated. Nothing verified that a token a component **reads**
is declared anywhere. The recorded instance was historical: all three code-block
stylesheets read `var(--ui-font-mono, …)` while nothing declared it, so every code block
rendered in the Menlo fallback until ADR-0035.

Writing the scan found a **second, live** one. AtlTooltip read `var(--ui-z-tooltip, 200)`
in React and Vue — a token that has never existed in any token source. The tooltip's
stacking level was the literal `200`, outside the design system, in two of three
frameworks.

**A fallback is what makes this silent, so a fallback is not an excuse — it is the
reason to report.** The component renders, plausibly, at a value nothing controls.

**2. The tooltip takes `--ui-z-dropdown`, and the manifest decided it, not the number.**
`--ui-z-overlay` is `200` — the same number the fallback used, so it was the tempting fix.
Its manifest intent says *"the modal scrim / backdrop layer"*. `--ui-z-dropdown`'s says
*"popovers, dropdowns, and menus that float above page content"*, and every other floating
layer in the library — the menu panel, the combobox panel, the select panel, the chat
panel — already uses it. The tooltip was the only one that did not, and it is a popover.
The value changes 200 → 100; the tooltip is not portaled, so it only ever competed inside
its own wrapper.

**3. `[SET-CLIPS]`, and "two lines against the snapshot" was wrong.** A COMPONENT_SET whose
frame is smaller than its variants clips them, and 14 of 27 sets were once in that state —
AtlDialog was 360×170 around 800×1111 (ADR-0060). The note estimated the check at two lines
against the snapshot. **The snapshot carried no dimensions at all**, so the probe had to
capture a `box` per master first: width, height, the variants' extent, and `clipsContent`.

It caught a live regression on its first run, and the regression was mine: binding text
styles (ADR-0074) grew AtlCard and AtlDialog by 2px each, and both sets clipped again the
same day, with `clipsContent: true`. Fixed both; 37 sets now check clean.

**A defect that was fixed by hand and never gated comes back.** It took one day here.

## Consequences

- `check:all` exits 0, `nx run-many test lint` over angular/react/vue/spec exits 0. Both
  new codes fail-tested in both directions, including `[SET-CLIPS]`'s stale-snapshot
  advisory.
- **64 open items → 58**, and four of the six closures were bookkeeping rather than work.
  Three stale counts corrected (`536` text nodes → 464, `2.25rem` three times → six,
  `29/29` snapshot → 43 masters).
- **Two closed entries were annotated as wrong**, which matters more than the open ones:
  ADR-0070's idempotency claim (corrected by ADR-0074) and the `check:figma`-in-CI figure.
  A closed item is read as settled fact; leaving a wrong one is worse than leaving an open
  item stale.
- **Two open items were re-scoped from "repair" to "gate work".** Orphaned main components:
  68 resolved from the instance side, all reachable — no live defect. The Figma icon set
  against `AtlIconName`: 25 and 25, identical. Both gaps are real; neither is a fire, and
  the list said neither.
- **AtlTooltip's root padding diverges** (Figma 8/12, CSS 4/8) — found while re-recording
  its parity stamp, the same class as AtlAlert's, and still invisible to every gate. The
  `[ROOT-BOX]` gate is cheaper now: the snapshot carries a `box` per master, so it needs
  padding added to that record rather than a new capture.
- The superseded glyph frame on the Icons page is **verified inert** (107 nodes, 0
  components, 0 instances, 0 external references) and its own note's condition has passed.
  Left standing: deleting from a shared design file is outward-facing and was not in the
  approved batch.
