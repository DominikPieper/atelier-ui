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

### P3 — Per-pattern detail pages — ✅ Shipped 2026-04-26

Picked option A (dynamic route). Cookbook now has 6 deep-content
pages at `/patterns/<id>`, plus the existing `/patterns` index, plus
the `.well-known/cookbook-patterns.json` manifest pointing at the new
URLs.

Authored content (`docs/src/data/patterns.ts`):

- `PatternMeta` extended with `whenToUse[]`, `whenNotToUse[]`,
  `a11yNotes[]`, `pitfalls[]`, `variations[]`, `storybook { angular,
  react, vue }`.
- Added `TAG_TO_SLUG: Record<string, string>` so each component tag
  in the catalog maps cleanly onto the existing `/components/<slug>`
  reference page.
- All 6 patterns now ship 3 when-to-use bullets, 3 when-not-to-use
  bullets, 3 a11y notes, 3 pitfalls (focused on what an LLM most
  commonly produces wrong), and 2 variations. Roughly 1100 words of
  pedagogical content total, written deliberately tight.
- `storybookLinks(storyId)` helper builds the per-framework
  `?path=/docs/cookbook--<id>` URLs. Storybook IDs were verified
  against the `cookbook.stories.*` exports (note: data-list resolves
  to `cookbook--data-list-with-actions`, the rest follow the obvious
  kebab of the pattern title).

Detail page (`docs/src/pages/patterns/[id].astro`):

- `getStaticPaths()` produces one page per `PATTERNS` entry; the page
  throws if the param doesn't resolve (build-time error rather than
  silent 404).
- Layout, in order: eyebrow + H1 + description + linked tag list,
  live React-island demo (reuses `LoginFormDemo`, `SettingsPageDemo`,
  ... from `docs/src/components/PatternsPage.tsx`), When-to-use ↔
  When-not-to-use side-by-side block, Accessibility, Common pitfalls,
  Variations grid, code in 3 framework tabs, "Open in Storybook"
  link row per framework, Prev/Next pager.
- Sidebar TOC: anchor links per section + "← All patterns" back-link.
- Tab switching uses the global `framework-pref-init.ts` handler that
  BaseLayout already imports — no per-page script. Picking React on
  one detail page persists to siblings.

Index page (`docs/src/pages/patterns.astro`):

- Title is now an `<a>` to the detail page; tags become links via
  `TAG_TO_SLUG`; each pattern card gains a "Read full guide →" CTA
  beneath the tags.

Manifest (`tools/scripts/gen-cookbook-manifest.mjs`):

- `url` field switched from `/patterns#pattern-<num>` to
  `/patterns/<id>` (one-line change as anticipated). Manifest
  regenerated; CI `--check` mode passes.

Verification:

- `nx build docs` — 49 → **55 pages**, no errors. The 6 new pages
  appear at `dist/docs/patterns/{login-form,settings-page,
  confirmation-dialog,data-list,notification-center,
  management-dashboard}/index.html`.
- `nx lint docs` clean.
- All 6 sync checks pass: `check:cookbook`, `check:cookbook-manifest`,
  `check:llms`, `check:sync`, `check:docs`, `check:spec`.
- Spot-checked rendered HTML for `/patterns/login-form`: tags link to
  `/components/card` and `/components/input`, pager links to
  `/patterns/settings-page`, all required sections present.

What's still open (deferred):

- Replacing the live React-island demos with framework-native demos
  per detail page would let the page show the active framework's
  exact composition end-to-end. The current React island is fine for
  a static visual check but is not framework-faithful.
- A "copy code" button on each tab. The `astro-expressive-code` Code
  component supports this but it's off in this codebase.

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

### P5 — Update preset CLAUDE.md — ✅ Shipped 2026-04-27

The CLAUDE.md isn't a separate template file — it's an inline string
literal in `libs/create-workspace/src/generators/preset/preset.ts`
(starting at line 144). Added a `## Composition Patterns` section
between *Component Libraries* and *Design Tokens*:

