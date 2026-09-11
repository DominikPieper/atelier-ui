---
status: accepted
date: 2026-09-06
sources:
  - .github/workflows/publish.yml (the fix: the new "Push the release commit and
    tag(s)" step, and the extended comments on "Release and Publish" and "Verify
    the publish actually reached npm")
  - nx.json (release.changelog.workspaceChangelog.createRelease — flipped from
    "github" to false; the only knob this ADR turns)
  - node_modules/nx/dist/src/command-line/release/release.js (Nx 23.2.0 — the
    composite `nx release` command's own `shouldPush` is computed only from
    `shouldCreateRemoteRelease(...)`; it never reads any `git.push` setting)
  - node_modules/nx/dist/src/command-line/release/config/config.js (Nx 23.2.0 —
    `GIT_PUSH_FALSE_WITH_CREATE_RELEASE`; `changelogGitDefaults.push` computed
    from whether `createRelease` is enabled anywhere in the resolved config)
  - "gh release list (run 2026-09-06): last GitHub Release v0.0.33 at
    2026-04-25T16:13:32Z; commit b1725d68 (\"feat(skills): figma-workspace-
    architect — auto-release + discovery mirror\", 2026-04-25T19:01:06+02:00,
    ~45 min later the same day) added both the `skills` release group and
    `workspaceChangelog.createRelease: \"github\"`; zero GitHub Releases created
    since, across roughly thirty subsequent version bumps (v0.0.33 through
    today's v0.2.37)"
  - node_modules/npm (11.16.0, this machine's installed npm) /
    node_modules/libnpmpublish/lib/provenance.js (the attested `gitCommit` is
    `env.GITHUB_SHA`, an Actions-provided env var fixed at job start — not `git
    rev-parse HEAD` — and `sigstore.attest()` performs no remote-reachability
    check on it)
  - plan/adr/0016-release-nx-release-not-for-production.md (revises: the
    "`nx release --yes` for versioning/publish" decision described a single
    invocation that also pushed before publishing; it no longer does)
  - plan/adr/0033-gate-publish-on-full-check-suite.md (the `verify` job and the
    ref-independent `concurrency: publish` group this sits beside, unchanged)
  - plan/adr/0094-a-registry-nobody-was-asking.md (the drift-check retry loop
    this ADR's push step now gates on, not just stands beside)
---

# ADR-0102: Publish before push (revises ADR-0016's `nx release --yes` single invocation)

## Status

Accepted.

## Context

`.github/workflows/publish.yml` ran `npx nx release --yes` for a normal release:
one command that versions, writes changelogs, commits, tags, **pushes**, and
only then publishes. A publish failure therefore left git ahead of npm by
construction, not by accident. This happened for six releases starting
2026-08-29 (ADR-0094) and three more times today: `chore(release)` commits and
tags reached `origin` while the registry still served an older version.

**Why the push happened before publish at all.** Reading Nx 23.2.0's own
installed source (not just its docs) settles this precisely.
`release.js`'s composite `nx release` command computes whether to push as:

```js
const shouldCreateWorkspaceRemoteRelease =
  shouldCreateRemoteRelease(nxReleaseConfig.changelog.workspaceChangelog);
...
const shouldPush =
  (shouldCreateWorkspaceRemoteRelease ||
    releaseGraph.releaseGroups.some((g) => shouldCreateRemoteRelease(g.changelog))) ??
  false;
```

`shouldPush` never reads any `git.push` setting — only whether a GitHub Release
(`changelog...createRelease`) is configured anywhere. `nx.json` had
`release.changelog.workspaceChangelog.createRelease: "github"`, so `shouldPush`
was unconditionally `true`, and the composite command pushes — right after tag,
strictly before the publish decision — so that the about-to-be-created GitHub
Release has a tag to point at. There is no flag to reorder this within one
`nx release` invocation: `config.js` actively **rejects** the seemingly obvious
fix (`release.git.push: false`, or the same under `version`/`changelog`) with a
hard `GIT_PUSH_FALSE_WITH_CREATE_RELEASE` config error whenever `createRelease`
is enabled anywhere — Nx's position is that you cannot disable the push and keep
the release-creation feature, because a GitHub Release needs its tag to already
be on the remote.

**`createRelease` has done nothing for four and a half months.** `nx release`
disables workspace-level changelogs (and `createRelease` with them) the moment a
workspace has more than one release group — confirmed live: `nx release
changelog ... --dry-run` prints `Workspace changelog is enabled, but you have
multiple release groups configured. This is not supported, so workspace
changelog will be disabled.` This repo has had two release groups
(`libraries`, `skills`) since commit `b1725d68`, landed 2026-04-25 — the same
commit that added `createRelease: "github"` in the first place. `gh release
list` shows the last GitHub Release was `v0.0.33`, created ~45 minutes
_before_ that commit landed. Not one GitHub Release has been created since,
across roughly thirty subsequent version bumps. The config that was forcing
every release to push before publishing has not delivered the feature it was
turned on for since the day it was added.

**Constraints carried over unchanged:** `publish-only` mode is the recovery
path for exactly the state this fix prevents (there are unpublished tags in
history it may still be needed for) and must keep working exactly as before.
The post-publish `check:release-drift` verification step and its retry loop
(ADR-0094) stay — they are detection, this is prevention, and one does not
replace the other (see the extended step comment). The `concurrency: publish`
group is untouched.

**The provenance question, checked against real code, not recollection.**
The initial framing for this fix worried that publishing _before_ any commit
exists would attest a tree whose `package.json` still carries the previous
version, and asked whether publishing from a locally-committed-but-unpushed SHA
would break `NPM_CONFIG_PROVENANCE` attestation because that SHA isn't yet on
the remote. It does not, but not for the reason assumed — the attested git
commit is not derived from the local repository at publish time at all.
`libnpmpublish/lib/provenance.js` (read from this machine's installed npm
11.16.0) builds the SLSA predicate's `resolvedDependencies[0].digest.gitCommit`
from `env.GITHUB_SHA` — a GitHub Actions environment variable fixed for the
whole job at the triggering event, unaffected by any commit the job itself
makes afterward — and `sigstore.attest()` only signs that JSON payload via
Sigstore's OIDC-derived keyless signing; it never queries git or GitHub to
check whether the attested SHA is reachable anywhere. So commit/push ordering
has **no effect on provenance validity either way**: publishing with an
uncommitted bump, a locally-committed-but-unpushed bump, or an already-pushed
bump all attest the identical `GITHUB_SHA`. (A side effect worth naming: this
means provenance has always attested the pre-bump _triggering_ commit, never
the `chore(release): publish` commit itself — true before this ADR and after
it, unrelated to the defect being fixed here.)

## Decision

**Turn off the config that was forcing the push — it wasn't delivering
anything anyway — and take over pushing explicitly, gated on both publish and
the drift check succeeding.**

1. **`nx.json`**: `release.changelog.workspaceChangelog.createRelease` changes
   from `"github"` to `false`. Verified live with `nx release patch --dry-run
--yes -g libraries --verbose` before and after: before the change, the
   sequence is `Committing changes with git` → `Tagging commit with git` →
   `Pushing to git remote "origin"` → _then_ `Running target nx-release-publish`;
   after the change, `Pushing to git remote "origin"` no longer appears at all —
   `Tagging commit with git` is followed directly by `Running target
nx-release-publish`. `npx nx release --printConfig` confirms the same before/
   after difference in the resolved config. No other line in either dry run
   changed — the five per-project `CHANGELOG.md` previews are byte-identical,
   confirming workspace-level changelog really was already inert either way.

2. **`.github/workflows/publish.yml`**: a new step, **"Push the release commit
   and tag(s)"**, added as the last step of the `publish` job, after "Verify the
   publish actually reached npm":

   ```yaml
   - name: Push the release commit and tag(s)
     if: github.event.inputs.mode != 'publish-only'
     run: git push --follow-tags --no-verify --atomic
   ```

   `--follow-tags --no-verify --atomic` is the exact command Nx's own
   `gitPush()` utility used to run (`utils/git.js`) — parity with the behavior
   being taken over, not a new push shape. It is gated to skip `publish-only`
   (which never versions, commits or tags anything, so it has nothing of its
   own to push — its recovery-path behavior is unchanged). It runs _after_ the
   drift-check step, not merely after "Release and Publish", so that origin
   only advances once an independent registry query — not just `nx release`'s
   own exit code — has confirmed npm has the version. GitHub Actions stops a
   job at the first failing step when no earlier step is marked `if: always()`
   (neither "Release and Publish" nor "Verify..." is), so if either publish or
   the drift check fails, this step never runs: the commit and tag(s) made on
   that disposable runner are discarded with the job, and origin never sees
   them.

   The existing step comments are extended, not replaced, to say why both the
   drift check and the push-gate exist side by side (detection vs. prevention)
   and why `publish-only` is untouched — see the diff for the full text.

**Alternatives considered:**

- **Set `release.git.push: false` (or the `version`/`changelog`-scoped
  equivalent) in `nx.json`.** Rejected — this is exactly what `config.js`'s
  `GIT_PUSH_FALSE_WITH_CREATE_RELEASE` check exists to refuse: with
  `createRelease` enabled anywhere in the resolved config, `nx release` would
  hard-error before doing anything, not quietly skip the push. This was true
  right up until step 1 above turned `createRelease` off — at which point the
  restriction stops applying, but by then there's nothing left to configure:
  `shouldPush` is already unconditionally `false`.
- **Reorder so the commit happens after publish** (bump versions on disk only,
  publish the bumped-but-uncommitted tree, then commit + tag + push). This was
  the initial framing's rejected alternative, on provenance grounds — grounds
  this ADR found do not actually hold (above). It is rejected anyway, on
  simplicity grounds: Nx's own version step never commits by itself (`nx
release version`'s git defaults are stage-only — confirmed with `nx release
version patch --dry-run -g libraries --verbose`, which shows `git add`, not
  `git commit`); getting a commit and matching tag(s) out of a publish-first
  order means either reimplementing Nx's per-group commit-message and tag-name
  choreography by hand (this workspace has two release groups with two
  different tag patterns — `v{version}` for `libraries`, fixed;
  `skill-{projectName}-{version}` per project for the independent `skills`
  group — logic worth trusting to Nx, not re-deriving in bash), or invoking the
  standalone `nx release changelog` subcommand mid-flow, which — per
  `config.js`'s `changelogGitDefaults` — runs its post-git task (create the
  GitHub Release) unconditionally whenever `createRelease` is configured, with
  no CLI flag to suppress it per-invocation, regardless of whether a push
  actually happened first. Since `createRelease` is off anyway after step 1,
  none of that complexity buys anything.
- **Split into `nx release version` / `nx release publish` as separate CLI
  invocations with explicit git steps in between** — the fallback the original
  framing proposed if suppressing push alone wasn't possible. Confirmed
  workable in principle (the standalone `version` subcommand's git defaults are
  stage-only, as above), but unnecessary: once `createRelease` is off, the
  existing single `nx release --yes` invocation already stops pushing on its
  own (verified live, see Decision §1), so there's no reason to give up the
  one-command choreography Nx already gets right for a hand-split version that
  would have to reproduce it.
- **Run the new push step right after "Release and Publish" succeeds, without
  waiting on the drift-check retry loop.** Rejected — gating on the drift check
  too costs nothing (GitHub Actions already stops the job on any earlier
  failing step) and makes prevention depend on an independent registry query,
  not only on `nx release`'s own exit code, which is strictly stronger.

## Consequences

- `nx release --yes` (and any explicit-specifier variant) no longer touches the
  remote on its own. The new workflow step is the _only_ thing in the
  `publish` job that pushes, and it runs only when the mode is not
  `publish-only` and only after both "Release and Publish" and "Verify the
  publish actually reached npm" have succeeded. A failed publish now leaves a
  local commit and tag that the runner discards; origin cannot run ahead of
  the registry by construction, mirroring the fix ADR-0094 made for
  _detecting_ this class of drift with a fix for _preventing_ it.
- `workspaceChangelog.createRelease` is now `false`. Nothing user-visible is
  removed: no GitHub Release has been created since 2026-04-25 regardless of
  this config's value (see Context), so this switches off a forced side effect
  of dead configuration, not a working feature. The `release: published`
  trigger in `publish.yml` is untouched and unaffected — it fires on a human
  manually publishing a GitHub Release, which was already the only way a
  GitHub Release could reach this repo.
- `publish-only` mode is unchanged: `nx release publish` alone never performed
  git operations, so the new step's `if:` guard means its execution graph is
  identical to before this ADR.
- **Residual risk, named rather than glossed over:** if publish _and_ the
  drift check both succeed but the new `git push` step itself then fails
  (network blip, a non-fast-forward because something else pushed to `main`
  meanwhile, branch protection), npm ends up with a version whose commit and
  tag never reached `origin` — the mirror image of the defect this ADR fixes,
  though smaller in consequence: no token to rotate, no registry involved,
  resolved by re-running `git push`. Left unaddressed here (no retry added for
  this step) — the failure mode is rare (an already-authenticated push,
  moments after a chain of steps that just succeeded, on the same runner) and
  out of this change's scope; a future push-retry loop, symmetrical to
  `check:release-drift`'s, would be a reasonable small follow-up if it is ever
  actually observed.
- Provenance attests `GITHUB_SHA` — the commit that triggered the workflow run
  — never the `chore(release): publish` commit `nx release` creates during the
  job. That was true before this ADR and remains true after it; recorded here
  because the investigation that produced this ADR is what surfaced it, not
  because this ADR changes it.
