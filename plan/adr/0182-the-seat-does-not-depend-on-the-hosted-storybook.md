---
status: accepted
date: 2026-11-18
sources:
  - owner decision, 2026-11-18 (this session): the training workspace must not depend on the hosted Storybook; 'Es sollte definitiv einen lokalen MCP geben'
  - through-line review of both course days, 2026-11-18 (tasks/reviews.md R-253 to R-260; R-257 is the finding this record closes)
  - spike of 2026-11-18 in a workspace generated from the published 0.4.10 (logs under the session scratchpad, results copied into tasks/todo.md, "Local Storybook and MCP on the seat", L0)
  - plan/adr/0177-atelier-keeps-its-library-as-the-lab-for-an-mcp-package.md (§5 names the condition this record meets)
  - plan/adr/0175-day-1-block-05-screen-from-storybook.md (its Decision names the hosted `docs-list`; a dated correction is written there)
  - plan/adr/0136-reproducible-in-the-room-and-the-servers-that-come-with-it.md (the version pin the new dependency follows)
  - plan/adr/0143-an-unset-flag-defaults-to-the-deprecated-channel.md (`experimentalReview: true`, which a fixed entry needs just as much)
  - libs/mcp (the package), libs/create-workspace/src/generators/preset/preset.ts (the `.mcp.json` it generates)
---

# ADR-0182: The seat does not depend on the hosted Storybook

## Status

Accepted. The direction is the owner's, 2026-11-18. The three choices under "Decision" that the
spike settled (where the static build ships, a fixed entry, the server's name) were made from the
spike's evidence and confirmed by the owner the same day, together with the go to publish
`@atelier-ui/mcp`. On the fixed entry the owner added their own experience: MCP servers that are
down normally sit silently in the background and cause no trouble. Nothing here is rehearsed;
R-040 is the rehearsal.

## Context

A generated course workspace reads the library's component docs from
`atelier.pieper.io/storybook-<framework>/mcp`. In Day 1 Block 05 that endpoint is the only source
of information for 80 minutes, on every seat at once, and no file of the course names a fallback
(R-257). The participant's own Storybook does not help there: it holds the scaffold's one example
story.

The endpoint has not failed in a measurement. The load probe of 2026-11-12 answered 96 of 96
requests (ADR-0178). The concern is the dependency itself: one Cloudflare Worker, serving `main`
rather than the installed version, between twelve seats and the afternoon's exercise. ADR-0181
removed `uianatomy` from the course on the same reasoning the same day.

Two things already exist. `@atelier-ui/mcp` (ADR-0177) answers the same three tools over stdio
from a manifest snapshot and scored 94 % against the hosted endpoint's 96 % on the eval. And every
seat already runs its own Storybook with `@storybook/addon-mcp`, which the course connected by
hand in Day 2 Block 02 (`claude mcp add`) and used for nothing before that.

A scaffold release and a reprovisioning of the course machines are due anyway (R-252).

## Decision

**Two roles, two servers, both on the machine.**

1. **The library is read from the package.** The generated workspace depends on
   `@atelier-ui/mcp`, pinned to the preset's own version like the component package (ADR-0136),
   and `.mcp.json` starts it over stdio. The hosted `storybook-<framework>` entry leaves the
   generated `.mcp.json`, and the generated preflight stops probing it.
2. **The participant's own components and stories are read from their own Storybook.**
   `.mcp.json` carries a fixed `storybook-local` entry for `http://localhost:6006/mcp`. The
   `claude mcp add` step leaves the course path.
3. **The local server is part of the course from Day 1 Block 04**, where the first story is
   written, so the agent can run `test-run` on it there. Until now that was possible from Day 2
   Block 02 on.
4. **The library's Storybook is browsable on the seat.** The static build ships inside
   `@atelier-ui/mcp` and the workspace's Storybook mounts it with `staticDirs` at
   `localhost:6006/atelier/`. No second process.
5. **The library's server is called `atelier`**, the local one `storybook-local`. Prompts name the
   server they mean.
6. **The hosted endpoints stay up** until after cohort 1. Removing them is the rest of M4.
   ADR-0177 §5 allowed the scaffold to move before the first cohort on the condition that R-040
   rehearses on the package; this record takes that route.

### Why

- **The library half needs no process.** A stdio server that npm installed cannot be down, has no
  port and answers for the installed version. Spike: with all network denied to the process,
  `npx atelier-mcp` resolved from `node_modules/.bin`, `initialize` answered in 0.7 s, `docs-list`
  returned 29 components, `docs-show` the Button docs.
- **A fixed entry costs nothing when Storybook is down.** The scaffold's `CLAUDE.md` said a fixed
  `localhost` entry "would fail to connect on every Claude Code session started without that
  Storybook already running", and that was the reason for the hand-typed step. Observed: a
  headless session with Storybook down starts cleanly, reports the server as `failed` in its
  init event and simply has none of its tools; with Storybook up the same entry connects with
  nine tools. The failure is silent and local to that server. Against that, the hand-typed step
  cost ten minutes of Day 2 Block 02, had its own rescue rule (R8) and its own troubleshooting
  entry (wrong scope, duplicate server).
- **`staticDirs` is one line and keeps the two Storybooks apart.** The workspace's own
  `index.json` kept its 7 entries, the mounted one its 274; a library story rendered in headless
  Chromium with an empty console, also with outbound network blocked; `check:stories` still exits 0. The path resolves through the package (`getAbsolutePath('@atelier-ui/mcp')`, the helper the
  template already has), verified with the build copied into `node_modules`.
- **One package instead of two.** The static build is 3.9 MB gzipped, the package 82 KB today. A
  package of its own would be a second publish target and release-group entry for 4 MB.
- **`atelier` and not `storybook-angular`.** With both servers connected, one headless run asked
  for "the Storybook MCP" and the table component: the agent called `storybook-local` first, got
  only `AtlButton`, then found the right server on its own. Two servers named `storybook-*` make
  that sentence ambiguous by construction; a name per role does not, and it is the name the
  package's own README uses.

### Rejected

- **The library's story sources in the workspace Storybook.** The stories are not in the npm
  package and import monorepo internals; the MCP would die with the Storybook process;
  `check:stories` would render 32 stories the participant does not own.
- **An Atelier clone per seat.** A second repo and a second long-running process on every seat;
  ADR-0137 left the clone.
- **Keep the hosted entry and add the package as a fallback.** Three servers offering `docs-list`,
  and the one the course does not control stays first in line.
- **Keep `claude mcp add` and move it to Day 1 Block 04.** It keeps a typing step, a scope trap
  and a rescue rule in the fullest block of Day 1, to avoid a failure that turned out to be
  silent.
- **Keep the key `storybook-angular`.** It would leave prompts that name the server untouched, but
  the two prompts that say "the Storybook MCP" are the ones that go wrong, and they need the edit
  either way.

## Consequences

- `@atelier-ui/mcp` has to be published, which needs the owner's explicit go (L2 in
  `tasks/todo.md`; the steps are listed under M1). The package grows from 82 KB to about 4 MB.
