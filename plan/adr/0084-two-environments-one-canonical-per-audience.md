---
status: accepted
date: 2026-08-29
sources:
  - tasks/schulung-review-2026-08-28.md (M2, M4, M5, M9, M10, flow 6 — the decision they all hang off)
  - libs/create-workspace/src/generators/preset/preset.ts (what the scaffold actually contains)
  - docs/src/pages/schulung.astro, schulung-2tage-agenda.md (the cohort's declared environment)
  - docs/src/pages/workshop.astro (the self-serve reader's declared environment)
---

# ADR-0084: Two environments, one canonical per audience

## Status

Accepted. The **cloned atelier monorepo** is canonical for the two-day cohort;
the **`create-atelier-ui-workspace` scaffold** is canonical for the self-serve
reader. Both are documented, each page states which one it is describing, and
the pages that serve both audiences carry an explicit branch. Recorded at
decision time.

## Context

Atelier's participant material was written against two different workspaces and
never said which one it meant.

`/workshop` teaches `npx create-atelier-ui-workspace`. What the preset writes is
narrow and now well measured: one app per selected framework (`workshop-<fw>`),
one Atelier UI package, a `.mcp.json` with exactly one `storybook-*` entry, a
`tokens.css`, and `tools/scripts/preflight.mjs`. That is the whole list. There is
no `libs/spec`, no `plan/`, no Storybook project, and no parity tooling.

The two-day agenda (`schulung.astro`, `schulung-2tage-agenda.md`) was written
against a clone. Day 2 reads `plan/big-picture.md` and `plan/design-principles.md`
into the prompt context, describes a spec "im Stil von `libs/spec/src/index.ts`",
and verifies the participant's component through `nx storybook <fw>`. None of
those exist in a scaffolded workspace.

The seam was not theoretical. `/schulung` sent participants to `/workshop` for
the mandatory pre-work; `/workshop`'s first instruction was the generator, i.e.
the environment the agenda's own Day 2 rules out. `/tutorial` and
`/first-component` hardcoded `workshop-<fw>` paths and `npx nx serve
workshop-<fw>`, which in a clone fails with `Cannot find project` — a failure
with no troubleshooting entry, sitting inside the 65-minute block the whole room
runs synchronously. And a repair attempt in the other direction had already
shipped a false claim, telling cloners the clone has no `preflight` script when
`package.json` declares one that is byte-identical to the preset's copy.

So the question was not "which environment is better" but "which one does each
audience get told to use, in a way the other pages do not contradict".

## Decision

**The cohort clones the repo. The self-serve reader scaffolds.** Neither path is
deprecated; the ambiguity is what is removed.

1. `/schulung` and the agenda declare the clone canonical for the cohort, and say
   why in one sentence: Day 2 works directly with `plan/`, `libs/spec` and
   `nx storybook <fw>`, which only the clone has.
2. `/workshop` keeps the scaffold as its documented default — it is the
   self-serve entry point and the generator is a real product surface — but its
   clone callout now opens by naming the cohort's route and linking `/schulung`,
   so a participant arriving from the agenda is not walked into
   `create-atelier-ui-workspace`.
3. The pages that serve both audiences carry an explicit branch rather than an
   average: `/tutorial`'s "Run it" and the kata's Step 4 state the scaffold paths
   and then, in one sentence, the monorepo equivalent (`libs/<fw>/src/lib/…`,
   `npx nx storybook <fw>`, port 6006).
4. `Cannot find project 'workshop-angular'` gets a troubleshooting entry that
   names the environment mismatch as the cause and gives both sets of commands —
   the failure is now diagnosable in the place a participant looks.

**Why not declare one environment and delete the other.** Scaffold-only would
cost Day 2 the file-level reading three of its blocks are built around
(`plan/big-picture.md` as the source of the LLM API rules is not replaceable by a
docs page without changing what the block teaches). Clone-only would mean
`/workshop` — the site's most-visited setup page and the generator's only
documentation — stops describing the generator, and the self-serve reader is left
cloning a monorepo to build one component. Both audiences are real, the two
environments genuinely differ, and the honest structure is to say so per page.

**Why not leave it implicit and let each page be locally correct.** That is what
produced the defect. Every page was locally defensible; the contradiction only
appeared when a reader walked the path the agenda prescribes. A rule that only
holds when nobody follows the links is not a rule.

## Consequences

- The clone-vs-scaffold question stops moving between builders. M2, M4, M5 and
  half of M9 were all blocked on it and can now be closed against a stated
  premise instead of an assumption.
- Every page that names a path or a serve command owes a statement of which
  environment it means. That is a standing cost on new participant-facing prose,
  and it is the cost that buys the contradiction staying closed.
- Two branches means two things to keep true. The monorepo branch is currently
  one sentence per page rather than a parallel walkthrough — deliberately, so it
  is cheap to keep correct. If it grows into a second full path, it wants its own
  page rather than more branches inside the existing ones.
- Nothing in the tooling enforces this. A future page can hardcode
  `workshop-angular` again with no gate complaining. The check that would close
  it — assert every `nx serve workshop-*` in docs sits next to a monorepo
  branch — is not worth its false-positive rate today, and is recorded here as
  the option rather than built.
- The Figma prerequisite moves with this decision but is not decided by it: the
  cohort needs an account with draft rights **and** the figma-console Desktop
  Bridge plugin, while the self-serve reader needs neither. Both pages now say
  which reader they are addressing.
