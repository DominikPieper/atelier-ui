---
status: accepted
date: 2026-09-11
sources:
  - tools/scripts/check-contracts.mjs, tools/scripts/check-manifest-parity.mjs, tools/scripts/check-paint.mjs (the three gates, read 2026-09-11)
  - tools/scripts/lib/docgen.mjs:166-173 (the `catch { return null }` that makes a tool failure look like an absent component)
  - a measured run of all 47 runnable gates individually, 2026-09-11 (exit codes, durations, clean tree afterwards)
  - tools/figma/paint-baseline.json (755 recorded findings across 26 components)
  - plan/adr/0034-what-a-green-check-all-asserts.md (the convention this record applies, and the `check:roster` meta-gate it deferred)
  - plan/adr/0009-drift-gate-system.md (one source → projection → `--check`, and "the gates become their own maintenance surface")
  - plan/adr/0119-the-exemption-is-the-line-not-its-number.md (what an exemption entry is)
  - plan/adr/0121-the-stories-are-the-spec.md (the gates these three implement)
  - tools/scripts/check-category-alignment.js:265 and tools/scripts/check-figma-token-names.js:125 (the two gates that already carry the floor)
---

# ADR-0124: A gate that measured nothing is not a gate that found nothing

## Status

Accepted 2026-09-11, after a review of the gates added in the preceding twenty-five
commits found three that can exit 0 while checking nothing.

## Context

ADR-0034 already recorded the convention: **"a gate's roster is derived from the source
of truth, never from the gate's own artifacts, and every exemption is recorded with a
reason."** It was written after `check:a11y-parity` was found asserting less than its own
ADR claimed while reading green.

The three newest gates — `check:contracts`, `check:manifest-parity` and `check:paint`,
the ones ADR-0121 S3 and S6a introduced — did not carry it. Each was read line by line:

- **`check:contracts`.** `lib/docgen.mjs:166-173` returns `null` for three different
  events: the docgen provider threw, the payload was falsy, or `payload.error` was set.
  The caller cannot tell those apart from "this story has no component", and each one
  lands in a counter and a `continue`. Nothing compares what was measured against the 43
  contracts on disk. If Storybook's worker payload shape changes, the gate prints
  `components: 0, contracts: 43 … errors: 0` and exits 0 — because the only residual
  signal, `NO-STORY-META`, is a `warning` in `TAG_LEVEL`. The AXIS, BOOLEAN,
  ENUM-UNDRAWN, COVERAGE and DOCGEN-EMPTY halves of the gate are dark, and nothing says
  so.
- **`check:manifest-parity`.** `discoverFramework` returns whatever map it built, with no
  assertion on its size. If one framework's map empties, every component is still present
  in the other two, so there is no `[UNKEYED]` warning and no error;
  `[angular vs react] 0 component(s) compared` is printed and never asserted. Two empty
  maps turn every component into a warning and the gate still exits 0.
- **`check:paint`.** `:1393` — with no `tools/figma/paint-baseline.json`, every finding is
  printed and the gate calls `process.exit(0)`. Deleting one file makes it permanently
  green. Its `measured` / `no-probe` / `not-rendered` / `skipped-demo` counters are
  printed on every run and none of them is ever asserted; today's clean run skips between
  73 and 106 stories per framework that way. Its only floor is a ratchet against its own
  artefact, which is the thing ADR-0034 says a roster must not be derived from.

The convention was not missing from the repo — `check-category-alignment.js:265` fails
`[ALL-SKIPPED]` for exactly this class, and `check-figma-token-names.js:125` makes zero
relevant entries a loud failure. It simply was not carried into the next three gates
written by the same hand. A convention with no mechanism decays at the rate new gates are
written, and this repo writes them weekly.

Two further counts frame the size of the pattern: 19 gates import `lib/allowlists.js`,
which holds 20 exemption maps, and **7** of them check their own entries for rot.

## Decision

**Every gate asserts what it measured, not only what it found.** Three rules, applied now
to the three gates above and required of every gate written after this record:

1. **A floor.** A gate that could have measured *n* > 0 things and measured 0 fails. Every
   counter a gate prints in its summary is either asserted or removed — printing a number
   nobody reads is what let all three of these pass.
2. **A tool failure is a finding, never an absence.** When the machinery a gate depends on
   fails — a docgen worker throwing, a parser refusing a file — that is an error-level
   finding naming the file and the reason. It is never collapsed into the same `null` that
   means "nothing to check here". `makeWorkerDocgen` therefore returns a discriminated
   result rather than `null`, and both consumers report the failure.
3. **A roster hole is an exemption record, policed for staleness.** Where a component in
   the roster produces no measurement, it is an error unless named in an exemption map
   carrying ADR-0034's two kinds — `design` (closed question, silent) and `gap` (should be
   measured, warns on every run) — with a reason, and an entry that names a component
   outside the roster or one that now *is* measured is a blocker. ADR-0034's idiom, not a
   new one.

And, as a corollary of rule 1: **a missing ratchet baseline is a failure, not a free
pass.** `check:paint` without its baseline now exits non-zero and says to run
`--update-baseline`; only a run that is itself producing the baseline is exempt.

