---
status: accepted
date: 2026-11-22
sources:
  - owner, 2026-11-22 ("Können wir auch gleichzeitig die mitgelieferten Kursdateien auch alle auf Deutsch machen, nicht auf Englisch?"; then "Alles Deutsch" for the prompt blocks and "Ja, überall" for the fixed terms; and a check with the German AI-tells skill afterwards)
  - owner, 2026-11-22, the same session: `/clear` after the reset in the Prüfschleife, after a comparison of the decks with Anthropic's current prompting guidance
  - libs/create-workspace/src/generators/preset/files/course/ (all files, `briefs/`, `_fragments/`)
  - libs/create-workspace/src/generators/preset/preset.ts (`COURSE_SCAFFOLD`, `writeCourseFolder`)
---

# The course files are German

## Status

Accepted.

## Context

The course is taught in German, the slides are German in Du-form, and the participants are
German speakers. The files the scaffold ships under `course/` (exercise sheets, the prompts
participants paste, the four component briefs, the handoff example, the rescue sheet and the
fragments substituted into them) were English. So the slides quoted English prompts and terms
("Explicitly out", "What nobody looked at", "not verified") in German sentences, and every
participant read an English sheet beside a German slide.

The repo's own rule is that docs and written content are English. That rule is about the repo
(ADRs, docs site, code comments, skills); the course files are teaching material for one
audience.

## Decision

1. Everything under `course/` is German, the prompt blocks included: participants read what they
   paste, and the agent follows a German prompt as well as an English one.
2. Fixed terms are translated and used the same way in the course files and on the slides:
   „Übergabedokument“, „Im Umfang“, „Bewusst draußen“, „Bewusste Abweichungen“, „Verhalten“,
   „Rot mit Absicht“, „Was niemand angesehen hat“, the list „nicht geprüft“, „Wenn Du
   festhängst“, the parity labels Code / Figma / absichtlich so / Werkzeug-Artefakt. Du-form with
   a capital Du, as on the slides.
3. Not translated: code and shell blocks, commands, paths, `{{…}}` placeholders, tool and
   component names, token names, variant values, ARIA values, Figma layer and variant names,
   commit messages in commands, Claude Code UI strings, and the UI labels the built team
   directory has to show.
4. The text was checked against German AI-writing tells after translation.
5. The skills and the `CLAUDE.md` the scaffold writes stay English; so does the docs site, which
   is a source collection, not course material.
6. The same release adds `/clear` after the reset in Day 2 Block 03, so failed repairs do not
   stay in the agent's context when the first prompt is pasted again.

Rejected: translating only the prose and keeping English prompts (every sheet bilingual, and the
participant pastes text they did not read in their language); keeping the fixed terms English
(they sit in German sentences on every slide that cites them); translating the skills and
`CLAUDE.md` too (they serve every workspace, not one course, and the repo rule holds there).

## Consequences

- `preset.spec.ts` asserts German strings now; a future wording change in a course file has to
  follow there.
- The slides that quoted the English text were changed in the same round (Day 1 version 95,
  Day 2 version 64).
- A seat only gets the German files from the release that carries this change; seats have to
  be provisioned again from it.
- The English workshop material elsewhere in the repo (docs site pages describing the course)
  still uses the English terms; it is a source, not what participants read.
