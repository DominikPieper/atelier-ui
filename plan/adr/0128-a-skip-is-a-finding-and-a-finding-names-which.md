---
status: accepted
date: 2026-09-11
sources:
  - tools/scripts/check-paint.mjs and tools/figma/paint-skip-baseline.json (the gate and its new ratchet)
  - plan/adr/0124-a-gate-that-measured-nothing.md (rule 1, and its Consequences naming this work as owed)
  - plan/adr/0080-a-guard-that-skips-is-not-a-check.md (§2 "The baseline records findings, not counts" — the shape this record obeys after first getting it wrong)
  - plan/adr/0079-type-does-not-need-the-painted-box.md (the ratchet idiom, and the count shape it chose that §2 above overturned)
  - plan/adr/0034-what-a-green-check-all-asserts.md (exemption records, and why a ratchet is not one)
  - plan/adr/0066-a-warning-nobody-can-clear.md ("a warning has to be clearable"; a population nobody can act on is reported as a count with the reason inline)
  - a measured run of check:paint, 2026-09-11, and the per-occurrence breakdown of every skipped story
---

# ADR-0128: A skip is a finding, and a finding names which

## Status

Accepted 2026-09-11. Completes rule 1 of ADR-0124 for `check:paint`.

## Context

ADR-0124 required that "every counter a gate prints in its summary is either asserted or
removed", fixed the roster floor, and left `check:paint`'s skip counters as recorded debt.
They are large. A green run reports, per framework:

|                | angular | react | vue |
| -------------- | ------- | ----- | --- |
| measured       | 101     | 107   | 111 |
| `skipped-demo` | 37      | 43    | 62  |
| `not-rendered` | 25      | 20    | 21  |
| `no-probe`     | 30      | 21    | 22  |

Roughly half the stories in each framework were not measured, and the run still ended
`✓ check:paint — no drift beyond the recorded baseline`. Worse, `skipped-demo` left no
trace at all — the other two warn per occurrence, that one only incremented a number.

Reading what the numbers are made of was half the work, and it changes what paying the debt
would cost:

- **`not-rendered` is concentrated.** `AtlChat` contributes 12 in every framework — its
  Drawer, Popup and Inline stories render closed — and `AtlDialog` 6 to 9. Those two
  account for the entire bucket in React and Vue; Angular adds `AtlDrawer`. Three
  components.
- **`no-probe` is two different failures wearing one name.** _Resolution_ failures — no
  probe found at all — are concentrated in `AtlDrawer`, `AtlMenu` and `AtlTooltip`, whose
  contracts declare no `probes`, plus Angular's `AtlSelect` for its documented
  button-trigger reason. _Focus_ failures are thin and spread, one per component — except
  Angular's `AtlButton`, where all nine attempts fail while React's equivalent fails two of
  nine. That outlier is its own question.
- **`skipped-demo` is genuinely spread**: 16 distinct components in Angular, 18 in React, 24
  in Vue, one to four each. Vue's 62 against Angular's 37 is not a broken component but
  broader reach, and part of it is structural rather than a defect — Vue's `AtlAvatarGroup`
  is its own roster member with its own contract and four stories, where Angular folds the
  same demo into a single story inside `atl-avatar.stories.ts`. React's `AtlRadioGroup`
  contributes six already-documented false positives of the heuristic itself.

## Decision

**A skipped story is a finding, recorded by identity, ratcheted in both directions.**

1. **The three substantive counters are ratcheted** — `skipped-demo`, `not-rendered`,
   `no-probe` — in `tools/figma/paint-skip-baseline.json`. An observed skip that is not
   recorded blocks and names it; a recorded skip that no longer occurs blocks and says to
   re-record it. The recorded state is silent apart from one summary line per framework
   carrying the count and the reason, which is what ADR-0066 prescribed for a population
   nobody can act on today.
2. **The baseline holds sorted identity lists, not numbers.** `skipped-demo` and
   `not-rendered` are addressed as component plus story; `no-probe` adds the interaction
   state, because that reason fires per state and a substitution inside one component would
   otherwise hide. No line numbers, so an entry survives churn. Each _reason_ carries one
   `why` describing the class — the entries themselves carry no prose, which is what
   separates a ratchet from ADR-0034's exemption records.
