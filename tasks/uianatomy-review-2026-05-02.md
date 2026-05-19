# uianatomy Skill + MCP — Design System Review

Date: 2026-05-02
Scope: cross-check `@atelier-ui/spec` (`libs/spec/src/index.ts`) and per-framework impls (Angular, React, Vue) against uianatomy canonical components via the `uianatomy` MCP (`https://uianatomy.dev/mcp`) + bundled `uianatomy-mcp` skill.

---

## Part 1 — Atelier-UI gaps vs uianatomy canon

### Spec ↔ canonical mapping

| Atelier-UI spec | uianatomy id | Status |
|---|---|---|
| `LlmButtonSpec` | `button` | ✓ mapped, naming + axes drift |
| `LlmBadgeSpec` | — | **gap in canon** |
| `LlmAvatarSpec`, `LlmAvatarGroupSpec` | — | **gap in canon** |
| `LlmCardSpec` | `card` | ✓ axes drift |
| `LlmInputSpec` | `text-input` | ✓ |
| `LlmTextareaSpec` | — | gap (canon has no separate textarea; consider `text-input` multiline variant) |
| `LlmCheckboxSpec` | — | **gap in canon** |
| `LlmToggleSpec` | — | **gap in canon** (Switch pattern missing) |
| `LlmRadioSpec`, `LlmRadioGroupSpec` | — | **gap in canon** |
| `LlmSelectSpec`, `LlmOptionSpec` | `select` | ✓ axes drift |
| `LlmStepperSpec`, `LlmStepSpec` | `stepper` | ✓ semantic inversion (`linear` vs `nonLinear`) |
| `LlmComboboxSpec` | `combobox` | ✓ axes drift |
| `LlmAlertSpec` | `alert` | ✓ severity vocabulary drift |
| `LlmDialogSpec` | `modal` | ✓ name drift, missing `alertdialog` |
| `LlmTabGroupSpec`, `LlmTabSpec` | `tabs` | ✓ axes drift |
| `LlmAccordionGroupSpec`, `LlmAccordionItemSpec` | `accordion` | ✓ variant naming drift |
| `LlmMenuSpec`, `LlmMenuItemSpec` | `menu-button` (only) | partial — canon has only the disclosure form |
| `LlmTooltipSpec` | `tooltip` | ✓ position naming drift |
| `LlmToastOptions`, `LlmToastContainerPosition` | `toast` | ✓ severity drift, no `action` slot in spec |
| `LlmSkeletonSpec` | — | **gap in canon** |
| `LlmBreadcrumbsSpec`, `LlmBreadcrumbItemSpec` | — | **gap in canon** |
| `LlmPaginationSpec` | — | **gap in canon** |
| `LlmProgressSpec` | — | **gap in canon** |
| `LlmDrawerSpec` | `drawer` | ✓ logical-direction drift |
| `LlmTableSpec` (+ Tbody/Tr/Th/Td) | — | **gap in canon** (significant) |
| `LlmIconSpec` | — | **gap in canon** |
| `LlmChatSpec` | — | DS-specific (AI surface), no canon |

Canonical components NOT yet reflected in spec: `banner`, `disclosure`, `link`, `list-item`, `popover`, `search-input`, `segmented-control`, `sidebar-nav`, `tag-input`, `tile`.

### Per-component findings

#### Button
- Spec variants `primary | secondary | outline | danger` vs canon `primary | secondary | tertiary | ghost | destructive`. `outline` ≈ `tertiary` or `ghost`; `danger` ≈ `destructive`.
- Spec missing properties: `iconOnly`, `fullWidth`, `type`.
- Spec missing leading/trailing icon slots (canon documents `icon-leading` / `icon-trailing`).
- **CRITICAL — Angular impl** (`libs/angular/src/lib/button/llm-button.ts:33`): host element is `<llm-button>` with `role="button"` attribute. Canon mismatch `button-text-in-anchor` + APG: must render real `<button>` to keep native key handling, form participation. Loading state correctly uses `aria-disabled`/`disabled` toggle, but `aria-busy` not set during `loading`.

#### Card
- Spec: `variant`, `padding`, `role`. Canon adds `interactive`, `orientation`, `density`.
- Canon documents card-as-link overlay pattern; spec has `role` opt-in but no interactive affordance.
- Spec missing slots: `media`, `eyebrow`, `subtitle`, `actions`, `footer` (likely projected via `<ng-content>` but not declared in spec).

#### Input / Textarea
- Spec uses `LlmFormFieldSpec` with `value: any`, `onValueChange`. Canon `text-input` is documented, `textarea` is not (gap).

