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

## Open — Figma/a11y review follow-ups (2026-04-23)

Snapshot of what's still open after the multi-round review + cleanup work (commits `80f57d0` through `b53ac6e`, releases `v0.0.15` → `v0.0.19`). Grouped by effort so they can be picked up individually.

### Quick wins (each < 30 min)

- [x] ~~**Fix dark-mode `on-primary` inconsistency**~~ — shipped 2026-04-23. `[data-theme="dark"]` block in all 4 tokens.css copies (angular, react, vue, preset) now matches the `@media (prefers-color-scheme: dark)` value `#0f172a`. Affects Checkbox / Stepper / Radio glyphs rendered on `#00d0d0` primary in dark mode.
- [ ] **Add `A11y:` block to LlmBadge description** — component-level audit reports `annotations: 50/100` because `hasA11yNotes: false`. Any short note in the existing description starting with `A11y:` will flip the score to 100.
- [x] ~~**Invalid-state icon on LlmTextarea**~~ — shipped 2026-04-23. `✕` glyph via `::before` on a `.textarea-field` wrapper in all 3 frameworks (wrapper needed because `<textarea>` is a replaced element and R/V have an optional label above it). Same pattern as Alert's `.content::before`. Note: LlmInput has the identical latent flag — follow-up.
- [ ] **Drop decorative `⌟` corner glyphs in Combobox** — these were placeholder visual scaffolding in the design file. Now bound to `color/text` so they pass contrast but they're purely decorative and rendering them as real text is confusing. Remove or replace with `aria-hidden` divider.

### Moderate (1–3 h each)

- [ ] **Create a type ramp** — file has **zero** text styles (`figma_get_text_styles → []`), which drives ~36 `no-text-style` warnings. Minimal set to define: `heading-lg` · `heading-md` · `heading-sm` · `body-lg` · `body` · `body-sm` · `caption` · `button-label` · `mono`. Then rebind text nodes across the 27 component sets to the matching style. High hygiene payoff; unlocks consistent typography overrides via Figma modes.
- [ ] **Add hover/active/loading variants** to interactive components — the component-level audit recommends them on Button, Input, TabGroup, Checkbox, Toggle, RadioGroup, Table, Radio, Select, Combobox. Each needs one more state entry in the `state` axis with appropriate visual treatment (bg/border shift for hover, pressed-in for active, spinner glyph for loading). Reuse the focus-variant pattern from commit `b53ac6e` / the `figma_execute` script from this session.
- [ ] **Replace the remaining ~40 hardcoded hex values** — mostly non-semantic pinks/violets/light grays in demo decoration. Safe to sweep by adding a `color/decorative-*` or just rebinding each to the nearest existing token. Low urgency (no lint criticals).
- [ ] **Move icon indicators from CSS pseudo-elements to the component templates** — current implementation (`::before` on variant class) works and is screen-reader-friendly because the Unicode glyph announces semantically. But consumers can't override the icon and themed mode-swapping of the glyph isn't possible. Longer-term: emit `<span aria-hidden="true" class="variant-icon">✓</span>` from the component template, keeping CSS as the styling lever. Needs a template edit across 3 frameworks per affected component (Badge + Alert today).

### Larger workstreams

- [ ] **Adopt an icon system for the component library** — current decision (commit `b53ac6e`) is Unicode glyphs for the 4 semantic-severity icons specifically, because they're self-labelling for screen readers and don't need a dependency. If the library wants to add icon slots to Menu / Select / nav components in general, the natural upgrade path is `@material-symbols/svg-400` (already installed for docs). That's a design-system decision, not a lint-driven fix.
- [ ] **Rework `wcag-color-only` remaining flags for Badge/Alert** — the page-level lint in `figma-console` reports 16 color-only criticals because its heuristic only compares the variant's root-level fill against the default's root fill. It doesn't inspect child SVGs or pseudo-element icons. Component-level audit correctly reports `colorDifferentiation: 100`. Real WCAG 1.4.1 is satisfied. Options if we want the page-level lint also green: add a distinguishing outline style per variant (dashed/dotted), or a distinct corner shape. Cosmetic lint-appeasement; zero a11y benefit beyond what we've already shipped.

