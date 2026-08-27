---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0056-a-master-models-one-thing.md (the criterion this refines)
  - plan/adr/0060-bound-is-not-the-same-as-bound-correctly.md (the gate these ten join)
  - plan/adr/0061-what-a-property-turns-on-must-be-checked-while-it-is-off.md (the Booleans these ten inherit)
---

# ADR-0062: A part promoted to a master becomes checkable

## Status

Accepted. Adds ten child masters, refines ADR-0056's criterion, and fixes three bugs in
the gates that reported the new masters wrongly.

## Context

Ten parts of the library had no master of their own: the menu item and separator, the
tab, the step, the select option, the accordion item, the breadcrumb item, and the
chat message, suggestion and typing indicator. They existed only as layers *inside*
their parent masters.

That is the same set of layers `[ROOT-PAINT]` (ADR-0060) could not reach, and the
reason is structural rather than incidental: **the gate compares a master's ROOT to the
CSS rule that paints it.** A part drawn as a layer has no root, so nothing compares it —
which is why every master fixed in ADR-0060 exposed a defect one level down. Promoting a
part to a master does not merely tidy the file; it converts an unreachable layer into a
checkable root.

Two of the ten have **no spec interface at all**. `AtlMenuSeparator()` takes no props and
renders `<hr class="atl-menu-separator">`; the typing indicator takes none and renders
three dots. ADR-0056's criterion — "a visual state a designer sets" — would exclude both,
and that is wrong: a designer needs to place a separator between menu groups.

## Decision

**1. A part earns a master by being independently PLACEABLE or by having its own
state.** ADR-0056's criterion is widened by one clause. Placement is a use; a part that
can only ever be drawn inside a parent's fixed composition is still a layer.

**2. Ten masters, each drawn from its own CSS rule** and each carrying a description
that states the spec mapping, why each axis is an axis, and every exemption in the form
the gates read:

| Master | Axis | Booleans |
|---|---|---|
| AtlMenuItem | `state` default \| hover | `disabled` |
| AtlMenuSeparator | — | — |
| AtlBreadcrumbItem | `current` false \| true | — |
| AtlTab | `state` default \| active | `disabled` |
| AtlStep | `state` default \| active \| completed \| error | `description`, `optional`, `disabled` |
| AtlOption | `state` default \| hover \| active \| selected | `disabled` |
| AtlAccordionItem | `expanded` false \| true | `disabled` |
| AtlChatMessage | `role` assistant \| user \| system | `failed` |
| AtlChatSuggestion | — | `hint` |
| AtlChatTyping | — | — |

Three decisions inside that table are worth their own line:

- **`:hover` and `:focus-visible` paint the same background on a menu item**, so focus
  is not a third drawing (ADR-0046).
- **`current` and `expanded` are AXES, not Booleans.** Each both recolours something and
  adds or removes an element — `current` drops the separator, `expanded` reveals the
  panel and rotates the chevron 180°. A Boolean binds only to visibility, so it cannot
  express either.
- **AtlTab's block padding is drawn as centring in a 40px min-height box.** Its CSS
  derives the padding from `--ui-control-height-md` (ADR-0041); the derived value is
  11.25px, which no token can bind. Centring is the same measurement without a raw
  number.

**3. AtlTabGroup's `disabled` now has a home.** It was removed from the group in
ADR-0061 because `AtlTabGroupSpec` has no such field; `AtlTabSpec.disabled` does, and
AtlTab now carries it.

**4. Three gate bugs, found by the new masters and fixed:**

- **`[NAME]` derived axis names by stripping any prefix.** `AtlTab` is a prefix of both
  `AtlTabGroupVariant` and `AtlTableVariant`, so the gate demanded axes named
  `groupVariant`, `leVariant`, `leSize` and `leAlign`. The remainder must be an axis
  word, not merely what is left over.
- **`[BOOL-MISSING]` accepted an axis *value* named for a boolean field but not an axis
  *name*.** `current` = false | true is the property, drawn.
- **`[ROOT-PAINT]` compared stroke widths where nothing paints a stroke.** Figma keeps a
  default weight of 1 on a node with no stroke paint at all, so `border: none` read as a
  1px box.

**5. The icon library was entirely token-unlinked.** Registering the masters surfaced a
raw fill on a chevron vector; the sweep found **all 25** icon masters carrying raw
paints. `.atl-icon` sets `color: currentColor`, which Figma has no equivalent for, so
each vector is now bound to `color/text` as the default context colour and each instance
overrides where the context differs. The status icons (success, warning, danger, info)
lose their tint by this change, correctly: the component takes its colour from the
surrounding text, never from the icon.

## Consequences

- 29 masters became 39, all in `check:figma`'s roster: zero errors, eight advisory
  warnings, all of them the stated pseudo-class exclusion. `check:all` exits 0.
- Each of the ten also carries an Inventory card with a live instance, per the file
  convention, and the TOC now reads 39 across seven sections.
- **Structure decides checkability.** The reason these ten were the least-verified part
  of the library was not neglect — it was that a layer has no root to compare. Modelling
  a part as a master is what makes a rule about it expressible.
- Recorded as open: `AtlOptionSpec` shares the `select` metadata module, so AtlOption
  inherits AtlSelect's `variantMatrix` (which pictures the trigger: default | filled |
  hover | focus | open) and its `role: 'combobox'`. A child spec needs its own metadata
  module. Allowlisted with that reason meanwhile.
- Also recorded: the Inventory cards' meta and property text is hand-written and drifts —
  AtlBreadcrumbs' card still read `COMPONENT_SET · 209×17px` with an `items` VARIANT row
  months after ADR-0056 removed that axis and collapsed the set. The ten new cards were
  generated from the master, which is what the other 29 need too.