> When composing multi-component flows (login form, settings page,
> confirmation dialog, data list, notification center, management
> dashboard), check the cookbook first:
>
> - Browse: ${SITE_URL}/patterns
> - JSON catalog (machine-readable): ${SITE_URL}/.well-known/cookbook-patterns.json
>
> Patterns shown there are the canonical way to combine atoms in
> this library — prefer them over inventing a composition from
> scratch.

The site URL uses the `SITE_URL` constant (`https://atelier.pieper.io`),
not the older `atelier-ui.netlify.app` referenced in the original
plan. The JSON catalog link points at the manifest shipped in P4 so
agents have a machine-readable entry point.

Added one assertion in `preset.spec.ts` so silent removal fails CI.
`nx test create-workspace` 36 → **37 passed**, lint clean.

### P6 — Smoke tests — ✅ Shipped 2026-04-27

Added `play` functions to one variant per cookbook pattern across
all three framework story files
(`libs/{angular,react,vue}/src/lib/cookbook.stories.{ts,tsx}`). Six
patterns × three frameworks = 18 plays in total. Each play asserts:

- The pattern renders (heading + a couple of stable role/text
  anchors).
- The dialog pattern's primary interaction works (clicking the
  trigger opens the native `<dialog>` and exposes the confirm
  button via `screen` because the dialog renders to the top-layer
  outside the Storybook canvas root).

**Anchor texts (stable across all 3 frameworks unless noted):**

| Pattern | Anchors |
|---|---|
| Login Form | `Sign in` heading, `Sign in` button, `Remember me` label |
| Settings Page | `Settings` heading, `Account` tab |
| Confirmation Dialog | `Delete account` trigger → `dialog[open]` + `Yes, delete my account` (Angular) / `Delete permanently` (React, Vue) |
| Data List with Actions | `Projects` heading, `Marketing Website` row, `New project` button |
| Notification Center | `Notifications` heading, `Clear all` button, `Errors` group |
| Management Dashboard | `Operations Overview`, `Recent Activity`, `Plan Usage` headings |

**Verification:**

- React: `npx vitest run --config libs/react/vitest.storybook.config.ts`
  passes 31 files / **216 / 216** tests in chromium browser mode
  (cookbook contributes 7 of those).
- Vue: no `vitest.storybook.config.ts` is wired in `libs/vue/`, so
  the plays only execute in the Storybook UI's *Interactions*
  panel. Documented as a follow-up below.
- Angular: storybook-vitest is broken upstream — `_PlatformLocation`
  fails to JIT-compile under `@storybook/addon-vitest`'s
  prebundled chunk-WJNW6EJE. The error originates in the cached
  bundle's static initializer, before `vitest.setup.ts` or
  `preview.ts` can `import '@angular/compiler';` to install the
  JIT compiler. Tried adding the import in both setup and preview;
  neither helped because the bundle is loaded first. Reverted those
  changes. The plays still ship — Storybook's Interactions panel
  runs them when each story renders, which is what attendees see.
- Unit tests: `nx run-many -t test -p angular,react,vue` →
  **522 passed** (Angular alone is 522; total across 3 projects
  was clean). Lint clean across all three.

**Bug fixed in passing:** `libs/react/src/lib/cookbook.stories.tsx`
was importing `LlmOption` from `./select/llm-option` (file does not
exist). The import was never exercised because the regular
`.spec.tsx` test target excludes `*.stories.tsx`; only the
storybook-vitest path loads the file directly. Switched to
`import { LlmSelect, LlmOption } from './select/llm-select';`.

**Follow-ups:**

- Wire a `vitest.storybook.config.ts` for Vue so its 7 cookbook
  plays run in CI alongside React's. ~30 min.
- Triage the Angular storybook-vitest `_PlatformLocation` JIT
  failure. Likely needs either Angular libs ship full-AOT bundles
  or `@storybook/addon-vitest` exposes a hook to inject
  `@angular/compiler` into the prebundled chunk before its static
  initializer runs.
- Add a `nx storybook:test` target per project so
  `nx affected -t storybook:test` picks the configs up. Today the
  configs are runnable but unsurfaced.

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
