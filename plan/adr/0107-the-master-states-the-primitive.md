---
status: accepted
date: 2026-09-07
sources:
  - 'plan/adr/0041-control-height-is-the-primitive.md (§Decision: block padding is DERIVED from the control height; this ADR carries that consequence into Figma)'
  - 'plan/adr/0052-the-row-is-the-second-ladder.md (the row-vs-control distinction that decides which masters this applies to)'
  - 'tools/scripts/check-figma.js (the ROOT-BOX rule that reported the drift, and whose expectation this decision invalidates)'
  - 'Claude Design project 7a6a2f19-9a3c-4dd9-9828-65c7cc67766c — AtlButton.dc.html (states the sync direction: code and sheet canonical, master rebuilt from them)'
  - 'this session'
---

# ADR-0107: The master states the primitive, not the value derived from it

## Status

Accepted.

## Context

`check:figma`'s ROOT-BOX rule had been reporting the same class of drift on six
masters for some time, and the six had been resolved in **opposite directions**:

| master      | Figma block padding | code derives |
| ----------- | ------------------- | ------------ |
| AtlButton   | 8 (sm/md), 12 (lg)  | 9, 9, 11     |
| AtlInput    | 12                  | 9            |
| AtlBadge    | 4                   | 3            |
| AtlTextarea | **0**               | 10           |
| AtlSelect   | **0**               | 9            |
| AtlTab      | **0**               | 11.25        |

Three carried a resolved number; three carried nothing. Nobody had decided which
was right, so the gate warned either way and the warnings had gone quiet.

ADR-0041 made the control _height_ the primitive and derives block padding from
it:

```
padding-block: calc((height − line-height × font-size) / 2 − border)
```

A Figma master cannot express that. There is no Variable that holds arithmetic
over three other tokens, so the master can only carry the _resolved_ number —
which means it silently goes stale the moment the font size, the leading or the
control height moves. The gate's own warning text had already framed the choice:
_"Keep the number in step, or decide the master should not pad at all and let the
stated height do the work."_

The load-bearing observation is that **both sides already pin the height.** The
CSS states `min-height: var(--ui-control-height-*)` and the master states an
explicit height (button 32/40/48, input 44, badge 22/17). For a fixed-height
control the block padding therefore changes nothing about the rendered box — it
is decorative in the master and derived in the code.

One distinction decides the whole shape of this, and it is visible in a single
declaration:

```css
padding: calc((…height…) / 2 − 1px)   1.125rem;
         └─ derived (block) ─────┘   └─ stated (inline) ─┘
```

ADR-0041 derives only the **block** axis. The **inline** padding is a stated
design value. Treating "no padding" as an axis-blind rule would have pushed
`AtlInput`'s text flush to its left edge (`primaryAxisAlignItems: MIN`) and
shrunk `AtlBadge`, whose width is `AUTO`/hug.

## Decision

**A master states the height and carries no block padding. Inline padding stays,
and must be bound to a Figma Variable.**

Applied: `Action/AtlButton` (24 variants), `Form/AtlInput` (5),
`Display/AtlBadge` (10) — block padding to 0. `AtlTextarea`, `AtlSelect` and
`AtlTab` already sat at 0 and are now correct rather than exceptional; they
needed no edit. Heights unchanged throughout.

Rejected: **sync the resolved numbers into all six.** It preserves a designer's
view of real spacing, at the cost of a re-sync obligation on every recipe change
— the obligation that produced this drift in the first place. It also has to
write `11.25px` into `AtlTab`, a half pixel that renders blurry at 1× and is not
a value any token holds.

Rejected: **decide per component.** Most locally correct, but it leaves no rule
for a gate to encode and re-opens the question for every new component.

## Consequences

- The drift class is gone rather than re-synced. A change to `--ui-font-size-md`
  or `--ui-line-height-tight` can no longer stale a master, because the master
  no longer restates anything that depends on them.
- **`check:figma`'s ROOT-BOX rule now encodes the wrong expectation.** It still
  compares the master's block padding to the derived value, so all six masters
  warn — correctly by the old rule, wrongly by this decision. Until the rule is
  updated to expect block padding 0 and to compare only the inline axis, those
  six warnings are noise that will teach the next reader to ignore the gate.
  This ADR is not finished until that rule changes.

  **Corrected 2026-09-07:** the rule changed. `tools/scripts/check-figma.js`
  now names the six masters in a `BLOCK_HEIGHT_DERIVED` set and, for the BLOCK
  (top/bottom) axis only, no longer compares them to the CSS's `calc()`-resolved
  number — it asserts the axis is exactly 0, aggregated across every checked
  variant so a regression on one cannot be masked by another that still reads
  0 (still tagged `[ROOT-BOX]`, still WARNING — unchanged severity). The INLINE axis is
  untouched in mechanism, per this ADR's own §Decision, and its "not on the
  spacing scale" message was reworded to stop blaming ADR-0041's arithmetic for
  a value that was never a `calc()` in the first place. Verified against the
  committed snapshot: the six warnings are gone and none appeared in their
  place (14 → 8 total). One of the "Three things this surfaced" below —
  AtlButton's raw, off-scale `sm`/`md` inline padding — turned out to be a
  second, independent gap the same fix exposed once the block axis stopped
  swallowing it every run; it is now `AtlButton:root-paint:padding-off-scale`
  in `FIGMA_CONFORMANCE_EXCEPTIONS`, not silently absorbed, and stays open
  until the "Left open" choice below is made.

- Masters keep an explicit height, which is now the only thing they say about
  their own box. That is a real reduction in what a designer can adjust in
  Figma, and it is deliberate: the adjustable value lives in `tokens.css`.

### Three things this surfaced, none of them the thing being fixed

**The code's inline button padding is off the spacing scale.** `0.875rem` (14px)
and `1.125rem` (18px) are not steps on the 0.25rem scale, so no `spacing/*`
Variable can hold them. Figma carried 16/20/24 bound to `spacing/4`, `spacing/5`,
`spacing/6` — the master was _not_ stale here, the code is unexpressible. Left
open: bring the code onto the scale (a visual change to a shipped component), or
accept off-scale inline padding and say so.

**The master's label text is Instrument Sans Medium (500) where the code asks for
`--ui-font-weight-semibold` (600)**, on all three button sizes. No box-geometry
rule covers weight; this belongs with the 257 `TEXT-UNSTYLED` nodes across 29
masters that `check:figma` reports at its recorded baseline.

**Every `AtlButton` label node had `textAutoResize: 'HEIGHT'`** — a fixed width
baked from a stale measurement — and the `md` node's 51px was fractionally too
narrow for "Button" at 16px, so all eight `md` variants rendered "But / ton"
across two lines. Fixed by setting `WIDTH_AND_HEIGHT` so the label hugs and the
wrap is impossible by construction. No gate had ever reported it; it was found by
looking at a screenshot of the master.

### The mistake, recorded because the reasoning was wrong and not just the value

I first wrote the code's numbers into the master on the strength of "the code is
canonical" — including the inline padding, raw. That broke two `spacing/*`
variable aliases and turned a non-blocking warning into
`✗ [CRITICAL] [TOKEN] AtlButton: raw padding/gap (not bound)`. The gate was
right and I was wrong: **"code is canonical" does not outrank the token-binding
rule.** It means the master follows the code _where the code is expressible in
tokens_, and where it is not, that is a finding about the code — not a licence to
denormalise the master. Re-bound `sm`/`md`/`lg` to `spacing/4`/`5`/`6`;
`check:figma` returned to exit 0.
