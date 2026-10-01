# P1 — CSS inventory: how much of Angular/React/Vue CSS divergence is a transform?

Date: 2026-10-01. Question: if Angular's CSS were the single source and React/Vue CSS were generated from it by a
transform, how much of today's difference would the transform cover, and what is a genuine difference (DOM structure,
behaviour, visual values)? Answer in one line: **mostly a style refactor, with a DOM-refactor tail of six components.**

Nothing under `libs/` was edited. Scripts and raw outputs live in
`/private/tmp/claude-501/-Users-dominikpieper-Projects-atelier/56932b2a-5aee-437a-b1f9-6f468df65ebb/scratchpad/p1-inventory/`
(`normalize.js` naive pass, `smart.js` rule-aware pass, `audit.js` host-context / unscoped-selector audit,
`drawer-probe.js` Playwright probe, `out/` per-component normalized CSS, diffs and `summary.json` / `smart.json`).

## Headline numbers

- 31 Angular component CSS files, 29 React, 29 Vue. Angular-only: `atl-option.css`, `atl-toast-container.css`.
- **React vs Vue: byte-identical for 27 of 29 files.** The two that differ (`atl-chat.css`: one trailing blank line;
  `atl-table.css`: one comment saying "React" vs "Vue") differ in nothing a browser reads. Vue/React are one CSS
  source today. The whole question is Angular vs the other two.
- Angular files: 4269 lines in total; React 4324.
- Per-component classification (29 pairs; each component counted once under its primary category):

| Category                                                                     | Components                                                                                                | Count |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----- |
| (a) transform-only (zero residual after the naive transform + comment strip) | alert, badge, checkbox, icon, input, radio, radio-group, textarea, toggle                                 | 9     |
| (b) scoping-shaped only (a smarter, rule-aware transform covers it)          | accordion, avatar, button, card, chat, code-block, combobox, dialog, pagination, progress, skeleton, tabs | 12    |
| (b)+(d) scoping plus a small value divergence                                | stepper, toast                                                                                            | 2     |
| (c) DOM divergence (also contain (b))                                        | breadcrumbs, drawer, menu, select, table, tooltip                                                         | 6     |
| Total                                                                        |                                                                                                           | 29    |

- Of the six (c) components, **three are deliberate, documented architecture** (select, tooltip, menu: CDK overlay vs
  native/own-panel), **one is deliberate by necessity** (table: custom-element row wrappers), **one is incidental**
  (breadcrumbs) and **one is a suspected bug in Vue** (drawer).
- (d) value divergences: 8 rules reported by the tool; after reading them, 3 are independent of DOM structure
  (stepper — a real Angular bug; toast-container font-family; avatar, which turned out to be a selector-semantics
  artefact and is reclassified as (b)); the rest are consequences of the (c) structures.
- Line-level volume: the naive transform leaves 916 differing lines (added + removed, modified lines count twice)
  across the 29 pairs. The rule-aware transform leaves 195 residual lines, and of those 114 are select, 41 tooltip,
  7 menu, 8 tabs (inline `styles:` outside the `.css` file, identical once folded in), 21 avatar (reclassified),
  and the rest single digits. In rule terms: of 501 Angular rules (446 equal after the rule-aware transform, 37 more are pure renames), about 20 (select 15, tooltip 11, avatar 4,
  menu 1, drawer 1, stepper 1, toast 1, tabs 2, plus a handful of renames) do not map by rule.

## Method

1. Enumerated `atl-*.css` under `libs/{angular,react,vue}/src/lib/**` and paired by filename (`comm` on basenames).
2. **Naive normalizer** (`normalize.js`, Node + postcss 8 from the repo's `node_modules`; postcss was present, so no
   regex fallback was needed). Applied to the Angular file only:
   - `:host` to `.atl-<name>`; `:host(X)` to `.atl-<name>X`; `:host-context(Y) rest` to `Y .atl-<name> rest`;
   - every other top-level selector gets the descendant prefix `.atl-<name> `;
   - selectors inside `@keyframes` are left alone; `@media` / `@starting-style` children are transformed;
   - comments stripped on both sides, then both formatted with the repo's Prettier (`parser: css`, `singleQuote`);
   - `diff -U0` of normalized-Angular vs React; "residual lines" = added + removed lines.
