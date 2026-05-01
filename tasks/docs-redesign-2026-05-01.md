# Atelier docs site redesign — 2026-05-01

Site-wide audit of `docs/` against `skills/atelier-design/references/brand-guide.md` and the `ui_kits/docs-site/landing.{jsx,css}` reference. Brand-guide content is **not** restated here — consult the rubric directly.

---

## Top-level findings

- **Voice debt is the largest theme.** Title-case headings, marketing-y copy ("Workshop in a box", "Get Started", "Three endpoints. One config.", "Three sources, three layers"), decorative emojis (⏱ ✦ ✓ → 💡 🧩 🔧 🎨 🧠 ⚙ 📦), and capitalised section heads (`Discovery Endpoints`, `MCP Server`, `HTTP Agent Features`, `What is llms.txt?`) are scattered across nearly every page. The brand mandate is sentence-case + no emoji + calm declarative voice.
- **No shared chrome primitives for the landing kit.** Every page reinvents its own hero / eyebrow strip / card / pill / footer. The kit defines `topbar`, `section-head` (eyebrow + title + sub), `pill`, `fw-switcher`, `pillar`, `comp-card`, `code-card`, `cta-card`, `mcp-checklist`, `pillar-tag`. None of these exist as Astro components in `docs/src/components/`. Every reuse is currently a copy-paste with bespoke inline styles, so the same drift will recur the moment the site grows.
- **Hero on `/` does not match the kit.** It uses a teal→cyan gradient on the wordmark (`docs-hero-gradient-end: #00b4ff`), an `✦` glyph, two glow layers, and a vertical layout that pushes the disclaimer below the actions. The kit hero is a flat radial-glow + crosshair grid + pill eyebrow with a primary-only wordmark and the disclaimer above the actions.
- **Inline-styles are the real visual debt.** ~370 `style="…"` instances across pages. They duplicate token math (`color-mix(in srgb, var(--ui-color-primary) 6%, transparent)` repeated 5+ times), override radii inconsistently, hardcode font-sizes outside the type scale, and bypass the dark/light pairing.
- **Mockup SVGs are placeholders.** 13 inline SVGs across `index`, `install`, `mcp`, `figma`, `figma-token`, `tutorial`, `a11y-workflow`. User memory note: replace with real screenshots — at site scope this is a real workstream.
- **A11y debt is mid-sized.** No skip-link in `BaseLayout.astro`, no `<main id>` + `aria-live` for theme-toggle status, decorative emojis announced (no `aria-hidden`), `tabindex="0"` on `<article class="comp-card">` without role/keypress handler, the framework dots use `title` attrs (not announced) and lack labels.

---

## Site map

| Page (file) | Current shape | Dominant violations |
|---|---|---|
| `index.astro` (420 L) | Bespoke hero, orient-strip cards, workflow grid, stats-ribbon, MCP row, terminal mockup, quick-nav grid | voice, chrome, mockup, inline |
| `workshop.astro` (477 L) | Eyebrow + h1, objective box, prerequisites tabs, 5 step rows, preflight terminal mockup, MCP step | mockup, inline, chrome (step-row) |
| `figma-token.astro` (337 L) | Eyebrow + h1, page-pair, Desktop Bridge SVG mockup, env-var blocks, troubleshooting | mockup, inline, voice ("emoji" in BottomNav) |
| `tutorial.astro` (645 L) | Eyebrow + h1, objective heading, big workflow SVG, prompt/output blocks, tools-used cards | mockup, voice ("The Workflow", "Example Prompt", "Generated Output", "Run it"), inline |
| `first-component.astro` (452 L) | Eyebrow + h1, 7 kata steps, target-image and parity check | voice ("Optional —"), inline, chrome |
| `patterns.astro` (213 L) | Eyebrow + h1, callout, 6 pattern sections, demo islands | emoji (🧩), voice (OK), inline |
| `patterns/[id].astro` | Single pattern detail with code variants | not yet audited at line level — assumed similar inline drift |
| `install.astro` (334 L) | Eyebrow + h1, framework switcher, 3-step SVG, install commands, BottomNav | mockup (3-step SVG), voice ("What's included" OK; "CSS Variables" capital OK; "✓ ready to build"), emoji in BottomNav |
| `figma.astro` (510 L) | Eyebrow + h1, page-pair, file table, token-mapping SVG, frame inventory, BottomNav | mockup, voice ("Token → CSS mapping" OK), emoji in BottomNav |
| `prompts.astro` (261 L) | Eyebrow + h1, framework tabs, prompt sections | inline, '✓ copied' string |
| `a11y-workflow.astro` (687 L) | Eyebrow + h1, three-source diagram, audit-loop diagram, worked example, stats ribbon | mockup (3 large SVGs), voice ("Three sources, three layers", "The audit loop"), inline |
| `accessibility.astro` (253 L) | Eyebrow + h1, stance, kbd map, recent improvements | voice ("Our stance"), emoji in BottomNav |
| `agent-skills.astro` (207 L) | Eyebrow + h1, callout, discovery endpoints, HTTP agent features, MCP/workspace skills | voice ("Discovery Endpoints", "HTTP Agent Features", "Workspace Skills", "MCP Skills"), 💡 callout, emoji in BottomNav |
| `claude-md.astro` (230 L) | Eyebrow + h1, sections | voice ("Workshop Setup" capital OK as label), emoji in BottomNav |
| `design-principles.astro` (231 L) | Eyebrow + h1, 5 numbered principles with bad/good comparisons | voice (titles already use sentence-case — OK), inline |
| `tokens.astro` (266 L) | Eyebrow + h1, color/spacing/radius/type/shadow/motion sections | voice (mostly OK), emoji in BottomNav |
| `mcp.astro` (120 L) | Eyebrow + h1, MCP-flow SVG, McpExplorer island | mockup, voice (lede OK) |
| `storybook.astro` (165 L) | Eyebrow + h1, framework cards, MCP step list | voice ("MCP Server", "Framework Parity", "Endpoints"), `Open →` strings (cosmetic) |
| `troubleshooting.astro` (204 L) | Eyebrow + h1, 8 issue cards with code-fix | voice mostly OK |
| `llms.astro` (200 L) | Eyebrow + h1, callout (💡), file list, why cards, preview | voice ("What is llms.txt?", "The Files", "How to Use It", "Why Plain Text?"), 💡 emoji, '✓ copied', inline |
| `components/index.astro` → `ComponentGallery.tsx` | Title + count, search bar (🔍), category pills, grid | voice (sentence-case OK), 🔍 emoji, 🧩 fallback, no `aria-hidden` on icons |
| `components/[name].astro` → `ComponentDetail.tsx` (609 L) | Per-component spec view | voice ("✨ Best Practices"), inline |
| `skills/figma-workspace-architect.astro` | Skill detail | emoji in BottomNav, voice not yet audited at line level |

