---
status: accepted
date: 2026-09-11
sources:
  - package.json (`check:*` scripts and the `check:all` chain, read 2026-09-11)
  - a measured run of all 47 runnable gates individually, 2026-09-11 (exit code + duration each)
  - plan/adr/0009-drift-gate-system.md (one source → projection → `--check`, and "the gates become their own maintenance surface")
  - plan/adr/0034-what-a-green-check-all-asserts.md (the deferred `check:roster` meta-gate)
  - plan/adr/0053-a-peer-npm-installs-for-you.md (the version-skew route this would reopen)
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (clone vs. scaffold, and what the scaffold deliberately does not get)
  - plan/adr/0090-one-preflight-branched-inside-not-forked-outside.md (the byte-identical clone idiom this record keeps)
  - libs/create-workspace/src/generators/preset/preset.ts (what the scaffold actually receives)
  - node_modules/nx/dist/src/project-graph/plugins/public-api.d.ts:43 (`CreateNodesV2` is a deprecated alias in the pinned Nx 23.2)
  - an independent second-model review of the same facts (Codex, 2026-09-11), which converged on the same boundary and supplied the Nx 23 API correction
---

# ADR-0125: The gates stay scripts until the cases abstract

## Status

Accepted 2026-09-11. Records a **deferral with its condition and its boundary**, so the
question does not have to be re-derived when the condition is met.

## Context

The gate suite is now the largest single body of tooling in this repo: 48 `check:*`
scripts, 46 of them chained with `&&` inside one `check:all`, roughly 23k lines under
`tools/scripts/` plus 2.2k in `tools/scripts/lib/`. ADR-0009 already recorded, as a
consequence, that "the gates become their own maintenance surface". That surface has
since grown by an order of magnitude, and the question was asked directly: should this
be a reusable Nx plugin that a new workspace receives at creation time, rather than
loose scripts?

What is true today, measured rather than assumed:

- **None of the gates is an Nx target.** No caching, no `affected`, no per-gate task
  identity. CI runs the whole chain as a single job with a 60-minute timeout. That is
  the mechanism by which one gate that never exited burned 110 minutes of CI before it
  was killed — the chain has no per-gate timeout to hit and no task boundary to report.
- **Runtime, warm, all 47 runnable gates measured individually: 471 s.** `check:paint`
  is 230 s of that (49 %), `check:docs-layout` 91 s, `check:stories` 47 s; roughly forty
  gates are between 0 and 8 s each. The suite is not slow. It is *unstructured*.
- **Coupling, counted:** three gates are genuinely generic (`gen-behaviors`,
  `behavior-coverage.mjs`, `check:release-drift`); about twenty-eight are a generic idea
  wearing Atelier literals (the `Atl` prefix, the `--ui-` token prefix, the
  `libs/{angular,react,vue}` topology); about twelve are meaningful only here (ADR
  cross-references, `llms.txt`, the cookbook, skill discovery, the Figma inventory).