### Marginal / likely won't-fix

- [ ] **14 `wcag-text-size` below-12px warnings** — all intentional UI chrome: pagination arrows `▲▼`, font-size labels "xs/sm", badge "Default" placeholder, Alert `Backdrop (rgba(0,0,0,0.5))` documentation label. Not content text. WCAG 1.4.4 requires supporting 200% zoom, not a specific size floor; the code uses rem/em correctly. Could bump to 12px if we want the lint quiet.
- [ ] **Docs site: resize `docs/src/assets/logo.png` + `docs/public/logo.png`** (context: commit `ae5c718`). Currently 585 KB PNG at 1056×1012 rendered at 56×54. The Astro 6 `<Image>` cold-build bug forced us to serve the original unoptimized; a 224×216 resize would be strictly better for Lighthouse and would re-enable the `<Image>` path if the cold-build bug gets fixed upstream.
- [ ] **Pre-existing lint errors in `docs/.astro/*.d.ts`** — generated Astro type files use `/// <reference>` which the repo's eslint flags. Add `docs/.astro/**` to the docs eslint ignore list.

### Pointers back

- All session commits: `git log --oneline 6cf4f74..` (on `main`, from before `v0.0.12` up through `v0.0.19`).
- Figma file: `Atelier UI` (`QMnDD8uZQPldPrlCwZZ58T`) — `Components` page. Lint via `figma_lint_design`; component audit via `figma_audit_component_accessibility`.
- Session lint deltas (before / after): `wcag-contrast` 25 → 0; `wcag-focus-indicator` 6 → 0; `wcag-disabled-no-context` 8 → 0; `wcag-color-only` 13 → 16* (*page-level heuristic; component-level is clean).

## Review — Figma designs for the last 7 components + parity pass (2026-04-22)

Closed the Figma design gap for the 7 components that existed in code but had no design: `code-block`, `combobox`, `drawer`, `progress`, `radio` (standalone), `stepper`, `table`. All new component sets live on the Atelier UI `Components` page, bind every fill/stroke/text to UI Tokens so Light + Dark modes render automatically, and are linked back into Storybook via `parameters.design` on the meta and per-named story across Angular, React, and Vue.

**Figma node-ids (captured this run):**

| Component | Section | Component set | Key variants |
|---|---|---|---|
| LlmProgress | `3:875` | `420:153` | default-md-determinate `420:87`, default-md-indeterminate `420:90`, success-md `420:105`, warning-md `420:123`, danger-md `420:141`, size-sm `420:81`, size-lg `420:93` |
| LlmRadio *(new)* | `420:182` | `420:185` | unchecked `420:165`, checked `420:169`, disabled `420:174`, invalid `420:178` |
| LlmCodeBlock *(new)* | `420:283` | `420:286` | default `420:186`, with-filename `420:209`, with-line-numbers `420:232`, no-copy `420:263` |
| LlmCombobox *(new)* | `421:336` | `421:339` | default `421:291`, open `421:295`, filtered `421:313`, selected `421:324`, disabled `421:328`, invalid `421:332` |
| LlmDrawer | `3:1111` | `421:398` | right `421:342`, left `421:356`, top `421:370`, bottom `421:384` |
| LlmStepper *(new)* | `421:404` | `421:505` | default `421:407`, completed `421:427`, error `421:446`, optional `421:465`, vertical `421:485` |
| LlmTable | `158:39` | `421:1183` | default-md `421:884`, striped `421:923`, bordered `421:962`, sortable `421:1002`, selectable `421:1051`, sticky `421:1090`, empty `421:1103`, size-sm `421:1142`, size-lg `421:1181` |

