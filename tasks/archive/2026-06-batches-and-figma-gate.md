# Archive — 2026-06: batches and the check:figma gate

> ## Status of this document — read first (2026-09-06)
>
> This is a **verbatim historical copy**, cut from `tasks/todo.md` during the
> 2026-09-06 restructure. Every checkbox below is **frozen**: it describes what was
> open (or done) at the time this section was written, not what is open now. Do not
> tick, strip, or otherwise edit the boxes below — the point of this archive is the
> unaltered text, for the reasoning it carries.
>
> **The live backlog is `tasks/todo.md`.** These sections were fully closed by the
> time of the restructure (every box checked, or a concluded narrative retrospective
> with no open action), which is why they moved here rather than into the live file.
> If you are looking for open work, it is not here.

## Approach audit: gaps / improvements / blind-spots — 2026-06-17

Source: read-only audit workflow `wf_9736c813-eca` (26 agents, 73 verified findings, 0 refuted).
Full roadmap: `~/.claude/plans/validated-sniffing-lamport.md`. Core finding: gates prove a
string/binding EXISTS, not that it is TRUE; verify-loop + LLM-thesis eval are unenforced/unmeasured.

Safe mechanical fixes (no decision needed) — landing now:
- [x] `.gitignore`: fix malformed line 53 (`settings.local.json.netlify/state.json` was one jammed line); add `.env`/`.env.*`/`.dev.vars`/`*.log`
- [x] Untrack `debug-storybook.log` (`git rm --cached`)
- [x] `plan/figma.md:142` LlmButton variant → add `danger` (spec has it; doc was stale)

DONE this session (Close-the-loop, group A):
- [x] Version band: accept 0.1.x → ADR-0023 (+ ADR-0016 note, README row). User decision.
- [x] **A2 — parity persistence gate**: `tools/scripts/check-parity.js` + `parity-record.mjs` + `lib/parity-inputs.js` + `tools/figma/parity.json`; `check:parity`/`parity:record` scripts; ADR-0024; docs verify-step wired (loop page only — kata builds composed SettingsCard, not a master). Verified: baseline 3-unverified/exit0, record→OK, input drift→BLOCKER/exit1, revert clean; check:all green.
- [~] A1 — generation eval: DEFERRED by user (kept on roadmap; needs a model + API key to run).
- [x] **A3 — cross-framework a11y-tree conformance**: jsdom a11y-snapshot per fw + offline diff gate. New: `libs/<fw>/src/testing/a11y-tree.ts` (normalizer, ×3 like behavior.ts), `llm-button.a11y.spec.*` (×3), `tools/parity/a11y/llm-button.<fw>.json` (×3), `tools/scripts/check-a11y-parity.js`; `check:a11y-parity` (in check:all) + `gen:a11y`; ADR-0025. Proof: LlmButton — all 3 produce byte-identical a11y tree despite native-button (React/Vue) vs role-host (Angular). Verified: gate green, synthetic divergence→BLOCKER, per-fw drift guard passes in `nx test`, lint clean all 3, check:all green.


## Spec hygiene: checkbox/toggle value (ADR-0022) — 2026-06-13

