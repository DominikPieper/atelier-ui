# Atelier UI — Status

## Shipped ✅

### Component libraries
- 25+ components across Angular, React, and Vue
- Signal Forms integration (Angular), prop/callback pattern (React), v-model (Vue)
- CSS design tokens, dark mode, accessible by default
- Includes complex components like LlmTable, LlmCombobox, and LlmStepper

### Storybook
- All three frameworks with interactive Controls
- Foundation docs (colors, spacing, typography)
- Welcome / Introduction page per framework
- Showcase story (all components on one page)

### MCP server
- 5 tools: list_components, get_component_docs, search_components, get_stories, get_theming_guide
- Hosted at atelier-ui.netlify.app/storybook-{angular,react,vue}/mcp

### create-atelier-ui-workspace
- CLI with interactive framework selection
- Scaffolds Nx workspace with per-framework apps
- Generates CLAUDE.md with MCP tool reference + framework import patterns
- Injects CSS tokens import into each app's styles.css
- Pre-configures .claude/settings.json with MCP servers
- 19 automated tests for the preset generator

### Docs site (atelier-ui.netlify.app)
- Workshop-first homepage with 3 pillar cards
- Workshop Setup, MCP Playground, Storybook, Installation
- LLM-Optimized APIs page (why the library is structured this way)
- MCP Playground with protocol flow, color legend, workshop tips per tool

### Published packages (v0.0.4)
- @atelier-ui/spec
- @atelier-ui/angular
- @atelier-ui/react
- @atelier-ui/vue
- @atelier-ui/create-workspace
- create-atelier-ui-workspace

## Remaining

- [ ] Storybook visual check — light + dark mode, manual pass on key components
- [ ] CI pipeline for tests on PRs
- [ ] Facilitator guide — timing, learning arc, common pitfalls
- [ ] True CLI e2e test — runs npx create-atelier-ui-workspace in a temp dir

## Review — Zero-Friction Setup (2026-04-21)

Shipped for the 90-minute workshop onboarding:

- `tools/scripts/preflight.mjs` — self-check: Node/npm/git, Claude CLI, FIGMA_ACCESS_TOKEN, MCP reachability (reads `.mcp.json`), ports 4200/4201/4202/6006. Color-coded, exit-code on hard fail.
- `npm run preflight` wired into root `package.json` and into the generated workspace via the preset.
- `.devcontainer/devcontainer.json` + `setup.sh` — Codespaces fallback path (Node 20 image, Claude CLI install via `npm i -g @anthropic-ai/claude-code`, port forwards, `FIGMA_ACCESS_TOKEN` injected from user env).
- Preset generator (`libs/create-workspace`) now ships the preflight script + devcontainer inside every scaffolded workspace. CLAUDE.md template gained a Troubleshooting section. 4 new tests, total 29 — all green.
- `docs/src/pages/workshop.astro` — prerequisites block with macOS/Linux/Windows/Codespaces tabs before step 01; step 02 now mentions `npm run preflight`.
- `docs/src/pages/troubleshooting.astro` — 8 common failure modes (MCP unreachable, Claude-Code-config not picked up, Figma 403, Node too old, EACCES, port in use, lost token, Windows paths) each with symptom/cause/3-step-fix.
- `docs/src/pages/figma-token.astro` — Option A (own token) vs. Option B (workshop demo token) vs. Codespaces secret, ending in a preflight verify.
- Sidebar (`docs/src/layouts/BaseLayout.astro`) gained "Figma Token" and "Troubleshooting" under Get Started.

Verified: preflight exits 0 locally (12 ok, 1 warn for missing FIGMA token — expected), docs build succeeds (43 pages), create-workspace test suite passes (29/29).

Out of scope this round (per plan): StackBlitz, facilitator guide, challenges, wow-demos, CI pipeline, visual regression, CLI e2e.
