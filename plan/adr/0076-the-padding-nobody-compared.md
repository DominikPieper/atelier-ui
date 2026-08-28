---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0041-control-height-is-the-primitive.md (the derivation Figma cannot express)
  - plan/adr/0064-what-the-parity-stamp-rests-on.md (the stamp that is blind to the Figma side)
  - plan/adr/0075-the-direction-nothing-checked.md (the gate that caught this one's fallout)
---

# ADR-0076: The padding nobody compared

## Status

Accepted. Adds `[ROOT-BOX]` to `check:figma`, corrects 56 padding and gap bindings across
eight masters, and splits one finding into two kinds because the sides are not comparable
in the same way.

## Context

`[ROOT-PAINT]` compared each master's root fill, stroke, stroke weight per side, radius,
shadow, font size and leading. It never compared the **padding** — and
`resolveRootPaint()` had been computing it since its first version, into a field nothing
read.

Two divergences had already been found by running `figma_check_design_parity` by hand while
re-recording parity stamps: AtlAlert drew 12/16 against a CSS that says 16/20, and
AtlTooltip 8/12 against 4/8. Both were **bound** to Figma Variables — just to the wrong step
of the spacing scale. Bound is not the same as bound correctly.

The gate found **thirteen** masters.

## Decision

**1. The findings split in two, and treating them alike would have produced thirteen
blockers, most of them unfixable.**

| kind | what it is | how it reports |
|---|---|---|
| **bindable** | The CSS states a value a `--ui-spacing-*` token holds. Figma can bind that token. | **blocker**, naming the token to use |
| **derived** | The CSS computes the value from ADR-0041's control recipe — `(control-height − line-height × font-size) / 2` gives 6.25, 9, 11.25px. No spacing token holds it and no Figma Variable can express the arithmetic. | **warning** about a structural limit |

The test is simply whether a spacing token's value equals the number the CSS states, read
from the token source rather than hardcoded. A derived value that happens to equal a token
is reported as bindable, which is harmless: binding it renders correctly either way.

**2. Seven bindable divergences corrected, in Figma, by binding the variable.** AtlInput
(`spacing/3` → `/4` inline), AtlTextarea and AtlSelect (unpadded → `spacing/4` inline),
AtlMenu `variant=compact` (`spacing/1` → `/2` block), AtlTooltip (`spacing/2`,`/3` →
`/1`,`/2`), AtlToast and AtlAlert (`spacing/3`,`/4` → `/4`,`/5`), plus AtlButton's item
spacing (unset → `spacing/2`, against a CSS `gap` of 8px). 56 variants. **The variable was
bound, never the resolved number** — the rule `[TOKEN]` exists for.

**3. Six derived warnings stay as warnings, and they are one question, not six.** AtlButton,
AtlInput, AtlTextarea, AtlSelect, AtlBadge and AtlTab all pad on a block axis the CSS
derives. Three of them (Textarea, Select, Tab) pad **zero** in Figma and let a positioned
text node do the work, which is not a wrong number but a different construction. The
question the warning asks is the right one to leave open: keep the resolved number in step
by hand, or let the master state only its height and stop padding — the same choice
ADR-0052 recorded for the row ladder's Figma Variables.

**4. `[SET-CLIPS]` caught this decision's own fallout, twenty minutes after being written.**
Growing AtlAlert's and AtlToast's padding from 16 to 20 per inline side widened every
variant by 8px, and both sets clipped. Reported, resized, re-verified — 37 sets clean.
That is two consecutive days on which a padding change silently clipped a set, and the
first day it took a hand-run parity check to notice.

## Consequences

- `check:figma` exits 0 with 14 warnings (8 pre-existing `[ROOT-PAINT]` pseudo-class
  variants, 6 new `[ROOT-BOX]`). `check:all` exits 0; `nx run-many test lint` over
  angular/react/vue/spec exits 0. Both `[ROOT-BOX]` classes fail-tested — a bindable drift
  blocks and names the token, a derived drift warns and does not block.
- **The first fail-test was wrong, not the gate.** Perturbing every AtlButton side to check
  the derived path still blocked, because `size=lg`'s 24px inline padding *is* `spacing/6`
  — bindable, and correctly reported. The test had to target only the derived sides.
- **A `const` below its call site cost a run for the third time in this file.** Function
  declarations hoist; `const` does not, and `checkRootPaint()` is called hundreds of lines
  above its own body. The declaration now sits with the other module-level buckets, with a
  comment saying why.
- The catalogue was re-synced (3 cards) and the second run reported **0 updated**, so
  ADR-0074's idempotency fix holds against new data rather than only against the case that
  exposed it.
- **A new gap, the mirror of a known one.** A parity record stores `figmaNodeId`,
  `verifiedSha` and an `inputsHash` over component files — nothing about the Figma side. So
  eight masters changed today and no stamp noticed. By ADR-0064's own definition ("verified
  after the files last changed") the stamps remain valid, and the changes moved Figma
  *toward* the code — but the blindness is real and is now recorded beside its mirror image
  (the `inputsHash` that cannot see the shared token layer).
