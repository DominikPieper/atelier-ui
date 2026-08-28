---
status: accepted
date: 2026-08-28
sources:
  - plan/adr/0024-design-parity-persistence-gate.md (the gate this amends; its §4 promotion path)
  - plan/adr/0019-figma-conformance-gate.md (the rollout stance check:figma already has in this chain)
  - plan/adr/0080-a-guard-that-skips-is-not-a-check.md (the report-vs-skip distinction this turns on)
  - plan/adr/0066-a-warning-nobody-can-clear.md (why the downgraded finding still has to name its remedy)
  - plan/adr/0081-a-class-the-css-paints-and-no-template-emits.md (the session that made the contradiction visible)
---

# ADR-0082: A blocker the chain that runs it cannot clear

## Status

Accepted. `check:parity` keeps its DRIFT **blocker** when run directly; `check:all` runs
it as `check:parity:report` (`--report`), where DRIFT is a WARNING that names every
component owed and the command that clears it. Amends ADR-0024 §4.

## Context

`check:parity` asserts one thing: *this component was design-parity-verified after its
files last changed*. The signal is an `inputsHash` over
`libs/{angular,react,vue}/src/lib/<module>/`, and the only way to clear a DRIFT finding is
to re-run `figma_check_design_parity` and `npm run parity:record` — which needs the Figma
Desktop Bridge and a running Storybook.

ADR-0024 §4 shipped the gate deliberately outside `check:all`, "for now", with a written
promotion path. It was promoted in `b8935c8` (2026-07-22) and **the script's own header
was never updated**: it has said *"Not in `check:all`/CI/pre-push for the same reason as
check:figma"* for five weeks while `package.json` put it there. Worse, the two gates that
sentence equates are not treated alike in the chain — `check:figma` reports 14 warnings and
exits 0; `check:parity` blocks.

Three facts make the promotion untenable as it stands.

**The chain runs where the remedy does not exist.** `ci.yml:71` and `publish.yml:79` both
run `npm run check:all` on a GitHub runner. There is no Figma Desktop Bridge on a runner,
so a DRIFT blocker there is not a finding an author can act on — it is a red build with no
green path through it.

**The promotion has never actually been load-bearing.** Of the last 40 commits, four touch
a component directory. Three re-recorded parity in the same commit; the fourth, `64277c3`
(31 libs files, no `parity.json`), passed only because `meta.redesignPhase.active` was
`true` that day and the phase switch downgraded DRIFT to a warning. The switch closed on
2026-08-27. Since then every libs change has required the bridge before CI is green, and
this session is the first one that could not have it.

**The hash cannot tell a rendered file from a test file.** `lib/parity-inputs.js`
`inputFiles()` walks *every* file under the module directory in all three frameworks and
binds path + bytes of each. Proven directly rather than argued: appending `// probe` to
`libs/react/src/lib/button/atl-button.spec.tsx` turns AtlButton into a DRIFT blocker, and
removing it turns it back. ADR-0024 §2 describes the input set as "implementation, CSS,
story, and the component-local spec" — a `*.spec.tsx` is none of those, and
`figma_check_design_parity` never renders one. So the gate can demand a bridge-backed
re-verify for a change the design provably cannot see.

Together: a 24-file diff that repaired fourteen dead CSS rules and added the tests to pin
them produced **10 DRIFT blockers** and an unclearable `check:all`.

## Decision

### 1. The blocker stays; it moves to where it can be paid

`npm run check:parity` is unchanged — DRIFT is a BLOCKER, exit 1. That is the invocation a
human runs with the bridge open, and it is the one the PR checklist now names explicitly:
*touched a component directory? `npm run check:parity` passes.* The enforcement point is
the machine that has the tool.

### 2. `check:all` reports the same finding and exits 0

`check:parity --report` prints a banner with the count and every component owed, one
WARNING per component carrying the recorded sha, the date and the exact
`parity:record` command, and exits 0. `check:all` calls it through a
`check:parity:report` script so the chain still reads as a list of gate names.

