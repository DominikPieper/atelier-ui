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
- [x] ~~CI pipeline for tests on PRs~~ — shipped (`.github/workflows/ci.yml`: parallel lint/test/build/checks on `nx affected`)
- [ ] Facilitator guide — timing, learning arc, common pitfalls
- [x] ~~True CLI e2e test~~ — shipped as `nx run create-atelier-ui-workspace:e2e`, wired into CI as an affected-gated job

## Review — CLI e2e + tokens.css packaging fix (2026-04-22)

Shipped a real end-to-end test for `npx create-atelier-ui-workspace` and, in the process, caught a workshop-blocker that the previous unit tests couldn't see.

- `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs` — spins up a local verdaccio registry (via `npx -y verdaccio@5`), publishes the preset and CLI tarballs to it, installs the CLI into a scratch directory like an attendee would, runs it non-interactively, then `nx build`s the scaffolded app. verdaccio proxies to npmjs.org for everything except the two local packages so real `@atelier-ui/*` deps resolve normally.
- CLI got a `--framework=<angular|react|vue>` flag and an `ATELIER_PRESET_SPEC` env override so the e2e can drive it without a TTY. 13/13 jest tests (6 original + 5 new flag/env tests, 2 other pre-existing).
- `nx run create-atelier-ui-workspace:e2e` target added; gated on `^build` + `build`.
- New CI job `cli-e2e` in `.github/workflows/ci.yml` — affected-only, 20-minute timeout. Skips on unrelated pushes because verdaccio startup + 3 npm-install-and-build cycles take ~5 min.

**Bug caught and fixed:** the preset injected `@import '@atelier-ui/<fw>/styles/tokens.css';` but:
- `tokens.css` is not in the published v0.0.4 tarballs — ng-packagr and the react/vue builds only bundle the entry point, not `src/styles/`.
- Even if it were shipped, the dist-generated package.json has a strict `exports` field without a `./styles/*` entry.

Fixed by making the preset own a canonical `tokens.css` at `libs/create-workspace/src/generators/preset/files/styles/tokens.css` and writing it into `<app>/src/styles/tokens.css` during scaffolding. Attendees can edit colors directly in their workspace (no CSS-variable override pattern required for a 90-minute session). `@atelier-ui/<fw>` npm packages are still used for components, just not for tokens.

Verified: e2e green for all three frameworks (angular / react / vue — real `nx build` with styles bundle produced), `nx test create-workspace` 29/29, `nx test create-atelier-ui-workspace` 11/11, `nx affected -t lint` clean.

## Review — Figma Desktop Bridge pivot (2026-04-22)

Primary Figma channel switched from the REST API (`FIGMA_ACCESS_TOKEN`) to the Figma Desktop Bridge plugin shipped by `figma-console-mcp`. Token becomes optional (REST reads only).

- `tools/scripts/preflight.mjs` (and the preset template copy) — `checkFigmaToken()` → `checkFigmaSetup()`: checks `~/.figma-console-mcp/plugin/manifest.json`, probes Bridge ports 9223–9232, treats `FIGMA_ACCESS_TOKEN` as optional.
- `.mcp.json` — `FIGMA_TOKEN_REMOVED` → `${FIGMA_ACCESS_TOKEN:-}` so no token is baked into the committed file.
- `.devcontainer/` (root and preset template) removed — Figma Desktop is required for the Bridge plugin and doesn't run in Codespaces. Preset generator no longer writes the devcontainer; the related test is dropped (28/28 green, was 29).
- `docs/src/pages/figma-token.astro` — rewritten to walk the Desktop Bridge plugin install path; REST token coverage kept as the optional section.
- `docs/src/pages/workshop.astro` — Codespaces prerequisite tab removed; link text points at "Figma Setup".
- `docs/src/layouts/BaseLayout.astro` — sidebar "Figma Token" → "Figma Setup" (icon `key` → `cable`).

Verified: preflight exits 0 (14 ok, 1 warn for optional FIGMA token — expected), `nx test create-workspace` 28/28, `nx build docs` 43 pages, `nx affected -t lint` clean.

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
