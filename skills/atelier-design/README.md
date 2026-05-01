# atelier-design

A Claude Code skill that turns any Claude session into a competent Atelier-brand designer — voice rules, the `--ui-*` token sheet, the Atelier mark, and a high-fidelity Astro docs landing UI kit. Use it when generating slides, mocks, throwaway prototypes, marketing pages, or production code that needs to look and read like Atelier.

## Layout

```
SKILL.md                     ← Entry. YAML frontmatter (name + description) tells
                               Claude when to load. Lean — defers to references/.
references/
  brand-guide.md             ← Voice + content fundamentals + visual foundations.
                               Source of truth for everything stylistic.
assets/
  colors_and_type.css        ← Token sheet snapshot (mirror of upstream
                               libs/react/src/styles/tokens.css). Light + dark.
  logo.png                   ← Atelier mark (pen + brush + capital A).
preview/                     ← 21 static HTML swatch cards for the design system.
                               Auxiliary; not bundled in the distribution zip.
ui_kits/
  docs-site/                 ← Astro docs landing recreation (React + JSX).
                               Auxiliary; not bundled in the distribution zip.
```

`preview/` and `ui_kits/` ride along in-repo for designer reference but are excluded from `dist/skills/atelier-design.zip` per the workspace-wide skill packaging convention (`SKILL.md` + `references/` + `assets/` only).

## Develop

```bash
npx nx lint atelier-design        # validate SKILL.md frontmatter + path refs
npx nx package atelier-design     # → dist/skills/atelier-design.zip
npx nx sync-discovery atelier-design   # publish to docs/public/.well-known/agent-skills/
```

## Install locally

```bash
npx nx package atelier-design
unzip -o dist/skills/atelier-design.zip -d ~/.claude/skills/
```

Re-launch Claude Code afterwards. Or: symlink `.claude/skills/atelier-design → ../../skills/atelier-design` for live edits during skill development.

## Token sync

`assets/colors_and_type.css` is a snapshot of `libs/react/src/styles/tokens.css`. When the canonical token sheet changes, regenerate the snapshot (preserving the skill-snapshot header comment) so the skill stays in lockstep. A drift-guard script under `tools/scripts/` is a sensible follow-up if hand-syncing becomes painful.
