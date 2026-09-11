# Archive — 2026-08: parity, type, and Schulung reviews

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

## Review — the row ladder, run overnight 2026-08-27

Five planned steps, all landed. `check:all` after each; at the end `run-many -t
build --skip-nx-cache`, `-t test` and `-t lint` over every project, all green,
then rebase + one push.

**What shipped.** Table cells 32/42/51 → 40/48/56, the sortable header 43 → 48,
checkbox 26 → 40, radio 32 → 40, toggle 27 → 40, accordion trigger 52 → 56. Every
component root states its own leading (20 of 29 did not). `check:geometry` grew
42 → 73 measurements, 12 → 19 boxes; `check:typeface` gained `[NO-LEADING]`.
ADR-0052 written, ADR-0041 amended. Four artboards corrected.

**Verified, not assumed.** Every box measured before and after in all three
frameworks, in headless chromium against the shipped CSS with no reset supplied.
Both new gate checks negative-tested by breaking what they exist to catch:
removing a cell's `line-height` and a root's leading each fail the gate, and
pass again on restore.

**Three things measurement contradicted.**

1. The decision record said `min-height` throughout. It is not honoured on
   `display: table-cell` — 18.5px against a 48px token — where `height` is
   defined to act as a minimum instead. Verified the cell still grows to 88.5px
   when the value wraps, so the semantics are the ones intended.
2. `* { line-height: 3 }` is the wrong probe for a row. Too strong, because a row
   may host content the app supplies and overriding its metrics is worse than the
   defect; and separately too weak, because 3 × 12–16px text fits inside a
   40–56px row without touching it — it passed a table cell whose line-height I
   had deliberately deleted. Rows now face an absolute 100px inherited leading.
3. My own scope census was wrong twice. Counting font-size rules without a
   line-height gave 148 and was the wrong question; asking the right question by
   hand then missed five components, because I accepted a leading from any rule
   mentioning `font-family` — including `.atl-input input { font-family: inherit }`.

**The unplanned find.** Angular's `<atl-option>` had no styles at all.
`atl-select.css` declares six selectors and none for an option; the rows live in
a separate component that declared none of its own, and emulated encapsulation
stops a parent's stylesheet reaching a child's template. `is-selected`,
`is-active` and `is-disabled` all rendered identically — keyboard navigation moved
a highlight nobody could see. Fixed, on the row ladder, and gated: `check:geometry`
entries can now declare `only: ['angular']`, because the native-vs-custom
divergence is real and not worth designing away.

**The weakest point.** The row/control split is now a judgement each new box has to
make, and nothing enforces which one applies — the gate checks that a box matches
the ladder it _claims_, not that it claims the right one. A row entered as a
control would pass at a wrong-but-consistent height. Breadcrumbs, the four headers,
the pagination button and the stepper circle sit outside both ladders by decision,
and that exclusion list lives in prose in ADR-0052, not in code.

**Also worth knowing.** My measuring harness produced wrong Angular numbers twice
before it produced right ones, and both times they looked plausible. `check:geometry`
had a latent form of the same bug — hostifying per directory rather than per
stylesheet — which was harmless only until `select/` held two components. Lessons in
`tasks/lessons.md`.

## Review — the type nobody was measuring, 2026-08-28

Three agents built in parallel (the snapshot capture, `check:typeface`, `check:figma`),
three skeptics re-derived each independently, and this pass fixed what they found. Nothing
in Figma was mutated at any point: every figure comes from read-only queries and from
`npm run figma:snapshot`. ADR-0080 written; ADR-0078 and ADR-0079 amended in place, because
both were accepted the same morning and both carried a claim the review disproved.

**What shipped.** `check:figma` measures the root type of three form fields for the first
time — `font-size: inherit` produced a `null` that fed a `!== null` guard, so the comparison
had never run once since it was written — and type gets its own cascade table instead of
borrowing the paint table's exclusion list. Four per-TEXT-node checks and `[NO-SIZE]` in
`check:typeface`, all five ratcheted: 206 AUTO leadings, 212 wrong-collection sizes, 257
unstyled nodes, 4 detached overrides, 8 root-type divergences, 15 prose roots with no size.
`tools/figma/text-nodes.json` is new — 566 nodes, 277 records, the family, weight, style
binding and size-variable collection that were captured nowhere before.

**Verified, not assumed.** Every check was proven by breaking what it exists to catch, with
real edits to real files, and restored: a wrong `--ui-font-size` token on `.atl-input` (dead
before the repair at exit 0, blocking after), a substitution inside one master for each of
the four text checks, a `[ROOT-TYPE]` value drifting 16 → 18, `--update-baseline` run with
an unrelated `[SET-CLIPS]` blocker in the tree, a malformed baseline, a deleted `kind`,
`font-size: inherit` on a prose root. `check:all` green, exit 0, 14 pre-existing warnings —
byte-identical to the ones HEAD prints.

**Four things measurement contradicted.**

