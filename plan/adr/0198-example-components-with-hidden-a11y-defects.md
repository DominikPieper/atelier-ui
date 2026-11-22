---
status: accepted
date: 2026-11-22
sources:
  - owner, 2026-11-22 ("was machen wir, wenn es keine Barrierefreiheit Probleme gibt?"; "3-4 Zusatzkomponenten … nicht komplett barrierefrei … mit Absicht, so dass der Agent sie am Ende findet"; "von den CLI-Tests … abkoppeln"; "Die Bibliotheksfehler lassen wir jetzt erstmal")
  - read-only audit of libs/angular, 2026-11-22 (real library findings, kept for the course)
  - seat runs 2026-11-22 (axe absent from the Angular seat's check:stories; fixed)
---

# ADR-0198: Example components with hidden accessibility defects

## Status

Accepted.

## Context

Day 2's accessibility exercise runs on the participant's own component. A small component often
has nothing to fix, and thirty minutes of checking with no finding teaches little. Building it
we found that the Angular seat's `check:stories` never ran axe: its Vitest setup did not load
the a11y addon's annotations, unlike the React and Vue seats, while slides, cards and
`CLAUDE.md` promise "axe-checked".

## Decision

1. The Angular seat's Vitest setup loads `@storybook/addon-a11y/preview`, like the other two
   frameworks; a spec test pins it for all three.
2. Angular seats ship four everyday example components (Disclosure, Notice, Switcher, InfoCard)
   in `src/app/components/`, stories under `Examples/`. Together they carry seven deliberate
   accessibility defects: three axe can see, three only a keyboard pass finds, one only reading
   the markup finds. Nothing in code, names or stories hints at them; the list lives only in
   the trainer file.
3. Their story metas set `parameters.a11y.test: 'todo'`, Storybook's own setting: the a11y panel
   shows the violations, the test run does not fail. `/verify` stays green; lint-detectable
   defects are excluded, because silencing them would need a disable comment, which another
   exercise teaches participants to distrust.
4. The real findings in the library (toast timer, focus ring under forced colours, tooltip,
   avatar status, stepper, select, combobox, table checkbox) stay as they are until after the
   course; participants who meet one report it upstream instead of patching it in their app.

Rejected: planting defects in the published library (reaches every user of the package, and
"fix it from outside" teaches papering over upstream bugs); a separate fixture folder copied in
on demand (the owner wanted them present by default, for the agent to find); excluding the
example stories from the test run with `!test` (hides them from `test-run` too).

## Consequences

- The seat's `check:stories` now runs axe on every story; a participant component with an axe
  violation turns `/verify` red, as the course always claimed.
- `a11y.test: 'todo'` is visible to a careful reader of the story file.
- The examples appear in `storybook-local`'s `docs-list`; the `Examples/` group and the skill's
  rule that local ids are not library ids keep them out of Day 1 screens, unverified in a run.
- Unmeasured: whether participants find the keyboard-only defects within the slot.