#### Select
- Spec only has `placeholder`. Canon adds `multi`, `required`, `native`, option-group support.
- Spec missing: typeahead-by-first-letter contract (canon mistake `select-no-typeahead`).

#### Combobox
- Spec: `options[]`, `placeholder`. Canon adds `variant: single-select | multi-select | creatable`, `filterMode`, `strict`, `async`, `virtualised`.
- Critical missing semantics: `aria-activedescendant` model not codified in spec.

#### Stepper
- **Boolean inversion**: spec `linear?: boolean` (default true), canon `nonLinear: boolean` (default false). Same semantic, opposite default. Pick one — recommend `linear` (positive default).
- Spec missing: `hasDescriptions`, `size`. Variant axis missing entirely (canon `standard | dot | vertical`).
- Spec `LlmStepSpec` has `error`, `completed`, `optional`. Canon documents `error/active/completed/pending`; `optional` is DS-specific extension.

#### Dialog (canon: Modal)
- Naming drift: DS uses `Dialog`, canon `Modal`. Both APG-valid.
- Spec `LlmDialogSize` includes `full`. Canon variant `fullscreen` covers this — could be a variant rather than size.
- Spec missing variant `alertdialog` (used for confirmations per canon `confirmation-flow` pattern).
- Spec missing `scrollBehavior`.

#### TabGroup (canon: Tabs)
- Naming drift: `LlmTabGroupSpec` vs canon `tabs`.
- Spec variants `default | pills` vs canon `line | contained | pill`. `pills` ≈ `pill`; `default` ambiguous.
- Spec missing: `orientation`, `activation` (`automatic | manual`), `density`.
- Event drift: spec uses `selectedIndex` (number), canon `selectedChange(tabId: string)`.
- Angular impl (`llm-tabs.ts`) follows roving-tabindex + aria-selected + aria-controls correctly. ✓

#### Accordion
- Variant drift: spec `default | bordered | separated` vs canon `bordered | contained | flush`. `separated` ≈ `flush`?
- Spec has `multi`, `headingLevel`. ✓ matches canon mistake `accordion-no-heading-wrap` requirement.
- Spec missing: `collapsible` (allow currently-open item to collapse in single mode).

#### Alert
- Severity drift: spec `info | success | warning | danger`, canon `info | success | warning | error`. `danger` vs `error`.
- Spec missing: `actions` slot, severity-to-role mapping (`alert` vs `status` per canon).

#### Toast
- Severity drift: same `danger` vs `error`.
- Spec `LlmToastOptions` missing: `action`, `hasIcon`, `hasTitle`. Canon documents single-action contract.
- Position values match (`top-right`, etc.) — canon uses logical (`top-end`); DS physical.

#### Drawer
- Spec `position: left | right | top | bottom` (physical). Canon `side: start | end | top | bottom` (logical). RTL bug surface: canon mistake `drawer-side-not-rtl-aware` directly applies.
- Spec missing variant axis (canon `modal | non-modal | navigation`), `swipeable`, `dismiss` event reasons.

#### Tooltip
- Spec `LlmTooltipPosition: above | below | left | right` (physical, idiosyncratic naming `above/below`). Canon `top | right | bottom | left`.
- Spec missing: `align`, `delay` enum, `arrow` boolean.
- Spec uses prefixed inputs `llmTooltip*` — directive-style API; canon is component-based but framework-mapping notes Angular CDK-style directives.

#### Menu
- Canon only has `menu-button` (combined disclosure + menu). Spec splits into `Menu` + `MenuItem`. Reasonable, but canon should add a standalone `menu` entry to support the split.

---

## Part 2 — uianatomy improvement todo

Suggestions from using the MCP + skill to perform this review. Ordered by impact.

### Data gaps (canonical components missing)

