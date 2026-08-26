---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0041-control-height-is-the-primitive.md (the claim this makes true in all three frameworks)
  - plan/adr/0042-a-gate-that-measures-rendered-geometry.md (the gate this corrects)
  - plan/adr/0026-the-library-ships-its-css.md
  - tasks/design-findings-2026-08-26.md (Decision B)
---

# ADR-0043: The geometry contract ships with the component

## Status

Accepted. Every component stylesheet declares `box-sizing: border-box` for its own
roots and their descendants, written and verified by `gen:box-sizing` /
`check:box-sizing` (gate 23). `check:geometry` now measures all three frameworks
and supplies no reset of its own.

## Context

The library ships its CSS (ADR-0026), and only 10 of 29 component stylesheets set
`box-sizing`. So the sizes the library states were only true if the consuming app
happened to supply a border-box reset. Twenty rules set a dimension *and*
padding/border without declaring a box model; ten of them were rendered in a
browser in both modes, and **eight drifted**:

| Element | no reset | border-box | drift |
|---|---|---|---|
| Combobox option | 52px | 36px | 16px |
| Menu item | 52px | 36px | 16px |
| Code-block header | 65px | 43px | 22px |
| Toggle track | 46×26 | 44×24 | 2px |
| Button spinner | 22.5² | 20² | 2.5px |

Two findings reframed this from a style question into a defect.

**First: Angular was broken, not merely exposed.** React and Vue render their
button as `<button>`, which the UA stylesheet already makes border-box — so they
were accidentally immune, and the `40px` ADR-0041 promised was real there. Angular's
host is `<atl-button>`, a custom element, which gets the CSS default `content-box`.
Measured with no reset: **60px at `size=md` against a token claiming 40**, 46.5
against 32, 73.5 against 48. ADR-0041 states buttons "compute exactly 32 / 40 / 48".
In Angular they did not, and an Angular button next to an Angular input was 20px
taller — the exact defect ADR-0041 was written to close.

**Second: the gate that should have caught it excluded itself from the evidence.**
`check-geometry.mjs` measured React only, justified in a comment by "check:sync
guarantees the CSS is mirrored". `check:sync` compares component-directory presence
and story presence; it has never compared a byte of CSS. The justification was
invented, one day old, and wrong — and the gate's fixture injected
`* { box-sizing: border-box }`, quietly supplying the very thing consumers lack. It
measured a best case nobody ships, on a third of the library, and reported the
whole library green.

Four placements were considered:

1. **A global reset in the shipped `tokens.css`.** One line, catches consumer
   markup too. Rejected: it makes a stylesheet named "tokens" impose a rule on
   every element of the consuming app.
2. **A separate opt-in `base.css`,** scoped to the library's roots. Clean, and
   never touches anything outside the library. Rejected for one reason: it can be
   forgotten, and when it is, the geometry silently reverts to the wrong values —
   nothing in this repo can gate a consumer's import list.
3. **Per component, in the component's own stylesheet.** Chosen.
4. **Document the reset as a requirement** and ship it in the preset. Rejected:
   scaffolded workspaces would be correct and every other integration wrong, with
   nothing enforcing it.

## Decision

Each component stylesheet opens with its geometry contract:

```css
/* Geometry contract: every size this component states is a border-box size. … */
.atl-menu,
.atl-menu * {
  box-sizing: border-box;
}
```

**Why per component.** The contract ships in the same file as the sizes it governs.
A component's CSS cannot be used without being loaded, so unlike an opt-in reset
the contract cannot go missing — which is precisely how the defect above survived.

**Why the root list is derived, not written.** `gen-box-sizing.mjs` collects every
`.atl-*` class that starts a rule in the component's directory and emits
`:is(...)` over that set. A root class added later without regenerating fails
`--check` as `[STALE]`, so a new part of a component cannot quietly fall outside
the contract. Angular encapsulates its styles, so `:host` covers it by definition.

**Why plain classes and not `:where()`.** Specificity is deliberately (0,1,0). It
has to beat a consumer's `* { box-sizing: content-box }` — which `:where()` at 0
would lose to on source order — while still losing to any rule that names an
element, which is how `.atl-avatar .status-dot` (0,2,0) keeps the `content-box`
its 2px ring needs.

**Written by a generator, verified by a gate.** `gen:box-sizing` writes,
`check:box-sizing` verifies — the generate → project → `--check` shape of ADR-0009.
Both failure modes are negative-tested: a removed block reports `[MISSING]`, a new
root class reports `[STALE]`, and `gen` repairs both.

**`check:geometry` is corrected in the same breath.** It measures every framework
(12 measurements instead of 4), and its fixture supplies no reset: what it measures
is what an app with no reset of its own gets. Angular's `:host` is rewritten to the
host tag, which reproduces encapsulation for geometry purposes — the attribute
selectors Angular adds change specificity, never a box. With the contract removed
from Angular's button, the gate now reports the 60px defect it previously slept
through.

## Consequences

- **Angular's controls are the height they claim, for the first time.** All twelve
  measurements land on their token with no reset supplied.
- **The rendering changes where it was wrong.** Menu items and combobox options go
  52px → 36px, the code-block header 65 → 43. Reviewed side by side: the result is
  denser and matches what the CSS always claimed. Our own surfaces disagreed on
  this — the docs app has a reset, Storybook has none, so Storybook was showing the
  drifted rendering all along.
- **A false justification is gone.** No gate in this repo may again claim coverage
  it does not have on the strength of what another gate is assumed to guarantee.
  `check:sync`'s actual scope is directory and story presence; that is now stated
  where it was misused.
- **Redundant `box-sizing` declarations remain** in the ten stylesheets that
  already had one. They agree with the contract, so they are noise rather than
  risk, and removing them would enlarge a diff that already touches 87 files.
- **87 stylesheets changed, which invalidated 27 parity records.** Handled as a
  phase-level decision in ADR-0044, not by re-stamping records.
- **The contract is per component, so a new component can ship without it** —
  which `check:box-sizing` reports as `[MISSING]` on the first run.
