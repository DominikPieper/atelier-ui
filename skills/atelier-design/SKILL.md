---
name: atelier-design
description: Use this skill to generate well-branded interfaces and assets for Atelier — an open-source AI workshop teaching component-driven UI development with Figma, Storybook, and Claude/MCP. Suitable for production handoffs or throwaway prototypes/mocks. Contains essential design guidelines, tokens (`--ui-*`), type scale, color system, fonts, logo, and a docs-site UI kit.
user-invocable: true
---

Read `references/brand-guide.md` first — it is the source of truth for voice, content fundamentals, and visual foundations. Then explore the other files listed below as needed.

Key files:
- `references/brand-guide.md` — brand context, voice, visual foundations, iconography
- `assets/colors_and_type.css` — full token sheet (`--ui-*` custom properties), light + dark, type scale (mirror of upstream `libs/react/src/styles/tokens.css`)
- `assets/logo.png` — Atelier mark (pen + brush + capital A)
- `preview/` — design-system preview cards covering type, colors, spacing, components, brand (auxiliary; not bundled in the distribution zip)
- `ui_kits/docs-site/` — high-fidelity Astro docs site landing recreation (React + JSX; auxiliary; not bundled in the distribution zip)

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing pages, etc), copy assets out and create static HTML files for the user to view. Always:
- Use `--ui-*` tokens — never hardcode hex; theming = token override.
- Set type in Inter (UI) and Fira Code (everything codey — tokens, code samples, prop names, kbd chips).
- Keep voice honest and editorial — *"Tokens, not utilities."* / *"Composition over configuration."* / *"teaching artifact, not a production library."* No emoji. No exclamation marks.
- Anchor color is Conciso deep teal `#006470` (light) / bright teal `#34d8d8` (dark). Use the broader `--ui-color-brand-*` palette only for diagrams, never chrome.
- Component names are PascalCase with the `Llm` prefix (`LlmButton`, `LlmCard`, `LlmCardHeader`).
- Imagery is restrained — the brand prefers the wordmark, a crosshair grid, and one radial glow over photography or illustrations.

If working on production code, copy `assets/colors_and_type.css` into the project and read the rules in `references/brand-guide.md` to become an expert in designing with this brand. The token names line up 1:1 with the upstream `@atelier-ui/spec`.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions about audience and surface (landing page / docs chapter / component preview / diagram), and act as an expert designer who outputs HTML artifacts *or* production code, depending on the need.