**This is a report, not a skip.** ADR-0080's lesson is that `if (data !== null)` and a
comparison that ran and agreed are indistinguishable from the outside — silence is what
both look like. Nothing here is silenced: the comparison runs, every finding is printed in
full, and the count is in the summary line. What changes is the exit code, and only in the
chain that cannot act on it. A finding whose severity is lowered *and named* is the thing
ADR-0066 asked for when it prescribed "reported as a count, with the reason inline" for a
population nobody in that context can act on — with the difference, which matters, that
this warning **is** clearable: open the bridge.

### 3. The two Figma-dependent gates are now treated alike

`check:figma` and `check:parity` share one constraint — their remedies live behind the
bridge — and now share one standing in `check:all`: both report, neither blocks. The
script header said that was the arrangement; `package.json` said otherwise; this record
picks the header's *reason* and `package.json`'s *placement*, and the header now describes
what the file actually does.

### Alternatives rejected

- **Drop `check:parity` from `check:all` entirely**, per the letter of its old header.
  Rejected: the count owed then becomes invisible until someone remembers a standalone
  script. Ten drifted components printed on every run is most of the value of the
  promotion, and it costs nothing.
- **Make DRIFT a WARNING unconditionally.** Rejected: the blocker would then exist
  nowhere, which is the "guard that skips" ADR-0080 is about, one level up.
- **Ratchet the drifted set** against a committed baseline, the ADR-0080 shape. Rejected as
  a duplicate: `parity.json` already records, per component, exactly when it was last
  verified and against what. A second file recording "these are owed" would be the same
  fact in two places, and ADR-0080 is explicit that a defect must never be recorded in both
  an allowlist and a baseline.
- **Narrow `inputsHash` to render-affecting files** (drop `*.spec.*`, `*.a11y.*`). Right,
  and deliberately *not* done here. Changing the hash function invalidates all 37 existing
  records at once, so it needs a migration that recomputes each record's hash at its own
  `verifiedSha` — proving the record was valid there — before it can claim the new hash
  means the same thing. And it clears **none** of today's ten: every one of them has a real
  template or stylesheet change underneath the test churn. Recorded in `tasks/todo.md`.

## Consequences

- **`check:all` is green again on code-only work, and the drift is still on screen** — ten
  components today, by name, with the command. The chain went from "unclearable without
  Figma" to "clearable, with a standing bill".
- **CI can no longer fail on design drift.** That is a real loss and it is the price:
  the failure it produced was one no CI run could fix. The compensating control is the PR
  checklist, which is a human check and weaker than a gate. Naming it that way is the
  point; a checklist line that pretends to be a gate is the failure mode this repo keeps
  finding.
- **A drifted component can reach a release.** `publish.yml` runs `check:all`, so the
  release path now reports rather than blocks. Running `npm run check:parity` (no flag)
  before a Figma-touching release is the ritual ADR-0024 always described, and it is now
  the only place the teeth are.
- **Two mechanisms now downgrade DRIFT** — `meta.redesignPhase` and `--report` — and they
  say different things. The phase says *the reference is stale*; report mode says *the
  remedy is not available in this chain*. They are deliberately separate switches: the
  phase is a fact about the design work and turns itself off, report mode is a fact about
  where the command is running and never does.
- **The `*.spec.*` over-breadth is now written down** rather than rediscovered. Its cost
  dropped from "CI is red" to "one more line in a warning block", which is why deferring it
  is affordable — and is also exactly how a deferred fix becomes permanent, so it is in
  `tasks/todo.md` with the migration named.
- **ADR-0024 §4 is amended, not reversed.** The promotion stands: the gate runs in the
  chain, on every run, and reports. What is withdrawn is the claim that being in the chain
  makes the verify step "genuinely enforced" — it is enforced by the person with the
  bridge, and the chain is what reminds them.
