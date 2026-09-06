---
status: accepted
date: 2026-09-06
sources:
  - tasks/schulung-review-2026-09-05.md (B1's hand-run gate table; the method this test reproduces)
  - docs/src/pages/schulung.astro (Day 2 Block 02's gate-count claim; Blocks 02/03's local MCP dependency; the Figma node/frame citations)
  - tools/e2e/schulung-claims.e2e.mjs (the test)
  - libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs (the idiom this follows)
  - tools/scripts/check-manifests.js (the gate whose membership in the claim this test had to determine, not assume)
  - project.json (root workspace project; the new `schulung-claims-e2e` target)
---

# ADR-0098: A curriculum that checks its own claims

## Status

Accepted. `tools/e2e/schulung-claims.e2e.mjs`, wired as the root workspace
project's `schulung-claims-e2e` Nx target, asserts four checkable claims
`docs/src/pages/schulung.astro` makes about this repo. Not in `check:all`;
gets its own CI job.

## Context

`tasks/schulung-review-2026-09-05.md` found three blockers that were the same
shape each time: a claim on the training page had quietly gone false, and
nothing noticed until a human read it. A command nobody could run, a gate
that verified nothing, a prop that didn't exist. The review's own gate-count
table (B1) was hand-run and dated the same day a 35th gate (`check:manifests`)
was added to the repo — the exact kind of change that invalidates a number
like this without touching the page that states it.

The page makes four kinds of claim a script can check without a human or a
network call:

1. A gate count — "three red gates expected for your own component; six means
   your spec landed in the shared master" (Day 2, Block 02).
2. A local MCP tool surface Day 2 requires before every `*.stories.*` edit and
   before the test loop (Blocks 02/03).
3. Specific `npm run`/`nx <target> <project>` commands, named by exact string.
4. Specific Figma nodes and starter-frame names, cited by exact string.

## Decision

**Extract each claim from the live page text, then verify it against the
live repo — never hard-code yesterday's reading of the page.** Concretely:

- The gate-count claim (Part 1) is parsed out of the Block 02 bullet by
  anchor text ("Drei Gates werden dabei erwartungsgemäß rot" /
  "kommen drei weitere dazu" / "die Spec liegt im Master"), not copied into a
  constant. If the bullet is reworded past recognition the anchors miss and
  the test fails loudly naming the anchor, rather than silently asserting a
  claim the page no longer makes.
- The same applies to the local-MCP tool list (Part 2, anchored on
  "dev/test-Tools ("), the Figma node id and the five starter-frame names
  (Part 4, `Node \d+-\d+` and `X / Starter|Scaffold` patterns).
- Part 3 (commands) was always going to be extraction-based — that's the
  point, catching a renamed command before it ships — so Parts 1/2/4 follow
  the same shape for consistency rather than mixing a hard-coded list with an
  extracted one.
- A `check:manifests`-shaped question is answered by measurement, not
  inference: the fixture creation already needed for Part 1's gate table
  gives the test two free opportunities (own-file, shared-master) to run
  `check:manifests` too and assert it stays green. Reasoning through
  `check-manifests.js`'s logic suggested it would (it validates a built
  Storybook manifest's internal integrity per framework, never cross-framework
  sync), and both runs confirmed it empirically — 96/95 components checked,
  exit 0, in both scenarios. So `check:manifests` does **not** belong in
  either red set the curriculum names; the "three red" / "six red" counts are
  unaffected by the 35th gate. If a future change to that gate's logic makes
  it start reacting to a single-framework addition, this test will be the
  thing that notices, because it re-measures every run instead of trusting
  this ADR's answer forever.
- Fixture reproduces the review's exact method (B1): a throwaway
  `libs/angular/src/lib/wsdemo/` (`atl-wsdemo.ts`, a story,
  `wsdemo.contract.ts`) for the own-file scenario, then an append to
  `libs/spec/src/index.ts` for the shared-master scenario. Not invented fresh
  — the review already established this is the minimal fixture that produces
  the exact named gate reactions.
- A 15-character lookback for the German word "nicht" immediately before a
  matched command/node/frame excludes the page's own counter-examples from
  being asserted as claims (`nx storybook <fw>, nicht über nx serve
  workshop-<fw>` — a command that only exists in a different repo, the
  CLI-scaffolded standalone workspace, and is being named specifically to say
  "not this"). The window is tuned tight enough to exclude that case and
  `nicht ... check:parity` without also excluding "... Toolset nicht, ihr
  Loop bleibt nx test <lib>", where "nicht" negates an earlier noun three
  words before a real, positive claim. Documented as a known, dated heuristic
  in the script's header rather than a permanent guarantee.
- Location: the root workspace `project.json` (`@atelier-ui/source`), not a
  library's `project.json`. This test is not scoped to any one library — it
  reads `docs/`, `libs/spec`, all three framework libs, `tools/figma/`, and
  `package.json` — and the root project already held exactly one target
  (`local-registry`) of the same "workspace-level, not library-level"
  character.
- Idiom: matched to `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs`
  deliberately — a plain `.mjs`, `section`/`ok` console helpers, an
  `nx:run-commands` target, cleanup in `finally`, collect-then-report
  failures rather than stopping at the first one. Rejected building this as
  a proper test-runner suite (Vitest/Jest): the existing e2e is the
  established idiom for "slow, real-process, own CI job" checks in this
  repo, and a second idiom for the same shape of test would be an
  unforced inconsistency.
- Kept out of `check:all`: it starts three real Storybook dev servers and
  runs the six-plus-`check:manifests` gate chain twice against a mutated and
  restored tree. Measured full run: ~68s. Tolerable for its own CI job;
  multiplying every `check:all` run by that would not be.

## Consequences

- The next time a gate is added, a script renamed, an npm script deleted, an
  MCP tool renamed, or a Figma starter frame removed, this test fails with
  the specific claim that broke — not a vague "something's wrong" — because
  every assertion is generated from the page's current wording, not a
  snapshot of it.
- Verified failing correctly: a scratch copy of `tools/figma/snapshot.json`
  with `TagChip / Starter` removed produced exactly one failure, naming that
  frame, while every other Part still passed. (Recorded in the session that
  produced this ADR; not committed anywhere — the scratch file lived outside
  the repo.)
- What it still cannot catch, by design (see the script's header): anything
  needing the Figma Desktop Bridge, Claude Design, agent/prompt behavior
  quality, or the hosted (production) MCP endpoints. Those need a human or a
  network call and belong in a real dry run.
- The 15-char "nicht" heuristic is a known soft spot. It was validated
  against the three actual negated occurrences on the page at the time this
  was written; a future rewording could produce a new negation shape the
  heuristic doesn't catch, silently re-including a counter-example as a
  claim. The failure mode if that happens is a false failure (the test
  reports a command as broken when the page was deliberately naming it as
  something NOT to run) — loud and wrong, not silent and wrong, which is the
  safer direction for a heuristic to fail in.
