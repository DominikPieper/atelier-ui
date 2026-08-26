---
status: accepted
date: 2026-08-26
sources:
  - tasks/review-state-2026-08-26.md (state review — a11y roster hole, ADR/gate-policy drift)
  - "plan/adr/0019-figma-conformance-gate.md (§5 revised: no longer standalone)"
  - "plan/adr/0024-design-parity-persistence-gate.md (§4 revised: no longer standalone)"
  - "plan/adr/0025-cross-framework-a11y-conformance.md (roster derivation)"
---

# ADR-0034: What a green `check:all` asserts — promoted gates, derived rosters (revises ADR-0019 §5 and ADR-0024 §4)

## Status

Accepted.

## Context

ADR-0033 made `check:all` the release gate — nothing reaches npm unless it
passes. That promotion changes what the suite has to be able to claim, and two
long-standing facts made "green" mean less than it looked like:

**1. The decision log had drifted from the shipped gate policy.**
`check:parity` and `check:figma` are both in the `check:all` chain in
`package.json` (commits 6fc3cd1 and b8935c8), but ADR-0019 §5 and ADR-0024 §4
still read as current and say the opposite — "standalone, not in `check:all`".
For `check:figma` the precondition ADR-0019 named for ever promoting it
(snapshot freshness) was never built: `tools/figma/snapshot.json` carries
`figmaLastModified: null`, and the gate checks existence, parse and
non-emptiness but never age.

**2. `check:a11y-parity` derived its roster from its own artifacts.** It built
the component list by globbing `tools/parity/a11y/` (`fs.readdirSync(A11Y_DIR)`),
so a component with zero snapshots was not "missing" — it was not a question
the gate asked. No comparison, no `[MISSING]` warning (that path only fires for
*partial* coverage), exit 0. Four components were uncovered: select, combobox
and radio for recorded reasons, and **accordion for no reason at all** — the
exact component ADR-0025 cites as its motivating cross-framework divergence.
`tasks/todo.md` accordingly claimed the gate was "COMPLETE for all comparable
components" while the most likely place for a real finding sat outside it.

A gate whose roster comes from its own output can only ever confirm what it
already covers. That is a category error, and it is the kind that gets worse
the moment the suite starts gating releases.

## Decision

**A gate's roster is derived from the source of truth, never from the gate's
own artifacts, and every exemption is recorded with a reason.**

Applied to `check:a11y-parity`: the roster is now the component dirs, via the
same `isComponentDir` / `getComponentDirs` discovery the structural gates use
(29 components). A component with no snapshots is a **blocker** unless it is
named in `A11Y_PARITY_EXEMPT` in `tools/scripts/lib/allowlists.js`, which
carries two kinds of entry:

- `design` — legitimately not comparable (select/combobox: native `<select>` vs
  CDK-overlay listbox per ADR-0007; radio: only reachable through its group).
  Silent, because the question is closed.
- `gap` — comparable, simply not written yet (accordion). **Printed as a
  warning on every run**, so it keeps nagging instead of dissolving back into
  the roster.

The allowlist is itself checked: an entry naming a dir that does not exist, or
one that now *has* snapshots, is a blocker. Load-bearing allowlists rot.

**And the promotion is recorded as fact:** `check:parity` and `check:figma` run
inside `check:all`, revising ADR-0019 §5 and ADR-0024 §4. `check:parity` is
deterministic and offline, so it was always safe there. `check:figma` reads a
committed snapshot, so it is offline too — but it is promoted *with its stated
precondition still unmet*, which is recorded here rather than left implicit.

Alternatives considered:

- **Keep "missing snapshot" a warning and just add accordion to the todo** —
  rejected: that is what already happened, and it produced a gate asserting
  less than its own ADR claimed while reading green.
- **Make every uncovered component a hard blocker with no allowlist** —
  rejected: it would fail select/combobox, whose divergence is a deliberate
  adapter decision (ADR-0007). Forcing tree equality there means rebuilding an
  adapter to satisfy a gate, which is the tail wagging the dog.
- **One `check:roster` meta-gate reconciling all 18 gates at once** — deferred,
  not rejected. It is the right end state (gate rosters currently disagree:
  sync 31 unfiltered dirs, behaviors-gen 29, parity 27/29, metadata 26+5,
  a11y 25, variants 24, docs 23), but it is an M-sized design question and the
  a11y hole was the one already causing a false claim. This ADR fixes the
  instance and sets the convention the meta-gate would generalise.
- **Demote `check:figma` back out of `check:all`** to honour ADR-0019 §5 —
  rejected: the gate is offline and deterministic against the committed
  snapshot, so it belongs in the suite. The real defect is snapshot staleness,
  and hiding the gate does not make the snapshot fresher.

## Consequences

- Adding a component now forces an a11y decision: write the specs, or say in
  the allowlist why not. There is no third option that reads green silently.
- `check:a11y-parity` reports `25 of 29 component(s) compared … 4 exempt`
  instead of a bare count, and emits one standing `[GAP]` warning for
  accordion. Verified by negative test: removing the radio entry produces a
  `[ROSTER]` blocker; exempting a component that has snapshots, or naming a
  non-existent dir, produces `[STALE]` blockers.
- **The accordion gap is now visible, not fixed.** Writing its specs is
  tracked in `tasks/todo.md`; it is the most likely place for a real
  cross-framework finding, so expect the gate to go red before it goes green
  there. That is the gate working.
- `check:figma`'s promotion is now recorded *together with* its unmet
  precondition, so the next reader does not have to rediscover that a green
  `check:figma` says nothing about whether the Figma file has moved. The
  freshness policy (fail or warn past a max age; populate
  `figmaLastModified`) remains open.
- ADR-0019 and ADR-0024 stay Accepted and are revised only on those two
  sections (the ADR-0023 ↔ ADR-0016 precedent): the gates they define are
  unchanged, only where they run has changed.