- [ ] **Add `badge`** — universal in DSes; status/count/label primitive. Should document variant axis (default/success/warning/danger/info), `dot` variant for indicator-only, `aria-live` semantics for dynamic counts.
- [ ] **Add `avatar` + `avatar-group`** — image/initials/icon fallback chain, status-indicator slot, group-with-overflow contract.
- [ ] **Add `checkbox`** — including indeterminate state, `aria-checked="mixed"`, hit-target, label association. Distinct enough from `select`/`radio` to need its own canonical.
- [ ] **Add `radio` + `radio-group`** — roving-tabindex inside group, arrow-key navigation, `aria-required-parent` rule, mutual-exclusion contract.
- [ ] **Add `switch`** (a.k.a. Toggle) — APG `switch` role, on/off vs checkbox boolean, momentary state. DS calls this Toggle.
- [ ] **Add `progress`** — `aria-valuenow/min/max`, indeterminate, `role="progressbar"`, label requirement. Common axe-flagged when label missing.
- [ ] **Add `skeleton` / placeholder loading** — `aria-busy`, `aria-hidden`, motion-reduced alternatives, when to use vs spinner.
- [ ] **Add `breadcrumbs`** — `nav` landmark, `aria-current="page"`, separator handling, RTL.
- [ ] **Add `pagination`** — `nav` landmark, `aria-label`, current-page semantics, sibling-count truncation pattern, prev/next vs page numbers.
- [ ] **Add `table`** (canonical) — semantic `<table>`, `<caption>`, `<thead>/<tbody>`, sortable columns (`aria-sort`), selection patterns, sticky-header contract, scrollable region focus. Highest-impact gap — every DS has one and they all diverge wildly.
- [ ] **Add `icon`** — `role="img"` + `aria-label` vs decorative `aria-hidden`, sizing tokens, currentColor inheritance contract.
- [ ] **Add `textarea`** OR document as `text-input` variant — auto-resize, rows property, `aria-multiline`.
- [ ] **Add standalone `menu`** — currently only `menu-button` exists. APG menu pattern (typeahead, ArrowKeys, submenu) deserves its own entry distinct from the trigger.
- [ ] **Add `code-block`** — copy affordance, syntax highlight aria-hidden, language label, line-numbers contract. (Niche but recurring in docs/AI surfaces.)

### Tool / API issues observed

- [ ] **`list_implementations` filter is broken** — calling with `component: "button"` returned only `modal` rows. Either the parameter name doesn't match server-side filtering or only `modal` has implementation audits populated. Document expected behavior or fix the filter.
- [ ] **Implementation audits coverage** — only `modal` × {cdk, headlessui, radix} have audit data. Expand to button, tabs, accordion, drawer, combobox, select at minimum to make `validate_implementation` and `get_mismatches` useful.
- [ ] **`get_anatomy` / `get_axes` / `get_events` / etc. return slices** — calling `get_component` is much more efficient for review. Document when the slice tools are preferable (large components like Modal where you only need motion).

### Schema consistency

- [ ] **Property direction (logical vs physical) is inconsistent across components.** Drawer uses logical `side: start/end/top/bottom`. Tooltip uses physical `side: top/right/bottom/left`. Toast position uses logical `top-end`. Pick one — RTL safety argues logical everywhere; document migration for components that ship physical today.
- [ ] **Severity vocabulary drift inside canon.** Alert and Toast use `info | success | warning | error`. Many DSes (Bootstrap-heritage, this one included) use `danger` instead of `error`. Add a vocabulary section to `notes` mapping common synonyms (`danger`/`destructive`/`error` → canonical pick).
- [ ] **Boolean polarity convention.** Stepper `nonLinear` is a negative-default boolean, which inverts mental model. Establish convention: prefer positive-default (`linear: true` rather than `nonLinear: false`).
- [ ] **`performance` block coverage is uneven** — Tabs, Modal, Combobox, Toast, Alert have it; Card, Button, Tooltip, Stepper partially. Establish a rule: every component with a stack/count/queue dimension carries a `performance` block.
- [ ] **`formIntegration` block coverage is uneven** — Button, Modal, Combobox, Select, Drawer have it. Should be required for every component that participates in forms (Checkbox/Radio/Switch when added; Textarea when added).
- [ ] **`events` block missing on some components** — Button has none (justified by native click), Card has none (likely justified for non-interactive variant). Tooltip has only `openChange`. Consider explicit "no canonical events" sentinel rather than absence, so consumers can distinguish "no events" from "we forgot".
- [ ] **`vsRelated` should be bidirectional and machine-checked.** Card → Tile and Card → ListItem present; Tile → Card not validated in current data slice. Auto-derive reverse relationships or lint for symmetry.

### Content quality

- [ ] **Naming-drift documentation.** Modal/Dialog, Drawer/Sheet/SidePanel, Toast/Snackbar/Flag, Alert/Banner/InlineNotification — each mention is buried in `notes`. Add a structured `aliases` field per component so `search_components("dialog")` finds Modal and `search_components("snackbar")` finds Toast.
- [ ] **`lastReviewed` cadence policy.** Most components are 2026-04-28 or 2026-04-29. No staleness indicator surfaced to users. Add a `staleAfter: "90 days"` policy + warning when over.
- [ ] **Cross-component sub-anatomy reuse.** `actions` button-group slot recurs identically on Card, Alert, Toast, Modal, Drawer. Document a canonical "Action Group" sub-anatomy that those components reference, to avoid drift across them.
- [ ] **Variant naming alternatives.** Stepper variant `dot` is unusual — Material calls this "compact", Carbon "minimal". Add an `alternativeNames` field per variant.
- [ ] **Framework selector convention.** `frameworkMap.angularSignals` documents `<ui-button>`. Real-world libraries use prefixes (`llm-`, `mat-`, `nz-`, etc.). Add an explicit "selector prefix is library-specific; replace `ui-` with your prefix" note in the framework map preamble.