3. **Rule-aware pass** (`smart.js`) to separate (b) from (c)/(d). It keys every rule by `(at-rule context, canonical
selector)` and compares declaration maps, so order and formatting do not matter. Additional rules over the naive pass:
   - per-component root and host-class set: the primary root is `.atl-<name>` except accordion
     (`.atl-accordion-group`), drawer (`.atl-drawer-host`) and tabs (`.atl-tab-group`) — checked against the React
     component files. The set is read from the React `:is(...)` box-sizing preamble, which lists exactly the hosts;
   - Angular tag selectors (`atl-chat-header`, `atl-tr`) become classes (`.atl-chat-header`, `.atl-tr`);
   - `:host(.atl-card-header)` is already class-rooted in Angular (190+ `:host(.cls)` selectors) and maps to the class itself;
   - `:host(X):host-context(Y)` maps to ancestor form `Y X`;
   - **no descendant prefix**: a leading `<root> ` is dropped on both sides, because React/Vue write short classes bare
     (`.spinner`, `.track`) where Angular's Emulated attribute adds the scoping implicitly;
   - the ADR-0043 box-sizing preamble (`:host, :host *` vs `:is(...)`, `:is(...) *`) is keyed as one rule;
   - Angular `atl-toast-container.css` is merged into the toast comparison (React/Vue keep it in `atl-toast.css`);
   - residual A-only / R-only rules with an identical declaration set are paired as renames. Renames count as (b).
4. Manual read of the Angular template and the React / Vue component for every (c) candidate, plus the contract
   (`libs/spec/src/contracts/*.contract.ts`), `tools/scripts/lib/allowlists.js` and the ADRs for evidence of intent.

### Known limits of the normalizer

- It compares CSS text, not rendered output. A match proves the same rule text, not the same pixels.
- It cannot see a DOM difference that CSS does not mention. Breadcrumbs were found by reading templates after the
  CSS diff showed class renames; other components with equal CSS may still differ in markup. The a11y-parity
  snapshots (`tools/parity/a11y/*.json`) only partly cover this (jsdom trees, not layout).
- "Renamed" pairing is by identical declaration sets; two rules with the same declarations but different intent
  would pair falsely. I read each pair list; none looked wrong.
- Angular inline `styles:` (AtlTab in `atl-tabs.ts:166`, AtlStep in `atl-stepper.ts:196`) are not in the `.css`
  file and are not compared by the tool. I compared them by hand: the tabs inline rules equal React's
  `[role='tabpanel']` rules exactly; the stepper inline rule is `:host { display: contents }` with no React analogue.
- The unscoped-selector audit counts a rule as unscoped when no `.atl-*` class occurs anywhere in its selector.

## Table

"Naive" = differing lines after the naive transform; "Rule-aware" = lines still unexplained after the smart pass.

