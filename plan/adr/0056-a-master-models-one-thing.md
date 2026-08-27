---
status: accepted
date: 2026-08-27
sources:
  - tasks/design-findings-2026-08-26.md (E4, G6, H2, H3, J4 — five findings, one shape)
  - plan/adr/0046-one-concept-one-drawing.md (the principle this applies to masters)
  - plan/adr/0045-readonly-only-where-it-is-enforced.md (the move whose drift this gate caught)
---

# ADR-0056: A master models one thing, and its axes are its API

## Status

Accepted. Sets the conventions the Phase 3 rebuild works to, and gates the claims
that were previously prose.

## Context

Five census findings described the same problem from five sides: masters vary
themselves to show a child (H3, G6, J4), carry axes that picture an outcome rather
than name a prop (H2), and declare Boolean properties whose stated spec mapping does
not hold (E4). None of it was checkable, because the snapshot records `variantAxes`
as data and Boolean properties only inside the prose description.

Counting made the first part concrete. **61 exported React components, 29 masters:
33 parts of the public API have no drawing at all** — AtlIcon, AtlMenuItem, AtlTab,
AtlStep, AtlOption, every Chat part, every Card/Dialog/Drawer slot, the table
primitives. The container axes that "claim their children's states" are what a
library does when the children are not drawable.

## Decision

**A part gets its own master when it has a visual state a designer sets.** Active,
selected, disabled, filled. Layout-only slots and invisible infrastructure stay
inside their container. Applied to the 33:

| gets a master (11) | stays in the container (19) | no visual (3) |
|---|---|---|
| AtlIcon, AtlMenuItem, AtlMenuSeparator, AtlTab, AtlStep, AtlOption, AtlChatMessage, AtlChatSuggestion, AtlChatTyping, AtlAccordionItem, AtlBreadcrumbItem | Card / Dialog / Drawer × Header, Content, Footer; AtlChatHeader, AtlChatInput, AtlChatMessages, AtlAccordionHeader, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd, AtlMenuTrigger | AtlToastProvider, AtlToastContainer, AtlToastItem |

Rejected: a master for all 33. "One concept, one drawing" is the right principle and
`AtlTr` is not a concept a designer adjusts — it would add variants for things with
no settable appearance and leave a designer searching 62 entries.

**A variant axis names a prop, or it does not exist.** An axis is the master's API
surface; a reader sees API where there is none otherwise. The pictures those axes
were carrying — three breadcrumbs, a middle page — belong on an example page as
instances. Rejected: keeping them with a "gallery-only" note, because the note is
prose, and prose claims about masters had already been wrong twice that day without
any gate noticing.

**And the prose claims become checked.** `check:figma` gains four codes:

- `[BOOL-CLAIM]` — a description says `Boolean \`x\`: maps to YSpec.field`; the gate
  resolves `YSpec` through `extends` and requires both that the field exists **and
  that the component's own spec resolves to that interface**.
- `[BOOL-MISSING]` — a spec flag the master offers no way to set, as a Boolean *or*
  as a variant-axis value.
- `[AXIS-NAME]` — an axis whose name is buried in a real prop's name.
- `[AXIS-NOT-A-PROP]` — an axis that names nothing in the spec.

## Consequences

- **Ten findings, where there had been prose.** Two were repaired the same day and
  are gone: AtlInput's and AtlTextarea's `readonly` claimed `AtlFormFieldSpec`, which
  ADR-0045 had emptied of it — **drift our own decision caused**, invisible for a
  month. Eight remain as warnings and are the Phase 3 work order.
- **The eight were deliberately not executed.** Each is a drawing, not a property
  call: removing an illustration axis deletes variants from the live file, and adding
  a Boolean that toggles nothing would be a second kind of false claim. A gate that
  states the work is the deliverable here; doing it is the rebuild.
- **Two of my own checks were wrong before they were right, and both times the data
  said so.** The first `[BOOL-CLAIM]` only asked "does that interface have that
  field", which passes AtlRadio — whose master claims `AtlFormFieldSpec.invalid`
  while `AtlRadioSpec` extends nothing. The first `[BOOL-MISSING]` assumed a flag can
  only be a Boolean, and reported AtlInput's `invalid` as missing when it is a value
  of the `state` axis. Both were found by reading the output against the source
  rather than by trusting a green run.
- **`[AXIS-NAME]` is the more useful half of a bucket I nearly merged.** AtlTooltip's
  axis `position` is not a fiction — the prop is `atlTooltipPosition`. Reporting it
  as "not a property" would have sent the reader to delete a real axis.
- **Open: the snapshot still carries Booleans as prose.** The gate parses the
  description because that is where they live. Capturing
  `componentPropertyDefinitions` in `figma-snapshot.mjs` would make them data and the
  check exact; it needs the bridge, which the refresh step already has.