### Skill (`uianatomy-mcp`) usability

- [ ] **Skill triggers are good** — auto-invoked for "review design system" intent without manual `/uianatomy`. ✓
- [ ] **No example workflow in skill** — adding a "Recipe: spec-to-canon parity audit" example would speed up future runs (prescribes `list_components` → spec mapping → per-component `get_component` deep-dive → mismatch table). Recommend adding under SKILL.md Examples.
- [ ] **Skill does not surface deferred-tool loading order.** All 22 `mcp__uianatomy__*` tools are deferred; first call requires `ToolSearch select:...`. Document in SKILL.md so a fresh session knows to bulk-load `list_components`, `get_component`, `list_patterns` upfront.

---

## Tracked tasks

- Task #1 ✓ map spec to canon
- Task #2 ✓ deep-review per-component
- Task #3 ✓ collect uianatomy improvements (this doc)
- Task #4 — write report (this doc)

---

## Re-check 2026-05-02 (later)

Schema improvements landed on sampled components (button, drawer, stepper):

- ✓ **`alternateNames` field added** (drawer: `["Side panel", "Sheet"]`, stepper: `["Wizard", "Progress steps"]`; button still pending)
- ✓ **`a11yAcceptance.axeCoreVersion: "4.10.2"`** on all three
- ✓ **`propertyMap.kind`** replaces `type` (`enum | boolean | slot | text`) — Figma-specific vocab dropped

Still unchanged:
- 24-component count (no new canonical entries)
- `lastReviewed` dates not bumped despite schema edits
- `list_implementations` filter still returns only `modal × {cdk, headlessui, radix}`
- `get_changelog` returns null

Creation-tool integration decision: still **defer**. Coverage gaps (badge, checkbox, radio, switch, progress, skeleton, breadcrumbs, pagination, table, icon, textarea) unchanged.

---

## Re-read 2026-05-03 — additional findings

Items surfaced on a second pass that were not captured above. Grouped by where they belong.

### Atelier-UI bugs / API debt (actionable)

- **Angular `<llm-button>` host-element bug is the only critical-severity item in this review.** It already appears in §Button but deserves its own line in the action list: render a real `<button>` (Angular `:host` cannot, so the component should template a button or use directive-on-button). Without it: no native form participation, no native key handling, no implicit type=submit suppression. **Treat as a release-blocker for any 1.x stability promise.**
- **`aria-busy` missing on Button while `loading=true`.** Trivial fix in all three adapters; pair with the host-element fix.
- **Per-framework adapter divergence on Button is asymmetric.** React uses `<button>` (correct), Vue uses `<button>` (correct), Angular uses `<llm-button role="button">` (wrong). The cross-framework parity story is undermined by silent semantic differences like this — consider a parity check that diffs *rendered DOM* (not just prop names) across the three adapters per component.
- **Drawer `position` is physical (`left/right/top/bottom`)** — confirmed RTL bug surface, not just naming drift. RTL apps will get the drawer on the wrong side. Migrate to logical `side: start/end/top/bottom` with a deprecation alias.
- **Tooltip `above/below`** is idiosyncratic vs `top/bottom`. Public API; renaming = breaking. Either alias both or commit to one before 1.0.
- **Combobox `aria-activedescendant` model is uncodified.** APG-required pattern; if the Angular impl emits it but the spec doesn't, downstream React/Vue impls may diverge. Codify in spec as a contract comment + add a test that asserts `aria-activedescendant` is set on the listbox owner during keyboard navigation.
- **DialogSize `full` mixes size with mode.** Should be `variant: "fullscreen"` not `size: "full"`. Affects type narrowing for consumers (`size === "full"` is currently the only way to detect fullscreen mode).
- **TabGroup uses `selectedIndex: number` for selection.** Index-based selection breaks under tab reordering or conditional tabs — switch to `selectedTabId: string` (canon’s `selectedChange(tabId)` event aligns with this). Breaking change; flag for next major.
- **`LlmAvatarStatus` includes empty string `''` as sentinel for "no status".** Cleaner: drop `''` and use `undefined`. Empty-string sentinels are an early-2010s pattern; signals/refs surface `undefined` naturally.
- **`LlmStepSpec.optional` is a DS-specific extension** (canon has `error/active/completed/pending` only). Annotate in spec with `// non-canonical: DS extension` so future canon-drift audits don’t flag it.

### Cross-cutting concerns not yet logged

