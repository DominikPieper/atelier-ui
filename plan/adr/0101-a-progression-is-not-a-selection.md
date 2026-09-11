---
status: accepted
date: 2026-09-06
sources:
  - tools/figma/snapshot.json (`Navigation/AtlStepper` master description — "A11y: ol with aria-label naming the flow; current step aria-current=\"step\"." — the source this ADR follows)
  - libs/spec/src/metadata/stepper.metadata.ts
  - libs/angular/src/lib/stepper/atl-stepper.ts, libs/react/src/lib/stepper/atl-stepper.tsx, libs/vue/src/lib/stepper/atl-stepper.vue + atl-step.vue
  - tools/parity/a11y/atl-stepper.angular.json, tools/parity/a11y/atl-stepper.react.json, tools/parity/a11y/atl-stepper.vue.json
  - libs/react/src/lib/breadcrumbs/atl-breadcrumbs.tsx, libs/react/src/lib/pagination/atl-pagination.tsx (the `nav`/`ol role="list"`/native-`disabled` precedent this change follows)
  - plan/adr/0100-a-pseudo-element-the-icon-set-cannot-reach.md (source of the `role="list"` + Safari/VoiceOver precedent this ADR reuses, untouched otherwise)
  - tasks/todo.md (the three-way disagreement entry this closes)
---

# ADR-0101: A progression is not a selection

## Status

Accepted. `AtlStepper`'s header is now an `<ol role="list" aria-label="Progress">`
of `<li>` step items in all three adapters (Angular, React, Vue), matching the
Figma master's own description. `role="tablist"`/`"tab"`/`"tabpanel"` and the
`aria-selected`/`aria-controls`/roving-`tabindex` wiring that went with them are
gone.

## Context

All three framework adapters implemented `AtlStepper`'s header as a tab widget:
`role="tablist"` on the container, `role="tab"` + `aria-selected` +
`aria-controls` + `tabindex="0"`/`"-1"` on each step circle, `role="tabpanel"`
on the content region. `libs/spec/src/metadata/stepper.metadata.ts` was
corrected to say `role: 'tablist'` in the immediately preceding commit
(`f6bc9cf`, today), specifically because that is what the three adapters
already rendered — a factual correction to match the code, not a decision that
the code's pattern was the right one. That commit said so explicitly: "the
stepper metadata reads tablist here because that is what the markup is today.
Both change together in the next commit." This ADR is that next commit.

**No ADR ever decided the tab-shaped markup.** `plan/adr/` was searched for it;
the only hits mentioning `AtlStepper` alongside "tablist" (ADR-0063, ADR-0068)
are about `AtlTabGroup`'s own `.tablist` CSS layer, not about `AtlStepper`.
`tasks/todo.md`'s own history of the metadata correction — "Now a three-way
disagreement, not two" — treats the tablist pattern as an established fact to
reconcile Figma against, not as a decision anyone had weighed alternatives for.
As far as this repo's record shows, the tab widget was simply the first shape
three independent implementations converged on, never examined against what
the component actually does.

The Figma master (`Navigation/AtlStepper`, node `421:505`) has said something
different all along: "A11y: `ol` with `aria-label` naming the flow; current
step `aria-current="step"`. Each step's clickability reflects `linear` +
completed state." Three adapters agreeing with each other is not, on its own,
evidence that they are right and Figma is stale — the question is which
pattern the component's own semantics call for.

**They call for a list, not a tab strip, for two independent reasons:**

1. **The component's own metadata already draws this line.**
   `stepper.metadata.ts`'s first anti-pattern is: "Navigating between sibling
   sections that have no inherent order — use `AtlTabGroup`, tabs imply
   parallel views, steppers imply progression." `AtlTabGroup` exists
   specifically for the case `AtlStepper` says not to reach for. Implementing
   the stepper as a tablist reintroduces, in markup, the exact semantics its
   own documentation tells the reader to use a different component for. And
   `linear` — "only the active and completed steps are clickable" — is a
   progression model: a boundary that only moves forward as steps complete.
   Every ARIA tab widget, by contrast, keeps every tab reachable at all times;
   there is no ARIA concept of a tab becoming unreachable because an earlier
   one isn't done. The two models don't actually match; only their surface
   (a row of circular buttons with connecting lines) does.

