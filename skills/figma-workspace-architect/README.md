# figma-workspace-architect

A Claude Code skill for designing, building, auditing, and improving Figma workspaces via the `figma-console-mcp` server. Sets the bar at "a workspace where a designer can find what they need without asking" — correct Variable scopes, Variants matching the engineering prop API, Modes carrying theming instead of duplicate components, predictable naming.

## Layout

```
SKILL.md                            ← Main entry. YAML frontmatter (name + description)
                                      tells Claude when to load it. Detailed playbook
                                      lives at the bottom.
references/
  decision-heuristics.md            ← Variant vs Property, Token tier, Mode vs Collection.
                                      Look here when a structural decision needs to be made.
  build-workflow.md                 ← Discover → Decide → Map tools → Execute → Validate → Document.
  audit-checklist.md                ← What "well-architected" looks like; what to flag and how.
  tool-map.md                       ← Which figma-console-mcp tool for which intent.
  token-architecture.md             ← Primitive / Semantic / Component tier model + Modes.
  naming-and-file-structure.md      ← Slash naming, page-level taxonomy, library boundaries.
  component-design.md               ← Variants, Component Properties, slot patterns.
assets/
  audit-report-template.md          ← Output template for Audit mode.
```

## Develop

Edit the markdown directly. Targets via Nx:

```bash
# Lint structure (frontmatter, required references, dead links)
npx nx lint figma-workspace-architect

# Bundle into dist/skills/figma-workspace-architect.zip for distribution
npx nx package figma-workspace-architect
```

The packaged zip preserves the canonical layout (`figma-workspace-architect/SKILL.md`, `figma-workspace-architect/references/*`, `figma-workspace-architect/assets/*`) that Claude Code expects.

## Install (local Claude Code)

After building:

```bash
unzip -o dist/skills/figma-workspace-architect.zip -d ~/.claude/skills/
```

Then re-launch Claude Code; the skill auto-discovers via the `name` in `SKILL.md`.

## Scope reminder

This skill is **architectural** — it makes decisions about how a Figma file is built. It does **not** cover:
- Plugin API mechanics for `figma_execute` payloads
- Figma → code translation (that is downstream code-generation)
- Console / plugin debugging
- A11y and Coverage auditing — defer to the figma-console-mcp Design System Dashboard.
