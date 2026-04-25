---
mode: Out-of-scope
references: []
first-tool: (none)
out-of-scope: true
---

# Out-of-scope — Figma → code translation

The user is asking for code generation. SKILL.md explicitly excludes this:

> **Figma → code translation** — generating React/Vue/Swift from a design. That is downstream of this skill.

## Required surface

1. **Bow out cleanly.** State plainly that this skill is architectural — it makes decisions about how a Figma file is structured, but does not generate framework code from a design.
2. **Point at the right next step.** Two options:
   - The repo's existing component-generator workflow (e.g. `nx generate <generator> --name=button`) if the user is in this repo.
   - General Claude code-generation knowledge (read the Variant Properties from the Figma component, write idiomatic React with corresponding props).
3. **Offer the architectural complement** if relevant — e.g., "if you'd like, I can audit your Figma button to confirm the Variant Property surface matches what you'd want as React props before you generate."
4. **Do not load any references/*.md** — none of them apply. Do not invent a new mode to handle this. Do not start writing the React component anyway.

## Regressions to flag

- Agent starts writing React code → **Blocker** — out-of-scope work; defeats the skill's scope discipline.
- Agent loads `component-design.md` and tries to translate → **Critical** — that file is about Figma component architecture, not code translation; loading it here implies the skill covers something it does not.
- Agent quietly bows out without offering the architectural complement (the audit hand-off) → **Suggestion** — useful courtesy but not wrong to omit.
- Agent invents a fifth mode (e.g., "Translate") → **Critical** — adds scope creep to the skill.
