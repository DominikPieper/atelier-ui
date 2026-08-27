---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0038-tonal-ramps-with-checked-annotations.md (the construction this repeats for four more families)
  - plan/adr/0047-bind-the-literals-that-duplicate-a-token.md (the literal-binding campaign this finishes for colour and type)
  - tasks/design-findings-2026-08-26.md (F2 — the status colours are literals; I2/J6 — off-scale type)
---

# ADR-0054: The last values a Figma Variable could not bind

## Status

Accepted. Completes the token work the redesign flagged as owed before the Figma
transfer.

## Context

The redesign census listed seven things worth settling before rebuilding the
Figma masters. Three are now done — the row heights and the prose leading
(ADR-0052), and the missing 36px step, which died rather than being named. Two of
the remainder are the subject here, and they are the same problem twice: **a value
that is a literal cannot be bound to a Variable**, so a rebuilt master would carry
it as a hard-coded number and the link back to the token would be gone.

**The status colours.** ADR-0038 built a tonal ramp for teal and stopped. The four
status families were 28 literals spread across four theme blocks — `:root`, the
`prefers-color-scheme: dark` media block, and the two explicit `[data-theme]`
blocks — with no scale relating them and nothing saying which step carried text on
which canvas.

**The off-scale type.** Three values sat beside the scale: 9px on the avatar's
overflow badge, 10px on the extra-small avatar, and 11.52px (`0.72rem`) on the
code block's label and copy button. Two components, six declarations per
framework.

## Decision

**Four ramps, built the way the teal ramp was built — and the shipping values were
already on the scale.**

Ordering each family's shipping values by OKLab lightness reproduces the step
numbers, in all four families, with no re-assignment:

| family | shipping steps | generated |
|---|---|---|
| red | 100, 200, 300, 400, 700, 800, 900, 950 | 500, 600 |
| green | 100, 300, 400, 700, 800, 950 | 200, 500, 600, 900 |
| amber | 100, 200, 400, 700, 800, 950 | 300, 500, 600, 900 |
| sky | 100, 200, 400, 700, 900, 950 | 300, 500, 600, 800 |

So this is a re-description of what already shipped, not a redesign. **Measured, to
make sure**: the 28 semantic tokens resolve to byte-identical colours before and
after aliasing, in light and dark, in a browser. Nothing renders differently.

Three sub-decisions the measurements forced:

**No 50 step.** Extrapolating past each family's lightest shipping tint lands on
`#ffffff` in three of the four — the status families' light ends are already pale
washes, unlike teal's vivid cyan. A 50 would be a name for the surface, and
`--ui-color-surface` is that name.

**The 950 is the dark theme's tinted background.** `#3a1414`, `#0f3320`,
`#3a2510`, `#102338` sit below each family's 900 in lightness *and* chroma, so they
continue the ramp's direction rather than sitting beside it. The chroma step from
900 to 950 is larger than 800 to 900 — a visible kink, and the right one: a surface
tint should be less chromatic than a text colour.

**A missing tail step is placed where the family that has one puts it, not at the
midpoint.** Red is the only family shipping an 800, a 900 *and* a 950, so it is the
only in-system evidence for where a 900 sits: **24.8% of the way from 800 to 950**,
not 50%. Interpolating green's and amber's 900 to the midpoint made them a visible
step too dark. The same reading gives sky's 800 at 56.3% between 700 and 900.

**One type step below the scale: `--ui-font-size-2xs: 0.625rem` (10px).** The
avatar's 10px keeps its size and gains a name; the badge's 9px joins it, moving one
pixel; the code block's `0.72rem` snaps to `--ui-font-size-xs` (12px), moving
0.48px. Afterwards the library has **no off-scale font size at all**.

Alternatives considered:

- **No new type token — send both avatar values to `--ui-font-size-xs`.** Rejected
  by measurement rather than taste: at 12px, `+99` overflows the 24px badge. At
  10px and at the old 9px it does not.
- **Two type steps, `2xs` and `3xs`,** keeping 9px exact. Rejected: two new rungs
  for two declarations each, and a 9px step in a scale whose smallest *readable*
  role is 12px. One pixel of movement is cheaper than a step nobody can justify.
- **Leave the dark backgrounds off the ramp,** as standalone surface tints. Keeps
  the ramp smooth in chroma as well as lightness, at the price of four colours a
  Variable still cannot bind — which is the problem this ADR exists to remove.
- **Derive them: `color-mix(in oklab, <family>-900, surface 80%)`.** Expresses the
  intent, and Figma can bind a `color-mix` no better than a `calc` — the same
  limitation ADR-0052 records for the row ladder. It would have swapped one
  unbindable form for another.

## Consequences

- **40 new primitives and 41 manifest entries.** Every step says what reads it,
  and which canvas it carries text on; the ones no semantic token aliases yet say
  that too, rather than pretending to a role.
- **`check:contrast` re-measures 47 annotated steps**, up from 7. The gate needed
  no change: ADR-0038 wrote it against `--ui-color-<family>-<step>` generically, so
  four more families were four more families.
- **The type change moves two rendered values**, by 1px and 0.48px. The code
  block's header still measures exactly 40px in all three frameworks, because it
  states its height and derives its padding (ADR-0041) — a font change is
  absorbed rather than passed on. Verified.
- **Every colour and every type value in the library is now a token.** What remains
  unbindable is structural, not chromatic: the row ladder's `calc()` (ADR-0052) and
  the ~116 one-off component dimensions ADR-0047 deliberately left alone.
- **Open: `success`, `warning` and `info` have no hover or active step**, while
  `danger` has both. The ramps now make those steps available — 800 and 900 in
  light, 300 and 200 in dark — but no component asks for them, so none were
  aliased. Worth doing when something needs a hoverable success control, not
  before.