1. **A count is not a ratchet.** Both baselines first recorded a number per directory or per
   master, and both went **green on a substitution** — fix one root, break another, the
   number never moves and nothing is printed. ADR-0079 had asserted the text checks were
   immune ("presence tests, so a count is faithful"); they were the easiest to break. The
   baselines now record the findings themselves. The file went from ~100 lines to 571, which
   is the price.
2. **The Angular branch was measuring a different population.** `check:typeface` decided a
   root by name in React and Vue and by shape in Angular, so `:host(.atl-card-content)`
   counted where the byte-identical `.atl-card-content` was invisible. `card: 4` was
   `2 + 1 + 1`. Corrected, the count is 15 — three per component, one per framework. The
   symmetry is the evidence; a cross-framework number that is not comparable is worse than
   none.
3. **`font-size: inherit` was accepted as a stated size.** The check's own message defines
   the defect as "renders every line it does not size itself at the consuming page's size",
   which is precisely what `inherit` does — and the gate called it an improvement and invited
   you to lock the deferral into the baseline forever. The same file already knew better one
   axis over (`if (value === 'inherit') continue`), and the headline finding of the analysis
   is the identical `inherit` blindness in the sibling gate.
4. **The address in the generated artifact was not an address.** `text-nodes.json` told
   consumers to key on master + path + chars; 13 keys stand for two or three records, and
   `AtlButton`'s one string `Button “Button”` covers three — one clean, two carrying the
   collection debt. Now master + path + chars + size + weight, which is unique.

**The unplanned find.** `--update-baseline` — the command every ratchet message tells you to
run — called `process.exit(0)` before the report in _both_ scripts, so it printed
`✓ baseline updated` over an unrelated blocker and recorded the baseline from the broken
tree. Neither builder noticed; it took a skeptic putting a real `[SET-CLIPS]` defect in the
tree and running the documented remedy.

**Found on the verification pass, after the agents were done.** The two ratchets did not
behave the same. `check:typeface` had been given a no-op guard — an update that changes
nothing prints `baseline unchanged` and does not write — and `check:figma` had not, so every
run of the documented remedy rewrote `generatedAt` and produced a diff over an unchanged
file. Fixed by comparing the would-be `checks` object against the recorded one before
writing. Verified both directions: a no-op leaves the file byte-identical, a real move
(one AUTO leading removed on AtlToast) still writes and reports `125 → 124 (−1)`.

**The weakest point.** The ratchets are only as good as the snapshot, and the snapshot is
only as good as its probe. **Twenty-one of the 43 masters run no `[ROOT-TYPE]` comparison at
all** — for fourteen the CSS resolves an expectation and the comparison is skipped only
because the Figma root has no single direct TEXT child. That is the same defect this whole
pass is named after, one level down, and it is accepted rather than fixed because warning
about all of them would be the unclearable warning ADR-0066 refuses. Two of the fourteen
(AtlMenu at 16px, AtlToast at 14px) state a size in CSS that nothing checks. Secondarily:
571 lines of baseline is a large `--update-baseline` diff to approve without reading, and
nothing forces anybody to read it.

## Open — the reverse direction of `check:dead-selectors` (2026-08-28)

ADR-0081 ships `[DEAD-SELECTOR]` (a class the CSS selects and no template can emit) and
deliberately **does not** ship its mirror, `[UNSTYLED-CLASS]` (a class a template emits and
no stylesheet selects). It was built and measured with the same extractor: **49 rows**, and
they are not one population, which is why no single rule fits them.

- **Deliberate unstyled markup hooks** — `radio-text` (react `atl-radio.tsx:56`, vue
  `atl-radio.vue:64`; Angular projects `<ng-content/>` and emits no such span, so any future
  rule on it silently skips Angular), `radio-input` / `radio-indicator`, `checkbox-label` /
  `input-label` / `textarea-label` / `toggle-label` / `select-label`, `tab-button` /
  `tab-panel` / `tab-panels`, `atl-menu-trigger-wrapper`, `accordion-header-content`.
- **Vestigial** — `is-touched` on seven Angular components, after ADR-0055 dropped `touched`
  from the contract; `is-selectable` on the Angular table; `atl-menu-item-chevron`.
  Whether these are supported consumer hooks or dead weight is undecided, and nothing in the
  ADRs says.
- **Extractor artifacts, not findings** — `status-` (because `AtlAvatarStatus` includes
  `''`), and `asc` / `desc`.

Blocking on that set would demand deleting markup ADR-0007 entitles the adapters to differ
on; warning on it is the unclearable warning ADR-0066 refuses. What would make it gateable is
deciding the middle bucket first — is a class with no rule a public hook or a leftover? —
which is an ADR, not a sweep.

Two findings the gate surfaced and left as `gap` exemptions in `DEAD_SELECTOR_EXEMPT`, both
needing a decision rather than an edit:

- `orientation-vertical` / `orientation-horizontal` are styled in all three radio-group
  stylesheets and emitted only by React, which declares `orientation` in its own props
  interface — `AtlRadioGroupSpec` has no such field. Promote the axis to the spec and
  implement it three times, or drop it from React and delete six rules.