- [x] Decision: spec-hygiene + docs (not adapter parity / not docs-only)
- [x] LlmCheckboxSpec/LlmToggleSpec → Omit<LlmFormFieldSpec,'value'|'onValueChange'>
- [x] Dropped phantom value/[(value)] rows from checkbox+toggle docs prop tables
- [x] sync-spec + gen-behaviors + gen-llms; check:all green; build 58 pages
- [x] ADR-0022 + README row; commit
- [x] ~~push~~ — done long since; the batch shipped 2026-06-13.
- Remaining open: .panel/.close-btn dialog scoping (component-trinity); McpExplorer tool rename (lossy, disclaimer'd); ideas 11-29


## Quick-win ideas batch — 2026-06-13

- [x] Edit-this-page link (BaseLayout + source-path helper; dynamic routes link template, 404 excluded)
- [x] Teaching empty states (gallery: specific msg + Clear filters + category chips; search: type-hint)
- [x] Verify (lint/build/58 pages) + screenshots + commit + push
- Skipped: copy "inked" polish (multiple impls, low value); content follow-ups [(value)] alias still a docs-vs-library decision


## P3 polish batch — 2026-06-13

- [x] Agent A chrome: visible breadcrumb, components return link, scroll-top 44px + progress bar
- [x] Agent B pages: figma-console-mcp literal, home jargon, d2c named link, kata code title, accessibility note (FRAMEWORKS order + mcp overflow rerouted to me)
- [x] Agent C data: CDK-leak neutralized, 'Yes, delete' label, vertical-tab pills clarification
- [x] Agent D a11y: gallery filtered-count live region
- [x] Inline (orchestrator): McpExplorer 'Use with AI tools' single-col; tutorial+d2c FRAMEWORKS→Angular-first (match FW_DEFAULT); ComponentDetail duplicate breadcrumb removed; McpExplorer radius mock already fixed prior
- [x] Verify nx lint/build/check:docs clean (58 pages); screenshots (single breadcrumb, progress bar, MCP single-col, home jargon) + commits

### Review
P3 polish batch done, 4 commits. Moot (already fixed earlier): skill version + ref count (derived), kata {framework} (substituted). Skipped: og:image (accepted placeholder). Agent B correctly rejected an inverted premise — FW_DEFAULT is 'angular', so first-component (Angular-first) was already right; tutorial+d2c were the divergent ones (fixed inline). Remaining open: deferred ideas 9-29, content follow-ups (checkbox/toggle [(value)] alias, .panel/.close-btn scoping, McpExplorer tool rename), content-review-1 P3 (figma-console-mcp suffix now done; rest minor).


## UX P2 batch — 2026-06-13

- [x] Agent 1: workshop-track.ts (Schulung→7 steps), BaseLayout (instructor group + MCP label + tocItems API + drawer pad), global.css (.docs-toc-mobile + scroll-fade)
- [x] Agent 2: TOC adoption — 6 pages migrated to tocItems; tokens+schulung gain TOC; schulung manual pager
- [x] Verify: nx lint clean + build 58 pages + screenshots; commits + push

### Review
6 open P2 closed. Verified live (local): tokens/schulung desktop TOC (7/6 sections), mobile "On this page" disclosure visible+expandable, drawer shows For-instructors group and scrolls with 80px bottom clearance, first-component "Step 6 of 7", topbar "MCP playground". One icon note: the instructor-group heading uses `school` (Icon.astro only registers a fixed set; unregistered names crash the build — same constraint hit twice). Still open: UX P3 list (~14), deferred ideas 9-29, content follow-ups (checkbox/toggle [(value)] alias, .panel/.close-btn scoping, McpExplorer tool rename).


## UX Top-5 implementation — 2026-06-12 (eve)

Report: tasks/review-docs-ux-2026-06-12.md · Top-5: track infra, 404, framework-state, checkpoints, search/drawer a11y

- [x] Wave 1A: workshop-track.ts + TrackNav.astro + Checkpoint.astro + BaseLayout (sidebar derive + drawer a11y + 44px targets)
- [x] Wave 1B: branded 404.astro
- [x] Wave 1C: ComponentDetail (import tabs framework-aware + aria-pressed) + McpExplorer (framework-pref + a11y + radius mock)
- [x] Wave 1D: Search.tsx keyboard nav + ARIA combobox + live region
- [x] Wave 2: TrackNav + Checkpoint + step indicator on 7 track pages; first-component {framework}-substituting prompt
- [x] Verify: nx lint (clean) + build (58 pages) + local screenshots + functional asserts
- [x] Commits (5 batches) + push

### Review

Wave-2 page agents hit the session limit mid-run (reset 00:20). State on resume: workshop + figma-token complete; design-to-code build-broken (left a BottomNav ref + renamed PROMPT→prompt(fw) without updating the body); tutorial/patterns/first-component/schulung partial or untouched. Finished all 7 by hand (mechanical, API was clear from the two completed pages).

**Two real bugs the agents introduced, caught at build:**
1. `design-to-code` referenced removed `BottomNav` and an undefined `PROMPT` — fixed by completing the TrackNav swap and per-framework prompt rendering.
2. **TrackNav used `arrow_forward`, which isn't in the Icon registry** (only arrow_back/left/right exist) — it never surfaced in wave 1 because TrackNav renders nothing until placed on a track page, so the bad icon name was only exercised once wave 2 wired it in. Switched to arrow_left/arrow_right.

Verified live (local): first-component shows "Step 7 of 8", prompt contains concrete `storybook-angular`, TrackNav prev=Design to code / next=Patterns; patterns renders prev-only (last step); workshop checkpoint present; schulung "for instructors" note + "Step 2 of 8"; 404 full chrome + studio metaphor; search ArrowDown sets aria-activedescendant + aria-expanded.

**Open (user decision):** Schulung placement — it's now flagged in-page as instructor material, but still sits as numbered step 2 of the participant path. Moving it out of the numbered sequence is a content/IA call.

**Not done (deferred ideas, report ranks 9–29):** framework-aware home routing, interactive token playground, "Edit this page", persisted progress checkmarks, embedded Storybook previews, changelog-from-ADRs, etc.


## Fix docs review findings (P1+P2) — 2026-06-12

Plan: ~/.claude/plans/mach-ein-review-von-delightful-axolotl.md · Report: tasks/review-docs-site-2026-06-12.md

- [x] A: Agent 1 — components.ts per-framework examples + gen-llms-txt.mjs + regen llms
- [x] A2/D2: Agent 2 — ComponentDetail.tsx renderer + Storybook link + H1 class swaps
- [x] C4: Agent 3 — patterns.ts + glossary.ts API-truth fixes
- [x] D0: repro demo-stretch/data-list locally (me) → D0/D1/D2-CSS: Agent 4
- [x] B/F: Agent 5 — build-time derivation (skill-meta.ts, llms.astro, skill pages) + ADR 0021
- [x] C2: Agent 6 — MCP overclaims (index, mcp, design-principles, claude-md, storybook anchor)
- [x] C1/C3/C4/C5: Agent 7 — tokens, install, prompts, figma, accessibility, workshop, first-component, schulung
- [x] A4: framework checker agents (3×) over the 84 examples — 3 Angular fails found & fixed, final 28/28×3
- [x] Final: check:docs/llms/metadata ✓, nx lint docs ✓, nx build docs ✓, re-screenshots ✓
- [x] Commits (conventional, batched) + push main

### Review

All 38 P1/P2 findings fixed across 7 batched commits (247a58a..8525cae). Key outcomes:
- **Root cause of the demo-stretch/data-list P1 was a library bug**, not docs CSS: unscoped
  `.size-*` width rules in `llm-dialog.css` leaked globally in the React/Vue builds and hit
  every `size-*`-classed element. Scoped to `.llm-dialog.size-*` / `dialog > .panel.size-*`
  in all three frameworks (byte-identical). Verified: demo button 576px→96px, data-list
  View 384px→62px, badges inline again.
- Per-framework examples shipped for all 28 components, audited 28/28 per framework against
  spec + exports + stories idioms; llms-full.txt now carries all three usage variants.
- Build-time derivation (ADR-0021) removes the recurring count-drift class; Figma counts
  corrected by hand against the live file (7 pages, 54 UI-tier vars, 27 sets).
- Broken-link warnings for `/storybook-*/?path=/docs/cookbook--*` are checker false
  positives (Storybook deployed separately on same domain; IDs verified in live index.json).

**Open follow-ups (out of scope, flagged by agents):**
- checkbox/toggle prop tables advertise an Angular `[(value)]` alias that the Angular
  adapter never implemented — spec-vs-impl drift, needs a component-trinity/ADR decision.
- `.panel`/`.close-btn` in llm-dialog.css are still generic global classes (no proven
  collision today); Angular's `<dialog>` never receives the `.llm-dialog` class (dead base
  rules). Worth a scoping pass.
