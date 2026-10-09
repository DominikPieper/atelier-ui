---
status: accepted
date: 2026-10-09
sources:
  - plan/research/cds-substrate-spike-2026-10-09.md (the spike: contract loop, parity and story tests run against the CDS)
  - conciso-design-system, branch spike/atelier-kata-2026-10-09 (commits c9308ae, 3011cb5; local, not for merge)
  - conciso-design-system docs/adr/0001 (Angular wrappers over CSS), 0015 (no Figma gate in the repo)
  - owner decisions, 2026-10-09 (this session)
---

# ADR-0165: The workshop teaches on the Conciso Design System

## Status

Accepted. Recorded at decision time. Migration is planned in `tasks/todo.md` and not yet done.

## Context

Atelier built its own component library (Angular, React, Vue behind `libs/spec`, a Figma file,
three Storybooks with MCP endpoints, and about half of the `check:all` gates to keep it consistent)
because there was no design system to teach on when the project started. The library is used
only by the workshop and its participants.

The Conciso Design System (CDS) now exists: CSS classes on semantic HTML, a thin Angular wrapper
lib, Storybook 10.6 with `addon-vitest`, `addon-a11y` and `addon-mcp`, its own MCP server, a
public npm package and a public Figma library (`BQCBQwIDcconnYNpb2w9fn`). Other trainings already
use it. Work done on it helps its real users and prototypes; work done on Atelier's library helps
only Atelier.

The spike on 2026-10-09 checked whether the workshop's method runs on the CDS. The Figma masters
are readable and almost fully bound to variables. Atelier's portable contract loop ran in the CDS
repo with two path fixes (snapshot plus `check-contracts`, exit 0 on the Snackbar). Parity matched
visually, and the CDS's 233 story tests pass. The spike also found real defects in the CDS masters
that are good teaching material: unbound text properties and axis names that mix German and
English.

## Decision

1. **The workshop's exercise target becomes the CDS.** Atelier keeps the teaching material: docs,
   skills, the workspace scaffold and the method. Atelier's own component library is removed once
   the material runs on the CDS.
2. **The contract layer goes into the CDS repo.** A CDS ADR supersedes CDS-ADR-0015. Its reason
   (only one person has the Figma Desktop Bridge) still holds for the snapshot refresh, so that
   stays a manual step. `check-contracts` runs offline and can be a CI gate there.
3. **Workshop work stays in the workshop.** What participants build lives in their workspace,
   which consumes the CDS as an npm dependency. The CDS does not take contributions from
   workshops. The CDS team adds what is needed itself. The kata's Figma master lives in a copy of
   the CDS file made for the training, not in the CDS library.
4. **The contract tool becomes its own npm package**, `@atelier-ui/contracts`, published from
   Atelier and installed by both the CDS and the workshop workspace. Atelier keeps a release
   pipeline for that package and `create-workspace` only.

   **Revised 2026-10-09** (same day, before any code): the package is named
   `@conciso/design-contracts` and its final home is the CDS repo, next to its only CI consumer
   after Atelier's library is removed (P6), with the CDS's existing release chain. It is first
   built in Atelier to try it out: Atelier's library still exercises all three frameworks, and the
   CDS consumes a packed tarball on a branch. It is not published from Atelier; it moves to the
   CDS once proven and is published from there. The rejected option "put the contract tool in
   the CDS repo" below is thereby reversed for the tool's _location_; its concern, that the tool
   must stay design-system-neutral, is kept as a requirement (tests on a non-CDS fixture,
   prefixes from config).

5. **More frameworks remain likely, later, in the CDS.** The cross-framework gates and the
   per-framework docgen path are not deleted without a trace: they stay recoverable from a tagged
   commit and can move to the CDS when it gets React or Vue wrappers. Until then the workshop is
   Angular only, as it already was in practice.

### Why

- **Leverage.** Every fix found in a workshop or while preparing one improves a design system
  people actually use. Atelier's library had no such users.
- **Realism.** Participants bring their own design system, which was not built for a workshop.
  A real one with real defects is a better exercise object than a library tuned for teaching.
- **The method is portable.** The spike showed the loop runs on the CDS. German Figma names
  against English code names are exactly the deliberate mismatches the contract records.
- **One copy of the tool.** The spike's copy of the scripts drifted at once (`"type": "module"`,
  a missing output directory). A package gives the CDS and the workspace the same version.

### Rejected

- **Keep Atelier's library.** It keeps about half of the gates and three adapters alive for a
  library with no users besides the workshop.
- **Copy the contract scripts into the CDS.** Cheap, but the copy drifts, as the spike showed.
- **Put the contract tool in the CDS repo.** The tool is design-system-neutral and is taught for
  the participants' own systems, so it should not live inside one particular system.
- **Workshop contributions into the CDS.** The owner ruled this out: it would make the CDS team
  review workshop output.

## Consequences

- Planned steps P0–P6 in `tasks/todo.md`: ADRs, tool fixes and the package, contracts for all CDS
  components with a CI gate, `create-workspace` on the CDS, a new kata, docs and skills, then
  removing the library.
- Tool gaps the spike found must be fixed in the package before the CDS adopts it: `--file` with
  several connected Figma files, creating the output directory, `.cjs` for `"type": "module"`
  repos, a configurable token prefix, and parity reading the contract's `axisMap`.
- The hosted Storybook MCP endpoints for Atelier's library go away. Their teaching role passes to
  the CDS's own MCP server.
- Course-gap items built on Atelier components (for example the A4 judge dry run on AtlButton)
  keep their method. Their examples will be redone on CDS components.
- `@atelier-ui/angular`, `/react` and `/vue` are deprecated on npm once nothing in the material
  uses them.
- **Weakest point:** the spike covered one component. The contract work for about 55 components,
  and whether a good kata target exists without adding a component to the CDS, are estimates.
