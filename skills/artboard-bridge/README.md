# artboard-bridge

A Claude Code skill bridging Claude Design artboards and the Atelier repo, in both
directions: Intake reads a `.dc.html` sheet — its findings and comments — out of a
claude.ai/design project and writes the ADR-0096 handoff document from it; Publish turns
a gate-verified component into a `.dc.html` sheet in the Atelier Claude Design project.

Repo-bound: it names the two Atelier Claude Design project ids, this repo's artboard
registry (`tools/design/artboards.json`), the palette generator
(`tools/scripts/gen-artboard-palette.mjs`), and the `design-status` gate
(`check:design-status`). None of that exists in a scaffolded workspace outside this
monorepo, so — like `design-to-code` — this skill is **not** mirrored to the public
discovery endpoint (`docs/public/.well-known/agent-skills/`). It is listed in
`UNDISTRIBUTED_SKILLS` (`tools/scripts/lib/allowlists.js`).

Publish is a **trainer-machine capability**: per ADR-0032, only the Claude Design
project's owner seat is proven to write; per-seat access for a workshop room is an open
item the ADR keeps blocked.

## Layout

```
SKILL.md                     ← Entry. YAML frontmatter (name + description) tells
                               Claude when to load. Mode routing table + Intake/Publish
                               checklists.
references/
  dc-html-shape.md            ← The .dc.html sheet format Intake reads and Publish writes.
  governance.md                ← Client/employer design-system stop rule (DSB/ISB handoff).
  palette-mapping.md           ← Atelier token → artboard palette mapping.
evals/                        ← Trigger and scenario evals (dev-only — excluded from the
                               runtime zip).
tests/                        ← Behavior-spec fixtures (dev-only — excluded from the
                               runtime zip). One scenario per directory.
```

## Develop

```bash
npx nx lint artboard-bridge    # validate SKILL.md frontmatter + path refs
npx nx test artboard-bridge    # validate tests/ fixture structure
npx nx package artboard-bridge # → dist/skills/artboard-bridge.zip
```

`npx nx sync-discovery artboard-bridge` is a no-op — see the note above.

## In this repo — auto-active

The skill is symlinked at `.claude/skills/artboard-bridge` → `skills/artboard-bridge`.
Claude Code picks up project-local skills from `.claude/skills/` automatically when
invoked in this repo. No install step.
