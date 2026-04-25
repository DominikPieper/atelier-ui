# Skills

Claude Code skills authored alongside the Atelier UI component library. Each skill is a self-contained markdown bundle that Claude loads on demand to specialize its behavior for a given workflow.

## Layout

Each skill follows the canonical Claude Code structure:

```
<skill-name>/
  SKILL.md            ← entry point with YAML frontmatter (name + description)
  references/         ← supplementary docs Claude reads on demand
  assets/             ← templates and other static files the skill references
  README.md           ← developer-facing notes (this folder, not Claude-loaded)
  package.json
  project.json
```

## Skills

| Skill | Status | Purpose |
|---|---|---|
| `figma-workspace-architect` | 0.1.0 | Designs, builds, audits, and improves Figma workspaces via `figma-console-mcp`. |

## Develop

Each skill is a regular Nx project. Common targets:

```bash
# Lint a skill's structure
npx nx lint <skill-name>

# Bundle for distribution (output: dist/skills/<skill-name>.zip)
npx nx package <skill-name>
```

## Install locally

```bash
npx nx package <skill-name>
unzip -o dist/skills/<skill-name>.zip -d ~/.claude/skills/
```

Re-launch Claude Code afterwards.
