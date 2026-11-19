---
status: accepted
date: 2026-11-19
sources:
  - owner decision, 2026-11-19 (this session): package A of a course review — standing rules out of the generation prompt, rubric reframed, plan mode in Day 2 Block 02, this record; rehearsal (R-040) on Monday 2026-11-23
  - Anthropic, "Prompting best practices" (platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), read 2026-11-19: give the reason behind an instruction; soften aggressive emphasis because current models over-trigger on it
  - Anthropic, "Prompting Claude Sonnet 5" (same docs tree), read 2026-11-19: current models follow instructions literally and do not infer requests that were not made
  - Anthropic, Claude Code "Best practices" and "Memory" (code.claude.com/docs/en/best-practices, /memory), read 2026-11-19: a plain prompt in a fresh session usually does the right thing; CLAUDE.md holds what Claude cannot work out from the code; a line that keeps needing emphasis belongs in a hook; give Claude something that comes back pass or fail
  - Boris Cherny on his own workflow (X thread of about 2026-01-02, read only secondhand via InfoQ 2026-01-10 and paddo.dev): plan mode first, a way for the agent to verify its work, mistakes added to a team CLAUDE.md
  - tasks/schulung-golden-prompts.md §2.1 and docs/src/pages/prompts.astro RUBRIC as they stood on 2026-11-19
---

# ADR-0183: Standing rules live in the skill, and the rubric asks where a fix belongs

## Status

Accepted. Owner go 2026-11-19, before the rehearsal of 2026-11-23. Nothing here is rehearsed; R-040
is the rehearsal.

## Context

The Day 2 generation prompt (golden prompts §2.1) had grown to about 49 lines. Four of its six
"hard requirements" — tokens only, compose by region, every icon-only control named, status
visible without colour — hold for every component, not for this one. Only the token rule was
also in the workspace's `atelier-component` skill; composition and the two accessibility rules
existed nowhere but in a prompt the participant pastes. The same split ran through the six-check
prompt rubric: "Docs first", "Tokens" and "Done stated" restate what the workspace's CLAUDE.md,
skill and `/verify` already say, while only "Source named", "Scope guard" and "One change per
round" are about the task in hand.

That teaches the wrong transferable lesson. A participant's own repository has no golden prompts.
What it can have is a rules file, a skill and a lint rule — and the skill of deciding which of
the three a recurring mistake belongs in. Anthropic's current guidance points the same way: plain
prompts work, emphasis over-triggers, reasons generalise better than rules, a rule that must never
break belongs in a hook, and because current models follow instructions literally, what a prompt
says about scope and the finish line matters more than how it is formatted. The one practice the
course barely touched is plan mode (one mention), which Claude Code's author names first together
with self-verification.

## Decision

1. **Standing rules move into the skill, with their reasons.** `atelier-component/SKILL.md` (and
   its no-Figma variant) gains composition by region, an accessible name on every icon-only
   control, and status visible without colour, each with the reason in one sentence. The story
   step names `tags: ['autodocs']` and why.
2. **§2.1 shrinks to the task.** Source (the handoff document), its deliberate differences as given
   constraints, props one-for-one with the document, ask instead of inventing, and "follow the
   `atelier-component` skill". The three-framework composition paragraph goes, a cohort uses one
   framework.
3. **The rubric keeps six checks and changes three.** Kept: Source named, Scope guard, One change
   per round. "Done stated" narrows to what proves _this_ task done beyond `/verify`. New: Plan
   first, and Fix in the right place — a one-off goes into the next prompt, a mistake that would
   recur goes into CLAUDE.md or the skill with its reason, one that must never happen goes into a
   lint rule or hook. "Docs first" and "Tokens" leave the rubric because the skill and stylelint
   already carry them. The customer agenda's "sechs Prüffragen" stays true.
4. **Day 2 Block 02 starts in plan mode.** About 5 of the 48 generation minutes: the agent's plan
   from the handoff document is read before any code exists, so an invented prop shows up as a
   line of plan rather than a red story.
5. **The golden prompts become the trainer's rescue sheet.** They stay verbatim-pasteable for the
   trainer; participants write their own prompts against the rubric.

## Consequences

- The skill change ships only through a `@atelier-ui/create-workspace` release and reprovisioning,
  which R-252 already requires before cohort 1; this rides on that cycle rather than adding one.
- Day 2 Block 03's "revise the prompt" becomes "revise the prompt or the context". Timings are
  unchanged and unmeasured until the rehearsal.
- A shorter §2.1 rests on the skill being loaded. If a seat's agent does not pick the skill up,
  composition and accessibility drift silently — Day 2 Block 04's axe run catches the
  accessibility half, nothing catches composition. The rehearsal should check that the skill is
  read during generation.
- Rejected: keeping §2.1 and adding a "where does it belong" talk (the prompt would still teach
  the opposite of the talk); dropping the rubric (the customer agenda names it); moving the rules
  into CLAUDE.md instead of the skill (they are procedure for one kind of task, which is what a
  skill loads on demand, and CLAUDE.md is read on every turn); hooks and new lint rules before the
  rehearsal (ADR-0180 rejected the same for the same reason).
