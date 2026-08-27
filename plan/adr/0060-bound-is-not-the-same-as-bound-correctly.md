---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0047-bind-the-literals-that-duplicate-a-token.md (the gate this corrects — it asks whether, not which)
  - plan/adr/0059-the-file-was-in-the-wrong-typeface.md (the same shape, one property over)
  - plan/adr/0041-control-height-is-the-primitive.md (the ladder the page buttons were off)
---

# ADR-0060: Bound is not the same as bound correctly

## Status

Accepted. Adds `[ROOT-PAINT]` to `check:figma`, five generated effect styles, and a
page-layout pass over the Components page.

## Context

Fixing AtlCodeBlock's typeface (ADR-0059) meant reading AtlMenu next, to build the
child masters against it. Its root came back **bound** on every paint property and
**wrong on three of them**:

| | Figma bound to | `.atl-menu` says |
|---|---|---|
| background | `color/surface` | `--ui-color-surface-raised` |
| radius | `radius/sm` (8px) | `--ui-radius-lg` (14px) |
| box-shadow | *nothing* | `--ui-shadow-lg` |
| hovered item | `color/info-bg` | `--ui-color-surface-sunken` |

`[TOKEN]` (ADR-0047) was green, and correctly so: it asks *whether* a value is bound
to a variable, never *which* variable. A wrong binding is indistinguishable from a
right one at that resolution — and it is the more dangerous failure, because it looks
deliberate and survives every review that checks for raw hex.

A census of all 29 master roots against their CSS found this everywhere:

- **48 divergences across 15 masters.** Wrong variable (Card `surface` for
  `surface-raised`, Dialog/Toast/Alert/Menu/CodeBlock `radius/sm` or `md` for `lg`,
  Textarea/Select `color/border` for `input-border`), missing paint (Button's
  variant borders, Badge's default border), and invented paint (TabGroup and
  AccordionGroup drew a bordered card where the CSS root paints nothing at all).
- **Not one master carried a single effect**, while eight CSS roots set a
  `box-shadow`. The shadow had never been transferred, and the file had no way to
  express one: the "Effects Tokens" collection holds `e/0…e/5` as **STRING**
  variables, which cannot paint anything.
- **Aliases hid three of them.** `--ui-color-input-bg` is
  `var(--ui-color-surface-sunken)`, so Input/Textarea/Select bound to the alias
  *target*. Identical pixels today, and wrong the moment the alias moves — which is
  the entire reason the semantic layer exists.

Two page-level defects surfaced while verifying the fixes, both purely visual and both
invisible to every gate: **14 of 27 COMPONENT_SETs were smaller than their own
variants** and clipped them (AtlDialog was 360×170 holding 800×1111 of content, so most
of its size variants could not be seen at all), and the four "content samples" from
ADR-0056 held every text node at `x=0, y=0` — five labels stacked on one spot, hidden
only because the frame around them was wide enough to look plausible.

## Decision

**1. `[ROOT-PAINT]`: compare the bound variable's NAME to the token the CSS names.**
An explicit table maps each master to the CSS rule whose paint its root carries, as a
*cascade* — `['.atl-button', '.atl-button.variant-{variant}']` — with `{axis}`
substituted from the variant being checked. Every variant is checked, not just a
sampled one: AtlCard's fill comes from the base rule and `.variant-flat` overrides it,
so a per-master verdict is wrong for one variant in three. Findings are grouped by
message so 24 variants produce one line.

The check runs in both directions. A master that paints what the CSS does not is as
wrong as one that omits what it does — that direction is what caught TabGroup and
AccordionGroup.

**2. Five effect styles, generated from `tokens.css`.** `shadow/xs…xl`, each carrying
the token's real layers (offset, blur, spread, colour), each describing itself as
generated. Figma has no effect *variable* type, so a style is the closest thing to a
token — and it is checkable by name. Light mode only, stated in the description: styles
have no modes, so the dark-mode shadow cannot ride along.

**3. Per-side borders are modelled.** Three components paint one edge rather than a
box: AtlToast's 4px left accent (`border-left` plus a per-variant
`border-left-color`), the tab list's bottom rule, the accordion group's top rule.
Reading only the four-side shorthand reported the accent as an invented stroke — the
gate now resolves `border-<side>` and compares Figma's four `stroke<Side>Weight`
values.

**4. Variants painted by a pseudo-class are skipped, loudly.** `state=hover`,
`focus`, `active`, `invalid`, `open` take their paint from `:hover`,
`:focus-visible`, `:active`, `.is-invalid`, `.is-open` — rules a static selector
table cannot resolve. Comparing them against the base rule reported the master as
wrong where it was right (AtlButton's hover fill *is* `color/primary-hover`). Those
variants are excluded and the exclusion is a WARNING naming the count and the states,
so the hole is visible in every run rather than silent.

**5. The Components page was reflowed.** Every COMPONENT_SET resized to contain its
variants (26 changed — 14 were too small and clipping, 12 merely wasteful), every
wrapper frame regrown, every section restacked, and the two masters that had been
floating outside any section (`Navigation/AtlBreadcrumbs`, `Navigation/AtlPagination`,
left behind by ADR-0056's set removal) moved into Navigation. The four content samples
were rebuilt as auto-layout rows carrying the real spacing — breadcrumbs `gap: 0` with
the link's own `4px 8px` padding, pagination `gap: var(--ui-spacing-2)`.

**6. AtlPagination brought to `.page-btn`.** Its buttons were 32×32 with a 4px gap
against a CSS `min-width`/`height` of `2.25rem` (36) and `gap: var(--ui-spacing-2)`
(8); its prev/next controls in the content samples still read `‹ Prev` / `Next ›` as
text, months after the same glyphs were removed from the master — `[MASTER-GLYPH]`
walks masters, and a content sample is a plain frame.

## Consequences

- A wrong binding now fails the build with the token it should have been. Verified by
  fixing all 48 and re-running: `check:figma` green, `check:all` exit 0.
- The masters carry shadows for the first time, from the same source as the CSS.
- **A gate's resolution is part of its claim.** `[TOKEN]` was never wrong; it answered
  a narrower question than the one everyone read it as answering. When a check passes,
  the useful question is not "is it green" but "what exactly did it compare".
- **Inner layers remain unchecked, and they diverge at the same rate.** Every master
  fixed here exposed a defect one level down: AtlMenu's items are 41px tall with 12px
  inline padding and a `color/info-bg` hover against a 40px row with 16px and
  `surface-sunken`; its separator has no margins; AtlPagination's buttons paint a fill
  and border where `.page-btn` paints `transparent`; the tab list has no bottom rule.
  A `[LAYER-PAINT]` check needs a per-LAYER table the way this one needed a per-master
  one — recorded as the next piece of work, not attempted here.
- Recorded as open, each with the fact that was measured: `color-mix()` paints four
  components (Avatar, Badge, Toast, Alert variants) and **no Figma Variable can express
  it**, so those fills are unverifiable by construction; two variable collections carry
  the same ten spacing values and the same five radii (`Primitive Tokens` `spacing/sN`,
  `radius/r-*` versus the generated `Library Tokens`); and "Effects Tokens" holds
  eleven STRING variables that cannot paint and now duplicate `shadow/*`.
