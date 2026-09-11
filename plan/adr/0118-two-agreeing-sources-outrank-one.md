---
status: accepted
date: 2026-09-09
sources:
  - docs/src/data/components.ts (the outlier corrected — `Layout` renamed to `Feedback`)
  - tools/figma/snapshot.json (`Feedback/AtlAccordionGroup`, `Feedback/AtlAlert`, `Feedback/AtlAccordionItem`)
  - libs/{angular,react,vue}/.storybook/preview.*'s `storySort.order` and every `accordion`/`alert` story's `title:`
  - tasks/todo.md ("Category name split: `Feedback` vs `Layout`")
  - tasks/schulung-content-review-2026-09-08.md § E2 (the corrected, now-wrong "Layout is the actual name" claim)
  - tools/scripts/check-category-alignment.js (the gate this ADR's tie-break rule and exemption policy govern)
  - tools/scripts/lib/allowlists.js (CATEGORY_ALIGNMENT_EXEMPT)
---

# ADR-0118: Two agreeing sources outrank one

## Status

Accepted. `docs/src/data/components.ts`'s `accordion`/`alert` category is
`Feedback`, matching Figma and Storybook. `check-category-alignment.js` holds
that agreement going forward, with a `gap`-kind exemption recording one further
disagreement it found and deliberately did not resolve.

## Context

`docs/src/data/components.ts` grouped `accordion` and `alert` under `Layout`.
Two independent, machine-readable sources disagreed with it and agreed with
each other: the Figma masters' own slash-named `name` field
(`Feedback/AtlAccordionGroup`, `Feedback/AtlAlert`, `Feedback/AtlAccordionItem`
in `tools/figma/snapshot.json`) and every Storybook story's `title:`
(`Components/Feedback/Atl…`, and `storySort.order` in all three
`.storybook/preview.*`). `docs/src/data/components.ts` was the sole outlier —
and a 2026-09-08 review had briefly asserted the opposite, that `Layout` was
"the actual name" (`tasks/schulung-content-review-2026-09-08.md` § E2),
which is corrected in place there rather than restated here.

Nothing enforced agreement between these three places, which is how a rename
in two of them (or a typo in the third) can drift silently — exactly what
happened here. Building the enforcing gate required a general rule for what
"the category" means when a docs-site label, a Figma Section name, and a
Storybook `title:` prefix can each say something different, not only a fix for
this one component.

While building that gate, a second, unrelated disagreement surfaced: Figma
files `AtlButton` under its own `Action` Section and the other seven Inputs
controls (`AtlInput`, `AtlTextarea`, `AtlCheckbox`, `AtlToggle`,
`AtlRadioGroup`, `AtlSelect`, `AtlCombobox`) under `Form`, while
`docs/src/data/components.ts` and every one of those components' Storybook
titles agree on one flat `Inputs` category. This is the mirror image of the
accordion/alert case — Figma is the outlier, not the agreeing pair — and
reconciling it (split docs.ts's `Inputs` in two, or merge Figma's two
Sections into one) is a real decision nobody has made. It is out of scope for
the task that discovered it, and deciding it by default — silently, inside a
gate's exemption list — would be exactly the kind of undocumented tie-break
this ADR exists to avoid making informally.

## Decision

1. **Tie-break rule**: when a component's category disagrees across
   `docs/src/data/components.ts`, its Figma master's Section, and its
   Storybook story `title:`, and two of the three agree, `components.ts`
   follows the agreeing pair. Figma and Storybook are independently generated
   (a design tool's own grouping; a docs-generation config `storySort.order`
   drives) and a coincidental match between them is far less likely than one
   of them drifting from a hand-maintained docs file. This is the rule
   `check-category-alignment.js` enforces as two separate assertions —
   `components.ts` category == Figma master's Section (`[FIGMA-CATEGORY]`),
   and == every Storybook story title's category segment
   (`[STORY-CATEGORY]`) — rather than one combined comparison, so either side
   can be exempted independently when only one of them is unsettled.

2. **Exemption policy**: `CATEGORY_ALIGNMENT_EXEMPT`
   (`tools/scripts/lib/allowlists.js`) uses the same two-kind idiom as
   `TOKEN_BYPASS_EXEMPT` — `kind: 'design'` for a closed, permanent
   difference (silent), `kind: 'gap'` for a real, unresolved disagreement
   that should keep nagging until someone decides (prints on every run). The
   eight Inputs-vs-Action/Form entries are all `kind: 'gap'`: the split is
   real and undecided, not a design call this ADR is making. The gate does
   not pick a side for them, and neither does this ADR — closing that gap
   means either editing `docs/src/data/components.ts`'s `COMPONENT_CATEGORIES`
   or restructuring two Figma Sections, and both are follow-up work, not a
   silent default.

3. **Scope of this task**: only `accordion`/`alert` were renamed
   (`Layout` → `Feedback`). The Inputs/Action/Form gap is recorded as an open
   `gap` exemption and reported, not fixed — see `tasks/todo.md` for whatever
   follow-up item the owner files against it.

## Consequences

- A future rename of a Figma Section or a Storybook `title:` category that
  `docs/src/data/components.ts` does not follow now fails `check:*` loudly
  (`[FIGMA-CATEGORY]` / `[STORY-CATEGORY]`) instead of drifting silently the
  way `Layout`/`Feedback` did.
- The Inputs/Action/Form three-way split stays open, visibly: every clean run
  of the new gate prints eight `[exempt:figma:gap]` warning lines until it is
  resolved one way or the other. The gate does not block on it, so it does
  not hold `check:all` red for a decision nobody has made.
- The tie-break rule assumes exactly two-of-three agreement is the common
  drift shape. A future three-way split with no majority (all three disagree)
  has no rule here and would need one — `check-category-alignment.js` would
  report it as two independent failures (`[FIGMA-CATEGORY]` and
  `[STORY-CATEGORY]` both firing, with different named categories), which is
  enough signal to notice but not enough to auto-resolve.

**Corrected 2026-09-10 ([ADR-0120](0120-the-cheaper-move-wins.md)).** Two claims above are
now out of date, and the tie-break rule itself is narrowed.

The Consequences say the Inputs/Action/Form split "stays open, visibly" and that every
clean gate run prints eight `[exempt:figma:gap]` lines. It is closed:
`CATEGORY_ALIGNMENT_EXEMPT` is empty and `check:category-alignment` passes with no
exemption in use. The Decision's closing note pointing at `tasks/todo.md` for a follow-up
item is likewise spent.

More importantly, resolving it exposed a limit in this record's own rule. The tie-break
counts record-keepers and is silent on which side is _expensive_ to move; `AGENTS.md`
independently names the Figma Components page the structural source of truth and points
the other way. Both rules applied to the same case for the first time and disagreed. The
resolution, recorded in ADR-0120: **when they disagree, the side carrying no downstream
identity wins the argument and moves.** A Storybook story `title:` is an identity — renaming
it changes story IDs and breaks saved links, `docs-show-story` calls and story
`figmaNode()` references. A Figma Section membership is not; a master's node id survives
renaming and reparenting, which is why Figma moved here even though the vote said
otherwise.

That does not overturn this ADR. Where the cheaper-to-move side and the outlier are the
same — the `Layout`/`Feedback` case this record was written for — the tie-break stands
unchanged and decides on its own. ADR-0120 only supplies the missing answer for the case
where they are not.
