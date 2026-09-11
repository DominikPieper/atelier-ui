---
status: accepted
date: 2026-09-10
sources:
  - libs/create-workspace/src/generators/preset/preset.ts (the scaffold this record changes)
  - tools/scripts/preflight.mjs (`PORTS_BY_ENV.scaffold` — the 6006 check that predated the Storybook it checks for)
  - skills-lock.json + `.agents/skills/{stories,storybook-init,storybook-setup,storybook-upgrade}/SKILL.md` (the install this record automates, performed by hand in this repo on 2026-09-10)
  - node_modules-free read of `skills@1.5.25` in the npx cache (`add --help`, bundled simple-git, `DO_NOT_TRACK` / `SKILLS_CLONE_TIMEOUT_MS`)
  - plan/adr/0110-pin-the-server-the-skills-hardcode.md (the pinning decision this one deliberately diverges from)
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (the scaffold's audience)
  - plan/adr/0090-one-preflight-branched-inside-not-forked-outside.md (why the 6006 check lives inside the shared file)
  - libs/{angular,react,vue}/.storybook/main.ts (the config shape the scaffold mirrors)
  - libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs (where the scaffolded Storybook is proven to build)
---

# ADR-0123: the prerequisite ships with the skill

## Status

Accepted.

## Context

The four agent skills in `storybookjs/mcp` — `stories`, `storybook-init`, `storybook-setup`,
`storybook-upgrade` — were installed into this repo by hand on 2026-09-10 (`npx skills add
storybookjs/mcp`, leaving `skills-lock.json`, `.agents/skills/<name>/SKILL.md` and a
`.claude/skills/<name>` symlink each). The question that produced this record was whether
that install could happen automatically when `create-nx-workspace` scaffolds an attendee's
workshop workspace.

It could, mechanically. What the question surfaced first is that the skills would have
landed somewhere they cannot work. All four require a local Storybook ≥ 10.5, the
`storybook ai` CLI and `@storybook/addon-mcp`; the scaffolded workspace had none of them.
It consumes the three hosted `docs`-only MCP endpoints at `atelier.pieper.io/storybook-<fw>/mcp`
and never runs a Storybook of its own. And `stories` does not describe itself as an
optional helper — its frontmatter claims every UI task there is ("Invoke FIRST, before
creating, editing, or deleting components, stories, styles, CSS, themes, colors, or design
tokens — anything that changes how the UI looks, no exceptions"). Installed into a
Storybook-less workspace, its first move on an attendee's first component is to propose
installing Storybook. The skill would not have been a tool in the workshop; it would have
been the workshop's first detour.

`preflight.mjs` had already decided the other half of this. Its `scaffold` branch checks
"dev server (4200) + Storybook (6006)" and its comment calls 6006 "its single local
Storybook" — while `preset.ts` provably never wrote one. Two files, each internally
coherent, disagreeing about whether the thing they both describe exists. The gap was
invisible because nothing runs both: preflight is a participant's self-check, the preset is
a generator, and no gate reads one against the other.

The second half of the question is supply. `skills-lock.json` records only `source` and
`computedHash`; the CLI (`skills@1.5.25`, bundling simple-git) clones the repository's
default branch and its `add --help` exposes no ref, tag or commit form. So any automatic
install pulls third-party skill text as it stands at the moment of the scaffold — which,
for a workshop, is the morning of the workshop.

## Decision

**Storybook always ships in the scaffolded workspace**, not behind a flag. Per
`workshop-<fw>` app: a `.storybook/` config mirroring the corresponding library's
(`@storybook/{angular-vite,react-vite,vue3-vite}`, `addon-mcp` + `addon-docs` +
`addon-a11y`, `componentsManifest`, and `experimentalDocgenServer` for Angular and Vue),
the tokens stylesheet imported in the preview, one example story, and `storybook` /
`build-storybook` targets as `nx:run-commands` in the shape the libraries already use.
Storybook packages are pinned to the exact versions this monorepo runs, so an attendee's
Storybook is their neighbour's Storybook. Port 6006 for the first framework, +1 per
further one — which is what preflight was already checking.

`@storybook/addon-vitest` is deliberately left out: the scaffold has no test runner, so the
skills' `test-run` tool is unavailable there. That is stated in the generated `CLAUDE.md`
rather than left for the attendee to discover mid-task.

**The skills are installed by the preset itself**, as a post-generator phase after the
dependency install: `npx -y skills@1.5.25 add storybookjs/mcp --skill "*" --agent
claude-code --yes --copy`, with `DO_NOT_TRACK=1` and a bounded `SKILLS_CLONE_TIMEOUT_MS`.
Four details are each a decision:

- `--agent claude-code`, not the `--all` shorthand, which expands to every supported agent
  and would leave `.cursor/`, `.codex/` and friends in a workspace that uses none of them.
- `--copy`, not the CLI's default symlink farm: an attendee on Windows without developer
  mode cannot create symlinks, and a scaffold that only works on macOS is not a scaffold.
- `DO_NOT_TRACK=1`: the install is automatic, so the attendee did not choose to emit a
  telemetry event and should not be made to.
- **Non-fatal.** A failed clone prints the exact command to re-run and the scaffold
  completes. A workspace without its skills is a nuisance; a scaffold that dies at its last
  step because a conference network dropped is a ruined morning.

A `skills` schema option (default `true`) turns the install off for CI and offline runs.

**Alternatives rejected.** _Vendoring pinned copies of the four `SKILL.md` files into the
preset with a byte-drift gate_ — the shape `sync-preflight.mjs` already uses — would have
been offline, deterministic and pinnable, and was rejected because it forks third-party
text this repo does not own and buys an update ritual for content that changes on someone
else's schedule. _Writing `skills-lock.json` and leaving the attendee to run
`skills experimental_install`_ keeps the network off the scaffold path but adds a step to
the one part of the morning that must not have steps. _Documentation only_ was rejected as
not answering the question that was asked.

**The cost this accepts.** ADR-0110 pinned `figma-console-mcp` to an exact version
precisely so that upstream text the repo's skills depend on cannot change underneath a
workshop. This record diverges from that for the skills themselves, and not because the
risk is smaller — it is the same risk — but because the upstream offers no way to pin:
no ref form in the CLI, no commit in the lockfile. The divergence is deliberate and
bounded by the CLI version pin, the timeout and the non-fatal wrapper. Two things would
close it: an upstream `owner/repo@ref` form in `skills add`, or vendoring with a drift
gate. Either is a straightforward revisit of this record.

## Consequences

The scaffold is bigger and slower. Storybook 10.6 plus a framework package and three
addons is a real download on conference wifi, and the CLI e2e now also builds each
scaffolded Storybook — measured at 18–30s of install and 12–14s of build per framework
locally, which is why `cli-e2e`'s job budget went from 30 to 45 minutes and why the
network install is exercised for exactly one framework per run rather than three.

**Building the thing the skills need surfaced two defects that had been invisible**, both
of the same shape: a dependency this monorepo happens to satisfy and a fresh scaffold does
not.

1. `@storybook/angular` declares a non-optional peer on `@angular-devkit/build-angular`.
   This repo has it; an Nx Angular app builds with `@angular/build` and does not, so npm
   resolved the peer itself, chose the v21 line, and collided with the workspace's Angular
   22 — `npm install` failed outright. The scaffold now uses `@storybook/angular-vite`
   alone, which exports `Meta`, `StoryObj`, `argsToTemplate` and the rest itself. React and
   Vue additionally declare `@storybook/react` / `@storybook/vue3` explicitly rather than
   relying on the `*-vite` packages' hoisted transitive copy, which pnpm's layout would not
   provide.
2. `@atelier-ui/angular`'s published bundle imports six `@angular/cdk/*` subpaths while
   `libs/angular/package.json` declared peers only for core, common and forms. Nothing in
   this repo could see it: the root has CDK, and the scaffolded app never imported the
   library until the example story did. `@angular/cdk` is now a declared peer.

The second one is the more useful finding, because of _why_ nothing caught it:
`@nx/dependency-checks` — the rule whose entire job this is — **was never enabled for the
three publishable UI libraries**, only for the two Nx-plugin packages. It is now wired for
`libs/angular`, verified by removing the new peer entry and watching lint fail on exactly
that dependency. `libs/react` and `libs/vue` have the same structural gap and, today, no
defect behind it; closing it is open work in `tasks/todo.md` rather than done here, so the
gap is recorded rather than quietly left.

What is proven, and what is not: the React scaffold is green end to end through local
verdaccio — real install, `nx build`, `nx build-storybook`. The skills install was proven
directly (the preset's exact argv in a scratch directory: exit 0, four real `SKILL.md`
files under `.claude/skills/`). The Angular scaffold's `npm install` and `nx build` are
green; its `build-storybook` has not been re-run since the `@angular/cdk` fix, so that leg
is reasoned-about, not measured. `installSkills()`'s Windows path — `shell: true` plus a
`taskkill /T /F` process-tree kill on timeout — is unverified on Windows, and says so in
the code: there is no Windows machine or runner in this project.

Two things this record knowingly leaves standing. The example story is proven to _compile_,
not to _render_ — a static Storybook build does not execute it. And the generated CLAUDE.md
now explains, rather than papers over, that the skills' `dev`-toolset tools need a local
`@storybook/addon-mcp` endpoint that `.mcp.json` deliberately does not pre-wire (a fixed
`localhost` entry would fail on every session started without that Storybook running —
the same call this repo's own root `.mcp.json` makes); it ships the exact snippet to add
instead.

**Corrected 2026-09-10 (same day).** The Decision's "`@storybook/addon-vitest` is
deliberately left out: the scaffold has no test runner, so the skills' `test-run` tool is
unavailable there" is reversed by the owner. The sentence reasoned in a circle — no test
runner because none was shipped — and it was written without ADR-0121
(`plan/adr/0121-the-stories-are-the-spec.md`), decided earlier the same day, under which
**the stories are the component's spec and every story is a render, interaction and axe
test**. A scaffold that ships Storybook but cannot run its stories as tests would hand
attendees the spec without the check. The scaffold now also ships `@storybook/addon-vitest`,
Vitest browser mode on Playwright Chromium (`<app>/vitest.config.ts`, named so the addon's
`test-run` discovery finds it — ADR-0112), the a11y preview annotations, a
`storybook-test` target and `check:stories`, with `parameters.a11y.test: 'error'` as in the
monorepo (ADR-0122). Chromium is installed by the attendee (`npx playwright install
chromium`, checked by `preflight.mjs`), not by a postinstall — a conference network should
not decide whether `npm install` completes. The generated `CLAUDE.md` says `test-run`
works once a local Storybook with `addon-mcp` is running, instead of saying it is
unavailable. Cost accepted: Playwright plus Chromium on top of the download this record
already measured; the CLI e2e installs Chromium and runs the scaffolded suite once per run.
The rest of this record — Storybook always ships, the skills install post-generator, the
unpinned-skill-text cost — stands.