- **The scaffold already receives the part that travels.** `@atelier-ui/create-workspace`
  ships `check:contracts`, `check:stories` and `preflight.mjs` into a generated
  one-framework workspace as **byte-identical copies** (ADR-0090's idiom), guarded by
  `check:preflight-clone-sync`, which diffs nine source/copy pairs. That is two gates,
  one of which (`check:stories`) is an ordinary Nx target needing no packaging at all.
- The publishing machinery exists (`@atelier-ui/*`, `nx release`, the preset and CLI
  already ship from here), and `@nx/plugin` is installed and referenced nowhere.

So the honest size of the reuse today is **one substantive gate, `check:contracts`,
13 seconds**. Everything else either does not survive a one-framework customer repo or
is already a target.

## Decision

**No published gate plugin now.** The gates stay repo-owned scripts, and the scaffold
keeps receiving its portable kernel as byte-identical copies.

Two things are separated, because conflating them is what makes this look like one
question:

1. **Nx targets** are an operational change — caching, scheduling, per-task timeouts,
   readable CI. They commit to no public API and are not blocked on anything in this
   record.
2. **A published plugin** is a reuse change, and it buys a compatibility commitment:
   exit codes, finding tags, severities and accepted contract syntax all become public
   the moment a consumer's CI depends on them, whether or not any JavaScript symbol is
   exported.

**The condition to revisit (owner, 2026-09-11): enough real cases to abstract the
approach** — more than one component-library workspace actually consuming the loop, so
the abstraction is derived from cases instead of guessed from one. A second condition
travels with it: **the executors must be configurable**, not hardcoded to Atelier's
literals, or the package cannot serve the second case that justified building it.

The boundary it would take, recorded now so it is not re-derived later:

- **`@atelier-ui/nx`**, published in the same fixed release group as the preset and CLI,
  installed at an exact matching version by the preset. Public surface: two executors
  (`check-contracts`, `snapshot-contracts`), one `init` generator, their option schemas.
  Internals — the docgen plumbing, `ts-eval`, the reporting harness, allowlists,
  component maps — stay unexported.
- **Configuration over literals.** The component prefix, the token prefix, the roster
  path, the contract directory and the snapshot location are executor options, so the
  same executor serves a workspace that has never heard of `Atl` or `--ui-`.
- **Explicit targets, not inferred ones.** In the pinned Nx 23.2, `CreateNodesV2` is a
  `@deprecated` alias for `CreateNodes` with removal announced for Nx 24, so inference
  would be written against a moving API — and the preset already knows exactly which
  project it generated, so inference buys nothing. A target written into `project.json`
  is also readable by a workshop participant, which a plugin's inferred graph is not.
- **Honest cache semantics.** The contracts executor is deterministic and cacheable; the
  snapshot executor mutates and talks to the Figma bridge, so `cache: false`. Gates whose
  inputs are workspace-wide snapshots are not `affected`-honest at project level: they
  are always scheduled and cached by task hash, never selected by project graph.
- **Skew answered explicitly**, because ADR-0053 already recorded what happens when a
  plugin's dependency resolution is left to npm: fixed release group, exact pin written
  into the generated workspace (never a caret or `latest`), a `schemaVersion` in the
  generated config, and a migration path that refuses an unsupported version with an
  actionable message.

Alternatives considered:

- **Package all 46 gates.** Rejected: about forty of them are Atelier literals — the
  component roster, the Figma file identity, the docs site, the ADR numbering — and it
  would publish 23k lines that change weekly as a public API. The maintenance cost is
  not the code, it is the promise.
- **Publish the small surface now anyway.** Rejected for now, and this is the strongest
  argument against this record's own decision: the operational wins (targets, caching,
  CI split) are available without publishing, and the reuse win is one 13-second gate.
  If generated workspaces are meant to receive checker fixes after the workshop, that
  calculation changes — which is exactly what the revisit condition tracks.
- **Keep copying files forever, with no revisit.** Rejected as a *permanent* answer, but
  it is what happens until the condition is met, so its cost is named: the participant's
  checker is frozen at scaffold time and receives no fix. Its benefit is named too, and
  it is real for a teaching repo — the participant can open, read and patch the gate,
  which a dependency in `node_modules` does not invite.
- **Infer targets from a config file.** Rejected on the API-stability and
  readability grounds above; reasonable later if the plugin ever has to adopt arbitrary
  existing workspaces rather than ones this preset generated.

## Consequences

- The operational work is unblocked and independent: one target per gate, declared
  inputs, `check:all` becoming a `run-many`, and the heavy gates (`paint`,
  `docs-layout`, `stories`) split into their own CI jobs with their own timeouts. None
  of it requires deciding the packaging question, and all of it is a prerequisite for a
  plugin that would otherwise inherit today's unstructured chain.
- When the condition is met, the package boundary is already drawn, and the shared
  harness (ADR-0124) is the thing that gets packaged — not the gates.
- The byte-identical clone gate (`check:preflight-clone-sync`) stays load-bearing, and
  every edit to a shared file still costs a `sync:preflight` run. That cost is now a
  recorded, accepted price rather than an oversight.
- **Verified as of this record:** the gate count and chain composition, the individual
  runtimes, the coupling counts, what the preset actually writes, the absence of any
  `check:*` Nx target, and the `CreateNodesV2` deprecation in the installed Nx.
  **Assumed:** that the second consuming workspace, when it appears, will want the
  contract loop rather than a different subset — which is precisely why the condition is
  "enough cases", not a date.
