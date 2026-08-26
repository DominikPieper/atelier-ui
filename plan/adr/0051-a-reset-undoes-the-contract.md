---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0043-the-geometry-contract-ships-with-the-component.md (the contract this defends)
  - plan/adr/0049-every-component-states-its-typeface.md (the same mechanism, for the typeface)
---

# ADR-0051: A reset undoes the contract

## Status

Accepted. Every rule using `all: unset` restates `box-sizing: border-box`, and
`check:box-sizing` fails with `[RESET-WIPED]` when one does not.

## Context

ADR-0043 gave each component a geometry contract — `.atl-x, .atl-x * { box-sizing:
border-box }` at the top of its stylesheet — so its sizes do not depend on the
consuming app's reset. Drawing AtlPagination's artboard turned up a box that
contradicted its own CSS anyway:

```css
.page-btn {
  all: unset;
  height: 2.25rem;   /* 36px */
}
```

Measured: **38px**. `all: unset` resets `box-sizing` along with everything else, the
contract selector `.atl-pagination *` has the same specificity (0,1,0) as
`.page-btn`, and the reset comes later in the file. So the contract lost on source
order and the button was content-box, two pixels taller than it claimed.

Fifteen rules across the three frameworks were in that state: the page button, the
accordion heading, and the native `<dialog>` in AtlDialog, AtlDrawer and AtlChat.

This is the third time in one day that `all: unset` has quietly eaten a declaration.
ADR-0049 found it wiping `font-family` on the dialog, where the fix was to move the
declaration below the reset. Same mechanism, different property.

## Decision

**A rule that resets everything restates what it needs.** `all: unset` is a
deliberate "I want none of the UA's opinions", and the box model is one of the
opinions it discards — so the rule that asked for the reset is the right place to
put the box model back. Fifteen rules now do, each with a comment naming why.

Rejected: raising the contract's specificity (`.atl-x .atl-x *`, or `!important`).
It would win the cascade and leave the underlying confusion in place — a reader would
still see `all: unset` and have no way to know which of its effects survive.

**`check:box-sizing` gains `[RESET-WIPED]`.** It scans every component stylesheet
for a rule using `all: unset` / `initial` / `revert` without a `box-sizing`
declaration of its own, and reports the selector. Negative-tested by deleting the
restatement from the page button.

## Consequences

- **AtlPagination's button is 36px**, the height it always claimed. The other
  fourteen were correct by accident — their sizes came from content, so the extra
  two pixels of border landed outside a box nothing measured.
- **The gate pair now covers both halves of the contract**: that it exists
  (`[MISSING]` / `[STALE]`) and that nothing later revokes it (`[RESET-WIPED]`).
- **`all: unset` is now a known hazard in this repo**, with two ADRs behind it. Any
  future property the library depends on — `font-family`, `box-sizing`, and anything
  inheritable added later — has to be restated below such a reset, and the two gates
  that check those two properties will say so.
- **Found by drawing, not by scanning.** The button had been 2px wrong through every
  gate run; what surfaced it was measuring the anatomy for a sheet that had to state
  the row height.