- **CSS scoping semantics differ per adapter, not just CSS content.** Angular = component-scoped (default), React = global import + BEM-ish class names, Vue = `<style>` import (not `<style scoped>`, based on `llm-button.vue` reading `import './llm-button.css'`). Class-collision risk on host pages varies per adapter. Document the contract: classes are global by convention; consumer must scope.
- **Form-control bridge contract is not declared in the spec.** Angular needs `ControlValueAccessor`, React expects `value`/`onChange` or `defaultValue`/`onChange`, Vue expects `modelValue`/`update:modelValue`. Audit per form component (Input, Textarea, Checkbox, Toggle, Radio, Select, Combobox) — does each adapter support its idiomatic two-way bridge? `LlmFormFieldSpec` mentions `value: any` + `onValueChange` but doesn’t encode the per-framework bridge.
- **`prefers-reduced-motion` handling is per-adapter and undeclared.** Components with motion (Drawer, Dialog, Toast, Tooltip, Skeleton, Stepper transitions) should each declare in spec whether they collapse animation under reduced-motion, and tests should verify. Currently uneven.
- **Storybook story parity per component** is not enforced. The cookbook has a parity check; individual component stories don’t. If Angular ships a `Variants` story and React ships a `WithVariants` story, the docs site can’t cross-link. Add `tools/scripts/check-story-parity.mjs` (or extend `check:sync`).
- **Token-rename blast radius.** Atelier tokens (`--ui-*`) are referenced in every adapter’s CSS. A token rename in the design system requires touching every framework lib. Either generate CSS from a shared source (post-process during build) or run a token-usage audit before any token rename.
- **Action-group sub-anatomy duplicates across Card, Alert, Toast, Dialog, Drawer.** Already noted as a uianatomy-side issue (§Content quality), but the same drift exists *inside this DS*: each component’s `actions` slot has slightly different padding/alignment expectations. Extract a shared `LlmActionGroupSpec` and consume from each.

### Spec hygiene

- **Boolean polarity in spec.** Audit all `boolean?` properties in `libs/spec/src/index.ts` for negative-default polarity (`disabled`, `loading`, etc. are correctly positive — but Stepper `linear` should be too once aligned with canon). Add a lint to flag `non*` / `no*` / `disable*` boolean prop names that aren’t justified.
- **Canon non-coverage markers.** Components that don’t map to canon (Skeleton, Breadcrumbs, Pagination, Progress, Icon, Chat, Table, Avatar*, Badge, Checkbox, Toggle, Radio*) should each carry a `// canon: gap` or `// canon: not-yet-mapped (uianatomy issue #X)` comment so the next spec audit knows where to look first.

### Process

- **Re-check window** between 2026-05-02 (initial review) and 2026-05-03 (re-check) caught schema improvements within 24h. Cadence proposal: re-run the parity audit on uianatomy MCP changes (subscribe to `get_changelog` once it returns non-null). Currently `get_changelog` is null per line 188; track until it lights up.
- **Audit doc location.** This file lives in `tasks/` and is currently untracked. Decide: track in git (auditable trail) or keep ephemeral. If tracked, rename to `audits/uianatomy-2026-05-02.md` so `tasks/` stays for active work.

---

## Re-check 2026-05-04 — canon coverage jump

Re-ran `list_components`, `list_implementations`, `get_changelog`, and `get_axes` for every newly-mappable component. Major movement on the canon side; minor movement on schema; `get_changelog` still null.

### Headline changes vs 2026-05-02 / 2026-05-03

- **Canonical components: 24 → 41.** All `**gap in canon**` rows from §Part 1 now have canonical entries except `chat`. Twelve additional canonical entries landed beyond the gap list (banner, disclosure, link, list-item, popover, search-input, segmented-control, sidebar-nav, tag-input, tile, grid-pattern, tree-grid, code-block).
- **`stalenessDays` field added** on every entry — closes "staleness indicator" item from §Content quality. Most components reviewed today (2026-05-04, `stalenessDays: 0`); ten new entries still 1 day stale.
- **Library implementation audits: 3 → 15.** Coverage now: `cdk` × {accordion, combobox, drawer, modal, tabs}; `headlessui` × {accordion, combobox, drawer, modal, tabs}; `radix` × {accordion, combobox, modal, tabs} (no drawer); **`vaul` × drawer** (new library). Closes the "expand audit coverage" item from §Tool issues.
- **`list_implementations` confirmed unfilterable** — its schema declares no parameters. Prior assumption that `component: "button"` was a broken filter was wrong; the tool always returns the full list. Update §Tool / API issues accordingly: this is not a bug, but a discoverability issue (callers expect a filter).
- **`get_changelog` still returns null** for button, modal, drawer. Unchanged. Track until non-null.
- **Button library audits still missing across all libraries** — §Per-component findings #Button referenced canon for the host-element bug, but no library-side audit exists yet. Highest-value coverage gap remaining.

