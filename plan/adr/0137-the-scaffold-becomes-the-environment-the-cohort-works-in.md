---
status: accepted
date: 2026-09-13
sources:
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (the split this revises)
  - plan/adr/0090-one-preflight-branched-inside-not-forked-outside.md (the branch that survives it)
  - plan/adr/0014-workshop-single-framework.md (one framework per session, which the clone cannot honour on its own)
  - schulung-2tage-agenda.md (the curriculum, and the three clone-only artefacts it names)
  - libs/create-workspace/src/generators/preset/preset.ts (what the scaffold has become)
---

# ADR-0137: The scaffold becomes the environment the cohort works in

## Status

Accepted 2026-09-13, revising ADR-0084.

## Context

ADR-0084 split the audiences: the **clone** is canonical for the two-day cohort, the
**scaffold** is the self-serve reader's path, and every documentation page branches between
them. The reason was capability. When that decision was made the scaffold was an app, a
token stylesheet and an `.mcp.json`; the curriculum's Day 2 needs `plan/big-picture.md`,
`libs/spec/src/index.ts` and a running Storybook, and only the clone had them.

Two of those three are no longer true. A generated workspace now ships a Storybook per app
with `addon-mcp`, `addon-a11y` and `addon-vitest`; the contract loop, with `check:contracts`
and a projected Figma snapshot; the CSS-discipline rules; Prettier; a jsdom unit runner; and
a full `.claude/` setup — permissions, a formatting hook, `/verify`, a read-only review
subagent and its own component skill. What the clone still has that the scaffold does not is
the three-framework rig, `plan/big-picture.md`'s API rules, and `libs/spec` as a worked
example of an API written for a model to read.

The rig is not an advantage for the cohort. ADR-0014 fixes one framework per session, so two
thirds of the clone is drift-gated infrastructure an attendee is told not to touch — while
`check:all`'s gate chain polices invariants that belong to _this_ library, including 37
parity DRIFT blockers that are our debt and not theirs. The clone also puts them inside a
component library they are not writing, against a Figma file they must not mutate.

The scaffold is the shape of the thing they will do on Monday: their own workspace, their
own components, their own Figma duplicate, gates that are about their work.

## Decision

The generated workspace is the canonical environment for the two-day cohort as well as for
the self-serve reader. The clone stays canonical for work **on Atelier itself** — the rig,
the adapters, the ADRs, the gates — which is what it is actually for.

Three gaps close with it:

1. **The API rules reach the scaffold.** `plan/big-picture.md`'s rules for an API a model can
   read — predictable naming, literal unions, composition over configuration, no hidden
   defaults — become a hosted page the generated `CLAUDE.md` links, rather than a file that
   exists in one of the two environments. One source, both audiences.
2. **The "spec" step becomes the contract and the component's own types.** The curriculum
   said "a spec in the style of `libs/spec/src/index.ts`". ADR-0121 already moved this
   library's own answer: the contract carries the deliberate Figma ↔ code mismatches, the
   component's types and JSDoc carry the API, the stories carry the claims. Teaching the
   current doctrine is not a workaround for the scaffold's shape; it is a correction that was
   owed anyway.
3. **The documented paths and ports become the scaffold's.** `workshop-<fw>` and 6006, not
   `libs/<fw>` and 4400-4402.

**Rejected: keep both, and let the cohort clone.** The capability argument that justified the
split is gone, and the split has a standing cost ADR-0084 accepted explicitly — every page
documents two environments, and each new scaffold feature has to be written twice or
deliberately left out of one half. Two of this session's own findings were stale branch
text: `tutorial.astro` still says the scaffold has no Storybook of its own.

**Rejected: vendor `plan/big-picture.md` and a copy of `libs/spec` into every workspace.** It
would close the gap by duplicating prose into a place no gate can keep current — the failure
mode `docs/src/pages/claude-md.astro` and `preset.ts` already demonstrate between them. Those
two hand-maintain parallel copies of the same `CLAUDE.md`, and their `--ui-radius-*` values
disagree. Worth being precise about which one is wrong, because the obvious guess is the wrong
one: the docs page matches the shipped `tokens.css` (0.5 / 0.625 / 0.875rem, whose own comments
still read `/* was 0.375rem */` from the bump) and it is the **generator** that still documents
the pre-bump numbers — while vendoring the post-bump `tokens.css` right beside them. The copy
that drifts is not reliably the one further from the source; it is whichever one nothing
checks.

## Consequences

`preflight.mjs` keeps its clone-vs-scaffold branch (ADR-0090): both environments still exist,
and it still has to check the right ports for whichever it is in. What changes is which one
the curriculum sends people to.

Documentation pages that branch per environment collapse toward the scaffold: the pre-workshop
mail asks for `npx create-atelier-ui-workspace` instead of a clone, the `/first-component`
kata mounts under `workshop-<fw>/src`, and every new line citing 6006 needs its own
content-keyed `SCAFFOLD_PORT_EXEMPT` entry, because `check:docs` treats an unexempted 6006 as
drift by default.

Setup risk drops in the place it was highest. ADR-0084's own reason for preferring the clone
was that it was the environment we could guarantee; but a clone's `npm install` pulls the
whole rig — three frameworks, Playwright, the docs app — and the agenda already marks the
setup block as high-risk with a mandatory pre-workshop homework mail. A generated workspace
installs one framework's dependencies.

The switch also **deletes** curriculum rather than only moving it. `schulung-2tage-agenda.md`
carries a whole passage explaining which of this repo's gates go red **by design** when an
attendee adds a component of their own — `check:design-status` rewriting `plan/design-status.md`
from every component directory it finds, `check:spec` demanding the spec be mirrored into three
adapter copies, `check:all` being one long chain that a single-framework component cannot
satisfy — plus the skill behaviour added so a participant's own contract does not land in the
shared master. None of that exists in a generated workspace: the gates there are about the
attendee's own work, and a red one means something of theirs is wrong. A block that taught
people to ignore red output goes away, which is worth more than the time it frees.

The cost lands on the trainer, not the attendee: Day 2's blocks that read `libs/spec` and
`plan/big-picture.md` in the room need rewriting against the hosted page and the contract, and
that rewrite is curriculum work, not a docs sweep.
