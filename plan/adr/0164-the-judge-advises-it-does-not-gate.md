---
status: accepted
date: 2026-10-09
sources:
  - "AI & Design Systems" course, transcripts 219 (deterministic testing vs. language model as a judge, FigmaLint), 223 (a component-eval skill: deterministic scripts plus an LLM judge, graded 0–100, "81.4") and 228 ("The Steel Curtain": gates plus evals and agent reviews that ask whether the code solves the ticket)
  - plan/research/ai-ds-course-gap-2026-10-08/triage.md (item A4) and ch3-ds-inspection.md, ch4-7-product-org.md (the gap rows)
  - docs/src/pages/design-to-code.astro (step 4, "Evals: where the judge comes in")
  - AGENTS.md, "Verifying that something works" ("A gate's result is its exit code")
  - CLAUDE.md §3 (the Codex cross-check: hand it the artefact and the question, never your reasoning)
---

# ADR-0164: The judge advises, it does not gate

## Status

Accepted. Recorded at decision time. This decides what Atelier _teaches_ about component evals;
it adds no gate, skill or script.

## Context

The course splits testing into two halves. Deterministic checks compare values and give the same
answer every time (FigmaLint, `figma_scan_code_accessibility`). A language model as a judge
answers what a script cannot, such as "this alert has no focus state". Transcript 223 bundles
both into one eval skill that ends in a single grade from 0 to 100 (81.4 in the demo). Transcript
228 adds the agent review: a model reads the ticket and the diff and says whether the diff solves
the ticket.

Atelier already teaches the deterministic half in depth: `check:contracts`, `storybook-test` with
axe, `figma_check_design_parity`, the fixed check order and the self-healing loop (step 4 of
`design-to-code`). The judge half was missing from every teaching page. The only evals in the
repo, `skills/*/evals`, test whether an agent follows a skill. They do not grade a component.

Three questions had to be settled before writing it up:

1. Build a component-eval skill like the course's, or teach the technique with a prompt?
2. Adopt the 0–100 score?
3. Include the ticket review, or keep it for later?

## Decision

1. **Teach, with a copyable rubric prompt; build nothing.** Step 4 of `design-to-code` gains a
   section "Evals: where the judge comes in": the two kinds of eval, the rule "if it can be
   scripted, script it", three rules for the judge, a judge prompt with a six-line rubric that
   covers only what Atelier's gates do not check, and the ticket review as a second prompt. The
   check order gains a fifth, optional step: the judge runs after parity.
2. **No score. The judge reports findings, each with evidence, and never blocks.** Each finding
   names the rubric line, the file and line or Figma node, the change it suggests and how sure the
   judge is. A human reads the findings and decides.
3. **The ticket review goes in, as a variant of the same judge.** Its input is the handoff
   document plus the diff. It asks what the diff misses, what it adds that the handoff did not
   ask for, and what cannot be judged from the diff.

### Why

- **A gate's result is its exit code** (`AGENTS.md`). A judge's answer is not reproducible: the
  same model on the same input can give a different answer. A check that can fail the build on
  the second run of an unchanged commit is not a gate. So the judge stays advisory, and what it
  finds repeatedly becomes a candidate for a real, scripted gate.
- **A single score hides which check failed.** 81.4 does not say "focus state missing". It also
  gives the agent a number to raise, which is the same goalpost shifting the self-healing loop
  already warns about. Findings with evidence can be checked, and a wrong finding can be dismissed
  without arguing about weights.
- **The judge only gets lines a script cannot check.** If the rubric repeated what `storybook-test`
  or `check:stylelint` already prove, it would be a slower, non-deterministic copy of a gate. The
  six lines are judgement calls: state coverage, naming consistency, whether the contract's
  reasons still hold, behaviour vs. structure in `play` functions, token _choice_ (lint only
  catches literals), and a11y decisions axe cannot make.
- **Give the judge sources, not a conclusion.** This is the rule Atelier already follows for its
  Codex cross-check (`CLAUDE.md` §3). A judge that is told "I think this is done" agrees. The
  prompt hands it the master, contract, source and stories, and a second model is better still
  because its blind spots differ.
- **Teaching before building.** The course's skill is one team's tool. A participant who brings
  their own design system needs the technique and a rubric to adapt, not Atelier's skill. A skill
  can still follow if the prompt proves itself in workshops.

### Rejected

- **A `component-eval` skill** bundling gates, parity, scan and a judge (effort L). It would wrap
  checks that already have their own entry points, and its judge would need its own skill evals
  before anyone could trust it.
- **Adopting the 0–100 score with a threshold such as 90.** Clear to show in a demo, but it turns
  a non-deterministic answer into something that looks like a gate.
- **Leaving the ticket review for later.** It reuses the handoff document (ADR-0096) as its input,
  catches invented variants the prompt guard (course gap A6) tries to prevent, and costs one more
  prompt.

## Consequences

- `design-to-code` step 4 teaches both halves; the check order now has five steps, the fifth
  optional. The glossary gains `eval`.
- No gate, script or CI job changes. `check:all` is unaffected.
- Participants get a rubric to rewrite for their own system; the page says so.
- **Weakest point:** the rubric itself is untested. Nobody has measured how often its findings
  are real (precision) or what it misses (recall), which the course's pilot advice (ch4-7) asks
  for. Until a workshop run records that, the six lines are an informed guess, and the page tells
  readers to keep a tally of which findings held.
