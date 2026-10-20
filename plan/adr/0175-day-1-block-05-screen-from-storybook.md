---
status: accepted
date: 2026-10-20
sources:
  - docs/src/pages/screen-from-storybook.astro
  - docs/src/pages/schulung.astro
  - docs/src/pages/storybook-readiness.astro
  - tasks/schulung-run-of-show.md
  - tasks/schulung-golden-prompts.md
---

# ADR-0175: Day 1 Block 05 builds a screen from existing components with Storybook as the only source, replacing the kata

## Status

Accepted. Recorded at decision time.

## Context

A focus review on 2026-10-20 looked at the course from the side of the customers it is sold to.
Most of them already have a Figma library, a corporate identity and often a Storybook. Their
worry about AI is not "can an agent build a new component" but "will agent-written application
code use what we already have, or will it sprawl". The curriculum answered the first question
four times on Day 1 and the second one nowhere: Block 02 composes a Settings Card from existing
parts, but through the Figma tutorial and the parity check, and Block 05 ("Kata against the
clock") ran the same Settings Card frame a second time without guidance. That second round
taught the same loop twice and left the consumer case, writing code against an existing library
with Storybook as the reference, untested.

The guardrail demo D-1 and the new `/storybook-readiness` page (same day) already carry the
message that context steers and gates catch. What was missing was a block where participants do
it themselves.

## Decision

Day 1 Block 05 (16:10–17:15, 65 min, unchanged slot) becomes "A screen from Storybook, against
the clock", on the new page `/screen-from-storybook`:

- One brief: a Team directory screen (search `AtlInput`, role `AtlSelect`, `AtlButton`,
  `AtlTable` with an `AtlBadge` status column, `AtlPagination`), all six present in every
  framework's hosted `docs-list` and exported by the library.
- No Figma frame. The only source of information about the components is the Storybook MCP
  (`docs-list`, `docs-show`, `docs-show-story`).
- Four rules: look before you write; every prop has a source in the `docs-show` output; no
  hand-built element where a library component exists; no raw colours, only `--ui-*` tokens in
  a plain `.css` file.
- Gates are the ones a generated workspace really has: `npm run lint`, `npm run check:stylelint`,
  `npm run check:format`, on Angular also `npm run build` (strict templates). A receipts prompt
  makes the agent print the `docs-show` passage behind each prop; participants spot-check three.
- The `/first-component` kata stays as optional homework, and its `#bridge` section stays the
  Block 06 homework for green seats.

Rejected:

- **Reframe Block 02 only** (build the Settings Card via Storybook instead of the tutorial): the
  consumer case would stay a side note inside a block whose job is the first end-to-end success
  along the Figma path.
- **Add the case on Day 2** (use the participant's own new component in a screen): Day 2 has no
  spare time after the R-212 rebalancing (2026-10-14); the transfer block would lose its anatomy or its
  self-check.
- **Keep the kata and add the screen as homework**: the case customers care about most would be
  the only one never done in the room.
- **Wait until after the R-040 dry run**: the dry run should measure the agenda that will be
  taught, not one about to change.

## Consequences

- The consumer case is now practised in the room, and the customer agenda can name it.
- Day 2 Block 04 asks participants to label parity findings (code / Figma / contract); the kata
  was the Day 1 place they first practised that. Block 02 still reads the parity report, and the
  trainer notes now say to teach the labels in Day 2 Block 04. Whether Block 02 should label too
  is an open owner question.
- The gates have blind spots the page states rather than hides: stylelint reads only `.css`
  files, so colours in an Angular `styles` array, a Vue `<style>` block or an inline `style` pass;
  nothing checks the running app for accessibility (a story for the screen plus
  `npm run check:stories` is the stretch task, and the only axe run).
- The brief's size (six components, table sub-parts, filter and pagination logic) is an estimate.
  Nothing is rehearsed; R-040 measures it, and the trainer notes say to cut pagination first.
- Sub-component inputs (`atl-th`, `atl-option`) appear only in code examples, not in the main
  `docs-show` input table. The page flags this as an expected agent slip; it is the same gap
  `/storybook-readiness` teaches customers to check for.
- Weakest point: React and Vue `docs-show` output, and whether their builds reject an unknown
  prop, were not inspected. The block is written for all three, verified for Angular only.

**Update 2026-10-20 (same day).** The open owner question above was decided: Day 1 Block 02 now
labels every parity finding `code` or `Figma`, and Day 2 Block 04 adds `contract` as the third
label (contracts are not taught before Day 2 Block 02). See `/schulung` Day 1 Block 02 and Day 2
Block 04.
