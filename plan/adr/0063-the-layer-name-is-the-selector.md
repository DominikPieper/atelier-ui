---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0060-bound-is-not-the-same-as-bound-correctly.md (the root-level gate this completes)
  - plan/adr/0062-a-part-promoted-to-a-master-becomes-checkable.md (the other half of the same problem)
  - plan/adr/0052-the-row-is-the-second-ladder.md (the recipe the inner rows were missing)
---

# ADR-0063: The layer name is the selector

## Status

Accepted. Adds `[LAYER-PAINT]` to `check:figma`, renames the addressable inner layers,
and fixes six bugs in the gates found while building it.

## Context

`[ROOT-PAINT]` (ADR-0060) compares a master's root to the CSS rule that paints it, and
every master it fixed exposed a defect one level down. ADR-0062 answered half of that by
promoting ten parts to masters of their own. The other half is the layers that are *not*
separate components — a tab list, an accordion trigger, a toggle track, a page button —
and they were unchecked for a plain reason: nothing said which CSS rule a given layer
draws.

The obvious answer is a table mapping master + layer to selector. The better one is a
**convention**: a layer named for a CSS class draws that rule, so the layer name *is*
the selector. Nothing to maintain, self-documenting in the Figma layer panel, and opt-in
— a layer called `Frame` is a wrapper and simply not checked.

What stood in the way was the naming. AtlMenu had **14 layers called `Frame`**;
AtlPagination nine; AtlTabGroup five; AtlAccordionGroup nine. AtlProgress, by contrast,
already had `track` and `fill` — the convention, arrived at by hand, in one component.

## Decision

**1. The layer name is the selector.** `atl-menu-item`, `accordion-trigger`, `tablist`,
`track`, `thumb`, `page-btn`, `ellipsis`, `step-circle`. Where the CSS addresses a part
by element or attribute rather than by class — `.tablist button`, `[role='option']`,
`thead th` — a five-entry `LAYER_ALIASES` list maps the short name. That list is small by
construction: everything else is a class.

**2. `[LAYER-PAINT]` compares paint AND box.** Fill, stroke (four-side and per-side),
radius, shadow, `min-height`, `height`, padding on each edge, `gap`, and the layer's own
`font-size` and `line-height`. Resolution follows the cascade: the base rule, then the
variant-scoped form, with later declarations winning. Colour is deliberately more
permissive than geometry — a layer inside a parent is often drawn *in a state*
(the current page button, one hovered item) whose rule the variant name cannot reach, so
a fill is wrong only when no compatible rule gives the layer that colour. Geometry does
not vary by state, so it is compared strictly.

**3. Derived block padding and a centred min-height box are the same measurement.**
ADR-0041 derives padding from the control height; the derived value for a tab is
11.25px, which no token can bind. A `min-height` box that centres its line is accepted
as equivalent (ADR-0048).

**4. What it found, and what was fixed.** 33 divergences over five masters: AtlMenu's
items were 41px tall with 12px inline padding, an invented 8px inner wrapper and a
`color/info-bg` hover against a 40px row with 16px, `gap: 12` and `surface-sunken`; the
accordion trigger was 49px with 16px padding, no gap and 14px type against a **row-lg**
(56px) with 20px, `gap: 12` and 16px semibold; the tab list had no gap and no bottom
rule; the tab panel padded 20px on all four sides where the CSS pads `20px 0`; the page
buttons painted a fill and a border where `.page-btn` sets both `transparent`.

Three drawings were **invented states** the parent has no property for, now that the
child masters carry them: a teal `Paste` label (no rule gives a menu item primary text),
a `Delete` item at `opacity: 0.4` (not even the token's 0.5), an active tab drawn as a
bordered chip where the CSS paints a 3px underline, and an active pill filled with
`color/primary` where `.variant-pills .is-active` says `surface` plus `shadow/sm`. Two
`_item-border` rectangles per accordion item were replaced by the border the CSS actually
declares.

**5. Six bugs in the gates, each found by looking at a finding or a screenshot:**

- **A `const` below its call site crashed the run**, and the crash was invisible: I read
  the output through `grep -c` and reported "zero findings" without checking the exit
  code. The same hoisting mistake happened twice in one session.
- **The cascade was inverted.** Bodies were concatenated base-first and read with
  `.exec()`, which returns the *first* match — so `.atl-menu-item`'s padding beat
  `.atl-menu.variant-compact`'s.
- **Box properties were applied in a fixed property order**, not declaration order, so
  an earlier `padding-inline` survived a later `padding` shorthand that CSS would have
  reset.
- **The variant form of a descendant selector was built wrong**, producing
  `.atl-tab-group.variant-pills .atl-tab-group .tablist button`.
- **`tokens.css` was read without stripping comments.** A comment mentions
  `--ui-row-inset: 0` in prose, "first definition wins" took the paragraph, and every
  `min-height` behind a `calc()` resolved to null — silently unchecked, which is the
  worst possible failure for a gate.
- **Pseudo-element rules were accepted as the element's own paint**, so
  `.tablist button::after`'s primary excused a solid primary tab; a fill, border or
  radius that *no* rule declares was not reported at all; and a rule scoped to another
  variant excused this one.

A raw NUL byte had also found its way into the source as a grouping separator, which
made `grep` treat the file as binary and return nothing — the reason a missing check took
three attempts to locate.

## Consequences

- 39 masters, `check:figma` zero errors, `check:all` exit 0. Every defect shape verified
  by injection: wrong padding, dropped and wrong `min-height`, wrong gap, a colour no
  rule gives, an invented border, an invented radius.
- The masters now hold both ladders where the CSS holds them: rows centre at 40/48/56,
  controls pad from their height.
- **Convention beat configuration.** A table would have needed an entry per layer per
  master, maintained by hand, and would have gone stale the way the Inventory cards did.
  Naming the layer after its rule made the mapping free — and made the Figma layer panel
  readable as a side effect.
- **The permissive half is where a gate like this decays.** Colour has to tolerate states
  a variant name cannot express, and every tolerance is a place a real defect can hide:
  three of the six bugs were tolerances that were too wide. Narrow them by *what the rule
  is about* — a pseudo-element is a different box, another variant is another drawing —
  rather than by adding exceptions.
- Recorded as the next step: **compose parents from child instances.** AtlMenu's
  separators are now instances of `AtlMenuSeparator`, and its items could be instances of
  `AtlMenuItem`. Where a parent instantiates its child master, the geometry cannot drift
  at all — the gate makes drift *detectable*, composition makes it *impossible*. The
  blocker is that an instance cannot gain children, so a part taking free content (a menu
  item's icon plus label) needs the master to offer a slot.