| Component   | Category  | Naive | Rule-aware          | Note                                                                                                                                                                                                |
| ----------- | --------- | ----- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| accordion   | b         | 51    | 0                   | Root is `atl-accordion-group`; 3 `:host(.atl-accordion-item):host-context(.variant-X)` rules become `.atl-accordion-group.variant-X .atl-accordion-item`                                            |
| alert       | a         | 0     | 0                   |                                                                                                                                                                                                     |
| avatar      | b         | 23    | 0 (tool: 21)        | Angular host class `.group` vs React `.atl-avatar-group`; `:host-context(atl-avatar-group)` (any ancestor) vs `.atl-avatar-group > .atl-avatar` (direct child). Needs an alias table, not derivable |
| badge       | a         | 0     | 0                   |                                                                                                                                                                                                     |
| breadcrumbs | b + c     | 22    | 0 css / DOM differs | `.list` vs `.breadcrumbs-list`, `a` vs `.breadcrumb-link`; plus markup difference (see section)                                                                                                     |
| button      | b         | 2     | 0                   | `.spinner` descendant prefix only                                                                                                                                                                   |
| card        | b         | 44    | 0                   | 12 `:host(.atl-card-X):host-context(.padding-Y)` rules to `.atl-card.padding-Y .atl-card-X`                                                                                                         |
| chat        | b         | 107   | 0                   | Tag selectors `atl-chat-header` to classes; the largest naive diff, fully covered by the tag-to-class rule                                                                                          |
| checkbox    | a         | 0     | 0                   |                                                                                                                                                                                                     |
| code-block  | b         | 22    | 0                   | Descendant prefix only                                                                                                                                                                              |
| combobox    | b         | 71    | 0                   | 21 pure class renames (`.combobox-input` to `.atl-combobox-input`, `.panel` to `.atl-combobox-panel`, `.option` to `.atl-combobox-option` ...); same elements. Needs an explicit rename table       |
| dialog      | b         | 53    | 0                   | Class already on the `<dialog>` in all frameworks                                                                                                                                                   |
| drawer      | b + c + d | 92    | 1                   | `.atl-drawer` to `.atl-drawer-host` alias; React adds a wrapper div with `display: contents`; Vue puts the class on the `<dialog>` (suspected bug)                                                  |
| icon        | a         | 0     | 0                   |                                                                                                                                                                                                     |
| input       | a         | 0     | 0                   |                                                                                                                                                                                                     |
| menu        | b + c     | 27    | 7                   | React renders its own `.atl-menu-panel`; Angular uses CDK menu overlay                                                                                                                              |
| pagination  | b         | 18    | 0                   | Descendant prefix only                                                                                                                                                                              |
| progress    | b         | 4     | 0                   | Descendant prefix only                                                                                                                                                                              |
| radio       | a         | 0     | 0                   |                                                                                                                                                                                                     |
| radio-group | a         | 0     | 0                   |                                                                                                                                                                                                     |
| select      | b + c + d | 97    | 114                 | Native `<select>` vs CDK trigger + listbox panel. Documented. Also `atl-option.css` has no React/Vue counterpart                                                                                    |
| skeleton    | b         | 4     | 0                   | Descendant prefix only                                                                                                                                                                              |
| stepper     | b + d     | 44    | 2                   | Angular uses `var(--step-circle)` and `var(--step-connector-width)` but never defines them (real bug)                                                                                               |
| table       | b + c     | 95    | 0 css / DOM differs | Angular wraps each row in `<atl-tr display:contents>`; striped rule selects `atl-tr:nth-child` vs `tr:nth-child`                                                                                    |
| tabs        | b         | 43    | 0                   | Root alias `.atl-tab-group`; `[role='tabpanel']` rules live in AtlTab's inline `styles:` in Angular                                                                                                 |
| textarea    | a         | 0     | 0                   |                                                                                                                                                                                                     |
| toast       | b + d     | 40    | 1                   | Angular container is a separate file (`atl-toast-container.css`); React/Vue container gains `font-family`                                                                                           |
| toggle      | a         | 0     | 0                   |                                                                                                                                                                                                     |
| tooltip     | b + c + d | 57    | 41                  | Angular: directive + CDK overlay positioning; React/Vue: wrapper span plus `.position-*` CSS classes                                                                                                |

## (c) DOM divergence, per component

Verdicts: **deliberate** = a comment, ADR, contract or allowlist entry records it; **incidental** = nothing records
it and it reads as a by-product; **suspected bug** = nothing records it and it contradicts the component's own CSS.

### select — deliberate (documented)

- Angular (`libs/angular/src/lib/select/atl-select.ts:87-130`): `<label>`, a `<button class="trigger" role="combobox">`
  with `.trigger-text`, `.invalid-slot`, `.trigger-icon`, then a `<div role="listbox" class="panel">` projecting
  `atl-option` children, then `.errors`. Option rows are separate components styled by `atl-option.css`.
