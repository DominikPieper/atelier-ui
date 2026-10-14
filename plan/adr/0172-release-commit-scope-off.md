---
status: accepted
date: 2026-10-14
sources:
  - tasks/reviews.md (R-203)
  - GitHub Actions publish run for commit d6dcfa4e (released 0.4.5)
  - node_modules/nx/dist/src/command-line/release/utils/semver.js (determineSemverChange, adjustSpecifierForZeroMajorVersion)
  - node_modules/nx/dist/src/command-line/release/config/conventional-commits.js
  - nx.json (release.conventionalCommits)
  - .github/workflows/publish.yml
---

# ADR-0172: Release ignores the commit scope when it derives the bump

## Status

Accepted. Recorded at decision time.

## Context

Commit `64929883` was written as `fix(a11y)!: …` with a `BREAKING CHANGE:` footer. It was
released as patch 0.4.5 instead of minor 0.5.0 (R-203; publish run for `d6dcfa4e`). The
breaking change reached consumers labelled as a patch.

Mechanism, read from nx's source and reproduced in a scratch worktree. With
`release.conventionalCommits.useCommitScope` at its default (`true`), `determineSemverChange`
(`semver.js`, lines 28-38) treats a commit whose scope is not a project name as relevant to
the project only indirectly. It records a PATCH and `continue`s before the breaking check at
line 41. `adjustSpecifierForZeroMajorVersion` (lines 69-86) therefore receives "patch" and
maps nothing. `a11y` is a topic, not a project, so `fix(a11y)!` and `feat(a11y)!` both
resolve to patch, while `fix!`, `feat!` and `fix(styles)!` resolve to major, which on 0.x
becomes minor. The same commit type is released differently depending on a free-text scope.

Options considered:

1. **`useCommitScope: false`.** The scope no longer decides relevance; the commit type and
   the breaking marker do.
2. **Commit discipline only** (never scope a breaking commit with a non-project name).
   Rejected: it holds only by habit, and the 0.4.5 commit was written by someone who knew the
   convention.
3. **An explicit `nx release minor` for breaking releases.** Rejected: CI runs
   `npx nx release --yes` with defaults, and an explicit specifier only catches the cases
   someone remembers to check before the run.
4. **Accept the behaviour.** Rejected: a breaking change published as a patch is the one
   failure a semver gate must not have.

Also tried and rejected as a fix: `adjustSemverBumpsForZeroMajorVersion: false` does not
help, and would turn a correctly scoped breaking commit into 1.0.0. Putting
`conventionalCommits` under `groups.libraries.version` is wrong: it replaces the boolean
that enables conventional commits for the group and prompts interactively.

## Decision

Set `useCommitScope` to `false` in the workspace-level `release.conventionalCommits` block.
The option, and the nx version it was verified against, live in `nx.json` and
`package.json`; this record states the decision, not the current pin.

## Consequences

Verified with `nx release version --dry-run --verbose` in a scratch worktree on the
0.4.5 tag state, one scratch commit per run:

- A breaking commit now bumps minor on 0.x whatever its scope: `fix(a11y)!` resolves to
  "major", new version 0.5.0 for `styles` and, as one fixed group, for all six library
  projects. With the default it resolved to "patch", 0.4.6.
- A `feat` under a non-project scope (`feat(schulung)`) now resolves to "minor", but nx's
  0.x adjustment maps that to 0.4.6 as well. The outcome equals the old indirect patch; only
  the label changed. The option does not make 0.x feature releases minor.
- `docs(…)` touching a library bumps nothing, as before.
- The independent `skills` group follows the same rule per project: `fix(a11y)` touching
  `skills/design-to-code` bumps only that skill (0.1.9 to 0.1.10); the other three skills
  report no changes. Default and `false` gave the same result for a non-breaking fix there.
- Not exercised: a breaking commit scoped to a skill, and commits that touch several
  projects at once.
- Commit scopes are free text again as far as versioning goes. `useCommitScope` is read
  only in `semver.js` and `config/conventional-commits.js`, so the changelog is unaffected:
  the renderer still groups by type and still prints the scope as a bold prefix on each line
  (read in `release/changelog-renderer/index.js`, not run).
- Weakest point: a commit that touches a library file under an unrelated scope now counts
  for that library, so a mis-scoped `feat` or breaking marker bumps the library; scope can no
  longer be used to opt a change out of a release. Opting out is by type (`docs`, `chore`).