- `angular:table:atl-checkbox` — `atl-table.css:157` centres the select cell via
  `.atl-tr-select-cell .atl-checkbox label`, but Angular renders the child as the element
  `<atl-checkbox>` while React and Vue emit `atl-checkbox` as a class. Give the Angular host
  the class hook, or select the element.

**The state classes are not one population, and one slice is a contract question.** Filing
all 49 as "unstyled markup hooks" undersells it. A cross-framework comparison of `is-*`
emission found `is-checked` emitted by Angular's and React's checkbox and not Vue's,
`is-open` by Angular's and React's dialog and not Vue's, and `is-active` / `is-open` /
`is-selected` by Angular's select alone. Nothing selects any of them, so the gate is right
to be green — but a consumer writing `.atl-checkbox.is-checked` gets three different answers
from three adapters. That is the Vue toggle's defect pointed the other way, with the CSS not
yet written. The decision to take first: **are the `is-*` state classes public contract or
private implementation?** If public, they belong in `libs/spec` and all three adapters emit
them unconditionally; if private, the gate is complete as it stands and the divergence is
free. Nothing in the ADRs says, and `[UNSTYLED-CLASS]` cannot be designed until it does.

## Open — parity drift, after ADR-0082 (2026-08-28)

- [x] ~~**Ten parity records are owed a bridge-backed re-verify**~~ — done 2026-08-28, in the
      session that made the ADR-0081 repair, with the bridge open. AtlInput, AtlMenu,
      AtlCheckbox, AtlToggle, AtlTextarea, AtlRadioGroup, AtlRadio, AtlPagination,
      AtlCombobox, AtlMenuItem: `figma_check_design_parity` per master against a `codeSpec`
      read from the source, then `parity:record`. All ten re-recorded; `npm run check:parity`
      green again. **The verify was not a formality** — it returned twenty divergences, and
      what they are is the section below. A parity stamp says "verified after the files last
      changed" (ADR-0064), not "the two sides agree" — but recording without writing the
      divergences down would have buried fifteen findings.
- [ ] **`inputsHash` cannot tell a rendered file from a test file.**
      `lib/parity-inputs.js` `inputFiles()` walks _every_ file under
      `libs/{angular,react,vue}/src/lib/<module>/`, so appending a comment to
      `atl-button.spec.tsx` turns AtlButton into a DRIFT finding — proven, then reverted.
      ADR-0024 §2 describes the set as "implementation, CSS, story, and the component-local
      spec", and a `*.spec.tsx` is none of those. Narrowing it needs a migration, which is
      why it is a task and not a patch: changing the hash function invalidates all 37 records
      at once, so each record's hash has to be recomputed **at its own `verifiedSha`** (old
      definition matching there proves the record was valid; the new definition at that sha
      is then the equivalent) before the current value means anything. Worth doing when
      somebody is next in this file; it clears none of the ten above.

## Open — what the ten-master parity re-verify found (2026-08-28)

Three agents re-ran `figma_check_design_parity` over the ten masters, each against a
`codeSpec` read from the source, and a fourth re-ran the three most consequential itself.
Twenty divergences. The score is deliberately ignored — ADR-0024's amendment records three
runs on one commit returning 70, 52 and 83 — so what follows is the discrepancy list, judged
one item at a time. Everything here is **Figma-side or gate-side**; nothing found argues the
code is wrong, except where said.

**Four gate blind spots, each of which is why one of the groups below went unseen.**

- [ ] **`[ROOT-BOX]`'s gap comparison is unreachable for the four form-row masters.** It sits
      at `check-figma.js:1230`, _inside_ `for (const entry of ROOT_PAINT)`, and AtlCheckbox,
      AtlToggle, AtlRadio and AtlRadioGroup are all excluded from `ROOT_PAINT` for the paint
      reason ADR-0079 split type out of. All four bind `spacing/2` (8px) as the root
      itemSpacing while all three stylesheets state `gap: var(--ui-spacing-3)` = 12px. Same
      shape as ADR-0079: an exclusion justified on one axis silently taking another with it.
- [ ] **`[LAYER-PAINT]` never compares a stroke colour when the CSS border is transparent.**
      The layer border block reads `if (!/transparent|none/.test(border)) wantStroke = …`, so
      for `.page-btn { border: var(--ui-border-width) solid transparent }` `wantStroke` stays
      `undefined` and the guard below skips. Six visible `color/border` strokes on
      AtlPagination's page buttons pass because of it. A transparent border is a _declared_
      value, not a missing one — the gate should compare it and expect no paint.
- [ ] **AtlMenu's `ROOT_PAINT` entry has no `{variant}` template** (`check-figma.js:598`,
      `cascade: ['.atl-menu']`), though the mechanism exists and other entries use it. So
      `variant=compact` is compared against the _base_ rule's 8px block padding and passes,
      while the rule that actually applies, `.atl-menu.variant-compact`, says 4px.
