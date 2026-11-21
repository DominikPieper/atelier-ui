---
status: accepted
date: 2026-11-21
sources:
  - owner, 2026-11-21 ("Doch ich würde dann den connector vielleicht am platz auch einrichten dann haben sie beide möglichkeiten"; the training machines are the owner's own, each with its own Figma account on a Full seat; of the routes offered, "5" = Block 05)
  - measurement, 2026-11-21, `get_design_context` on the AtlButton master (node `129:20`, file `QMnDD8uZQPldPrlCwZZ58T`) through Figma's own MCP server with the client framework given as Angular
  - developers.figma.com/docs/figma-mcp-server/rate-limits-access/ (read 2026-11-21)
  - tasks/todo.md, "Follow-up package I"
  - plan/adr/0182-the-seat-does-not-depend-on-the-hosted-storybook.md (the seat's fixed server set)
  - plan/adr/0189-participants-never-edit-figma-by-hand.md (every Figma write goes through the agent)
  - plan/adr/0111-the-contract-is-the-name-not-code-connect.md (where the skill's earlier advice against Figma's own server came from)
---

# Figma's own MCP server joins the seat in the last block, by one command

## Status

Accepted. The two slides that carry it are drafts in the Day 2 deck and have not been
rehearsed. Measured: what `get_design_context` returns for one master of the Atelier file.
Not measured: the login on a real seat, the agent's choice of server when both Figma servers
are connected, and the output for a participant's own component. The minutes the exercise
needs are not yet taken from anywhere; that is an open owner decision recorded in
`tasks/todo.md` (package I, item I6).

**Corrected 2026-11-21** (later the same day): the owner decided it. The ten minutes come
from the transfer exercise, 25 → 15 minutes; the block is now 5 rules, 25 show & tell,
5 synthesis, 10 anatomy, 5 talk, 10 this exercise, 15 transfer, 5 exit round. The transfer
loses the neighbour reading; the exit round reads the step out. The seat rehearsal runs with
R-040 (`tasks/reviews.md`).

## Context

The course reaches Figma through one server, figma-console-mcp: a third-party server that
runs locally and talks to Figma Desktop through its bridge plugin. Every Figma-side check of
the course stands on it (the Figma linter, the accessibility audit, parity), and Day 2 says so
on its own slide: a dependency chosen deliberately.

Figma ships its own MCP server: remote, behind a browser login, no bridge. It was connected
in the owner's environment on 2026-11-21 and compared tool by tool. The two overlap where
both read a design and both write through a script; they differ in what else they carry.
Figma's server returns a design context with a code template and holds Code Connect, the
mapping from a Figma component to the component in code. figma-console-mcp holds the checks,
typed writes to variables and properties, and version comparison.

One call was measured rather than read off a tool list. Asked for the AtlButton master with
the client framework given as Angular, Figma's server returned one React function component
with Tailwind classes; the framework hint is used for logging only, and the response itself
says the code must be converted to the target stack. The root is a `div`, not a `button`;
hover, focus and active arrive as a `state` prop instead of pseudo-classes; there is one
branch per variant combination. What arrives intact: the tokens by name (as `var(--ui-…)`
with a fallback value) and the master's description, verbatim. That is a teaching point of
its own: the template is a reference to translate, not code to check in.

Read calls on Figma's server are limited by plan and seat; a View seat gets about twenty a
month. That would have ruled the server out for a room. The owner's training machines each
have their own Figma account on a Full seat, which lifts the limit to hundreds a day.

## Decision

Figma's own MCP server joins the seat in Day 2 Block 05, added by the participant with one
command, after the slide that names figma-console-mcp as a chosen third-party dependency.
Two slides carry it: a comparison of the two routes, and a ten-minute exercise (add the
server, log in, ask for the design context of the own component, compare the answer with the
own code). The instructions are on the slide. The rescue for a hanging login is a line on the
same slide.

The scaffold does not change: no sixth server in `.mcp.json`, no new skill, no preflight
check, no release, no reprovisioning. figma-console-mcp stays the route for everything the
course checks.

**Corrected 2026-11-21** (later the same day): "no release, no reprovisioning" no longer
holds. The owner asked for the `figma-workspace-architect` skill to be brought into line (see
the last consequence below), and that skill is scaffold content: the change reaches a seat
only through a release and reprovisioning. The rest of the paragraph stands. The server is
not in the scaffold's `.mcp.json`, there is no new skill and no preflight check; the
participant still adds the server by typing one command.

Rejected:

- **Fixed in the scaffold.** A sixth server on every seat and in every workspace a
  participant scaffolds later, with a login the scaffold cannot perform, and a release plus
  reprovisioning two days before the course. It would also put two Figma servers in front of
  the agent from the first prompt of Day 1, before anyone has a reason to tell them apart.
- **Active from Day 1, added at provisioning.** Same ambiguity for two days, and every
  exercise prompt that says "in Figma" would need to name its server. The exercises were run
  headless with one Figma server; that evidence would no longer describe the seat.
- **Trainer demo only.** Cheapest, but the participants use other agents at work, and Figma's
  server is the one their own tools are most likely to offer first. Seeing the React template
  arrive in their own Angular workspace is the lesson; watching it on a projector is not.

## Consequences

- The two Figma servers are connected together only for the last block, after the
  comparison slide has said which is for what. A prompt in that block names the server it
  means.
- The exercise depends on things the seat does not check: network access to Figma's server, a
  browser logged in to the seat's Figma account, and the plan's call limit. A participant
  whose login hangs watches a neighbour; the block's outcome does not depend on the exercise.
- Block 05 was fully allocated before this. The exercise's ten minutes have to come from
  another item in the block, and the times the customer received are a commitment. Until the
  owner decides, only the new exercise slide carries a timebox.
- The claim that the workspace has five servers stays true on the slides that make it; the
  sixth exists on a seat only from this exercise on.
- The comparison on the slide rests on the two servers' tool lists, with one call measured.
  Code Connect in particular is named as a capability and was not set up or tried.
- The bundled `figma-workspace-architect` skill still tells the agent not to recommend
  Figma's own server or Code Connect. That text is scaffold content and is untouched; if the
  exercise stays in the course, the skill and this record have to be brought into line in a
  release of their own.

**Corrected 2026-11-21** (later the same day), on the last two points that were open above:

- The minutes are decided (see Status). Besides the two slides, the opening note of the
  block, the transfer slide and its note, `/schulung`, the run-of-show, the trainer notes and
  the dry-run kit carry the new times. The customer agenda states Block 05 without sub-times
  and is unchanged.
- The skill is in line. It still does all of its own work through figma-console-mcp and still
  builds naming alignment as its bridge to code (ADR-0111 stands on that). It no longer
  advises against Figma's own server: it names it as a complementary second route that it
  neither sets up nor drives, says what each route is for, and says that the code reference is
  a template to translate. A seat provisioned before the release that carries this text still
  has the old wording.