- Scaffold: `.mcp.json`, the dependency, `staticDirs` in the Storybook template, the preflight
  probe, the generated `CLAUDE.md` paragraph that argued against the fixed entry, the spec tests
  and the CLI e2e (L3). `experimentalReview: true` (ADR-0143) stays: a fixed `.mcp.json` entry is a
  direct MCP client exactly like a `claude mcp add` one.
- Course material: Day 1 Block 04, Day 2 Block 02 (ten minutes come back), rule R8, the two
  different Block 04 fallbacks, demo D-3's primary source, both decks, `/schulung`, `/mcp`,
  `/workshop`, `/cheat-sheet`, `/troubleshooting`, `/build-your-own` (L4). The customer agenda is
  not touched; each change is checked against its communicated rows.
- The workspace's `build:storybook` output grows by about 16 MB (11.7 MB to 27.4 MB), because the
  mount is copied into it. The course does not build the workspace's Storybook.
- In the mounted library Storybook the Design tab stays empty without network (the Figma embed);
  the stories do not need it.
- The two servers share three tool names and use different id formats (`atlbutton` against
  `components-inputs-atlbutton`), and the local one lists `AtlButton` because of the scaffold's
  example story. The generated `CLAUDE.md` gets one routing sentence, and the routing is a
  rehearsal check.
- "Does not depend on the hosted Storybook" is the whole claim. The seat still needs the network
  for the Claude login, Figma and the docs site the prompts are copied from.
- Not observed, so rehearsal checks: how an interactive session shows the failed `storybook-local`
  entry; whether it connects when Storybook is started after `claude` or needs `/mcp`; the
  package's dependency install on a provisioned machine; a workspace generated from the release
  rather than patched by hand (the spike patched one generated from 0.4.10).
- **Weakest point:** the routing between the two servers was measured in one run with one prompt.
  The agent recovered, but a participant who reads "only AtlButton exists" off the first answer
  will not know why. The name change and the routing sentence are untested mitigations.
