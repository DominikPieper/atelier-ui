---
status: accepted
date: 2026-08-26
sources:
  - tasks/review-state-2026-08-26.md (state review — "Now": gate `publish` on CI)
---

# Gate npm publish on the full check suite

## Status

Accepted.

## Context

`.github/workflows/publish.yml` triggers on push to `main` (paths-filtered to
`libs/**`, `skills/**`, `package.json`, `package-lock.json`, `nx.json`,
`tsconfig.base.json`), on `release: published`, and on `workflow_dispatch`.
Its single `publish` job declared only `runs-on`: no `needs:`, no
`workflow_run`, and `grep -rn "needs:\|workflow_run" .github/workflows/`
returned nothing at all. `main` carries neither branch protection
(`gh api repos/:owner/:repo/branches/main/protection` → 404) nor rulesets
(→ `[]`).

`ci.yml` runs the sync checks (`npm run check:all`), lint, test, build +
skill packaging, and CLI e2e on the same push — **concurrently, with no
relationship to the publish run**. So the two workflows raced: a commit that
broke lint or a unit test could reach npm while CI was still running, or
after it had gone red.

Two partial mitigations did exist, and both are easy to over-read:

- `nx.json:68-70` makes `build` a `dependsOn` of `nx-release-publish`, so a
  package that does not compile cannot be published. Real, but it covers
  exactly one gate.
- `tools/git-hooks/pre-push` runs the 18 drift gates. Opt-in (it must be
  installed) and `--no-verify`-skippable — a reminder, not a gate.

The repo's whole pitch is verified parity across three frameworks. The one
path that ships artifacts to strangers was the least gated path in it.

## Decision

`publish.yml` gains a `verify` job, and `publish` declares `needs: verify`.

`verify` runs the same three commands CI runs on push to `main`:
`npm run check:all`, `npx nx run-many -t lint`, `npx nx run-many -t test`.
`run-many`, not `affected`: a release publishes every package, so "what did
this commit touch" is the wrong question at release time. The gate list
itself stays single-sourced in the `check:all` script in `package.json`, so
a new gate is picked up by both workflows without editing either.

The workflow also gains a `concurrency` group with
`cancel-in-progress: false`. `nx release` bumps versions, writes changelogs,
commits, tags, and publishes; two overlapping runs would race on the tag and
on the registry. Queue, never cancel — a run cancelled mid-publish is how a
tag ends up pushed with nothing published.

Alternatives considered:

- **`workflow_run` on CI success** — rejected. It gates only the push path,
  leaving `release` and `workflow_dispatch` ungated; it loses the paths
  filter, so every CI success on `main` would start a publish run that then
  no-ops; and it runs the workflow definition from the default branch
  against a sha it has to resolve by hand. More moving parts, less coverage.
- **Branch protection / a ruleset requiring CI on `main`** — rejected as a
  substitute. It protects the branch, not the release: a workflow triggered
  by `push` runs regardless, and the `release` / `workflow_dispatch` paths
  bypass it entirely. Worth adding on its own merits; it does not solve this.
- **Duplicating CI's full job matrix** (build, skill packaging, CLI e2e)
  into `publish.yml` — rejected. Build is already gated through the Nx
  `dependsOn`; CLI e2e costs ~5 min per framework and is `affected`-gated
  deliberately. The marginal risk does not justify doubling release time.
- **Leaving it and relying on the pre-push hook** — rejected for the reason
  above: opt-in and skippable.

## Consequences

- A release now costs one extra job (`npm ci` + `check:all` + lint + test)
  before anything reaches npm. Publish is paths-filtered and rare, so the
  duplicated compute against `ci.yml` on the same commit is accepted rather
  than optimised away.
- The recovery path is unchanged in shape but no longer unguarded:
  `workflow_dispatch` with `mode: publish-only` still exists, and now also
  waits on `verify`. Shipping past a red gate becomes an explicit human act
  (temporarily dropping `needs:`) instead of the silent default.
- **This raises the floor; it does not make the floor sound.** Three known
  holes survive at the time of writing: `storybook-test` (458 interaction
  tests + the axe scan on React and Vue) runs in no workflow at all;
  `check:a11y-parity` builds its roster by globbing the snapshot directory, so
  four components with no snapshots are invisible; and `check:figma` never
  checks snapshot age
  (`tools/figma/snapshot.json` carries `figmaLastModified: null`). "Green
  `check:all`" asserts less than it looks like it does. Those are tracked
  separately in `tasks/review-state-2026-08-26.md`.
  *Update, same day:* the first two are closed — `storybook-test` now runs as
  its own CI job, and the a11y roster is derived from the component dirs per
  ADR-0034. Snapshot freshness remains open.
- The longer release window makes overlapping runs likelier, which is why
  the `concurrency` group ships in the same change rather than later.