One constraint shapes the implementation and is recorded because it is easy to break:
`check-contracts.mjs` and `lib/docgen.mjs` ship **byte-identical** into a generated
workspace (ADR-0090's idiom, guarded by `check:preflight-clone-sync`), and there the
component is imported from an installed package, so docgen is deliberately skipped before
it is ever called. The floor subtracts those external-package skips; otherwise every
scaffold would fail its first run on a promise the preset makes on purpose.

Alternatives considered:

- **Leave it to review.** Rejected. All three gates were written after ADR-0034, by the
  discipline that wrote ADR-0034, and all three lacked it. Review is what already
  happened.
- **Build ADR-0034's deferred `check:roster` meta-gate now**, reconciling all 46 gates'
  rosters at once. Still deferred, for the reason that record gave — the rosters genuinely
  disagree (`check:sync` 31 dirs, `check:behaviors-gen` 29, `check:metadata` 26+5,
  `check:a11y-parity` 25, `check:docs` 23) and reconciling them is its own design
  question. The three instances fixed here are the ones producing a false claim today.
- **Make every unmeasured component a hard blocker with no exemption list.** Rejected for
  the same reason ADR-0034 rejected it: it turns a deliberate divergence into a gate
  failure, and the gate starts wagging the adapter.
- **Downgrade the three gates to warnings until the holes are closed.** Rejected — that is
  the state being fixed. A warning nobody reads is how a green run came to prove nothing.

## Consequences

- **Gates get louder before they get quieter.** Roster holes that were invisible become
  either an error or a recorded `gap` exemption that warns on every run. That is the
  intent: the hole was always there, it just had the same exit code as its absence.
- **The rules belong in one place, not in each gate.** They are implemented per-gate here
  because three gates were producing false claims today, but a floor, a tool-failure
  finding and a policed exemption map are exactly the shared harness ADR-0125 names as the
  package boundary for a future `@atelier-ui/nx`. The next gate should inherit them rather
  than re-implement them — and the count above (7 of 19 gates policing their allowlists)
  is the measure of what re-implementation has cost so far.
- **The scaffold constraint is now load-bearing in two files.** Any future change to the
  contracts floor has to keep the external-package subtraction, or a generated workspace
  fails on its first run.
- **Not addressed here**, and recorded in `tasks/todo.md` under the 2026-09-11 gate
  review: the mutual deferral between `check:props` and `check:manifest-parity` over
  `PROP_SURFACE_EXEMPT` staleness (61 entries, 21 of them keyed on a prop the spec never
  declares); `[DEFAULT]`'s two-sided `!== undefined` guard, which means that tag is not yet
  the "cross-framework half of `check:defaults`" its own header claims; `check:paint`'s
  two swallowed Playwright calls and its unverified `dist/storybook` freshness; and the
  ten separate re-implementations of ADR-0009's regenerate-and-diff boundary, two of which
  fall through to *write* mode on a typo'd flag.
- **Rule 1 is met only where it separates "measured nothing" from "found nothing".** The
  counters that decide that question are now asserted; `check:paint` still prints
  `skipped-demo`, `no-probe` and `not-rendered` per framework — between 73 and 106 stories
  per framework on a green run — without asserting any of them. Each is a different
  question (a story the heuristic could not disambiguate, a probe that would not focus, a
  story that did not render), and each deserves its own floor or its own exemption map.
  Recorded in `tasks/todo.md`, not closed here.
- **The floor is a floor, not coverage.** A component satisfies rule 3 with one successful
  default-state measurement, in one story, in one framework. Hover and focus states, the
  other two adapters and every other story can still be broken without the gate saying
  anything. That is what this record asks for — measured *something*, not *everything* —
  and naming the limit is part of the decision.
- **What rule 3 turned up on its first run:** 19 of the 43 roster components are measured
  today. The other 24 are recorded exemptions — 16 `design` (subcomponents no story
  declares as its `meta.component`, plus `AtlRadio`, which matches the call
  `A11Y_PARITY_EXEMPT` already makes, and `AtlToast`, an imperative service) and 8 `gap`
  that now warn on every run: `AtlDrawer`, `AtlMenu` and `AtlTooltip` declare no probes,
  `AtlChat`'s stories are all closed by default, `AtlBreadcrumbs`, `AtlCodeBlock` and
  `AtlPagination` resolve args matching no `rootPaint` row, and `AtlRadioGroup` is a
  genuine false positive of the ambiguous-demo heuristic. None of that was visible before;
  all of it was inside a green run.
- **Verified as of this record:** the three failure paths above, by reading the code; the
  47 individual gate runs with their exit codes; that all 755 baseline findings reproduce
  exactly; that 17 of the 43 roster components have no baseline *entry* — which is not the
  same as being unmeasured, and is why rule 3 counts measurements rather than findings, a
  distinction the instrumented run then proved by landing on 24 rather than 17; and each
  new assertion by a negative test that made it fire. **Assumed, and not settled here:**
  that the 755 recorded findings encode real drift rather than wrong measurements — nobody
  has audited their content; and that the eight `gap` entries have only the one root cause
  each that was identified.