---

## Cross-cutting findings

### Shared components to extract (and consume across all pages)

These belong in `docs/src/components/` and replace ~80% of the inline-styled shell on every page.

- **`PageHero.astro`** — hero with crosshair grid + radial glow + eyebrow pill + wordmark + sub + disclaimer + actions. Props: `eyebrow: string`, `wordmark: string` (slot variant for runs of styled text), `sub: string`, `disclaimer?: string`, `primaryAction: { href, label }`, `secondaryAction?: { href, label }`. Drops the `--00b4ff` gradient end; wordmark is solid `--ui-color-primary`.
- **`SectionHead.astro`** — replaces every `<h2 class="docs-section-title">` + lede pattern. Props: `eyebrow?: string` (uppercase tracked), `title: string` (sentence case), `sub?: string`, `align?: 'left'|'center'`. Drops 90% of inline-styled `<p style="font-size: 0.9rem; color: var(--ui-color-text-muted)…">` blocks.
- **`Pillar.astro`** — landing-kit pillar card. Props: `step?: string` (e.g. `"01 · Inspect"`), `iconName: IconName`, `name: string`, `desc: string`, `tags?: string[]`. Pairs with new `--ui-color-pillar-tag-bg` mapping.
- **`CompCard.astro`** — landing-kit component tile (PascalCase name, mono icon, desc, fw-dots). Replaces the bespoke gallery card in `ComponentGallery.tsx`. Drops `🧩` fallback and `🔍` icon (use `Icon name="search"` from the existing material-symbols set, with `aria-hidden`).
- **`CodeCard.astro`** — mono header strip + lang tag in primary teal + Copy button + body. Replaces `docs-mcp-card` (index), `preflight-mock-*` (workshop), the bespoke terminal showcase, the MCP `Code` blocks where copy buttons exist (`prompts`, `llms`).
- **`Pill.astro`** + **`PillGroup.astro`** — replaces inline category pills, framework selectors, the `docs-multi-code-tabs` pattern.
- **`FwSwitcher.astro`** — segmented framework toggle (Angular / React / Vue) with shared client-side store. Used by `prompts`, `install`, `workshop`, `tutorial`, `figma`. Replaces 4 different bespoke implementations.
- **`CtaCard.astro`** — landing-kit gradient CTA with embedded terminal command line + copy button. Replaces the `docs-terminal` showcase on `/`.
- **`Footer.astro`** — site footer. Currently absent. Brand requires "© 2026 Dominik Pieper · MIT · Teaching artifact" + minimal nav.
- **`Callout.astro`** — replaces the `💡` boxes on `/llms`, `/agent-skills`, the `🧩` callout on `/patterns`. Props: `tone: 'note'|'tip'|'warning'`, default lucide-style icon, `aria-hidden` on icon.
- **`PageEyebrow.astro` (modify, not extract)** — drop the `⏱` glyph (line 27) for an inline `Icon name="schedule"` (needs adding to `Icon.astro`). Add `aria-hidden`.

### Voice / copy debt — global rules

