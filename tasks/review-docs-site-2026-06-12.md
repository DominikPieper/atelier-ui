# Docs Site Review — atelier.pieper.io (2026-06-12)

Full content + design review of all 57 routes. Method: 7 content reviewers (Opus) over source clusters verified against `libs/spec`, `tokens.css`, `CLAUDE.md`, ADRs and the live Figma file; 4 design reviewers (Opus) over 85 Playwright screenshots (57 routes desktop-light, 14 core pages also dark + 390px mobile); link check + SEO sweep (Haiku); every P1/P2 finding survived an independent skeptic refute-pass (Sonnet). 48 raw content findings → 34 confirmed; 14 raw design findings → 6 confirmed; 6 refuted findings discarded.

## Executive Summary

The site's structure, writing quality and visual system are strong — the confirmed issues are almost all *drift*, not bad design. The dominant failure mode is hardcoded facts that fell behind ground truth: the radius token scale was bumped in `tokens.css` but two reference pages still teach the old values, and counts (components, Figma pages, skill references, file sizes) are stale in at least eight places. The second systemic problem is invented API surface: five code examples/notes use props that don't exist (`tooltip`/`position`, `autoResize` on Input, `closeOnEscape`, Angular `label`, signal `.read()`) — fatal for a site whose pitch is "prompts that produce correct code on the first try". Third, the docs repeatedly overclaim what the hosted Storybook MCP can do (preview/test tools, Angular/Vue prop data). Visually, one pattern preview is genuinely broken (Data List) and the button/badge demos misrepresent the components by stretching them full-width; everything else is polish.

**Totals: 12 × P1 · 26 × P2 · 15 × P3.**

## P1 — Factually wrong / breaks the learner flow

