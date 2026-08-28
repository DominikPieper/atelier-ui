---
status: accepted
date: 2026-06-17
sources:
  - "approach audit 2026-06-17 (findings `verify-not-gated`, `parity-tool-never-gated`)"
  - "plan/adr/0019-figma-conformance-gate.md (committed-snapshot + offline-check idiom)"
  - "plan/adr/0009-drift-gate-system.md (one source → projection → --check)"
  - "CLAUDE.md § Design-to-Code Workflow (step 4: verify, 'Required, not optional')"
  - "this session"
---

# ADR-0024: Design-parity persistence gate (`check:parity`)

## Status

Accepted. Recorded at decision time. **Complements ADR-0019** (the Figma
*conformance* gate, structural name/variant/token checks) by closing the loop on
the *visual* verify step ADR-0019 explicitly left out of scope, and follows the
same committed-artifact + offline-`--check` pattern (ADR-0009).

§4's promotion path was taken in `b8935c8` (2026-07-22) and **amended by ADR-0082**
(2026-08-28): the gate stays in `check:all`, but there it runs `--report` and DRIFT is a
WARNING. Blocking on it in a chain that runs in CI made `check:all` unclearable — the
remedy needs the Figma Desktop Bridge, and a GitHub runner does not have one. The
BLOCKER is unchanged in the direct `npm run check:parity` invocation.

## Context

The design-to-code loop's fourth step is `figma_check_design_parity` — "Verify",
which CLAUDE.md calls **"Required, not optional"**. The approach audit found that
this step is, in practice, enforced nowhere:

- It is an interactive MCP call a human/agent runs; the result is read aloud and
  then **discarded**. No artifact records that parity was ever checked for a
  component, what the score was, or against which Figma node.
- Nothing detects when a component's rendered output **drifts after** its last
  verify — a story tweak, a CSS change, or a spec edit can move the component away
  from the Figma design and no gate notices, because the only "proof" was a
  transient console reading.
- `check:figma` (ADR-0019) checks *structural* conformance (names, variants, token
  bindings) but deliberately not *visual* parity (padding/colour/layout), which is
  exactly what `figma_check_design_parity` measures.

So the closing half of the headline workflow had no machine backstop. The
structural constraint is the same one ADR-0019 faced: re-measuring parity needs
the Figma Desktop Bridge + a running Storybook, so it cannot run live in CI.

## Decision

Build **`check:parity`** as a committed-record + offline-check gate — the verify
result becomes a durable, checkable fact, isolating the live dependency into a
manual record step exactly as ADR-0019 isolated it into `figma:snapshot`.

1. **A record writer and an offline gate.**
   - `tools/scripts/parity-record.mjs` (`npm run parity:record -- --component
     LlmButton --score 0.98`) is run after `figma_check_design_parity`. It writes
     a per-component record to `tools/figma/parity.json`: the Figma node id (looked
     up from the snapshot), the score, the verifying git sha + timestamp, and an
     **`inputsHash`**.
   - `tools/scripts/check-parity.js` (`npm run check:parity`) runs fully offline
     against `parity.json` + the snapshot's component list.

2. **`inputsHash` is the drift signal, and it spans all three frameworks.** The
   hash (lib/parity-inputs.js) covers every file under
   `libs/{angular,react,vue}/src/lib/<module>/` — implementation, CSS, story, and
   component-local spec. **Why all three:** parity is a claim about *the design*,
   and the repo's premise is "one spec, three faithful adapters", so a change in
   *any* adapter can break parity with Figma and should force a re-verify.
   **Why the whole component dir, not the spec interface slice:**
   `figma_check_design_parity` renders the component (impl + css + story), so those
   files — not an abstract type — are what the score was measured against; spec
   changes that affect rendering flow through the impl anyway.

3. **Three severities, symmetric exit code** (same bucketing as the other gates):
   - no record for a covered master → **WARNING** ("never verified"),
   - `inputsHash` changed since the record → **BLOCKER** ("drifted; re-verify"),
   - recorded Figma node ≠ snapshot node → **WARNING** ("renumbered"),
   - score below `ATELIER_PARITY_MIN` (opt-in env, unset by default) → **CRITICAL**.
   - **Why score enforcement is opt-in:** the parity tool's score scale is the
     verify tool's, not ours to assume; we record it always and enforce a floor
     only once the team fixes a scale. The teeth that need no scale — drift
     detection — are on by default.

4. **Standalone, not in `check:all`/CI/pre-push (for now)** — the same rollout
   stance as ADR-0019 item 5, for the same reason: clearing a **DRIFT** blocker
   means re-running `figma_check_design_parity`, which needs the bridge + a running
   Storybook. Auto-blocking every push that touches a verified component's files
   would demand the bridge in the dev loop. **Promotion path:** once parity records
   exist for the snapshot's masters and the bridge-backed re-verify is part of the
   release ritual, `check:parity` can join `check:all` — at which point the
   "Required" verify step becomes genuinely enforced, not aspirational.

