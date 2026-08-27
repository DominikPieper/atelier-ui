---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0035-typography-instrument-pair.md (the decision this file never received)
  - plan/adr/0049-every-component-states-its-typeface.md (the same rule, one side of the boundary)
  - plan/adr/0048-a-stated-height-cannot-be-content-driven.md (the stated-leading rule, applied to code)
  - plan/adr/0058-the-master-facts-nothing-was-reading.md (the gate this extends)
---

# ADR-0059: The file was in the wrong typeface

## Status

Accepted. Adds `[FONT-FAMILY]` and `[TEXT-STYLE]` to `check:figma`, replaces the
Figma text styles, and corrects `--ui-type-code`.

## Context

The child-master build began by reading an existing master's text node to copy its
font. It came back **Inter** — a typeface `tokens.css` has not named since ADR-0035
chose Instrument Sans and Instrument Serif. A census of the whole Figma file found
three typefaces, none of them the library's:

| Where | Was | `tokens.css` says |
|---|---|---|
| Components (705), Inventory (539), Icons (73), Workshop templates (24) | Inter | Instrument Sans |
| Colors, Typography, Spacing & Radius, and all 19 `ty/*` text styles | Montserrat, Libre Baskerville | Instrument Sans / Instrument Serif |

Two things made this survivable for months, and both are the finding rather than the
excuse:

1. **No gate could see a typeface in Figma.** `check:typeface` (ADR-0049) reads the
   CSS — it proves the *library* carries `--ui-font-family` on a root and never
   inherits a leading, and it had been green throughout. The
   Figma snapshot recorded names, axes, descriptions, bindings and glyphs, but not one
   font. So the transfer *target* was unchecked on the one property every text node in
   it has.
2. **The text styles documented a scale the library never had.** Nineteen `ty/*`
   styles — `caption`, `body-xs`, `label-xs-strong`, `name`, `serif-sm`, `headline-xs`,
   `display-lg` — at sizes (11, 17, 22, 46) that do not appear in `--ui-font-size-*`.
   Each was used **exactly once**: by its own specimen row on the Typography page.
   1602 text nodes carried no style at all. They were not a contract anyone consumed;
   they were a picture of a different design system, in a picker designers reach for.

Two smaller facts fell out of the same census:

- The Inventory tiles for AtlPagination and AtlBreadcrumbs were instances of
  **orphaned** main components (`…/first`, `…/3`, `mainParent: null`) — nodes Figma
  keeps alive only because an instance references them, left behind by the botched
  `COMPONENT_SET` removal in ADR-0056's cleanup. They still drew `‹ Prev` / `Next ›`
  and a three-level breadcrumb, i.e. the *pre-fix* geometry, months after the master
  was fixed. `findAll` cannot reach them, so every sweep since had silently skipped
  them.
- `--ui-type-code` resolved its leading through `--ui-line-height-normal` (1.5) while
  the only component that sets `--ui-font-mono`, `.code-block-pre`, uses
  `--ui-line-height-code` (1.65). The role token and the component disagreed, and
  `--ui-line-height-code` was otherwise dead. Nothing referenced `--ui-type-code`, so
  nothing surfaced it.

## Decision

**1. One typeface census, applied.** All 1621 text nodes in the file now sit in a
family `tokens.css` declares: Inter → Instrument Sans (weight-mapped, `Semi Bold` →
`SemiBold`), Montserrat → Instrument Sans, Libre Baskerville → Instrument Serif. Sizes
and leadings were left untouched — this pass changes the family, not the scale.

**2. Nineteen text styles replaced by eight roles.** The local styles are now exactly
one per `--ui-type-*`, named `ty/<role>`, carrying that role's family, weight, size and
leading, and each describing itself as generated from the CSS. The Typography page is
rebuilt from them: every caption is derived from the style it sits under, so it cannot
go on claiming "Montserrat Regular" under an Instrument Sans specimen the way all 19
old captions did the moment the sweep ran.

**3. `--ui-type-code` points at `--ui-line-height-code`.** The role now agrees with the
component. Safe by inspection: no component referenced `--ui-type-code`.

**4. Two gate codes, file-level rather than per-component.** A typeface is a property
of the file, and both defects are file-shaped:

- `[FONT-FAMILY]` — BLOCKER when any text node sits in a family `tokens.css` does not
  declare, with the count and one sample location. A node mixing fonts inside one
  string is a WARNING: its family cannot be verified either way.
- `[TEXT-STYLE]` — BLOCKER when a `--ui-type-*` role has no `ty/<role>` style, when a
  style's family/weight/size/leading diverges from its role, or when a `ty/*` style
  exists for a role the CSS does not have. The leading comparison uses a 0.5%
  tolerance: Figma stores 165% as `164.9999976158142`.

The snapshot probe grew a file-wide typography read (family tally, one sample per
family, and every local text style) in the same round trip. `probe` is now
`{ masters, typography }`.

**5. AtlCodeBlock brought to its own CSS.** The typeface sweep had put its code in the
UI font; restoring mono exposed four more divergences in the same component, all fixed
together: the label carries `letter-spacing: 0.03em`; the code leading is **stated** at
165% with a zero stack gap instead of left on `AUTO` plus a 4px gap that happened to
land near the right total (the stated-leading rule of ADR-0048 and ADR-0052, in a place the
row-ladder pass never looked); the header is the **row recipe** — `padding-block: 0`, `padding-inline: 16`
bound to `spacing/4`, `min-height: 40` — where Figma had 8/12 and no minimum, i.e. 36px
against a 40px token; and the line-number gutter got `min-width: 2rem`, right
alignment, and the `border-right` the CSS draws, as a 1px rule bound to `color/border`
between two 12px gaps that reproduce its `padding-right` and `margin-right` exactly.
Total: 36 + 204 → 40 + 216 = 256, which is what the CSS computes.

**6. The two orphaned Inventory instances were swapped onto their live masters** and
their overrides reset. This is why they mattered: the *only* thing that revealed them
was a sweep that touched every text node in the file and found nine it could not
change.

## Consequences

- The transfer target is in the library's typeface, and a fourth family cannot enter
  the file without failing `check:figma`. Tested by injecting all five defect shapes
  into the snapshot — a foreign family, a missing role, a wrong size, a wrong family,
  and a stale `ty/caption` — each produced its blocker; restoring gave green.
- Designers now pick from eight styles that are the library's roles, not nineteen that
  were a different system's. Anything a role does not cover is a gap in
  `--ui-type-*`, which is the right place to argue about it.
- **A generated page can lie the moment its subject changes.** The Typography page's
  captions were true when written and false within one script run. Deriving each
  caption from the style it documents is the cheap fix; the general rule is that a
  hand-written fact *about* a generated thing is a fact with no gate.
- **`findAll` is not "everything in the file."** Figma keeps a removed main component
  alive while an instance references it, invisible to any tree walk. Two Inventory
  tiles had drawn stale geometry for months. Detecting them needs the *instance* side:
  walk instances, resolve `getMainComponentAsync()`, and assert the result is reachable
  from the document. That check is not yet a gate — recorded as open.
- Left open deliberately, and recorded in `tasks/todo.md`: two variable collections
  carry the same ten spacing values (`Primitive Tokens` `spacing/sN`, `Library Tokens`
  `spacing/N`, the latter generated from `tokens.css`), which is a trap in the picker;
  and `.code-block-copy` / `.code-line-number` hold raw literals — `font-weight: 500`,
  `600`, `0.3rem`, `0.55rem`, `2rem` — that the off-scale pass did not cover, because
  it covered type and these are weight and spacing.
