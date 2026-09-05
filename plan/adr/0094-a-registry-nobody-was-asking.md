---
status: accepted
date: 2026-09-05
sources:
  - "measured 2026-09-05: npm view @atelier-ui/react version -> 0.2.27 vs
    libs/react/package.json -> 0.2.33 (all five libraries group packages
    drifted the same way)"
  - .github/workflows/publish.yml:111-127 (Release and Publish step; the PUT
    404 the drift traces back to)
  - tools/scripts/check-release-drift.mjs
  - nx.json (release.groups.libraries.projects — the roster this gate derives
    from)
  - plan/adr/0024-design-parity-persistence-gate.md (the `check:all` stays
    offline/deterministic precedent this gate follows by staying OUT)
  - plan/adr/0033-gate-publish-on-full-check-suite.md (the verify job this
    gate stands beside in publish.yml — it runs check:all, which by design
    cannot see a registry)
---

# ADR-0094: A registry nobody was asking

## Status

Accepted. `check:release-drift` (`tools/scripts/check-release-drift.mjs`)
compares every publishable package's local version against what npm actually
serves. Wired as its own `check:release-drift` script (not into `check:all`),
a verification step in `.github/workflows/publish.yml` right after Release
and Publish, and a main-only job in `.github/workflows/ci.yml`.

## Context

Publishing broke on 2026-08-29, and the word for how it stayed broken is not
"silently" — each run with a real bump went red. Six `chore(release): publish`
commits since then each bumped `libs/*/package.json`, wrote a changelog,
committed, and pushed — because `nx release --yes` versions, commits, tags
and pushes *before* it publishes. The publish half then failed inside
`nx release` with npm's 404-on-PUT mask for missing publish rights
(`secrets.NPM_TOKEN` expired or under-scoped; rotating it is out of scope
here — that's the token owner's job). The runs in between were green no-ops.
`nx release --yes` skips publishing when there is no version bump, so those
runs proved nothing either way; they just didn't fail.

Nothing in the repo compared "what git says shipped" against "what npm
actually has." `check:all`'s 34 gates are all offline, comparing committed
artifacts to each other. `publish.yml`'s own `verify` job runs lint/test/
`check:all` — none of which can see the registry. The gap sat there for a
week with zero local signal, and would have kept doing so indefinitely: nx
release's failure is buried in nested tool output on a workflow run nobody
was watching, not surfaced as a named, specific claim ("release X did not
reach npm").

## Decision

**Add `check:release-drift`.** For each project in nx.json's
`release.groups.libraries.projects`, resolve its directory by scanning
`libs/*/project.json` for a matching `name` (not by assuming `libs/<name>`),
read its `package.json`, skip anything `"private": true`, and compare the
local `version` against `npm view <name> version --json`.

**Two failure modes, never blurred:**
- Registry unreachable (DNS/timeout/connection refused) → exit **0** with an
  explicit `[SKIP]` message. Being offline is not evidence of sync; it means
  the question was never asked. Bounded by both npm's own `--fetch-timeout`
  and a Node-level `spawnSync` timeout, so an unreachable registry can never
  hang the gate.
- Registry answers and a version differs → exit **1**, naming every drifted
  package with both versions.

If any single package's lookup comes back unreachable mid-run, the *whole*
gate skips rather than reporting the packages already checked — a registry
that answered for package 1 and vanished for package 2 has proven it's
unreliable right now, not that package 1 is the only thing worth reporting.

**Deliberately excluded from `check:all`.** Every gate in that chain is
offline and deterministic (ADR-0024's framing for `check:figma` applies
here too, even though — corrected in this ADR — `check:figma` is in fact
*included* in `check:all` today, because its own live-Figma dependency was
already pushed out to a committed-snapshot refresh step; this gate has no
equivalent offline projection to fall back on, since "what does npm serve
right now" cannot be answered from a committed artifact without reinventing
the registry). Folding a live network call into `check:all` would make all
34 of its gates only as reliable as the network at the moment they run.

**Wired in two places instead of one:**
- `.github/workflows/publish.yml`, as a step immediately after Release and
  Publish. Turns a partial or silent non-publish into a named, specific CI
  failure instead of an npm 404 buried in Nx's own output — the exact
  visibility gap this gate exists to close.
- `.github/workflows/ci.yml`, as its own job gated `if: github.event_name ==
  'push' && github.ref == 'refs/heads/main'`. A PR's branch hasn't been
  published yet, so comparing its versions to npm proves nothing; on main,
  this is the check that would have caught the 2026-08-29 breakage a week
  earlier — main's status goes red the moment a publish fails and stays red
  on every subsequent commit until a publish actually lands, not just the
  one commit that triggered the failure.

**Alternatives rejected:**
- *Fold it into `check:all`'s existing chain.* Rejected — see above; it
  would make every offline, deterministic gate hostage to registry
  reachability.
- *Only wire it into `publish.yml`.* Rejected — a step there only runs at
  publish time. Between a failed publish and the next release attempt
  (which could be days), nothing signals the drift; the CI job makes it
  visible on every push to main in between.
- *Fail hard (never skip) when the registry can't be reached.* Rejected —
  that would make the gate red on every runner with a flaky network path to
  npm, indistinguishable from a real drift. The two failure modes must stay
  distinguishable, or the gate teaches people to ignore it.

## Consequences

- Run today: exit 1, all five `libraries` group packages named — `@atelier-
  ui/angular`, `@atelier-ui/react`, `@atelier-ui/vue`, `@atelier-ui/create-
  workspace`, and `create-atelier-ui-workspace` — each local 0.2.33 vs
  published 0.2.27. `create-atelier-ui-workspace` (unscoped, no `@atelier-ui/`
  prefix) resolves cleanly to `libs/create-atelier-ui-workspace/package.json`
  and is not private, so it is drifted along with the other four, not merely
  "possibly unmapped" as its nx.json entry might suggest at a glance.
- Negative-tested both non-drift branches: pointing the check at a single
  project (`node tools/scripts/check-release-drift.mjs react`) with its local
  version temporarily set to the published 0.2.27 exits 0; forcing the
  registry unreachable (`npm_config_registry=http://127.0.0.1:1/`) exits 0
  with the `[SKIP]` message, never a false "in sync."
- `check:all` stays at 34 gates — this script does not join that chain.
- The actual fix (rotating `NPM_TOKEN`) is not this gate's job and is not
  done here; this gate only makes the next occurrence loud instead of silent.
