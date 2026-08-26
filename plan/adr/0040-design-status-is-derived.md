---
status: accepted
date: 2026-08-26
sources:
  - "the question that prompted it: how much of the library has actually been re-designed in Claude Design"
  - tasks/atelier-design-system-plan.md (Phase 3 — the Figma transfer this table gates)
---

# ADR-0040: Design status is derived, and a fragment is not coverage

## Status

Accepted. Adds `plan/design-status.md` (generated) and `check:design-status`.

## Context

"How many components have we re-designed, and which ones?" had no answer in the
repo, and the honest answer turned out to be **zero of 29** — while the facts
needed to see that were spread across five places: a Figma snapshot, a parity
record, an a11y baseline directory, 88 stylesheets, and a Claude Design project
that is not in the repo at all.

The absence mattered more than it looks. Without one view, it was possible to do
a great deal of adjacent work — seven ADRs of token infrastructure in a single
session — while the coverage number stayed at zero and nobody could see it.

There is also a tempting way to make the number look better: the typography
study contains a button row, an input and a small card inside every option card.
Counting those as coverage would report three designed components. They are
specimens sized to show type; they say nothing about how a button should look.

## Decision

**`plan/design-status.md` is generated, and every column but one is derived.**

| Column | Source |
|---|---|
| Figma axes, variants | `tools/figma/snapshot.json` |
| Parity verified | `tools/figma/parity.json` |
| a11y baseline | `tools/parity/a11y/` |
| Type roles adopted | `var(--ui-type-*)` in the component's own CSS |
| Respecifies font | `var(--ui-font-family)` in the component's own CSS |
| **Artboard** | `tools/design/artboards.json` — hand-maintained |

The artboard column is hand-maintained because Claude Design is outside the
repo and cannot be read at build time. That is also the column that matters
most, so the registry is built to resist flattery: `covers` and
`appearsAsFragment` are separate fields, and **only `covers` counts**. A
component that appears as a fragment renders as "fragment only", which is not
coverage.

`check:design-status` fails on drift, the same generate-plus-`--check` idiom as
`check:llms` and `check:tokens`. A status table that can go stale is worse than
none, because it is read as current.

Alternatives considered:

- **A hand-written checklist.** Rejected: it is the artefact that would go
  stale first, and five of its six columns are already facts in the repo.
- **Count fragments as coverage.** Rejected for the reason above. The number
  exists to be uncomfortable when it should be.
- **Derive the artboard column by calling the Claude Design MCP at generate
  time.** Rejected: it would make a repo gate depend on an interactively
  authenticated external service, so CI could not run it.

## Consequences

- **The gap is now a number in the repo**: 29 components, 0 designed, 3
  fragment-only, 26 untouched. It appears in `check:all` output and moves only
  when real work lands.
- **The table doubles as the Figma-transfer checklist.** A component is ready to
  transfer when it has an artboard, a current parity verification, and an a11y
  baseline in all three frameworks — which the columns show at a glance.
- **Two columns are currently a mirror image of each other.** "Type roles" is
  empty for all 29 and "Respecifies font" is set for 25: ADR-0036 declared the
  roles and nothing consumes them. The migration turns one column into the
  other, so the table also measures that.
- **Adding an artboard means editing the registry.** Forgetting to leaves the
  table understating coverage — the safe direction for a number whose job is to
  show what is missing.