| # | Page | Finding | Where | Fix |
|---|------|---------|-------|-----|
| 1 | `/tokens` | Border-radius scale documents the pre-bump values (sm 0.375 → actual 0.5rem, md 0.5 → 0.625, lg 0.75 → 0.875, xl 1 → 1.25) | `docs/src/pages/tokens.astro:66-72` | Update `radii` array to current `tokens.css` values |
| 2 | `/claude-md/` | All three CLAUDE.md templates ship the same stale radius values — drop-in deliverable propagates wrong tokens into user projects | `claude-md.astro:56,97,133` | Same fix as #1, three places |
| 3 | `/` (home) | Claims hosted Storybook MCPs expose `preview-stories` and `run-story-tests` — hosted surface is docs-toolset only; `/mcp/` contradicts it on the same site | `index.astro:120` | Correct tool list to docs toolset; note dev/test need local addon-mcp |
| 4 | `/install/` | "LlmAvatarGroup is a React-only composition helper" — false; Angular and Vue both export it (Vue's own import list on the same page includes it) | `install.astro:81` | Remove claim |
| 5 | `/prompts/` | Chat prompt instructs `LlmInput` with `autoResize` — that prop exists only on `LlmTextarea`; page promises "correct code on the first try" | `prompts.astro:36` | Use `LlmTextarea` with `autoResize` |
| 6 | `/components/tooltip/` | Code example uses non-existent props `tooltip`/`position`; copy-paste yields a tooltip that never renders | `data/components.ts:814-819` | Rewrite with real `llmTooltip`/`llmTooltipPosition` API |
| 7 | `/components/menu/` | Code example is an incoherent hybrid that compiles in no framework | `data/components.ts:683-690` | Replace with real `LlmMenuTrigger` render-prop pattern from stories |
| 8 | `/patterns/settings-page` | Angular snippet uses a `label` prop the Angular `LlmInput` doesn't have — silently ignored when copied | `data/patterns.ts:130-132` | Render label explicitly, or add the prop to the adapter (parity decision) |
| 9 | `/patterns/confirmation-dialog` | a11y note invents `closeOnEscape={true}` prop with a default | `data/patterns.ts:518` | Describe the native `<dialog>` cancel mechanism instead |
| 10 | `/figma` | File described as "two pages (Tokens + Components)" — the actual file has 6 pages | `figma.astro:46-65` | Describe real page set, or state the simplification explicitly |
| 11 | `/skills/figma-workspace-architect` | "13 references" but the skill ships 16; the 3 missing files are linked nowhere | `…architect.astro:71-85,101,124` | Add inventory-generation/inventory-payload/sync-workflow rows, bump counts |
| 12 | `/patterns/data-list` (+ `/patterns` index) | **Visual:** live preview renders broken — titles wrap one word per line in a squeezed column, "View" buttons stretch ~330px, rightmost button clips past the card edge at 1440px | `patterns--data-list__desktop-light.png` | Fix preview row grid: content column `flex:1`, action column intrinsic width |

## P2 — Confusing / inconsistent / notable quality issues

**Hosted-MCP capability overclaims** (same root cause as P1 #3):
- `/mcp/` diagram labels Angular/Vue hosted nodes "docs · props · stories" — only React emits `components.json` (`mcp.astro:86,96,106`)
- `/claude-md/` Angular/Vue templates tell Claude to fetch prop docs the Angular/Vue surface doesn't serve — add the React-MCP/`libs/spec` fallback (`claude-md.astro:74-78,115-119`)
- `/design-principles` Principle 5 names five conceptual tools (`get_component_docs` …) a participant won't find on the real MCP (`design-principles.astro:155-158`)

**Stale counts / sizes**:
- `/llms/` component count 24 vs actual 28, and file sizes "~2 KB / ~12 KB" vs real ~4.7 KB / ~79 KB (6.5× off — misleads context budgeting) (`llms.astro:43,79,119-120`)
- `/figma` component table implies ~18 of 27 sets; LlmButton "3 variants" (spec: 4); LlmInput "3 types" (spec: 6); "56 variables" matches no source and the "full list in tokens.css" pointer contradicts its own sub-counts (`figma.astro:251-274,57-58,230`)
- `/skills/figma-workspace-architect` "3 sub-modes" — skill has 4 (`…architect.astro:36-39,124`)

**Invented/wrong API details** (lighter siblings of the P1 cluster):
- `/install/` Vue note "No Provider component" but Vue exports `LlmToastProvider`; Angular import list omits `LlmAvatarGroup` while React/Vue include it (`install.astro:71,82`)
- `/components/toast/` selector + example are React/Vue-only; Angular uses `LlmToastService`, not `useLlmToast` (`data/components.ts:836-855`)
- `/patterns/settings-page` attributes Tabs keyboard handling to CDK `FocusKeyManager` — it's hand-rolled (`data/patterns.ts:476`)
- Glossary "signal input" claims a non-existent `.read()` method on Angular signals (`data/glossary.ts:57`)
- `/accessibility` references non-existent token `--ui-color-focus-ring` (actual: `--ui-focus-ring`) (`accessibility.astro:183`)

**Framework-switcher gaps** (all 28 component detail pages):
- Code example is always React/JSX regardless of selected framework (`ComponentDetail.tsx:452`)
- "Explore in Storybook" always links `storybook-react` (`ComponentDetail.tsx:564`) — build URL from active framework

**Other content**:
- `/workshop` preflight mock checks the stdio nx-mcp server as an HTTPS URL — not reachability-checkable (`workshop.astro:191,235`)
- `/first-component` hero "Five copy-paste steps" vs six numbered steps (`first-component.astro:63`)
- `/mcp/` deep link `/storybook/#toolset-configuration` has no matching id (`mcp.astro:27`)
- `/schulung/` requires Node 20 *or* 22, contradicting `engines` and `/troubleshooting` (Node 22 only); mentions pnpm though npm is pinned (`schulung.astro:55`)

**Design**:
- H1s use three inconsistent treatments (teal+serif-accent / plain teal / near-black) with no rule — even pages sharing the REFERENCE eyebrow split between styles. Define an explicit H1 rule per section type.
- Button + Badge demos stretch components full-width: Primary button reads as a banner, badges as bars — directly contradicts the page's own "small inline label" copy and hides the size-variant scale. Likely one shared demo-container CSS fix (`align-items: stretch` → flex-wrap row, hug content).
- Pattern pages' "When not to use" danger tint (5% color-mix) is imperceptible in dark mode — do/don't semantics lost on every `/patterns/<id>` page. Raise mix to ~12-15% in dark or use alpha-based tint like `.docs-comparison-bad`.

## P3 — Polish (pass-through, unverified)

- `/mcp/` writes "figma-console MCP" without the literal `-mcp` suffix used elsewhere
- `/first-component` kata prompt tells Angular/Vue users to look up props the hosted MCP won't return; default framework-tab order differs across the three how-to pages
- Skill version badge hardcoded 0.2.0 vs package.json 0.2.44; `/agent-skills/` also says "13 references" (16)
- `/accessibility` keyboard map uses generic names amid `Llm*`-prefixed copy
- Angular CDK details leak into framework-agnostic descriptions (menu/tooltip/drawer in `components.ts`)
- `/patterns/confirmation-dialog` a11y note quotes a "Delete permanently" label no snippet uses
- `/patterns/settings-page` vertical-tabs variation implies `variant="pills"` produces side-tabs (no orientation axis exists)
- `/a11y-workflow` describes Chrome MCP via `claude --chrome` + `mcp__claude-in-chrome__*` — clarify it's harness-provided, not a project `.mcp.json` server
- Design: component detail pages open with preview badge "React" while API table defaults Angular (one shared framework state would fix); dark-mode NEW badge hue collides with primary teal accent; `/patterns` index column narrow with dead right whitespace; dark-mode home CTA body copy low-contrast on bright-teal block

## Known / accepted issues (not findings)

- Inline SVG mockups stand in for real screenshots on ~7 pages (tracked, intentional)
- OG image endpoint stubbed — falls back to logo site-wide (tracked)
- `/schulung/` is deliberately German (training curriculum)

## Refuted in verification (discarded)

- "Figma sections labeled P0/P1/P2" — actual file uses category sections
- "MCP setup points at `.claude/settings.json`" — page correctly uses `.mcp.json`
- "Broken external link on `/figma-token`" — link resolves (reported twice)
- "Code blocks overflow on mobile" — containers stay within 390px viewport
- "Primary button renders grey, not teal" — renders teal in both themes

## Recommended fix order

1. **Token-value drift** (P1 #1, #2): one value-set, three files — quick, highest damage-per-character since users copy these into their own projects.
2. **Invented props** (P1 #5–#9, P2 API cluster): each is a small text/data edit in `components.ts`/`patterns.ts`/`prompts.astro`; breaks the site's core promise.
3. **Data List preview** (P1 #12): single CSS grid fix, visible on two pages.
4. **Hosted-MCP overclaims** (P1 #3 + P2 cluster): align homepage/diagram/templates with the `/mcp/` aside that already gets it right.
5. **Counts drift** (P1 #10, #11 + P2 cluster): fix values now; consider deriving counts at build time (component count from `components.ts`, llms.txt sizes from the files, skill version from package.json) or adding a drift gate — this class will recur otherwise.
6. **Framework-switcher gaps + demo stretching + H1 rule + dark-mode tint** (P2 design/UX): batch as a docs-polish pass.

## Artifacts

- Screenshots: `tmp/review-shots/*.png` (85 files, 57 routes; core pages in dark + mobile)
- Raw verified findings: `tmp/review-shots/content-findings.json`, `tmp/review-shots/design-findings.json`
- Workflow runs: `wf_a86c6694-285` (content, 47 agents), `wf_accb8162-7e3` (design, 12 agents)
