---
status: accepted
date: 2026-11-21
sources:
  - owner, 2026-11-21 ("noch zwei weitere skills defaultmäßig hinzufügen. Das eine ist der offizielle Angular Skill und das andere der Angular Testing Skill von [Marmicode]. npx skills add marmicode/skills --skill angular-testing")
  - spike, 2026-11-21, `npx -y skills@1.5.25 add <source> --skill <name> --agent claude-code --yes --copy` in an empty git directory: `angular/angular` / `angular-developer` exit 0 in 8 s, `marmicode/skills` / `angular-testing` exit 0 in 3 s; both land under `.claude/skills/<name>/` and in `skills-lock.json`
  - ~/.agents/.skill-lock.json (the owner's global install of `angular-developer`: source `angular/angular`, `skills/dev-skills/angular-developer/SKILL.md`)
  - plan/adr/0123-the-prerequisite-ships-with-the-skill.md (the post-scaffold `skills add` this record extends)
  - libs/create-workspace/src/generators/preset/preset.ts (`installSkills`)
---

# Angular workspaces get the Angular and the Angular testing skill at scaffold time

## Status

Accepted. Measured: both installs succeed with the pinned `skills@1.5.25` CLI from a fast
network, well inside the 60 s clone bound. Not measured: the clone of `angular/angular` on a
conference network, and how the two skills behave next to the scaffold's own
`atelier-component` skill in a real participant session.

## Context

ADR-0123 made the scaffold install the four `storybookjs/mcp` skills after generation, as one
non-fatal `npx skills add` call. The owner wants two more skills in every new workspace: the
official Angular skill (`angular-developer`, published by the Angular team inside the
`angular/angular` repository) and Marmicode's `angular-testing` skill, which this repo itself
installed the same day. The workshop's default and first framework is Angular; React and Vue
stay viable as scaffold targets.

## Decision

1. For `--framework=angular` the scaffold runs two further installs after the
   `storybookjs/mcp` one: `angular/angular --skill angular-developer` and
   `marmicode/skills --skill angular-testing`, with the same pinned CLI and flags
   (`--agent claude-code --yes --copy`).
2. React and Vue workspaces do not get them. Both skills are Angular-only; in a React or Vue
   workspace they would only trigger on wrong cues.
3. Each install is its own non-fatal step with its own hand-run command in the warning. One
   unreachable source does not cost the others.
4. `--no-skills` still turns off every install.
5. The install list is one data structure; the human-readable command is derived from it,
   not kept in sync by hand.

Rejected: installing them for every framework (wrong cues outside Angular); vendoring the
skill text into the preset like `atelier-component` (we would own and re-sync text we did
not write; the lock file already records the hash); pinning the sources to a commit (ADR-0123
pins the CLI, not the skill sources, and this record keeps that line); one combined `skills
add` call (the CLI takes one source per call).

## Consequences

- An Angular scaffold now makes three GitHub clones instead of one. `angular/angular` is a
  large repository; the spike took 8 s, a slow network will take longer and may hit the 60 s
  clone bound. That fails into the existing warning path, not into a broken workspace.
- The testing skill prefers Vitest Browser Mode and fakes over mocks, while the scaffold's
  own example spec uses Angular Testing Library under jsdom. The skill states it applies to
  Testing Library projects as well; whether an agent then rewrites the example's style
  unasked is unobserved.
- The skill set a participant has moves with the upstream repositories between workshops,
  as it already did for `storybookjs/mcp`. Reprovisioning a seat can bring different skill
  text; `skills-lock.json` in the workspace shows which.
- Needs a release of `@atelier-ui/create-workspace` and `create-atelier-ui-workspace`, and
  the seats need reprovisioning from it.
