# design-to-code

A Claude Code skill for the Atelier Figma → spec → code → verify loop: build one
component in one framework from a written handoff document, or review one existing
component across Figma and code.

Repo-bound: it names `libs/spec` (the framework-agnostic contract), this repo's gates
(`parity:record`, `check:figma`), and the Atelier Figma file (`QMnDD8uZQPldPrlCwZZ58T`).
None of that exists in a scaffolded workspace outside this monorepo, so — unlike
`atelier-design` and `figma-workspace-architect` — this skill is **not** mirrored to the
public discovery endpoint (`docs/public/.well-known/agent-skills/`). It is listed in
`UNDISTRIBUTED_SKILLS` (`tools/scripts/lib/allowlists.js`); a scaffolded-workspace profile
for it is a decision deferred to `plan/design-skills-blueprint.md` § 8 (decision 7).

## Layout

```
SKILL.md                     ← Entry. YAML frontmatter (name + description) tells
                               Claude when to load. Mode routing table + Build/Review
                               checklists.
references/
  handoff-document.md        ← The handoff document format Build mode starts from.
  framework-notes.md         ← Angular/React/Vue specifics for Generate.
  parity-codespec.md         ← The codeSpec shape `figma_check_design_parity` expects.
  review-checklist.md        ← What Review mode checks and how to report it.
evals/                       ← Trigger and scenario evals (dev-only — excluded from
                               the runtime zip).
tests/                       ← Behavior-spec fixtures (dev-only — excluded from the
                               runtime zip). One scenario per directory.
```

## Develop

```bash
npx nx lint design-to-code    # validate SKILL.md frontmatter + path refs
npx nx test design-to-code    # validate tests/ fixture structure
npx nx package design-to-code # → dist/skills/design-to-code.zip
```

`npx nx sync-discovery design-to-code` is a no-op — see the note above.

## In this repo — auto-active

The skill is symlinked at `.claude/skills/design-to-code` → `skills/design-to-code`.
Claude Code picks up project-local skills from `.claude/skills/` automatically when
invoked in this repo. No install step.