- React (`libs/react/src/lib/select/atl-select.tsx:78-115`): `<label>`, `.select-wrapper` > native `<select>` with
  native `<option>` children, `.select-arrow`, `.errors`. Vue: the same shape (`atl-select.vue:74`, class `select-native`).
- Evidence of intent: `tools/scripts/lib/allowlists.js:385-390` (`A11Y_PARITY_EXEMPT`, "React/Vue render a native
  `<select>`; Angular is a CDK-overlay listbox (ADR-0007)"); `libs/spec/src/contracts/select.contract.ts:15,24-26`;
  `plan/adr/0145-the-contract-records-the-difference-not-who-owes-it.md:73`; the header comment of
  `libs/angular/src/lib/select/atl-option.css` states it outright.
- CSS consequence: 15 residual rules, none transformable. A single source here needs either two stylesheets or one
  structure. This is a DOM refactor, not a style one.

### tooltip — deliberate (documented)

- Angular: a directive plus `AtlTooltipContent` whose template is `{{ text() }}` with host class `atl-tooltip`
  (`atl-tooltip.ts:31-37`), positioned by `@angular/cdk/overlay`'s flexible-connected strategy
  (`atl-tooltip.ts:115, 210-225`). There is no wrapper element and no `.position-*` class.
- React (`atl-tooltip.tsx:85-104`): `<span class="atl-tooltip-wrapper">` around the children and a sibling
  `<div role="tooltip" class="atl-tooltip position-X">`, positioned by CSS.
- Evidence: `tools/scripts/lib/allowlists.js:70-77` (`VARIANT_AXIS_EXCEPTIONS`: Angular positions via CDK inline
  transforms, "not .position-* CSS classes").
- CSS consequence (the (d) items for this component are all consequences): React/Vue state `position: absolute`,
  `z-index: var(--ui-z-dropdown)`, `white-space: nowrap`, four `.position-*` rules, `.atl-tooltip-wrapper`, a second
  keyframes `atl-tooltip-enter-side`, and `translateX(-50%)` in the enter keyframes. Angular has none of these because
  the overlay does it.

### menu — deliberate (by design choice, lightly documented)

- Angular: `@angular/cdk/menu` (`atl-menu.ts:10, 40` "Uses `@angular/cdk/menu` for keyboard navigation, focus
  management, and ARIA"); the panel is the CDK overlay, so there is no panel element in the component's own CSS.
- React (`atl-menu.tsx:184`): `<div class="atl-menu-panel">` rendered inline; its 5 declarations (absolute, z-index
  dropdown, `top: calc(100% + spacing-2)`, `left: 0`, `min-width: 100%`) are the one residual rule.
- Verdict: deliberate (the CDK usage is stated in the component's doc comment), but there is no allowlist or ADR entry
  for the CSS consequence. Residual is small (one rule, 5 declarations).

### drawer — mixed: React deliberate, Vue suspected bug

- Angular (`atl-drawer.ts:54-70`): the host element is `<atl-drawer class="atl-drawer position-X size-Y">`, containing
  `<dialog>` > `.panel`. CSS selects `:host(.atl-drawer.position-right) dialog`.
- React (`atl-drawer.tsx:106-126`): `<div class="atl-drawer-host position-X size-Y">` > `<dialog>` > `.panel`. The
  wrapper div stands in for the host element and needs `display: contents` (the one value divergence; Angular's host
  needs no such rule). The contract documents the wrapper (`drawer.contract.ts:21-35`).
- Vue (`atl-drawer.vue:83-88, 97-100`): the **`<dialog>` itself** carries `atl-drawer-host position-X size-Y`.
  Vue's CSS is byte-identical to React's, and every dialog rule is `.atl-drawer-host dialog ...` (descendant), so none of
  them can match the Vue `<dialog>`. The contract also notes the Vue class placement (`drawer.contract.ts:30-33`) but only
  as a probe problem.
- **Verified in isolation** (`drawer-probe.js`, Chromium via Playwright, Vue's CSS file + Vue's markup shape, no tokens):
  the closed Vue-shaped dialog computes `display: contents` (React-shaped: `display: none`), so its `.panel` has a
  layout box while closed; opened with `showModal()` it computes `display: block`, not `flex`, and about 88px wide
  rather than the 448px (md) panel. **Not verified** in the real Vue Storybook; `check:stories` only asserts render,
  `play` and axe. Treat as a likely real bug and confirm in the browser before acting.
- Verdict: React deliberate, Vue accidental drift. This is exactly the kind of defect one CSS source + one DOM shape
  would remove.

### table — deliberate by necessity

- Angular wraps each row in a custom element: `<atl-tr>` (display: contents) around the `<tr>`. The CSS says so at
  `libs/angular/src/lib/table/atl-table.css:101-107` ("Each `<tr>` is wrapped in its own `<atl-tr display:contents>`, so
  it's always an only-child — `:nth-child` has to count the `atl-tr` wrappers"), selecting `tbody atl-tr:nth-child(even) td`.
  React / Vue render plain `<tr>` and select `tbody tr:nth-child(even) td`.
- A tag-to-class rule turns `atl-tr` into `.atl-tr`, which does not exist in React, so one residual rename rule remains.
  React/Vue also carry `.atl-tr-select-cell`, `.atl-th-sort-*` etc. (these paired).
- Verdict: a documented consequence of Angular's component-per-element model, not drift. It still means the
  generated CSS needs a per-component selector override.

### breadcrumbs — incidental

- Angular: `<atl-breadcrumbs>` (host class) > `<nav>` > `<ol class="list">` > `<atl-breadcrumb-item>` (host class
  `atl-breadcrumb-item`) > `<li class="item">` > `<a>` (`atl-breadcrumbs.ts:42-47, 90-98`). The current item is an
  `<a>` with no `href` and `aria-current`.
- React (`atl-breadcrumbs.tsx:57, 97-111`): `<nav class="atl-breadcrumbs">` > `<ol class="breadcrumbs-list">` >
  `<li class="atl-breadcrumb-item">` > `<a class="breadcrumb-link">` or `<span class="breadcrumb-current">`.
- Differences: a custom element sits between `<ol>` and `<li>` in Angular only; the current item is an `<a>` in Angular
  and a `<span>` in React; CSS targets bare `a` in Angular and `.breadcrumb-link` / `.breadcrumb-current` in React.
- Evidence: the a11y-parity snapshots for both are equal (`tools/parity/a11y/atl-breadcrumbs.{angular,react}.json`:
  navigation, list, listitem, link ... identical), and no comment or ADR records the markup difference. It reads as a
  by-product of the host-element model plus an independent naming choice, not a design call.

## (d) value divergences

All eight rules the tool reported, after reading them:

| #   | Component / selector                                           | Angular                                                                                                             | React / Vue                                                                                              | Verdict                                                                                                                                                                                                                            |
| --- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | stepper `.atl-stepper`                                         | `--step-circle` and `--step-connector-width` **never defined** (used at `atl-stepper.css:41, 59-60`)                | `--step-circle: 36px; --step-connector-width: 2px;` (`react/.../atl-stepper.css:15-16`)                  | **Likely real bug in Angular**: `width/height: var(--step-circle)` is invalid-at-computed-time, so the step circle has no stated size. No definition exists anywhere in `libs/angular` or `docs` (grep). Not verified in a browser |
| 2   | toast `.atl-toast-container`                                   | no `font-family`                                                                                                    | `font-family: var(--ui-font-family)`                                                                     | Trivial; the container holds no text of its own. React/Vue follow the "state it per root" convention (ADR-0035/0049), Angular's container does not                                                                                 |
| 3   | avatar `.atl-avatar` ring                                      | ring + `margin-inline-start: -8px` on every avatar with an `atl-avatar-group` ancestor (`:host-context`, any depth) | same declarations on `.atl-avatar-group > .atl-avatar` (direct child only)                               | Selector semantics, not values; reclassified (b). Behaviour differs only for avatars nested deeper in a group                                                                                                                      |
| 4   | drawer `.atl-drawer-host`                                      | n/a                                                                                                                 | `display: contents`                                                                                      | Consequence of the wrapper div (c)                                                                                                                                                                                                 |
| 5   | select `.is-invalid .invalid-icon`                             | none (icon sits in `.invalid-slot`, a flex child)                                                                   | `position: absolute; top: 50%; transform: translateY(-50%); inset-inline-end: calc(...)`                 | Consequence of the native `<select>` (c)                                                                                                                                                                                           |
| 6-8 | tooltip `.atl-tooltip`, `@keyframes atl-tooltip-enter` from/to | no `position`, `z-index`, `white-space`; plain `scale()`                                                            | `position: absolute`, `z-index: var(--ui-z-dropdown)`, `white-space: nowrap`; `scale() translateX(-50%)` | Consequence of CSS vs CDK positioning (c)                                                                                                                                                                                          |

So there are **2 independent value divergences** (stepper, toast container), 1 of them a probable bug; the others
follow from structure. Everything else compared equal declaration-for-declaration (446 rules).

## React vs Vue

- 27 of 29 files are byte-identical. `atl-chat.css`: React has one extra trailing blank line (line 302). `atl-table.css`:
  the header comment (line 31) says "React" vs "Vue". Neither changes rendering.
- What differs between React and Vue is markup, not CSS. Known example: drawer (above). The CSS being identical while the
  DOM differs is why a text-level diff cannot prove the two frameworks render alike.
- Neither React nor Vue is scoped: Vue SFCs contain no `<style>` block; every stylesheet is a plain imported global
  `.css` file (e.g. `atl-drawer.vue:21` `import './atl-drawer.css'`), so there is no CSS transform anywhere.

## Angular-only files

- `libs/angular/src/lib/select/atl-option.css` — styles the `[role='option']` rows inside `<atl-select>`. React/Vue
  render native `<option>` elements that the OS draws, so there is nothing to style. The file's own header says "React
  and Vue render a native `<select>`, where the OS draws the list and no option row exists to style."
- `libs/angular/src/lib/toast/atl-toast-container.css` — Angular has a separate `AtlToastContainer` component
  (`atl-toast.ts:159`). React / Vue define `.atl-toast-container` and its four `.position-*` rules inside `atl-toast.css`
  (same file as the toast). Declarations are equal except finding 2 above. Packaging difference only.
- Angular also has two rule sets outside any `.css` file: inline `styles:` in AtlTab and AtlStep (see Limits).

## Encapsulation and host-selector census (Angular)

- `ViewEncapsulation.None`: **tooltip** (`atl-tooltip.ts:30`), **table** (`atl-table.ts:89`), **menu** (`atl-menu.ts:59`).
  All other components are Emulated.
- Their CSS is already class-rooted (`.atl-tooltip`, `.atl-table`, `.atl-menu` and children) and is the closest to what
  React/Vue have. But each still opens with the ADR-0043 preamble `:host, :host * { box-sizing: border-box }`
  (line 6-9 of each file). **Inferred, not browser-verified:** under `None` Angular does not rewrite `:host`, and `:host`
  outside a shadow root matches nothing, so that preamble is inert in those three components. React/Vue's
  `:is(.atl-table, ...)` equivalent is active. Worth confirming against `check:geometry`.
- Selector census over all 31 Angular files (comments excluded): 238 `:host(...)` selectors, 88 bare `:host` selectors,
  **17 `:host-context`** occurrences, **0 `::ng-deep`**, 0 `>>>` or `/deep/`.
- Every `:host-context` occurrence (the naive transform only caught the 2 that start the selector; the other 15 are the
  compound form `:host(X):host-context(Y)` and need an explicit rule):
  1. accordion: `:host(.atl-accordion-item):host-context(.variant-default)`
  2. accordion: `:host(.atl-accordion-item:not(:last-child)):host-context(.variant-bordered)`
  3. accordion: `:host(.atl-accordion-item):host-context(.variant-separated)`
  4. avatar: `:host-context(atl-avatar-group)`
     5-16. card: `:host(.atl-card-header | -content | -footer):host-context(.padding-none | -sm | -md | -lg)` (12 selectors)
  5. drawer: `:host-context([data-theme='dark']) dialog::backdrop`
- Semantics note: `:host-context(.padding-sm)` matches **any** ancestor carrying that class, not only the card. The React
  rule `.atl-card.padding-sm .atl-card-header` is stricter. A faithful transform would have to choose.
- React / Vue unscoped rules: **80 rules with no `.atl-*` class anywhere in the selector** (accordion 12, avatar 6,
  breadcrumbs 1, button 1, code-block 10, dialog 9, drawer 3, pagination 9, progress 2, stepper 21, table 6), e.g.
  `.spinner`, `.track`, `.step-item`, `.page-btn`, `.close-btn`. Angular's Emulated encapsulation makes the same short
  names safe; in React/Vue they are global. This is a leakage risk in the existing code, independent of any transform.
  A generated stylesheet would have to namespace them (as combobox already does by hand).

## What a transform would be

A transform sufficient for 23 of 29 components needs these rules, all mechanical except where noted:

1. `:host` and `:host(X)` to the component's root class (per-component table of root + host classes, 3 overrides).
2. Angular tag selectors (`atl-foo`) to classes (`.atl-foo`).
3. `:host(X):host-context(Y)` to `Y X`, with a policy decision on ancestor strictness (see above).
4. Descendant selectors: either keep bare (current React/Vue) or prefix with the root (safer; changes 80 rules).
5. Fold the toast container file into the toast file; fold inline `styles:` into the file.
6. The box-sizing preamble to a `:is(...)` list of the component's hosts (needs the host list per component).
7. **Not mechanical:** class renames that differ per component (combobox 21, breadcrumbs 5, avatar alias, drawer alias).
   These need an explicit rename map or a convention change in the Angular templates to match.

Together with the 9 untouched files that gives 23 components with no genuine difference. The remaining 6 (select, tooltip,
menu, drawer, table, breadcrumbs) differ in markup. One CSS source is a style refactor for 23 of 29 components, and a DOM
refactor for 6: decide, per component, which structure wins (for select, tooltip and menu this means choosing between CDK
overlay behaviour and native/own-panel behaviour, which is a product decision, not a style one).

## Verified vs inferred

Verified (ran or read directly):

- File census and the Angular-only pair; React vs Vue identical for 27 of 29, and the two differences are a blank line and a comment.
- All numbers in the table (scripts in the scratchpad; re-runnable: `node normalize.js && node smart.js && node audit.js`).
- The 17 `:host-context` and 0 `::ng-deep` counts; the three `ViewEncapsulation.None` components; the two inline-style components.
- Template / component structure of select, tooltip, menu, drawer (all three), table, breadcrumbs; file:line citations above.
- Stepper's custom properties are used in Angular and defined nowhere in `libs/angular` or `docs` (grep).
- Drawer Vue-shaped markup with Vue's CSS in Chromium (`drawer-probe.js`): closed dialog is `display: contents`.

Inferred (not run in a real app / not exhaustively checked):

- That the Vue drawer is visibly broken in the real Storybook (the probe used the CSS file and a hand-built markup
  shape, without design tokens); that the Angular stepper circle really lacks a size at runtime.
- That the `:host, :host *` preamble is inert under `ViewEncapsulation.None`.
- That the breadcrumbs markup difference is incidental rather than designed (absence of any recorded rationale).
- That markup outside the six (c) components is structurally equal; only CSS equality and the a11y snapshots back this.
- That the rename pairing never paired two unrelated rules (I read the lists; combobox, breadcrumbs, select, accordion, card looked right).