3. **`no-index-entry` is a hard floor at zero**, not a ratchet. It means a story present in
   source CSF is missing from the built index, which has no legitimate nonzero value; it is
   a build-freshness signal, and any rise blocks outright.
4. **`no-component` and `off-roster` stay unratcheted**, with the reasoning recorded rather
   than the number: every instance was traced, and they are the cookbook, showcase and
   kitchen-sink demo pages with no single component to measure, `AtlIcon`, which has neither
   a contract nor a snapshot master, and `AtlToast`, whose exclusion is already a
   `PAINT_ROSTER_EXEMPT` entry. None of them ever enters the roster, so they are the wrong
   altitude for this ratchet.

**The shape was got wrong first, and that is worth recording.** This record's own author
specified a count-shaped ratchet — one number per framework per reason — and explicitly told
the implementing agent not to re-litigate it. The reasoning was that seventy-odd entries
each needing a hand-written justification would produce boilerplate rather than reasons.
That was a category error: an exemption record carries a reason, a ratchet entry carries an
identity and nothing else, so the objection did not apply to the shape being rejected.
ADR-0080 §2 had already settled this by breaking it — _"A count is faithful to how many, not
to which"_ — after ADR-0079 chose counts on the argument that a list would be unreadable
"for a case nobody has hit", and the case was hit within the hour. The agent implemented
what it was told and named the defect in its own review; the correction cost one round trip.
The lesson is not about this gate: **a reviewer instructed not to re-litigate a shape should
still say when the shape is one the repo already retired.**

The substitution test is therefore the acceptance test, not a green run: one story removed
from a bucket and another added to it in the same framework, leaving the count identical.
Under the specified shape that was green. Under the recorded shape it blocks twice, naming
both entries.

Alternatives considered:

- **A per-story exemption map with a reason each** (ADR-0034's shape). Rejected: 281
  entries, and a reason per entry that nobody can write honestly is worse than no reason.
  The reason belongs to the class, and it lives on the class.
- **A plain blocker.** Rejected for the reason ADR-0080 gives: the remedy for most of these
  is a story or a contract change nobody has decided on, so it would leave `check:all` red
  indefinitely.
- **Leaving the counters printed and unasserted.** That is the state being fixed, and it is
  what let a run report on roughly half its stories while claiming no drift.

## Consequences

- **The debt is now immovable rather than invisible**, and its shape is known: `not-rendered`
  and the probe-resolution half of `no-probe` are concentrated in five or six components and
  are plausibly an afternoon; `skipped-demo` is the expensive half and partly not a defect at
  all.
- **Three gaps this does not close**, each found while doing the work and each recorded in
  `tasks/todo.md` rather than quietly absorbed:
  - The `[ROSTER]` floor from ADR-0124 is cross-framework — it fires when a component has
    zero measurements in _every_ framework. One framework silently losing all coverage of a
    component while the other two still measure it is caught by nothing.
  - The `no-probe` counter never saw the "probe element vanished while measuring" case,
    because that warning fires from a function with no access to the counter. Pre-existing,
    preserved deliberately, not widened here.
  - **`check:paint`'s measurements are not run-to-run deterministic.** Two
    `--update-baseline` runs each produced a `55px → 56px` drift on Vue's `AtlAlert` height,
    on a _different subset of its stories_ each time — three, then five. Always the same
    component, field and direction, always inside the 2px tolerance so it never flips a
    finding, which is why nothing noticed until now. The skip ratchet is keyed on structural
    facts and cannot inherit it, but any future tightening of the paint tolerances rests on
    this being understood first.
- **Verified as of this record:** the counts and their per-component breakdown, from a real
  run; the ratchet blocking on a rise, on a drop, and on a substitution that leaves the count
  unchanged; `check:paint` exit 0 with the baseline seeded. **Assumed:** that the story-level
  explanations traced for `no-component` and `off-roster` hold for instances added later —
  today's were checked exhaustively, the shape's stability was not.
