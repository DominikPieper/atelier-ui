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
                                      Includes pre-flight: snapshot pin + cross-source grep.
  audit-verify-queries.md           ← Re-verify sub-mode of Audit — one query per category
                                      with auto-resolve signals. Use when checking whether
                                      findings from an older audit are still open.
  code-verify.md                    ← Code-side visual verification recipe. Storybook +
                                      browser-automation flow for confirming Figma↔code
                                      parity in Light + Dark after token/variant changes.
  tool-map.md                       ← Which figma-console-mcp tool for which intent. Includes
                                      ready-to-use figma_execute / figma_setup_design_tokens payloads.
  token-architecture.md             ← Primitive / Semantic / Component tier model + Modes.
  naming-and-file-structure.md      ← Slash naming, page-level taxonomy, library boundaries.
  component-design.md               ← Variants, Component Properties, slot patterns.
  code-sync.md                      ← Keeping Figma Variables in lockstep with code-side
                                      tokens (CSS / JSON / framework libs).
  migration-playbook.md             ← Refactoring an existing file safely. Safety classes,
                                      coordination protocol, recipes for the common operations.
  iconography.md                    ← Icon-system architecture: size stops, color binding,
                                      Component-vs-vector heuristic, library-split signals.
  scaffold-payload.md               ← Scaffold sub-mode of Build — one-shot recipe that
                                      produces Cover + Tokens + Components pages.
assets/
  audit-report-template.md          ← Output template for Audit mode.
tests/                              ← Behavior-spec fixtures (dev-only — excluded from the
                                      runtime zip). One scenario per directory.
```

## Develop

Edit the markdown directly. Targets via Nx:

```bash
# Lint structure (frontmatter, required references, dead links)
npx nx lint figma-workspace-architect

# Validate test fixtures (well-formedness; manual / LLM-judged grading)
npx nx test figma-workspace-architect

# Bundle into dist/skills/figma-workspace-architect.zip for distribution
npx nx package figma-workspace-architect
```

The packaged zip preserves the canonical layout (`figma-workspace-architect/SKILL.md`, `figma-workspace-architect/references/*`, `figma-workspace-architect/assets/*`) that Claude Code expects.

## In this repo — auto-active

The skill is symlinked at `.claude/skills/figma-workspace-architect` → `skills/figma-workspace-architect`. Claude Code picks up project-local skills from `.claude/skills/` automatically when invoked in this repo. No install step. Edits to `SKILL.md` or `references/*.md` take effect on the next session.

## Install elsewhere (other projects / global)

For machines other than this repo:

```bash
npx nx package figma-workspace-architect
unzip -o dist/skills/figma-workspace-architect.zip -d ~/.claude/skills/
```

Re-launch Claude Code; the skill auto-discovers via the `name` in `SKILL.md`.

## Scope reminder

This skill is **architectural** — it makes decisions about how a Figma file is built. It does **not** cover:
- Plugin API mechanics for `figma_execute` payloads
- Figma → code translation (that is downstream code-generation)
- Console / plugin debugging
- A11y and Coverage auditing — defer to the figma-console-mcp Design System Dashboard.
