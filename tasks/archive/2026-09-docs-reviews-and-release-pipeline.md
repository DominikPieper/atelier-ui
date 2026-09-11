# Archive — 2026-09: docs-site reviews and the release pipeline

> ## Status of this document — read first (2026-09-06)
>
> This is a **verbatim historical copy**, cut from `tasks/todo.md` during the
> 2026-09-06 restructure. Every checkbox below is **frozen**: it describes what was
> open (or done) at the time this section was written, not what is open now. Do not
> tick, strip, or otherwise edit the boxes below — the point of this archive is the
> unaltered text, for the reasoning it carries.
>
> **The live backlog is `tasks/todo.md`.** Several sections below still carry
> unchecked boxes — they were mixed sections, not fully closed at the time of the
> restructure. Those still-open items were read out of this frozen copy and carried
> forward into the restructured `tasks/todo.md` (individually, or folded into a
> merge/collector there — see that file's reconciliation table for exactly which).
> They are **not** also open work here; treat every unchecked box in this file as
> historical record, already accounted for elsewhere, not as a second copy of the
> live backlog.

## Docs site: unify page alignment — 2026-09-02

### Problem (measured, dev server @ :4300, iframe widths 1024–1600)

`.docs-main--with-toc` is a left-anchored flex row; pages without a TOC centre
their `.docs-inline-page` inside an uncapped `.docs-main-content`. Same 800px
column, two different anchors → 233px horizontal jump between page types.

| @1600, offset inside `.docs-main` | left | right |
| --------------------------------- | ---- | ----- |
| no TOC (20 pages)                 | 265  | 265   |
| with TOC (7 pages)                | 32   | 497   |

Secondary: TOC rail only hides at 768px, so the text column collapses to 617px
@1200 and 441px @1024. Third: `/mcp` (1000px) and `/components` (1280px) use
inline styles instead of the shared class → h1 top at 73px / 89px vs 113px.

### Decision (confirmed with user)

- **Anchor**: reserve the TOC rail on every page. `.docs-main` becomes a grid
  `[content][rail]`, whole row centred. Content column never moves.
- **Widths**: shell owns the cap via a `width` prop on `BaseLayout`
  (`default` 800 / `wide` 1000 / `full` uncapped). `.docs-inline-page` keeps
  only its padding. Inline styles removed.
- **Breakpoint**: desktop TOC hides at 1100px, mobile disclosure takes over.

### Steps

- [x] 1. `styles/global.css` — `.docs-main` grid + `--wide` / `--full`,
      `.docs-main-content` min-width:0, drop `.docs-main--with-toc`
- [x] 2. `styles/global.css` — `.docs-inline-page` loses max-width/auto margins
- [x] 3. `styles/global.css` — move `.docs-toc` hide + `.docs-toc-mobile` show
      from the 768px block into a new **1384px** block (not 1100px — see review)
- [x] 4. `BaseLayout.astro` — `width` prop, class on `<main>`, drop `--with-toc`
- [x] 5. `pages/mcp.astro` — `width="wide"`, inline div → `.docs-inline-page`,
      `<McpExplorer>` moved inside it
- [x] 6. `components/McpExplorer.tsx` — island drops its own page wrapper
- [x] 7. `pages/components/index.astro` — `width="full"`, inline div removed
- [x] 8. `pages/components/[name].astro` + `pages/index.astro` — `width="full"`
- [x] 9. Re-measure all pages at 1024 / 1200 / 1400 / 1600 — content-column
      left offset must be identical across every `default` page
- [x] 10. ADR in `plan/adr/` + index row
- [x] 11. `nx lint docs` + `nx build docs`

### Review

#### What changed

| File                                                                   | Change                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/src/styles/global.css`                                           | `.docs-main` is now a two-track grid (`[column][rail]`, `justify-content: center`) with the rail **reserved on every page**. Added `--wide` (1000px, no rail) and `--full` (uncapped, no rail). `.docs-inline-page` lost its `max-width` / auto margins and keeps only padding. `.docs-main--with-toc` is gone. New `@media (max-width: 1383px)` block collapses the rail and shows the in-flow disclosure. |
| `docs/src/layouts/BaseLayout.astro`                                    | New `width?: 'default' \| 'wide' \| 'full'` prop; `<main>` gets the variant class.                                                                                                                                                                                                                                                                                                                          |
| `docs/src/pages/mcp.astro`                                             | `width="wide"`, inline `max-width` div → `.docs-inline-page`, `<McpExplorer>` moved inside it.                                                                                                                                                                                                                                                                                                              |
| `docs/src/components/McpExplorer.tsx`                                  | Island no longer renders `.docs-inline-page`; keeps a spacing-only root.                                                                                                                                                                                                                                                                                                                                    |
| `docs/src/pages/components/index.astro`                                | `width="full"`, inline `max-width` div removed.                                                                                                                                                                                                                                                                                                                                                             |
| `docs/src/pages/components/[name].astro`, `docs/src/pages/index.astro` | `width="full"`.                                                                                                                                                                                                                                                                                                                                                                                             |
| `plan/adr/0086-…md` + `plan/adr/README.md`                             | Decision recorded.                                                                                                                                                                                                                                                                                                                                                                                          |
| `tasks/lessons.md`                                                     | Five entries, including the breakpoint I mis-derived.                                                                                                                                                                                                                                                                                                                                                       |

#### Verified (measured, not assumed)

Content-box offset inside `.docs-main`, `/` and `*` = has TOC:

- **@1600, all 22 `default` pages** — `col=800 L=141 h1L=173`, identical whether
  or not the page has a TOC. Before: `L=265` vs `L=32`.
- **Cross-viewport** (420 / 768 / 900 / 1024 / 1200 / 1380 / 1384 / 1390 / 1440 /
  1600 / 1920): a TOC page and a TOC-less page report the same `col` and `L` at
  every width. Column is never squeezed by the rail — 800px holds down to a
  1200px viewport, below which the viewport itself is the limit.
- `nx lint docs` clean; `nx build docs` builds 60 pages; `npm run check:all`
  exits 0 (the 44 warnings are pre-existing component-parity / Figma drift).
- Screenshots at 1600×1000 confirm `/tokens` (TOC) and `/install` (no TOC) put
  their `h1` on the same pixel column.

#### Assumed, not verified

- Real-browser scrollbar width. The 16px allowance in the 1384px breakpoint was
  chosen for a classic scrollbar; macOS overlay scrollbars make it 0, so on
  macOS the rail collapses ~16px earlier than strictly necessary.
- Only Chrome was measured.

#### Weakest points of this solution

1. **The 124px shift.** Reserving the rail unconditionally is what makes the
   axis single, and it moves the 20 previously centred pages 124px left. It is
   the deliberate cost of the chosen option, but it _is_ a visible change to
   pages that had no bug of their own.
2. **A hard breakpoint still jumps on resize.** Crossing 1384px moves the
   column (rail appears, track set re-centres). Every page does it identically,
   so it is a resize artefact rather than an inconsistency — but a container
   query would have removed it, and one is not expressible here because the
   tracks live on `.docs-main` itself.
3. **`wide` is 24px off the `default` axis.** `/mcp` centres 1000px with no
   rail; `default` centres 800px _with_ one. Any width variant costs some
   misalignment; giving `wide` a rail instead made it 100px.
4. **Vertical rhythm is still not unified.** Horizontal is now exact, but `h1`
   top offsets differ: 113px on PageHero pages, 138px on `/skills/*` (a
   hand-rolled back-link row instead of `PageEyebrow`), 150px where a
   breadcrumb appears, and 89–164px on the `full` pages that own their frame.
   Out of scope for the anchor fix, and a separate convention question.

#### Separate bug found, not fixed

`BaseLayout.astro:757–779` binds the scroll-progress bar and the scroll-to-top
button to `.docs-main`'s `scroll` event. `.docs-main` never scrolls: `.docs-shell`
is `grid-template-rows: <topbar> 1fr` with `min-height: 100vh`, so the `1fr` row
grows to content height and the **window** is the scroll container
(measured: `mainScrollHeight === mainClientHeight === 3083`, `documentElement.scrollHeight = 3292`,
`innerHeight = 823`). The `else` branch that would bind `window` is unreachable
because `mainEl` always exists. Pre-existing and unrelated to this change —
the shell rows are unchanged — so it is reported rather than folded in.

---

## Docs site: the scrollport that never scrolled — 2026-09-02

Follow-up to the alignment pass. `.docs-main` carried `overflow-y: auto` while
`.docs-shell` is `min-height: 100vh` with a `1fr` row, so main never scrolled
and the window did. ADR-0087.

### Three dead features, one cause

|                                                   | before (scrollY=1200 on `/tokens`) | after                             |
| ------------------------------------------------- | ---------------------------------- | --------------------------------- |
| `.docs-toc` sticky                                | `top: 227 → −973` (scrolls away)   | `top: 135 → 92` = `68px + 1.5rem` |
| scroll-progress bar                               | `0%` at any position               | `20.49%` at y=1000 of 4880        |
| scroll-to-top button                              | never visible                      | visible past 400px                |
| `.docs-sidebar` (sibling, outside the scrollport) | worked                             | unchanged                         |

- [x] `.docs-main` loses `overflow-y: auto` → `.docs-toc` sticks to the viewport
- [x] `.docs-main-content` gains `overflow-x: auto` → wide content stays
      contained; works because `.docs-toc` is main's grid _sibling_
- [x] `BaseLayout` scroll handler binds `window`, resolves `#scroll-progress` /
      `#scroll-top` by id per call (one listener, `ClientRouter` swaps `<body>`)
- [x] Breadcrumb `/skills` 404 → `SEGMENT_LANDING` maps it to `/agent-skills`
- [x] `/skills/*` hand-rolled back-link row → `<PageEyebrow kind="reference" />`
- [x] ADR-0087 + index row + lessons

### Verified

- 116 / 116 page-width combinations (29 pages × 1600/1200/900/420) produce **no**
  document-level horizontal scrollbar.
- Sticky / progress / button confirmed with a **real wheel scroll**.
  `window.scrollTo()` over CDP moves the page but dispatches no scroll event —
  an earlier "still 0%" reading was that artefact, not a defect.
- `h1` vertical offsets now split on one fact instead of on header conventions:
  **113px** without a breadcrumb (20 prose pages), **150px** with one
  (`/patterns/[id]`, both `/skills/*` — previously 138px). `/404` at 91px and the
  `full` pages at 89 / 99 / 164 own their own frame by design.
- Breadcrumb on `/skills/atelier-design` reads "Home / Agent skills / Atelier
  Design" and links `/agent-skills` (200, was `/skills` → 404).
- `nx lint docs` clean, `nx build docs` builds 60 pages, `check:all` exits 0.

### Open — pre-existing horizontal overflow, now visible

Removing main's `overflow-y` (which made `overflow-x` compute to `auto`)
surfaced 16 page/width combinations whose content is wider than the reading
column. They are **contained** again by `.docs-main-content`, so nothing is cut
off or pushes the page — but they are real responsive defects, deliberately not
fixed here to keep the scopes apart:

```
vw=1200  /storybook +55
vw=900   /first-component +23, /storybook +323, /components/button +84,
         /components/table +28, /troubleshooting +28
vw=420   /workshop +48, /install +9, /mcp +133, /tokens +19,
         /design-principles +163, /troubleshooting +236, /tutorial +146,
         /figma +34, /schulung +15, /skills/atelier-design +14
```

Representative case: `.docs-props-table` has a min-content width of 849px (long
identifiers in `<code>`), and `width: 100%` cannot shrink a table below that.
The proper fix is a per-element scroll container on the wide content, so the
scrollbar sits at the table rather than at the bottom of the whole column.
There is already a `@media (max-width: 480px)` card transform for these tables;
the gap is everything between 481px and the reading column's width.

## Open — what the caption fix left unproven (2026-09-05, worked 2026-09-05 pm)

ADR-0091 gave `label` to AtlInput, AtlTextarea and AtlSelect via a new
`AtlCaptionSpec` mixin, and closed L1. Four follow-ups, all found by
cross-checking rather than by a gate. Three are closed below; the one that
remains is the expensive one, and the first item's _premise_ turned out to be
wrong in a way worth reading before trusting a "nothing measures this" claim
again.

- [x] **The premise was wrong — closed as answered, not done.** `select` is
      missing from `tools/parity/a11y/` by decision, not by oversight: it sits in
      `A11Y_PARITY_EXEMPT` (`tools/scripts/lib/allowlists.js:221-233`) with
      `kind: 'design'`, citing ADR-0007 — React/Vue render a native `<select>`,
      Angular a CDK-overlay listbox, so the trees legitimately differ. The gate
      enforces that in _both_ directions: `check-a11y-parity.js:98-107` raises a
      `[STALE]` **error** if an exempt component has snapshots at all. Writing
      `atl-select.a11y.spec.*` would therefore break the gate, or force removing
      the exemption and then fail `[DIVERGE]` — normalized, React/Vue collapse to
      a single `{role:'combobox'}` node (the normalizer gives `<option>` no role
      at all) while Angular yields host-combobox + button + listbox + N options.
      ADR-0091 had already decided this in its Consequences: Select gets
      framework-local unit coverage instead, including "gives the trigger button
      an accessible name" (`atl-select.spec.ts:314-324`), which is what actually
      closed L1. Same reading for `combobox` and `radio` (both `design`). Only
      `accordion` is a real gap — and it is already a `kind: 'gap'` entry that
      prints a `[GAP]` warning on every run.
- [ ] **AtlSelect is the deepest structural divergence in the library, and the
      caption sits right on top of it.** React (`atl-select.tsx:79`) and Vue
      (`atl-select.vue:65`) render a native `<select>`; Angular renders a
      `<button role="combobox">` (`atl-select.ts:86`) and points the `<label>`
      at its `triggerId`. Both are labelable, so both are defensible in
      isolation — but "one spec, three frameworks" is weakest exactly here, and
      nothing measures it. Still open, and **not** answerable by a snapshot (see
      above). Deciding whether Angular should be a native control is the
      expensive question behind it, and wants its own ADR.
- [x] Follow-up the implementer flagged: the Angular `host: { '[attr.id]':
'null' }` / `'[attr.aria-label]': 'null'` defense was hand-copied in three
      components with nothing enforcing it. Made structural as a gate, not as a
      shared constant — a constant still has to be remembered, and "someone has
      to remember" was the whole complaint. `check:host-guards` (ADR-0092)
      grades per `@Component` class, and its first run found two more
      undefended aliases: `AtlDialog` (`aria-label` + `aria-labelledby`) and
      `AtlTable` (`aria-label`). Both hosts are roleless today, so both were
      prevention rather than live defects; both fixed rather than allowlisted.
- [x] Same `Math.random()`-in-a-`computed` id bug the caption work fixed for
      Input also existed in **Vue's AtlCheckbox** — SSR-unsafe by the same
      argument, now on `useId()` like its three siblings.

### What cross-checking the closed item turned up (2026-09-05)

Reading the allowlist instead of writing the spec is what surfaced these. Both
are things the exemption had been hiding — which is the honest cost of an
exemption, and worth remembering the next time one looks like a free pass.

- [x] **Angular `AtlSelect.required` reached no DOM at all.**
      `atl-select.ts:179` declared `readonly required = input(false)` and nothing
      in the template or host ever read it — `grep -n required` returned exactly
      the doc comment and the declaration. `AtlInput` renders
      `[attr.aria-required]` from the _identical_ doc comment
      (`atl-input.ts:46`); React and Vue both set the native `required`
      attribute. Fixed on the **host**, not the trigger button:
      `aria-required` is not a global ARIA attribute (allowed on `combobox`,
      `textbox`, `listbox`, `radiogroup`, `spinbutton`, `gridcell`, `tree`), so
      on the button's implicit `role="button"` it would be an
      `aria-allowed-attr` violation. The host is the element carrying
      `role="combobox"`. (`aria-invalid` already sits on the button and is
      fine — that one _is_ global.)
- [ ] **Angular Select's `role="combobox"` is on the host while every combobox
      state and the focus are on the trigger button** — `aria-expanded`,
      `aria-haspopup`, `aria-controls`, `aria-activedescendant` all sit on the
      `<button>` (`atl-select.ts:86-99`), which has implicit `role="button"`.
      The focusable element is not the role holder, which is not the WAI-ARIA
      1.2 combobox pattern. Bigger than a binding move: it changes the
      accessible tree and interacts with the open question above about whether
      Angular should be a native control. Same ADR.

## Nx 23 migration: closed and verified — 2026-09-05

The run of 09-03 left `migrations.json` and two `tools/ai-migrations/` prompt
files in the tree, and from the tree alone there was no way to tell a finished
run from an interrupted one. Re-running `--run-migrations` answered it and cost
two commits to learn the mechanism: **it restarts from the top of the file, it
does not resume.** `strict-safe-navigation-narrow` re-added the very
`extendedDiagnostics` suppressions that `remove-conflicting-extended-diagnostics`
had removed, then removed them again one migration later — net diff against
`a703ba8` empty. The run reported 45 applied and 7 prompt migrations deferred,
and `.nx/migrate-runs/23.1.0-rc.2` already records all seven as handled by the
agentic pass on 09-03.

- [x] Both prompt artefacts confirmed moot before deleting: React is on 19.2.4
      with `@types/react` 19, and the ts-jest migration was a no-op here (classic
      paths-based tsconfig, no project received `isolatedModules`, no `typecheck`
      target exists — this repo gates types through `check:types` instead).
- [x] `migrations.json` + `tools/ai-migrations/` removed (`c410f44`).
- [x] **Verified on the resulting tree, not assumed:** `check:all` exit 0 (all 31
      gates) · `nx run-many -t test` exit 0, 7 projects (Vitest 4) · `-t lint`
      exit 0, 10 projects (flat config) · `-t build` exit 0, 7 projects.
- Lesson for the next `nx migrate`: delete `migrations.json` when the run ends.
  A leftover file is indistinguishable from an interrupted run, and re-running
  it is **not** idempotent across migrations that undo one another.
- [ ] Two net-zero commits (`98e8755`, `ac3c854`) stay in history — they cancel
      exactly, and rewriting unpushed history was blocked by the auto-mode
      classifier. Harmless; squash them if the branch is ever rebased anyway.

## Open — 30 parity records are stale again (2026-09-05)

`check:parity:report` now warns on 30 of 37 masters. Not caused by the migration
(the tree is byte-identical to `a703ba8`); it is the known `inputsHash` weakness
below plus real component edits from `6a8ac9f` (29 files), `64277c3` (37) and
`2072116` (19). Non-blocking by design — `check:all` runs the `--report` variant,
per ADR-0082 — but "verified after the files last changed" is now false for 30 of
them, which is the whole claim the stamp makes.

- [ ] Re-verify with the Figma Desktop Bridge open: `figma_check_design_parity`
      per master, then `npm run parity:record -- --component <Name>`, then
      `npm run check:parity` (no `--report`, which blocks) to confirm. Needs a
      human at a Figma session; cannot be done from a script.
- [ ] Doing the `inputsHash` narrowing FIRST would shrink this list — a
      `*.spec.tsx` edit should not invalidate a parity record. See the item under
      "Open — parity drift, after ADR-0082 (2026-08-28)". Decide the order before
      spending 30 bridge round-trips.

## Open — Schulung, second review (2026-09-02)

Full document: `tasks/schulung-review-2026-09-02.md` (4 blockers · 1 immediate · 13 major · 15 minor). Nothing fixed in this pass — review only.

- [x] **I1** — scrubbed two colleagues' names + internal mailbox from `tasks/review-state-2026-08-26.md:168` and `tasks/schulung-review-2026-08-28.md:64` (public repo); role phrasing as in ADR-0032. Working tree only — git history still carries the old lines; rewriting public history is a separate decision (route via the internal DSB).
- [x] **B1** — Storybook/docs ports swept (`7efc0be`) and preflight taught to check the environment it is actually in (`a2ff354`, ADR-0084 amendment). The gate the item asked for exists too: `[PORT-6006]` in `tools/scripts/check-docs-sync.js:357-381`, with its scaffold-context allowlist at `tools/scripts/lib/allowlists.js:87-113`.
- [~] **B2** — the `label` half is done: ADR-0091 pulled it into a shared `AtlCaptionSpec` mixin and implemented it in Angular for Input, Textarea and Select (`a8ab0d2`, `130057f`). The **prop-parity gate** half is not — ADR-0091's Consequences defer it explicitly as its own task. Promoted to its own item below so it does not vanish under a tick.
- [x] **B3** — Day-2 gate story repaired (`74a81f4`), then the gate list replaced by a measured one (`7c9a9a2`): a one-framework component makes exactly `check:sync`, `check:a11y-parity` and `check:design-status` red, and the material now says the participant's spec is its own file next to their component, not an edit to the shared master.
- [x] **B4** — briefs' Toast/TagChip severity `error` → `danger`, matching the code union and the tokens (`46f2ca1`).
- [ ] **M1** — `/claude-design` stale numbers: gates ("29" on `claude-design.astro:196,209`; `check:all` is **33** as of ADR-0092 — recount rather than copying this line, it drifts every time a gate lands), "twenty-four tags"→generated, 17/13 ADRs→16/12.
- [ ] **M2/M3** — Claude Design trainer run-sheet (product, `/design-login`, prompt, hardcode target, flip value, fallback URL) + participant how-to (image, prompt→canvas, Step-5 example, opener). Both wait on the per-seat test (review §5).
- [ ] **M4–M6** — clone-first kata prompt + story file; Block 05 exercise page; clone quickstart + local `.mcp.json` snippet on 440x.
- [ ] **M11/§6.3** — decide trainer-kit location (recommendation: private `atelier-trainer` repo pinned to an atelier SHA); move agenda internals, add `LICENSE`.
- [ ] **M12** — `solved-*` branches: build or remove the promise (`agenda:81,208`).
- [ ] **§10** — one rehearsal of the participant path on a non-author machine, timed.
- [x] **Prop-parity gate** (promoted out of B2) — shipped as `check:props`,
      ADR-0093. Root cause found while building it: **Vue and Angular have no
      type-level link to the spec at all** — no Angular class implements an
      `Atl*Spec`, no `.vue` file uses one as its props type. React was the only
      adapter the compiler held to the contract. The gate ships green with 55
      `gap` exemptions in 14 groups; each group is an item below.

## Docs site: UI/UX review with `ui-ux-pro-max` — 2026-09-02

Scope: the docs app as a _product surface_ (visual, interaction, a11y,
responsive, motion, navigation) — not the training content, which
`schulung-review-2026-09-02.md` already covers. Environment: local HEAD on
`:4300`. Review only in this pass — fixes follow in the agreed order.

Full document: `tasks/docs-ux-review-2026-09-02.md` (3 blockers · 13 major ·
12 minor · 3 library defects surfaced by demos).

- [x] Static scan (subagent): `global.css`, `docs-theme.css`, `BaseLayout.astro`,
      `components/*.astro` — raw hex, text opacity, focus rules, z-index, PRM,
      durations, type scale, breakpoints, targets
- [x] Playwright sweep: 58 pages × 1440/1024/768/375 × dark/light (472 probes),
      axe-core 4.13 at 1440 + 375 (236 runs), focus walk 4 pages (177 stops),
      drawer test at 375 — scripts in the session scratchpad
- [x] Skill queries per finding class (`--domain ux`)
- [x] `tasks/docs-ux-review-2026-09-02.md` — severity · evidence · fix · rule ·
      serves; §verified vs assumed; §weakest point

### Open — fixes (order from the review §6)

- [x] **B1** 375 px: shell is 401 px wide on every page — topbar min-content
      (`.docs-search` no `min-width:0`, input `padding-right 72px` for the ⌘K
      hint). Fix + add the 375 overflow probe to `check:docs`.
- [x] **B3** `html { scroll-padding-top }`; delete dead `.step-row[id]`
      (`global.css:3010`, templates use `docs-step-row`) + 2 ad-hoc offsets.
- [x] **B2** `/` CTA dark mode: `color:#fff` on `#34d8d8→#87efef` (1.3–1.8:1)
      → on-primary token (`global.css:2639-2746`).
- [x] **M1+M2** props-table scroll wrapper + `overflow-wrap:anywhere` on types
      (`/components/icon` table 2350 px); scale SVG diagrams, label surfaces
      (axe `scrollable-region-focusable` ×32).
- [x] **M6+M7** delete `.docs-search-input:focus` / `.docs-filter-search:focus`
      overrides (`:1651`, `:1099`); scroll-top `visibility` + PRM-gated scroll.
- [x] **M5** `/mcp` raw link 1.83:1 (`mcp.astro:28`); hero disclaimer opacity .65
      → token. (M13 withdrawn: the jargon hits were the closed popup's contents.)
- [x] **M8+M9** drawer `top` below the banner, `bottom` above bottom-nav,
      `inert` + scroll lock; `scroll-padding-bottom` for the sticky bottom nav.
- [x] **M3+M4** 16 px body floor on mobile, 72ch measure, 12 px text floor.
- [x] **M10** emoji category icons (`components.ts:52-57`) → `IconName`.
- [x] **M11** 24 px targets (copy buttons 44 px).
- [x] **M12+n8** heading scale on component pages; pattern demo h3 → h2;
      landmark names.
- [x] **n1–n3** z-index tokens, 3 breakpoints, literal-colour gate over
      `docs/src/styles` — one batch + ADR.
- [ ] **L1–L4** → component backlog (`AtlSelect` name, `AtlProgress` label,
      checkbox hit area, `AtlTabs` pills don't wrap/scroll at 375).

### Resume point — 2026-09-02 19:59 (resumed 23:00, done 2026-09-03 ~00:30)

Committed so far: `a8e71b4` B1–B3 · `cd6e93f` review · `bfc4101` M1/M2 ·
`8484ae5` M5–M7 · `ae70edb` M8–M10. Dev server on `:4300` (background task).

In the working tree, uncommitted, gates not yet run:

- **M12 + n8** done by agent (heading scale 20/18 px, `Live demo` h2 on
  pattern pages, landmark labels) — diff reviewed, OK.
- **M11** (targets ≥ 24 px) agent was still running at 19:59 — review its
  hunks (`.docs-code-block-copy`, `.docs-cta-cmd-copy`, `.docs-sidebar-version`,
  `.docs-edit-page-link`, footer links, `.run-step-link`, `.pattern-tag--link`)
  and its `verify-m11.mjs` output before committing.
- **Typography analysis** (read-only Explore agent) for Batch E was still
  running — its report drives M3/M4.

Next steps, in order:

1. `nx lint docs` · `nx build docs` · `check:docs` · `check:llms` → commit
   M11 + M12 + n8 as one `fix(docs)` commit.
2. Batch E (M3 + M4): 4-step docs type scale (12/14/16/18 px), prose 16 px,
   12 px floor, 70ch prose measure — implement from the analysis mapping,
   screenshots before/after at 1440 + 375 on 6 pages; **ADR-0088**.
3. Gates batch (n1–n3): `--ui-z-*` tokens for docs z-index, 3 documented
   breakpoints, literal-colour gate over `docs/src/styles`, and the 375
   overflow sweep as `check:docs-layout` (Playwright, static server over
   `dist/docs`, wired into `check:all`; CI already installs Chromium);
   **ADR-0089** + README index rows.
4. Final full sweep (`scratchpad/sweep.mjs` + `summarize.mjs`) to confirm the
   axe/overflow/target counts moved; update review §"after" and this file;
   tick remaining boxes; L1–L4 to the component backlog note.
5. Push once at the end (SSH, direct to main).

**Typography analysis digest (agent, 20:05) — input for Batch E:**

- ~500 sub-1rem `font-size` declarations: ~150 in `global.css`, ~50 in
  `components/*.astro`, ~230 page-scoped (`<style>` + inline `style=`), ~55 in
  `.tsx` inline styles. `docs-theme.css` sets none.
- **Reuse the library scale, no new tokens:** `--ui-font-size-xs/sm/md/lg` =
  12/14/16/18 px (`libs/react/src/styles/tokens.css:34-45`); `tokens.astro:75-80`
  already documents these roles (labels · secondary/table cells · body ·
  emphasized). Rule: running prose → `md`; secondary/captions/meta/nav/TOC/
  table cells → `sm`; labels/eyebrows/chips/badges/code-lang/bottom-nav labels
  → `xs`; CODE/OTH (buttons, card titles, mono) untouched; SVG `<text>` separate.
- System-layer counts: ~28 RP → md, ~35 SEC/NAV → sm, ~55 LBL → xs, ~35 left.
  Biggest RP hits: `.docs-page-hero-lede` 0.9rem (20 pages, PageHero.astro:59),
  `.docs-step-desc` 0.82 (9 pages), `.docs-composition-*`/`.docs-a11y-notes`
  0.82–0.85 (all 57 component pages), `.checkpoint-body` 0.85, `.objective-list`
  0.84, `.docs-pagepair-desc` 0.78.
- **Dead CSS (0 template uses):** `.docs-home-section-sub`, `.docs-feature-card-desc`,
  `.docs-protocol-step-desc`, `.docs-shortcut-desc`, `.docs-orient-card-desc`,
  `.docs-help-footer-desc`, `.docs-help-footer-link-desc` — delete, don't remap.
- Debatable (decide in ADR-0088): uppercase nav headings (`.docs-nav-heading`,
  `.docs-toc-header`, `.docs-sidebar-title`) xs vs sm; card/tile titles at
  0.86–0.95rem (leave); `PageHero.astro:71` `code { font-size: .85em }` scales
  with the lede bump (12.2 → 13.6 px, fine).
- Measure: default column 800 px ≈ 100 cpl, `--wide` 1000 px ≈ 125 cpl; only
  `.docs-page-hero-lede` (36rem ≈ 72 cpl) and `.docs-page-description` (600 px)
  are capped. Decision for E: cap running prose at `max-width: 70ch` inside
  `.docs-main-content` (p, li, dd in prose contexts; not tables/code/cards).
- Page-scoped inline sizes (~230) are out of E's first pass — record as a
  follow-up (n13) with the two RP hot spots `troubleshooting.astro:199,227`
  and `tutorial.astro:660` / `first-component.astro:413` done in E.

**M11 landed (agent, 20:15) — review at 23:00 before committing:** hunks in
`global.css` (`.docs-sidebar-version`, `.docs-code-block-copy` 28 px,
`.docs-cta-cmd-copy` 28 px, and `.docs-code-block-header` padding 0.4 → 0.15rem
to keep the header height unchanged — check visually), `BaseLayout.astro`
(`.docs-edit-page-link`), `Footer.astro`, `first-component.astro`,
`tutorial.astro`, `patterns.astro` (`.pattern-tag--link`). axe target-size
clean on 6 pages × 2 widths except a pre-existing `input[type=email]` in the
login-form demo (library, → L-list). Agent's "code block hidden behind the
bottom nav at initial paint" is content below the fold behind a sticky nav —
judge whether that is a defect at all.

**20:20 — the `:4300` dev server was stopped (background task killed). Restart at 23:00 first: `npx nx serve docs` in the background, wait for `ready`.**

## Open — component backlog surfaced by the docs review (L1–L4, 2026-09-03)

Not docs CSS; the docs gate allowlists each with a reason pointing here.

- [ ] **L1** `AtlSelect` demo / component: native `<select>` without an accessible name (axe `select-name`, critical) — either the demo omits the label the component needs, or the spec lets it be omitted.
- [ ] **L2** `AtlProgress`: `role=progressbar` without `aria-label` in 16 demo instances (axe `aria-progressbar-name`) — compare `AtlButton`'s discriminated-union enforcement.
- [ ] **L3** Checkbox/toggle inputs measure 20×20 / 1×1; login-form demo `input[type=email]` under 24 px when the sticky nav overlaps — confirm the label extends the hit area (WCAG 2.5.8).
- [ ] **L4** `AtlTabs` `variant="pills"` neither wraps nor scrolls at 375 (+19 px on `/patterns*`) — `chip-collection-reflow`.
- [ ] `AtlCodeBlock`'s scroller has no focusable content (axe `scrollable-region-focusable` on `/components/code-block`).

## Open — what `check:props` found on its first run (2026-09-05)

ADR-0093 shipped the gate green by recording every pre-existing divergence as
`kind: 'gap'` — they warn on every run rather than blocking, so the backlog is
visible instead of silent. 55 exemptions in 14 groups. Two are defects, the rest
are the spec being incomplete. Fix them by removing the allowlist entry, not by
editing the gate.

### Defects

- [ ] **React carries two public spellings for one prop.** The spec says
      `readonly` (`libs/spec/src/index.ts:121`), Angular (`atl-input.ts:120`) and
      Vue (`atl-input.vue:15`) agree; React `Omit`s the HTML attribute
      (`atl-input.tsx:10`) to redeclare `readOnly` at `:39`. **Correction to what
      this file said first:** the lowercase prop is _not_ inert — all three React
      components destructure both and merge them (`:53-54`, then `:61`
      `reactReadOnly ?? specReadOnly ?? false`), so `readonly` works as a
      fallback that a passed `readOnly` shadows. The real defect is that only the
      React spelling is tested (`atl-input.spec.tsx:52-55` and
      `atl-textarea.spec.tsx:55-58` assert the `is-readonly` class, not the DOM
      attribute; nothing exercises the lowercase path, and RadioGroup has no
      readonly test at all). Consolidating on the spec's spelling is a breaking
      rename — its own ADR, and it wants a release note. Affects Input, Textarea,
      RadioGroup.
- [x] **Withdrawn — `AtlRadioGroup.name` was a false positive of the gate's own
      `[DEAD]` rule.** It _is_ wired: `atl-radio-group.token.ts:14` declares
      `name: Signal<string>` on the context, the component is provided as
      `useExisting: AtlRadioGroup`, and `atl-radio.ts:75,38` reads
      `group?.name()` into `[attr.name]` — asserted by passing tests in
      `atl-radio-group.spec.ts:43-51` and `atl-radio.spec.ts:139-159`. Only the
      file-local claim was true, which is what the rule measured.
- [ ] **`AtlSelect.name` is the real dead prop, and the rule missed it.**
      Declared at `atl-select.ts:183`, never bound, absent from
      `AtlSelectContext`, untested. The gate stayed silent because the file
      contains "name" in doc comments and in `<atl-icon name="chevron-down">`.
      Now flagged (rule sharpened: matches the signal's call, strips comments,
      resolves the injection-token context). Filed as a `gap` rather than fixed:
      Angular's select renders a `<button>` trigger, not a native control, so
      honouring `name` means deciding whether to emit a hidden input — a design
      question with its own ADR.
- [ ] **`AtlAccordionGroup.multi` is a third dead prop, via a third mechanism.**
      `atl-accordion.ts:49` declares `readonly multi = input(false)` and nothing
      calls `multi()`; the public `[multi]` binding is served instead by
      `hostDirectives: [{ directive: CdkAccordion, inputs: ['multi'] }]` at
      `:40`, which forwards it to the CDK's own input. Found by the sharpened
      rule and filed as a `gap`: teaching the gate about `hostDirectives` input
      forwarding is a fourth mechanism, and one open question first — which
      input wins when a component declares its own alongside a forwarded one of
      the same name. That was inferred from the CDK types and a passing
      `multi-expand` test, not from Angular's compiler behaviour.

### The spec is incomplete (all three adapters agree with each other)

- [ ] **`errors` is implemented by all three adapters on all seven form
      components and declared by no spec.** Blocked on a type decision: Angular
      types it `WithOptionalFieldTree<ValidationError>[]`, React and Vue as
      strings. Agreeing a shared `AtlFieldError` is a contract change across 7
      components × 3 frameworks — its own ADR, deliberately not folded into the
      gate task.
- [ ] **The spec models exactly one event.** `AtlFormFieldSpec.onValueChange`
      exists; `Alert.dismissed`, `Chat.onOpenChange`, `ChatSuggestion.selected`,
      `Drawer.onOpenChange`, `MenuItem.onTriggered`, `Pagination.onPageChange`,
      `Stepper.onActiveStepChange`, `Th.sort` and `Tr.selectedChange` are
      implemented consistently in all three adapters and declared nowhere. 13
      exemptions. Deciding the event contract is a spec change with its own ADR.
- [ ] **`AtlChatMessageSpec` requires `id` and `content`** (both non-optional,
      `index.ts:489,491`) and **`AtlChatSuggestionSpec` requires `id`** — no
      adapter implements any of them; content is passed as children/slot
      everywhere. Not drift: a required contract field that nothing honours.
- [ ] **`AtlDialogSpec` declares neither `aria-label` nor `aria-labelledby`**
      while all three adapters expose both.

### Individual divergences

- [ ] **`AtlTrSpec.rowId` is wrong in three different ways**: dead in Angular
      (`atl-table.ts:235`, single occurrence in the file), inherited-but-never-
      wired in React (no destructure, and no `{...rest}` on the `<tr>` to let it
      fall through), and simply absent from Vue's `atl-tr.vue` props.
- [ ] **`AtlBreadcrumbItem.current`** is a settable prop in the spec, React and
      Vue; Angular computes "is this the last item" internally via the
      `ATL_BREADCRUMBS` registration token and never exposes it.
- [ ] **`AtlButtonSpec` requires `aria-label`** when the button has no visible
      label; Angular and Vue answer with a dev-mode warning instead of a prop.
      The contract being unmet, not a spec gap.
- [ ] **React-only props with no spec entry**: radio-group `orientation` (also
      recorded in `DEAD_SELECTOR_EXEMPT` as an open spec decision) and tbody
      `emptyContent`.

### Known blind spots of the gate itself

- [ ] **It is spec-keyed, so it cannot see adapter-vs-adapter divergence where
      the spec is silent.** Vue's dialog hardcodes its own `headerId` as the
      `aria-labelledby` target while Angular and React expose the prop — a real
      divergence `check:props` structurally cannot report, because
      `AtlDialogSpec` declares neither name. Closing it means completing the
      spec, not extending the gate.
- [ ] **Seven components have no spec interface at all** — `AtlCodeBlock`,
      `AtlAccordionHeader`, `AtlMenuSeparator`, `AtlMenuTrigger`, `AtlChatInput`,
      `AtlChatTyping`, `AtlThead`. The gate names them as unkeyed in its summary
      rather than skipping them silently, but nothing checks them.
- [ ] **`toast` is excluded outright.** Angular takes four flat props where React
      and Vue take one `data: ToastData` object, and the real API is imperative
      (`AtlToastService.show()` / `useAtlToast()`). A set comparison cannot
      express a shape mismatch; allowlisting it would have pretended it was
      checked.
- [ ] Worth its own investigation, from ADR-0093's rejected alternatives:
      **Vue's `defineProps<AtlXSpec>` could give Vue a real type-level link to
      the contract**, which is the root-cause fix the gate only detects around.
      Angular cannot — signal inputs are class fields, not a props object.

## Open — the release pipeline published nothing for a week (2026-09-05)

Found by falling back to `gh` after the Nx MCP's CI tools turned out to need Nx
Cloud, which this repo does not configure. Not visible to any local gate, and
nothing in the repo would have shown it.

- npm serves **0.2.27** for all **five** publishable packages (the four scoped
  `@atelier-ui/*` plus the unscoped `create-atelier-ui-workspace`), last
  published **2026-08-29**
  (`npm view @atelier-ui/react time`). The libs' `package.json` say **0.2.33**.
  Six releases bumped versions, wrote changelogs, committed `chore(release):
publish` and pushed without reaching the registry.
- Every publish run with a real bump fails the same way: `PUT
https://registry.npmjs.org/@atelier-ui%2fangular - Not found` … `could not be
found or you do not have permission to access it`. A 404 on PUT for a scoped
  package is npm's mask for missing publish rights. The green Publish runs in
  between are no-ops — without a bump `nx release --yes` skips publishing and
  exits 0.
- [ ] **Rotate `NPM_TOKEN`** (`publish.yml:123`) — the user's action; nothing in
      this repo can do it. Everything below is blocked on it.
- [ ] **Republish the six missing versions** once the token works: the workflow
      already has a `publish-only` input (`publish.yml:117`) that runs
      `npx nx release publish` against the current tags regardless of bump,
      written for exactly this recovery.
- [x] Make the drift visible: `check:release-drift` compares each publishable
      package's local version against the registry, wired into the publish
      workflow as a post-publish verification and into CI on `main` so the repo's
      status stays red while npm is behind. Deliberately **not** in `check:all` —
      every gate there is offline and deterministic, and a registry call would
      break that for all 34. (I first justified this by saying `check:figma` is
      excluded from `check:all` for the same reason. It is not: `check:figma` is
      the last entry in the chain and runs offline against the committed
      `tools/figma/snapshot.json`. The live Figma call is the MCP
      `figma_check_design_parity`, a different thing. The principle stands, the
      example was wrong.)
- [ ] Still open, offered and deferred: `nx release --yes` commits and pushes the
      version bump as part of the same command that publishes, so a failed
      publish leaves git ahead of npm by construction. Reordering it so the
      commit only lands after a successful publish is the structural fix, and
      wants its own ADR.