- [ ] **`AtlRadioGroup`'s parity record hashes the wrong directory — verified by hand.**
      `COMPONENT_METADATA_REGISTRY` maps `AtlRadioGroupSpec → 'radio'`
      (`libs/spec/src/metadata/index.ts:43`), so `computeInputsHash('radio')` backs the
      record. Its `inputs` list contains **no** `radio-group/` path and its `inputsHash` is
      **byte-identical** to AtlRadio's (`sha256:9d625d0c…`, checked after today's re-record).
      Every change under `libs/*/src/lib/radio-group/` is invisible to the gate, including
      today's. Two masters cannot share one hash and both mean something.

**The form-row masters never moved to the row ladder.**

- [ ] **AtlToggle and AtlCheckbox hug at 24px and AtlRadio at 28px (4 + 20 + 4), against a
      code row of `--ui-row-height-sm` = 40px.** ADR-0052's review records the _code_ side of
      exactly this — "checkbox 26 → 40, radio 32 → 40, toggle 27 → 40" — and its final
      consequence records only that the row ladder has no Figma Variables yet. That the
      masters were never moved is recorded nowhere, and nothing measures it: `check:geometry`
      is code-only and `[ROOT-BOX]` cannot reach these four (above). AtlRadio also pads 4/4
      (`spacing/1`) where the CSS states `padding-block: 0` and expresses the inset as a
      `min-height` — the same fact seen from the other side.

**Three masters state invalid by hue alone, which ADR-0055 forbids.**

- [ ] **AtlInput, AtlTextarea and AtlCombobox have no non-colour invalid indicator in Figma.**
      `iconInstanceNames` is empty for the first two; AtlCombobox's is
      `[chevron-down, chevron-up, check]` with no `danger`. AtlInput's `state=invalid`
      (129:29) holds three children — `_readonly-surface`, the TEXT node, `_disabled-overlay`
      — and reddens the root stroke. ADR-0055 made the `AtlIcon danger` indicator mandatory
      in all four fields for WCAG 1.4.1, the code carries it in all three frameworks, and
      **AtlInput's own master description already claims it** ("carried by an AtlIcon danger
      inside the field as well as by the border colour"). `[BOOL-INERT]` stays green for
      AtlCombobox because `invalid` does toggle a layer — it just toggles half the treatment.
      Placing it became possible with the Icon masters of ADR-0057.
- [ ] **ADR-0055's "nothing moves when the state flips" does not hold for two of the four.**
      `.atl-input` and `.atl-textarea` change `padding-right` 1rem → 2.25rem with the invalid
      state, so the text box narrows by 20px when it flips — identical in all three
      frameworks. The ADR states the space is reserved unconditionally and says it was
      measured; that holds for AtlSelect and AtlCombobox, whose 56px inline-end slot is
      unconditional, and not for these two. Either reserve it here too, or correct the ADR.

**AtlTextarea's master disagrees with itself.**

- [ ] **`radius/md` (10px) on `state=default` and `radius/sm` (8px) on the other four**, while
      no CSS rule changes the radius. Plus: the hover variant's root stroke is an **unbound
      RAW colour** — the only raw paint on any of the three field masters, the class ADR-0061
      repaired for 34 `_invalid-border` rectangles — and the invalid variant binds
      `color/danger` where AtlInput binds `color/input-border-invalid` and the CSS names the
      latter. Nothing renders differently for the last one
      (`--ui-color-input-border-invalid: var(--ui-color-danger)`), so it is naming drift, but
      "bound is not the same as bound correctly" (ADR-0060) is precisely what `[ROOT-PAINT]`
      exists to catch and it cannot see any of these: it compares `state=default` only and
      warns that it skipped the other four.

**AtlCombobox's panel and AtlPagination's buttons.**

