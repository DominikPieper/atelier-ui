---
status: accepted
date: 2026-08-27
sources:
  - CI run 33024505043 (CLI e2e, all three frameworks, 2026-08-26T23:48Z)
  - libs/create-workspace/src/generators/preset/preset.ts (the ensurePackage calls this protects)
---

# ADR-0053: A required peer is a version npm picks for you

## Status

Accepted. Applies to `@atelier-ui/create-workspace`. The framework peers on
`@atelier-ui/{angular,react,vue}` are deliberately untouched — see Decision.

## Context

The CLI e2e went red on a push whose diff was CSS, three gate scripts and some
prose. It failed identically for all three frameworks:

```
TypeError: (0 , internal_1.combineGlobPatterns) is not a function
✖ Failed to apply preset: @atelier-ui/create-workspace
```

The same job had been green on the preceding commit, an hour earlier. Running the
e2e locally passed, which is the shape of evidence that sends you looking at the
runner.

It was not the runner. `nx@23.1.2` was published at 23:31; the run started at
23:48. Measured at the API boundary rather than inferred:

| package | `require('@nx/devkit/internal').combineGlobPatterns` |
|---|---|
| `@nx/devkit@23.1.1` | `undefined` |
| `@nx/devkit@23.1.2` | `function` |

and `@nx/eslint@23.1.2`'s plugin calls it at module load. Nx ships its core and
its plugins as one release and they reach across the package boundary, so a
plugin one patch ahead of core does not degrade — it throws on `require`.

The question is why a workspace pinned to `nx@23.1.1` had `@nx/eslint@23.1.2` in
it at all. `npm ls` in the scaffolded workspace answered it:

```
@atelier-ui/create-workspace@0.2.19
  └─ @nx/angular@23.1.2
       └─ @nx/eslint@23.1.2
```

Our own package. It declared `peerDependencies: { "@nx/angular": ">=22.0.0" }`,
and npm installs a required peer automatically, resolving the range to whatever
is newest. The preset never asked for 23.1.2; the range permitted it and npm
took it.

The declaration was also redundant. `preset.ts` already installs the plugin
itself, at the version the workspace is actually running:
`await ensurePackage('@nx/angular', NX_VERSION)`. The peer was pre-empting the
line whose whole job is to get the version right.

## Decision

**The `@nx/angular` peer is optional. `ensurePackage(NX_VERSION)` is the only
thing that installs it.**

```json
"peerDependencies": { "@nx/angular": ">=22.0.0" },
"peerDependenciesMeta": { "@nx/angular": { "optional": true } }
```

Measured, because the whole fix rests on this behaviour — a package with the peer
required and the same package with it optional, each installed into a clean
directory:

| peer | what npm installed |
|---|---|
| required | `@nx/angular@23.1.2` |
| optional | nothing |

The declaration stays, because the relationship is real and worth stating; the
auto-install stops. `NX_VERSION` is the version of the nx running the generator,
which is the one `create-nx-workspace` put in the workspace, so the plugin now
lands in lockstep with core by construction rather than by the registry's mood.

**The framework peers stay required.** `@atelier-ui/react` declaring
`react: ^18 || ^19` is the correct use: the consumer supplies React, and npm
installing it if they forgot is help, not interference. The distinction is who
installs the dependency. Where the package installs it itself, a required peer is
a second installer with worse information.

Alternatives considered:

- **Bump the monorepo to `nx@23.1.2`.** It would have gone green, and it fixes
  exactly one day: the next nx patch re-opens the same window between publication
  and our bump. It also needs a Linux-flavoured lockfile regeneration
  (`tools/scripts/relock.sh`, docker) to avoid the `devOptional` ↔ `dev` drift
  cycle, which was not available. Rejected as a fix; it remains a fine routine
  bump.
- **Pin the peer exactly (`"@nx/angular": "23.1.1"`).** Still an auto-install, now
  one that must be edited on every nx bump and that cannot track the workspace's
  own nx — the version it needs to match is not known when this package is
  published.
- **Rewrite every `@nx/*` entry in the generated `package.json` to `NX_VERSION`
  after generation.** Too late by construction: the throw happens *during*
  generation, when the plugin is `require`d, and the install task that would
  honour the rewrite runs afterwards. This was the first fix drafted, and
  reading the CI log's ordering is what disqualified it.

## Consequences

- **The generated workspace's nx packages agree by construction.** Core and
  plugins are installed by one line, at one version, taken from the workspace
  itself.
- **This class of break is closed, not this instance of it.** The failure was not
  "23.1.2 is bad" but "a range let a plugin outrun core", which recurs on every
  nx release under the old declaration.
- **A green local e2e no longer implies a green CI e2e, and did not here.** The
  local run installed the same skewed pair and passed anyway, because the
  generated `nx.json` had no `plugins` array, so nothing ever `require`d the
  eslint plugin. Worth remembering: this failure is only visible where something
  loads the plugin.
- **Open: `@nx/devkit` is still a hard dependency pinned to `23.1.1` here.** If
  `create-nx-workspace` ever scaffolds a workspace on a newer nx, `NX_VERSION`
  would read this package's pinned devkit rather than the workspace's nx, and the
  skew returns inverted. It has not bitten because the pin is bumped with the
  monorepo, but the mechanism is the same one this ADR is about. Tracked in
  `tasks/todo.md`.