2. **The tablist pattern carries an obligation the code never paid.** The WAI-
   ARIA APG's tab pattern requires roving `tabindex` plus `ArrowLeft`/
   `ArrowRight` (or `ArrowUp`/`ArrowDown` for vertical) to move focus between
   tabs — ARIA composite widgets don't work without it, because only one tab
   ever carries `tabindex="0"` at a time. All three adapters set exactly that
   roving `tabindex` (`activeStep() === i ? 0 : -1`) and implemented no
   keydown handler anywhere. The practical consequence, verified below: a
   keyboard user tabbing to the stepper could reach _only the currently active
   step_ — every other step, including ones perfectly legal to click with a
   mouse, was unreachable by keyboard at all. Declaring `tablist` made that gap
   a debt every adapter was carrying and none was paying down. A plain list of
   buttons carries no such obligation: ARIA's list role is not a composite
   widget, so every focusable list item is expected to sit in normal Tab order
   — the debt does not move to a different place, it stops existing.

This also closes `tasks/todo.md`'s "Now a three-way disagreement, not two"
item under AtlStepper's Figma-master entry: code, metadata and Figma disagreed
on the header's role. After this change code and metadata match Figma, and no
Figma edit is needed — Figma was right. The two adjacent, unrelated open items
under the same entry (the 16px root padding, and the missing focus/disabled
variants and a11y annotations in the master's own description) are untouched
and stay open.

## Decision

**Header markup**, all three adapters: `<ol role="list" aria-label="Progress">`
replaces `<div role="tablist">`. Each step is an `<li class="step-item">`
(was a bare `<div>`); the decorative connector between steps is also an
`<li aria-hidden="true" class="step-connector">`, not a sibling `<div>` — an
`<ol>`'s content model is `<li>` elements, and `aria-hidden` removes it from
the accessibility tree exactly as before, verified below. `role="list"` is
declared explicitly rather than left implicit, following the same
Safari/VoiceOver precedent ADR-0100 recorded for `AtlBreadcrumbs`: an unstyled
(`list-style: none`) `<ol>`/`<ul>` with no explicit role is the documented case
where a browser can drop the implicit list semantics.

**The step circle stays a real `<button>`, always** — for both the active step
and every reachable one, not only the active step as the roving-tabindex
tablist pattern required. `aria-label` (unchanged) still supplies its
accessible name, since the circle's visible content is a number or a
checkmark/error icon, not the label text. `role="tab"`, `aria-selected`,
`aria-controls` and the manual `tabindex` toggling are all removed — nothing
sets `tabindex` at all now, so every non-disabled button follows ordinary DOM
Tab order. `aria-current="step"` is set on the active step's button (mirroring
where `AtlBreadcrumbs` already puts `aria-current="page"` — on the
content-bearing element, not the enclosing `<li>` — for consistency across the
library's list-shaped components).

**Reachability decides `disabled`, not element type.** Each adapter now
computes a single `isReachable(index)` — extracted from the pre-existing
`goTo()` guard so the same rule drives both the click gate and the rendered
button's native `disabled` attribute: not itself `disabled`, and — in `linear`
mode — either at/behind the active step, or ahead of it with every step before
it completed or optional. A step that fails this check is a real `<button
disabled>`, the same mechanism `AtlPagination` already uses for its
out-of-range prev/next buttons, rather than a second element type (a `<span>`)
standing in for "not clickable yet." A native `disabled` button is dropped
from the Tab order and cannot be activated by mouse or keyboard, by the HTML
spec, in every engine — no bespoke focus-management code to maintain, and no
new CSS: `.step-circle:disabled` already existed for the `disabled` step prop
and needs no `is-locked`-style twin, because a step that isn't reachable yet
should look like an ordinary pending step, not a specially "disabled" one —
Figma's own variant matrix has no locked-state visual at all.

**The panel becomes a labelled region, not deleted.** `role="tabpanel"` +
`tabindex="0"` on each step's content is replaced by `role="region"` (kept as
an explicit attribute — see Verification for why an implicit-only mapping was
rejected) with the pre-existing `aria-labelledby="atl-step-{i}"` unchanged, so
the panel is still named by its step's button. `aria-controls` is dropped
rather than kept alongside it: `aria-controls` is a widget-pattern attribute
(disclosure/combobox-style "this button controls that element"), and outside
one it is vestigial once the naming direction (`aria-labelledby`, panel →
button) already carries the association the task requires — carrying both
would just be two links doing the same job. The panel's own `id` (previously
the `aria-controls` target) is dropped along with it: nothing references it
any more. `tabindex="0"` is dropped too — it existed only to give the tab
pattern's roving-tabindex model a place to land focus after activating a tab
with no other focusable content; ordinary content that follows a list in
document order does not need a manufactured focus stop.

**Metadata.** `stepper.metadata.ts`'s `accessibility.role` is `'list'`
(verified against the regenerated a11y baselines, not assumed —
`check-metadata.js` cross-checks this). `keyboardBehavior` is rewritten: the false
claims — that headers are reachable via Tab (only the active one was) and a
"(when the flow is non-linear)" parenthetical describing a distinction the
code never made — are gone, replaced by a description of the actual
reachability rule above.