- [ ] **The combobox master stacks its panel 4px below the field; the code uses 8px.** Root
      auto-layout gap 4, bound `spacing/1`, against `top: calc(100% + var(--ui-spacing-2))`
      and `.errors { margin-top: var(--ui-spacing-2) }` in all three. Same layer, four more:
      fill `color/surface` (#ffffff) vs `--ui-color-surface-raised` (#f8fafc), radius
      `radius/sm` (8px) vs `--ui-radius-md` (10px), padding 4px on four sides vs 8px block /
      0 inline, and a 4px row gap the CSS does not have. The panel exists only in
      `state=open`, which is the wholesale skip already recorded above for type — these are
      the paint deltas behind the same skip, recorded nowhere.
- [ ] **AtlPagination: four divergences on the page buttons.** Six of seven draw a visible 1px
      `color/border` stroke where `.page-btn` paints a _transparent_ border (which exists to
      reserve the box so `.is-active`'s `border-color` does not shift layout). Number text is
      `color/text-muted` (#475569) against `--ui-color-text` (#0f172a) — invisible to
      `[LAYER-PAINT]`, which compares the named FRAME while the colour lives on the TEXT
      child. Inactive numbers are Regular 400 against `--ui-font-weight-medium` (500); the
      current page is Medium 500 against `--ui-font-weight-semibold` (600).
- [ ] **ADR-0063's page-button fix was half-applied, and its record overstates it.** ADR-0063
      §4 and `tasks/todo.md` both say the 33 divergences were found _and fixed_, naming "the
      page buttons painted a fill and a border where `.page-btn` sets both `transparent`".
      The fill was removed from the six inactive buttons; the stroke was not. Nothing has
      contradicted the record since, because the gate cannot see it (blind spot above).

**Three adapters, three answers — the Vue-toggle defect pointed at other axes.**

- [ ] **Radio groups lay out in a row in Angular and Vue and in a column in React.**
      `.atl-radio-group` / `:host` is `display: flex` with no `flex-direction`, so the default
      is `row`; `flex-direction: column` lives only under `.orientation-vertical`, which only
      React emits (`atl-radio-group.tsx:148`) and whose default in React's own props
      interface is `'vertical'`. A three-option group therefore renders stacked in React and
      side-by-side in the other two. This is the rendered consequence of the
      `orientation-*` `[GAP]` exemption recorded above — that entry frames it as an
      undecided axis; it is also a live divergence today.
- [ ] **Vue's checkbox and toggle still lack `aria-required`.** Angular sets
      `[attr.aria-required]` and no native `required`; React sets both; Vue sets only the
      native `:required` (`atl-checkbox.vue:64`, `atl-toggle.vue:48`). The same bug was found
      and fixed for `atl-input.vue` and recorded in this file; the sibling controls were not
      swept at the time.
- [ ] **AtlRadioGroup's error region is three shapes in ARIA**, even though the class shape
      now matches. Angular: `<div class=errors [id] aria-live=polite>` plus
      `aria-describedby` on the host. React: `role=alert aria-live=polite`, no id, no
      describedby. Vue: `role=alert`, no `aria-live`, no id, no describedby. The element and
      class contract holds; the announcement contract does not.
- [ ] **The three adapters disagree on the menu trigger-to-panel offset, and the ADR-0081
      deletion removed the last place the intent was written.** React and Vue position the
      panel at `top: calc(100% + var(--ui-spacing-2))` — 8px below the trigger. Angular's
      `AtlMenuTrigger` passes no position strategy or offset to `CdkMenuTrigger`, so the CDK
      default applies. Deleting Angular's inert `.atl-menu-panel` rule was correct on its own
      terms (no such element is ever rendered), but it also deleted the only statement of
      what the offset should be. Give the Angular trigger an explicit offset matching the
      other two, or record that the CDK default is the intended answer.

## Open — one semver-major type change, unreleased (2026-08-28)

- [ ] **`AtlRadioGroupContext.invalid` became required.** `libs/angular/src/lib/radio-group/
atl-radio-group.token.ts` gains `invalid: Signal<boolean>` with no `?`, and the
      interface is exported from the public barrel (`libs/angular/src/index.ts:19`). The only
      in-repo implementor is `AtlRadioGroup`, which already declared `invalid` and needed no
      change — but any outside implementor of the interface breaks. It is the right shape
      (React's and Vue's contexts both require it, and the Angular radio could not read its
      group's invalid state without it), and it is a **breaking change to a published type**
      that needs a semver-major note. Nothing in the diff or the ADRs said so until now.

## Review — the join nobody was checking, 2026-08-28 (second pass)

A builder shipped `check:dead-selectors` and repaired fourteen dead rules; two skeptics
re-derived the whole thing independently; this pass fixed what they found and recorded the
two decisions the work forced. ADR-0082 written, ADR-0081 amended in place (it was accepted
the same morning and carried three claims the review disproved), ADR-0024's §4 annotated.

**What shipped.** `check:parity` splits into two modes: the direct invocation still BLOCKS
on drift, and `check:all` runs `check:parity:report` (`--report`), which prints the banner,
every drifted component and the exact `parity:record` command, and exits 0. The
`check-dead-selectors` cross-directory rescue is rebuilt on the **render relation** — a
class is live from another directory only when one renders the other — which closes a false
positive and a false negative at once. Vue's checkbox and toggle finally associate their
error text (`useId()` + `aria-describedby`), matching what all three Angular and all three
React equivalents already did and what Vue's own input and textarea already did.
`@vue/compiler-sfc` is recorded in `package-lock.json`. The PR template names the one place
the parity blocker is now enforced.

**Verified, not assumed.** `npm run check:all` → exit 0 (29 gates; `check:dead-selectors`
5 GAP warnings over 858 selectors in 89 stylesheets, `check:parity:report` 10 DRIFT
warnings, `check:figma` 14 warnings — the last two byte-comparable to what HEAD prints).
`npx nx run-many -t test --projects=angular,react,vue --skip-nx-cache` → exit 0, 1351 tests
(angular 584, react 439, vue 328). `npx nx run-many -t lint` on the same three → exit 0.
Both gate changes proven by probe and reverted: `.probe-fp-child` styled in
`react/icon/atl-icon.css` and emitted from `atl-input.tsx` was a blocker before and passes
after; `.atl-menu .atl-avatar` appended to `react/menu/atl-menu.css` passed before and is a
blocker after. Real defects still caught: reverting the Vue toggle's `is-checked` binding
and re-breaking the combobox rename each named the exact file and line. `// probe` appended
to `react/button/atl-button.spec.tsx` made AtlButton a DRIFT blocker, then did not.

**Four things measurement contradicted.**

1. **The "only cross-directory rescue" was a tautology.** It asked whether a class is
   another directory's root _and_ whether that directory emits it — but a component always
   emits its own root, so the second clause is never false, and every `.atl-*` root was live
   in every directory of its framework. ADR-0081 called it "exactly three cases": that is
   how many it fires on, not how many it can forgive, which is about forty per framework.
2. **The false-positive direction was worse than the false-negative one.** A class a parent
   puts on a child component's element, styled in the child's own sheet, was a **blocker on
   correct markup**, and its remediation text told the author to delete a live rule. It
   fires on nothing here only because all 33 such sites happen to style the hook in the
   emitting component's sheet. Running the gate could never have found it; a constructed
   probe did. A new blocker needs its false positives probed as hard as its false negatives.
3. **`check:parity`'s promotion into `check:all` has never been load-bearing.** Its own
   header still said "Not in `check:all`/CI/pre-push" five weeks after `b8935c8` put it
   there. Of the last four commits touching a component directory, three re-recorded parity
   and the fourth (`64277c3`, 31 libs files, no `parity.json`) passed only because
   `meta.redesignPhase.active` was `true` that day. The switch closed 2026-08-27; this is
   the first change since that could not open the bridge, and it went straight to ten
   unclearable blockers.
4. **The Vue toggle did not regress — it was born broken.** `892ac6f` (2026-03-21, "Add
   vue") shipped `.llm-toggle.is-checked .track` in the stylesheet and a template binding
   only `is-invalid` and `is-disabled`. There is no commit where they agreed. 0.0.5 went out
   two days later and every Vue release through `v0.2.9` shipped a switch that cannot show
   its on state — 160 days — with the unit tests green the whole time, because they asserted
   the native input's `checked` property and never the class the paint hangs on.

**The unplanned find.** `inputsHash` binds every file under the component directory,
`*.spec.*` included, so a unit test can invalidate a design verification for a change the
design cannot see. That is what turned a CSS repair plus its tests into ten DRIFT blockers,
and it is the reason ADR-0082 is a decision about the chain rather than a patch to the hash:
narrowing the hash invalidates all 37 records at once and needs a migration first.

**The weakest point.** ADR-0082 buys a green chain by removing the only automated teeth
design drift had, and replaces them with a line in a pull-request template. A checklist is
not a gate — this repo's own history is a list of things that were true until nobody
checked them — and the compensating control is weaker than what it replaces. The honest
defence is that the teeth it removes could not bite: no CI runner can clear a DRIFT blocker,
so what was lost was a red build, not an enforcement. The real fix is a parity check that
runs without the bridge, and nothing here moves toward one. Secondarily: the render relation
is read from tag names in source text, so a directory that merely _mentions_ `<AtlIcon>` in
a comment counts as rendering it — the forgiving direction, unmeasured beyond "the finding
count did not move".

## Open — Schulung: after the B1–B4 repairs (2026-08-29)

The four blockers from tasks/schulung-review-2026-08-28.md §3 are fixed in the
tree (struck through there, each with its fix note).

- [x] ~~**The deploy was dead, and had been since 2026-08-26**~~ — found and fixed
      2026-08-29. The worker fix could not ship because _every_ Cloudflare build had
      been failing for three days: the Angular Storybook build died with seven
      `MISSING_EXPORT` errors after `cbef32b` pruned `@angular/animations`
      ("deprecated upstream, zero source imports, optional peer" — all true of this
      repo's source, none true of `@storybook/angular`, whose client dynamic-imports
      `@angular/platform-browser/animations` in a try/catch to warn about
      `BrowserAnimationsModule`). The try/catch protects the runtime and does nothing
      for the build: Rollup walks the dynamic import anyway. Stubbed to an empty
      module in `libs/angular/.storybook/main.ts`; reinstalling the deprecated package
      was rejected. Filtering the entry out of `optimizeDeps.include` — where
      `@analogjs/storybook-angular` also hardcodes it — was measured and does nothing,
      because this is a build-graph import, not pre-bundling.
- [x] ~~**Nothing in the repo could see it**~~ — fixed in the same pass. `build-storybook`
      is an nx target on all three libs and CI ran `-t build` only, so the three
      Storybook builds existed nowhere but the `wrangler.jsonc` build command, whose
      failure surfaces in a Cloudflare log nobody reads. Three days of green CI over a
      dead deploy, and the live site served pre-08-26 content the whole time — which is
      why yesterday's B1–B4 kata fixes never reached a participant. CI now runs
      `-t build,build-storybook`. **This is the reusable lesson, and it is ADR-0080's
      one more time: a build the deploy depends on has to run where somebody sees it
      break.** Worth an ADR if the pattern recurs a third time.
- [x] ~~**Re-verify against production once the build lands**~~ — done 2026-08-29.
      `npm run preflight` in this clone: "All hard checks passed · 14 ok, 0 warning(s)",
      including real JSON-RPC probes of all three hosted storybook endpoints at HTTP 200.
      Live: `list-all-documentation` on the **Angular** endpoint returns 29 components +
      4 MDX docs, and `get-documentation('components-inputs-atltoggle')` returns real
      props. ADR-0083 holds in production.
- [ ] **`@angular/animations` is not the only optional peer a prune could take.** The
      dep-prune reasoning that failed here — "zero source imports" — is sound about our
      code and blind to what a dev-dependency reaches for at build time. No gate checks
      that. Cheap partial answer now that CI builds Storybook: a prune that breaks a
      builder fails the PR. The general case (a tool's guarded dynamic import) has no
      check and probably does not need one; recorded so the next prune's author reads
      this before trusting "zero source imports".

## Open — Schulung: after the M1–M15 pass (2026-08-29)

All 4 blockers and all 15 majors from `tasks/schulung-review-2026-08-28.md` are closed
(three of them _overtaken_ rather than fixed — M3, M4, M7 — and recorded that way there,
along with eight defects the repair pass itself introduced or uncovered). Flows 1–7 are
repaired. `npm run check:all` exit 0, `npx nx build docs` 59 pages.

One decision came out of it: **ADR-0084 — two environments, one canonical per audience**
(clone for the two-day cohort, scaffold for the self-serve reader, both documented, an
explicit branch on the pages that serve both). Nothing enforces it; see its Consequences.

### Blocked on a Figma write

- [ ] **The Figma-side Instructions text overstates the token binding.** Node `703:333`
      on 🛠️ Workshop-Templates says "every fill, padding, and radius is bound to a
      UI-Tokens variable". Measured live: `Avatar / Starter` (`703:355`) binds only
      `fills` and `strokes` — no padding, no radius. The four other frames do bind all of
      it. The German docs prose was softened to match reality; the Figma text still
      carries the original claim, and the two now disagree. Either soften the Figma text
      or bind Avatar's corner radius and revert the prose. **A Figma write — out of scope
      for the docs pass that found it.**

### Gate gaps — known, cheap, deliberately not built mid-pass

- [ ] **Nothing cross-checks `snapshot.json.uiTokens`.** Its only guard asserts the prefix
      counts sum to the total, which a _truncated_ list satisfies — the pre-fix snapshot
      held 50 names summing cleanly to 50, and the /figma census read wrong-but-consistent
      for as long as nobody looked. `docs/src/lib/figma-snapshot.ts`'s comment ("neither
      number can rot again once it is derived from the snapshot") claims more than the code
      enforces. Cheapest close: assert every `color/*`, `spacing/*`, `radius/*` name has a
      matching `--ui-*` family in `tokens.css`, and ratchet the total the way ADR-0078
      already does. Then run one real `npm run figma:snapshot` through the new paging loop
      — it has still never been exercised end-to-end against live Figma.
- [ ] **The two `preflight.mjs` copies are in sync by hand.** Byte-identical today
      (re-verified), gated by nothing. n14's second half is still open.
- [ ] **Nothing stops a new page hardcoding `workshop-<fw>` again** with no monorepo branch
      beside it — the exact defect ADR-0084 closes by convention. The check is possible and
      was judged not worth its false-positive rate; recorded as the option, not built.

### Unverified — flagged so it is not mistaken for checked

- [ ] **The Vue mount hint has never been confirmed against a real scaffold.**
      `first-component.astro` and `tutorial.astro` both tell a Vue participant to edit
      `workshop-vue/src/views/HomeView.vue` and replace `<NxWelcome />`. `@nx/vue` is not
      in `node_modules`, so this was never read from generator source — unlike the Angular
      and React hints, which were. Scaffold one Vue workspace before the first workshop.
- [ ] **`workshop/` is untracked and unignored.** The whole M12 fix — five files, ~700
      lines — is not in git, and the agenda links to those files by relative path. Commit
      it.

### Still open from the review — unchanged by this pass

- [x] ~~**Minors:** n2, n4, n6, n7, n10, n12~~ — closed in the following pass, together
      with n3, n9, n15 and n16. See the next section for what that pass left behind.
      The gate-failure troubleshooting entry n5 asked for is **still not written**.
- [x] ~~**Presentation debt p3, p4, p5**~~ — closed in the following pass.
- [ ] **Presentation debt p1 and p2 stay open, and no agent pass can close them.** Both
      need real screen captures: p1 wants photographs of Figma's plugin menu, token dialog
      and inspect panel to replace the placeholder SVGs (and, interim, the retired
      `#00BEBE` in `figma.astro:335` fixed); p2 wants a terminal capture of
      `npm run preflight` from a genuinely scaffolded single-framework workspace, because
      the mock's "3 storybook rows / 15 ok" is a run the current script cannot produce.
      n14's prerequisite for p2 is met (the two copies are byte-identical); the run is not.
- [ ] **Claude Design participant katas** stay blocked on the widened per-seat test
      (§2.4 item 1 of the review). Unchanged and deliberately not shipped. **2026-08-29:**
      the two _unblocked_ halves shipped around them and did not weaken the blocker — the
      trainer demo is trainer-machine-only precisely because the seat question is open, and
      the agenda says so in the demo's first sentence.
- [x] ~~**Publish the Claude Design track — chapter + trainer demo**~~ (done 2026-08-29,
      ADR-0032 executed, no new decision). `docs/src/pages/claude-design.astro` is the
      Explanation chapter ADR-0032 called for: off the workshop track, beside
      `/design-principles`, `workshop-track.ts` untouched on purpose. Tag 1 Block 04 gained
      the ~12-min "Drei Richtungen" trainer demo in both German files, funded inside the
      block without moving its boundary. The fence runs in the honest direction — hardcode a
      colour in an artboard, `check:artboard-palette` stays **green**, then redden the
      generated sheet and `git checkout` it back.
- [x] ~~**Prerequisites 2 and 3 of review §2.4**~~ (closed 2026-08-29). The
      `atelier-design` skill's token sheet now declares Instrument Sans / Instrument Serif /
      JetBrains Mono and is generated by `sync-tokens.mjs`; `tasks/claude-design-prompt.md`
      reads 29 in both places. Prerequisites 1, 4, 5, 6 and 7 all gate katas and are untouched.

## Open — Schulung: after the minors + presentation-debt pass (2026-08-29)

With this pass `tasks/schulung-review-2026-08-28.md` is **fully closed except p1 and p2**:
4/4 blockers, 15/15 majors, 16/16 minors, and 3 of 5 presentation-debt items. Three more
majors surfaced during the pass and were fixed with it (r9–r11 in that file): the German
curriculum still taught 10.4 as the current release, /workshop's post-setup aside never
linked /design-to-code after the track reorder, and install.astro's new intro over-claimed
what the scaffold writes into `src/styles.css`. Two of the closed minors were closed
_against_ the audit rather than with it — n4's and n9's Fix columns were wrong as written,
and following either would have shipped a false instruction; both rows now say so.

Gates: `npm run check:all` exit 0, `npx nx build docs` exit 0 (60 pages),
`npx nx run-many -t test,lint --projects=angular,react,vue` exit 0.

**No ADR was written for this pass**, deliberately: the n4 experiment changed no decision.
Seven Storybook builds on the pinned 10.5.10 confirmed that Angular and Vue emit no
`components.json` under either spelling of the flag and that React emits one even with the
`features` block deleted — so ADR-0083's React-manifest substitution remains necessary and
unchanged, and the config edit is a correctness fix, not a decision. ADR-0084 is untouched.

### Left behind by this pass

- [ ] **No gate typechecks the three `libs/*/.storybook/tsconfig.json` projects.** This is
      the surface that let n4's misspelled `experimentalComponentManifest` survive, and it
      still hides at least one real error: `npx tsc -p libs/react/.storybook/tsconfig.json
--noEmit` → `atl-stepper.stories.tsx(88,35): TS2322` ("vertical" not assignable to
      "horizontal"). Invisible to `npm run check:all` and to `nx run-many -t test,lint`,
      both green. Close it by adding a typecheck target over the three `.storybook`
      projects — and budget for the story-file errors it surfaces, which is why it was not
      done inside a verification pass.
- [x] **Decide whether the Netlify deploy target is dead.** Decided 2026-09-06: dead,
      confirmed and removed. The owner confirmed everything runs on Cloudflare
      (`curl -sI https://atelier.pieper.io/` returns `server: cloudflare` with a `cf-ray`
      header and no `x-nf-*`). Deleted `netlify.toml` and `netlify/` — the MCP handlers
      under `netlify/functions/` carried the exact `basename(path)` defect Wave 3 fixed in
      `worker/mcp.ts`, and `netlify.toml`'s `/storybook-*/mcp` redirects made them look
      live to anyone debugging that path; `netlify/edge-functions/markdown-negotiation.ts`'s
      last change only added the `NETLIFY-ONLY` header, no functional work to port.
      Verified no gate under `tools/scripts/` or CI workflow reads either path before
      deleting. `README.md`'s repo-structure listing and deploy-target line now point at
      `wrangler.jsonc` / `worker/` instead.
- [ ] **The kata and the tutorial still build the same Figma artifact** (n15's second
      half). `tools/figma/snapshot.json`'s `referencedNodes` holds exactly one
      Settings / Card (`936:2954`) beside four `*/Starter` frames, so giving the kata its
      own target is a **Figma write** — the same class of work as the `703:333` Instructions
      text above. Both pages now say plainly that it is the same frame and that the kata is
      a timed second lap, which is the honest version of the current state.
- [ ] **`libs/create-workspace`'s token-vendoring comment is stale in one clause.**
      `preset.ts:108-110` justifies the vendored copy partly with "those published packages
      don't ship tokens.css" — but `libs/angular/package.json` exports
      `./styles/tokens.css` (via `ng-package.json` assets) and the built React/Vue packages
      carry `styles/tokens.css` too. Reason (b) — that editing colours inside `node_modules`
      is a bad workshop experience — carries the decision on its own. Comment-only; the
      generator's behaviour is right and `/install` now documents both paths.

---
