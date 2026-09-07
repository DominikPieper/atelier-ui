---
mode: Out-of-scope
references: []
first-tool: (none)
out-of-scope: true
---

# Out-of-scope — file-level token architecture

Nothing here is one component going to code. This is `figma-workspace-architect`
Audit/Migrate work.

## Required surface

1. Bows out in one or two sentences and names the right skill and mode.
2. Loads none of this skill's references.
3. Offers the complement if relevant: once the collections are fixed, a Review-mode pass
   per component confirms the code still matches.

## Regressions to flag

- Starts inspecting components for code generation → **Critical**.
- Runs `figma_*` write tools → **Blocker**.
- Invents a "Tokens" mode → **Critical** — scope creep.