## Verification

**Committed a11y baselines**
(`tools/parity/a11y/atl-stepper.{angular,react,vue}.json`, regenerated via
`npm run gen:a11y`, identical across all three — `check:a11y-parity` passes):
`list "Progress"` → three `listitem`s, each containing a `button` (the active
one carrying `states.current: "step"`) → one `region`. The decorative
connector `<li>`s do not appear at all — `aria-hidden` excludes them,
confirmed both in this jsdom-based tool and, below, in Chromium's native
tree.

**Real-browser check**, same method ADR-0100 used: a static page reproducing
the rendered markup for two scenarios (default, and `linear` with only the
active step reachable), read with Playwright.

- **Chromium's native accessibility tree**
  (`CDPSession.send('Accessibility.getFullAXTree')`, direct evidence — the
  same tree the OS accessibility API and a real screen reader would read)
  confirms: `list "Progress"` → `listitem` (no name of its own) → `button
"Account"/"Profile"/"Review"`; the two decorative connector `<li>`s per
  scenario contribute zero nodes; `region "Profile"` (scenario A, panel
  labelled by the active button)
  and `region "Account"` (scenario B). A whole-document Tab-order probe
  (`document.activeElement` after each `Tab`) walked every reachable button in
  both scenarios in source order and never once landed on either of scenario
  B's two `disabled` future-step buttons — confirming the fix: previously only
  the active header was ever in the tab sequence, now every reachable one is,
  and every unreachable one is natively skipped.
- **Firefox and WebKit**, via Playwright's own `ariaSnapshot()` (its DOM-based
  ARIA computation — spec-conformance evidence, not a read of either engine's
  actual internal tree, per the same distinction ADR-0100 drew): both report
  the identical `list`/`listitem`/`button`/`region` shape, `[disabled]` on the
  two unreachable buttons in scenario B.

**A verified discrepancy in this project's own tooling, not in the
component**: the committed jsdom baseline reports the `region`'s name as `"2"`
— `libs/*/src/testing/a11y-tree.ts` resolves `aria-labelledby` by reading the
referenced element's raw `textContent` (the button's visible digit), which is
a documented simplification ("a pragmatic subset of the WAI spec"). Real
Chromium (native tree) and all three engines (`ariaSnapshot()`) instead
compute the referenced button's full accessible name — `"Profile"`/`"Account"`
— which is what a real screen reader announces. The DOM association is
identical either way (`aria-labelledby` correctly points at the button that
carries the visible label); only the shared test harness's name computation
is naive. Not fixed here: `a11y-tree.ts` is triplicated across all three
`libs/*/src/testing/` directories and used by every component's baseline, so
correcting its `aria-labelledby` resolution is a cross-component change with
its own blast radius, out of scope for a stepper-only change.

**Not verifiable with either tool, and said so rather than assumed**:
`aria-current` itself. Neither Chromium's `Accessibility.getFullAXTree` nor
Playwright's `ariaSnapshot()` surfaced it as a property, even against a
minimal, canonical `<a aria-current="page">` control case — this is a gap in
what these two measurement tools serialize, not evidence against the
attribute. `aria-current` is broadly supported by real assistive technology,
the DOM attribute is unambiguously present and correctly toggled, and it is
exactly what `a11y-tree.ts` reads (a raw attribute check, not a browser API
call) for the committed baseline that `check:a11y-parity` gates on.

## Consequences

- Reachable steps are in normal Tab order in every adapter; unreachable ones
  (explicitly `disabled`, or blocked by `linear`) are native `disabled`
  buttons and are not. No roving-tabindex/arrow-key model exists to
  maintain, and none is now owed — the debt is gone, not deferred.
- `stepper.metadata.ts`, the Figma master, and all three adapters now agree.
  `tasks/todo.md`'s "three-way disagreement" item is closed; the two unrelated
  open items under the same Figma-master entry (root padding, missing
  focus/disabled/a11y-annotation variants) are untouched.
- `aria-controls` and the panel's `id` are gone from all three adapters —
  anyone reaching for `aria-controls` to script against the panel from
  outside the component should use `aria-labelledby`'s reverse lookup (query
  the button by id, then the region that names itself after it) instead.
- The shared `a11y-tree.ts` test harness's `aria-labelledby` name resolution
  (raw `textContent`, not the referenced element's computed accessible name)
  is now a known, verified gap — worth fixing project-wide at some point, not
  claimed to be fixed here.
