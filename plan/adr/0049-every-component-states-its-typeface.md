---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0035-instrument-sans-and-serif.md (the typeface this makes true)
  - plan/adr/0036-type-roles.md (the layer this ADR does *not* adopt, and why)
  - plan/adr/0043-the-geometry-contract-ships-with-the-component.md (the same argument, for box-sizing)
  - libs/spec/src/tokens.manifest.ts (the constraint this reinterprets)
---

# ADR-0049: Every component states its typeface

## Status

Accepted. Every component declares `--ui-font-family` once, on its own root;
`check:typeface` (gate 26) enforces that and two ways of getting it wrong.
ADR-0036's `--ui-type-*` roles remain unadopted, deliberately — see below.

## Context

`--ui-font-family`'s manifest constraint reads "Apply on :root or the app shell —
do not respecify per component". Twenty-five component roots respecified it anyway
and the rest did not, which looked like 25 violations to clean up. Measuring it
inside an app whose own typeface was Georgia showed the opposite:

| renders Instrument Sans | renders the app's Georgia |
|---|---|
| Button, Input, Toast, Table | **Card, Dialog, Chat, Skeleton, AvatarGroup** |

A card next to a button, in one app, in two typefaces. Angular had five more
(accordion, card, chat, drawer, skeleton). The 25 declarations were not the defect —
the missing ones were.

Read strictly, the constraint asks the *consumer* to apply the typeface. This repo
has now measured that failure mode twice in one day: Storybook supplied neither a
box-sizing reset nor a font application, so components rendered with the wrong
geometry (ADR-0043) and the system font. Anything a consumer must remember can be
forgotten, and then the component is wrong in a way no gate here can see.

## Decision

**Each component declares the typeface once, on its own root.** This is ADR-0043's
argument applied to type: it ships in the same file as the component, so it cannot
go missing, and one declaration per root is the smallest form of that.

The constraint's intent is preserved rather than broken — one place per component
decides, and that place is the root. The manifest wording is amended to say so.

Three failure modes, all found by measuring and now all gated:

- **`[NO-TYPEFACE]`** — a component that declares it nowhere. Eight roots across
  React/Vue and five Angular hosts were in this state.
- **`[DESCENDANT]`** — declared on something inside the root instead. AtlChat had
  four such declarations *and no root one*, so it was only correct while those
  particular children were on screen. `--ui-font-mono` and `--ui-font-display` are
  exempt: a code element and a display line carry a different face by design.
- **`[RESET-WIPED]`** — declared and then wiped by `all: unset` further down the
  same rule. Not hypothetical: the dialog's new declaration was silently reset this
  way, and the fix is to sit below the reset. An element that resets everything must
  restate the typeface itself, so those are exempt from `[DESCENDANT]`.

**The `--ui-type-*` roles stay unadopted, and that is the finding of this pass.**
Measured against the resolved values, ADR-0036's eight roles fit **5 of 105**
typography rules without changing what renders; 83 of the 105 set a single axis (a
size or a weight), which is a tweak rather than a role. The reason is structural: a
role sets all four axes, and almost every component leaves `line-height` unset and
inherits `normal`. Adopting the layer therefore means committing to explicit
line-heights in about 24 components — a typography redesign, not a migration. It
belongs in the redesign, where changing leading is the intent rather than a side
effect. ADR-0048 has already done it for the five controls where determinism forced
the issue.

## Consequences

- **The library's typeface is now consistent**: 0 of 29 components inherit the
  consuming app's font, in all three frameworks. Verified by rendering each root
  inside a Georgia page, per framework, including Angular via host-selector
  rewriting.
- **Two redundancies went with it**: five descendant declarations removed, and
  AtlCodeBlock's `var(--ui-font-mono, 'Menlo', 'Monaco', …)` fallback lists reduced
  to `var(--ui-font-mono)` now that the token carries its own stack.
- **The manifest constraint changes meaning slightly.** "Do not respecify per
  component" becomes "declare it once on the component root" — a real amendment,
  made because the strict reading depends on the consumer.
- **The gate found three bugs in itself first.** Its `RESET-AFTER` test had the
  comparison inverted and flagged the correct order; its root test derived the class
  from the directory name, which is wrong for `tabs/` → `.atl-tab-group`; and it
  treated a code element's mono declaration as a defect. All three were caught by
  running it, not by reading it.
- **`plan/design-status.md`'s "Respecifies font" column now means something else** —
  it counts a deliberate root declaration rather than a violation. Worth renaming
  when the redesign revisits typography.
