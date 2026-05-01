# Atelier docs site — landing UI kit

A high-fidelity recreation of the Astro 5 docs site landing for `atelier.pieper.io`.

## What's here

- `index.html` — entry point, mounts the React app into `#root`
- `landing.jsx` — small JSX components: `Topbar`, `Hero`, `Pillars`, `McpSection`, `ComponentsGrid`, `Cta`, `Footer`
- `landing.css` — full stylesheet, all values pulled from `--ui-*` tokens

## Sections (top to bottom)

1. **Topbar** — sticky 68px, brand lockup left, primary nav center, search + theme + GitHub icon-buttons right.
2. **Hero** — gradient wordmark, three-action subtitle, `Workshop / teaching artifact` disclaimer, primary + outline CTA.
3. **Three pillars** — Figma → Storybook → Claude+MCP. Cards with stepped numbering, hover lifts top border to primary teal.
4. **MCP setup** — split row. Left: copy + checklist. Right: full `claude_desktop_config.json` snippet with copy button.
5. **Components grid** — category pills (All / Inputs / Display / Navigation / Overlay), framework switcher (Angular / React / Vue), 27 component cards each tagged with three framework dots.
6. **CTA** — dark-teal gradient block, terminal-style command line for `npx create-atelier-ui-workspace`.
7. **Footer** — copyright + links, MIT, "teaching artifact" disclaimer repeated.

## Interactions

- Theme toggle in topbar swaps `data-theme="light" / "dark"` on `<html>`.
- Category pills filter the components grid live.
- Framework switcher is wired to state but doesn't currently swap component examples (kit is structural, not data-driven).
- Copy buttons on code blocks flash "Copied" briefly.

## Tokens used

Everything visual reads from `--ui-*` custom properties defined in `../../colors_and_type.css`. Theming = token override; no Tailwind, no inline color hex anywhere except the framework dots (`#dd0031` / `#61dafb` / `#42b883` are external brand colors).