Apply via grep + manual review:

```bash
# Heading title-case offenders
rg -n '<h[1-6][^>]*>[A-Z][a-z]+ [A-Z][a-z]+' docs/src/pages docs/src/components

# Section-title text in inline prose
rg -n 'class="docs-section-title"' docs/src/pages | rg -v '\b[a-z]'

# Emojis (extend with the brand-guide list; covers all current offenders)
rg -nP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}✦✓⏱⚙◇◆⬡⚒]' docs/src/pages docs/src/components

# Exclamation marks in copy (filter out JS !==, !target etc. afterwards)
rg -n '![ ,.<"]' docs/src/pages docs/src/components | rg -v '!=|!\.|!\['

# Capital-letter component refs that should be PascalCase Llm-prefixed
rg -nw 'Button|Card|Dialog|Tabs|Tooltip|Toast|Combobox|Select|Input|Textarea|Checkbox|Radio|Switch' docs/src/pages | rg -v 'Llm|component\.|//|/\*'

# Forbidden filler / SaaS-marketing turns
rg -nE 'Get Started|Get started in|Workshop in a box|in a box|seamless|powerful|amazing|leverage|elevate' docs/src/pages

# Recurring brand phrases — verify exact wording
rg -nE 'Tokens, not utilities|Composition over configuration|Predictable APIs across frameworks|inspect → prompt → ship → iterate|teaching artifact|single source of truth' docs/src/pages docs/src/components
```

Casing rules to enforce (already in CLAUDE memory but listing for the executor):

- `Atelier` proper, `atelier-ui` lower-kebab in copy that names the package, `@atelier-ui/{angular,react,vue}` lower-kebab.
- `MCP`, `ARIA`, `WCAG`, `JSON-RPC`, `HTTP`, `CSS`, `CLI` uppercase.
- `figma-console-mcp` literal, distinct from generic `figma-mcp`.
- Component names `LlmFoo` PascalCase, prefixed.
- Headings sentence case throughout.

### Visual / token debt — global rules

```bash
# Hardcoded colors that should be tokens
rg -nE '#[0-9a-fA-F]{3,8}' docs/src/pages docs/src/components docs/src/styles | rg -v 'tokens\.css|brand-guide|svg|currentColor|fill: var|stroke: var'

# Inline color-mix duplications — collapse into named tokens
rg -n 'color-mix\(in srgb, var\(--ui-color-primary\) 6%' docs/src/pages

# Direct rgba(0,100,112…) — should be --ui-color-primary-light
rg -n 'rgba\(0,\s*100,\s*112' docs/src
```

Token cleanup tasks:

- Drop `--docs-hero-gradient-end: var(--ui-color-brand-development, #00b4ff)` from `docs-theme.css` line 84 — kit specifies primary-only wordmark.
- Add `--ui-color-primary-tint-6: color-mix(in srgb, var(--ui-color-primary) 6%, transparent)` and `--ui-color-primary-border: color-mix(in srgb, var(--ui-color-primary) 20%, transparent)` to `docs-theme.css` so the callout / pagepair patterns stop redefining them.
- Codify hover shadow as `--ui-shadow-card-hover: 0 12px 24px rgba(0,100,112,0.10)` (and dark equivalent) — it appears verbatim in `landing.css` lines 103, 144 and is missing from the docs.

### A11y debt — global rules

- No skip-link in `BaseLayout.astro` (lines 170-220). Add `<a href="#main" class="docs-skip-link">Skip to content</a>` first child of `<body>`; target `<main id="main">`. Skip-link styles: visually hidden until `:focus-visible`, then surface with double-ring focus token.
- Brand-guide focus token (`0 0 0 2px surface, 0 0 0 4px primary`) is **not** present in `tokens.css` import. Add `--ui-focus-ring` to `docs-theme.css` and audit all `:focus-visible` selectors in `global.css` (currently 2 explicit, the rest implicit).
- `prefers-reduced-motion` only zeros the theme-toggle reveal (`docs-theme.css` 128-133). The hero `.dot` pulse (`landing.css` 75) and any future hover transforms must respect it — add a global `@media (prefers-reduced-motion: reduce)` block in `global.css` that sets `--ui-duration-fast/normal/slow: 0ms` and zeros transforms.
- `<article class="comp-card" tabIndex="0">` (kit reference) — when implemented in `CompCard.astro` it must wrap the whole card in `<a>` not stand-alone tabindex; otherwise add `role="link"` + `onKeyDown` Enter/Space handler.
- All decorative SVG mockups need `aria-hidden="true"` on the outer `<svg>` plus a textual summary in the figcaption (some already do via `<title>`/`<desc>`, audit each).
- `<title>` attrs on `.docs-fw-dot` (ComponentGallery.tsx 105-108) are tooltips, not screen-reader labels. Replace with `<span class="visually-hidden">Available for Angular, React, and Vue</span>` once and `aria-hidden="true"` on the dots.
- Theme-toggle button has no `aria-live` / state announcement; add `aria-pressed` toggling between `true` (dark) and `false` (light).