**Files touched — stories (21):** `libs/{angular,react,vue}/src/lib/{progress,radio,code-block,combobox,drawer,stepper,table}/*.stories.{ts,tsx}` — meta + per-story `parameters.design`, `figmaNode()` helper added to files that lacked it (all 7 Vue stories, Combobox/CodeBlock/Table in Angular+React, Stepper+Drawer+Progress in React+Vue).

**Files touched — code (3):** `libs/{angular,react,vue}/src/lib/stepper/llm-stepper.css` — replaced hard-coded `color: #fff` on `.step-item.is-completed .step-circle` with `var(--ui-color-on-primary)` (matches the Figma design-token binding) and on `.is-error` with `var(--ui-color-text-on-danger, #ffffff)` (semantic). All other Progress/Radio/CodeBlock/Combobox/Drawer/Table styles were already 100% token-bound and matched the new designs — no further code changes needed.

**Parity notes (minor, non-blocking):**
- Combobox input text: Figma 14px vs code `--ui-font-size-md` (16). Kept code at 16 to match Input/Select.
- Drawer header font-size: Figma 18px vs code `--ui-font-size-xl` (20). Kept code at 20 for token consistency.
- CodeBlock mono body: Figma 13px vs code `--ui-font-size-sm` (14). Kept code at 14.
- Radio stroke: Figma binds to `color/border` (#E5E7EB); code uses `--ui-color-input-border` (#D1D5DB). Both semantic, different shades.
- Table header tracking: Figma letter-spacing 6% vs code `--ui-letter-spacing-wide` (1%). Kept code using the token.

**Verified:** `nx run-many -t lint,test -p angular,react,vue` all green (3/3 lint, 27/27 test files, 492/492 tests, drawer `play` functions intact).

**Visual polish pass (same day, after user review):** screenshot-verified each of the 7 component sets via the Desktop-Bridge `figma_capture_screenshot` path (REST screenshots 403 without a token) and fixed five layout bugs:
- Combobox `open` / `filtered` variants had invisible dropdown panels — outer component and inner `panel` frame were pinned at h=40 / h=1 because `.resize()` flipped their primary-axis sizing back to FIXED. Toggled both back to AUTO.
- CodeBlock variants were all pinned at h=200 regardless of code length (same root cause). Freed the primary axis, now heights hug content.
- Table inner `LlmTable / *` containers had the same pinning; freed.
- Stepper step circles rendered as narrow vertical pills because switching `layoutMode` to `HORIZONTAL` after `.resize(32, 32)` reverted both axes to AUTO and shrunk-wrapped the text. Set both sizing modes back to FIXED at 32×32.
- Stepper connectors were 2px rectangles placed with counter=MIN, so they sat at the top of the step items instead of aligned with the 32px circle midpoints. Wrapped each connector in a 40×32 (horizontal) / 32×24 (vertical) frame with the bar centered.
- Combobox option rows had `primaryAxisAlignItems='SPACE_BETWEEN'` which centered the single-text rows; switched to `MIN` and gave the "selected option" label `layoutGrow=1` so the ✓ still pushes right.
- Drawer content paragraphs were clipped in the narrow left/right panels (220px); set `textAutoResize='HEIGHT'` with a fixed width so text wraps.
- CodeBlock `no-copy` header had the same single-child SPACE_BETWEEN issue (centered "typescript" label); switched header to `MIN`.

All component sets re-stacked with 40px vertical gaps so sections no longer overlap. Node-ids above are unchanged — only layout properties and a few wrapper frames were added.

**Page alignment**: 7 sections redistributed into the same 3-column grid the existing 20 sections use (col 0 x=0, col 1 x=1588, col 2 x=3200), starting at y=3050 (40px below the last existing section). Final layout — Row 0: Progress | Radio | CodeBlock · Row 1: Combobox | Drawer | Stepper · Row 2: Table. Zero collisions with the existing sections. Node-ids still unchanged.

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