- McpExplorer playground still simulates the 5 conceptual tools (now labeled as such);
  renaming them to the real toolset would be the deeper fix.
- P3 findings (15) from the review remain unfixed by decision.


## Review — Personal authorial signature (2026-06-02)

Typography + motion signature on top of Direction A (palette untouched). See ADR-0020.

- **Heading accent:** `Instrument Serif` 400 italic loaded via Astro Fonts API
  (`astro.config` 3rd entry → `--font-accent`; rendered in `BaseLayout`). New
  `--docs-font-accent` token + `.docs-accent` class (teal, serif-italic, inherits heading
  size). `PageHero` + `SectionHead` gained `titleAccent?: string` (first exact substring →
  `<em class="docs-accent">`; plain string otherwise — backward-compatible). Applied to
  `first-component` ("component"), `design-to-code` ("Code"), `tokens` ("tokens"),
  `index` SectionHead ("loop").
- **Motion sweep:** all ~27 hardcoded `transition:` in `docs/src/**` → `var(--ui-transition-*)`
  (`global.css`, `Jargon.astro`, `patterns/[id].astro`, `McpExplorer.tsx`, 3 inline pages).
  No new tokens; 520ms theme-reveal keyframe left as the deliberate one-off.
- **Verified:** `nx lint docs` clean (2 pre-existing warnings); `nx build docs` 57 pages OK;
  `.docs-accent` + Instrument @font-face + 3 woff2 subsets emitted; Astro auto-generated an
  Arial-metric fallback (CLS-safe). Reduced-motion now applies uniformly (all transitions
  derive from `--ui-duration-*`, zeroed under the media query).
- **Remaining manual step:** eyeball serif accent teal in light/dark in a browser.


## Active — `check:figma` Figma-Konformitäts-Gate (2026-06-01)

