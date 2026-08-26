---
status: accepted
date: 2026-08-26
sources:
  - plan/adr/0024-design-parity-is-a-persisted-fact.md (the gate this changes the semantics of)
  - plan/adr/0043-the-geometry-contract-ships-with-the-component.md (the change that forced the question)
  - tasks/design-findings-2026-08-26.md ("Read this first: which direction is canonical")
  - tasks/atelier-design-system-plan.md (Phase 3, the Figma transfer)
---

# ADR-0044: Parity drift during the redesign phase

## Status

Accepted. While `meta.redesignPhase.active` is true in
`tools/design/artboards.json`, `check:parity` reports an `inputsHash` drift as a
WARNING instead of a BLOCKER, prints the phase and the outstanding count on every
run, and `plan/design-status.md` carries the same statement above its table.

## Context

`check:parity` (ADR-0024) hashes a component's files across all three frameworks
and blocks when they changed after the last recorded `figma_check_design_parity`.
That is the right gate for maintenance: it catches a component drifting away from
its design without anyone noticing.

The library is not in maintenance. It is being redesigned in Claude Design and
transferred to Figma afterwards, which inverts the direction of authority: **the
code and the artboards are canonical, and the Figma masters are stale by
definition** until Phase 3 rebuilds them. All 29 masters are still on Inter, from
before ADR-0035 changed the typeface.

ADR-0043's contract touched 87 stylesheets and turned 27 of 29 parity records into
BLOCKERs in one commit. The gate was not wrong — the files did change. But the fix
it demands is to re-verify against masters we have deliberately left behind, which
would record a fresh verification of a comparison that means nothing.

Options considered:

1. **Re-verify all 27 now** via the Desktop Bridge and re-record. Honest about the
   hash, dishonest about the value: it stamps "verified today" onto a comparison
   against a pre-redesign design. Also gone again on the next redesign commit.
2. **Exclude the generated contract block from `inputsHash`.** Defensible — the
   block is verified more strongly by `check:box-sizing` and `check:geometry` than
   a parity run could — but it solves exactly one commit. The next redesign edit
   blocks again.
3. **Take `check:parity` out of `check:all`,** back to what its own header still
   claims. Removes the contradiction, but also removes the signal ADR-0024 exists
   to provide.
4. **Re-stamp the records without verifying.** Rejected outright: it writes a
   verification that never happened into a file whose only purpose is to be
   trustworthy.
5. **Name the phase and change the severity while it lasts.** Chosen.

## Decision

The redesign phase is recorded in `tools/design/artboards.json` under
`meta.redesignPhase` — `active`, `since`, `clearedBy`, and the reasoning — and
`check:parity` reads it from there.

**Why the design registry and not the gate.** The phase is a fact about the design
work, not a configuration of a checker. The registry is already the one file that
holds what the repo cannot derive about the redesign, and `gen-design-status.mjs`
reads it, so the same statement reaches `plan/design-status.md` without being
written twice.

**Why WARNING and not silence.** Every run prints the phase, the count still owed,
and the names of all 27 components, followed by how the phase is cleared. A
suppressed check becomes a forgotten check; a loud non-blocking one stays a debt
that is visible each time anyone runs the gates.

**Why a missing registry blocks.** If `artboards.json` is unreadable, the gate
falls back to BLOCKER. The permissive state must require a positive, committed
statement — never an absence.

## Consequences

- **`check:all` is green again with the debt on the record**, not hidden: 35
  warnings, 27 of them the parity re-verifies owed.
- **The exit path is written down**: rebuild the Figma masters from the redesign,
  re-verify and `parity:record` every component, then set `active: false`. Both
  directions of the switch are negative-tested — `false` blocks, `true` warns,
  no registry blocks.
- **A real drift is now a warning too, for the duration.** During the phase, a
  component that changed by accident looks exactly like one that changed by design.
  This is the actual price, and it is only acceptable because it is bounded by
  Phase 3 — the alternative was 27 blockers demanding a meaningless comparison.
- **`check-parity.js`'s header comment is still stale** — it claims not to be in
  `check:all`, where it has been since `6fc3cd1` (2026-07-21). Left as found;
  noted here so the next reader is not misled twice.
