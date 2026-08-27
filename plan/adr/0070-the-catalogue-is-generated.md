---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0030-library-tokens-collection.md (the sync script this one copies)
  - plan/adr/0062-a-part-promoted-to-a-master-becomes-checkable.md (the cards this first generated)
  - plan/adr/0068-a-parent-can-only-instantiate-what-the-child-can-express.md (the change that made a card stale twice in a day)
---

# ADR-0070: The catalogue is generated

## Status

Accepted. Adds `npm run figma:sync-inventory`.

## Context

Every master has a card on the Inventory page carrying its name, a live preview, a meta
line (`TYPE · WIDTH×HEIGHTpx`) and one row per property. Those facts were hand-written,
and they drifted the way hand-written facts about a generated thing always do:
AtlBreadcrumbs' card still read `COMPONENT_SET · 209×17px` with an `items` VARIANT row
**months** after ADR-0056 removed that axis and collapsed the set to a plain COMPONENT.

The fourteen cards added in ADR-0062 and ADR-0065 were generated from the master, which
proved the shape was mechanical. Then ADR-0068 recomposed AtlBreadcrumbs from
AtlBreadcrumbItem instances and its card was stale **again, within the day** — this time
one I had written that morning.

A catalogue nobody can trust is worse than none. A reader who trusts a stale card stops
looking at the master, which is the opposite of what a catalogue is for.

## Decision

**1. `figma:sync-inventory` regenerates every card from the master it documents.** Same
shape as `figma:sync-tokens` (ADR-0030): a plugin payload over the Desktop Bridge,
idempotent, reporting what it changed rather than doing it silently. Per card it rewrites:

- the header name, from the master's leaf name
- the preview, as a fresh instance whenever the existing one points at a different
  component or measures differently — so a recomposed master shows its real shape
- the meta line
- one property row per variant axis, then per BOOLEAN, then per TEXT

**2. It leaves two things alone, deliberately.** The blurb is hand-written prose worth
keeping — a generated sentence would say less than "Hierarchical navigation trail." And
the status chip comes from the design-status pass, not from the master.

**3. It reports what it cannot fix.** A master with no card, and a card whose master no
longer exists, are both warnings with a non-zero exit — the first is the CLAUDE.md
convention being broken, the second is a leftover from a removed master (which ADR-0059
already found twice, as orphaned instances).

**4. It is a command, not a gate.** Comparing a card to its master in `check:all` would
need the card facts in the snapshot, and a card is documentation rather than the transfer
target — the same reasoning that makes `[PAGE-GLYPH]` a warning. Recorded as the next step
if the cards drift again despite the command existing.

## Consequences

- First run: **37 of 43 cards updated**, 6 already correct, no orphans and no missing
  cards. Among the corrections: `COMPONENT_SET · 209×17px` → `COMPONENT · 323×26px` for
  AtlBreadcrumbs, eleven other stale meta lines, sixteen preview instances pointing at
  outdated components, and property rows for every master whose axes or Booleans changed
  this session.
- **The generated fourteen never drifted; the hand-written twenty-nine all did.** That is
  the whole argument for generating documentation *about* a generated thing, and it is the
  third time this session the same lesson arrived by a different door: the Typography
  page's captions (ADR-0059), the plan documents (ADR-0064), and now the catalogue.
- **Idempotent, verified independently of the script.** The second invocation stalled on
  the Desktop Bridge — the documented contention caveat, with an active figma-console
  client in the same session — so idempotency was checked by recomputing every card's
  expected name, meta line, property rows and preview target and comparing them to what
  the cards hold: **43 masters, 43 cards, 0 would change**. That is a stronger check than
  reading "0 updated" off the script, because it re-derives the answer rather than
  trusting the run.
- The script needs the same care as `figma:snapshot`: run it when no other figma-console
  client holds the Desktop Bridge, and run `figma:snapshot` afterwards so the conformance
  gate sees the new state. The connection details matter more than they look — the first
  version used `figma-console-mcp` without `@latest` and without passing the environment
  through, and the spawned client never saw the bridge at all.