Plan: `~/.claude/plans/wir-schlie-en-die-einzige-eager-sun.md` (approved). Closes the
last AI-readiness layer without a drift gate (`plan/ai-readiness.md` §4).

**Decisions (locked via clarification):**
- Committed snapshot (`tools/figma/snapshot.json`) + offline `check:figma`.
- Refresh via figma-console MCP read-tools (spawn stdio client; devDep `@modelcontextprotocol/sdk`).
- Standalone npm script only — NOT in `check:all`, NOT pre-push.
- 5 core checks only; no `figma_lint_design` pass.

**Items:**
- [x] Capture real figma-console MCP output shapes to ground the snapshot schema
- [x] Add `@modelcontextprotocol/sdk` devDependency (`^1.29.0`)
- [x] `tools/scripts/figma-snapshot.mjs` — spawn MCP, probe (fail-loud if no plugin), write snapshot
- [x] Generate committed `tools/figma/snapshot.json` (P0 core: Button, Badge, Card)
- [x] `tools/scripts/check-figma.js` — offline gate, 5 checks, severity→exit, prioritized report
- [x] Extend `tools/scripts/lib/allowlists.js` with `FIGMA_CONFORMANCE_EXCEPTIONS`
- [x] `package.json`: `check:figma` + `figma:snapshot` (NOT in check:all)
- [x] `plan/figma-component-checklist.md`: annotate automated vs manual (+ `plan/ai-readiness.md` §4)
- [x] ADR `plan/adr/0019-figma-conformance-gate.md` + README index row
- [x] Verify: real findings · synthetic drift caught · `check:all` green · lint clean

### Review

Shipped `check:figma`, the drift gate for the last AI-readiness layer that had none.

**Architecture:** committed-snapshot + offline-check, in the repo's `gen-*/--check` idiom.
The only Figma-connected part is the refresh (`figma:snapshot`), which spawns
`figma-console-mcp` as a stdio MCP client; the gate itself reads `tools/figma/snapshot.json`
and is fully offline/deterministic. The snapshot holds Figma *facts* (names, variant axes,
descriptions, `layoutMode`, bound/unbound/raw per node); the gate holds the *rules*.

**Five checks:** name alignment (Blocker), variant-matrix completeness (Blocker), token-link
coverage (Critical), auto-layout (Critical), description congruence (Warning). Blocker+Critical
→ exit 1; Warning → exit 0 (symmetric with the other gates).

**Files:** new `tools/scripts/check-figma.js`, `tools/scripts/figma-snapshot.mjs`,
`tools/figma/snapshot.json`, `plan/adr/0019-figma-conformance-gate.md`; edited
`tools/scripts/lib/allowlists.js` (+`FIGMA_CONFORMANCE_EXCEPTIONS`), `package.json`,
`plan/adr/README.md`, `plan/figma-component-checklist.md`, `plan/ai-readiness.md`.

**Verification (all passed):**
- `npm run check:figma` → 5 real Critical token findings (unbound radii on Badge `9999`/Card
  `12`,`6`; unbound padding across Button/Badge/Card), exit 1. Not an empty pass.
- Allowlist proven: `LlmCardRole` (code-only landmark prop) raised a name Blocker; one
  `LlmCard:name:role` entry suppressed it correctly.
- Synthetic drift: added `'xl'` to `LlmButtonSize` → gate flagged `[BLOCKER] [NAME] LlmButton.size:
  Figma is missing value(s) ['xl']`; reverted clean.
- `npm run check:all` → exit 0 (no regressions). `eslint` on touched scripts → exit 0.

**Decisions worth remembering** (see ADR-0019 for full why):
- Description check is presence + spec-reference, not verbatim `== purpose` (Figma descriptions
  are intentionally richer; verbatim would warn on all 27 — pure noise).
- Component-set names are section-prefixed (`Action/LlmButton`) → compare the leaf.
- Figma's interaction `state` axis has no spec union → ignored by the name check.
- Childless frames (1px dividers) are exempt from the auto-layout check.

**Known follow-ups (documented, not silent):** committed snapshot covers 3 of 27 masters
(run `figma:snapshot` with the bridge for all 27); token/auto-layout sample the default variant;
masters without a spec interface (CodeBlock, Toast) will need allowlist entries on a full
snapshot; a snapshot-freshness check is the prerequisite to ever putting `check:figma` in CI.

**Note on in-session refresh:** `figma:snapshot` could not be executed live because this Claude
Code session already held the figma-console bridge (single-plugin-attachment); the committed
snapshot was built from the same MCP read-tools the generator uses, in the identical schema.

