# Plan #8 — Schulungsmaterial Review Closure

Snapshot of where each P1/P2 item from the 2026-04-26 review
(`~/.claude/plans/du-bist-ein-top-dapper-gem.md`) stands as of 2026-04-28.
Verified by reading the actual files; line refs cite current head.

## P1 — High-impact

| # | Item | Status | Where |
|---|---|---|---|
| P1-1 | Workshop learning objectives + prerequisites box | ✓ shipped | `workshop.astro:73-92` (`.objective-box` two-col with "What you'll learn" + "Before you start") |
| P1-2 | Tutorial introduces MCP without mental model | ✓ shipped | `tutorial.astro:220-…` ("What's an MCP, in 30 seconds?" section) |
| P1-3 | `/patterns` SSG vs island shell | ✓ shipped | Cookbook P3 round shipped 6 per-pattern detail pages at `patterns/[id].astro` (`getStaticPaths` + full SSG content); the `/patterns` index keeps the live React-island demos for browse-the-gallery, but per-pattern deep content is fully static |
| P1-4 | Preflight mock shows only success | ✓ shipped | `workshop.astro:155-219` two tabs (`Successful run` / `Failed run`); failed mock has realistic ✗-Zeile + fix-suggestion lines |
| P1-5 | Homepage "first 5 minutes" path | ✓ shipped | `index.astro:43-66` `.docs-orient-strip` with three time-budgeted cards (Read · 5 min / Run · 25 min / Build · 30 min) |
| P1-6 | Type hierarchy collapses on h3 | ✓ shipped | `global.css:539` canonical `.docs-h3` utility, used across all step-pattern pages |
| P1-7 | WCAG-AA contrast for muted-text | ✓ shipped | `--ui-color-text-muted: #475569` (light) / `#94a3b8` (dark) in `tokens.css` and `docs-theme.css`. Phase 5 axe re-run on 2026-04-28 confirmed the muted-text bucket cleared (239 → 11 → 0 after the chip-class fix) |
| P1-8 | Workshop "What gets created" mobile | ✓ shipped | `workshop.astro` table uses `.docs-props-table` which has the 768 px stacking rule in `global.css` |

## P2 — Substantial

| # | Item | Status | Where |
|---|---|---|---|
| P2-1 | Tutorial "Run it" section | ✓ shipped | `tutorial.astro:501` `<section id="run-it">` with framework-tabbed Save / Dev-command / Expected outcome |
| P2-2 | Time eyebrow per training page | ✓ shipped | `<PageEyebrow>` component used across `workshop`, `tutorial`, `figma`, `figma-token`, `first-component`, `install`, `patterns`, `prompts`, `a11y-workflow`, `troubleshooting` |
| P2-3 | README ↔ Workshop sync | ✓ shipped | `workshop.astro:95-103` `.docs-shortcut` aside ("Already cloned the repo? Skip to Step 03") |
| P2-4 | `figma.astro` ↔ `figma-token.astro` page-pair | ✓ shipped | Page-pair callout pattern (`.docs-pagepair`) added in commit `7428902`, links the two and `/tutorial`/`/figma` symmetrically |
| P2-5 | Jargon-tooltip front-loading in tutorial | ✓ shipped | First prose mentions wrapped on first occurrence (`MCP`, `node-id`, `boundVariables`, `tree-shakeable`, `JSON-RPC`); rest are bare so cognitive load is staggered |
| P2-6 | Without MCP / With MCP comparison | ✓ shipped | `tutorial.astro:183-…` `.mcp-compare` two-column with concrete time estimates (~12 min vs ~90 sec) |
| P2-7 | "Stuck?" exit-paths | ✓ shipped | Every training page ends in `<HelpFooter>` + a `<BottomNav>` whose first item links `/troubleshooting`; many pages also have inline troubleshooting deep-links |
| P2-8 | Hero wordmark differentiation | ✓ shipped | `index.astro:24-30` hero subtitle reads "A component library for Angular, React and Vue — designed for AI-assisted development" with the required "Teaching artifact · not a production library" disclaimer below |
| P2-9 | figma-console MCP coverage workshop ↔ tutorial | ✓ shipped | `figma-console` is registered in the workshop's MCP-config block alongside the three `storybook-*` servers — attendees following the workshop have it ready when they hit `/tutorial` |

## Conclusion

All 8 P1 and 9 P2 recommendations from the review are shipped. The
review served as a planning artifact; the actual fixes landed across
~10 commits between 2026-04-26 and 2026-04-28 (`7428902`, `837f448`,
`b4e7911`, `8af5f24`, `ec26c77`, plus the cookbook P3 detail-pages
work, plus the today's a11y sweep that addressed P1-7).

No remaining work from #8.