### Mockup-to-screenshot workstream

13 inline-SVG mockups live in:
- `index.astro` (terminal showcase, lines 188-228)
- `install.astro` (3-step flow, lines 111-172)
- `mcp.astro` (data-flow diagram, lines 33-117)
- `figma.astro` (token mapping diagram, lines 86-230 + frame inventory)
- `figma-token.astro` (Desktop Bridge mockup)
- `tutorial.astro` (workflow diagram, ~lines 312-470)
- `a11y-workflow.astro` (three-source Venn, audit-loop, worked example — 3 large SVGs)
- `workshop.astro` (preflight terminal mockup, lines 160-220)

The data-flow / token-mapping / Venn-style diagrams are conceptual and should **stay as SVG** (rebuilt against the kit's stroke / radius / token system — that is part of the visual-debt batch, not the screenshot batch). The terminal showcases, the Desktop Bridge plugin mock, and the parity-check mock on `first-component.astro` should be **replaced with real screenshots** in the screenshot batch.

---

## Batches

Each batch is independent enough to ship between sessions. Run them in order — earlier batches reduce later batches' scope. ~45-90 min each.

### Batch 1 — Shell baseline: skip link, focus token, footer, semantic landmarks

**Why first.** Site-wide a11y + the missing footer have to land before any page renumbers them.

- [x] **B1.1 Add skip-link.** `BaseLayout.astro` after `<body>` (line 170): `<a href="#main" class="docs-skip-link">Skip to content</a>`. Add `id="main"` to `<main class="docs-main…">` (line 410). Style `.docs-skip-link` in `global.css` per brand-guide focus rules. **Done when** Tab from address bar surfaces a focused "Skip to content" link, Enter jumps to first heading.
- [x] **B1.2 Define `--ui-focus-ring`.** Add to `docs-theme.css` `:root`: `--ui-focus-ring: 0 0 0 2px var(--ui-color-surface), 0 0 0 4px var(--ui-color-primary);`. Replace ad-hoc `outline: 2px solid var(--ui-color-primary)` in `global.css` (lines 599, 921, 1428) with `box-shadow: var(--ui-focus-ring); outline: none`. **Done when** `:focus-visible` on every interactive element shows the double ring on light + dark.
- [x] **B1.3 Add `<Footer />` component + render.** Create `docs/src/components/Footer.astro` matching `landing.jsx` 246-257; render in `BaseLayout.astro` inside `.docs-shell` after `<main>`. Copy: `© 2026 Dominik Pieper · MIT · Teaching artifact`, links to GitHub, `/llms`, `/components`, `/workshop`. **Done when** every page renders the footer.
- [x] **B1.4 Reduced-motion global.** Append `@media (prefers-reduced-motion: reduce) { :root { --ui-duration-fast: 0ms; --ui-duration-normal: 0ms; --ui-duration-slow: 0ms; } * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; transform: none !important; } }` to `global.css`. **Done when** macOS "Reduce motion" disables the pulse + hover translates.
- [x] **B1.5 Theme-toggle a11y.** `BaseLayout.astro` line 198 — add `aria-pressed={theme === 'dark'}` (compute on the server from current state) and update in JS handler line 469. **Done when** screen readers announce "Toggle theme, pressed" / "not pressed".

**Success criterion for B1:** axe-core run on `/` yields zero new violations; tab-from-address-bar reaches skip-link.

### Batch 2 — Shared chrome primitives (extract first wave)

Extract the components every other batch will depend on. No page edits yet, just new files + Storybook-style smoke check.

- [x] **B2.1** Create `docs/src/components/SectionHead.astro` with `eyebrow / title / sub / align` props.
- [x] **B2.2** Create `docs/src/components/CodeCard.astro` (mono lang strip + Copy + body slot). API matches the inline pattern on `index.astro` 134-162. Includes `aria-live="polite"` on the "Copied" state.
- [x] **B2.3** Create `docs/src/components/Pill.astro` + `PillGroup.astro` with `role="tablist"` + `aria-pressed` baked in.
- [x] **B2.4** Create `docs/src/components/Callout.astro` (`tone` prop, lucide-style icon, no emoji). Migrate the `--ui-color-primary-tint-6` token defined here.
- [x] **B2.5** Create `docs/src/components/CompCard.astro` matching `landing.jsx` 204-218: anchor wrapper, mono icon glyph, name, desc, fw-dots with proper `aria-hidden` + visually-hidden label.
- [x] **B2.6** Update `Icon.astro` to also accept lucide-style names used by the kit (`figma`, `book`, `sparkles`, `arrow`, `terminal`, `schedule`, `search`, `moon`, `sun`, `github`). Today the file only re-exports material-symbols; the kit uses lucide. Pull lucide-static or hand-port the 9 paths from `landing.jsx` lines 6-15.

**Success criterion for B2:** new components compile, no usages yet (added in later batches), `pnpm exec astro check` passes.

### Batch 3 — Voice + casing pass (site-wide)

Pure copy edit. No structural changes.

- [x] **B3.1** Convert all `<h2>` / `<h3>` to sentence case. Specific known offenders:
  - `agent-skills.astro` 69, 114, 155, 175 — `Discovery Endpoints` → `Discovery endpoints`, etc.
  - `storybook.astro` 68, 102, 124 — `MCP Server`, `Framework Parity`, `Endpoints` → sentence case.
  - `llms.astro` 109, 119, 146, 162, 174 — `What is llms.txt?` → `What is llms.txt`, `The Files` → `The files`, `How to Use It` → `How to use it`, `Why Plain Text?` → `Why plain text`, `Preview` (already OK).
  - `tutorial.astro` 312, 476, 485, 503, 537 — `The Workflow` → `The workflow`, `Example Prompt` → `Example prompt`, `Generated Output` → `Generated output`, `Run it` (already OK), `figma-console MCP — Tools Used` → `figma-console MCP — tools used`.
  - `accessibility.astro` 192 — `What's still your job` (already OK).
  - `install.astro` 240 — `What's included` (already OK).
  - `index.astro` 187 — `Get Started` → `Get started`. Section text + heading.
- [x] **B3.2** Drop emojis in `BottomNav` data and elsewhere. List of files (15+ instances): `accessibility.astro` 234-236, `agent-skills.astro` 200-202, `tokens.astro` 260-262, `install.astro` 253-255, `figma-token.astro` 330-332, `figma.astro` 385-387, `claude-md.astro` 222-224, `skills/figma-workspace-architect.astro` 269-271, `agent-skills.astro` 59 (💡), `llms.astro` 100 (💡), `patterns.astro` 56 (🧩), `ComponentDetail.tsx` 580 (✨), `ComponentGallery.tsx` 44, 87, 120 (🔍, 🧩), `Search.tsx` 108 (🔍), `McpExplorer.tsx` 404, 500 (💡). Replace with `Icon` component or remove. Update `BottomNav.astro` to drop the `emoji` prop entirely once all callers migrate.
- [x] **B3.3** Drop the `⏱` clock glyph in `PageEyebrow.astro` 27 — replace with `Icon name="schedule"` and `aria-hidden`. Same for `index.astro` 48, 54, 60.
- [x] **B3.4** Replace decorative `→` arrows in copy with the `Icon name="arrow-right"` component (`storybook.astro` 61, `index.astro` 35, 51, 57, 63, 80, 89, 98, `agent-skills.astro` 163, `patterns.astro` 84, `figma.astro` 73, `workshop.astro` 102, 109). Keep `→` in code-comments and diagrams (semantic, not decorative).
- [x] **B3.5** Replace `'✓ copied'` button text with `'Copied'` in `prompts.astro` 253 and `llms.astro` 192.
- [x] **B3.6** Drop the `✦` decorative glyph on `index.astro` 19 — fold into pill eyebrow style without it (matches kit).
- [x] **B3.7** Replace SaaS-marketing copy:
  - `index.astro` 25: `Workshop in a box.` → drop. Subtitle becomes the kit-spec exact tagline `Design in Figma. Explore in Storybook. Ship with AI.`
  - `index.astro` 187: `Get Started` heading → `Scaffold a workspace.` (matches kit `cta-title`).
  - `tutorial.astro` 162-163: `What you'll learn` is fine; `Before you start` is fine.
  - `mcp.astro` 21-22: rephrase `New to MCP?` aside to drop the question mark + bold trick. Use the brand recurring phrase `inspect → prompt → ship → iterate` near the lede.
  - `index.astro` 24-28: keep `Design in Figma. Explore in Storybook. Ship with AI.` as the literal sub.
- [x] **B3.8** Audit recurring brand phrases. At least one occurrence each on the home + nearest doctrinal page:
  - `Tokens, not utilities.` — `tokens.astro` page lede.
  - `Composition over configuration.` — `patterns.astro` callout (replaces the existing 🧩 box).
  - `Predictable APIs across frameworks.` — `design-principles.astro` lede.
  - `ARIA-first.` — `accessibility.astro` stance section.
  - `inspect → prompt → ship → iterate` — `index.astro` pillars section + `mcp.astro` lede.
  - `single source of truth` — `figma.astro` and `figma-token.astro`.
  - `teaching artifact` — `index.astro` disclaimer + `accessibility.astro` reporting section.

**Success criterion for B3:** every grep query in "Voice / copy debt — global rules" returns zero hits in the four `pages/` files most exposed (`index`, `tutorial`, `accessibility`, `agent-skills`); the recurring-phrases grep returns the expected ≥1 hit per phrase.

### Batch 4 — Token + theme cleanup

Pure CSS work.

- [x] **B4.1** Drop `--ui-color-brand-development` from the wordmark gradient. Edit `docs-theme.css` 84 (`--docs-hero-gradient-end`) so it falls back to `--ui-color-primary` only. Edit `global.css` `.docs-hero-wordmark` definition to use solid `--ui-color-primary` not the gradient.
- [x] **B4.2** Add `--ui-color-primary-tint-6`, `--ui-color-primary-border`, `--ui-shadow-card-hover` (light + dark) to `docs-theme.css`.
- [x] **B4.3** Add hero crosshair grid + radial glow as a single `.docs-hero-bg` utility in `global.css` with token values matching `landing.css` 54-62. Drop the duplicate `.docs-hero-glow-2` (redundant second glow is not in the kit).
- [x] **B4.4** Delete the `linear-gradient(135deg, rgba(0,100,112,0.15)…)` icon background on `.docs-component-card-icon` (`global.css` ~830) — kit uses solid `--ui-color-primary-light` (mono icon glyph, no gradient surround).
- [x] **B4.5** Audit `radii` usage — kit canon: cards `lg`, buttons/chips/inputs `md`, pills `full`, status badges `sm`. Today the docs use `--ui-radius-md` for cards (`global.css` `.docs-feature-card`, `.docs-component-card`). Bump card radius to `--ui-radius-lg` everywhere.
- [x] **B4.6** Inline-style sweep: extract the most-duplicated inline patterns into reusable utility classes:
  - `.docs-callout` (light tint + 1px border tinted) — replaces 5 hand-rolled `color-mix` callouts.
  - `.docs-pill-tag` (mono, surface-sunken, border, sm radius) — replaces inline pattern in `pillar`/`patterns`.
  - `.docs-mono-tag` for the version-pill style on `llms.astro` 92.

**Success criterion for B4:** color-grep returns zero hardcoded teal hexes outside SVG diagrams; `--ui-radius-md` on `.docs-component-card` no longer matches.

### Batch 5 — Home page redesign against landing kit

Now that primitives + voice + tokens are clean, rebuild `index.astro` to match the kit.

- [x] **B5.1** Replace `docs-hero-v2` block with a `<PageHero />` invocation. Drop `docs-hero-glow-2` and the `✦`. Wordmark `Atelier` (sentence-case, the brand-guide explicitly capitalises `ATELIER` only when used as a label graphic — the kit uses `Atelier` with `letter-spacing: -0.04em`). Eyebrow becomes the live `Workshop · Component-driven UIs with AI` pill with `.dot`.
- [x] **B5.2** Replace the orient-strip cards (`index.astro` 44-66) with a single section that points at Workshop / Tutorial. Three pillars belong above this — the strip is redundant once pillars land.
- [x] **B5.3** Add the **Three pillars** section (`landing.jsx` 65-98) using new `Pillar.astro`. Copy: brand-guide tagline rhythm — three actions, three tools, one verb each. Use `inspect → prompt → ship → iterate` as the section sub.
- [x] **B5.4** Replace the `docs-mcp-row` block (lines 121-163) with the kit's MCP card pattern: `<SectionHead eyebrow="MCP setup" title="Three endpoints. One config." />` + `mcp-checklist` + `<CodeCard lang=".mcp.json">`. Drops the inline copy-button JS at the bottom (CodeCard owns it).
- [x] **B5.5** Replace the **Get Started** terminal showcase (lines 187-228) with the kit's `<CtaCard />` — gradient surface, single command-line + Copy. Drops the bespoke `docs-terminal` block entirely.
- [x] **B5.6** Drop the `docs-quicknav` grid (lines 231-269) — now redundant with footer + sidebar. Replace with a single line linking to `/components` if needed; or drop entirely.
- [x] **B5.7** Remove the entire `<style>` block at the bottom of `index.astro` (lines 272-420) — every selector belongs in `global.css` now or the new components own them.

**Success criterion for B5:** `index.astro` is < 150 lines and has zero `style="…"` attributes. Visual diff against `landing.css` matches at hero / pillars / MCP / CTA.

### Batch 6 — Components index + gallery against the kit

`/components` is the most visible page after `/`. Rebuild against `landing.jsx` 179-223.

- [x] **B6.1** Replace `ComponentGallery.tsx` rendering with `<CompCard />` Astro components. The React island stays for filtering state but the card is server-rendered — gallery becomes hybrid like the existing patterns.
- [x] **B6.2** Replace `CATEGORY_ICONS` emoji map with lucide-style icons. Drop `🔍` (search) and `🧩` (fallback).
- [x] **B6.3** Convert category pills + framework switcher to `<PillGroup />` + `<FwSwitcher />` with shared client store.
- [x] **B6.4** Adjust `comp-grid` minmax to `220px` (kit value) — currently `210px` in some spots.

**Success criterion for B6:** `/components` filter and search work, axe-core clean, no emojis.

### Batch 7 — Workshop / tutorial / first-component voice + chrome polish

Three connected pages, share patterns. Apply primitives.

- [x] **B7.1** `workshop.astro` — wrap each `docs-step-row` in a single semantic `<ol>`, replace inline `style=` on the prerequisites box (lines 106-126) with a utility class. Replace `docs-shortcut` block with `Callout` tone="tip".
- [x] **B7.2** `tutorial.astro` — sentence-case all `<h2 class="docs-section-title">`, drop inline `<h2 style={{…}}>` at lines 31, 52, 74 (use `SectionHead`). Replace `Example Prompt` / `Generated Output` / `Run it` headings with `Example prompt`, `Generated output`, `Run it`.
- [x] **B7.3** `first-component.astro` — replace the kata-step row layout with the workshop step-row pattern; sentence-case the `Optional —` heading.
- [~] **B7.4** All three pages — replace the framework-switcher tab strip with `<FwSwitcher />`.

**Success criterion for B7:** these three pages share one step-row primitive, one section-head primitive, one fw-switcher; no inline `<h2 style=…>`.

### Batch 8 — Reference pages voice + chrome polish

Apply primitives to `tokens`, `install`, `mcp`, `storybook`, `llms`, `agent-skills`, `claude-md`, `prompts`, `troubleshooting`, `figma`, `figma-token`, `accessibility`, `design-principles`, `patterns`, `a11y-workflow`, `skills/figma-workspace-architect`.

- [x] **B8.1** Replace each page's `<div style="margin-bottom: 2rem"><PageEyebrow /><h1 class="docs-page-h1">…</h1><p style="…">…</p></div>` with `<PageHero variant="page" eyebrow=… title=… sub=… />`. Roughly 15 pages, one component invocation each.
- [~] **B8.2** Replace each `<h2 class="docs-section-title">` + lede `<p style="…">` with `<SectionHead />`. ~60 sites.
- [x] **B8.3** Replace 💡 / 🧩 callouts on `llms.astro` 99-106, `agent-skills.astro` 56-63, `patterns.astro` 55-63 with `<Callout tone="tip">`.
- [~] **B8.4** Replace `docs-multi-code-tabs` framework selectors on `install.astro` 104-108, `prompts.astro`, `workshop.astro` with `<FwSwitcher />`.
- [x] **B8.5** `storybook.astro` 111-114 — replace `✅` / `⏳` glyphs with text or new `Icon name="check_circle"` / `Icon name="schedule"` (already in icon set).

**Success criterion for B8:** every page imports `BaseLayout`, `PageHero` (or eyebrow alone where intentional), and the right primitives — no bespoke header HTML; emoji-grep returns zero in `docs/src/pages` and `docs/src/components`.

### Batch 9 — Scoped diagram + SVG cleanup

The conceptual diagrams stay as SVG (these are not screenshot candidates). Rebuild against the kit's stroke / radius / token system.

- [x] **B9.1** `mcp.astro` flow diagram (lines 33-117) — verify all `class="diagram-node"` use the new `--ui-radius-lg` (14) not the inline 14 px hardcode (already consistent — sanity check).
- [x] **B9.2** `install.astro` 3-step flow (111-172) — replace `✓ ready to build` text with `<text>ready to build</text>` plus a non-text indicator already supplied by the green pill.
- [x] **B9.3** `figma.astro` token mapping (86-230) — sanity check stroke colours against the brand-guide; replace the 4 hardcoded teal-tint rectangles with `--ui-color-primary-light`.
- [x] **B9.4** `tutorial.astro` workflow diagram — same audit.
- [x] **B9.5** `a11y-workflow.astro` three-source Venn (~lines 280-345) and audit-loop (~360-440) and worked-example (~370-400) — same audit. Make sure `aria-hidden="true"` lands on the outer `<svg>` and that `figcaption` carries the description text (not duplicated by a hidden `<title>`).

**Success criterion for B9:** running with `prefers-reduced-motion` the diagrams render identically; axe-core a11y pass on each page reports zero new violations.

### Batch 10 — Mockup-to-screenshot workstream

Replace pure UI mockups with real screenshots from a running Storybook + the docs site itself.

- [x] **B10.1** Capture: terminal showcase on `/` (replace `docs-terminal` block with a screenshot of `npx create-atelier-ui-workspace` running locally — captured against macOS terminal in light + dark, via `prefers-color-scheme` swap).
- [⏸] **B10.2** Capture: preflight terminal mockup on `/workshop` lines 160-220 (and the failed-run twin) — same approach. The `<figure class="preflight-mock">` becomes `<figure><img srcset=…light, …dark></figure>`.
- [⏸] **B10.3** Capture: Desktop Bridge plugin panel screenshot for `figma-token.astro` (currently SVG mockup).
- [⏸] **B10.4** Capture: parity-check / target-frame compositions on `first-component.astro`.
- [x] **B10.5** Add `<picture>` + `prefers-color-scheme` swap helper as `Screenshot.astro` so every screenshot block uses one component (props: `srcLight, srcDark, alt, captionId`). Stored under `docs/src/assets/screenshots/`.

**Success criterion for B10:** the four mockup-y SVGs are gone from `pages/`; `Screenshot.astro` renders `<picture>` with theme-aware sources; lighthouse images-without-alt = 0.

### Batch 11 — A11y polish across the redone surface

Land after the redesign is in place so we're auditing the final surface.

- [x] **B11.1** Run `axe-core` (or pa11y-ci) against all routes. Triage to zero serious/critical.
- [x] **B11.2** Tab-order check on `/` and `/components` — confirm logical order through skip-link → topbar → search → main content → footer.
- [x] **B11.3** Screen-reader pass on `/components` (NVDA / VoiceOver) — confirm fw-dot label, "Available for Angular, React, and Vue" announces once, not three times.
- [x] **B11.4** Verify focus-visible double-ring lands on every link, button, pill, fw-switcher, and on the new `Skip to content` link.
- [x] **B11.5** Verify `aria-pressed` on theme toggle, `aria-current="page"` on sidebar links and topbar links (currently uses `.active` class only — visual but not announced).
- [x] **B11.6** Verify all decorative SVGs carry `aria-hidden="true"` and all informational SVGs carry `role="img"` + `aria-labelledby` pointing at `<title>` + `<desc>`.

**Success criterion for B11:** axe-core JSON output across all routes shows zero serious/critical violations. Lighthouse a11y ≥ 95 on `/`.

### Batch 12 — Final voice sweep + landing-kit visual diff

- [x] **B12.1** Re-run every grep from "Voice / copy debt — global rules". Fix remaining hits.
- [x] **B12.2** Verify all seven recurring brand phrases land at least once on the canonical pages.
- [x] **B12.3** Side-by-side visual comparison of `/` against `landing.jsx` rendered output. Capture screenshot pair, file deltas if any (typography rhythm, hover translates, gap proportions).
- [x] **B12.4** Re-run `pnpm exec astro check` — expect zero diagnostics.
- [x] **B12.5** Update `tasks/lessons.md` with anything that surfaced as a recurring trip-up during the redesign.

**Success criterion for B12:** the rendered `/` is visually equivalent to the landing kit at 1440×900 in light + dark; voice grep returns zero hits.

---

## Migration map — old index-only batches → site-wide plan

The previous index-only plan (`tasks/claude-design-prompt.md`) defined batches around the home page surface. They map onto the site-wide plan as follows:

| Old batch (index-only)          | Now folded into                                     |
|---|---|
| Voice / copy on `/`             | B3 (site-wide voice pass) + B5.1-B5.6 (home page rebuild) |
| Token cleanup on `/`            | B4 (site-wide tokens) + B5.7 (delete inline `<style>`)    |
| Hero rebuild on `/`             | B1.2 (focus token), B5.1 (PageHero on home), B4.3 (hero bg) |
| Three pillars on `/`            | B2.5 (`Pillar.astro` extract) + B5.3 (use it on home)     |
| MCP card on `/`                 | B2.2 (`CodeCard.astro` extract) + B5.4 (use it on home)   |
| Components grid on `/`          | B2.5 (CompCard) + B6.1 (gallery) + B5 (no grid on home)   |
| Scaffolder CTA on `/`           | B2 (`CtaCard.astro` extract) + B5.5 (use it on home)      |
| A11y polish on `/`              | B1 (shell a11y) + B5.* (per-section) + B11 (final pass)   |
| Final sweep on `/`              | B12 (site-wide final sweep)                              |

Net effect: every old home-page task survives, but folded into a shared primitive that is then re-applied across every other page. The home rebuild (B5) is now smaller because the primitives already exist (B2). Cost of going site-wide: B7-B11. Saved: every future page touch will reuse the primitives instead of duplicating them.

---

## Out of scope

- **Components library code** (`libs/{angular,react,vue,spec}/**`). The brand guide explicitly draws a wall around the docs-site styling — the component library has its own token export. Token edits land in `libs/react/src/styles/tokens.css` (the upstream that `docs/src/styles/tokens.css` re-imports). All visual work in the docs lives in `docs/src/styles/docs-theme.css` — not the imported tokens file.
- **Storybook chrome.** Storybook ships with its own theme; brand alignment of the Storybook explorer is its own workstream and is mentioned in the design-skill brief as a future kit. Out of this audit.
- **`og/` page generation.** Per-page Open Graph image generation (commit `fe8c093`) is brand-aligned at the OG-card level and is its own pipeline. Out of this audit.
- **Sitemap, RSS, robots.txt, llms.txt** generation. Those are content artifacts, not visual surfaces.
- **Mobile keyboard nav under the bottom-nav.** The current `BottomNav` placement covers the bottom 56 px of the viewport on mobile; revisiting that interaction is in the brand-guide's "future iterations" bucket — out of this redesign.
- **Mark vs wordmark.** The brand guide notes the logo is `pen + brush + capital A`. Replacing the current PNG with an SVG version is blocked on the user-supplied SVG (not in the skill assets). Track separately.
