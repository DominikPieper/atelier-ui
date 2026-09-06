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
  Schulung reviews is closed.

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
    (`agenda:81,208`).
  - [ ] Gate gap: nothing cross-checks `snapshot.json.uiTokens` — its only guard
    asserts prefix counts sum to the total, which a truncated list still satisfies.
    Cheapest close: assert every `color/*`/`spacing/*`/`radius/*` name has a matching
    `--ui-*` family.
  - [ ] Gate gap: the two `preflight.mjs` copies are in sync by hand only
    (byte-identical today, re-verified, gated by nothing).
  - [ ] Gate gap: nothing stops a new page hardcoding `workshop-<fw>` again with no
    monorepo branch beside it.
  - [ ] _(Bonus, spawned by ticking L2285 above, not one of the original 130):_
    `docs/src/pages/claude-design.astro` still hand-types "twenty-four tags" and
    "17/13 ADRs" (should read 16/12) — same derive-don't-hand-type pattern as
    `gate-count.ts` (below), now cheap to copy.

## Needs an owner decision

The ones the owner and I will walk through together.

- [ ] **Confirm the lockfile flavor.** `package-lock.json` was regenerated on macOS
  for dep-batch A (Docker daemon down that day), then rewritten on Linux by the
  publish job (`7cca39c`), pruning 27 macOS-only transitive entries. What that commit
  did *not* visibly touch is ~47 `dev` ↔ `devOptional` marker flips from the same
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

- [ ] **An axis is owed for `AtlAvatarStatus` and `AtlChatStatus`.** Both unions are
  illustrated as sibling frames on the Components page rather than as a variant axis
  — `[NAME]` only derives an axis from a union ending in
  Variant/Size/Shape/Position/Orientation/Align/Role, so `Status` is never asked
  about. Two separable questions: draw the axes (design), and should the axis-word
  list include `Status` at all (gate).

- [ ] **Decide trainer-kit repo location** (Schulung M11/§6.3). Recommendation: a
  private `atelier-trainer` repo pinned to an Atelier SHA; move agenda internals into
  it, add a `LICENSE`.

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
  - [ ] A parity record is equally blind to a change on the *Figma* side — it stores
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
  - *Cross-reference:* also touches the Figma-polish collector's row-ladder
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
  access test (review §5) is widened past the trainer machine.
  - [ ] The katas themselves.
  - [ ] Schulung M2/M3 — trainer run-sheet (product, `/design-login`, prompt,
    hardcode target, flip value, fallback URL) + participant how-to (image,
    prompt→canvas, Step-5 example, opener).
  - _(Unblocked halves already shipped around this — the trainer demo,
    prerequisites 2–3 — without weakening it: the demo is trainer-machine-only and
    says so in its first sentence.)_

- [ ] **Presentation-debt p1 and p2** — blocked, unblocks when: real screen
  captures exist. p1 wants photographs of Figma's plugin menu, token dialog and
  inspect panel to replace placeholder SVGs (interim: the retired `#00BEBE` in
  `figma.astro:335` still needs fixing regardless); p2 wants a terminal capture of
  `npm run preflight` from a genuinely scaffolded single-framework workspace — the
  mock's "3 storybook rows / 15 ok" is a run the current script can't produce. p2's
  prerequisite (the two `preflight.mjs` copies byte-identical) is already met; the
  run itself is not.

- [ ] **Verify Figma *export* from claude.ai/design** — blocked, unblocks when:
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
  - [ ] `/design-sync`'s manifest is still wrong (Inter/Fira Code, two real
    phantom tokens) and still can't be re-checked from this repo — it lives in the
    external Claude Design project.
  - [ ] Re-syncing the Atelier design system in Claude Design is blocked on the
    same interactively-authenticated MCP — no script can drive it.
  - [ ] The kata and the tutorial still build the same Figma artifact (one
    Settings/Card + four `*/Starter` frames in `snapshot.json`) — giving the kata
    its own target is a Figma write. Both pages now say plainly it's the same
    frame and the kata is a timed second lap, which is the honest interim state.

## Optional / low priority

Not urgent; fix opportunistically or when touching the same area anyway.

- [ ] **Two net-zero commits** (`98e8755`, `ac3c854`) stay in git history — they
  cancel exactly, and rewriting unpushed history was blocked by the auto-mode
  classifier. Harmless; squash them if the branch is ever rebased anyway.

- [ ] **Old "Larger workstreams" leftovers** (from the original ranked roadmap;
  kept, not deleted):
  - [ ] C7 capture bound-token name/value in the Figma snapshot · C8 `check:figma`
    + freshness check (the snapshot never checks its own age; `figmaLastModified`
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
