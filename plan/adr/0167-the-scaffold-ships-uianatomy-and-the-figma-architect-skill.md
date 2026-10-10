---
status: accepted
date: 2026-10-10
sources:
  - tasks/content-review-2026-10-10.md §5.6 (skills delivery), §9 decision 7
  - plan/design-skills-blueprint.md §8 decision 7 (open since 2026-09-07)
  - owner decisions, 2026-10-10 (this session)
  - ADR-0090 (byte-identical preset clones), ADR-0123 (storybookjs/mcp skills via a pinned `skills add`), ADR-0144 (figma / no-figma scaffold variants)
---

# ADR-0167: The scaffold ships `uianatomy-mcp` and the Figma architect skill, not `design-to-code`

## Status

Accepted. Recorded at decision time.

## Context

The course agenda named five skills for Day 2 (`uianatomy-mcp`, `figma-workspace-architect`,
`atelier-design`, `design-to-code`, `artboard-bridge`). The workspace scaffold shipped none of
them: it writes its own `atelier-component` skill and installs the four `storybookjs/mcp` skills
(ADR-0123). A participant working in their generated workspace could not use what the agenda
promised, and no page said how to get it.

The owner first decided that the scaffold ships `uianatomy-mcp`, `figma-workspace-architect` and
`design-to-code`. A read-only check of the three then showed:

- `uianatomy-mcp` is the upstream single-file skill; nothing in it is repo-bound.
- `figma-workspace-architect` is tool-driven and generic, apart from two sections and two
  pointers that describe the Atelier repo. It needs the `figma-console` MCP server, which the
  scaffold wires only with `--figma`.
- `design-to-code` is monorepo-bound: about 60 % of `SKILL.md` and its review checklist name
  `libs/spec`, `parity:record`, the component generator, the review mode's repo gates and the
  Atelier Figma file. It also triggers on the same requests as the scaffold's `atelier-component`
  skill, which already is the design-to-code loop for a generated workspace, with the commands
  that exist there (`check:contracts`, `check:stories`). Both would load and contradict each other.

## Decision

- The scaffold **copies** `uianatomy-mcp` (always) and `figma-workspace-architect` (only with
  `--figma`, as ADR-0144 does for the other Figma parts) into `.claude/skills/`. The payload is
  `SKILL.md`, `references/` and `assets/`, the same set `package-skill.mjs` zips.
- The copies are byte-identical to their sources and gated by `check:preflight-clone-sync`
  (ADR-0090), extended with a directory expansion that also fails on a file in the copy that no
  source produces.
- The architect's Atelier-only sections stay in the one canonical source and are labelled
  "Example from the Atelier repo (does not apply to a generated workspace)". A spec test scans
  the shipped files for repo-only tokens outside those labels.
- **`design-to-code` is not shipped** (owner, 2026-10-10, after the check above).
  `atelier-component` stays the workspace's component skill, and the agenda and generated
  `CLAUDE.md` say so. `design-to-code`, `atelier-design` and `artboard-bridge` stay repo and
  trainer skills.

Rejected:

- **Copying `design-to-code` verbatim**: its commands and paths do not exist in the workspace,
  and it collides with `atelier-component`.
- **A scaffold profile of `design-to-code` replacing `atelier-component`** (blueprint decision
  7, option a): same outcome under a new name, more authoring, its own drift check, and no eval
  coverage yet.
- **A pinned remote install** (as ADR-0123 does for the Storybook skills): the install is
  non-fatal, so a mandated skill could silently go missing offline; and `skills add` against the
  `.well-known` index is unverified.

## Consequences

- Answers blueprint §8 decision 7: generic skills ship, `design-to-code` stays monorepo-only
  (its option b), with `atelier-component` as the workspace's loop.
- A new file in a source skill's `references/` fails the sync gate until
  `node tools/scripts/sync-preflight.mjs` runs.
- The packed-tarball e2e (`libs/create-atelier-ui-workspace/e2e`) asserts the new files but
  needs network; it was not run when this was recorded.
- The labelled-example scan depends on the label wording; a reworded label fails the test loudly.