## Consequences

- **Verify is now a persisted fact, and drift is detectable on demand.** Even
  before CI promotion, `npm run check:parity` answers "which components have
  drifted since their last design check?" — which nothing could answer before.
- **First state is all-WARNING, exit 0.** `parity.json` ships with no records, so
  the gate is CI-safe today (unlike `check:figma`, which is red by design). It
  starts asserting drift only as records are added — no silent cap; the report
  prints `N/M masters have a parity record`.
- **Coverage tracks the snapshot.** The gate iterates the snapshot's components, so
  it covers the same 3-of-27 masters `check:figma` does until a full
  `figma:snapshot` lands (see the audit's snapshot-coverage finding). Growing the
  snapshot grows parity coverage for free.
- **The docs verify step now teaches the record.** `design-to-code` and
  `first-component` instruct running `parity:record` after `figma_check_design_parity`.
- **Masters with no spec/registry entry** (e.g. LlmCodeBlock, LlmToast) report a
  WARNING that parity is untrackable until they are registered — matching how
  `check:figma` treats spec-less masters.
- **New files:** `tools/scripts/check-parity.js`, `tools/scripts/parity-record.mjs`,
  `tools/scripts/lib/parity-inputs.js`, `tools/figma/parity.json`; `package.json`
  gains `check:parity` + `parity:record`. No new dependency (offline gate); the
  writer uses only Node built-ins.

## Amendment 2026-08-26: the score is no longer stored

**What changed.** `parityScore` is gone from the record and from the gate.
`parity:record` still accepts `--score` (older notes and muscle memory keep
working) but echoes it and drops it. `check-parity`'s `ATELIER_PARITY_MIN` floor
and its `SCORE` critical are removed. What remains is what is reproducible:
`figmaNodeId`, `verifiedAt`, `verifiedSha`, `inputsHash`. The gate now asserts
exactly one thing — *this component was design-parity-verified after its files
last changed* — which is what it was always able to prove.

**Why.** The score is not a property of the component. Three
`figma_check_design_parity` runs on one commit for AtlStepper returned **70, 52
and 83**, and both sources of variance are in the caller's hands, not the code's:

1. **Which node you sample.** `421:505` is the `COMPONENT_SET`; its padding, gap
   and size describe how the eight variants are arranged on the canvas, not the
   component. Sampling the default variant `421:407` instead moved the score by
   31 points. This ADR's own §"…snapshot" text and ADR-0019 already say the
   default variant is what gets sampled — the parity tool does not enforce it,
   and the recorded node is the set.
2. **How much `codeSpec` you declare.** Omitting a field means it is not
   compared. Declaring `padding: 0` honestly turned four previously-unexamined
   properties into four `major` mismatches. A sparser, lazier `codeSpec` scores
   *higher*.

So the July 0.92 and the August 0.83 were never the same measurement, and
storing them in one series invited a trend reading that the numbers cannot
support. A stored number that only looks comparable is worse than no number:
it would have been read as "parity regressed 9 points" when nothing about the
component had changed.

**Alternatives considered.**

- **Keep the score, derive `codeSpec` mechanically, and pin the sampled node to
  the default variant.** Rejected *for now*, not on principle — this is the
  version of the idea that would actually work, and `figma_scan_code_accessibility`
  with `mapToCodeSpec: true` already exists for the a11y part. But deriving the
  visual/spacing/typography sections mechanically from CSS is its own project,
  and until it exists the honest move is to stop storing a number we cannot
  reproduce. If that derivation lands, this amendment should be revisited.
- **Keep storing it, labelled "informational".** Rejected: a number in a
  committed JSON series gets read as a series regardless of its label.
- **Raise the floor instead** (`ATELIER_PARITY_MIN`) so the score gates rather
  than trends. Rejected: it would gate on the same unreproducible quantity, and
  a floor that a sparser `codeSpec` can clear is an invitation to declare less.

**Consequences.**

- The verify step still runs and is still required — the DRIFT blocker is
  untouched. Only the number stops being persisted.
- 27 existing records were migrated by stripping `parityScore`; nothing else in
  them changed, so no component needs re-verification because of this.
- `tools/figma/parity.json`'s `meta.note` now carries the reason, so the next
  reader does not have to find this amendment first.
- The docs (`design-to-code`) no longer teach `--score`.
- The `critical()` helper in `check-parity.js` is left in place and marked
  unused: CRITICAL stays part of the gate's severity vocabulary for a future
  finding, and deleting it would only invite re-adding it.
