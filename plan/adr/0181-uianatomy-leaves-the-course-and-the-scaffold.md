---
status: accepted
date: 2026-11-18
sources:
  - owner decision, 2026-11-18 (this session): 'take uianatomy out everywhere, its hosting is sometimes overloaded, and a failure in the training would be bad'
  - plan/adr/0136-reproducible-in-the-room-and-the-servers-that-come-with-it.md (this ADR revises its "add `uianatomy` unconditionally")
  - plan/adr/0167-the-scaffold-ships-uianatomy-and-the-figma-architect-skill.md (this ADR revises the `uianatomy-mcp` half of its decision; the architect half stands)
  - plan/adr/0180-the-course-proves-with-standard-tools-and-the-contract-leaves-the-participant-path.md (Day 2 Block 00, the wiring row this demo sits in front of)
  - tasks/schulung-demo-scripts.md (D-7), tasks/schulung-dry-run-kit.md (rehearsal check 9)
  - tasks/schulung-kundenagenda.md (Day 2 Block 00, "Skills für den Agenten einrichten")
---

# ADR-0181: uianatomy leaves the course and the scaffold, and demo D-7 explains a skill on a local file

## Status

Accepted. Recorded at decision time. Nothing here is rehearsed: that the new demo fits its five
minutes and that the answer it asks for names the skills on every seat is rehearsal check 9.

## Context

`uianatomy.dev/mcp` is a hosted server this project does not run. The owner has seen its hosting
overloaded more than once.

The course leaned on it in three places:

- **The scaffold.** Every generated workspace wired the server in `.mcp.json` (ADR-0136) and
  copied the `uianatomy-mcp` skill (ADR-0167). The generated preflight probes every HTTP server
  it finds in `.mcp.json`, so an overloaded host would have shown up as a failed line in Day 1
  Block 01, the block already marked high risk, on every seat at once.
- **A live demo.** D-7 on Day 2 (09:13 to 09:18) called the server for the component the
  participants had just picked. Its fallback was "show the entry in a browser", which fails
  with the same host.
- **A count.** "Five servers" on a slide, in the run of show and in checkpoint D1B04-C2.

Separately, the consistency review of 2026-11-18 had left one finding with the owner: the
customer agenda says "Skills für den Agenten einrichten" for Day 2 Block 00, and no participant
sets up a skill there. The owner's answer, before the uianatomy question came up: do not set
one up, explain what a skill is.

D-7 was the one place the course showed a skill, and it showed it through the server that is
now the risk. Both questions meet in the same five minutes.

## Decision

1. **uianatomy leaves the scaffold.** No `uianatomy` entry in `.mcp.json`, no `uianatomy-mcp`
   skill, no section in the generated rules file. A generated Angular workspace with Figma has
   four MCP servers (`nx-mcp`, `storybook-angular`, `angular-cli`, `figma-console`), and the
   generator writes two skills (`atelier-component`; `figma-workspace-architect` with Figma).
   The preset's spec pins the absence.
2. **uianatomy leaves the course material.** Run of show, trainer notes, demo scripts, dry-run
   kit, deck outline, both decks, and the public pages `/schulung`, `/workshop`, `/mcp`,
   `/agent-skills` and `/build-your-own`.
3. **D-7 becomes "what a skill is, on a local file".** The trainer opens
   `.claude/skills/atelier-component/SKILL.md` in a scaffolded workspace and marks the
   frontmatter: the description decides when the skill loads, the body is the procedure. Then
   every seat asks "Which skills do you have in this workspace, and when would you load each?
   Only list them." Checkpoint D2B00-C2: every answer names `atelier-component`. Fallback:
   `ls .claude/skills/`, the folder is the truth. No network call.
4. **The wiring row names four things, on two files.** Rules file, skill, MCP server, hook; the
   skill file is not opened a second time.
5. **The briefs keep their provenance.** `workshop/briefs/` were transcribed from uianatomy
   records and say so. A brief is a file in the repo and needs no server.
6. **The Atelier repo keeps its own wiring.** The root `.mcp.json`, `AGENTS.md` and
   `.claude/skills/uianatomy-mcp/` are the maintainers' tooling, not course material. An outage
   there costs a maintainer a lookup, not a room its morning.

Rejected:

- **Keep it, with a better fallback.** A screenshot or a saved record covers the demo, not the
  preflight line and not a participant's agent calling a server that hangs.
- **Keep it in the scaffold, take it off the live path.** A wired server that the course never
  mentions is still probed by preflight and still listed by `/mcp`, where every participant is
  asked to name it.
- **Remove it in two steps, course now and scaffold after the cohort.** The cohort is the
  reason; a scaffold that still wires it leaves the preflight risk in the room.
- **Replace the demo with another hosted source of component anatomy.** Same dependency under a
  different name, and the block's subject is skills, not anatomy.
- **Let participants write a skill, to honour "einrichten" literally.** Ten minutes for a first
  skill is not a credible exercise, and Block 05 already lists the skills as something to copy.

## Consequences

- The course statements "four servers" and "two generator skills" are true only for a workspace
  generated from a release that contains this change. The provisioned machines (ADR-0178) need
  that release. A workspace from an older release still lists `uianatomy`; it works when the
  host is up and the trainer logs the seat.
- The trainer's Atelier clone still lists `uianatomy` under `/mcp`. The `/mcp` walk on Day 1
  therefore runs in a scaffolded workspace.
- D-7 puts the description of `atelier-component` on the projector. In a Figma workspace that
  description names the contract loop and `check:contracts`, which ADR-0180 took off the
  participant path. The trainer says one sentence (Atelier's own check, the last and optional
  rung) until the scaffold work of Wave C rewrites the skill.
- The agenda line "Skills für den Agenten einrichten" is met by explaining and inspecting, not
  by installing. The agenda text is unchanged; the trainer notes say what happens.
- A generated workspace no longer has a canonical anatomy source. The component docs from the
  Storybook MCP and the brief cover what the course asks of the agent.
- ADR-0136 and ADR-0167 carry a dated correction pointing here.
