---
status: accepted
date: 2026-10-03
sources:
  - tasks/todo.md ("0.3.5 on npm is not this repo's 0.3.5")
  - tasks/lessons.md (2026-10-03, "Run check:release-drift before pushing a release")
  - tools/scripts/check-release-drift.mjs
  - node_modules/@nx/js/dist/src/executors/release-publish/release-publish.impl.js (the skip, Nx 23.2.0)
  - GitHub runs 36884693651 (2026-10-01) and 37108775380 (2026-10-03)
---

# ADR-0150: A release must not skip an existing npm version

## Status

Accepted.

## Context

The 2026-10-01 release run published five packages at 0.3.5 and failed before its release commit and
tag, so git stayed at `v0.3.4`. The 2026-10-03 run derived 0.3.5 again. Nx's `nx-release-publish`
executor answered with `Skipped package "@atelier-ui/react" from project "react" because v0.3.5
already exists in https://registry.npmjs.org/ with tag "latest"` and exit 0; only
`@atelier-ui/styles@0.3.5` was new. npm then held pre-migration code under the version number the
repo's tag named. `check:release-drift` compared version numbers only, so it could not see it. The
executor has no option to fail on an existing version (its schema: `packageRoot`, `registry`, `tag`,
`access`, `dryRun`).

## Decision

1. `check-release-drift.mjs --pre-publish` runs as `styles:assert-unpublished`, a dependency of every
   library's `nx-release-publish`. It asks npm about every `package@version` of the release group
   and fails if one exists, unless that version records a `gitHead` equal to the current HEAD (a
   `publish-only` resume of the same commit). It fails closed if the registry cannot be reached.
2. The default mode also compares the published `gitHead` with the commit the local `v<version>` tag
   points to and reports `[CONTENT-DRIFT]` on a mismatch; a missing gitHead or tag is reported as
   unverifiable, never as in sync.

## Why this shape

- One task, not one per project: with a per-project check, `styles` could publish while `react` was
  refused. A single dependency keeps the group all-or-nothing.
- A dependency of the publish target, not a workflow step: `nx release --yes` versions, commits and
  publishes in one process, so a step cannot sit between versioning and publishing. The dependency is
  scoped to the six library projects because the `skills` group publishes in a second pass after the
  libraries exist on npm, where the check would always fail.
- `gitHead` rather than a tarball hash: npm records it for every version published from a checkout, and
  it is the only signal that is cheap and does not need a second build.
- Rejected: a `--force`/`skip` flag (none exists), wrapping `npm publish` ourselves (replaces Nx's
  executor, provenance and dist-tag logic), and failing only in CI's verify step (runs after the skip).

## Consequences

- `nx release publish --groups libraries` (and `--projects`) excludes task dependencies in Nx 23.2.0
  (`publish.js`, `shouldExcludeTaskDependencies`), so the guard does not run there. The workflow uses
  neither flag; anyone publishing by hand with them is outside the guard.
- A half-failed release now needs a new version rather than a retry: npm versions are immutable, and the
  guard refuses to publish over a commit it did not come from.
- `check:release-drift` is red on main until a 0.3.6 reaches npm, which is the intended signal.