### Spec ↔ canon re-mapping for newly-closed gaps

Updated mapping table for the rows that were previously **gap in canon**:

| Atelier-UI spec | uianatomy id | Status |
|---|---|---|
| `LlmTextareaSpec` | `textarea` | ✓ now mapped, axes drift |
| `LlmCheckboxSpec` | `checkbox` | ✓ now mapped, axes drift |
| `LlmToggleSpec` | `switch` | ✓ now mapped, name drift |
| `LlmRadioSpec`, `LlmRadioGroupSpec` | `radio-group` | ✓ now mapped, axes drift |
| `LlmBadgeSpec` | `badge` | ✓ now mapped, severity + missing axes |
| `LlmAvatarSpec` | `avatar` | ✓ now mapped, status sentinel + missing `hasStatusIndicator` |
| `LlmAvatarGroupSpec` | `avatar-group` | ✓ now mapped, missing variant + overflow axes |
| `LlmProgressSpec` | `progress` | ✓ now mapped, axes drift + boolean polarity |
| `LlmSkeletonSpec` | `skeleton` | ✓ now mapped, variant naming drift |
| `LlmBreadcrumbsSpec`, `LlmBreadcrumbItemSpec` | `breadcrumbs` | ✓ now mapped, missing variant + size |
| `LlmPaginationSpec` | `pagination` | ✓ now mapped, missing variant axis |
| `LlmTableSpec` (+ Tbody/Tr/Th/Td) | `table` | ✓ now mapped, structural drift |
| `LlmIconSpec` | `icon` | ✓ now mapped, name-enum vs name-agnostic |
| `LlmMenuSpec`, `LlmMenuItemSpec` | `menu` (standalone) | ✓ now mapped — canon now has standalone `menu` separate from `menu-button` |

Still uncovered: `LlmChatSpec` (DS-specific AI surface, no canon expected).

New canonical entries with **no spec counterpart** (DS gaps): `banner`, `disclosure`, `link`, `list-item`, `popover`, `search-input`, `segmented-control`, `sidebar-nav`, `tag-input`, `tile`, `code-block`, `grid-pattern`, `tree-grid`. Triage: `popover`, `link`, `code-block`, `disclosure` are likely needed (chat surface uses them already); `grid-pattern` / `tree-grid` are escalation patterns over `table`; the rest are nice-to-haves.

### Per-component drift — newly-mappable rows

#### Textarea
- Spec missing: `size`, `resize` (none/vertical/horizontal/both).
- Spec models `autoResize: boolean`; canon models as variant `auto-resize`. Pick one — recommend variant since auto-resize changes layout contract, not just behaviour.
- Spec carries no data-state surface for `at-limit` (75–100% of maxlength). Counter-with-warning is a common DS pattern; declare in spec or document as not supported.

#### Checkbox
- Spec missing: `size`.
- Canon variants `single | group` — spec has no group wrapper component (unlike `LlmRadioGroupSpec`). Either add `LlmCheckboxGroupSpec` or document tri-state parent-of-children pattern as a consumer responsibility.
- ✓ `indeterminate` matches canon.

#### Toggle (canon: switch)
- Naming drift: DS `Toggle` ↔ canon `Switch`. Canon documents `Toggle` as alternate name; non-blocking.
- Spec missing: `size`, `with-icons` variant.
- `LlmToggleSpec extends LlmFormFieldSpec` inherits `invalid` and `readonly` — canon switch has neither (binary on/off cannot be invalid in isolation, only as part of a required group). Either narrow the type or document that `invalid` is meaningless for Toggle.

#### Radio / RadioGroup
- Spec missing: `size`, `orientation` (vertical/horizontal), `card` variant.
- Canon `radio-group` codifies APG roving-tabindex contract; spec has no comment on it. Add a contract comment on `LlmRadioGroupSpec` referencing the auto-select-on-arrow APG behaviour.

#### Badge
- Severity drift: spec `danger` vs canon `error`. Same DS-wide drift already logged.
- Spec missing: `dot` (dot-only indicator variant) and `hasIcon`.
- No `aria-live` semantics for dynamic counts in spec — canon documents this. Add to spec when adding `dot`.

#### Avatar
- **`status: ''` empty-string sentinel** — already flagged 2026-05-03 (§Atelier-UI bugs / API debt). Now confirmed against canon: canon `status` enum has no empty member. Drop `''` from `LlmAvatarStatus`.
- Spec missing: `hasStatusIndicator` boolean (separate axis from `status` enum — canon distinguishes "has indicator slot rendered" from "indicator value").
- ✓ size axis (xs–xl) matches canon.
- Fallback chain (image → initials → icon) is implicit in spec via `src`/`name` presence; canon codifies as data states. Acceptable, but document the implicit chain.

