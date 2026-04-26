# Composition Cookbook — Plan (2026-04-26)

Roadmap item: *Phase 5 → Composition cookbook (6 pre-composed patterns as
documentation + Storybook stories).* Most scaffolding is already shipped;
this plan closes the remaining gaps and turns the cookbook from a static
gallery into something both humans and agents can pull from.

## State of play

| Surface | Status | Notes |
|---|---|---|
| Storybook stories per framework | ✅ Shipped | `libs/{angular,react,vue}/src/lib/cookbook.stories.{ts,tsx}` — all 6 patterns wired with live state. Angular file is 1295 lines, React 769, Vue 576 — Vue is the thinnest. |
| Pattern data file | ✅ Shipped | `docs/src/data/patterns.ts` — `PatternMeta` shape (id, num, title, description, tags, angular/react/vue code). |
| `/patterns` docs page | ✅ Shipped | `docs/src/pages/patterns.astro` + `docs/src/components/PatternsPage.tsx` (live React-island demos for each). |
| MCP simulator entry | ✅ Shipped | Patterns mentioned in `docs/src/components/McpExplorer.tsx` *content* but not as a tool. |
| MCP server tool | ❌ Missing | Real Storybook MCP at `atelier-ui.netlify.app/storybook-*/mcp` exposes 5 component-level tools — none surface cookbook patterns. |
| CLAUDE.md template (preset) | ❌ Missing | Scaffolded workspaces don't tell the agent the cookbook exists. |
| Variations / a11y / pitfalls per pattern | ❌ Missing | `description` is one sentence; no "when not to use", a11y notes, or alt compositions. |
| Smoke tests on cookbook stories | ❌ Missing | No `play` functions; rendering regressions wouldn't be caught. |
| Light + dark visual snapshot | ❌ Missing | Overlaps with the still-open *Storybook visual check* todo. |

## Identified gaps (ordered by leverage)

1. **Story ↔ snippet drift risk.** `patterns.ts` snippets are intentionally
   simplified. They diverge from `cookbook.stories.*` over time. An agent
   that reads `patterns.ts` can produce code that doesn't match what the
   live demo shows. No build-time check enforces parity.
2. **No agent-discoverable pattern catalog.** The 5 MCP tools all operate
   at the component level. Agents can't ask "show me a settings page
   pattern" and get one back.
3. **Shallow per-pattern docs.** Each pattern has a single sentence and a
   tag list. Missing: when to use / when not to use, a11y notes, common
   mistakes, alt compositions.
4. **Preset CLAUDE.md doesn't mention cookbook.** Workshop attendees never
   learn the patterns exist unless they browse the docs site.
5. **No smoke tests.** A breaking change to `LlmCard` could silently
   break all 6 patterns.
6. **Vue cookbook is the thinnest.** 576 lines vs Angular 1295 — likely
   missing some demos or has shorter implementations.

## Proposed work

### P1 — Parity check (small, blocking the rest) — ✅ Shipped 2026-04-26

Added `tools/scripts/check-cookbook-parity.mjs`:

- Reads `docs/src/data/patterns.ts` (regex-extracts `id`, `num`, `tags[]`
  per pattern; asserts 6 patterns).
- Reads each `libs/{fw}/src/lib/cookbook.stories.*`, splits by
  `// N. Title` markers into 6 sections per framework.
- Per pattern × framework: scans the section for `Llm[A-Z]\w*`
  identifiers, normalizes sub-components → parents via
  `SUBCOMPONENT_MAP` (e.g. `LlmCardHeader` → `LlmCard`, `LlmTd` →
  `LlmTable`), then compares against `tags[]`.
- Two severities so cross-framework story drift doesn't gate CI on
  unrelated catalog changes:
  - **fail**: `[MISSING]` — tag declared, no framework references it.
  - **fail**: `[EXTRA]` — every framework uses a component but it's
    absent from `tags[]`.
  - **warn**: `(DRIFT)` — some frameworks use it, others don't.
- Wired as `npm run check:cookbook` and added to the CI **Sync checks**
  job (alongside `check-sync`, `sync-spec`, `check-docs-sync`,
  `gen-llms-txt --check`). Skipped the Nx target wrapper to match the
  existing pattern; all sync scripts are invoked directly from CI.

Initial run surfaced **18 raw drift findings → 3 hard fails** after the
fail/warn split. Hard fails fixed by adding tags to `patterns.ts`:
- `settings-page` → `+LlmAlert`.
- `notification-center` → `+LlmButton`.
- `management-dashboard` → `+LlmButton`.

