---
status: accepted
date: 2026-10-07
sources:
  - tools/scripts/gen-llms-txt.mjs
  - .github/workflows/publish.yml
  - git log --grep "regen llms" (four hand-made regen commits, most recently 94ddf873 for 0.3.8)
---

# ADR-0153: The release run regenerates llms.txt, not a human afterwards

## Status

Accepted.

## Context

`docs/public/llms.txt` and `llms-full.txt` embed the package version, read from
`libs/angular/package.json`. `nx release` bumps that file inside the `chore(release): publish`
commit, so every release left `check:llms` red on main until someone hand-committed the output of
`gen-llms-txt.mjs`. The regen commit for 0.3.8 changed exactly two lines, the version string in
each file, and nothing else.

## Decision

`publish.yml` gains a step between the npm drift check and the push: it runs the generator and, if the
two files changed, adds a second commit `chore(docs): regen llms.txt after the release commit`. The
push step then sends the release commit, the regen commit and the tag(s) under the existing
`--follow-tags --atomic`. The step is skipped for `publish-only`, which makes no commit.

Why a second commit: Nx 23.2 offers `preVersionCommand` and `groupPreVersionCommand`, both before
versioning, and no hook between versioning and its commit, so the regeneration cannot land in the
release commit. The release commit is not amended, because the tag points at it.

Why no loop: the push uses `GITHUB_TOKEN`, which starts no workflow runs, and `docs/public` is not in
the Publish `paths` filter.

Rejected: dropping the version from the llms files. It removes the drift, but also tells an LLM
consumer which release the reference describes, which was the point of stamping it.

## Consequences

Main is `check:llms` clean right after a release. A failing generator fails the step before the push,
so nothing reaches origin, the same prevention as ADR-0102. The regeneration is only exercised by a
real release; it was simulated locally on a clone of the pre-0.3.8 state.
