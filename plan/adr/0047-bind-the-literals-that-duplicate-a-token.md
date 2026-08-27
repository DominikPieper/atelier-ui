---
status: accepted
date: 2026-08-26
sources:
  - tasks/design-findings-2026-08-26.md (Decision D)
  - plan/adr/0041-control-height-is-the-primitive.md (the defect this found two more of)
  - plan/adr/0042-a-gate-that-measures-rendered-geometry.md (the roster blind spot)
  - plan/adr/0018-figma-token-tiering-and-css-projection.md
---

# ADR-0047: Bind the literals that duplicate a token

## Status

Accepted. `--ui-border-width` and `--ui-border-width-thick` join the token source,
154 literal border widths and 12 token-bypassing values are bound,
`check:token-bypass` (gate 25) keeps it that way, and `check:geometry` grew from 12
measurements to 36.

## Context

The finding was that AtlButton and AtlInput carry literals with no token behind
them, so a rebuilt Figma master cannot bind a Variable to them. Measuring the whole
library first changed what the decision was about.

**190 of 887 values in the component stylesheets are literals** — 78% are already
token-bound. Grouped by what they are:

| | |
|---|---|
| 116 | component dimensions (an avatar size, a toggle track, a step circle) |
| 17 | viewport units (`100dvh`, `min(24rem, 90vw)`) — no token can hold these |
| 13 | positions, 11 z-index/opacity, 11 spacing, 8 typography, 6 shadows, 2 `color-mix` |

Tokenising all 116 dimensions would produce roughly a hundred tokens with exactly
one user each — the rule of three violated in token form, and a token file three
times its size for no gain in either direction. So the interesting question is not
"which values lack a token" but **"which values duplicate a token that already
exists"**, and the answer was 13, once the comparison was made per property family.
A naive scan matching any token by value claims 94 hits and suggests binding
`margin: 0` to `--ui-z-base`; families are what make the number mean anything.

Two of the 13 were live defects. **AtlTab and AtlCodeBlock's header both hardcoded
`2.5rem`, exactly what `--ui-control-height-md` says** — and because
`check:geometry` builds its roster from token *references*, a control that
hardcodes the value is invisible to it. Measured: the tab rendered **41px** and the
header **43px** against a 40px token. ADR-0041's defect, still live, in the blind
spot of the gate written to catch it.

One earlier claim of mine was wrong and is corrected here: I said there is no
z-index scale. There is (`--ui-z-base`, `--ui-z-dropdown`); two components bypassed
it.

## Decision

**Border widths become tokens, because they are a scale rather than a dimension.**
133 uses of `1px` and 12 of `2px` are two weights doing two jobs: separating
surfaces, and marking a control. `--ui-border-width` and `--ui-border-width-thick`
now hold them, and all 154 sites bind — a border width is exactly the kind of value
a Figma stroke Variable wants.

**The nine `1.5px` control outlines fold into `thick`.** A half-pixel border
renders blurry at 1x device-pixel-ratio, and rendered side by side the two weights
were not distinguishable — checked before and after on checkbox, radio, the outline
button, card, avatar ring and stepper circle. Left literal on purpose: AtlToast's
4px accent bar and AtlRadio's 6px dot, which are graphic devices drawn with
`border-width`, not border weights.

**The 12 bypasses bind; the 13th does not.** AtlProgress's `opacity: 0.5` lives
under `prefers-reduced-motion` and means "the animation is off", not "disabled" —
binding it to `--ui-opacity-disabled` would tie a motion fallback to the disabled
scale on the strength of a coincidence. It is exempt by name, with the reason.

**The 116 component dimensions stay literal, deliberately.** That is the part of
Decision D this ADR does *not* close: a rebuilt Figma master still cannot bind a
Variable to an avatar size or a toggle track, because no token holds them. The gap
is now a recorded decision rather than an accident.

**`check:token-bypass` enforces exactly the rule that was broken**, per-property
family so it can never suggest a spacing token for a width, with exemptions split
`design` (silent) / `gap` (warns every run) like the other allowlists, and a
`[STALE-EXEMPT]` check so an exemption cannot outlive its literal. All four
outcomes are negative-tested.

**`check:geometry` grew because binding the tokens put eight more components on its
roster** — select, combobox, tabs, menu, code-block, dialog, drawer, chat — taking
it from 12 measurements to **36 (10 components × 3 frameworks)**. The tab and the
header were then fixed: the tab derives its padding from the height, and the header
sets no block padding at all, because it is a centred flex row where `min-height`
alone should decide and deriving padding from the label's font metrics only moves
the guess somewhere else.

## Consequences

- **Two live height defects are gone**, and the class is now visible: any control
  that hardcodes a height token's value fails `check:token-bypass` before it can
  hide from `check:geometry`.
- **Writing the gate found two bugs in the previous gate.** `hostify` rewrote
  `:host(atl-chat-header)` to the nonsense selector `atl-chatatl-chat-header`,
  because it assumed one component per stylesheet — so that rule matched nothing
  and the fixture measured an unstyled box. And one fixture was missing a class
  Angular's host actually carries. Both were mine, both from yesterday.
- **154 border declarations are longer to read.** `border: var(--ui-border-width)
  solid var(--ui-color-border)` says more than `border: 1px solid …`; the trade is
  a stroke weight that can change in one place and bind in Figma.
- **The token file grew by two entries, not a hundred.** Both are annotated in
  `tokens.manifest.ts` with the constraint that keeps them honest.
- **`check:all` is 25 gates.** 1319 tests green across the three frameworks.