**Remaining 8 warnings** (logged for P2):
- *Confirmation Dialog* — Angular story uses `LlmAlert` ("This action
  cannot be undone" warning); React + Vue stories don't.
- *Data List* — Angular story includes `LlmMenu` + `LlmTooltip` for the
  per-row "..." action; other frameworks don't.
- *Management Dashboard* — Vue story is significantly broader than
  Angular/React (uses Input, Select, Toggle, Dialog, AccordionGroup),
  inverse of the line-count gap. Suggests Vue inlined extra examples in
  one section. Confirms P2 is real but in the opposite direction
  expected — not "Vue is thinner" but "Vue is denser in dashboard
  while thinner overall".

Outcome: catalog ↔ story parity is now mechanical. Future cookbook
edits will fail CI if `patterns.ts` and the live stories disagree.

### P2 — Framework equalization across patterns — ✅ Shipped 2026-04-26

P1 surfaced 3 real cross-framework drifts (after fixing a section-end
bug in the parity script — Vue's `Storybook Meta & Stories` block was
bleeding into section 6 and producing 5 false positives on the
dashboard pattern). The remaining drifts were:

1. **Confirmation Dialog** — Angular dialog content had
   `<llm-alert variant="warning">This action cannot be undone.</llm-alert>`
   inside `LlmDialogContent`; React + Vue rendered a plain explanatory
   paragraph with no Alert composition.
2. **Data List with Actions** — Angular per-row "..." button used
   `LlmTooltip` for hover affordance and `[llmMenuTriggerFor]` to open
   an `LlmMenu` (Edit / Duplicate / Delete + separator); React + Vue
   rendered an inert "..." button.

Equalization direction was *enrich React + Vue* rather than *trim
Angular*, because the Angular composition demonstrates more of the
library and the cookbook is a teaching surface.

Changes:

- `libs/react/src/lib/cookbook.stories.tsx`
  - Added `LlmMenu` / `LlmMenuItem` / `LlmMenuSeparator` /
    `LlmMenuTrigger` / `LlmTooltip` imports.
  - Confirmation dialog now wraps an `<LlmAlert variant="warning">`
    above a smaller explanatory paragraph in `LlmDialogContent`.
  - Data list "View" button wrapped in `LlmTooltip`. The "..." button
    wrapped in an `LlmMenuTrigger` with a render-prop child that
    forwards `ref` + `onClick`, plus an inner `LlmTooltip` for hover
    affordance. Menu uses the same `compact` variant + items as the
    Angular story.
- `libs/vue/src/lib/cookbook.stories.ts`
  - Added `LlmMenu` / `LlmMenuItem` / `LlmMenuSeparator` /
    `LlmMenuTrigger` / `LlmTooltip` imports.
  - Confirmation dialog template gains the same
    `<LlmAlert variant="warning">` + paragraph composition; story's
    `components: {…}` registration extended with `LlmAlert`.
  - Data list template uses `<LlmMenuTrigger>` with the `#trigger` /
    `#menu` slot pattern from the Vue Menu story; story registration
    extended with the 5 added components.
- `docs/src/data/patterns.ts`
  - `data-list` `tags[]` adds `LlmMenu` and `LlmTooltip`.
  - `dataListAngular` / `dataListReact` / `dataListVue` snippets
    rewritten to mirror the richer composition (each shows a per-row
    `LlmTooltip` + `LlmMenuTrigger` action menu with the same items).

Parity script tweak:

- `splitStoryByNum` now treats `// Storybook Meta & Stories` and
  `// Shared inline styles` headers as section terminators, so the last
  numbered pattern's section never absorbs the meta block. This was
  responsible for the inverted "Vue dashboard is denser" reading from
  P1.

Verification (all green):

- `node tools/scripts/check-cookbook-parity.mjs` — 6/6 patterns ✓, no
  hard fails, no drift warnings.
- `nx run-many -t lint -p react,vue` — 0 errors (29 pre-existing
  jsx-a11y/aria-role warnings, none in cookbook stories).
- `nx run-many -t test -p react,vue` — 247/247 across 29 test files.
- `nx build docs` — 49 pages rendered.

Outcome: cookbook compositions are now equivalent across the three
frameworks. P3 (per-pattern detail pages) and P4 (JSON manifest) can
proceed against a stable, parity-checked catalog.

### P3 — Per-pattern detail pages

Two viable shapes:

- **A. Dynamic route** `docs/src/pages/patterns/[id].astro` — one page
  per pattern, deep content (when-to-use, a11y notes, pitfalls,
  variations, the full code).
- **B. Inline expansion** on `/patterns` — per-card `<details>` blocks
  with the deep content.

Recommend **A** because:
- Better URLs for agents to cite (e.g. atelier-ui.netlify.app/patterns/login-form).
- Keeps `/patterns` scannable.
- Each page can ship its own Open Graph / docs sidebar entry.

Each detail page contains:
- Tag list (component links).
- "When to use" / "When not to use" (2–3 bullets each).
- A11y considerations (focus order, ARIA, screen reader behavior).
- Common mistakes (what an LLM tends to get wrong).
- Variations (1–2 alt compositions).
- Full code (3 framework tabs) — sourced from `patterns.ts` via the
  parity script so the simplified vs full distinction is explicit.
- Storybook deep-link.

Extend `PatternMeta`:

```ts
interface PatternMeta {
  // existing
  id: PatternId; num: number; title: string; description: string;
  tags: string[]; angular: string; react: string; vue: string;
  // new
  whenToUse: string[];
  whenNotToUse: string[];
  a11yNotes: string[];
  pitfalls: string[];
  variations: { title: string; note: string }[];
}
```

### P4 — Expose patterns via MCP — ✅ Shipped 2026-04-26

Static JSON catalog generated from `patterns.ts` and served at
`https://atelier.pieper.io/.well-known/cookbook-patterns.json`
(neighbour of the existing `.well-known/mcp/server-card.json` and
`.well-known/api-catalog`).

- `tools/scripts/gen-cookbook-manifest.mjs` — Node + TypeScript
  Compiler API. Builds a top-level identifier symbol table for
  patterns.ts so the eval helper resolves snippet references
  (`loginAngular`, `settingsReact`, …) into the strings they point at.
  Asserts the `PATTERNS` array has 6 entries. Supports `--check` mode
  identical to `gen-llms-txt.mjs --check` so CI can fail on stale
  output.
- Output schema (committed at `docs/public/.well-known/
  cookbook-patterns.json`, ~15 KB):

  ```json
  {
    "version": "1",
    "site": "https://atelier.pieper.io",
    "patterns": [
      {
        "id": "login-form",
        "num": 1,
        "title": "Login Form",
        "description": "...",
        "url": "https://atelier.pieper.io/patterns#pattern-1",
        "components": ["LlmCard", "LlmInput", "LlmButton", ...],
        "frameworks": {
          "angular": "<llm-card variant=...>...",
          "react":   "<LlmCard variant=...>...",
          "vue":     "<LlmCard variant=...>..."
        }
      }
    ]
  }
  ```

- URLs use the existing `#pattern-N` anchor on `/patterns`. When P3
  ships the per-pattern detail pages, the URL field switches to
  `${SITE_URL}/patterns/${id}` — a one-line change in
  `gen-cookbook-manifest.mjs`.
- Wired as `npm run gen:cookbook-manifest` (write) and
  `npm run check:cookbook-manifest` (CI). The `--check` invocation is
  added to the `Sync checks` job.
- Verified: manifest written + read clean, `nx build docs` copies it to
  `dist/docs/.well-known/cookbook-patterns.json` (Astro static-asset
  passthrough, no plugin work required).
- A future `get_cookbook_pattern` MCP tool can read this URL directly
  without depending on Storybook addon support; tracked separately.

### P5 — Update preset CLAUDE.md

`libs/create-workspace/src/generators/preset/files/CLAUDE.md.template`
gets a new section:

> ## Composition patterns
> When composing multi-component flows (login, settings, dialogs,
> dashboards), check the cookbook first:
> https://atelier-ui.netlify.app/patterns
>
> Patterns shown there are the canonical way to combine atoms in this
> library — prefer them over inventing a composition from scratch.

Re-run `nx test create-workspace` (29 expected) to confirm the template
still renders.

### P6 — Smoke tests

Add `play` functions to one variant per cookbook pattern in each
framework. Each play asserts:

- The pattern renders (top-level container query).
- Primary interaction works (click sign-in, toggle a setting, open the
  dialog).

Use existing Storybook `@storybook/test` patterns from drawer/play
functions. Run via `nx affected -t test`.

### P7 — Visual snapshot pass

Run light + dark mode screenshots of all 6 patterns in each framework
Storybook (already open as the *Storybook visual check* todo). Save
screenshots to `docs/public/patterns/screenshots/{id}-{fw}-{theme}.png`
and embed on the per-pattern detail pages from P3.

## Sequencing

```
P1 parity  ─┐
            ├─► P3 detail pages ─► P7 screenshots
P2 vue gap ─┘
P4 manifest (parallel to P3, after P1)
P5 preset CLAUDE.md (parallel, anytime after P3 ships urls)
P6 smoke tests (parallel to anything; cheapest last)
```

## Effort

| Step | Estimate |
|---|---|
| P1 parity script | 1–2 h |
| P2 Vue gap | 2 h |
| P3 detail pages (×6) | 6–8 h (content-heavy) |
| P4 JSON manifest | 1 h |
| P5 preset CLAUDE.md | 30 min + tests |
| P6 smoke tests (×6 ×3) | 3 h |
| P7 screenshots | 2 h |

**Total: ~16–18 h.** Could split into two PRs:
- PR 1 (small): P1 + P2 + P4 + P5 — parity, gap, MCP catalog, preset.
- PR 2 (bigger): P3 + P6 + P7 — content + tests + visuals.

## Verification

- `nx affected -t lint,test` clean.
- `nx run docs:cookbook-parity` passes (P1).
- `nx build docs` 43 → 49 pages (6 new detail pages).
- Manual: open each detail page, confirm code tabs render, deep-links
  to Storybook resolve.
- `nx test create-workspace` still 29/29 (P5).
- Smoke tests: `nx affected -t test` includes new play functions
  (P6).

## Out of scope

- Adding a 7th pattern. Roadmap pegs the cookbook at 6.
- Refactoring the live demos in `PatternsPage.tsx`. They already work.
- Storybook MCP tool implementation — depends on upstream addon work.
- Auto-generated API reference (separate roadmap item).