#### AvatarGroup
- Spec is sparse (`max`, `size`) — missing entire variant axis (`stack | grid`), `overflowDirection` (end/start), and `interactive` boolean.
- Canon defines explicit `overflowing` → `expanded` transition (overflow tile opens popover with full member list). Spec has no event/state for this.

#### Progress
- Spec missing: variant axis `linear | circular` (only linear is implementable today).
- Boolean polarity: spec `indeterminate: boolean` (default false = determinate); canon `determinate: boolean` (default true). Equivalent semantics, opposite polarity. Spec polarity is correct (positive default for "value is provided") — canon is the one that should flip. Log on uianatomy side.
- Spec `variant: 'default' | 'success' | 'warning' | 'danger'` is severity-coloured progress; canon doesn't model coloured variants — only `data` states `error` / `complete`. Mark spec `variant` as DS-specific extension.
- Spec missing: `showValue` (render `47%` next to bar).

#### Skeleton
- Variant naming drift: spec `circular` / `rectangular` vs canon `circle` / `rect`. Trivial alias; pick one.
- Spec uses ad-hoc `width: string`, `height: string` (e.g. `'200px'`); canon uses `size` token enum (`xs`–`xl`) plus `multiple` boolean for repeated rows. Different ergonomics — spec is more flexible, canon is more token-aligned. Decide which contract this DS commits to.
- Spec missing: `multiple` (multi-line text skeleton).
- No `reduced-motion` data-state acknowledgement in spec. Add a comment that `animated=false` should be the default under `prefers-reduced-motion: reduce`.

#### Breadcrumbs
- Spec is sparse (`separator` on group, `href`/`current` on item) — missing `size`, `expandable` (overflow-collapse menu when too many crumbs), `showRoot`, variant axis (`trail | back-link`).
- ✓ `aria-current="page"` mapped to spec `current` correctly.
- The `back-link` variant (mobile single-arrow alt) is a separate component pattern in many DSes — decide if Atelier wants both shapes under one spec or a separate `LlmBackLinkSpec`.

#### Pagination
- Spec models numbered-only pattern. Canon variants: `numbered | prev-next-only | load-more`. Spec missing the latter two entirely.
- Spec missing: `size`, `disabled` (whole-component disable).
- No data-state model (`atFirst` / `atLast` / `loading` / `singlePage`) — these are derivable from `page`/`pageCount` but having a `loading` state to drive spinner UI is useful. Consider adding `loading?: boolean`.

#### Table
- **Boolean composition vs variant collision.** Spec `variant: 'default' | 'striped' | 'bordered'` makes striped and bordered mutually exclusive. Canon models them as independent booleans (`striped`, `bordered`) which are composable. **Recommend: drop `variant`, add `striped` + `bordered` as independent booleans.** Same for `selectable` — should be a top-level boolean or its own variant.
- Spec missing: `selectable` variant, `hoverable`, `multiSort`, `resizable`, `virtualization`, `density` (separate from `size`).
- Per-column sort lives in `LlmThSpec.sortDirection` / `sortable`; canon has table-level `sortable` / `multiSort` flags. Both layers are needed — spec has the column-level half, missing the table-level enable + multi-sort policy.
- `LlmTbodySpec.empty` + `colSpan` are good (covers the empty-state row); canon doesn't codify this pattern explicitly. DS-specific extension; annotate.

#### Icon
- **Name model is fundamentally different.** Spec hardcodes a closed `LlmIconName` enum (20 names). Canon treats `name` as consumer-defined (icon libraries are user-supplied). The spec contract is more restrictive; either: (a) allow consumer extension via generic param `LlmIconSpec<TName>`, or (b) document that this DS ships a fixed icon set and consumers should embed their own component for arbitrary names.
- Spec missing: variant axis `outline | solid`, `xs` and `xl` sizes (canon supports xs–xl; spec only sm/md/lg).
- Spec `label` semantics ≈ canon `meaningful` boolean. ✓ decorative-when-omitted contract aligns with canon.
- Spec `name` enum mixes semantic icons (`success`, `warning`, `danger`, `info`, `error`) with shape icons (`chevron-up`, `arrow-right`, `copy`). Three distinct concerns: status glyphs (consumed by Alert/Toast), navigation glyphs (chevrons/arrows), action glyphs (copy/delete/edit). Splitting into three sub-enums would help future extension and let consumers narrow.

