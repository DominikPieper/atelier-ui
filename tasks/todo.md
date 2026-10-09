# Atelier — Status

_Restructured 2026-09-06. Was ~2,580 lines, append-only since 2026-04-21, 130 open
items. Closed and concluded work (twelve fully-checked dated sections, ~ten concluded
narrative retrospectives, and every mixed section's full original text) now lives
verbatim in `tasks/archive/` (five dated files, chronological, nothing deleted — see
each file's own banner). This file carries only what is still open, grouped by what
kind of action it needs next: near-term work first, then decisions the owner and I
need to walk through, then two collectors for related small findings, then blocked
items, then optional/low-priority ones. Open work is a checkbox item; a parent
checkbox that consolidates several original items carries them as nested checkboxes
underneath it._

## Near-term work

Ranked; each carries why it's worth doing next rather than later.

### Docs-site critique follow-up (2026-10-07)

Impeccable critique of the docs site scored 27/40 (snapshot in
`.impeccable/critique/2026-10-07T17-32-18Z__docs-src-pages.md`). Owner chose: all five
priority issues, typography first, and the hero/chrome should visibly practise the
Atelier token system instead of the generic gradient/grid look.

- [x] **1. typeset** — done 2026-10-07 (ADR-0155). Not a new scale: ADR-0088 had already
      decided the roles on the library's `--ui-font-size-*` and rejected `--docs-text-*`;
      its page-scoped second pass (review n13) simply never ran, and nothing gated it.
      Pages, islands and SVG diagram labels are now on the roles; `check:docs-layout`
      fails on any text under 12 px at 1440 (`[FONT-SIZE]`, negative-tested for HTML and
      SVG). Open from this step: the H2/body ratio (20/16) is still weak, and the guard
      does not cover the sidebar, topbar or collapsed `<details>`.
- [x] **2. shape** — done 2026-10-07 (ADR-0156). Home = H1 + one action + `LoopDiagram`
      (spec-sheet loop, also on `/design-to-code`); hero decoration, eyebrows and pillar cards
      gone; side stripes replaced site-wide; kit, `SKILL.md`, `brand-guide.md` updated, and the
      kit's broken token-sheet path fixed. Open: at a 1200 px window the Inspect card loses
      its leader lines.
- [x] **3. distill** — done 2026-10-07 (ADR-0157). Track-first sidebar with `<details>`
      groups (24 → 7 visible links on `/design-to-code`), `PageMeta` under the H1 instead of
      the eyebrow, one name, one MCP endpoint on the home, Prev/Step/Next bottom nav.
- [x] **4. clarify** — done 2026-10-07. `/design-to-code` in attendee language with a
      "Why (for maintainers)" disclosure per step; tutorial/kata roles stated on both pages;
      component pages label snippets by framework and say the preview is the React adapter;
      demos show every variant the API lists (button `danger`, card `flat`, tabs `pills`, …).
- [x] **5. harden** — done 2026-10-07 except two library findings (below). Forced-colors
      focus outline, unclipped search placeholder, one drawer close, scroll-top clear of the
      bottom nav, prompt blocks wrap, nav landmark labels distinct.
- [x] **5a. library: placeholder contrast** — done 2026-10-08 (ADR-0159). — `--ui-color-placeholder` `#64748b` on
      `--ui-color-input-bg` (= surface-sunken `#f1f5f9`) is 4.34:1, below AA, in light mode;
      `check:contrast` has no placeholder pair, which is why it passed. Needs an owner
      decision (token change touches all three adapters and Figma). Owner 2026-10-08:
      `#566579` (5.43:1 on input-bg, 5.94 on surface, 3.00 vs entered text); add the pairs.
- [x] **5b. library: dark disabled button** — done 2026-10-08 (ADR-0159); Figma master has a
      `label` text property and an opaque `_disabled-overlay`. Open: ~15 other components still dim
      by opacity (dark disabled input unmeasured); artboard generator has no disabled colours. — `.atl-button.is-disabled` relies on
      `--ui-opacity-disabled: 0.65` in dark, so Disabled/Loading read as enabled. Owner
      2026-10-08: dedicated button disabled colour tokens (reverses the manifest's
      "opacity, not colour tokens" rule for the button → ADR).
- [ ] **5c. AtlTextarea Readonly hover border** — Angular and Vue render a transparent border on
      hover where Figma and React draw `surface-sunken` (recorded in `paint-baseline.json`
      2026-10-08, surfaced by the Boolean-cover round of `check:paint`, ADR-0159).
- [x] **6. delight** — done 2026-10-07. Kata ends with a real finish (recap, one action to
      `/patterns`); WIP banner calm, dismissible, remembered before paint.
- [x] **7. polish + re-critique** — done 2026-10-07. Re-critique scored 26/40 (was 27): a fresh
      reviewer found new, pre-existing problems rather than regressions. Its P1s are open as 8–10.
- [x] **8. gallery shows components** — done 2026-10-08: 28/28 live previews (overlays at rest,
      `inert` + `aria-hidden`, CLS 0), framework-dot legend; +~13 KB gz JS, +9.7 KB gz CSS. — `/components` cards are letter monograms; render
      previews, legend for the framework dots. Owner 2026-10-08: live mini-previews from the
      React adapter (overlays as static resting states).
- [x] **9. track ends on a finish** — done 2026-10-08 (ADR-0158): 6 steps, `/patterns` in the
      Reference group; measured "Step 6 of 6" on the kata, no track chrome on `/patterns`. — step 7 `/patterns` is a reference page ending on a
      "Previous" card; the finish moment sits on step 6. Owner 2026-10-08: the track ends on the
      kata (6 steps); `/patterns` stays reference, linked from the finish.
- [x] **10. one framework switcher** — done 2026-10-08. Kata uses `FwSwitcher`; it is now a
      toggle group (`aria-pressed`, 44 px measured) with a quiet "Remembered from your last
      visit" / "Set by this link" hint. Only one storage key existed already (`atelier.fw`).
      Footer fixed in step 11–13's commit. Left: code-block tab strips on `/patterns`,
      `/patterns/[id]`, `/claude-md`, `/prompts` stay hand-rolled (small targets, no hint;
      they do get `aria-pressed` from the shared script).
- [x] **11. mobile prose column** — done 2026-10-08: 358 px column at 390 px (measured). — `.docs-inline-page` keeps `padding: 2.5rem 2rem` at 390px
      (global.css:624, no override) on top of the shell gutter: 294 px column, 28–41
      characters per line on 26 pages (critique 3, 2026-10-07).
- [x] **12. `/design-to-code` wayfinding** — done 2026-10-08: 6-entry TOC; settled/owed moved
      verbatim into the Contract disclosure. — 7 H2s and no `tocItems`; the Contract section's
      settled/owed theory still sits inline instead of in its maintainer disclosure.
- [x] **13. small consistency** — done 2026-10-08 (footer from 10 too: x=256 at 1440). — topbar "Workshop" active only on `/workshop`; "Patterns" vs
      "Cookbook patterns"; gallery slices descriptions at 85 chars mid-word; "Identical APIs"
      claim (`ComponentGallery.tsx:65`) contradicts the framework-native story.

- [x] **14. dark-mode logo** — done 2026-10-08: `logo-dark.png` (glyph recoloured to `#f1f5f9`,
      ~13.8:1), switched by `[data-theme]` with an OS fallback; measured in all three states. — the black "A" in `logo.png` vanishes on `#0a1116`
      (`BaseLayout.astro:333`); dark variant or SVG with `currentColor` (critique 4, P1).
- [x] **15. `/workshop` distill + outline** — done 2026-10-08: own h2 for the setup steps, route
      cards at the end with page names, contributor note in a closed `<details>`, 5-entry TOC. — contributor callout before step 01; steps are h3
      under "Install prerequisites"; four route cards mid-page; no TOC (critique 4, P1).
- [x] **16. one numbering** — done 2026-10-08: setup steps are a checklist; `/tutorial` A–E became
      the four loop stages (C+D under Generate), diagram too. — track 1–6, setup 01–04, loop 1–4, tutorial A–E; numerals for
      the track only, the four loop stages named the same everywhere (critique 4, P1).
- [x] **19. no gate sees TS errors in library builds** — done 2026-10-08 (ADR-0160): `vite-plugin-dts`
      `afterDiagnostic` throws; negative-tested for `.vue` and `.ts`. — `nx build vue` printed TS7053
      (`atl-breadcrumbs.vue:53`, fixed 2026-10-08) and exited 0; `check:types` runs `tsc` on the
      spec tsconfigs only, and plain `tsc` does not read `.vue`. Needs `vue-tsc --noEmit` or a
      gate that fails on `error TS` in the build output.
- [x] **17. jargon in attendee copy** — done 2026-10-08: kata ADR-0097 theory in a maintainer
      disclosure; tutorial lede links the MCP section; prompt follows the framework switcher. — `first-component.astro:180,215`, `tutorial.astro:165,193`,
      `design-to-code.astro:317,377`; "The switcher below stay in sync" (critique 4, P2).
- [x] **18. preview vs. switcher** — done 2026-10-08: one note under the switcher; gallery dots
      removed (identical coverage); previews fit; search placeholder on the token. — one note above the switcher that the preview is the shared
      look and the switcher changes code only (owner 2026-10-08); gallery dots identical on all
      28 cards; Card/CodeBlock previews clipped; gallery search placeholder 4.4:1 (UA default).

> **Picking this up in a new session?** Read
> `tasks/handover-design-skills-2026-09-08.md` first — it carries what is blocked
> (figma-console reconnect, 37/37 parity DRIFT), the agreed order of next steps, the
> scratch Claude Design project, and the eval-harness facts.

> **Cross-model plausibility review, 2026-09-08:**
> `tasks/review-plausibility-2026-09-08.md` — 30+ findings across the docs site, the
> four skills, the newest ADRs and this file's companion handover, with what was
> verified and what is single-reader. Nothing fixed yet; the four that change
> behaviour are A1 (mcp.astro still shows the pre-ADR-0097 "via React" model), A2 (28
> vs 29 components, `radio` missing from the docs catalog), A5 (the MCP playground
> POSTs invented tool names at the live endpoint) and C1–C3 (`artboard-bridge`
> governance ordering, the confirmation carve-out, and the Publish etag window).

> **Training-content review, 2026-09-08:**
> `tasks/schulung-content-review-2026-09-08.md` — the first pass over the _whole_
> teaching surface (agenda, docs site, briefs, talk, the `plan/` files the curriculum
> injects into prompts), asking whether the material teaches rather than whether it is
> accurate. Ran without a second model (Codex quota, agy quota) — a Codex Gegenprobe is
> ran at 00:25 on 2026-09-09 and is recorded in that file (ten new findings; **G1** is a
> defect in the fix § B recommends — the `design-to-code` skill's handoff template sends
> the participant's spec into the shared master that the curriculum warns them off).
> **Second round, same day: § B, § C, G5, G8, G9 and G10 closed too** (ADR-0116 cite the
> source not the value — `big-picture.md` is prompt context and is now on the real API,
> with fictional props cut rather than replaced; ADR-0117 the silence was not the
> decision — both new skills named in participant material, `claude-design.astro`'s
> absolutes narrowed without weakening its fence argument). **G1–G4, G6 and G7 were fixed on 2026-09-09** (ADR-0113 the workshop branch, ADR-0114
> the state axis, ADR-0115 the token ownership map); **G5, G8, G9, G10 stay open**, as do
> § B and § C. Both § A blockers were
> fixed the same day — the 10.6 curriculum sweep, and the `test-run` workspace-discovery
> regression (ADR-0112, now gated by `check:vitest-discovery`). The rest is
> open, and § B — the two new skills being invisible to the material, and the ADR-0096
> handoff document missing from the English learner path — is the part with the most
> leverage.

> **Spec-format review, 2026-09-10:** `tasks/spec-format-review-2026-09-10.md` — the
> first review of `libs/spec` as a _format_ (five repo agents, one web scan, Codex
> Gegenprobe). Verdict: the spec is a naming key for the drift gates, not a component
> contract; the compiler binds only React (Angular 1/29, Vue 0/29 import an interface);
> 27 of its exports are referenced by no adapter; defaults, descriptions, events, slots,
> states, tokens-per-part and Figma provenance live in three to seven hand-written copies
> elsewhere, none derived. The scaffold ships no contract infrastructure, and no page
> states what the spec does for a one-framework team. Twenty findings, two blockers
> (F1 false compiler-parity claim in README/big-picture/ADR-0006; F12 the scaffold ships
> no contract infrastructure, so "run the same steps" is not held). Decision open — § 6
> there: **A** honesty pass
> now regardless; **B** one authored contract record with everything else projected as
> the direction, its own ADR naming ADR-0006/0010/0096 as revised.

- [x] **0.3.5 on npm is not this repo's 0.3.5 (found 2026-10-03; resolved by 0.3.6 the same day, `12840b2e`: all six packages published from that commit, react depends on styles 0.3.6, a fresh npm consumer bundle carries the shared and native CSS, `check:release-drift` exits 0).** Guards done 2026-10-03
      (ADR-0150: `--pre-publish` task, `[CONTENT-DRIFT]` via `gitHead`); still open is (1), the
      0.3.6 release itself — pushing the guard commit triggers it. A release run on
      2026-10-01 (`9a14c13c`, run 36884693651) published react, angular, vue, create-workspace and
      create-atelier-ui-workspace 0.3.5, then failed before its release commit and tag. Today's
      release (`cfd43ce6`) re-used 0.3.5. npm skipped the five existing versions, and only
      `@atelier-ui/styles@0.3.5` is new. So the published react/angular/vue 0.3.5 are the
      pre-migration code: self-contained and working, but without ADR-0148. Needed: (1) a 0.3.6
      release carrying the migration; (2) make the publish step fail instead of skipping when a
      version already exists on npm; (3) `check:release-drift` compares versions only, so it
      should also catch "same version, different content", e.g. by comparing the published
      `gitHead` with the tagged commit.

- [x] **Menu: disabled items — React/Vue now keep them focusable, as Angular and the APG do (2026-10-07).**
      React and Vue render `aria-disabled="true"` instead of a native `disabled` button; disabled
      items stay in the arrow, Home, End and type-ahead rotation, and Enter, Space and click do
      not activate them or close the menu. The CDK source (`skipPredicate(() => false)`,
      `attr.aria-disabled`) confirmed the Angular side.

- [ ] **Structure lessons from the DB UX Design System (planned 2026-10-01).** Comes out of
      a fact-check of a Gemini Deep Research report on multi-framework design systems. The
      report says DB UX (`db-ux-design-system/core-web`) maintains native Angular, React and
      Vue implementations in parallel in an Nx monorepo — **both false**: it writes every
      component once in Mitosis (`*.lite.tsx`; `packages/components/configs/mitosis.config.cjs`
      targets angular, vue, react, stencil) and is a pnpm workspace with changesets (no
      `nx.json`). Mitosis is not on the table — it would cost the Angular idioms the workshop
      teaches (signals, `model()`). Worth copying is the package cut around the components:
      one SCSS per component usable without JS (`db-*` classes), a separate
      `@db-ux/core-foundations`, lint packages for consumers (`@db-ux/core-stylelint`,
      `@db-ux/core-eslint-plugin`), docs beside the component
      (`<name>/docs/{HTML,Angular,React,Vue,Migration}.md`, `examples/`). Lockstep releases
      we already have. Parked in `plan/roadmap.md` ("Later: runtime coverage beyond
      Storybook"): Angular SSR showcase, ARIA snapshots.
      **Order (owner, 2026-10-01): P1.0 first** — find out whether one CSS source carries at
      all — then decide P1 vs. P2. Each P that settles an approach gets its own ADR.
      **Framework scope (owner, 2026-10-01):** Angular is the default and first workshop
      framework, but React and Vue may still be taught — Angular-first decides order and
      design, not whether the other two adapters stay maintainable.

  - [ ] **P1 — One source for component CSS instead of three hand-kept copies.** Facts
        (verified 2026-10-01): React and Vue CSS are byte-identical for 27 of 29 components
        (`chat`, `table` differ). Angular uses `:host` under Emulated encapsulation (only
        `tooltip`, `table`, `menu` use `None`); React/Vue use a root class `.atl-X`. A
        mechanical `:host` → `.atl-X` rewrite makes Angular equal React for only **5 of
        29**; the other 24 differ by scoping (Angular relies on Emulated for bare selectors
        like `.variant-icon`, React writes `.atl-badge .variant-icon`), by DOM (`select` is a
        native `<select>` in React, a custom trigger in Angular; `dialog` splits its parts
        differently) and by comment drift. No gate compares the CSS: `check:sync` checks
        directory names and story presence only (its own header says so); `check:variants`,
        `check:dead-selectors`, `check:box-sizing` run per framework because the CSS is
        triplicated. Shipping today: Angular inlines via `styleUrl`, React via
        `import './atl-X.css'`, Vue extracts into `index.css`.
    - [x] **P1.0 Inventory — done 2026-10-01**, `tasks/p1-css-inventory-2026-10-01.md`.
          **Verdict: one CSS source carries.** 23 of 29 components need no genuine
          difference — 9 transform-only, 12 scoping-only, 2 scoping plus a value fix. Of the
          rule-aware pass's 195 residual lines, 155 are `select` and `tooltip`. The 6
          DOM divergences: **deliberate** — `select` (native vs CDK listbox), `tooltip` (CDK
          overlay), `menu` (CDK menu), `table` (`atl-tr` with `display: contents`); these
          need a per-framework override file, not convergence. **Incidental** —
          `breadcrumbs` (custom element between `<ol>` and `<li>`; a11y snapshots equal).
          **`drawer`** — React's wrapper is deliberate, Vue's is a bug (below).
          The transform is not purely mechanical. It needs a per-component root/host-class
          table, tag → class rules, `:host(X):host-context(Y)` → `Y X` (15 uses: accordion,
          card), and class renames (combobox 21, breadcrumbs 5, avatar and drawer aliases).
          Side benefit: React/Vue carry 80 rules with no `.atl-*` root (`.spinner`,
          `.track`, `.page-btn` …) that leak globally today; a generated, root-prefixed copy
          removes the leak.
          Surfaced bugs, independent of P1 (both statically confirmed by me; not checked in
          Storybook):
      - [x] **Fixed 2026-10-01 (`c8273cbe`).** **Angular `AtlStepper` uses `--step-circle` / `--step-connector-width` and
            never defines them** (`libs/angular/src/lib/stepper/atl-stepper.css:41,59,60,188,192`);
            React/Vue define them at `atl-stepper.css:15-16`. Reproduce in Storybook first.
      - [x] **Fixed 2026-10-01 (`b21a0e0b`; contract probe note corrected in `643597f9`).** **Vue `AtlDrawer` puts `atl-drawer-host` on the `<dialog>` itself**
            (`atl-drawer.vue:83-99`), so every `.atl-drawer-host dialog` rule
            (`atl-drawer.css:38,59,65`) misses. The headless probe measured the open dialog
            at `display: block` and ~88px wide instead of `flex` and 448px. Reproduce in
            Storybook first.
    - [x] **P1.1 Spike — done 2026-10-01**, `tasks/p1-1-spike-2026-10-01.md`. A 208-line
          prototype generator plus a 30-line config (scratchpad only, not kept) reproduces
          today's React/Vue CSS for 23 of 29 components, comment-stripped and after
          Prettier. I re-counted that independently. It needs 32 config entries: 5 inherent
          and 27 accidental naming or scope drift. A rename pass first brings that to about
          8, at a cost of roughly 14 Angular and 6 React/Vue template lines.
          `select` and `tooltip` stay hand-kept overrides, about 140 lines.
          **Caveat:** 11 of the entries are a `scope: 'bare'` switch whose only job is to
          reproduce today's global leak (~80 React/Vue rules with no `.atl-*` root). The
          intended policy is prefix-everywhere, which changes three places that depend on
          the leak today: chat `.close-btn`, drawer `.panel`, toggle `.track`.
          Second model: Gemini 3.1 Pro (Codex quota out until 2026-10-06), via
          adversarial review. It independently picks A. Its new risk is specificity: the
          `:host-context` → `.atl-x.y .z` rewrite raises specificity for consumer overrides.
          It also re-flags the leak, which is correct for the default config.
    - [x] **P1.1b Spike Option C on button, badge, dialog — done 2026-10-01**, committed as the
          first migration step (`0ed39bb6`..`fabae87b`). The React blocker below was solved by
          publishing `@atelier-ui/styles` (owner's choice), proven by `check:pack-styles`. One class-rooted file per component in `libs/styles/src/<dir>/`
          (Nx project, for stylelint and module boundaries). Angular uses
          `ViewEncapsulation.None` plus a static root class on the host, which survives
          `[class]`; React and Vue import the same file.
          Green: `check:all`, `storybook-test`, `test` and `lint` for all three frameworks.
          The declaration-level diff against the old React CSS is zero, and 151 Angular
          elements measure identical computed styles.
          **Blocker: the React package is broken as built.** `dist/libs/react/.../atl-button.js`
          imports `@atelier-ui/styles/button/atl-button.css`, which resolves nowhere, and no
          CSS is copied. I verified this myself.
          Caveats: Angular-projected content inside `button`/`dialog` now gets
          `box-sizing: border-box`, as React/Vue already do, which consumers can see.
          `FORCEPREFIX` output needed hand fixes: an impossible
          `.atl-dialog dialog > .panel`, and descendant selectors that hit consumer content
          (a select's `.panel` inside a dialog), so four selectors became child combinators.
          Prefix-everywhere is therefore not safe by itself. `@keyframes` names stay global
          (`shimmer` and `toast-enter` would collide). Two gates had passed vacuously (see
          the separate item below). Stale paths remain in `tools/figma/parity.json`,
          `plan/` and the ADR text. `tools/parity/typeface-baseline.json` was rebaselined:
          dialog NO-SIZE went from 3 identities to 1, the same debt deduplicated. Review it.
    - [x] **P1.2 ADR — done 2026-10-01: ADR-0148**, Option C plus a published
          `@atelier-ui/styles`. The owner questioned my lean towards A, and C won: the file
          read is the file shipped. ADR-0028 carries the dated correction.
    - [x] **P1.3 Migrate the remaining 26 components, one per commit — done 2026-10-02.** Per component:
          write the class-rooted file in `libs/styles` (the spike generator in
          `tasks/spikes/p1-css/generator` with `FORCEPREFIX=1` as a one-time aid, then fix by
          hand); give generic part classes (`.panel`, `.track`, `.close-btn`, `.spinner`) the
          child combinator; prefix `@keyframes` names; switch Angular to `None` with a static
          host root class; switch React/Vue to the shared import; delete the three old files.
          **Done per component when** `check:all` (incl. `check:pack-styles`) and the three
          `storybook-test` runs are green and a before/after computed-style probe of the
          Angular stories shows only the documented changes. Order: the 9 transform-only
          components, then the 12 scoping-only ones, then stepper and toast, then breadcrumbs
          (DOM convergence) and drawer, then menu and table, and select and tooltip last
          (with per-framework override files). Check the three spots that change visibly when
          the leak closes (chat `.close-btn`, drawer `.panel`, toggle `.track`) in a browser.
          **Progress 2026-10-02:** 11 of 29 migrated (button, badge, dialog in P1.1b; batch 1
          alert, checkbox, icon, input, radio, radio-group, textarea, toggle in
          `948e34dd`..`ef83e334` plus fix-forward `e6f5362a`); `check:all` exits 0. Findings:
          checkbox now takes Angular's hover-on-invalid behaviour, so a hovered invalid
          checkbox keeps its red border in React/Vue too (visible change there). Table's
          `.atl-tr-select-cell .atl-checkbox label` now matches in Angular
          (`justify-content: center`); its dead-selector exemption was removed. The
          stylelint exemption-staleness scan now reads `libs/styles` as evidence
          (`sharedRoot`). The toggle `.track` leak comes from progress's unrooted `.track`
          and closes only when progress migrates. Checked by me: 11 shared files, 168
          selectors, 0 unrooted, every `@keyframes` prefixed. Not covered: the React side was
          probed only for toggle; the others rest on story tests and the shared file.
          **Progress 2026-10-02, batch 2:** 21 of 29 migrated. Batch 2 is skeleton,
          code-block, pagination, progress, avatar, tabs, accordion, card, chat and
          combobox (`379e0d7b`..`3561298c`), with fix-forwards `e29b7c7f` (typeface
          rebaseline) and `eb4de871` (`check:figma` resolves child-combinator parts).
          `check:all` exits 0.
          The migration fixed five Angular bugs that Emulated `:host` had been hiding, and
          each is a visible change in Angular:
          the card slots had no padding at all (the default card grows from 82.5px to
          226.5px);
          every accordion item got a bottom border (the group is now 1px shorter);
          chat `status-streaming` never matched;
          the code-block host was never styled;
          the avatar group host was styled as an avatar.
          `check:figma` had been skipping layers silently whenever a part was rooted
          through child combinators: 31 resolved before, 77 after.
          Progress → toggle leak, measured: the toggle `.track` goes from
          `overflow: hidden` to `visible` in the React showcase, and the thumb was never
          clipped.
          Chat `.close-btn` now states `margin-left: 0` and `line-height: normal`, so a
          later drawer migration cannot change it.
          The new stories `NestedPadding` (card), `NestedGroups` (accordion) and
          `PanelScope` (tabs) pin the nesting case. The card and accordion ones fail in
          React with descendant selectors.
          combobox was renamed on the Angular side.
          Checked by me: 21 shared files, 391 selectors, every one rooted in `.atl-*` or
          `[data-theme]`, every `@keyframes` prefixed.
          Open: Vue visuals rest on `storybook-test` only.
          **Batch 3, done 2026-10-02:** stepper, toast, drawer, breadcrumbs, table, menu,
          tooltip and select (`c05003ea`..`b74562ff`), plus `2599781d` (gates read override
          sheets), `d660926f` (gen-box-sizing) and `e78b7d6c` (ADR-0148 Decision 4
          correction). `check:all` exits 0. All 29 are migrated.
          The per-framework overrides are `atl-<name>.<fw>.css` next to the component. The
          ones that exist: table (Angular), menu (React, Vue), tooltip and select (all
          three); React's and Vue's copies are byte-identical.
          Visible Angular changes from bugs the old setup hid:
          menu rows were content-box (224px in a 192px menu, now 190px);
          tooltip LongText goes from 336px to 320px;
          table's five sub-components were still Emulated;
          the drawer host is now `display: contents` (showcase 12px shorter);
          the select label is now styled as in React/Vue.
          React/Vue `th.align-*` was out-ranked by `thead th` and is now fixed.
          breadcrumbs converged on the React/Vue DOM (host is the list item, current page
          is `<span aria-current>`), and the a11y snapshot passes unmodified.
          drawer's `check:paint` NO-PROBE is resolved.
          Checked by me: 38 shared and override files, 615 selectors, 0 unrooted, no
          `:host`, every `@keyframes` prefixed.
    - [ ] **Owner decisions from batch 3.** (2) and (4) were settled on 2026-10-03: the
          React/Vue override is now `libs/styles/src/<dir>/atl-<name>.native.css`
          (ADR-0148 Decision 4, "Corrected 2026-10-03"), and `check:paint` fails with
          `[STALE]` when its Storybook build is older than the source. (1) and (3) stay open.
          (1) **Drawer padding:** the Figma master draws 16/20px, the CSS states 20/24px.
          14 `allowlists.js` exemptions hold this until you decide which side is right.
          (2) **React and Vue override files are byte-identical** (menu, tooltip, select).
          Proposal: one shared `libs/styles/src/<dir>/atl-<name>.native.css`, imported by
          React and Vue, so "React and Vue, not Angular" has a home.
          (3) **breadcrumbs NoLinks:** a non-current crumb without an `href` renders
          semibold in all three frameworks now, so all three crumbs are bold in Angular's
          NoLinks story; fixing it is a shared-CSS change.
          (4) **`check:paint` reads the built `dist/storybook`**, not the source. It
          checks nothing until `check:storybook-manifests` has rebuilt; decide whether to
          make that dependency explicit.
    - [x] **P1.4 Retire what the migration makes redundant (2026-10-03).** Remove the per-framework
          fallback in `componentCssFiles()` once no per-framework stylesheet is left. Then
          re-evaluate `check:variants`, `check:dead-selectors` and `check:box-sizing`: do
          they need to run three times over one file? Add a lint rule, "every selector
          rooted in `.atl-*`", out of the spike's leak script; per ADR-0126 it is
          single-file, so it is a stylelint rule, not a gate.
          Done: the fallback is gone from `componentCssFiles()`, `gen-box-sizing` and
          `check-figma`; `atelier/rooted-selector` is wired for `libs/styles` and the
          framework overrides, with 31 `node:test` cases run by `check:stylelint`. The
          three gates stay: variants and dead-selectors judge each framework's own
          templates and overrides, and box-sizing already judges a shared sheet once.
    - [x] **Two gates passed vacuously (fixed 2026-10-03: `[PARTIAL-COVERAGE]`; `check:figma` ratchets its 80 unresolved layers)** (found by P1.1b): `check:box-sizing` covered 78
          of 87 stylesheets and `check:dead-selectors` 80 of 89 before the path fix. Make
          each fail when it finds fewer stylesheets than component directories (ADR-0080).
          This is independent of the migration.
    - [ ] **Batch-3 decisions (1) and (3), owner 2026-10-03.** (3) is done in `4ea59019`:
          a crumb that has no link and is not the current page renders
          `<span class="breadcrumb-text">` (regular weight, muted), and only the current item
          keeps `breadcrumb-current` and `aria-current="page"`. That is pinned by a `NoLinks`
          play in all three libs. Found along the way: Angular and React mark the _last_ item
          as current, while Vue uses an explicit `current` prop. That is an older
          cross-framework difference and not part of this fix; check it against the contract.
          (1) Owner decision: **the CSS is right.** The Figma drawer master moves to 20/24px
          padding, a 20px title and a 12px footer gap, matching AtlDialog. Then the 14
          `AtlDrawer:layer:*` exemptions in `allowlists.js` are deleted. This is blocked
          until the Desktop Bridge is connected to the Atelier UI file: on 2026-10-03 it was
          connected to a different file, so nothing was changed.
          **Done 2026-10-03 in `d291e7cd`.** All 7 drawer variants are bound to `spacing/5`,
          `spacing/6`, `spacing/3` and `font-size/xl`. The 14 exemptions are deleted and
          `check:figma` exits 0. **Correction to my argument:** I told the owner that
          AtlDialog's master matches the CSS "with 0 exemptions". That was an absence of
          signal, not agreement. AtlDialog's header, content and footer layers are unnamed
          `Frame`s, so `check:figma` captures no layers for it (`layers: []` in the
          snapshot). It also has no `LAYER-UNRESOLVED` entries, because that ratchet only
          counts _named_ layers. The drawer agent read the dialog's real values: its footer
          is 16/24px against the CSS's 20/24px.
    - [x] **AtlDialog master is not layer-checked at all.** (2026-10-03) Header, content and
          footer frames are named in all 5 variants, so `check:figma` compares them. Footer
          20/24 and gap 12, content 24/24 and the 20px title now follow the CSS (c286d6f0).
          `check:figma` also counts _unnamed_ auto-layout frames per master now
          (`LAYER-UNNAMED` in `type-baseline.json`: 127 in 5 masters, AtlTable 75, AtlAvatarGroup
          20, AtlDrawer 14, AtlDialog 10, AtlToast 8); a new one fails, a named one fails until
          re-recorded.
    - [ ] **AtlDialog draws its header and footer rules as 1px divider frames.** The CSS has a
          border-bottom on the header and a border-top on the footer; the master has two empty
          frames between the layers. Same pixels, so four `AtlDialog:layer:border|stroke`
          entries in `allowlists.js` carry it. Move the rule onto the layers as strokes (as
          AtlDrawer draws it), delete the dividers and the four entries. The footer buttons
          are anonymous `Frame`s too (10 of the `LAYER-UNNAMED` entries); instances of
          AtlButton would retire them.
    - [ ] **Follow-ups from ADR-0149 (2026-10-03).** Split the 80 `LAYER-UNRESOLVED`
          entries in `tools/figma/type-baseline.json` into `design` (true wrappers,
          auto-layout frames) and `gap` (parts whose layer name does not spell their
          class); today all are `design`. Remove the dead `:host` handling in
          `check-typeface` and `check-geometry`.
    - [ ] **Before merging to main:** `check:release-drift` will report
          `@atelier-ui/styles` as unpublished and exit 1 until the first release; the
          main-only CI job goes red. Check whether the npm token may create a new package
          under the `@atelier-ui` scope. Publish order is already dependency-first
          (ADR-0148 Decision 3). Stale paths to refresh: `tools/figma/parity.json` (needs
          a figma re-verify), `plan/` and the ADR text naming per-framework CSS.

  - [x] **P2 — Foundations as its own lib, tokens' source of truth moved there. Done 2026-10-05 as ADR-0151** (`e375af65`, `13ae030b`): the source is `libs/styles/src/tokens.css`, published as `@atelier-ui/styles/tokens.css`, with every other copy generated; the stale preset comment is fixed. P2.3 (the three byte-identical `foundation/*.mdx` pages with literal hex values) stays open.
        **Re-think after ADR-0148:** with a published `@atelier-ui/styles`, the tokens
        likely belong in that package rather than a private `libs/foundations`. Decide
        before P2.1. Facts
        (verified 2026-10-01): canonical `tokens.css` sits in the scaffold template
        (`libs/create-workspace/src/generators/preset/files/styles/tokens.css`);
        `sync-tokens.mjs` copies it to `libs/{angular,react,vue}/src/styles/` and
        `skills/atelier-design/assets/colors_and_type.css`; `docs/src/styles/tokens.css`
        imports the _React_ copy; `stylelint.config.mjs` and the `nx.json` inputs point at
        the preset copy; `icons.ts` is copied 3× by `sync-spec.mjs`;
        `foundation/{colors,spacing,typography}.mdx` exist 3× by hand; no font files. The
        preset comment saying published packages ship no `tokens.css` is stale (all three
        builds copy it). Scaffolded workspaces vendor `tokens.css` on purpose (attendees
        edit it) — that stays.
    - [ ] **P2.1** `libs/foundations` (private, not published — no new release surface)
          holds `tokens.css` as source of truth; the preset becomes a generated copy like
          the others. Repoint `sync-tokens.mjs`, `stylelint.config.mjs`, `nx.json` inputs,
          `gen-figma-library-tokens.mjs`, and the docs import.
    - [ ] **P2.2** Fix the stale preset comment about `tokens.css` not shipping.
    - [ ] **P2.3** Decide: three `foundation/*.mdx` copies → one source plus generated
          copies, or docs app only.
    - [ ] **P2.4** Small ADR, or a dated correction of the ADR that made the preset copy
          canonical (find it first); record publishing `@atelier-ui/foundations` as
          considered and deferred (tokens already ship in each framework package).
          **Done when** exactly one hand-edited `tokens.css` exists, `check:tokens` diffs
          every copy against it, `check:all` green.

  - [ ] **P3 — Lint rules as a package, and a consumer-usage rule set.** Facts (verified
        2026-10-01): `tools/stylelint-rules` has four rules (`no-raw-color-literal`,
        `no-undeclared-token`, `no-primitive-token`, `no-token-bypass`), **no tests**, not
        publishable; the preset vendors all six files byte-identically, held by
        `check:preflight-clone-sync` (ADR-0130). `tools/eslint-rules` is repo-internal
        hygiene only. No rule validates how a consumer uses Atl components.
    - [x] **P3.1** Rule tests, one valid and one invalid case per branch, exemption maps
          included. Done 2026-10-06 as `node:test` files beside the rules (not Vitest: that is
          how `rooted-selector.test.js` is wired and `check:stylelint` already runs it), one per
          rule, fixtures in `os.tmpdir()`. Not vendored into the scaffold:
          `tools/scripts/sync-preflight.mjs` clones an explicit list, and the tests read repo
          paths a scaffold lacks. Known limit, recorded not fixed: token values, the allowlists
          module and the staleness scan are cached per process, so a long-lived editor server
          keeps the first answer until restart. Commits: `45a9cf50` (tests), and test-first fixes
          `2472c279`, `04db7926`, `036a6405` for four defects the tests found.
    - [x] **P3.2 Owner decision: package or vendored. Decided 2026-10-06: vendored, as
          today** (participants adapt the rules for their own design system). A published
          `@atelier-ui/stylelint-plugin` would retire the vendored copy and that part of
          `check:preflight-clone-sync`; against it, the vendored copy is readable and
          editable in the attendee's repo — curriculum value. Judge it as curriculum first.
    - [x] **P3.3 — done 2026-10-06 as ADR-0152** (`4be078c3` dev-mode warnings in Angular and Vue, `4394f6f0` two vendored template rules; spike report `tasks/p3-3-angular-usage-rules-spike-2026-10-06.md`). Follow-ups: `AtlCombobox` has no `label`/`aria-label` API at all (an a11y API gap that needs a spec decision); the input/textarea `label-title-only` axe waivers may now be removable; run the generated scaffold's own `nx lint` with the new rules; add `tools/eslint-rules` to the scaffold's lint cache inputs. Original item: Spike: Angular consumer-usage rules (`@angular-eslint` template rules).
          List 3–5 checks Angular's strict template type-check does _not_ catch (icon-only
          `atl-button` without `aria-label`, `atl-dialog` without a title, `atl-option`
          outside `atl-select`). Build only if at least three survive; else record and drop.

  - [ ] **P4 — Docs beside the component; retire the hand-written docs props.** Re-scoped
        with the owner on 2026-10-07 after a read-only survey. That survey found two of my
        earlier P4 assumptions wrong: `gen-llms-txt.mjs` reads neither `aiUsage` nor `a11y`,
        and no story carries a `docs.source` an example could come from. S6 (retiring
        `libs/spec/src/index.ts`, the metadata modules, `behaviors.json`, `tokens.manifest.ts`
        and `check:props`) stays its own project. It needs an answer first on ADR-0121's
        contradictory Option B (rejected at lines 140-144, kept open as S6(c) here) and a
        home for `check:props`' `[DEAD]` (a declared but unread prop, which a manifest cannot
        see). Facts (2026-10-07): `docs/src/data/components.ts` has 2569 lines, 28 entries and
        162 hand-written prop rows; `check:docs` checks name, type and default one way only.
        Empty prop descriptions in the docgen manifests: Angular 4/145, React 49/163, Vue
        126/138. The docs build runs before the Storybook builds (`wrangler.jsonc`), so the
        manifests do not exist yet when the docs would need them.
    - [x] **P4a — prop tables from the three `components.json` manifests. Done 2026-10-07, ADR-0154** (final shape `572cbcf3`): a committed projection, `docs/src/data/props.generated.json`, generated from the manifests and pinned by `check:props-projection` in `check:all`. The docs, `llms.txt` and `check:defaults` read the JSON; nothing needs Storybook or `dist/` at docs-build, release or pre-push time. A first version read the manifests at build time and set off a chain of follow-up fixes; it was reworked (see `tasks/lessons.md`, 2026-10-07; the partial fix is in `git stash` as "abandoned: llms freshness chain"). `components.ts`: 2569 → 1698 lines. Still on hand-written rows: sub-components no manifest describes (AtlOption, AtlTr/Th/Td, AtlTab, AtlStep, AtlMenuItem, …) and toast. `llms.txt` stays; owner noted it could be dropped if it ever made the setup too complex, and it no longer does. Original item: Step 1: write the
          missing JSDoc. Vue first (126 of 138 props), then React (49) and Angular (4), so
          that every manifest describes every prop; this also improves the per-framework
          Storybook MCP. Step 2: the docs build reads `dist/storybook/<fw>/manifests`. That
          needs a build dependency or a reversed order in `wrangler.jsonc`, and a fail-loud
          check when a manifest is missing. Step 3: `ComponentDetail` renders props from the
          manifest of the selected framework. The `PropRow` entries in `components.ts` are
          deleted, as is the props half of `check:docs`. This is the docs part of S6; tick
          it there too.
          **Step 1 done 2026-10-07** (`1b47efb9`, `3a16141c`, `8444ed34`, `bff43d3e`). All 468
          props in the three manifests are described, with no exemptions, and
          `check:storybook-manifests` fails on `[NO-DESCRIPTION]`. Writing the descriptions
          surfaced behaviour that differs between frameworks, now documented honestly in each
          framework's JSDoc but not reconciled:
          pagination `page` is two-way in Angular and controlled in Vue;
          tooltip flips when clipped in Angular only;
          Vue stepper `linear` lets users pass optional steps;
          `errors` is `ValidationError[]` in Angular and `string[]` in Vue.
          Compare these against the contracts; each is either a recorded `codeOnly` difference
          or a bug. Open: React sub-components that are not a story's `meta.component`
          (`AtlOption`, `AtlTd`, …) are not in the manifest, so their props are unmeasured.
    - [x] **Closed 2026-10-07 by owner decision: examples stay hand-authored in `components.ts`** (no story parsing, no Angular-only second path). P4b — examples from one tagged story per component. Spiked 2026-10-07: blocked,
          not built.** The examples stay hand-authored, as ADR-0121 keeps prose examples
          authored; the plan was one `docs-example`-tagged story per component and framework
          with an explicit `parameters.docs.source.code`, projected like the props (ADR-0154).
          The spike (button `Primary`, tag + explicit source in all three frameworks, built with
          `nx run-many -t build-storybook`) says the manifest cannot carry it:
          Angular's `story-docs` shard honours `docs.source.code` as the story's `snippet`;
          React's `components.json` and Vue's story-docs shard still print the args-generated
          snippet (both build it statically from the CSF AST in `@storybook/react` /
          `@storybook/vue3`, which never read `parameters.docs.source`); and no framework's
          manifest carries a story's `tags`, so "the story tagged `docs-example`" cannot be
          found. Workarounds (parsing story files, a second Storybook build in the docs path)
          were excluded by the build-time constraint of ADR-0154. Options for the owner:
          Angular-only examples from the projection (Angular is the workshop framework) with
          React/Vue examples staying in `components.ts`; or wait for React/Vue manifests to
          honour `docs.source`; or keep `examples` authored as today.
    - [x] **P4c — move `a11y` into the metadata — done 2026-10-07 except toast.** 10 of the 11
          entries are merged into `metadata.accessibility` (`role`, `relatedRoles`, `notes`, and
          `keyboard` rows or prose `keyboardBehavior`, exactly one; `check:metadata` enforces
          it) and the docs page renders from it. Toast has no metadata file and
          `AtlToastOptions` is not a registry spec, so its `a11y` stays in `components.ts`
          until toast gets a metadata home. `aiUsage` (3 entries), `composition` (13) and
          `status` (6) stay in the docs data as page data.

- [ ] **The scaffold becomes the AI-development workspace, and the cohort's environment**
      (owner decisions, 2026-09-12). Four blocks chosen out of five; **"Gates + CI" was
      deliberately not chosen** — the generated workspace keeps its five separate
      `check:*` scripts, gets no `check:all` umbrella, no `lint` script and no CI
      workflow of its own. Everything below is scoped by that.
      Findings: ADR-0134 through ADR-0137, and the step commits below.

  - [x] **S1 — one framework in the schema, not a list — done 2026-09-12** (`d4b1cfb`,
        ADR-0134; nx test 122, lint, build with all 32 templates in `dist/`, CLI test 21).
        `framework` as an enum
        (`angular|react|vue`) with an `x-prompt`, `frameworks` dropped; `preset.ts` loses
        `frameworks.indexOf(...)` port arithmetic (Storybook is always 6006), the
        `primaryFramework = frameworks[0]` narrowing, the multi-entry `.mcp.json` loop and
        the per-framework fan-out in `buildStylelintConfig` and the generated `nx.json`
        inputs. `bin/index.ts` passes `framework`. `preset.spec.ts`'s 14 multi-framework
        call sites collapse. Ports 6007/6008 disappear with the code that produced them.
  - [x] **S2 — reproducibility — done 2026-09-13** (`de06988`, ADR-0135 + ADR-0136; the
        first `play` failed for real in a generated workspace on `pointer-events: none` and
        moved to an enabled story; e2e green per framework: angular, react, vue). (a) `@atelier-ui/<fw>` pinned to the preset's own
        version, read from its `package.json` at generate time — the e2e's verdaccio
        publishes the matching local tarballs, so the pin resolves there too. (b)
        `uianatomy` always in the generated `.mcp.json`; `angular-cli` when the framework
        is Angular. (c) The example stories rewritten per framework to the doctrine they
        teach: one story per variant value and Boolean state, `args`-based, one `play`
        with an assertion. The e2e pins five substrings of `check:contracts`' summary
        (`no-component: 0`, `external: 1`, `docgen-failed: 0`, `[NO-STORY-META]`,
        `total: 0 error(s)`) — they must stay true, and `AtlButton` staying
        package-imported is what keeps them so. (d) `docs/src/pages/workshop.astro:44-73`
        swept in the same change: its hand-maintained `.mcp.json` copy is already drifted
        (`figma-console-mcp@latest` there, `1.40.0` in the preset).
  - [x] **S3 — the workspace is set up for Claude Code — done 2026-09-13** (`e277204`;
        nx test 154, build with the three new templates in `dist/`, and the hook run for
        real against eight stdin payloads — exit 0 in every case). Generated `.claude/settings.json`
        with a `permissions.allow` list covering `npx nx …`, `npm run …`, `npx storybook …`
        and `npx playwright …`, plus `enableAllProjectMcpServers: true`; a `PostToolUse`
        hook on `Edit|Write` that formats the edited file (path from stdin JSON) and runs
        stylelint on `.css`; `.claude/settings.local.json` added to `.gitignore`; a
        `/verify` command that runs the four checks and reports each exit code; a
        `component-review` subagent (Read/Grep/Glob/Bash, `model: sonnet`) that reads a
        component against its contract, its stories and the a11y rules. The generated
        `CLAUDE.md` gains a "Definition of done" section, this repo's "a gate's result is
        its exit code — never pipe it" rule, and framework idioms (Angular signals /
        zoneless / built-in control flow; Vue `<script setup>` + `defineModel`; React
        hook rules).
  - [x] **S4 — one Atelier skill in the generated workspace — done 2026-09-13** (`50169e2`).
        Shipped as a preset-only template, **not** under `skills/`: its instructions are false
        in the monorepo and `sync-skill-discovery.mjs` would publish it to the docs site's
        discovery index, offering it to the readers it misleads. Every factual claim in it was
        checked against the code that has to make it true, including all thirteen
        `check:contracts` finding codes against that script's own `TAG_LEVEL`. Same commit put
        `npx nx migrate` on `permissions.ask` rather than `deny` — and whether a narrow `ask`
        even beats a broad `allow` was settled by running the installed CLI, not by reading
        the bundle. Originally planned as
        `skills/atelier-component/` in this repo (so it gets discovery, `check:skill-discovery`
        and an eval home) and shipped into `.claude/skills/atelier-component/` by the
        preset as a byte-identical clone — new pairs in `sync-preflight.mjs`'s `FILES`,
        which is the only thing that enforces a copy. It is **not** a fork of
        `design-to-code`: that skill names `libs/spec` and the monorepo gates 16 times in
        its `SKILL.md` alone. This one names the scaffold's real surfaces —
        `workshop-<fw>/src/contracts/`, `contracts.config.json`, `check:contracts`,
        `check:stories`, the hosted `docs-show`.
  - [x] **S5 — a unit-test runner, without losing the browser one — done 2026-09-13**
        (`fa60042`). Two config files, not a `projects` array, for the ADR-0112 reason. The
        e2e step added with it earned itself immediately: Vue died on
        `Unknown file extension ".css"`, and the diagnosis found that React survives the same
        condition only because its published package declares `"type": "commonjs"` over ESM
        files — recorded above as a decision to take. Originally planned as: one
        `vitest.config.ts` per app declaring two `projects`: the existing Storybook
        browser project and a jsdom unit project (`src/**/*.spec.*`, Testing Library for
        the chosen framework, `@testing-library/jest-dom`). A `test` target so
        `nx test workshop-<fw>` works, one example unit test as the pattern to copy, and
        `check:stories` kept on the browser project. Why the file is shaped this way
        rather than letting the app generator write its own: the preset already owns
        `<app>/vitest.config.ts` — addon-vitest resolves the nearest config by that exact
        name — which is why `unitTestRunner: 'none'` was passed in the first place. The
        Angular half is the risky one (`@analogjs/vitest-angular`) and gets its own real
        scaffold run, not an in-memory Tree.

- [ ] **A dormant rootDir violation in the generated workspace's story-test setup.**
      `src/test-setup-stories.ts` imports `'../.storybook/preview'`, which reaches outside
      `tsconfig.app.json`'s `src`-scoped `rootDir`. Harmless today because nothing invokes a
      `typecheck` target in a generated workspace — `nx build` does not compile that file since
      the explicit `import { beforeAll } from 'vitest'` fix — but it would fail TS6059/TS6307
      the moment such a target is wired. Found 2026-09-13 while fixing the `beforeAll`
      regression. Identical in React and Vue. Decide: relax the rootDir, move the annotations
      import, or leave it and note that a `typecheck` target cannot simply be switched on.

- [ ] **Every release leaves two files for a human to clean up.** `nx release`'s own
      `chore(release): publish` commit bumps versions without running the generators, so
      `docs/public/llms.txt` goes stale (known, one line, happens every time), and it embeds
      commit bodies verbatim into each package's `CHANGELOG.md`, which Prettier then reflows
      differently — so `check:format`, the _first_ gate in `check:all`, is red on `main`
      immediately after every publish. Both were hit again on 2026-09-13. The fix is to run
      `gen:llms` and `prettier --write` inside the release workflow, before its commit, rather
      than pushing a main that fails its own first gate and waiting for the next person to
      notice.

- [x] **No gate has ever formatted an `.astro` file — fixed 2026-10-01 (ADR-0147).** `check:format` is `prettier --check .`,
      and without `prettier-plugin-astro` installed Prettier cannot parse `.astro` at all —
      targeted, it errors on all 24 pages; across the tree, it silently skips them. So the docs
      site, which is most of what this repo publishes, has never had a formatter's word on it.
      Found 2026-09-13 while extending `design-principles.astro`. Installing the plugin would
      reformat every page in one commit, which is the reason to decide it deliberately rather
      than discover it mid-review.
      **Decided 2026-10-01 (owner):** one format-only commit, listed in `.git-blame-ignore-revs`;
      ESLint via `eslint-plugin-astro@1.7` on ESLint 9 now, the ESLint 10 bump separately.
      Spike (scratchpad copy): `prettier-plugin-astro@1.1.0` reformats 46/50 files
      (+10870/−3226), idempotent; it wraps text inside inline elements (`<a>…</a>.`), which
      Astro's whitespace collapsing may render as "Setup ." — unproven, S1 measures it. Also:
      `docs/` has no `eslint.config.mjs`, so no `lint` target exists and CI never lints it.
      Done when: `check:format` covers `.astro`; `nx lint docs` exists and is clean with
      `eslint-plugin-astro` + jsx-a11y; reformatting changes no page's rendered text (built
      HTML text diff); `check:all` exit 0; ADR recorded.
  - [x] S1 built-HTML text diff — plugin defaults changed visible text on 27/61 pages
        (spaces before punctuation and inside links); `htmlWhitespaceSensitivity: strict` is
        ignored by the plugin; `astroCompressHTML: "html"` (matches Astro 6's
        `compressHTML: true`) brings it to 0/61. Cross-checked with Chromium `innerText` of
        every page and link: 0 diffs, control run without the option 61 diffs.
  - [x] S2 `3f14528d` config, `ab1f4946` format-only, `ce0b3906` blame-ignore; plus
        `6a6e5daf`/`29324f0d` re-keying `allowlists.js` entries the reflow broke.
        `check:all` exit 0.
  - [ ] Found by S2, owner call: `skills/figma-workspace-architect.astro` has
        `style="margin: 0 0 {mode.subModes.length ? …}"` — braces in a quoted attribute are
        never evaluated, so the margin has never applied on the live site. Fix is
        `style={`…${…}`}`, which changes rendering; until then it carries a
        `<!-- prettier-ignore -->` (the plugin lowercased `subModes` inside the string).
  - [ ] Found by S2: `check:component-count` / `check:docs` allowlists key on exact
        adjacent source lines, so any reflow of a prose paragraph breaks them. Key on content
        instead?
  - [x] S3 `97ddb2bd` config (`eslint-plugin-astro@1.7.0`), `31373193` 54 findings fixed
        (49 `no-var`, 3 tabindex, 2 TS); browser smoke across ClientRouter navigation clean.
  - [x] S4 ADR-0147 (0146 is taken on branch `spike/own-mcp-server`).

- [x] **`@atelier-ui/react` is published as a self-contradictory package — fixed 2026-09-13**
      (`68a3b52`, ADR-0138; the `"type": "module"` declaration then exposed `check:exports`
      resolving with NodeNext against libraries that use bundler resolution, measuring zero
      React exports and reporting that as 40 findings — `ae33c45`, ADR-0139). Original entry:
      something
      depends on that.** `dist/libs/react/package.json` declares `"type": "commonjs"` while
      the files it ships are raw ESM. Found 2026-09-13 while diagnosing why only Vue's
      generated unit tests died on `Unknown file extension ".css"`: Vue's package is
      _correctly_ formed ESM, so Vitest externalises it and hands it to Node, which cannot
      load the `import "./index.css"` that `libs/vue/vite.config.mts` injects as a rollup
      banner. React ships the same per-component `import './atl-button.css'` and survives
      only because Vite's dual-package guard refuses to externalise a package whose
      declared type contradicts its contents, and inlines it instead — which is where the
      CSS-stubbing lives. Proven in both directions in an isolated repro built from the
      real tarballs: forcing `@atelier-ui/react` external reproduces the crash with Vite's
      own "seems to be an ES Module but shipped in a CommonJS package" diagnostic; forcing
      `@atelier-ui/vue` inline fixes it. So the fix that shipped (`server.deps.inline` in
      the generated Vue unit config) is correct for Vue and React is a latent version of
      the same bug, held off by a build defect rather than by design. Angular has no
      version of it — ng-packagr inlines styles as literal strings, so no `.css` import
      exists to load. Decide whether to correct the React package's `type` (and then also
      give React's generated config the same `inline` entry), or to leave the accident in
      place with this note as its record.

- [ ] **`@nx/vue`'s application generator writes a spec file despite `unitTestRunner: 'none'`.**
      A generated Vue workspace carries `src/app/App.spec.ts` (Nx's own default, using
      `@vue/test-utils`' `mount`), which neither the preset writes nor documents, and which
      the unit project's deliberately recursive `src/**/*.spec.*` glob then runs. React and
      Angular honour the option. Harmless today — the file passes — but it means "the tests
      in this workspace" is one file larger than the preset knows about for one framework.
      Either narrow nothing and document it, or delete the file post-generation.

  - [x] **S5a — the Figma file key the attendee actually owns — done 2026-09-13** (`40a2eff`,
        plus `e6eb441` closing the generator-side validation its own author named). Owed from the same
        owner decision as S1 and not delivered with it: `figma:snapshot` ships with a
        literal `<YOUR_FIGMA_FILE_KEY>` placeholder because the preset has only a boolean
        `figmaMcp` option, and `QMnDD8uZQPldPrlCwZZ58T` is _this_ repo's file, not the
        attendee's. A `figmaFile` option on the preset and a `--figma-file` flag plus
        prompt on the CLI (asked only when the Figma MCP was accepted) put the right key
        into the generated script at scaffold time. This matters more now than when it was
        first noted: the cohort duplicates the Atelier file into their own drafts on Day 2,
        so every attendee has a different key, and the placeholder is the first thing that
        breaks.

  - [x] **S6 — the scaffold becomes the cohort environment — done 2026-09-13** (ADR-0137 in
        `751cad6` with the English pages, `a4952b4` with the German curriculum). The deletion
        turned out to be the substantive part: the agenda's half-page on which gates go red
        _by design_ in the clone exists only because attendees worked in our repo. One
        consequence the ADR names is still landing separately — the API rules as a hosted page
        both audiences read. Originally planned as: Today's
        split is clone-for-the-cohort, scaffold-for-the-self-serve-reader, and the
        curriculum names three things the scaffold does not have: `plan/big-picture.md`'s
        API rules (Day 2 Block 2), `libs/spec/src/index.ts` as the spec template (same
        block), and `nx storybook <fw>` on 4400-4402. `design-principles` is already a
        hosted page; `big-picture` is not. Closing it means: the API rules reach the
        scaffold (a hosted page the generated `CLAUDE.md` links, plus a vendored short
        form), a spec-style example ships beside the contracts, and the doc pages that
        branch clone-vs-scaffold get rewritten — `tutorial.astro:622` ("the scaffold has
        no Storybook of its own") is **already false** against `preset.ts`'s per-app
        Storybook targets, `first-component.astro` mounts the kata under `libs/<fw>/…`,
        and `schulung.astro:299-301` plus `schulung-2tage-agenda.md:14` state the
        excluded-scaffold rule in prose. Every new docs line that cites 6006 needs a
        content-keyed `SCAFFOLD_PORT_EXEMPT` entry (`tools/scripts/lib/allowlists.js`),
        and the ADR needs its row in `plan/adr/README.md` plus a dated `Corrected`
        paragraph written **into** ADR-0084 in the same commit, or `check:adr-refs` fails.

    Order: S1 → S2 → S3 + S4 → S5 → S6, each its own commit. The expensive gate is
    `cli-e2e` (~7 min per framework, ~20-45 min total, and `nx affected` reaches it from
    any preset edit); run it single-framework per step and full before the last push.

- [ ] **Where Angular's a11y coverage actually comes from — eslint (static) and axe
      (rendered) cover different ground, not the same ground twice.** Found 2026-09-11
      investigating a false "zero `@angular-eslint/template/accessibility-*` rules
      enabled" premise: `libs/angular/eslint.config.mjs`'s
      `...nx.configs['flat/angular-template']` already pulls in all 11 rules of
      angular-eslint's own `templateAccessibility` preset (alt-text,
      click-events-have-key-events, elements-content, interactive-supports-focus,
      label-has-associated-control, mouse-events-have-key-events, no-autofocus,
      no-distracting-elements, role-has-required-aria, table-scope, valid-aria), on
      `**/*.html` and on inline templates alike. `check:stories`'s axe pass
      (`parameters.a11y.test: 'error'`) overlaps for six of them — `alt-text` ↔ axe's
      `image-alt`/`area-alt`/`input-image-alt`/`object-alt`/`role-img-alt`/`svg-img-alt`;
      `valid-aria` ↔ `aria-valid-attr`/`aria-valid-attr-value`; `role-has-required-aria` ↔
      `aria-required-attr`; `table-scope` ↔ `scope-attr-valid`; `label-has-associated-control`
      ↔ `label`; `no-distracting-elements` ↔ axe's own `blink`/`marquee` rules — but **four
      have no axe equivalent at all**: `no-autofocus`, `click-events-have-key-events`,
      `interactive-supports-focus`, `mouse-events-have-key-events`. And even where a rule
      overlaps, the two mechanisms don't check the same thing: eslint statically walks
      _every_ template branch at author time regardless of what any story renders; axe
      only sees whatever DOM a story actually puts on screen, so a variant no story
      exercises gets zero axe coverage but still gets the eslint pass. Neither subsumes
      the other. No action needed here — recorded so the next "is X accessibility check
      already covered by Y" question doesn't have to re-derive this from scratch.
- [ ] **Three gaps ADR-0128 named and did not close** (2026-09-11).
  - [ ] **`check:paint`'s measurements are not run-to-run deterministic — check this
        before trusting any tighter tolerance.** Two `--update-baseline` runs each drifted
        Vue's `AtlAlert` height from 55px to 56px, on a _different subset of its stories each
        time_ (three, then five of six). Always the same component, field and direction, always
        inside the 2px tolerance, so it has never flipped a finding and nothing noticed. Find
        out whether it is layout timing, font loading or a measurement race before anyone
        narrows the tolerances or reads a 1px paint finding as real.
        **Sharpened 2026-09-11 after writing the above:** the risk is a nondeterministically RED
        gate, not a cosmetic wobble. ADR-0080 §2 puts a finding's own measured text into its
        identity, and these AtlAlert heights are _recorded_ findings — so a run measuring 56px
        where the baseline says 55px yields an unrecorded finding and a stale one at once, two
        blockers on a gate that was green the run before. Then measured: two consecutive unscoped
        runs, both exit 0, neither producing an AtlAlert height finding. The drift has been seen
        only in `--update-baseline` runs and does not reproduce on demand. Not reproducible, not
        explained, not currently firing — the worst of the three states to leave a gate in. Find
        the mechanism (layout timing, font loading, a measurement race); do not widen a tolerance
        around it. Clearing it by hand-editing the baseline was done once today, under review, for
        five entries known to be this noise; the file's own header forbids hand edits and that was
        a deliberate exception, not a precedent.
  - [ ] **`paint-baseline.json` keys a finding without its measured value, so drift inside a
        recorded finding is invisible.** `check-paint.mjs:1803` keys on
        `fw|component|story|state|field`; the `detail` string (`"rendered 172px, figma 222px"`) is
        not part of it. A height drifting 172px → 400px against the same Figma 222px keeps its key
        and the gate stays green. ADR-0080 §2 closed exactly this hole for `type-baseline.json` —
        "the measured value is part of the finding's text, so 14-vs-16 drifting to 14-vs-18 is now
        two blockers" — and `paint-baseline.json`, written later under ADR-0121, did not inherit
        it. Not a mechanical port: putting the value in the key makes every wobble inside the 2px
        tolerance a blocker, which is what the AtlAlert case shows can happen. Decide the pairing
        (value in the identity **and** a tolerance-aware comparison) rather than porting one half.
  - [ ] **The `play` wait costs about 50% runtime**, measured 2026-09-11: `check:paint`
        unscoped went from ~230 s to ~345 s, because every story now pays Storybook's own
        `waitForAnimations` (~100 ms flat, since this Chromium session does not match its
        `isTestEnvironment()` check) plus the settle poll — even though no story has a `play` yet.
        A known mitigation was deliberately not taken: spoofing the page's user agent to contain
        `"StorybookTestRunner"`, the string `@storybook/test-runner` itself relies on, short-circuits
        that wait. Left out to avoid a second dependency on a Storybook internal in the same change.
  - [ ] **The ADR-0124 `[ROSTER]` floor is cross-framework.** It fires when a component has
        zero measurements in _every_ framework, so one framework silently losing all coverage of
        a component — someone breaks `meta.component` in just the Vue story — is caught by
        nothing. A per-framework floor needs its own exemption axis, because several components
        legitimately measure in one framework and not another (Angular's `AtlDrawer` resolves a
        probe where React and Vue do not).
  - [ ] **`no-probe` never counted the "probe element vanished while measuring" case.**
        That warning fires from `comparePaint`/`compareFull`, which have no access to
        `runFramework`'s counter, so the sub-case is warned and never ratcheted. Pre-existing,
        preserved deliberately by ADR-0128 rather than widened alongside it.
- [ ] **Pay down the `check:paint` skip debt, now that ADR-0128 makes it immovable.**
      Ordered by what the breakdown says it costs, cheapest first:
  - [ ] **`not-rendered` is three components.** `AtlChat` contributes 12 in every framework
        (its Drawer, Popup and Inline stories render closed), `AtlDialog` 6-9, Angular adds
        `AtlDrawer`. Give them stories that open, or probes that measure the open state.
  - [ ] **The resolution half of `no-probe` is four contracts.** `AtlDrawer`, `AtlMenu` and
        `AtlTooltip` declare no `probes` at all; Angular's `AtlSelect` is the documented
        button-trigger case. Adding a probe to three contracts is the single highest-yield edit
        in this list.
  - [ ] **Angular's `AtlButton` fails every one of its nine focus probes**, where React's
        equivalent fails two of nine. That asymmetry is its own bug and is not explained by the
        contract.
  - [ ] **`skipped-demo` is the expensive half and partly not a defect.** 16/18/24 distinct
        components. Vue's 62 against Angular's 37 is broader reach plus a real difference in
        story granularity — Vue's `AtlAvatarGroup` is its own roster member with four stories
        where Angular folds the same demo into one story inside `atl-avatar.stories.ts`. React's
        `AtlRadioGroup` contributes six known false positives of the ambiguous-demo heuristic
        itself. Decide per component whether the story or the heuristic is wrong before touching
        either.

- [ ] **`AtlRadioGroup` has no accessible-name mechanism.** No `aria-label` or
      `aria-labelledby` prop, and no story wraps it in `<fieldset><legend>`. Found 2026-09-12 by
      the Codex cross-check during the Vue a11y work — **not** by any of the 20
      `vuejs-accessibility` rules and not by axe's default ruleset either, so nothing in this
      repo would have surfaced it. Likely a small API addition, and it needs Angular/React parity
      consideration before it lands in one framework only.
- [ ] **Where Vue's a11y coverage comes from — eslint (static) and axe (rendered).** Mirrors
      the Angular entry above, measured 2026-09-12 against the installed axe-core's 105 rules.
      Twelve of `eslint-plugin-vuejs-accessibility`'s twenty rules overlap axe
      (`alt-text` ↔ `image-alt` and friends, `form-control-has-label`/`label-has-for` ↔ `label`,
      `aria-props` ↔ `aria-valid-attr*`, `tabindex-no-positive` ↔ `tabindex`, …). **Seven have no
      axe equivalent at all:** `aria-unsupported-elements`, `click-events-have-key-events`,
      `interactive-supports-focus`, `mouse-events-have-key-events`, `no-autofocus`,
      `no-redundant-roles`, `no-static-element-interactions` — four of which are the same family
      Angular's analysis independently identified. `no-access-key` is a nominal overlap only: axe's
      `accesskeys` checks uniqueness, the lint rule checks presence.
      The branch-coverage argument is not theoretical here: **5 of those 7 axe-blind rules are
      exactly the ones that fired**, and the one overlapping rule that caught a real defect
      (`role-has-required-aria-props`, the combobox's `filteredOptions.length === 0` branch) sits
      on a branch **no story renders**, so axe never had a chance to see it.
- [ ] **Two suppressions that rest on platform guarantees and no repo test** (Vue, 2026-09-12).
      The `<dialog>` Escape-close path behind the backdrop-click suppressions in `atl-chat.vue`,
      `atl-dialog.vue` and `atl-drawer.vue`, and the native-button Enter/Space→click path behind
      `atl-menu-trigger.vue`'s wrapper suppression. Both are standard platform behaviour and both
      are architecturally sound — but the tooltip defect found the same day proves that a
      confident comment is not evidence. Pin them with tests or accept them knowingly.
- [ ] **Optional, lower priority:** `atl-dialog`, `atl-chat` and `atl-drawer` have no built-in
      close-button affordance. Raised by the Codex cross-check: the backdrop-click suppression is
      sound only because Escape is guaranteed, which leaves touch-only users without a first-class
      close control.

- [ ] **A NUL byte in `check-figma.js` makes `grep` go blind on it, tool- and
      locale-dependently.** Byte 93981 is a literal U+0000, used deliberately as a key separator
      that cannot collide with content. The side effect is that some `grep` builds classify the
      whole 3,778-line file as binary and report zero matches without saying why — it silently
      produced a wrong measurement twice this week, once in a gate-wide audit and once in a scope
      classification. Either swap the delimiter for something printable that still cannot collide,
      or record the hazard where measurement passes will meet it. Until then: `grep -a` or
      ripgrep when sweeping the gate suite.

- [ ] **The repo root is lint-uninhabited apart from `package.json`.** The root
      `eslint.config.mjs` has carried a `**/*.json` block with `jsonc-eslint-parser` since the
      workspace was created, pointing at nothing: `@nx/eslint/plugin` only infers a lint target
      for a project root of `.` when that root has a `src/` or `lib/` directory (read from
      `@nx/eslint/dist/src/plugins/plugin.js`), and the repo root has neither. As of 2026-09-12 an
      explicit root `lint` target covers `package.json` and nothing else. `nx.json`, `.prettierrc`,
      `wrangler.jsonc` and the rest of the root configuration are still unlinted — decide
      deliberately whether that is fine or whether the target should widen, rather than leaving it
      to whoever next wonders why a root file has no rules.
- [ ] **`atelier/storybook-version-lockstep`'s outlier is a majority vote.** It names the
      package that disagrees with the majority-pinned version, lexicographic tie-break. Correct and
      unambiguous at 11-vs-1; in an even split — mid-migration, say 5 vs 5 after a deliberate
      partial bump — it still flags a disagreement but which half it calls the outlier is
      arbitrary. Anchoring on `storybook`'s own version instead would be semantically meaningful
      (the family follows core). Small change, worth doing the next time that file is open.
      The rule also accepts prerelease and build suffixes (`10.6.0-beta.1`) as exact — defensible,
      but it was a judgement call, not a stated requirement.

- [ ] **`storybook doctor` as a gate — blocked on an offline requirement, not on value.**
      Measured 2026-09-12: it is a cheap static health check (missing dependency, incompatible
      packages, mismatched versions, duplicated dependencies, config-load errors), needs no build
      and no server, and reports clean here today. But `@storybook/cli` is **not a dependency of
      this repo** — `storybook`'s dispatcher delegates `doctor` to it and npm fetches it on first
      use. `check:all` is offline by design, so adding it means vendoring `@storybook/cli` as a
      devDependency first, and that is its own decision about carrying a package we otherwise
      never install.
- [ ] **`check:storybook-manifests` cannot be made cheaper — answered, so nobody re-tries it.**
      The gate builds three Storybooks to check the emitted `components.json`, and four cheaper
      paths were tested 2026-09-12 and all fail: `storybook index` produces a different artefact
      with no docgen; `build --preview-only` emits a byte-identical manifest but saves nothing
      measurable (~11.8s vs ~11.6s for Angular — the manager UI was never the expensive part);
      `storybook tools docs list` without a running server returns **decoy-shaped** `id`/`name`-only
      entries for all 32 Angular components, exactly what `check-manifests.js`'s own `[DECOY]`
      check exists to catch; and a running dev server 404s the manifest routes by design under
      `experimentalDocgenServer`. Nx's caching of `build-storybook` stays the mitigation.

- [ ] **Five real interactions have no behaviour id at all** (found 2026-09-11 by sweeping
      for interactive affordances; ADR-0129 records why the manifest could not surface them
      itself — it locks what is already covered). Each needs a spec in all three frameworks
      before an id can be added, which is the manifest's own admission rule:
  - [ ] **Tooltip**: focus/blur show and hide, and Escape to dismiss. The four existing ids
        are hover-only. React wires `onFocus`/`onBlur` beside the hover handlers plus a
        document-level Escape listener; Angular and Vue do the same in their own idiom.
  - [ ] **Menu**: Escape-to-close, outside-click-to-close, and arrow-key navigation between
        items. React and Vue implement all three by hand; Angular delegates the entire
        interaction surface to `@angular/cdk/menu`. The five existing ids cover only
        trigger-click, item-click, variant class and disabled item.
  - [ ] **Dialog and Drawer**: the native `<dialog>` `cancel` event synced to `open` —
        exactly what Angular's `EscapeToClose` story play already demonstrates without an id.
  - [ ] **Chat**: the `drawer` variant is the **default** and appears nowhere in the
        manifest, which names only `inline-variant` and `popup-variant`. It is the variant
        backed by a real `<dialog>` with `showModal`, `cancel` handling and backdrop dismissal.
  - [ ] **Table**: `AtlTh.onSort` (cycles asc→desc→none, reflected in `aria-sort`) and
        `AtlTr.onSelectedChange` (reflected in `aria-selected`). The ids `sort-button` and
        `checkbox-selectable` only assert the controls render.
- [ ] **Apply ADR-0129's criterion to the remaining 47 story-classified behaviours.** The
      accordion pilot found 2 of 9 — a play earns its place only where the assertion depends on
      computed layout, real focus order or real browser event sequencing, because every
      behaviour is already covered three times in jsdom and jsdom implements
      `activeElement`/`focus()`/`blur()` fully. Cheap now that the criterion is sharp, and it
      produces the actual work item; 49 is only the upper bound.
- [ ] **A fixed Figma height for a content-driven component.** `AtlAccordionGroup` is
      `display: block` with auto height, and every story renders a different pixel height
      against the master's single 222px row — which is why its eighteen existing height findings
      are recorded rather than fixed. Same class of question as the AtlChat master's one row for
      three structurally different panels. Answer it at the master, not in the gate.

- [x] **Introduce stylelint and let it replace the hand-written CSS gates** (owner
      decision 2026-09-11; ported 2026-09-11/12, ADR-0130). Three gates became four rules in
      `tools/stylelint-rules/`: `check:css-tokens` split into `atelier/no-raw-color-literal`
      and `atelier/no-undeclared-token`, `check:token-tiers` into `atelier/no-primitive-token`,
      `check:token-bypass` into `atelier/no-token-bypass`. `check:all` 46 → 43 steps; the four
      scripts are deleted, parity proven by ten mutations against the old scripts first.
      No `stylelint-config-prettier`: stylelint 17 ships zero formatting rules (removed in 16,
      split into an opt-in `@stylistic` plugin), verified by listing the installed rules
      directory. Exemption maps stayed in `tools/scripts/lib/allowlists.js` and the rules
      `require()` it — `kind: design|gap`, the `why` and the staleness check are the content,
      and a rule option taking a list of strings loses all three.
  - [x] **The three that stay gates, decided 2026-09-12 and recorded in ADR-0130 §4–5 with the
        sharpened test written back into ADR-0126.** The line is not "how many files does it
        read" — `no-undeclared-token` reads `tokens.css` and `no-primitive-token` walks all
        three trees, and both are rules. It is **attribution**: a rule earns the line only when
        every occurrence it could flag has one specific file and location where the finding
        belongs. `check:variants` fails it twice over (its primary verdict is "does
        `.variant-danger` exist anywhere in this _directory_", load-bearing because Angular's
        toast splits `.variant-*` and `.position-*` across two stylesheets under one component
        key; and the defect is an _absence_, with no line to anchor). `check:typeface` fails it
        for the same directory-scoped reason plus a ratchet baseline stylelint cannot model.
        `check:dead-selectors` joins CSS against what a template can emit. `check:box-sizing`
        was never a candidate — a generator in `--check` mode that calls Prettier's async API.
  - [ ] **Staleness narrowed cross-framework → per-framework, as the price of cache
        independence.** Nx wires one `stylelint` target per project, so an exemption that is
        legitimately asymmetric across frameworks would be reported stale by the two that do
        not reference it. Every current entry is referenced identically in all three (verified
        by grep), so behaviour is unchanged today. Revisit only if an asymmetric exemption is
        actually wanted; the alternative — each target scanning all three trees — makes every
        framework's lint cache invalidate on any framework's CSS change.

- [x] **The scaffold gets the CSS-discipline rules (2026-09-12, ADR-0131).** Three of the four
      stylelint rules ship wired into a generated workspace — `no-raw-color-literal`,
      `no-undeclared-token`, `no-token-bypass` — on the criterion of what an attendee hits by
      writing ordinary CSS in their first hour. `no-primitive-token` ships inert (index.js
      requires all four) and is deliberately not turned on. Six files as byte-identical clones,
      `sync-preflight` 8 pairs → 14; the generated `nx.json` declares them as `stylelint`
      inputs, so the cache trap's fix ships with the trap. Proven against a real generated
      workspace via a locally published CLI, not an in-memory Tree.
  - [ ] **Should stylelint be a permanent assertion in `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs`?**
        The end-to-end proof was real — verdaccio, the published CLI, a bad stylesheet failing
        the scaffold's own target by name — but it lives in a session scratchpad, so nothing
        re-runs it. Adding it to the e2e means adding to a file that also builds Storybook and
        runs Playwright; decide whether the coverage is worth the minutes.
  - [ ] **An implicit coupling nothing enforces.** The scaffold's config passes neither
        `componentRoot` nor `allowlistsFile`, correct while it has no exemption file. Someone
        hand-adding exemptions later without adding `componentRoot` gets a staleness scan that
        silently does not run.
  - [x] **Formatting ships, a `types` script does not (2026-09-12, ADR-0131's dated
        extension).** A fresh Nx tree has no `prettier` devDependency and no `.prettierrc`, so
        the preset writes both plus `format` / `check:format`, in this repo's
        `prettier --check .` shape — `nx format:check` exits 0 printing "No formatter
        configured" when none is resolvable, which is a silent pass on an untouched tree.
        `types` ships nothing: no generated framework exposes a `typecheck` target, and
        `nx build` already type-checks the example story (proven by injecting a `TS2322`).
  - [ ] **Nothing type-checks `.storybook/*` in a generated workspace**, for any framework —
        `main.ts`, `preview.ts`, `vitest.setup.ts`. Angular's scaffold writes a
        `.storybook/tsconfig.json` that nothing runs `tsc` against; React and Vue get no such
        file. Closing it means writing a tsconfig for two of three frameworks, which is why it
        was left open rather than guessed at. The same gap in this repo is covered by
        `check:types`.

- [ ] **The staleness half of the stylelint rules has no home for its finding**, which is the
      attribution test of ADR-0130 failing against a rule this repo kept. A `[STALE]` report
      anchors at `1:1` of whichever file stylelint happens to process first, and that file
      varies run to run (reproduced on the unmodified code, so it predates the port). It
      survives as a _secondary_ signal on rules whose primary verdict is local — but if a
      third such signal ever wants adding, this is the wrinkle to weigh, not a precedent to
      copy.

- [ ] **Gate review of 2026-09-11 — the findings not fixed in the same session.**
      All 47 runnable gates were run individually (exit code + duration, warm: 471 s total,
      `check:paint` 230 s of it, tree clean afterwards). 46 green; the only red is
      `check:parity`, whose 37 DRIFT blockers are the known debt below and whose `:report`
      twin is what `check:all` actually runs. Three gates that could read green while
      measuring nothing were fixed the same day (ADR-0124); these are the rest, each
      verified by reading the code.
  - [ ] **Nobody polices `PROP_SURFACE_EXEMPT`.** `check-prop-surface.js:1076` skips
        `[STALE]` for any key whose prop the spec does not declare, saying
        "check-manifest-parity.mjs is what actually keeps such an entry live";
        `check-manifest-parity.mjs:263` says "STALE-EXEMPTION hygiene over
        PROP_SURFACE_EXEMPT stays check:props' job — this gate reads the list, it does not
        police it." Both in writing, in the files. 61 entries, of which **21 key on the prop
        `errors`, a name that appears zero times in `libs/spec/src/index.ts`**. Decide which
        gate owns it and make the other stop claiming it does.
  - [ ] **`check:manifest-parity`'s `[DEFAULT]` is guarded on both sides**
        (`:345`, `ea.default !== undefined && eb.default !== undefined && …`), so a real
        default divergence where one framework's docgen reports no default is invisible.
        The file header calls this tag "check:defaults' cross-framework half" —
        **do not retire `check:defaults` on that claim** until the guard is answered. The
        three normalizers also disagree on quoting (`lib/docgen.mjs:492` strips, `:234`
        `JSON.parse`s, `:197` passes through raw), which any surviving asymmetry is
        currently masked by.
  - [ ] **Exemption staleness is per-gate and mostly absent.** 19 gates import
        `lib/allowlists.js`, which holds 20 exemption maps; **7 gates check their own
        entries for rot.** ADR-0034 requires the check ("load-bearing allowlists rot") and
        ADR-0119 sharpened what an entry is. Belongs in the shared harness, not in each
        gate — see ADR-0125's `gate-kit` boundary.
  - [ ] **ADR-0009's regenerate-and-diff idiom is reimplemented ~10 times**, each with
        its own `--check`/write boundary: `check:spec`, `check:tokens`,
        `check:preflight-clone-sync`, `check:scaffold-snapshot`, `check:artboard-palette`,
        `check:box-sizing`, `check:behaviors-gen`, `check:llms`, `check:cookbook-manifest`,
        `check:design-status`. Two of them decide write-vs-check with
        `mode = process.argv[2]` and a bare `=== '--check'`
        (`sync-preflight.mjs:96`, `gen-scaffold-snapshot.mjs:67`), so a typo'd flag
        **mutates the repo instead of checking it**. One helper, one boundary.
  - [ ] **`check:paint`'s two swallowed Playwright calls.** `:1190`
        `.hover().catch(() => undefined)` with no `page.setDefaultTimeout` anywhere: a
        non-actionable probe burns Playwright's 30 s default silently, and the element is
        then measured **un-hovered** and compared against the `state=hover` row — a pass on
        an interaction that never happened. Same shape at `:1109-1117` (15 s
        `waitForFunction`). These are the mechanism behind the "prime suspect check:paint"
        note already in this file, and they are also most of why the gate costs 230 s.
  - [ ] **`check:paint` does not check that `dist/storybook/<fw>` is fresh** (`:983`,
        it only requires `index.json` to exist), so a stale build measures old code and
        passes. The ordering dependency on `check:storybook-manifests` lives only in
        `check:all`'s `&&` chain, nowhere in the gate. Also `:1249` stamps
        `generatedAt: new Date().toISOString()`, so every `--update-baseline` is a diff even
        when the findings are identical.
  - [ ] **`check:paint`'s story-evidence scan reads prose.** `:1043-1060` builds the
        evidence blob from the story's whole node range and feeds it to `scanLiteralAttrs`
        (`:387`) and `scanObjectLiteralProps` (`:402`), so a
        `parameters.docs.description.story` containing `size="lg"` is indistinguishable from
        markup. Confined to render-only stories without `args` (verified — `literalOverrides`
        is only populated inside `isRenderOnlyDemo && !isForwardingDemo`), but inside that
        branch a literal ranks **above** the resolved args in `buildVariantKey:538`, so the
        story can be compared green against the wrong master variant.
  - [ ] **`check-docs-sync.js` holes.** `:377` populates `used` for
        `SCAFFOLD_PORT_EXEMPT` and never reads it, so there is no `[DEAD-ALLOWLIST]` check —
        unlike `check-component-count.js:179`, which uses the identical content-keyed idiom.
        `:104-146` `parseSpec()` builds a one-file `ts.createProgram` and never checks
        diagnostics, so degraded module resolution empties `specProps` and the
        `[DRIFT]`/`[TYPE-DRIFT]` halves pass vacuously while `[MISSING]` still fires.
        `:316` requires `[1-9]\d+` on both halves of a Figma node id, so `1:23` is never
        validated.
  - [ ] **`check-category-alignment.js:265`'s ALL-SKIPPED guard is `&&`, not
        per-check.** Renaming the `libs/<fw>/src/lib/<id>` convention kills the whole
        `[STORY-CATEGORY]` half while `figmaChecked` stays 43, so the guard never fires and
        half the gate goes dark quietly.
  - [ ] **Smaller, same family:** `check-component-count.js:111` treats any
        `/generated by/i` in the first 1000 chars as "generated, skip the file";
        `check-vitest-discovery.js:110` is satisfied by the path appearing in a _comment_
        (its header is honest about being a text check); `check-skill-discovery.mjs:74`
        can report ✓ with `checked === 0`; `check-figma-token-names.js:95` matches a
        `--ui-*` declaration in any selector block, not just `:root` (but its
        `checked === 0` guard at `:125` is the model the others should copy);
        `check-sync.js:65` throws on a broken symlink.
  - [ ] **`check:stories` runs twice in CI.** `.github/workflows/ci.yml` has a
        dedicated "Storybook tests" job (`nx affected -t storybook-test`), and the "Sync
        checks" job's `check:all` ends with `check:stories`
        (`nx run-many -t storybook-test`) — on a PR the first is affected-scoped and the
        second is not, so the unscoped run happens anyway. The same 60-minute job also
        carries `check:storybook-manifests` (three Storybook builds), `check:paint` (230 s)
        and `check:docs-layout` (a docs build plus a browser). Splitting those out with
        their own timeouts is the operational half of ADR-0125 and is what would have
        bounded the 110-minute hang.
  - [ ] **`check:paint`'s three other counters are still printed and unasserted.**
        ADR-0124 rule 1 ("every counter a gate prints is asserted or removed") is met only
        for the counters that separate "measured nothing" from "found nothing". A green run
        still reports, per framework, `skipped-demo` 37/43/62, `not-rendered` 25/20/21 and
        `no-probe` 30/21/22 — between 73 and 106 stories each — with nothing asserting any of
        them. Three different questions: a story the ambiguous-demo heuristic could not
        disambiguate, a story that did not render at all, and a probe that would not focus.
        Each wants its own floor or its own exemption map, the same way the roster got one.
  - [ ] **Are the fourteen subcomponent `PAINT_ROSTER_EXEMPT` entries really closed?**
        `check:paint`'s new roster floor (ADR-0124) records 24 of 43 roster components as
        never measured: 8 `gap` (real defects, warn every run) and 16 `design`. Two of the
        `design` calls are settled — `AtlRadio` matches the call `A11Y_PARITY_EXEMPT`
        already makes, `AtlToast` is an imperative service. The other fourteen are
        subcomponents exempted because **no story sets `meta.component` to them**, and that
        is a property of the story set, not of the component: each has its own Figma master
        and its own contract file, which is what put it in the roster at all, and ADR-0121
        decision 2 asks for a story per variant and per interaction state. Either a
        subcomponent gets a story and is measured, or the reason it never will be belongs in
        the entry. Left as `design` for now because authoring fourteen stories is its own
        decision, not a gate fix.
  - [ ] **Is `[DOCGEN-FAILED]` load-flaky?** Promoting a docgen failure from a silent
        `null` to an error (ADR-0124) is right, but it makes the gate's verdict depend on a
        Storybook worker completing. One unexplained observation on 2026-09-11: a
        `check:contracts` run exited 1 with 4 errors while a `check:paint` browser run was in
        flight on the same machine; three immediately following runs were exit 0 / 0 errors
        and the log had already been overwritten, so the 4 errors were never identified. CI
        runs the gates sequentially, so the contention is lower there, but this needs one
        deliberate test — run `check:contracts` under load and see whether the Angular/Vue
        docgen workers fail — before a red build on that tag is trusted as a real finding.
  - [ ] **Not reproduced, left recorded:** the concern that `process.exit()` immediately
        after a large finding burst truncates output on a pipe. Measured on
        `check:manifest-parity` — 34 lines identical with and without a pipe. Plausible only
        above the pipe buffer, i.e. exactly on a red run of `check:paint` or
        `check:contracts`. Worth one deliberate test before trusting a red build's output.

- [ ] **Spec-format review follow-ups** (owner decided 2026-09-10: A first, then plan
      the workflow — `tasks/spec-workflow-plan-2026-09-10.md`):
  - [x] **Option A, honesty pass — done 2026-09-10.** Dated "Corrected" paragraphs on
        ADR-0006 (compiler claim) and ADR-0013 (Angular/Vue "read the spec" fallback);
        `README.md` spec section rewritten (gates, not compiler; example brought to the real
        `AtlButtonSpec`; docs path fixed); `plan/big-picture.md:464` (agent prompt context,
        ADR-0116) and `tasks/claude-design-prompt.md:14` corrected; `AGENTS.md` step 2 says
        "naming contract" and step 3 says what the spec can and cannot settle;
        `/design-to-code` step 2 carries the same plus a "Building for one framework?"
        paragraph; `/tutorial` callout softened the same way. Gates: `check:adr-refs`,
        `check:docs-layout`, `check:llms` exit 0. The scaffold half of A (contract example,
        handoff template) is **not** done here — its shape is the workflow decision, so it
        moved to S2/S4 of the plan.
  - [x] **Target shape decided 2026-09-10 — S, "the stories are the spec" — ADR-0121.**
        Owner answers to the rethink's § 5: S as target (T stays the additive fallback); the
        micro-contract block is **hoisted** to one file per component under
        `libs/spec/src/contracts/`, imported by the three story metas via the
        `@atelier-ui/spec/...` alias the stories already use for `metadata.purpose`, and sits
        beside the component in a one-framework repo; the snapshot generator is pinned to the
        `.mcp.json` version (see below); `index.ts` retires **after** the three-manifest diff
        is green on the whole roster (S6), each retirement with its own ADR and the matching
        correction on ADR-0006/0010/0011. ADR-0096 corrected the same day (handoff document =
        thinking step whose lines have machine-checked destinations).
  - [x] **S0 — switch the instruments on — done 2026-09-10, ADR-0122.** The `CI=1`
        failure was `viteFinal` in the three `.storybook/main.ts` setting the hosted base
        `/storybook-<fw>/` on `process.env.CI`, which the addon-vitest plugin also applies to
        the test server, so the orchestrator's root-relative scripts 404'd (found by fetching
        what the page fetches; `tasks/lessons.md` 2026-09-10). Base now keyed on
        `BUILD_STORYBOOK` alone (`wrangler.jsonc` already sets it). Suite wired as the CI job
        `storybook-test` and as `check:stories` at the end of `check:all`; Angular got its
        `storybook-test` target, a11y wiring, project name and the `@analogjs/vite-plugin-angular`
        plugin its browser config lacked (the suite had never been runnable); its dialog story
        asserted a synchronous answer to an asynchronous state (`@starting-style` fade,
        `cancel` → `effect()`), fixed in the story with `waitFor`. `a11y.test: 'error'` in
        all three previews. Negative test: a broken `play` assertion named the story and
        turned `check:stories` red; restored from a copy. Verified: Vue 242, React 216,
        Angular 229 under `CI=1`. Real CI proof lands with the next push.
  - [ ] **a11y backlog from S0** (React/Vue measured 2026-09-10 with `a11y.test: 'error'`:
        **React 28 · Vue 36 failing stories**. Angular's own measurement did not land until
        2026-09-12: the "Angular 0" first recorded here was zero _checks_, not zero failures —
        `vitest.setup.ts` called `setProjectAnnotations([projectAnnotations])` without
        `a11yAddonAnnotations`, so `a11y.test: 'error'` had no consumer and axe never ran in
        the browser suite (found by injection: a bare `<img>` with no `alt` passed clean;
        ADR-0122 "Corrected 2026-09-12"). Fixed — `import '@angular/compiler'` (the same
        partial-Ivy idiom `src/test-setup.ts` already carries) plus the addon's project
        annotations — Angular surfaced **32 failing stories** of its own, across 9 story files
        and 10 components. Totals: **Angular 32 · React 28 · Vue 36**.) Recorded as
        `parameters.a11y.config.rules` exemptions at file or story scope, each rule id and
        reason in a comment pointing here; remove the exemption when the component or story
        is fixed. Per rule (impact) → where; the per-story list is in the exemption comments
        themselves:
    - [ ] `select-name` (critical) — React ×6, Vue ×9: native `<select>` without an
          accessible name (Select stories, Settings Page, Showcase). Same defect as L1 above.
          Angular's `AtlSelect` has no native `<select>` at all — a CDK-overlay custom listbox
          — so it never trips this rule; its own unlabeled-trigger defect is `button-name`
          below, a different rule id for the same missing-name shape.
    - [ ] `aria-progressbar-name` (serious) — React ×11, Vue ×9, **Angular ×21**:
          `role=progressbar` without `aria-label` when `label` is omitted. Same as L2 above;
          the spec leaves `label` optional — decide whether the component requires it (React's
          Button-style discriminated union) or every story passes one. Angular: all 6
          `AtlProgress` stories (meta-scoped), the `ManagementDashboard` cookbook demo
          (story-scoped — same story name and cause as React's and Vue's own
          `ManagementDashboard`), and Showcase `AllComponents`.
    - [ ] `aria-required-children` (critical) — React ×6, Vue ×4, **Angular ×2** (6 stories,
          2 distinct printed violations — Vitest collapses the identical Empty-group and
          Error-group renders into one message each): AtlChat's `.messages-list[role="list"]`
          carries the empty-state icon/button or the error-state `[role=alert]` as children.
          Component defect — and, corrected from the assumption this line carried before
          Angular's suite ran at all: Angular hits the **identical shape**, not a different
          one (all 6 Drawer/Popup/Inline × Empty/Error stories, meta-scoped). Compare all
          three frameworks together before fixing.
    - [ ] `label` (critical) — React ×4, Vue ×2, **Angular ×9**: Table Kitchen Sink /
          Selectable checkbox cells, React Input Disabled / Read Only. Angular: the same
          Table Kitchen Sink / Selectable row-select checkboxes (story-scoped). Angular's
          Table select-all header cell already carries accessible text, so — unlike React and
          Vue — it does not also hit `empty-table-header` below.
    - [ ] `scrollable-region-focusable` (serious) — React ×1, Vue ×5: AtlCodeBlock's
          `.code-block-body` scroll container is not focusable. Already open above
          (docs review); now measured in stories too. Angular's `AtlCodeBlock` stories render
          clean under this rule — not (yet) a cross-framework match.
    - [ ] `label-title-only` (serious) — React ×1, Vue ×6, **Angular ×2**: Combobox / Input /
          Select / Textarea error-state inputs named by `title` only. Angular's Input and
          Textarea `WithErrors` stories (story-scoped) hit the same rule by a different path —
          there is no `title` attribute anywhere in either component: axe's `title-only` check
          (`!labelText && !!(title || ariaDescribedBy)`) treats a present `aria-describedby`
          (here, pointing at the rendered error list) the same as a `title`, so it fires anyway.
    - [ ] `empty-table-header` (minor) — React ×2, Vue ×2: the select-all checkbox
          header cell has no text.
    - [ ] `landmark-unique` (moderate) — Vue ×2: Accordion panel, Pagination.
    - [ ] `aria-allowed-attr` (critical) — Vue ×1: tooltip-wrapped menu trigger.
    - [ ] `button-name` (critical) — **Angular ×12, new bucket, no React/Vue counterpart**.
          AtlSelect's CDK-overlay trigger `<button>` has no accessible name when `label` is
          omitted (meta-scoped, ×8 stories — the architectural sibling of `select-name` above:
          same missing-name defect, different rule id because Angular's Select isn't a native
          `<select>`). AtlTh's sort-direction button renders only an icon glyph, no accessible
          name (Table `Sortable` + `Kitchen Sink`, story-scoped, ×3 combined). Showcase
          `AllComponents` (×1, both causes together).
    - [ ] `listitem` (serious) — **Angular ×20, new bucket, no React/Vue counterpart, and
          missing from ADR-0122's "Corrected 2026-09-12" tally** — a real gap in that
          paragraph's count, found while writing this entry: every `<atl-breadcrumb-item>`
          wraps its own host element around the `<li>`, so the `<li>`'s immediate DOM parent
          is `<atl-breadcrumb-item>`, not the `<ol>` — axe's `listitem` check (distinct from
          `aria-required-children`) fires because Angular components, unlike React's and
          Vue's plain-DOM children, always interpose a real host element between a projected
          child and its logical parent. All 5 `AtlBreadcrumbs` stories (meta-scoped, ×16) and
          Showcase `AllComponents` (×4).
  - [x] **S1 — standalone docgen spike — feasible, done 2026-09-10**
        (`tasks/docgen-spike-2026-09-10.md`). Call the docgen workers Storybook itself uses
        (`@storybook/angular-vite/internal/docgen-worker`, `@storybook/vue3/internal/docgen-worker`;
        React through `react-docgen` `parse()` directly — its worker export drives a different
        engine that this repo does not enable). Cold 3.7 s / 3.5 s / 0.56 s, warm 83 / 93 / 40 ms;
        output identical to the built shards for AtlButton and AtlDialog. Story `args` resolve
        statically through `storybook/internal/csf-tools` (`createStoryArgsResolver`, 85 ms,
        meta merged, `unresolved` reported). Whole roster ≈ 6 s per framework in one process.
        No fallback needed. Rule for S3: render-only stories are demos, not variant claims.
  - [x] **S2 — the micro-contract layer — done 2026-09-10.** `libs/spec/src/contracts/`:
        `types.ts` (schema, `satisfies`-guarded — an extra key is TS2353), `README.md`, 43
        contracts, one per snapshot master, derived from the snapshot, `index.ts`,
        `FIGMA_CONFORMANCE_EXCEPTIONS` and the master descriptions. Codex Gegenprobe on the
        schema found five real gaps (state-axis data values, cross-component `axisMap`,
        `null` values, Toggle's wrong keys, exemptions unmirrored in the master) — all folded
        into the check's rules and the contracts; recorded as the "Refined 2026-09-10"
        paragraph in ADR-0121. Not yet done from Decision 3: the story metas do not import
        the contract (no consumer yet — lands with the docs block in S5).
  - [x] **S3 stage 1 — `check:contracts` — done 2026-09-10.** `tools/scripts/check-contracts.mjs`,
        in `check:all` before `check:stories`. Offline, ≈ 4 s per framework: docgen via the
        Storybook workers, story args via csf-tools, snapshot, contracts. Rules `[AXIS]`,
        `[BOOLEAN]`, `[ENUM-UNDRAWN]`, `[COVERAGE]`, `[STALE-EXEMPTION]`, `[CONTRACT-*]`,
        `[DOCGEN-EMPTY]` (errors) and `[COVERAGE-BOOL]`, `[FIGMA-ONLY]`, `[UNMIRRORED]`,
        `[NO-STORY-META]`, `[NO-MASTER]`, `[FW-ONLY]`, `[UNRESOLVED-ARGS]` (warnings);
        `--emit` writes the parity `codeSpec` sections it can fill. Three negative tests red
        then restored. Closing the roster's real coverage gaps took **26 new stories**
        (Angular 5, React 10, Vue 11), all rendered and axe-clean in the browser suite.
        Exit 0 with 93 warnings — the visible debt below.
  - [ ] **Debt `check:contracts` made visible** (93 warnings, 2026-09-10):
    - [ ] `[COVERAGE-BOOL]` ×31 — booleans never `true` in any story (Combobox
          `required`/`readonly`, Progress `indeterminate`, Radio `disabled`, Stepper
          `linear`, Table `stickyHeader`, Textarea `required`/`readonly`, plus React-only
          Checkbox/Input/Pagination/RadioGroup/Select). Under S every Boolean state gets a
          story; promote to error once the stories exist.
    - [ ] `[NO-STORY-META]` ×46 — 15–16 child masters per framework (Th, Td, Tr, Tbody,
          Tab, Step, Option, MenuItem, MenuSeparator, AccordionItem, BreadcrumbItem,
          ChatMessage, ChatSuggestion, ChatTyping, AvatarGroup in Angular, Toast in
          React/Vue) have no story meta of their own — their shape and coverage are stage 2
          (nested-arg evidence).
    - [ ] `[FIGMA-ONLY]` ×7 UNEXPLAINED — Combobox `state=filtered`/`selected`, Input and
          Textarea `state=filled`, Select `state=filled`/`open`, Table `error`. Each needs a
          decision: draw it in code, drop it from the master, or give it a sourced reason.
    - [ ] `[NO-MASTER]` — AtlIcon has no snapshot master (its glyphs are on the Icons page
          the snapshot does not index; ADR-0057). Decide: index the Icons page into the
          snapshot, or record AtlIcon as code-only by design.
    - [ ] `[FW-ONLY]` ×2 — AtlButton `type` exists in Vue only; AtlRadioGroup
          `orientation` in React only. `check:props` territory (ADR-0093); the React
          `react-docgen` importer also drops props resolved only through `node_modules` types,
          so React's `type` absence may be tooling, not code — verify before fixing.
    - [ ] `[UNMIRRORED]` ×2 — the same two `codeOnly` entries are not named in their
          masters' descriptions; add the line on the Figma side when the Bridge is connected.
  - [x] **S3 stage 2 — `check:paint` — done 2026-09-10** (ADR-0121 "S3 stage 2 done").
        Playwright over the built Storybooks, rendered values vs the resolved `--ui-*` token
        the master binds, hover/focus rows, ratchet `tools/figma/paint-baseline.json` (755
        entries after probes and `[NOT-RENDERED]`), six `probes` in contracts. ~220 s in
        `check:all` after the Storybook builds.
  - [ ] **`check:paint` follow-ups:**
    - [ ] Root-cause the nine frequent shapes not yet examined (Checkbox/Toggle gap,
          radius, font-size; Card/Badge/Textarea height). AtlInput's height (40 vs 44) is the
          2026-09-08 token change — decide code or master per shape, then re-record.
    - [ ] React `AtlSelect` stories are classified as demos (three `optionValue`
          literals trip the literal-scan heuristic) and have never been measured. Teach the
          heuristic that repeated literals on _child_ elements are not a variant claim.
    - [ ] Overlays (Dialog, Drawer, Chat) are `[NOT-RENDERED]` closed; an open-state
          recipe per component (click the trigger, then measure) is needed before their paint
          counts. Codex's AtlChat probe finding (per-variant `drawer-panel`/`popup-bg`/
          `chat-card` layers) lives here too.
    - [ ] `--theme dark` works but is not in `check:all`; decide whether the chain runs both.
    - [ ] The baseline is a ratchet on 755 recorded drifts. It is only worth its 220 s if
          the backlog above shrinks it; review the count monthly.
  - [x] **S6a — `check:manifest-parity` — done 2026-09-10** (ADR-0121 "S6a done"): the
        three-manifest diff with `check:props`' equivalences and allowlist; six real
        divergences recorded (list above); `--compare-props` evidence in
        `scratchpad`/the ADR paragraph — 22 findings only the diff sees, 48 only `check:props`
        (`[DEAD]`, `errors`). Shared `tools/scripts/lib/docgen.mjs` now feeds both checks.
  - [x] **S4 — the scaffold ships the loop — done 2026-09-10** (ADR-0121 "S4 done"
        paragraph; ADR-0123 corrected: addon-vitest ships after all, owner decision).
        Per scaffold: `<app>/src/contracts/` (types, README, AtlButton example),
        `tools/scripts/{check-contracts, lib/ts-eval, figma-snapshot-contracts}` as synced
        copies, a projected AtlButton snapshot (`check:scaffold-snapshot`), `contracts.config.json`,
        `check:contracts` / `check:stories` / `figma:snapshot`, per-app `vitest.config.ts` +
        `vitest.setup.ts`, `a11y.test: 'error'`, `storybook-test` target; Chromium via
        `npx playwright install chromium` (preflight warns). React e2e green in 176 s through
        verdaccio incl. `check:contracts` and `check:stories`; `nx test create-workspace` 78.
  - [ ] **S4 follow-ups** (facts the proof surfaced, not smoothed over):
    - [ ] `check:contracts` is **vacuously green on the scaffold's example**: `AtlButton`
          is imported from `@atelier-ui/<fw>` in `node_modules`. Since 2026-09-11 the check
          skips such a component itself, before any docgen call, in every framework (summary
          `external: N`) — until then only React's resolver and Vue's worker happened to return
          nothing, while Angular's followed the package's `.d.ts` and returned a zero-prop
          payload (first Angular e2e, CI run 34562307047, red). Only `[NO-STORY-META]`
          remains. Real work happens on the attendee's own components. Give the check a `--manifest <components.json|url>`
          input so library components are compared through the hosted Storybook manifest
          (ADR-0097) — then the example proves something. CLAUDE.md says so today.
    - [x] Angular and Vue scaffolds not run through a real install — **CI ran both on
          2026-09-11** (run 34562307047): Vue green; Angular red on `check:contracts` (the
          item above). Fixed the same day; `E2E_FRAMEWORKS=angular` locally green in 3 m 15 s
          with `external: 1` and only `[NO-STORY-META]`. Lesson recorded (`tasks/lessons.md`,
          2026-09-11): a "not run" follow-up on a shipped artefact is a known-red, not a follow-up.
    - [ ] The scaffold ships no `docs-block.ts`, so `[CONTRACT-IMPORT]` is a **warning**
          there (severity keyed on that file's presence beside the contracts — a proxy for the
          preview's wiring, not a check of it) and an attendee's `parameters.contract` renders
          nothing. Decide: ship the block into `<app>/src/contracts/` + `docs.page` in the
          scaffold preview (needs `react` resolvable in the Angular/Vue scaffolds via
          addon-docs), or make the severity an explicit `contracts.config.json` field.
    - [ ] `findExternalPackageDir` keys on `_rawComponentPath`, which csf-tools sets only
          for a directly imported identifier; `import * as UI` + `component: UI.AtlButton` or
          `const C = AtlButton` bypass the skip (Codex, 2026-09-11). The templates use direct
          imports; note, not fix.
    - [ ] `figma-snapshot-contracts.mjs` verified in `--dry-run` only — the connect path
          needs the Desktop Bridge. First Bridge session: run it against the Atelier file and
          diff its AtlButton entry with `tools/figma/snapshot.json`'s.
    - [ ] The scaffold's `figma:snapshot` script carries a `<YOUR_FIGMA_FILE_KEY>`
          placeholder because the preset has only a boolean `figmaMcp` option. Consider a
          `figmaFile` option so the workshop duplicate's key lands at scaffold time.
  - [x] **CI after the 2026-09-11 push (`bd28fe0`, run 34562307047 / publish 34562307018) —
        diagnosed 2026-09-11.** Storybook tests, Build, Test, Lint, Release drift green on the
        runner; CLI e2e red (Angular `check:contracts`, fixed above). `check:all` then hung ~110
        min on **both** runners, in `check:manifest-parity`: the log shows its complete output at
        04:30:52, 11 s after it started, and nothing afterwards until the cancellation at 06:21:30,
        with the runner's orphan reaper killing `npm run check:all` → `sh` → `npm run
check:manifest-parity` → `sh` → `MainThread`. The gate finished its work and the process
        never exited — it was the only one of the three `lib/docgen.mjs` consumers ending on
        `process.exitCode` alone, while `check-contracts.mjs` and `check-paint.mjs` both call
        `process.exit()`. Fixed by matching them, plus `timeout-minutes: 60` on the `Sync checks`
        and `Verify (release gate)` jobs (neither had one; GitHub's default is 360). Exact
        Linux-only mechanism NOT established — the docgen workers' recursive `fs.watch` handles
        are `unref()`'d and no disposer is reachable; the code comment separates fact from
        hypothesis. Consequence worth keeping: **`check:paint`, `check:contracts` and
        `check:stories` inside `check:all` have still never run on a runner** — the chain never
        reached them. Watch the next run's duration; `check:paint` is ~220 s locally.
  - [ ] **`publish.yml` uses `concurrency: { group: publish, cancel-in-progress: false }`**, so
        the hung "Verify (release gate)" job blocks every later release run until GitHub's 6 h
        timeout retires it. Cancel a hung publish run by hand; the new `timeout-minutes: 60` caps
        the next one at an hour. Consider whether the release gate should cancel in progress.
  - [x] **S5a — skill and curriculum — done 2026-09-10** (ADR-0121 "S5a done"; ADR-0113
        corrected). `design-to-code` steps 3/5/6/7 on contract + stories + `check:contracts`;
        handoff template and three fixtures; `schulung.astro` Tag 2 (new gate claim, Block 02
        "Contract & Stories per Prompt", verify list); `design-to-code.astro` step 2 "Contract";
        `first-component`, `workshop`, `claude-design`, `agent-skills` pages; `AGENTS.md`
        steps 2–4; briefs "done when" 5; `@atelier-ui/spec/contracts/*` alias;
        `schulung-claims.e2e.mjs` rewritten (wsdemo fixture, no `index.ts` scenario). Gates:
        docs build, docs-layout, adr-refs, skill-discovery, llms, contracts, lint docs,
        check-skill, test-skill (offline) all 0.
  - [ ] **S5a follow-up:** run `node tools/e2e/schulung-claims.e2e.mjs` on a clean tree —
        Part 1 (the gate claim) was reproduced gate by gate but not executed by the script,
        because its `assertCleanTree` met the day's uncommitted work.
  - [x] **S5b — the contract docs block + story-meta import — done 2026-09-10** (ADR-0121
        "S5b done"). `libs/spec/src/contracts/docs-block.ts` (`ContractBlock`,
        `contractDocsPage`, `createElement` only), `parameters.docs.page` in all three
        previews, 83 story metas import their contract, `[CONTRACT-IMPORT]` in
        `check:contracts`. Playwright read "Contract / 129:20 / hasIcon" off AtlButton's built
        React docs page; suites 234/226/253; Angular and Vue Storybook builds green.
  - [ ] **S5 follow-ups:**
    - [ ] `docs-block.ts` carries one `@ts-ignore` on `@storybook/addon-docs/blocks`
          (`libs/spec/tsconfig.json` uses classic `moduleResolution`, which rejects the
          `exports` subpath; the framework tsconfigs resolve it). Decide: move the spec project
          to `bundler` resolution, or keep the ignore with its comment.
    - [ ] React's and Vue's Toast story metas set no `component`, so they carry no contract
          import and `check:contracts` cannot key them (`[NO-STORY-META]` for AtlToast there).
          Give them a `component` (the container) so the contract reaches their Docs tab.
    - [ ] The participant walk-through (Codex, 2026-09-10) still lists: `AGENTS.md`'s local
          MCP calls heading fixed, but the e2e's Part 1 remains unexecuted until the tree is
          clean (the other session's untracked skill files count).
  - [ ] **Cross-framework gaps found by `check:manifest-parity` (S6a, 2026-09-10)** —
        recorded as `kind: 'gap'` in `PROP_SURFACE_EXEMPT` so the gate ships green; each is a
        real divergence `check:props` could not see because the spec is silent there
        (ADR-0093 Consequences predicted the first):
    - [x] `AtlDialog` — Vue exposes no `aria-labelledby`; it hardcodes its own `headerId`
          while Angular and React accept the prop. **Resolved 2026-10-08** (`6b3e4aa2`): a
          caller's `aria-labelledby` falls through to the `<dialog>` and wins (pinned by a Vue
          spec), so the behaviour is equal; the allowlist entry is now `kind: 'design'`.
    - [ ] `AtlButton` — Angular's `<atl-button>` has no `type` binding or passthrough;
          React (via `...rest`) and Vue (`type` prop) do. A `submit` button is impossible in
          Angular today.
    - [x] `AtlCheckbox`, `AtlToggle` — Angular offers no way to pass a custom `id`; React
          and Vue do. Matters for external `<label for>`. **Done 2026-10-08** (`b109160a`):
          Angular gained an `id` input (host `[attr.id]: 'null'` per ADR-0091); the two
          `AtlCheckboxSpec:id:angular` / `AtlToggleSpec:id:angular` gap entries are removed.
    - [x] `AtlAlert` — `dismissed` (Angular, Vue) vs `onDismissed` (React). **Resolved
          2026-10-08** (`6b3e4aa2`): framework-idiomatic naming, like `onPageChange`; the three
          entries are `kind: 'design'`, and `check:manifest-parity` now accepts `design`
          entries as settled.
  - [x] **Class-c behaviour bugs from `tasks/divergence-triage-2026-10-08.md`, fixed 2026-10-08**
        (test red before, green after, one commit each): Vue tooltip `aria-describedby`
        (`f96a861f`), Vue tabs focus (`8fc1bd77`), Vue accordion group scoping (`553fa4ce`),
        React/Vue combobox skip-disabled (`38536d84`), Angular checkbox/toggle `id`
        (`b109160a`), Vue toggle `useId()` (`22d3749c`). React tooltip JSDoc no longer claims a
        flip it does not do; the flip itself stays an owner decision. Still open from the
        triage: item 7b (Angular button `type`), and
        the Figma master text for stepper `linear` (needs the Desktop Bridge).
  - [x] **Owner decisions of 2026-10-08 on the triage, done** (see the "Resolved 2026-10-08"
        column in `tasks/divergence-triage-2026-10-08.md`): `errors` accept the shared
        `AtlErrorItem` in React and Vue, 21 gap entries removed (`aaf1cbd3`); breadcrumb
        `current` is the last item by default in all three, any explicit `current` switches
        the default off (`3b850592`); the tooltip no-flip is recorded in its contract and the
        position JSDoc (`b7ce573e`); pagination, stepper `linear`, select keyboard, dialog and
        alert records (`6b3e4aa2`).
  - [x] **Menu keyboard in React and Vue (triage 6a), done 2026-10-08, owner decision**: the
        trigger and menu follow the WAI-ARIA menu-button pattern (`74fab516`): Enter/Space/
        ArrowDown open on the first enabled item, ArrowUp on the last, arrows wrap, Home/End,
        type-ahead, roving tabindex, Escape/Tab/activation close and return focus. Submenus
        stay Angular-only (metadata says so). Disabled items are skipped in React/Vue; the
        CDK keeps them focusable, a recorded difference. 15 specs per framework red then
        green, plus a `KeyboardNavigation` story play each. `a11y-tree.ts` now records
        `aria-describedby` presence, so the Vue-tooltip class of defect fails `check:a11y-parity`
        (shown by reverting `f96a861f` in a scratch change).
  - [ ] Stepper `linear` in the Figma master description still says "only the active and
        completed steps are clickable"; the code (all three) also passes `optional` steps.
        Correct the master's description line, then refresh `tools/figma/snapshot.json`.
  - [ ] S6 monorepo retirements — as ADR-0121 Decision 6. S6a (`check:manifest-parity`,
        the three-manifest diff) is built; `--compare-props` evidence in the S6a report: 28
        findings only the manifest diff sees, 48 only `check:props` sees (`[DEAD]` inputs —
        a manifest cannot see consumption — and the 21-key `errors` family, which is a
        spec-incompleteness finding, not a cross-framework one). Retiring `check:props` needs
        a home for `[DEAD]` first.
  - [ ] Background for the decision — `tasks/spec-rethink-2026-09-10.md`: the greenfield
        pass the owner asked for. Inventories what a machine can test
        without massive effort (26 rows; 19 need no authored artefact), what figma-console-mcp
        1.40 and Storybook 10.6 extract and verify, and derives the thinnest spec: **S —
        stories are the spec** (component JSDoc + one story per variant/state with a Figma link
        and `play` + a micro-contract block in the story meta for master id, intentional
        mismatches and parity probes; everything else derived from the manifest, the rendered
        story and the snapshot). Codex converged on the same shape independently. It amends
        the morning plan's § 2 and steps S2/S3 (no contract document; T stays as the additive
        fallback) and adds **S0: wire the idle browser-mode suite into CI and set
        `a11y.test: 'error'`** — the largest verification gain available, needs no spec.
        Five decision points in its § 5; S1 (standalone docgen spike) stays the feasibility gate.
  - [ ] **Side findings from the rethink, each independent of the shape decision:**
    - [x] **Done 2026-09-10** — `tools/scripts/figma-snapshot.mjs` started
          `figma-console-mcp@latest` while `.mcp.json` pins `1.40.0` (ADR-0110);
          `tools/figma/snapshot.json` recorded `serverVersion: null`. The generator now
          resolves the package spec from `.mcp.json`'s `figma-console` entry (missing entry =
          exit 2, no `@latest` fallback) and records `client.getServerVersion()`, marking the
          declared version if the server stays silent. ADR-0110 carries the dated correction.
          The snapshot stays `serverVersion: null` until the next Bridge-connected refresh
          (Codex finding, verified 2026-09-10).
    - [ ] The Storybook browser-mode suite (interaction + axe, ~11 s per lib) is `# NOT
WIRED` in `.github/workflows/ci.yml:122-135` because it fails under `CI=1` for an
          unfound reason; `parameters.a11y.test` is `'todo'` (React, Vue) and unset (Angular),
          so axe gates nothing today.
    - [ ] `AGENTS.md` names an addon-mcp tool `display-review`; the wire name is
          `review-create` (`node_modules/@storybook/addon-mcp/dist/preset.js:193`,
          `toMcpToolName("review.create")`).
  - [ ] Review Option B (derive `index.ts` unions from a contract record) stays open as
        plan S6(c) — after one cohort has used S2–S5, not before.
  - [ ] Side finding (Codex, verified): Vue generator writes `atl-<fileName>.vue` while
        its test template imports `./<className>.vue`
        (`tools/generators/atl-component-vue/files/atl-__fileName__.spec.ts__tmpl__:2`).
        Fix independent of the decision above.

- [ ] **Design-workflow skills — build the decided catalog** (decided 2026-09-07).
      Research and proposal in `plan/design-skills-blueprint.md` (§ 8 carries the six
      decisions); verbatim digests in `plan/research/design-skills-2026-09-07/`, draft of
      `design-to-code` under its `drafts/`. Decided shape: **two new skills**
      (`design-to-code` with a review/verify mode, `artboard-bridge` for Claude Design)
      **plus architect additions**. Order as decided:
  - [x] `skills/figma-workspace-architect/references/plugin-api-gotchas.md` from the Figma
        section of `tasks/lessons.md`; SKILL.md references list updated; discovery re-synced
        (3a8035d).
  - [x] Fix `tools/scripts/test-skill.mjs`: valid modes derived from the skill's own
        `### <Mode> mode` headings (3d118e8).
  - [x] Pin `figma-console-mcp` to 1.40.0 in `.mcp.json` and in the scaffold preset —
        ADR-0110 (20efda2, 6b23b2b).
  - [x] Record the Code Connect exclusion (toolchain choice) — ADR-0111 (20efda2).
  - [x] ADR-0096 dated correction: `design-to-code` may prefill provenance and scope of the
        handoff document; behaviour, exclusions and reuse decision stay with the author
        (20efda2).
  - [x] `design-to-code` into `skills/` with Build and Review modes, four references, six
        fixtures, `project.json`, explicit `nx.json` entry, `UNDISTRIBUTED_SKILLS` (the
        no-argument `sync-skill-discovery` now skips undistributed names) — d6273ce.
  - [x] skill-creator iteration 1 (2026-09-07): three evals × with/without skill in
        worktrees; graded; with-skill 86 % vs 59 % pass rate, +44k tokens, same wall time.
        Record and critique in `skills/design-to-code/evals/iteration-1.md`; revisions in
        bde4432.
  - [ ] skill-creator iteration 2: neutral run names in the prompts, the split/added
        assertions from iteration-1.md, a live-id variant of eval 0, and a Build-from-handoff
        eval once a scratch Figma draft with a code-less master exists.
  - [ ] Description optimisation (`run_loop.py`) after the owner reviews
        `skills/design-to-code/evals/trigger-eval.json`.
  - [x] Architect additions (2026-09-07): `references/build-from-code-contract.md` (generic
        recipe, Atelier worked example — kept generic so the distributed skill stays
        repo-free); tool map 71 → 100 tool names with Bridge/REST marks and five new sections
        (token I/O, slots, history/changelog/blame, `ds_*` pipeline, session/multi-file);
        page taxonomy gains Playground/Deprecated/spacer pages, cover contents, doc frames,
        split-on-symptom; component-design gains the state → CSS mapping table and the native
        Slot property; token-architecture gains `codeSyntax.WEB`; audit-checklist gains the
        two Category-1 rules (enumerate consumers before "unused"; delete/rebind is Migrate)
        and the report-tool / a11y-weights note; SKILL.md Audit text carries the same rules.
        Not ported: the southleft lint rule catalog (digest 06 has only its counts).
  - [x] `artboard-bridge` landed 2026-09-08 (9c38317 + revisions): Intake + Publish
        modes, three references (sheet shape, palette mapping, governance), five fixtures.
        Iteration-1 evals (Intake ×2, governance ×1): 87 % vs 43 %; record and critique in
        `skills/artboard-bridge/evals/iteration-1.md`. Publish mode not yet exercised — needs
        a scratch project (`create_project` with the Atelier `design_system_id`), owner's go.
  - [x] `artboard-bridge` iteration 2 (2026-09-08): Intake 7/7 vs 1/7, governance 2/5 vs
        3/5, Publish 2/8 vs 3/8 — record and the reading of those numbers in
        `skills/artboard-bridge/evals/iteration-2.md`. Publish ran for the first time, against
        scratch project `44481d29-1041-4aa0-adf0-cf59028016d7`; the skill correctly refused
        (AtlBadge DRIFT) while the baseline published unverified code. Revisions: description
        carve-out for third-party artboards, P0 refusal as a successful run, P0a repo-wide
        DRIFT case.
  - [ ] `artboard-bridge` iteration 3: the write path (P1–P7) is still unexercised —
        needs one component with a fresh parity record (Desktop Bridge re-verify +
        `parity:record`, or a marked synthetic fixture). Also: re-run the governance eval
        against the fixed description, add an assertion that penalises publishing over a
        DRIFT row, lift the `list_projects`-only cap, require the correct decider roles.
  - [ ] **Decide: package the skills into `create-workspace`** (owner's question,
        2026-09-07; blueprint § 8 decision 7). Preset ships `.mcp.json` + `CLAUDE.md`, no
        skills. Recommended: vendor the generic skills at generate time and give
        `design-to-code` a scaffold profile — but only after its eval runs pass in the
        monorepo. The preset's own `figma-console-mcp@latest` gets the ADR-0110 pin now.
- [ ] **`tools/design/artboards.json` has drifted from the live Claude Design project**
      (verified 2026-09-07 via `list_files`): the registry lists 31 artboards including
      `Typography Directions.dc.html`, which no longer exists in the project; the project has
      31 `.dc.html` files including `Index.dc.html`, which the registry does not list. Same
      count, two mismatches. `gen-design-status` reads the registry, so `plan/design-status.md`
      is stale in the one column it says cannot be derived. Why now: it is the exact staleness
      the file's own header warns about, observed rather than hypothetical.
- [ ] **AtlCard header tracking: decide which side moves.** `.atl-card-header` sets
      `letter-spacing: var(--ui-letter-spacing-tight)` (−0.01em) in all three frameworks; the
      master's title text sits on the shared `ty/title` style at 0 %. Known and left open in
      c88a543 (2026-09-07 09:20, "Not changed: the master shows letter-spacing 0% against the
      code's -0.01em"); both eval runs of 2026-09-07 re-found it independently, one calling
      it uncaught. Manifest: `--ui-type-display` pairs with the tight tracking; the title role
      does not say. Decide (tighten the master's style, or drop the tracking from the header)
      and only then treat AtlCard's parity record as clean rather than "clean except the
      documented gap".
- [ ] **Is the `Library Tokens` collection stale against `tokens.css`?** Reported by a
      baseline eval run on 2026-09-07 (unverified by me): the collection was generated
      2026-07-22 (`gen-figma-library-tokens.mjs` unchanged since 39f92a4) while `tokens.css`
      gained the teal/status ramps, `border-width-*` and the `type-*` roles since; the
      generator's header documents which families it skips, so that part is by design, but no
      gate compares Figma variable _values_ to `tokens.css` (`check-figma.js` checks bindings,
      not values). Verify with `figma_get_variables` against the current sheet; if stale,
      re-run `npm run figma:sync-tokens` and decide whether a value-sync gate is worth having.
- [ ] **Story `figmaNode()` design links are unchecked against the live file.** All three
      `atl-breadcrumbs.stories.*` point at `55-141`, which no longer exists (live
      `getNodeByIdAsync` → `null`, 2026-09-07; the master is `55:139`). 91 of the 119
      distinct ids the stories link are outside what `tools/figma/snapshot.json` records
      (masters + referencedNodes), so an offline gate cannot yet tell dead from unrecorded.
      Extend `figma-snapshot.mjs` to resolve every story-linked id (exists / type / master
      it belongs to) and add a `check:story-designs` gate on that; fix the three Breadcrumbs
      links now.
- [ ] **Architect Audit mode recommends deletions without its own Migrate protocol.** In
      the 2026-09-07 eval run of the token-architecture prompt, `figma-workspace-architect`
      (Audit) classified findings with severities but never opened
      `references/migration-playbook.md`, called deleting the `Effects Tokens` STRING
      variables "zero risk" and offered in-place rebinding — both classified Breaking by its
      own playbook — and never queried `Docs Brand Tokens` before calling `Primitive Tokens`
      a dead duplicate (the baseline run did, and found it backs that system, consistent with
      ADR-0018 → ADR-0030). Fix in the skill: Audit's fix column must route any delete/rebind
      through Migrate's safety classes, and Token Architecture findings must enumerate every
      collection's consumers before "unused".
- [ ] **All 37 parity records are DRIFT after the token change** (measured 2026-09-08,
      `npm run check:parity` exit 1, 37 blockers, 0 critical). Expected by ADR-0104 — the
      shared `tokens.css` is part of every component's `inputsHash` — but it means the whole
      gate is red until a re-verify sweep, and `artboard-bridge` Publish is blocked repo-wide
      because its P0 refuses on DRIFT. The sweep needs the Desktop Bridge
      (`figma_check_design_parity` per component, then `parity:record`); the interactive
      Light/Dark pass is only needed for the stateful ones. Decide whether the sweep runs
      per component on demand or as one session.
- [ ] **`AtlDrawer.dc.html`'s finding 4 is wrong and should be corrected in the sheet.**
      It claims `closeOnBackdrop` is a visible Boolean on AtlDrawer's master but code-only on
      AtlDialog. `tools/figma/snapshot.json` says otherwise for both: AtlDrawer's `properties`
      are `{position, size}` only, and each component's own description cites ADR-0056 —
      "Boolean `closeOnBackdrop`: not modelled — behaviour only, as on AtlDialog." Two
      independent eval runs (2026-09-07, 2026-09-08) reported the finding as fact from the
      sheet; a third caught it only because the skill made it cross-check. Fix the sheet in
      the redesign project (an `artboard-bridge` Publish-style edit) so the next reader does
      not inherit it.
- [ ] **`plan/figma.md` carries two stale tables.** § Variable Collections is pre-ADR-0030
      (flagged stale there since 2026-08-26), and the § Components node-id table still says
      `LlmBreadcrumbs 55:141` / `LlmPagination 55:145` where `tools/figma/snapshot.json`
      (2026-09-07) has `AtlBreadcrumbs 55:139` / `AtlPagination 55:143` — a baseline eval run
      spent 35 tool calls on the dead `55:141` (2026-09-07). Replace both tables with pointers
      to the snapshot and `check-figma.js`, or regenerate them from the snapshot.

- [ ] **Component backlog surfaced by the docs review (L1–L4)** — not docs CSS; the
      docs gate allowlists each with a reason pointing here. Why now: L1 is a critical axe
      violation and the rest are already root-caused.
  - [ ] **L1** `AtlSelect` demo / component: native `<select>` without an accessible
        name (axe `select-name`, critical) — either the demo omits the label the
        component needs, or the spec lets it be omitted.
  - [ ] **L2** `AtlProgress`: `role=progressbar` without `aria-label` in 16 demo
        instances (axe `aria-progressbar-name`) — compare `AtlButton`'s
        discriminated-union enforcement.
  - [ ] **L3** Checkbox/toggle inputs measure 20×20 / 1×1; login-form demo
        `input[type=email]` under 24 px when the sticky nav overlaps — confirm the label
        extends the hit area (WCAG 2.5.8).
  - [ ] **L4** `AtlTabs` `variant="pills"` neither wraps nor scrolls at 375 (+19 px on
        `/patterns*`) — `chip-collection-reflow`.
  - [ ] `AtlCodeBlock`'s scroller has no focusable content (axe
        `scrollable-region-focusable` on `/components/code-block`).

- [ ] **Radio groups lay out in a row in Angular and Vue and in a column in React.**
      `.atl-radio-group` / `:host` is `display: flex` with no `flex-direction`, so the
      default is `row`; `flex-direction: column` lives only under `.orientation-vertical`,
      which only React emits and whose default in React's own props interface is
      `'vertical'`. A three-option group therefore renders stacked in React and
      side-by-side in the other two. Why now: live rendering divergence across all three
      frameworks, already root-caused.

- [ ] **Vue's checkbox and toggle still lack `aria-required`.** Angular sets
      `[attr.aria-required]` and no native `required`; React sets both; Vue sets only the
      native `:required`. The same bug was found and fixed for `atl-input.vue`; the
      sibling controls were never swept. Why now: mechanical, same fix already proven.

- [ ] **Three CSS defects from the type-role pass still stand** (two siblings already
      closed and gated by `check:dead-selectors`, ADR-0081):
  - `.atl-tbody-empty-cell`'s `font-size` is dead — specificity (0,1,0) loses to
    `.atl-table.size-md tbody td` at (0,2,2), so the empty message renders 14px, not
    the 16px written. Identical in Angular and Vue.
  - `.atl-tooltip` contradicts itself: `max-width: 20rem` + `word-wrap: break-word`
    **and** `white-space: nowrap`. React/Vue have the nowrap, Angular does not — same
    tooltip wraps in one framework and cannot in the other two.
  - Five chat controls render in the UA font (`.action-btn`, `.fab-bubble`,
    `.close-btn`, `.chip`, `.field`) — every other component writes `font: inherit`
    explicitly; `atl-chat.css` omits it despite its own comment saying it exists to
    prevent exactly this.
  - (`.radio-text` unstyled-in-Angular was examined and deliberately left — see the
    AtlRadioGroup pass below.)

- [ ] **Write the accordion a11y specs.** The one `kind: 'gap'` entry left in
      `A11Y_PARITY_EXEMPT` — comparable across all three adapters and the exact component
      ADR-0025 cites as its motivating divergence. Why now: most likely place left for a
      real finding; removing the exemption is a one-line follow-up once the specs land.

- [ ] **Scope a real-browser a11y check — proposal only, nothing built.**
      `check:a11y-parity`'s header (extended 2026-09-06) now names three defect
      classes it structurally cannot reach, all found by hand this session with
      Playwright, none catchable by a jsdom-based gate: AtlStepper's
      keyboard-unreachable headers (no tab order in jsdom), AtlBreadcrumbs'
      CSS-generated separator leaking into the tree (jsdom never computes
      `::after` content), and `a11y-tree.ts`'s accessible-name shortcuts
      disagreeing with real engines (the stepper panel's `"2"` vs `"Profile"`,
      the chat log's manufactured transcript-as-name). `check:docs-layout`
      (ADR-0089) already launches Playwright+chromium+axe-core against the built
      docs site, but its own header deliberately scopes its axe rules away from a
      general a11y audit and points back at `check:a11y-parity` — which, per the
      above, can't do this job either, for the opposite reason (jsdom vs. no
      layout). Two reuse candidates worth comparing before writing a new gate
      from scratch, not yet costed against each other: (1) add a per-component
      whole-document Tab-order probe plus a native-tree
      (`Accessibility.getFullAXTree`) read onto `check-docs-layout.mjs`'s
      existing browser session, reusing its solved server/settle/retry plumbing;
      or (2) once the blocked `storybook-test+axe` CI item below is unblocked,
      its Vitest-browser-mode chromium session is closer to per-component
      isolation than a full docs-page render and may be the more natural home.
      Whichever path, a real check would need to assert on live focus order and
      a native/ARIA-computed tree — exactly what today's three findings had to
      be measured by hand instead.

- [ ] **`storybook-test+axe` in CI — blocked, with a full repro.** Passes locally (216
      React + 242 Vue, ~11s/lib) but fails identically whenever `CI` is set — a
      `vitest`-browser-provider connection issue, not a runner/chromium issue (ruled out
      via ADR-0042's `check:geometry`, which drives real chromium on the same runner and
      passes). Why now: repro is narrowed to two candidate next steps — capture the served
      page's console in CI, or bisect `@storybook/addon-vitest` / `@vitest/browser`.

- [ ] **AtlInput, AtlTextarea and AtlCombobox have no non-colour invalid indicator in
      Figma.** ADR-0055 made the `AtlIcon danger` indicator mandatory in code for WCAG
      1.4.1, and AtlInput's own master description already claims it — the master just
      doesn't show it. Why now: the Icon masters (ADR-0057) now make it placeable; it was
      blocked on exactly that until 2026-08-27.

- [ ] **One rehearsal of the participant path on a non-author machine, timed**
      (Schulung review §10). Why now: last unverified step — everything else in both
      Schulung reviews is closed. Run it against `tasks/schulung-dry-run-kit.md`
      (built 2026-09-06): the ordered checkpoint list, known-blocked items,
      timing tracker and a findings table shaped like the three existing reviews —
      built so the rehearsal is a one-day job with a comparable result instead of
      an improvisation.

- [ ] **Schulung M11: trainer-internal tone still on the public page**
      (`tasks/schulung-review-2026-09-02.md` §7). Re-verified 2026-09-06 while
      closing the `solved-*`/repo-location item below (see ADR-0103): this finding
      itself had silently dropped out of this file during today's restructuring —
      re-added here rather than left untracked. Still exactly as the review found
      it: `docs/src/pages/schulung.astro:96`'s "nur Trainer-Maschine —
      claude.ai/design braucht ein anderes Login als der Kohorten-API-Key"
      credential-class remark (plus the neighboring fence-script/"Gegenmittel"
      lines the review names at `:97-99`), and `schulung-2tage-agenda.md` Block 4's
      "Alle Minutenangaben sind Schätzungen … kein Dry-Run … die erste Kohorte
      mitstoppen" admission. Not personal data or a secret (ADR-0103 confirms this
      is a different question from I1), so no repo-split rationale — just trim the
      page to curriculum + prerequisites and move the contingency/tone lines to
      wherever trainer prep material lives day to day.

- [ ] **Small near-term fixes (grab-bag)** — none blocking, each cheap:
  - [ ] The superseded glyph documentation frame on the Icons page is verified inert
        (1200×1328, 107 nodes, 0 components/instances/external refs) and ready to delete;
        left standing only because deleting from the shared Figma file wasn't part of an
        approved batch.
  - [ ] The Vue mount hint (`first-component.astro`, `tutorial.astro`: edit
        `workshop-vue/src/views/HomeView.vue`) has never been confirmed against a real
        scaffold — `@nx/vue` isn't in `node_modules`. Scaffold one before the next
        workshop.
  - [ ] `libs/create-workspace`'s token-vendoring comment is stale in one clause
        (`preset.ts:108-110`): "published packages don't ship tokens.css" is no longer
        true (they do), but the other justification — editing colours inside
        `node_modules` is a bad workshop experience — carries the decision on its own.
        Comment-only fix.
  - [ ] `coverage.thresholds` in 3 vite configs — measure current coverage first, may
        fail CI.
  - [ ] Latent Chat divergence: React's `AtlChatHeader` renders its close button
        unconditionally where Angular/Vue gate it behind `variant !== 'inline'`. Align
        React when Chat is next touched.
  - [ ] `.atl-tr-select-cell` is 44px wide with 32px of inherited padding, leaving a
        12px content box for an 18px checkbox — reset the cell's padding, or widen it (a
        code change in three frameworks).
  - [ ] Re-verify the 30 stale parity records with the Figma Desktop Bridge open
        (`figma_check_design_parity` per master → `parity:record` → `check:parity`).
        **Sequence this after** the parity-record-scope decision below — narrowing
        `inputsHash` first would shrink this list, so deciding it first avoids 30 wasted
        bridge round-trips.
  - [ ] Schulung M4–M6: clone-first kata prompt + story file; Block 05 exercise page;
        clone quickstart + local `.mcp.json` snippet on 440x.
  - [ ] Schulung M12: `solved-*` branches — build the promise or remove it
        (`agenda:81,208`). Owner decision 2026-09-06: fix in place, not remove — the
        agenda's two mentions (gap-table row 81, Folie-7 bullet, now ~209) were reworded
        to say the branches don't exist yet and are trainer prep, not an existing asset;
        building the four `solved-toast`/`solved-tagchip`/`solved-statcard`/`solved-avatar`
        branches themselves is still open.
  - [x] ~~Gate gap: nothing cross-checks `snapshot.json.uiTokens`.~~ Closed 2026-09-09:
        `check:figma-token-names` asserts every `color/*` / `spacing/*` / `radius/*` name in
        the snapshot has a matching `--ui-*` declaration in the canonical token file
        (ADR-0115), and fails loudly when it finds zero relevant entries — which is what the
        old prefix-sum guard let a truncated list slip through. One-directional by design:
        code may carry a token before Figma catches up, which is lag, not drift. It cannot
        prove value equality (that is `figma_check_design_parity`'s job) and is silent on the
        other token groups.
  - [x] ~~**Category split: Figma `Action` + `Form` vs code `Inputs`.**~~ Closed 2026-09-10,
        ADR-0120. Figma moved: `Action` merged into `Form`, the Section renamed `Inputs`, and
        all ten masters re-prefixed (`AtlOption` included, which the first pass missed). Every
        `COMPONENT_SET` node id verified unchanged live, before and after — the only way this
        change could have been expensive. `CATEGORY_ALIGNMENT_EXEMPT` is empty and
        `check:category-alignment` passes with no exemption in use. The rule the collision
        produced — the side carrying no downstream identity moves — is ADR-0120, with the
        matching dated correction written into ADR-0118.
  - [ ] **Figma: `AtlButton` has no card wrapper while the other nine Inputs masters do.**
        Fallout of the merge above: `Action` laid its component directly on the Section, `Form`
        wrapped each in a white card frame. Merging kept each container "as is", so Button now
        sits bare on the tinted background — visible asymmetry in a file that is itself teaching
        material. Cosmetic only; building the wrapper is a larger mutation than the merge was.
        Owner decision pending.
  - [ ] **A `figma-console-mcp@latest` instance is running unpinned** (pid seen 2026-09-10).
        `.mcp.json` pins `1.40.0` (ADR-0110); this process was started as `@latest`, most likely
        by following `preflight.mjs`'s old fix hint, which has since been corrected to derive the
        pin. Nothing detects an unpinned _running_ server — preflight now compares the on-disk
        `.version` against the pin, which is a different thing. Restart it against the pin, and
        decide whether the running-version case is worth catching too.
  - [ ] **Gate gap: `check:category-alignment`'s selector→master heuristic has no gate of
        its own.** It resolves a `components.ts` entry to its Figma master by taking the first
        `Atl[A-Za-z]+` token in the `selector` field, with a hand-maintained override table for
        the two entries whose `selector` is prose (`tooltip`, `toast`). A ninth odd selector
        hits `[SELECTOR-UNRESOLVED]` — loud, verified, not a silent mis-map — but nothing
        checks that the override table is complete. Also: the gate assumes one flat category
        string per component and has no vocabulary for a master that genuinely spans two
        Sections.
  - [x] ~~**Category name split: `Feedback` vs `Layout`.**~~ Resolved 2026-09-09,
        ADR-0118: two agreeing sources (Figma master names + story titles) outrank one, so
        `components.ts` follows and now says `Feedback`. Three further hardcoded `Layout` keys
        turned up outside the file the finding named — `ComponentDetail.tsx`'s `CATEGORY_TONE`
        and `STORYBOOK_CATEGORY` (the latter a workaround map whose own comment cited this
        bug as its reason for existing) and `McpExplorer.tsx`'s mock data. Held by
        `check:category-alignment` from now on. Original finding, for the record: Storybook's own sidebar groups
        `AtlAccordionGroup` / `AtlAlert` under `Feedback` (`storySort.order` in all three
        `.storybook/preview.*`, and the story `title:` prefixes agree);
        `docs/src/data/components.ts` calls the same grouping `Layout`. Two sources, two
        names, neither obviously wrong — and `tasks/schulung-content-review-2026-09-08.md`
        § E2 asserted `Layout` was simply "the actual name", which is now corrected in place.
        Surfaced by the ADR-0116 work, which hit it from the `plan/figma.md` side and
        correctly declined to pick a side from outside `docs/src/**`. Decide which name wins,
        then make the other follow — and check whether a gate can hold it, since nothing
        currently compares the two.
  - [x] ~~**Gate design: `SCAFFOLD_PORT_EXEMPT` is keyed by `file:line`.**~~ Closed
        2026-09-09, ADR-0119: re-keyed on content (`scaffoldPortKey(file, prevLine, line)`),
        two lines of context because `workshop.astro` renders the identical citing line in
        two preflight panels, plus a require-time duplicate-key guard — a `new Map([...])`
        literal silently keeps only the last entry on a collision, which would have been a
        quieter version of the same bug. Proven by reproducing the original line shift and
        confirming the gate stays green. Remaining limit: the two-line key is a heuristic, and
        a third occurrence sharing both lines would need a hand-picked context line (the guard
        throws rather than dropping it silently).
  - [x] ~~Gate gap: the two `preflight.mjs` copies are in sync by hand only.~~ **Stale
        entry, not open work** — `tools/scripts/sync-preflight.mjs` plus
        `check:preflight-clone-sync` landed in `b1b52d9` (2026-09-05) and are in the
        `check:all` chain; re-verified 2026-09-09 (exit 0 clean, `[DRIFT]` naming both paths
        when one copy is tampered with, exit 0 again after restore). The two copies are
        required to be byte-identical: the clone-vs-scaffold branching lives inside the single
        file's own `detectEnvironment()`, so there is no legitimate per-copy divergence.
  - [ ] Gate gap: nothing stops a new page hardcoding `workshop-<fw>` again with no
        monorepo branch beside it.
  - [ ] _(Bonus, spawned by ticking L2285 above, not one of the original 130):_
        `docs/src/pages/claude-design.astro` still hand-types "twenty-four tags" and
        "17/13 ADRs" (should read 16/12) — same derive-don't-hand-type pattern as
        `gate-count.ts` (below), now cheap to copy.

### Storybook + the storybookjs/mcp skills in the scaffolded workspace (2026-09-10)

Owner asked: install the `storybookjs/mcp` agent skills automatically when a new
workspace is created. Two decisions taken at the start (owner, 2026-09-10):
**Storybook always ships in the scaffolded workspace** (not behind a flag), and
**the skills are installed by the preset itself** (network call during scaffold),
not vendored and not left to the attendee.

Why Storybook has to come first: all four skills (`stories`, `storybook-init`,
`storybook-setup`, `storybook-upgrade`) require a local Storybook ≥ 10.5 plus
`@storybook/addon-mcp` and the `storybook ai` CLI. The scaffold has none today, and
`stories` declares itself as "invoke FIRST, before creating, editing or deleting
components, stories, styles, CSS, themes, colors or design tokens — no exceptions",
so shipping it into a Storybook-less workspace would route every UI task an attendee
starts into a skill whose first move is to propose installing Storybook.

`preflight.mjs` already assumes the outcome: its `scaffold` branch checks "dev server
(4200) + Storybook (6006)" and its comment calls 6006 "its single local Storybook",
while `preset.ts` never wrote one. This closes that gap rather than opening it.

- [x] **S1 — Storybook in every scaffolded app.** Per `workshop-<fw>`: `.storybook/`
      (`main.ts` + `preview.(ts|tsx)`), framework `@storybook/{angular-vite,react-vite,
vue3-vite}`, addons `addon-mcp` + `addon-docs` + `addon-a11y`, `features.componentsManifest`
      and (Angular/Vue) `features.experimentalDocgenServer`, tokens.css imported in preview,
      one example story per app. `storybook` / `build-storybook` targets as `nx:run-commands`
      mirroring the monorepo's shape (`npx storybook dev --config-dir … --port`), port 6006
      for the first framework (+1 per extra framework). Storybook deps pinned to 10.6.0, the
      same versions the monorepo runs. No `addon-vitest`: the scaffold has no test runner, so
      the skills' `test-run` tool stays unavailable — deliberate, recorded in the ADR.
- [x] **S2 — Skill install as a post-generator task.** `npx -y skills@<pinned> add
storybookjs/mcp -s '*' -a claude-code -y --copy` at the workspace root, `DO_NOT_TRACK=1`
      and a bounded `SKILLS_CLONE_TIMEOUT_MS` so a conference network cannot hang the scaffold.
      `--copy` rather than the CLI's default symlink farm (Windows attendees without developer
      mode). Non-fatal: a failed install prints the exact command to re-run and the scaffold
      still completes. New `skills` schema option (default `true`) so CI and offline runs can
      opt out.
- [x] **S3 — Say it where attendees read it.** Generated `CLAUDE.md` and `README.md` gain
      the Storybook commands and a short "these skills are installed, here is what they do and
      how to update them" section.
- [x] **S4 — Prove it.** `nx test create-workspace` (spec extended for both S1 and S2,
      including the failure path), `nx lint create-workspace`, `npm run check:preflight-clone-sync`,
      and the real gate: `nx run create-atelier-ui-workspace:e2e` — it scaffolds through local
      verdaccio and runs `nx build workshop-<fw>`; extend its file assertions to `.storybook/main.ts`
      and the installed skill directory.
- [x] **S5 — ADR-0123.** Records both decisions and, honestly, the cost of the second one:
      `skills-lock.json` carries only `source` + `computedHash`, the CLI clones the default
      branch (bundled simple-git) and `--help` exposes no ref/commit pin, so the scaffold pulls
      **unpinned third-party skill text at workshop time**. That is the same risk class ADR-0110
      decided the other way for `figma-console-mcp@latest`; the divergence is deliberate here and
      needs to be written down as such, together with what would let us pin later (an upstream
      `owner/repo@ref` form, or vendoring with a byte-drift gate like `sync-preflight.mjs`).

**Review (2026-09-10).** Done, with two defects found by the work rather than by the
plan — both recorded in [ADR-0123](../plan/adr/0123-the-prerequisite-ships-with-the-skill.md).

- `@storybook/angular`'s non-optional `@angular-devkit/build-angular` peer broke the
  scaffold's `npm install` (ERESOLVE against Angular 22). The scaffold now uses
  `@storybook/angular-vite` alone; React and Vue declare their renderer packages
  explicitly instead of leaning on npm hoisting, which pnpm would not provide.
- `@atelier-ui/angular` imports six `@angular/cdk/*` subpaths and declared none of them.
  Invisible here (the root has CDK) until the example story became the first real
  consumer. Now a declared peer.

Gates run by me, exit codes: `nx test create-workspace` 0, `nx lint create-workspace` 0,
`nx build create-workspace` 0 (all ten templates confirmed present in `dist/`),
`nx test create-atelier-ui-workspace` 0, `nx lint create-atelier-ui-workspace` 0,
`nx lint angular` 0, `nx build angular` 0, `nx test angular` 0,
`check:preflight-clone-sync` 0, `check:adr-refs` 0. Full CLI e2e: **React green end to
end** (install, `nx build`, `nx build-storybook`). The skills install was proven directly
— the preset's exact argv in a scratch directory, exit 0, four real `SKILL.md` files under
`.claude/skills/`.

A second-model review (Codex) of the finished diff produced eight findings; six were
acted on (the `.mcp.json`-vs-CLAUDE.md toolset promise, the "installed" claim over a
swallowed failure, the unreachable `--skills` flag, the e2e's three uncontrolled clones,
the `@storybook/angular` import, and a `test-run` claim in three template comments). One
was rejected with a reason (`ensureBuilt()` staleness — the `e2e` target's `dependsOn`
rebuilds; the gap only exists on the direct-`node` debug path the file's own header
documents).

Open, from this work:

- [ ] Angular's `nx build-storybook` in a scaffolded workspace has not been re-run since
      the `@angular/cdk` peer landed — the run died on `ENOSPC` (the machine's disk was at
      100%), not on the fix. Re-run `E2E_FRAMEWORKS=angular npx nx run create-atelier-ui-workspace:e2e`
      once there is disk.
- [ ] `@nx/dependency-checks` is still not enabled for `libs/react` and `libs/vue` — the
      same structural gap that hid the `@angular/cdk` defect, currently with no defect behind
      it. Wire it the same way `libs/angular` now is, deliberately rather than as a drive-by.
- [ ] The example story is proven to compile, not to render — a static Storybook build
      never executes it. Nothing currently renders a scaffolded story.
- [ ] `installSkills()`'s Windows path (`shell: true` + `taskkill /T /F` on timeout) is
      unverified on Windows; there is no Windows machine or runner in this project.
- [ ] `SKILLS_TEST_FRAMEWORK = FRAMEWORKS[0]` in the e2e keeps the network install to one
      clone per run only while CI invokes the job unmatrixed. A per-framework matrix would
      silently restore three.

## Needs an owner decision

The ones the owner and I will walk through together.

### Workshop substrate: move to the Conciso Design System (ADR-0165, 2026-10-09)

Decided 2026-10-09. Spike: `plan/research/cds-substrate-spike-2026-10-09.md`. Pushes, the CDS PR
and npm deprecations each need the owner's explicit go.

- [x] P0a ADR-0165 in Atelier.
- [ ] P0b CDS ADR superseding CDS-ADR-0015 (contract layer in the repo, `check-contracts` as an
      offline CI gate, snapshot refresh manual). In the CDS repo, via PR.
- [ ] P1 `@conciso/design-contracts`, built in Atelier first to try it out, moved to the CDS repo
      once proven (ADR-0165 §4, revised 2026-10-09). Not published from Atelier.
  - [x] P1.1 `libs/design-contracts`: self-contained (own `package.json`, plain Node ESM, no Nx
        or Atelier imports), bins `check-contracts` and `figma-snapshot-contracts`, exports the
        `ComponentContract` type. Source of truth for the scripts from now on. Done when Atelier's
        `check:contracts` runs through the package bin with unchanged output (all three
        frameworks).
  - [x] P1.2 Pin today's behaviour first: `node --test` on a small non-CDS fixture (one
        component, snapshot, contract, story; `--ui-*` prefix, English names), golden output.
        Done when green.
  - [x] P1.3 Spike fixes, each with a red test first: `--file` among several connected files,
        create the output dir, `.cjs` for `"type": "module"`, token prefixes from config (today
        hard-coded `--ui-`, `check-contracts.mjs:999`), `--emit` maps the codeSpec to Figma names
        via `axisMap`/`figmaOnly`. Done when tests are green and a Snackbar parity run shows no
        name-only discrepancies (needs the owner's bridge).
  - [x] P1.3 code done 2026-10-09 (`check:contracts-package`, 14 node tests on a non-Atelier
        fixture; Codex cross-check found two defects, both fixed). Still open: the live Snackbar
        parity run and a live multi-file snapshot against the Desktop Bridge (owner's machine);
        `--file` targeting is tested only against a fake modelled on figma-console-mcp 1.40.0.
  - [ ] Gate gap found in review (pre-existing, not changed): an `axisMap` entry without `values`
        marks every Figma axis value covered, so a boolean prop mapped to an axis `ja/nein`
        passes `check-contracts` (pinned in the package tests). `--emit` now surfaces it in
        parity; decide whether the gate should require `values` when a boolean meets a
        non-`true/false` axis.
  - [x] P1.4 Rewire Atelier: `sync-preflight` copies from the package into the scaffold;
        `check-manifest-parity` imports docgen from the package instead of `tools/scripts/lib`.
        Done when `check:all` passes.
  - [ ] P1.5 Try-out in the CDS: `npm pack` tarball installed on a CDS branch, spike scripts
        deleted there. Done when `check:contracts` exits 0 there with no manual step.
  - [ ] P1.6 Move to the CDS (`packages/contracts`, into its release chain), after P0b. Atelier
        keeps no copy; the scaffold consumes the published package (P3).
- [ ] P2 Contracts for all CDS components, `check-contracts` in the CDS CI. Done when it exits 0
      in CI.
- [ ] P3 `create-workspace` on `@conciso/design-system-angular`; React/Vue branches removed for
      now. Done when the scaffold e2e passes.
- [ ] P4 New kata: target, Figma master in the owner's training copy of the CDS file, steps. Done
      when the kata has been run once end to end.
- [ ] P5 Docs and skills: swap examples (~18 pages), remove library pages (~6), delete the
      `atelier-design` skill, rewrite the repo branch of `design-to-code`. Redo course-gap
      examples built on Atl components. Done when the docs gates pass.
- [ ] P6 Tag the last commit with the library, then remove `libs/{angular,react,vue,spec}`, their
      gates, Storybooks and hosted MCP endpoints; keep the release pipeline for `create-workspace`; deprecate `@atelier-ui/{angular,react,vue}` on npm. Done when `check:all`
      passes.

### AI & Design Systems course gaps (2026-10-08)

- [ ] Walk through the triage of the "AI & Design Systems" course gaps (271 transcripts vs.
      Atelier's teaching sources): 11 core-loop items (A), 13 deepening (B), 12 side notes
      (C), 9 out-of-scope blocks (X). The single tracked list, with a status per item
      (Offen / Übernehmen / Erledigt / Gestrichen), is
      `plan/research/ai-ds-course-gap-2026-10-08/triage.md` — update status there, not here.

- [ ] Findings from the A4 judge dry run on AtlButton (2026-10-09; evidence and per-finding
      verification in `plan/research/ai-ds-course-gap-2026-10-08/a4-judge-dry-run-atlbutton.md`,
      checked against code, CSS cascade and master JSON, not in a browser):
  - [ ] **Danger button has no visible focus ring** (WCAG 2.4.7). `.atl-button.variant-danger`
        (`libs/styles/src/button/atl-button.css:91-96`) sets `box-shadow` at the same
        specificity as `.atl-button:focus-visible` (`:34-37`) and comes later, so it wins in all
        three frameworks. Master `468:2598` draws the ring plus the inset shadow. Confirm in a
        browser, then combine both shadows in a `.variant-danger:focus-visible` rule.
  - [ ] **Loading drops focus.** `loading` sets native `disabled` (Angular `atl-button.ts:46,66`,
        React `atl-button.tsx:49,65`), so a focused button that starts loading loses focus, and
        nothing announces `aria-busy`. `button.metadata.ts:41` contradicts itself ("remove from
        the tab order" vs. "loading retains focus"). Decide which is canonical (ADR-0159 ties
        loading to disabled).
  - [ ] **`aria-disabled` next to `disabled`**: code sets both; the master description says
        "HTML `disabled` (not aria-disabled)". Pick one and align the other.
  - [ ] **Primary active inset shadow**: master `437:1516` has an 18 % inner shadow, code has
        none outside danger. Decide which side is right.
  - [ ] **Outline disabled fill**: master overlay `1169:834` is filled, code uses `transparent`
        (`atl-button.css:164-166`). Deliberate or drift?
  - [ ] **No hover/focus/active stories and no `play` functions** for the button in any
        framework; behaviour lives only in the unit specs (ADR-0121 asks for a `play` per
        behaviour line).

- [ ] Findings from course-gap wave 3 (2026-10-09; evidence in
      `plan/research/ai-ds-course-gap-2026-10-08/wave3-b3-cold-start-log.md` and the agents'
      reads of the code):
  - [x] (done 2026-10-09, ADR-0163: `button[atl-button]`) **Angular `atl-button` is not a native button.** The host is `<atl-button role="button">`
        with no inner `<button>`, so it never submits a `<form>` and has no `type`; React and Vue
        render a native `<button>`. The Figma master description says "native HTML <button>".
        Decide: render an inner `<button>` in Angular (API/DOM change), or document the
        divergence and correct the description.
  - [ ] **Vue dialog/drawer do not restore focus themselves.** React and Angular store
        `document.activeElement` on open and refocus it on close; Vue relies on native
        `dialog.close()`. Verify in a browser; align if the platform does not cover it.
  - [x] (owner 2026-10-09: keep as is; the accessibility page documents it) **Only Angular traps focus in a dialog** (`cdkTrapFocus`); React/Vue rely on
        `showModal()` making the page inert (Tab can leave into browser chrome). Decide whether
        that difference is intended; the accessibility page now describes it as is.
  - [x] (done 2026-10-09: `tooltip.show-on-focus`, `tooltip.hide-on-escape`) **Tooltip behaviour the spec does not ask for:** all three handle Escape and Angular/React
        bind focus, but `libs/spec/src/behaviors.json` has no ids for them, so no test covers them.
        Add `tooltip.hide-on-escape` / `tooltip.show-on-focus` and the tests.
  - [ ] **Button `type` default differs:** Angular and Vue default to `type="button"`, React sets
        none, so a React `AtlButton` inside a form submits by default. Decide one default.
  - [ ] **Outline button focus border** paints `rgb(100,116,139)` where Figma has the primary
        colour (`check:paint`, recorded in all three frameworks now that Angular can focus).
  - [ ] `a[atl-button]` for links styled as buttons (ADR-0163 §4).
  - [ ] Stale comments: `libs/{react,vue}/src/testing/a11y-tree.ts` still say Angular renders
        `<atl-button role="button">`.
  - [ ] **Prop tables in `llms-full.txt` are React-shaped for every framework** (`onValueChange`,
        `children`); the cold-start agent had to translate them for Angular.

- [ ] Findings from course-gap B2/B4/B5/B7 docs sections (2026-10-09; docs only, nothing fixed):
  - [ ] Stale header: `tools/scripts/gen-figma-library-tokens.mjs:3-4` names the create-workspace
        preset copy as source; line 39 reads `libs/styles/src/tokens.css`.
  - [ ] `libs/spec/src/tokens.manifest.ts:15-16` cites `tools/scripts/check-css-tokens.js`, which
        does not exist; `check-token-annotations.js` does that job.
  - [ ] ADR-0115 axis 2 names the preset `tokens.css` as authority and lists `check:css-tokens` /
        `check:token-tiers`; neither gate exists and `sync-tokens.mjs:30` uses
        `libs/styles/src/tokens.css`. Needs a dated "Corrected" paragraph.
  - [ ] Vocabulary drift in the spec (scan 2026-10-09, figma page `#shared-language`):
        tooltip `above/below` vs drawer `top/bottom`; button `outline` vs card `outlined`;
        `danger` / `error` / `invalid` for failure. Decide whether each pair is one concept.
        No gate compares vocabulary across components.
  - [ ] No deprecation policy (ADR-0023 ties 1.0.0 to one), no `@deprecated` in `libs/`, no
        codemod. Unverified: whether `docs-show` surfaces a `@deprecated` tag.
  - [ ] The Storybook MCP deploy runs in Cloudflare's own build; no repo-local deploy command
        a participant could copy (`mcp.astro#own-mcp` says so).

- [ ] Follow-ups from ADR-0161 (code-only facts as `- Code-only` description lines, 2026-10-08):
  - [ ] Read-side A/B: does an agent generating from the master use a `- Code-only` line
        (AtlButton `type`) better than the old parenthetical? Untested for both carriers.
  - [ ] Fold the older "(code-only props on …: …)" parentheticals in master descriptions
        into `- Code-only` lines, then drop them.

- [ ] Defects found by the wave-2 research runs (2026-10-08, evidence in
      `plan/research/ai-ds-course-gap-2026-10-08/wave2-a3-parity-run.md` and
      `wave2-a10-readiness-run.md`):
  - [x] AtlBadge font weight (2026-10-09, ADR-0162): owner chose 600. New role
        `--ui-type-emphasis` (SemiBold sm/tight) + Figma `ty/emphasis`, bound to badge md, step
        numbers, current breadcrumb. Badge `sm` keeps a recorded 500/600 split: SemiBold xs has
        only 2 clean CSS rules, so no role (ADR-0074 rule of three).
  - [ ] Move `.step-circle` and `.breadcrumb-current` onto `font: var(--ui-type-emphasis)`
        (computed-identical candidates from ADR-0162).
        Also: add a `live` scenario (`role="status"` passed) to the three `atl-badge.a11y.spec.*`.
  - [x] (done 2026-10-09: no default role in any framework; consumer passes `role="status"`; metadata role `none`) AtlBadge `role="status"` is set on every host, while the master description says badges
        are decorative by default and only wrapped in `role="status"` when they announce changes.
  - [x] (done 2026-10-09) AtlBadge (Angular) class JSDoc sits above `VARIANT_ICON_NAMES`, not `@Component`, so
        `check:contracts --emit` produces metadata without a description.
  - [x] Figma variables and AtlDialog layers (done 2026-10-09). `codeSyntax.WEB` is now set on all
        141 Library Tokens (`figma:sync-tokens` writes it for the 135 generated ones; the 6
        hand-made `control-height/*` / `row-height/*` were set by hand, scoped `WIDTH_HEIGHT`).
        Primitive, Component and Docs Brand Tokens have no `--ui-*` counterpart, so they carry
        none. The 13 Effects/Motion STRING variables (ADR-0060: cannot paint) are scoped to
        nothing, so they leave every picker; 0 `ALL_SCOPES` remain. AtlDialog's 10 one-pixel
        divider frames became header/footer strokes, as AtlDrawer already drew them, and the
        hand-drawn footer buttons in AtlDialog and AtlDrawer are `AtlButton` instances
        (`outline` Cancel, `primary` Confirm/Save, as the stories use); the Drawer footer now
        hugs to 80px (20 + 40 + 20).
  - [ ] `control-height/*` and `row-height/*` are not generated: `cssName()` has no mapping and
        `row-height` is a `calc()` the parser cannot read, so the sync lists them as orphans.
  - [ ] `figma_audit_component_accessibility` classifies AtlDialog as presentational and skips
        focus/target-size checks — its 100 means "not assessed".

### From the Storybook review, 2026-09-14

Full reasoning and evidence: `tasks/storybook-review-2026-09-14.md`. One item is done: the
curriculum's backgrounds-vs-theme wording, corrected in the agenda and `schulung.astro` to match
ADR-0142. The vendored-skills fix was written and then reverted on the owner's call — see the
first item below. What is left needs a decision.

- [ ] **Dark-mode axe coverage — ADR-0142's option (b) has a first-party replacement.** The
      ADR costed "reading `initialGlobals.theme` from an environment variable and invoking
      `nx storybook-test <fw>` once per value". `storybookTest()` takes `initialGlobals`
      directly (shipped 10.5, PR #35226; the option's own JSDoc recommends exactly the
      per-theme-Vitest-project pattern), and its `tags: { include | exclude | skip }` is the
      coverage regulator the ADR left to the owner. `vitest.config.mjs` already lists
      `projects:`. Decide: full second run, or a tagged sample. Then an ADR-0142 addendum —
      the ADR's option list is incomplete as written and should say so in place.
- [ ] **CSF factories.** Preview for all three frameworks since 10.2; the **default story
      format in Storybook 11**. 95 CSF3 story files, a curriculum that teaches CSF3, a
      scaffold that generates CSF3, and `storybook automigrate csf-factories` is unavailable
      here (`@storybook/cli` is not a dependency; `check:all` is offline). Needs a spike and
      an ADR before the next cohort, not a drive-by.
- [ ] **`addon-designs` in the scaffold — behind ADR-0144's `--figma` switch.** 85 story files
      here use `parameters.design`; the three `main.ts.template` files do not list the addon
      and no scaffold story sets the parameter, so a learner in a Figma-to-code workshop never
      sees the Figma frame beside the component. With `--figma`: addon plus parameter. With
      `--no-figma`: neither. Ships to npm.
- [ ] **The vendored `storybookjs/mcp` skills name a deprecated command — left untouched, on
      purpose.** `.agents/skills/storybook-setup/SKILL.md:11` instructs `npx storybook ai setup`;
      `.agents/skills/stories/SKILL.md:13,15,17` builds its whole mandatory workflow on
      `STORYBOOK_FEATURE_AI_CLI=1 npx storybook ai …`. Both are deprecated in Storybook 10.6, and
      `AGENTS.md` plus `docs/src/pages/storybook.astro` already say so — so the repo tells humans
      one thing and agents another, and nothing gates it (`check:skill-discovery` walks `skills/`,
      not `.agents/skills/`; nothing reads `skills-lock.json`). A patch was written on 2026-09-14
      and reverted on the owner's call: do not touch the Storybook skills for now. Three options
      when it is picked up — patch in place (forks upstream; a re-run of `npx skills add` silently
      reverts it), wait for upstream (weak bet: `storybookjs/mcp` moved into `storybookjs/storybook`
      as of 10.6.0, so the standalone package is the thing being superseded), or retire the four
      copies in favour of the built-in `npx storybook skills` (verified working here, config-aware —
      its `setup` output already names this repo's real addon set including `addon-designs`; this
      supersedes ADR-0123 and removes a `.agents/skills/` surface Codex and the Antigravity CLI
      reach). No ADR was written: no decision was taken.
- [ ] **Storybook telemetry.** `core.disableTelemetry` defaults to false and nothing here sets
      it — neither the three `main.ts` nor any scaffold template, so it applies to every
      workspace a participant scaffolds. Configuration fact, not a legal reading: any
      data-protection assessment belongs with the internal DSB.
- [ ] **The onboarding-checklist widgets.** `sidebarOnboardingChecklist` and
      `menuOnboardingChecklist` both default `true`, so Storybook's own guided tour sits beside
      the workshop's guidance in every scaffolded Storybook. Embrace or disable — currently
      neither, just an unexamined default.
- [ ] **`experimentalReactComponentMeta` for React.** Angular and Vue extract props through the
      docgen server; React still runs plain `react-docgen` (`@storybook/react/dist/preset.js:388`
      — the two flags are separate and both read, not a rename). Two classes of analyzer feeding
      `check:manifest-parity`. Worth a spike, unhurried.
- [ ] **Four one-line calls.** `parameters.docs.toc` (the docs site treats a persistent TOC as a
      reading requirement, ADR-0086/0087; the Storybook docs pages have none),
      `features.experimentalSearchDocsHeadings`, and the two above.

- [ ] **Confirm the lockfile flavor.** `package-lock.json` was regenerated on macOS
      for dep-batch A (Docker daemon down that day), then rewritten on Linux by the
      publish job (`7cca39c`), pruning 27 macOS-only transitive entries. What that commit
      did _not_ visibly touch is ~47 `dev` ↔ `devOptional` marker flips from the same
      install. Run `tools/scripts/relock.sh` with Docker up once; if it's an empty diff,
      close this.

- [ ] **AtlStepper's Figma master has two open gaps** (merged — both block on the
      same "is this component chrome or artboard decoration" judgment):
  - [ ] It pads 16 where the code root pads 0 — decide whether that's component
        chrome the code is missing, or artboard breathing room Figma should drop;
        `[ROOT-BOX]` warns until settled.
  - [ ] It has no focus variant, no disabled variant, and no a11y annotations in its
        description (5 of 7 remaining parity findings) — pairs with the role question
        below.
  - [x] **Was a three-way disagreement, not two — resolved 2026-09-06, the other
        way round from how this item first framed it.** Earlier the same day,
        metadata was corrected to say `tablist`, matching all three code adapters
        (`tablist`/`tab`/`tabpanel`), and this item then read that convergence as
        the signal that code was right and the Figma master's `ol` +
        `aria-current="step"` description was stale. That reasoning doesn't
        survive a check: searching `plan/adr/` turned up no ADR that ever decided
        the tab-shaped markup — this item's own closing sentence called it
        "ADR-reasoned in the code," which was never true. It was three independent
        implementations converging on the same shape without anyone weighing it
        against what a stepper does. `linear` ("only the active and completed steps are
        clickable") is a progression model, not a tab model, and the metadata's
        own anti-pattern already named `AtlTabGroup` as the component for
        non-sequential switching — implementing the stepper as a tablist
        duplicated the semantics its own docs point away from. The ARIA tab
        pattern also requires roving-tabindex arrow-key navigation that no
        adapter ever implemented, which the tablist role had been quietly
        obligating without anyone paying it. ADR-0101 reverses the direction:
        code and metadata now match Figma's `ol`/`aria-current="step"`, and no
        Figma edit is needed — Figma was right. The other two items above (root
        padding, missing focus/disabled/a11y-annotation variants) are unrelated
        and stay open.

- [ ] **Harden Atelier's own design system; Conciso as theme demo.** Plan:
      `tasks/atelier-design-system-plan.md`. ADR-0020 already settled the palette
      ("Direction A: Conciso anchor only" — brand DNA is typography + motion, not
      colour); the plan ports six brand-neutral patterns from Conciso (tonal ramps,
      annotated contrast, role-based type scale, tonal overlays, `[data-area]` scope,
      `_adherence.oxlintrc.json`) and makes Conciso a `[data-brand="conciso"]` theme demo.
      The 29 existing parity records stay valid until component CSS migrates onto role
      tokens, at which point the ADR-0024 Phase 0 change becomes blocking.

- [~] **An axis is owed for `AtlAvatarStatus` and `AtlChatStatus`.** Two separable
  questions, as originally written: draw the axes in Figma (design), and should the
  gate's axis-word list include `Status` at all (gate). The gate half is done — see
  "Closed this session" below. (The item as originally written cited `[NAME]`'s
  seven-word list, Variant/Size/Shape/Position/Orientation/Align/Role — that's
  `check-figma.js`'s own axis list, and correct for that gate, but it is not why
  `check:variants`/`check:defaults` never asked about `Status`: those two are driven
  by `tools/scripts/lib/component-axes.js`'s `axisOf`, a _different_, five-word regex
  — Variant/Size/Shape/Position/Orientation — that the item conflated with `[NAME]`'s.)
  - [ ] **Design half, open and blocked**: drawing the `AtlAvatarStatus` axis in
        Figma (a real `.status-online`/`.status-offline`/`.status-away`/`.status-busy`
        paint axis, now gate-enforced in code) needs the Desktop Bridge, which is not
        connected in this environment. Not claimed here.

- [ ] **`check:props`'s own known blind spots** (ADR-0093), worth a decision each:
  - [ ] It's spec-keyed, so it can't see adapter-vs-adapter divergence where the
        spec is silent — e.g. Vue's dialog hardcodes its own `headerId` as the
        `aria-labelledby` target while Angular and React expose it as a prop, and
        `AtlDialogSpec` declares neither name. Closing it means completing the spec.
  - [ ] Seven components have no spec interface at all: `AtlCodeBlock`,
        `AtlAccordionHeader`, `AtlMenuSeparator`, `AtlMenuTrigger`, `AtlChatInput`,
        `AtlChatTyping`, `AtlThead`. Named as unkeyed in the gate's summary; nothing
        checks them.
  - [ ] `toast` is excluded outright — Angular takes four flat props where React/Vue
        take one `data: ToastData` object, and the real API is imperative
        (`AtlToastService.show()` / `useAtlToast()`). A set comparison can't express a
        shape mismatch.
  - [ ] Worth its own investigation (from ADR-0093's rejected alternatives): Vue's
        `defineProps<AtlXSpec>` could give Vue a real type-level link to the contract —
        the root-cause fix the gate only detects around. Angular can't (signal inputs
        are class fields, not a props object).

- [ ] **`nx release --yes` commits and pushes the version bump as part of the same
      command that publishes**, so a failed publish leaves git ahead of npm by
      construction — exactly what happened for six releases (see the release-pipeline
      fix, now closed, below). Reordering so the commit only lands after a successful
      publish is the structural fix; wants its own ADR.

- [ ] **Parity-record scope: what should an `inputsHash` / a parity stamp cover?**
      One ADR closes four separate findings:
  - [ ] The parity gate is blind to the shared token layer — a component's
        `inputsHash` covers only `libs/{angular,react,vue}/src/lib/<module>/`, so
        `styles/tokens.css` is outside it (ADR-0035 changed the UI typeface for all 29
        components and triggered no DRIFT blocker).
  - [ ] A parity record is equally blind to a change on the _Figma_ side — it stores
        `figmaNodeId`, `verifiedSha`, `inputsHash`, nothing about the master's state.
  - [ ] `inputsHash` can't tell a rendered file from a test file — it walks every
        file under the module directory, so a comment in a `.spec.tsx` triggers a false
        DRIFT. Narrowing it needs a migration (recompute each record's hash at its own
        `verifiedSha` first, or all 37 records go stale at once).
  - [ ] Do this **before** spending 30 Figma-bridge round-trips re-verifying records
        that are stale only because of the `inputsHash` weakness above (see the
        near-term grab-bag item for the actual re-verify).

- [ ] **Typography-role completion — anchor question: does `fontSize` resolve
      through Library Tokens or Docs Brand Tokens?** 212 TEXT nodes bind `fontSize` to
      the docs-site collection, not the library tier ADR-0030 made semantic. The two
      scales agree today, so nothing renders wrong yet — but it blocks promoting
      `[ROOT-TYPE]`, `[TEXT-UNSTYLED]` and `[FIGMA-AUTO-LEADING]` from ratchets to plain
      blockers, and every "correct this master's size" recommendation below is
      unexecutable until it's answered. Sub-steps, all downstream of this one decision:
  - [ ] 311 of 566 census'd TEXT nodes across 33 masters carry no `ty/*` role; 206
        of those sit on `lineHeight: AUTO` (matches no role at all); all three counts
        are gated as ratchets (`[TEXT-UNSTYLED]` 257, `[FIGMA-AUTO-LEADING]` 206,
        `[FIGMA-VARIABLE-COLLECTION]` 212).
  - [ ] Two roles the existing ten don't span: `ty/row` (Instrument Sans Regular
        16/1.25, 10 CSS sites, 27 faithful Figma nodes) and `ty/row-sm` (Regular
        14/1.25, 5 CSS sites, 16 faithful nodes) — both clear rule-of-three several
        times over.
  - [ ] Seven masters the six mapping groups never covered — 54 unbound nodes
        (`AtlButton` 20, `AtlStep` 12, `AtlTr` 8, `AtlBreadcrumbs` 7, `AtlAvatar` 6,
        `AtlCodeBlock` 4, `AtlTh` 3, `AtlChatSuggestion` 1). `AtlButton` matters most —
        its `size=md`/`size=lg` labels are Medium where `.atl-button` is SemiBold.
  - [ ] 77 Figma text nodes are in combinations no role expresses (Medium 16,
        Regular 12, SemiBold 14, Medium 18, JetBrains Mono Bold 12, Italic 12, Regular
        13, Bold 10, SemiBold 15/12, and one each of SemiBold 13/20/26 and Italic 14) —
        five sizes are off the type scale entirely.

- [ ] **AtlRadioGroup pass — one pass over one component:**
  - [ ] Emits a dead `is-readonly` class in `atl-radio-group.tsx`; no stylesheet in
        any framework has a rule for it. Style it or drop it.
  - [ ] Its Figma master draws one radio, not a group — variants are a single 18px
        circle plus a label, so group-level states have nothing to sit on.
  - [ ] Its parity record hashes the wrong directory: `COMPONENT_METADATA_REGISTRY`
        maps it to `'radio'`, so `computeInputsHash('radio')` backs the record, whose
        `inputsHash` is byte-identical to AtlRadio's. Every change under
        `libs/*/src/lib/radio-group/` is invisible to the gate.
  - [ ] AtlToggle/AtlCheckbox hug at 24px and AtlRadio at 28px against a code row
        height of 40px (`--ui-row-height-sm`) — the form-row masters never moved to the
        row ladder ADR-0052 shipped for everything else.
  - [ ] Its error region is three different shapes in ARIA across the three
        frameworks (Angular: `<div class=errors>` + `aria-describedby` on host; React:
        `role=alert`, no id/describedby; Vue: `role=alert`, no `aria-live`, no
        id/describedby) — the element/class contract holds, the announcement contract
        doesn't.
  - _Cross-reference:_ also touches the Figma-polish collector's row-ladder
    Figma-Variables question below.

- [ ] **AtlSelect structure — one ADR-level decision, two findings, one is a
      symptom of the other:**
  - [ ] It's the deepest structural divergence in the library: React and Vue render
        a native `<select>`; Angular renders a `<button role="combobox">` and points
        `<label>` at its `triggerId`. Both are labelable in isolation, but "one spec,
        three frameworks" is weakest exactly here, and nothing measures it (not
        answerable by an a11y-tree snapshot — see the closed item on why Select is
        exempt by design).
  - [ ] Symptom: Angular Select's `role="combobox"` sits on the host while every
        combobox state and the focus (`aria-expanded`, `aria-haspopup`,
        `aria-controls`, `aria-activedescendant`) sit on the `<button>` — not the
        WAI-ARIA 1.2 pattern. Bigger than a binding move; resolve with the same ADR.

- [ ] **Bonus, found while restructuring (not one of the original 130, no checkbox
      in the old file):** is a `is-*` state class (`is-checked`, `is-open`, `is-active`,
      `is-selected` — emitted inconsistently across the three frameworks' stylesheets,
      e.g. `is-checked` only on Angular's and React's checkbox, not Vue's) **public
      contract or private implementation?** If public, it belongs in `libs/spec` and all
      three adapters must emit it; if private, the current divergence is free and
      `[UNSTYLED-CLASS]` (`check:dead-selectors`'s un-shipped mirror direction) can be
      designed once this is answered. Also decides two smaller `DEAD_SELECTOR_EXEMPT`
      entries: promote React's `orientation` prop to the spec (or drop it + six CSS
      rules), and fix the Angular `atl-table.css:157` / `<atl-checkbox>` element-vs-class
      selector mismatch.

## Collectors

### Storybook config drift, found 2026-09-14

**Closed 2026-09-14.** Five one-line divergences between the three `.storybook` directories,
plus one pin. Nothing gated any of them — `check:manifest-parity` compares docgen output, not
configuration. Detail in `tasks/storybook-review-2026-09-14.md` §1.

Two follow-ons were taken beyond the six, both necessary: Vue's rewritten `include` keeps
`../src/**/*.d.ts` (`libs/vue/src/env.d.ts` declares `*.vue`, and Vue stories import SFCs
directly, so the ambient declaration is load-bearing) and gains `./manager.ts`, without which
the newly created file would have reproduced exactly the "exists but nothing type-checks it"
defect this closed for React.

Verification note worth keeping: **no gate covers `.storybook/tsconfig.json`.** `check:types`
runs `tsc` against `libs/<fw>/tsconfig.spec.json`, so a green chain says nothing about these
three files — the same blind spot already recorded above for a generated workspace, now known
to apply to this repo too. The rewrite was therefore checked by hand, `tsc -p
libs/<fw>/.storybook/tsconfig.json --noEmit` for all three, 0 errors each, alongside
`npm run check:all` exit 0 (full chain, `check:stories` included) and `nx lint` per library.

- [x] `libs/vue/.storybook/manager.ts` does not exist; Angular and React brand their manager.
      `manager.ts` predates the Vue library (`5aac829`), so Vue never got one.
- [x] `controls.matchers` (colour/date) is in Angular's `preview.ts` only — and in all three
      scaffold templates. The repo's React and Vue Storybooks are behind their own scaffold.
- [x] The three `.storybook/tsconfig.json` differ four ways: React's `include` omits its own
      `manager.ts`, Vue has no `exclude` and names neither `preview.ts` nor `main.ts`, Vue alone
      carries `vitest/globals`, Vue alone lacks `"outDir": ""`.
- [x] Dead commented-out `typescript.reactDocgen` block in `libs/react/.storybook/main.ts`.
- [x] `libs/react/.storybook/main.ts` uses `import { StorybookConfig }`, not `import type`.
- [x] `@storybook/addon-designs` is `^11.1.4` — a caret. The different major is fine and decided:
      the package is in `atelier/storybook-version-lockstep`'s `DEFAULT_EXEMPT` because it is a
      third-party addon on its own release line. But the exemption skips the exactness check too,
      so the caret is unguarded, which is the drift shape that rule's own header warns about. Pin
      `11.1.4` exactly, keep the exemption.

### Breaking changes for 0.3.0

One release, one item — each sub-bullet is an independent, already-diagnosed finding
that wants its own ADR and a changelog line. Ship together.

- [ ] **Ship the 0.3.0 breaking-changes batch:**
  - [ ] ⚠️ **`AtlRadioGroupContext.invalid` became required** in
        `libs/angular/src/lib/radio-group/atl-radio-group.token.ts` (no `?`), exported
        from the public barrel. No in-repo implementor breaks, but any outside
        implementor of the interface does — **this is an unreleased semver-major that
        has already shipped in the code and needs a changelog note before the next
        release goes out.**
  - [ ] Angular's `touched` is public API the spec never declared (ADR-0055) —
        seven components expose it as `model(false)`; React/Vue have no equivalent and
        it no longer gates the error message. Remove it with this batch, or add it to
        the spec and the other two frameworks.
  - [ ] React carries two public spellings for one prop: the spec says `readonly`
        (Angular/Vue agree), React redeclares `readOnly`. Not dead — both are merged
        with `readOnly` taking precedence — but only the React spelling is tested.
        Consolidating on the spec's spelling is the breaking rename. Affects Input,
        Textarea, RadioGroup.
  - [ ] `AtlSelect.name` is a genuinely dead prop (declared, never bound, absent
        from `AtlSelectContext`, untested) — honoring it means deciding whether
        Angular's button-trigger select emits a hidden input.
  - [ ] `AtlAccordionGroup.multi` is a third dead prop, via a third mechanism: the
        public binding is served by
        `hostDirectives: [{ directive: CdkAccordion, inputs: ['multi'] }]` forwarding to
        the CDK's own input, not the component's own declared `multi()`.
  - [ ] `errors` is implemented by all three adapters on all seven form components,
        declared by no spec — blocked on a type decision (Angular types it
        `WithOptionalFieldTree<ValidationError>[]`, React/Vue as strings).
  - [ ] The spec models exactly one event (`AtlFormFieldSpec.onValueChange`); nine
        more are implemented consistently in all three adapters and declared nowhere
        (`Alert.dismissed`, `Chat.onOpenChange`, `ChatSuggestion.selected`,
        `Drawer.onOpenChange`, `MenuItem.onTriggered`, `Pagination.onPageChange`,
        `Stepper.onActiveStepChange`, `Th.sort`, `Tr.selectedChange`).
  - [ ] `AtlChatMessageSpec` requires `id` and `content` (non-optional) and
        `AtlChatSuggestionSpec` requires `id` — no adapter implements any of them;
        content is passed as children/slot everywhere.
  - [ ] `AtlDialogSpec` declares neither `aria-label` nor `aria-labelledby` while
        all three adapters expose both.
  - [ ] `AtlTrSpec.rowId` is wrong three different ways: dead in Angular,
        inherited-but-never-wired in React, absent from Vue's props entirely.
  - [ ] `AtlBreadcrumbItem.current` is a settable prop in the spec, React and Vue;
        Angular computes it internally and never exposes it.
  - [ ] `AtlButtonSpec` requires `aria-label` when the button has no visible label;
        Angular and Vue answer with a dev-mode warning instead of enforcing the prop.
  - [ ] React-only props with no spec entry: radio-group `orientation`
        (cross-references the AtlRadioGroup pass above) and tbody `emptyContent`.
  - [ ] `AtlChatMessageSpec.role` → `messageRole` rename across all three
        frameworks (removes an ARIA-name collision for good).

### Figma polish pass

The long tail of undecided cosmetic Figma-vs-code questions with **no known live
defect**. Tracking collapsed into one item; every finding kept as its own checkbox.

- [ ] **Work through the Figma polish backlog:**
  - [ ] `color-mix()` cannot be a Figma Variable — AtlAvatar's root, AtlBadge's
        variant borders, AtlToast's variant fills, AtlAlert's variant borders are
        unverifiable by construction. Add resolved semantic tokens for the mixes, or
        accept as code-only.
  - [ ] "Effects Tokens" holds eleven STRING variables (`e/0…e/5`, `tonal/1…5`)
        that duplicate the generated `shadow/xs…xl` effect styles (ADR-0060) — check
        references, remove the collection.
  - [ ] `[MASTER-GLYPH]` walks masters only, so a content-sample frame is invisible
        to it — widen the probe to every frame on the Components page.
  - [ ] Nothing detects an orphaned main component (Figma keeps a removed
        `COMPONENT` alive while an instance still references it) — no live defect as of
        the last check, but gate work against the class: walk instances, resolve
        `getMainComponentAsync()`, assert reachability from the document.
  - [ ] Two variable collections carry the same ten spacing values (`Primitive
Tokens` `spacing/s1…s16` vs `Library Tokens` `spacing/1…16`, only the latter
        generated from `tokens.css`) — decide whether `Primitive Tokens` (76 variables)
        is still needed.
  - [ ] `2.25rem` appears six times for two different reasons
        (AtlInput/AtlTextarea's invalid-icon gutter, AtlPagination's button
        min-width/height) — neither is on the spacing scale; decide a token per reason,
        or record both as intentional dimensions.
  - [ ] `margin-top: 2px` on `.step-description`/`.step-optional` — half of
        `--ui-spacing-1`, two uses; either the scale gains a 0.5 step or these become
        4px (a design change). Figma agrees with the code on the value, on a name
        neither side has.
  - [ ] The dialog and drawer headers are SemiBold 20px, 2px off
        `--ui-type-title` (18) — Figma masters already draw 18 and are bound to
        `ty/title`; decide whether CSS moves to the role or 20 gets justified.
  - [ ] AtlCard and AtlDialog draw their buttons by hand at Medium 14 instead of
        instantiating AtlButton (`.atl-button` is SemiBold `md`); same class as the
        icon masters — a parent can only instantiate what the child can express.
  - [ ] `[LAYER-PAINT]` skips every variant whose `state` axis isn't `default` —
        found the hard way when AtlToggle's hover/focus tracks were bound wrong and
        nothing reported it; 12 of AtlButton's 24 variants and 4/5 of each form field
        sit in this blind spot.
  - [ ] AtlDrawer's master paints the dialog twice (root carries `color/surface` +
        shadow, and so does the inner `dialog` layer) — decide whether the root should
        paint the backdrop, nothing, or stay as-is.
  - [ ] `.atl-drawer-host dialog` states nothing typographic (`all: unset` wipes
        size/leading and nothing restores it) — the one `[ROOT-TYPE]` gap that's a
        defect rather than legitimate delegation; fix is one CSS declaration, blocked
        on the same collection question as everything else in this cluster.
  - [ ] AtlCombobox's fifteen unstyled TEXT nodes are a layer problem, not a root
        one — no single direct TEXT child for `[ROOT-TYPE]` to find, and
        `[LAYER-PAINT]` can't reach them either (state-skip + `font-size: inherit` +
        spaced layer names). Needs the layer cascade to carry the component root for
        type only.
  - [ ] AtlChat's master draws an illustrative app mockup (nav rail, breadcrumb,
        page heading, two sidebar lists, minimise glyph) — scenery, excused by name in
        `TEXT_UNSTYLED_PENDING`, marked pending-removal.
  - [ ] Six masters pad on an axis the CSS derives (AtlButton, AtlInput,
        AtlTextarea, AtlSelect, AtlBadge, AtlTab) — ADR-0041's recipe gives numbers no
        spacing token holds and no Figma Variable can express. Decide: keep resolved
        numbers in step by hand, or state only height and stop padding.
  - [ ] `[ROOT-PAINT]` can't see a cascade that ends at `inherit` (e.g.
        `.atl-textarea textarea { font-size: inherit }`) — the value the field
        actually renders comes from the root, outside the cascade. Fix the gate to walk
        up to the component root; fix the data (the 311-node census) first.
  - [ ] Reuse the adherence regexes for ADR-0032 alternative 4 — the synced Claude
        Design file already carries the three rules an artboard/token gate wants (raw
        hex → token, raw px → spacing token, `font-family` outside the DS list); lift
        them rather than authoring new ones.
  - [ ] 464 text nodes below 12px (306 on Inventory card meta, 156 on Colors swatch
        labels/hex, 2 on Components — the last two already fixed as an AtlAvatar bug).
        Catalogue scaffolding, not component text; decide whether documentation pages
        adopt `--ui-font-size-2xs` (10px, exists since ADR-0054) or stay off-scale by
        intent.
  - [ ] AtlProgress's layers were already conventionally named (`track`, `fill`)
        before there was a convention — worth a look at who drew it and whether other
        conventions in this cluster were arrived at once and never generalised.
  - [ ] A glyph typed as an instance OVERRIDE is unseen by `[MASTER-GLYPH]` (which
        deliberately skips text inside instances, since normally that belongs to the
        child master) — compare an instance's text against its main component's
        instead of skipping wholesale.
  - [ ] `[ROOT-BOX]`'s gap comparison is unreachable for the four form-row masters
        (AtlCheckbox, AtlToggle, AtlRadio, AtlRadioGroup are excluded from
        `ROOT_PAINT` for a paint reason that also took gap with it) — all four bind
        8px where all three stylesheets state 12px.
  - [ ] `[LAYER-PAINT]` never compares a stroke colour when the CSS border is
        transparent (`if (!/transparent|none/.test(border))` guard) — six visible
        strokes on AtlPagination's page buttons pass because of it; a transparent
        border is a declared value, not a missing one.
  - [ ] AtlMenu's `ROOT_PAINT` entry has no `{variant}` template —
        `variant=compact` is compared against the base rule's 8px padding and passes,
        while the rule that actually applies says 4px.
  - [ ] ADR-0055's "nothing moves when the state flips" doesn't hold for two of
        the four form fields: `.atl-input`/`.atl-textarea` narrow their text box 20px
        when invalid (`padding-right` 1rem → 2.25rem), identical in all three
        frameworks, while AtlSelect/AtlCombobox reserve the space unconditionally as
        the ADR describes.
  - [ ] AtlTextarea's master disagrees with itself: `radius/md` (10px) on
        `state=default` vs `radius/sm` (8px) on the other four, no CSS rule changes the
        radius; plus the hover variant's root stroke is an unbound raw colour, the only
        raw paint on any of the three field masters.
  - [ ] The combobox master stacks its panel 4px below the field where the code
        uses 8px, plus fill/radius/padding/gap deltas on the same layer — all inside
        the `state=open` skip already recorded above.
  - [ ] AtlPagination: four painted divergences on the page buttons (visible
        border where CSS is transparent-by-design; muted vs full-contrast number text;
        weight differences on inactive/current page numbers) — all invisible to
        `[LAYER-PAINT]` because the colour lives on the TEXT child, not the named
        frame.
  - [ ] ADR-0063's page-button fix was half-applied and its own record overstates
        it: the fill was removed from the six inactive buttons, the stroke was not —
        nothing has contradicted the record since because the gate can't see it (blind
        spot above).
  - [ ] The three adapters disagree on the menu trigger-to-panel offset
        (React/Vue: 8px via `calc(100% + var(--ui-spacing-2))`; Angular: no explicit
        offset, CDK default applies) — the ADR-0081 cleanup deleted the only place the
        intended offset was written down. Give Angular an explicit offset, or record
        the CDK default as intended.
  - [ ] Both component artboards (design-findings doc) need a correction pass for
        two overstated claims: the "code-only props" labels, and AtlButton's "half a
        matrix" note. Listed at the end of `tasks/design-findings-2026-08-26.md`.
  - [ ] The row ladder has no Figma Variables — `--ui-row-inset` and the three
        `--ui-row-height-*` are `calc()` over the control scale, which Figma can't
        express as a derived Variable; they'll land as resolved numbers whose
        derivation lives only in ADR-0052 and `tokens.css`.
  - [ ] Nothing gates the Figma icon set against `AtlIconName` (ADR-0057) — no
        live divergence today (25 `Icon/*` components, 25 names, identical sets,
        checked by hand); `check:figma` reads the Components-page snapshot only, so
        the Icons page isn't cross-checked. Capture it in `figma-snapshot.mjs`.
  - [ ] AtlChat's master draws a minimise control the component doesn't have
        (`AtlChatSpec` exposes only `open`/`onOpenChange`) — decide whether AtlChat
        gains the state or the master loses the button.
  - [ ] The checkbox tick is drawn twice in the library: code draws it with a
        rotated pseudo-element while `ATL_ICON_GEOMETRY` already has a `check`. Either
        render `<AtlIcon name="check">` (keeping the `atl-check-pop` animation on it),
        or accept and record the duplication — Figma now draws the CSS shape
        faithfully, so only the code carries it twice.
  - [ ] **AtlButton: six of nine anatomy values are literals, not tokens** —
        min-height (32/40/48) and padding (6/9/12 block, 14/18/24 inline), of which
        only 24px lands on the spacing scale; `[ROOT-BOX]` now names it every run
        (ADR-0076). Either the size steps get tokens, or the gap is recorded as
        intended.
  - [ ] The AtlButton Figma master has 24 variants for a 4×3×4 matrix (48) — half
        the state combinations are unpopulated. Confirm against the master before the
        transfer decides what to add; `check:figma`'s variant-matrix completeness
        passes today, suggesting the metadata `variantMatrix` doesn't claim the full
        cross-product either.
  - [ ] The Figma-side Instructions text overstates the token binding: node
        `703:333` on 🛠️ Workshop-Templates says every fill/padding/radius is bound to a
        UI-Tokens variable; `Avatar / Starter` binds only fills and strokes. Soften the
        Figma text, or bind Avatar's corner radius and revert the (already-softened)
        docs prose — a Figma write, out of scope for the docs pass that found it.
  - [ ] `ComponentMetadata` has no field saying which spec a `variantMatrix`
        describes — sharing a metadata module between a parent and its children is
        deliberate (nine modules do it), so "specNames[0] is the primary" isn't a rule
        the data supports. Residue: one allowlist entry plus a latent risk that a
        future child inherits an unrelated matrix. Worth a `variantMatrixFor` field
        when a second collision appears, not for one entry.
  - [ ] Compose parents from their child masters: AtlMenu's separators are
        already instances of AtlMenuSeparator; its items, the tabs, the steps, the
        accordion items and the chat bubbles could be too — where a parent
        instantiates its child, the geometry can't drift at all. Blocker: an instance
        can't gain children, so a part taking free content (an icon plus a label)
        needs the master to expose a slot first. Decide slot-per-part, then convert.
  - [ ] Consider a gate forbidding `--ui-font-display` outside the role
        definition — cheap now that `check:typeface` already resolves a role
        shorthand. The point of ADR-0036 is that a component naming the family
        directly can still break the "serif, italic, never bolded" guarantee a role
        token gives for free.

## Blocked

Correctly open — not stalled, waiting on something specific. Marked "blocked —
unblocks when X" rather than deleted.

- [ ] **Claude Design participant katas, and the trainer run-sheet + participant
      how-to that go with them** — blocked, unblocks when: the per-seat Claude Design
      access test (review §5) is widened past the trainer machine. **Narrowed
      2026-09-07:** the _owner_ seat is now proven to write — `write_files` landed a
      27203-byte `libs/react/src/styles/tokens.css` into project
      `019de217-489c-7441-8275-2efe020086b5` via `finalize_plan` → `plan_token`
      (ADR-0106). That is the trainer machine, so this stays blocked: what is still
      untested is whether a _participant's_ seat can write to a project shared with
      them, which is the actual precondition here.
  - [ ] The katas themselves.
  - [ ] Schulung M2/M3 — trainer run-sheet (product, `/design-login`, prompt,
        hardcode target, flip value, fallback URL) + participant how-to (image,
        prompt→canvas, Step-5 example, opener).
  - _(Unblocked halves already shipped around this — the trainer demo,
    prerequisites 2–3 — without weakening it: the demo is trainer-machine-only and
    says so in its first sentence.)_

- [ ] **Work through the Figma parity sweep** — 16 of 43 masters measured
      2026-09-07, findings and suggested order in
      `tasks/figma-parity-sweep-2026-09-07.md`. Already fixed: AtlCard
      `padding=none` (was padding like `md`), the AtlButton label wrap, the
      block-padding policy (ADR-0107), the card header's leading. Highest-value
      remaining, in order:
  - [x] ~~**AtlDrawer's size variants are placeholders**~~ — done 2026-09-07
        (`0cca35b`), rebuilt on a 720×480 viewport, 1:1 with the code.
  - [x] ~~**AtlDialog was authored at 1rem = 10px**~~ — done 2026-09-07
        (`0cca35b`), now 384/576/768/1024 and 1280 for `full`.
  - [x] ~~**A gate that measures master geometry**~~ — done 2026-09-07
        (ADR-0108). `rootPaint` gains per-variant `width`/`height`;
        `[ROOT-SIZE]`/`[LAYER-SIZE]` (BLOCKER) compare them against the CSS,
        resolving `min(Xrem, Yvw)`-shaped viewport clamps by taking the fixed
        operand. Proven against the historical bug numbers (AtlDialog ÷1.6,
        AtlDrawer forced to 220×320) and silent against the real, fixed file,
        twice, independently. Found a third, real defect on its first live run:
        **AtlAvatar's `size=xl` is 56×56 against a plain `64px` literal** on both
        `shape=circle` and `shape=square` — xs/sm/md/lg all match exactly
        (24/32/40/48), so this is one size 8px small, not a systemic error.
        **Fixed the same day rather than allowlisted:** resized to 64×64 on both
        shapes and the two `root-size` allowlist entries deleted, so the gate is
        green on its own merits rather than on an exemption. 64 is also the
        on-scale value (`--ui-spacing-16`); 56 is not a step at all.
    - [ ] **AtlAvatarGroup's own frame heights** (24/32/36/44/52 for
          xs/sm/md/lg/xl) do not follow the avatar ladder (24/32/40/48/64) from `md`
          up. Noticed while fixing the avatar; not chased, and the new rule does not
          reach it (AtlAvatarGroup is outside `ROOT_PAINT`'s table). May be
          legitimate — a group frame carries overlap and ring offsets, so its height
          is not required to equal one avatar — but nothing records that either way.
  - [ ] Code fixes: the two `control`-role weight overrides on
        `.page-btn.is-active` and `.step-item.is-active .step-label` (against
        tokens.css's own role table), `.step-description`'s hardcoded `2px` margin,
        `.breadcrumb-current`'s missing padding.
  - [ ] AtlCheckbox and AtlRadio to match AtlToggle, which is already correct in
        the same file (box size, `input-bg` vs `surface`, `border-strong` vs
        `border`, 1.5px vs 2px, and a real focus variant).
  - [ ] AtlPagination's `showFirstLast` is declared but unwired — no first/last
        layers, `componentPropertyReferences` empty on all nine children.
  - [ ] The decisions, in one pass: the 8-vs-12 label gap across four selection
        controls, the `color-mix` borders (not expressible as a Figma Variable —
        same class as ADR-0107's derived padding), AtlCard's asymmetric padding
        scale, the breadcrumb separator glyph (code ships `/`, Figma draws `›`, and
        the CSS `'›'` fallback is unreachable), AtlAlert's `dismissible` default,
        and AtlRadioGroup's master, which does not model a radio group at all.
  - [ ] 21 masters still unswept, including AtlIcon (25 Figma components vs the
        sheet's "strict 20-name catalogue") and AtlAvatarGroup (no Claude Design
        sheet).

- [ ] **The social cards render in Noto Sans, and the docs build phones home for
      it** (found 2026-09-07 while fixing the `--docs-font` fallback; needs a brand
      decision, so not executed). Measured, not inferred:
  - `docs/src/pages/og/[...slug].ts` passes `families: ['Inter', 'sans-serif']`
    and `weight: 'ExtraBold'`. **Both are inert.** `astro-og-canvas` takes the
    font _name_ from `font.*.families` but the font _data_ from a separate
    top-level `fonts:` option, which that file never passes — so it falls through
    to the library default, one Noto Sans TTF at weight 400. Proven by rendering
    twice through `generateOpenGraphImage` with `['Inter',…]` and
    `['NotARealFace',…]`: byte-identical PNGs, same sha256, `cmp` exit 0. The
    build's own log agrees — `Loaded 1 font families: Noto Sans`.
  - So all 23 emitted cards (`dist/docs/og/`, from 24 `OG_PAGES` entries) have
    always been Noto Sans 400. Not a regression; never worked.
  - **Second, separate finding: `nx build docs` fetches
    `https://api.fontsource.org/v1/fonts/noto-sans/latin-400-normal.ttf` at build
    time.** An undeclared network dependency on a third-party font API, in a repo
    whose gates are deliberately offline. A Fontsource outage breaks the docs
    build, and nothing declares or pins that.
  - Options: (a) `fonts:` pointing at a Fontsource Instrument Sans URL — brand
    face, keeps the network call; (b) vendor an Instrument Sans TTF and reference
    it by local path — offline and deterministic, adds a binary plus its OFL
    licence, and would remove the network call too; (c) leave Noto Sans and say
    so in the file. **(b) is the recommendation** — it fixes the brand and the
    build dependency in one move, and matches how the rest of this repo verifies
    things. Note for any of them: CanvasKit's `FontMgr.FromData` wants TTF/OTF,
    not woff2, so Astro's own self-hosted woff2 files cannot be reused; and
    `weight: 'ExtraBold'` must become Bold/700 because Instrument Sans is a
    400–700 family with no heavier cut.
  - Interim, zero-risk: the file's header comment names the route
    `src/pages/og/[...slug].png.ts`; the file is `[...slug].ts`.

- [ ] **Presentation-debt p1 and p2** — blocked, unblocks when: real screen
      captures exist. p1 wants photographs of Figma's plugin menu, token dialog and
      inspect panel to replace placeholder SVGs (interim: the retired `#00BEBE` in
      `figma.astro:335` still needs fixing regardless); p2 wants a terminal capture of
      `npm run preflight` from a genuinely scaffolded single-framework workspace — the
      mock's "3 storybook rows / 15 ok" is a run the current script can't produce. p2's
      prerequisite (the two `preflight.mjs` copies byte-identical) is already met; the
      run itself is not.

- [ ] **Verify Figma _export_ from claude.ai/design** — blocked, unblocks when:
      someone spends the ten minutes. Import via Figma links into the canvas is
      confirmed first-party (`hifi-design` skill); export out of it is still
      unverified, and ADR-0032's "the canvas dead-ends" tradeoff rests partly on it.
      Treat as a 10-minute spike, not open-ended research — `/claude-design` already
      names the asymmetry explicitly so the page can't be misread as endorsing the
      forbidden direction.

- [ ] **Blocked on Figma/Claude-Design external access** (grouped — same root
      blocker, different symptoms):
  - [ ] Participant artboards are still ungated: `check:artboard-palette` covers
        the shared sheet, but a participant's own `.dc.html` can hardcode a colour
        beside the palette it links, and nothing reads those 31 files. The blocker is
        reach — a gate needs the artboards in-repo or an authenticated client. Katas 2
        and 5 want this.
  - [~] `/design-sync`'s manifest — **half done 2026-09-07 (ADR-0106).** The
    _source_ of the Inter/Fira Code claim is fixed: `colors_and_type.css` no
    longer declares them and `SKILL.md` no longer instructs them. The manifest
    itself (`_ds_manifest.json`) is app-generated (`"source":"spa"`) and is
    therefore stale rather than wrong — it still names Inter and Fira Code, and
    no MCP tool triggers a rebuild. Re-read it after the project's design system
    next rebuilds, and settle the two phantom tokens then; they were not
    identifiable from the current manifest.
  - [x] ~~Re-syncing the Atelier design system in Claude Design is blocked on the
        same interactively-authenticated MCP — no script can drive it.~~ **Done
        2026-09-07 (ADR-0106).** The premise was wrong: the MCP is reachable from a
        normal session and no script is needed. Foundation re-synced — the repo's
        `tokens.css` is now `@import`ed by `colors_and_type.css`, which restates
        nothing from it, and the seven genuinely page-level values moved to `--ds-*`.
        Found on the way: four files in that project declared `--ui-*`, two of them
        the same names with different values, so `_ds_manifest.json` was resolving
        collisions by scan order; and `SKILL.md` was telling agents to use the `Llm`
        prefix, which names nothing that exists (9944 `Atl*` in `libs/`, zero
        `Llm*`). **Not verified: the render** — no browser tooling in that session,
        so someone still has to look at the preview cards.
  - [ ] The kata and the tutorial still build the same Figma artifact (one
        Settings/Card + four `*/Starter` frames in `snapshot.json`) — giving the kata
        its own target is a Figma write. Both pages now say plainly it's the same
        frame and the kata is a timed second lap, which is the honest interim state.

- [ ] **No typeface gate reaches `docs/`.** `check:typeface`
      (`check-typeface.js:133`) scans `libs/{fw}/src/lib` only, which is why the
      `--docs-font` Inter fallback (fixed 2026-09-07, `a90556f`) and the OG-image
      `families: ['Inter']` above both survived. Also uncovered: 14 bare
      `font-family: monospace` declarations across seven `docs/src/pages/*.astro`
      files and `docs/src/components/McpExplorer.tsx`, which bypass
      `--ui-font-mono` rather than name a stale face — a lower-severity smell in the
      same blind spot. Decide whether the gate widens to `docs/` or whether `docs/`
      gets its own rule; a generic keyword is not the same violation as a retired
      brand name, so one rule may not fit both.

- [ ] **Three decisions the 2026-09-07 sweep named rather than took.** Each is
      recorded in a commit message and nowhere a reader would look, which is why
      they are here.
  - [ ] **There is no SemiBold below 16px** — no `--ui-type-*` role and no Figma
        text style. `.atl-avatar` states `font-weight: semibold` at font sizes
        2xs/xs/sm (10/12/14px), so following the code faithfully leaves those text
        nodes unbindable; they were bound before only because they carried the wrong
        weight, which happened to match `ty/label` (12 Medium) and `ty/control`
        (14 Medium). Cost 12 findings of type-baseline debt on 2026-09-07. Same
        shape as ADR-0074, which added `control` and `action` because two
        combinations were unspanned — this is a third. Decide: give the small-end
        semibold combination a role, or accept it as off-role and say so.
  - [ ] **AtlCombobox's `input` layer passes the block-padding check by
        coincidence.** It carries `padding: [9, 56, 9, 16]` against `minHeight: 40`,
        and 9px is exactly what `.atl-combobox-input`'s ADR-0041 recipe derives — so
        it reads as correct while being the same false-pass ADR-0107 retired at the
        root. `checkLayerPaint`'s ADR-0107 treatment was deliberately scoped to the
        six masters that ADR names, so this is untouched. Decide: fix the master's
        padding data, or extend the height-derived treatment to AtlCombobox with its
        own ADR.
  - [ ] **Three parent masters hand-draw their children instead of instancing
        them** — AtlAvatarGroup, AtlTable and AtlAccordionGroup all have
        `compositionDependencies` null and redraw their parts as plain frames.
        `AtlTr`, `AtlTd` and `AtlTbody` compose real instances two levels deep, so
        the discipline exists below the parents but not in them. This is the root
        cause of three separate drifts fixed on 2026-09-07 — including AtlTable's
        thead diverging from its own child master, which renders correctly — and of
        having patched AtlAvatarGroup's numbers twice in one hour. Patching numbers
        on a hand-drawn copy is symptom treatment; the fix is instancing, and it
        needs care because the parents' boolean properties are wired to their own
        hand-drawn helper layers.

- [ ] **An automated parity pass validates about a fifth of what Figma paints.**
      Measured 2026-09-07 from AtlSelect's own `cssMapping`: four of its five
      painted states are gated behind pseudo-classes (`.has-value`,
      `[aria-expanded]`, `:hover`, `:focus-visible`), and a static component-tree
      read can never trigger any of them. `figma_check_design_parity` therefore
      only ever validates the resting state. Every defect the two sweep waves found
      came from opening painted variants by hand. Not a bug to fix — a coverage
      fact that should shape how much a green parity score is trusted, and it is
      why `tasks/figma-parity-sweep-2026-09-07.md` records what the score cannot
      see. Consider whether an interactive pass (Storybook + real hover/focus, or
      per-variant screenshot review) belongs in the workshop's own verify loop.

- [ ] **`check:release-drift`'s diagnosis assumes one direction.** Seen
      2026-09-07: with the registry at 0.2.39 and the working tree at 0.2.38 (a
      `chore(release)` commit fetched but not yet rebased onto), it printed
      `✗ [DRIFT] local 0.2.38 vs published 0.2.39` followed by _"A publish did not
      reach the registry — check the token/scope … and republish"_. The numbers said
      the opposite: published was AHEAD, the publish had fully succeeded, and the
      fix was `git rebase origin/main` — after which the same gate reported 5 of 5
      in sync. The advice it gives for local-behind is actively wrong and points at
      a republish that would be a no-op at best. It should compare the direction
      first and say "your tree is behind the release commit" when local < published.

## Optional / low priority

Not urgent; fix opportunistically or when touching the same area anyway.

- [ ] **Two net-zero commits** (`98e8755`, `ac3c854`) stay in git history — they
      cancel exactly, and rewriting unpushed history was blocked by the auto-mode
      classifier. Harmless; squash them if the branch is ever rebased anyway.

- [ ] **Old "Larger workstreams" leftovers** (from the original ranked roadmap;
      kept, not deleted):
  - [ ] C7 capture bound-token name/value in the Figma snapshot · C8 `check:figma`
    - freshness check (the snapshot never checks its own age; `figmaLastModified`
      is still `null`) · C9 a full 27-master snapshot.
  - [ ] D12 de-personalize the host + deploy workflow · D14 invert
        `check-docs-sync` · D15 secret/RCE defaults review. (D10, D11, D13 from the
        same original list are done and archived — see
        `tasks/archive/2026-07-defect-batch-h1-figma-audit.md`.)

- [ ] **`@angular/animations` is not the only optional peer a prune could take.**
      The dep-prune reasoning that failed once already ("zero source imports") is
      sound about this repo's own code and blind to what a dev-dependency reaches for
      at build time. No gate checks that, and probably doesn't need one — recorded so
      the next prune's author reads this first. Partial mitigation already exists: CI
      now builds Storybook, so a prune that breaks a builder fails the PR.

- [ ] **`@nx/devkit` is still a hard dependency of the preset, pinned to the
      monorepo's nx.** ADR-0053 closed the peer-dependency route by which a plugin
      outran nx core, but `NX_VERSION` is read from whichever devkit the preset itself
      carries — if `create-nx-workspace` ever scaffolds on a newer nx than this pin,
      the skew returns inverted. Hasn't bitten because the pin moves with the
      monorepo, but that's discipline, not a mechanism. _(Note: the triage's "Figma
      polish pass" list named this line, but its content has nothing to do with Figma
      — moved here as a judgment call; see the session report.)_

- [ ] **Bonus, found while restructuring (not one of the original 130, no
      checkbox in the old file): 16 pre-existing horizontal-overflow page/width
      combinations**, surfaced (not caused) when the docs scrollport fix removed
      `.docs-main`'s `overflow-y: auto`. Contained by `.docs-main-content` — nothing
      is cut off or pushes the page — but real responsive defects (e.g.
      `.docs-props-table`'s 849px min-content width at narrow viewports). Deliberately
      not fixed with the scrollport work to keep the scopes apart; the proper fix is a
      per-element scroll container on the wide content.

## Closed this session (2026-09-06)

- [x] **`Status` joins the gate's axis-word list** — `tools/scripts/lib/component-axes.js`'s
      `axisOf`/`AXIS_PREFIX` (and its two duplicated axis-word regexes,
      `tools/scripts/lib/component-map.js`'s `AXIS_RE` and `check-variants.js`'s own
      union-parsing regex) now recognize `Status` alongside
      Variant/Size/Shape/Position/Orientation. Two unions newly validated:
  - `AtlAvatarStatus` (`'online' | 'offline' | 'away' | 'busy' | ''`) is a genuine,
    CSS-backed paint axis — all three frameworks already carry `.status-online` /
    `.status-offline` / `.status-away` / `.status-busy`, so it now passes
    `check:variants` and `check:defaults` with zero code changes needed. The empty
    `''` member ("no status") needed no special handling: `check-variants.js`
    already skips falsy members (`if (!member) continue;`), so `''` was never going
    to be misread as a missing `.status-` class.
  - `AtlChatStatus` (`'idle' | 'streaming' | 'error'`) is behavioural state, not
    paint — only `.status-streaming` exists in any framework, driving the input
    footer's Send/Stop button swap (`isStreaming` in `atl-chat.tsx` and the
    Angular/Vue equivalents). `idle` and `error` legitimately have no CSS class.
    Exempted per `angular|react|vue:AtlChatStatus:idle|error` (6 entries, one
    shared reason) in `tools/scripts/lib/allowlists.js`'s `VARIANT_AXIS_EXCEPTIONS`,
    which was converted from a `Set` to a `Map` of `{kind, reason}` (matching this
    file's other allowlists) — a drop-in change for `check-variants.js`'s consumer
    side since `Map.has()` reads identically to `Set.has()`.
  - Verified: `check:variants` 24→26 unions × 3 frameworks (both new unions passed
    clean); `check:defaults` 22→24 props (both new prop defaults agree across all
    three adapters and docs — `avatar.status` defaults `''` everywhere,
    `chat.status` defaults `'idle'` everywhere). Turning the word on surfaced
    nothing beyond the two unions described above.
  - `tools/scripts/check-figma.js`'s own `[NAME]` axis-word regex (Variant/Size/
    Shape/Position/Orientation/Align/Role — a different, seven-word list, unrelated
    to this gate pair) was deliberately left untouched — out of scope for this
    decision; drawing the Figma-side `AtlAvatarStatus` axis is a separate, still-open
    follow-up above (Needs an owner decision) and needs the Desktop Bridge.
- [x] **The agenda's `solved-*` branch promise, and the trainer-kit repo-location
      decision it turned out to be entangled with** — `schulung-2tage-agenda.md`
      claimed (gap-table row `:81` and a Folie-7 bullet) that four Git branches
      `solved-toast`/`solved-tagchip`/`solved-statcard`/`solved-avatar` exist as a
      trainer safety net; `git branch -a` confirms zero `solved-*` branches. Both
      lines reworded to say the branches are trainer prep, not an existing asset.
      Searched for the same promise elsewhere: `docs/src/pages/schulung.astro` (no
      mention), the rest of `tasks/` (only prior review docs _describing_ the gap,
      already phrased accurately — untouched), `plan/adr/*` (two false-positive
      greps on "unresolved"/"resolved" containing "solved" as a substring — not the
      same word, untouched). Pulling this thread reopened
      `tasks/schulung-review-2026-09-02.md` §6.3's still-open recommendation to
      move trainer material to a private `atelier-trainer` repo — re-checked and
      closed as **no, not now**: the one sensitive finding it rested on (I1,
      colleagues' names + internal mailbox) is already fixed to role-only phrasing,
      and a second, ungated repo would fare worse than this one at exactly the kind
      of drift the `solved-*` claim itself is an instance of (`plan/ai-readiness.md`
      needed a full ADR supersession, ADR-0083→ADR-0097, within five months).
      Recorded as ADR-0103; "Decide trainer-kit repo location" removed from
      Needs an owner decision above. M12 (building the four branches themselves)
      stays open — see Near-term work / grab-bag.
- [x] **No target type-checks the stories** — `check:types`
      (`tools/scripts/check-types.mjs`, commit `6a8ac9f`) runs `tsc --noEmit` over each
      framework's `tsconfig.spec.json`, which globs `*.stories.*`. Gate is wired into
      `check:all`.
- [x] **`workshop/` is untracked and unignored** — `git ls-files 'workshop/*'` now
      returns five tracked files.
- [x] **Rotate `NPM_TOKEN`** and **republish the six missing versions** — done today:
      all five publishable packages are at 0.2.35 on npm, `npm run check:release-drift`
      exits 0 ("5 of 5 in sync"). No sequencing note remains open.
- [x] **a11y-parity: Select/Combobox out of the gate by design** — closed as
      answered, not merely re-triaged: the 2026-09-05 caption-fix cross-check ("What
      cross-checking the closed item turned up," now archived) reconfirmed Select/
      Combobox (and Radio) are exempt by design (ADR-0007/ADR-0091); only `accordion` is
      a real gap, and it's tracked in Near-term work above.
- [~] **No gate typechecks the three `libs/*/.storybook/tsconfig.json` projects** —
  closed with a note rather than a tick: `check:types` already covers the story
  prop-typing failure class this item worried about; the only residual is the three
  `.storybook/tsconfig.json` config files themselves, a much thinner problem than the
  item as originally written.
- [~] **`/claude-design` stale numbers (M1)** — split: the gate-count half is done
  (`docs/src/lib/gate-count.ts` derives "33" at build time from `package.json`); the
  "twenty-four tags" / "17/13 ADRs" half is not — carried forward above (Near-term
  work, grab-bag) since we now have the derivation pattern to copy.
- [x] **Four a11y-role/pictogram questions, decided by the owner** — the three
      `METADATA_ROLE_EXCEPTIONS` divergences plus the breadcrumb separator, closed
      together:
  - **AtlStepper** — metadata corrected `progressbar` → `tablist`, matching all
    three code adapters. Its `METADATA_ROLE_EXCEPTIONS` entry removed. Vue's
    `tabpanel` turned out to already exist (`atl-step.vue`, present since the
    original Vue rename commit) and already matches the committed baseline — the
    item as written overstated a gap that wasn't there; no Vue code change was
    needed. The Figma-master disagreement is unrelated and stays open, see
    AtlStepper's Figma item above.
  - **AtlChat** — kept `role: 'log'` and added the missing container:
    `AtlChatMessages` renders `role="log"` (named, `aria-label="Conversation"`)
    with `aria-live="polite"` in all three adapters. **First pass was wrong,
    caught by a second-model review before commit**: `role="log"` alone does
    not give `role="listitem"` a list parent — `listitem` requires an ancestor
    with `role="list"`, and `log` isn't one; the original fix left the
    `listitem`s exactly as orphaned as before, while its own comments (and
    `docs/src/data/components.ts`) claimed otherwise. Fixed by nesting a
    second, `display:contents` element with `role="list"` inside the log —
    verified in Chromium/Firefox/WebKit that the `display:contents` wrapper
    doesn't disturb the messages' flex/gap layout, and confirmed via
    Chromium's native accessibility tree that the structure now reads `log
"Conversation" > list > listitem, listitem`. Politeness is `polite`, not
    `assertive` — `workshop/briefs/toast.md` §4.3 uses severity to choose
    (`info`/`success` polite, `danger` assertive) specifically to avoid
    training users to ignore/disable notifications; an ordinary chat message
    isn't an interruption-worthy event, and the existing `AtlChatTyping`
    indicator already sets `aria-live="polite"` for the same reason. The log's
    accessible name (`"Conversation"`) also had to be added explicitly: without
    it, the shared `a11y-tree.ts` test helper's visible-text fallback (meant
    for name-from-content roles like `button`) produced a manufactured name —
    the concatenated text of every message — for a role (`log`) that is
    name-from-author-only. Checked whether this is a systemic bug in the
    shared helper (it would affect every component's snapshot): no — every
    other name-from-author-only role in the committed baselines
    (`AtlBreadcrumbs`/`AtlPagination` navigation, `AtlTable` region) already
    carries an explicit author label, and `AtlAlert`/`AtlBadge`/`AtlToast`'s
    `alert`/`status` roles have single self-contained message content where
    the fallback happens to coincide with a reasonable name — `AtlChatMessages`
    was the only case with genuinely list-shaped children and no label at all.
    `METADATA_ROLE_EXCEPTIONS` entry removed; a11y baselines regenerated.
  - **AtlSkeleton** — turned out already done: commit `57a24b1` (2026-08-26)
    had already corrected the metadata to `role: 'none'` and removed its
    exception. Verified, not re-fixed; no diff here.
  - **The breadcrumb separator** — stated as the one allowed exception to "every
    pictogram is an AtlIcon" rather than becoming an `AtlIcon` in three
    templates: [ADR-0100](../plan/adr/0100-a-pseudo-element-the-icon-set-cannot-reach.md),
    with a same-change "Corrected 2026-09-06" paragraph on
    [ADR-0050](../plan/adr/0050-a-glyph-in-a-string-map-is-still-an-icon.md).
    Verifying "hidden from assistive tech" found a real defect the pre-existing
    CSS comment had only assumed away: on Chromium, `CDPSession
.getFullAXTree` (the browser's own native accessibility tree) showed the
    separator glyph reaching the tree as its own text node; Firefox and WebKit
    were checked with Playwright's `ariaSnapshot()` — its own DOM-based ARIA
    computation, not those engines' native trees, but consistent with the same
    finding. Fixed with the CSS Generated Content alt-text pair (`content:
<value> / ''`) in all three stylesheets — re-measured, the glyph still
    renders visually and is gone from Chromium's native tree and all three
    engines' `ariaSnapshot()`. **Second-model review also caught**: React and
    Vue's `<ol>` had no explicit `role="list"` (only Angular did) despite both
    setting `list-style: none` — the documented Safari/VoiceOver case where an
    unstyled list can lose its implicit list semantics. Added to both; not
    independently reproduced here (no macOS Safari + VoiceOver access in this
    environment), applied on the strength of the documented real-world
    behaviour rather than a local repro.
  - `check:a11y-parity`, `check:metadata` and `check:adr-refs` all exit 0 after
    this change.