#### Menu (standalone, canon now exists)
- Variant axis collision: spec `variant: default | compact` (density) vs canon `variant: vertical | horizontal` (orientation). Orthogonal — both are legitimate axes. Recommend: add `orientation` to spec (matches canon variant) and either keep `compact` as a `density?` property or drop in favour of `size`.
- Spec missing the entire APG keyboard contract surface: `typeahead`, `wrapNavigation`, `closeOnSelect`. None of these are required as props (defaults are sensible) but at least `closeOnSelect` is a frequent override (multi-action menus that stay open).
- ✓ Now that canon has standalone `menu`, the §Per-component findings #Menu note about "canon should add a standalone menu" is closed.

### Updates to §Part 2 (uianatomy improvement todo)

Items now resolved on canon side:
- ✓ Add `badge`, `avatar`, `avatar-group`, `checkbox`, `radio-group` (renamed from suggested `radio`), `switch`, `progress`, `skeleton`, `breadcrumbs`, `pagination`, `table`, `icon`, `textarea`, standalone `menu`, `code-block`. **All §Data gaps items closed.**
- ✓ `staleAfter` policy → implemented as `stalenessDays` per-component field. Threshold not surfaced (no `stale: true` flag at e.g. ≥90 days); track if ever needed.
- Partially: implementation audits expanded to {accordion, combobox, drawer, tabs} × {cdk, headlessui, radix} + vaul × drawer. Button still uncovered.

Items unchanged:
- `get_changelog` still null on every probed component.
- Property direction (logical vs physical) still inconsistent per component.
- Severity vocabulary drift inside canon: badge canon now uses `error`, alert+toast canon already used `error`. Within-canon vocabulary is consistent on `error`; remaining drift is canon-vs-DS only (DS uses `danger`).
- Boolean polarity convention not yet codified: canon `progress.determinate` (positive default) is fine, but `stepper.nonLinear` (negative default) still inverts. No canon-wide rule documented.
- `vsRelated` bidirectionality still uneven.
- `aliases` field still not added (canon mentions alternate names in `notes` only) — though `alternateNames` was added to a few components per 2026-05-02 re-check; coverage now? not re-checked here.

### New items for uianatomy

- [ ] **Add `chat` / `assistant-surface` canon** — every AI-driven DS ships one; this DS has `LlmChatSpec` with no canonical anchor.
- [ ] **`list_implementations` discoverability.** Tool takes no arguments and returns the full list — that's fine, but the description should make this explicit so callers don't try to filter. Also: consider adding a sibling `find_implementations(libraryId?, componentId?)` for the filtered case.
- [ ] **Button library audits** — highest-priority coverage gap remaining.
- [ ] **Codify "code-block" props for AI surfaces** — copy affordance, language label, line-numbers contract. Already in canon as of this re-check; verify the props match the spec's chat-message rendering needs.

### Atelier-UI follow-ups unlocked by canon coverage

Action items on the spec side that the new canon makes concrete:

- [ ] **Drop `''` from `LlmAvatarStatus`** — canon confirms no empty sentinel. Use `undefined`. Trivial breaking change; pair with v1.0 cleanup.
- [ ] **`LlmTableSpec`: drop `variant`, add independent `striped`/`bordered`/`selectable` booleans** — composability matches canon.
- [ ] **`LlmIconSpec`: decide on closed enum vs generic param.** If keeping closed: split `name` into status / navigation / action sub-enums. If opening: add `<TName extends string>` generic.
- [ ] **`LlmTextareaSpec.autoResize: boolean` → variant.** Layout contract changes; should be a variant not a flag.
- [ ] **`LlmProgressSpec`: add `linear | circular` variant axis** before any consumer ships circular progress as a separate component.
- [ ] **`LlmMenuSpec`: add `orientation: vertical | horizontal`** to align with canon variant.
- [ ] **Severity vocabulary across spec.** `LlmBadgeVariant`, `LlmAlertVariant`, `LlmToastVariant`, `LlmProgressVariant` all use `danger`. Canon uses `error`. Single-source: add a shared `LlmSeverity` type and pick one term DS-wide. Migrating to `error` aligns with canon and ARIA `role="alert"`.
- [ ] **Add missing primitives noted by canon** — at minimum `popover` and `link` (chat surface needs them); `disclosure` (single-disclosure version of accordion item) and `code-block` (chat message rendering) are very likely needed.

### Revised verdict

The 2026-05-02 audit's headline finding ("canon doesn't yet cover ~12 common DS components") is **resolved as of 2026-05-04**. The remaining work is now spec-side cleanup against newly-canonical components, plus three structural items on the canon side (button audits, `chat` canon, `list_implementations` discoverability). Recommend re-running the parity audit on a 2-week cadence until `get_changelog` returns non-null, then driving cadence off changelog entries.

