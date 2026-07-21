---
status: accepted
date: 2026-07-21
sources:
  - ADR-0027 (follow-up: "19 other components found to share the same CSS bug")
  - user request ("prüfe mal die optik aller anderen komponenten")
---

# Fix the host-encapsulation CSS bug across 19 more Angular components

## Status

Accepted.

## Context

ADR-0027 fixed `LlmButton`'s dead CSS (bare `.llm-button` selectors that Angular's
view encapsulation scopes to content children, never the host) and flagged 19
more Angular components sharing the same root cause, found by auditing every
component's CSS base selector against its host `[class]`/`class` binding —
not by screenshots alone, since native form-control chrome (`<input>`,
`<checkbox>`) visually masks the missing custom styling.

Auditing surfaced three distinct defect shapes, not one:

1. **Missing host class** (the ADR-0027 pattern): a component's `hostClasses()`
   computed never includes the literal class its own CSS's base rule expects.
   Majority of the 19.
2. **Selector/DOM mismatch unrelated to encapsulation**: `LlmCombobox`'s CSS
   targeted `.llm-combobox-input`/`-panel`/`-icon` etc., but the template's
   real classes never carried the `llm-` prefix (`combobox-input`, `panel`,
   `icon`) — dead regardless of host-class fixes. Same for `LlmSelect`, whose
   CSS described a native `<select>` (`select`, `.select-wrapper`,
   `.select-arrow`) that doesn't exist — the component was rewritten at some
   point to a CDK-Overlay trigger+panel (`.trigger`, `.trigger-text`,
   `.trigger-icon`, `.panel`) without updating its stylesheet at all.
3. **Cross-component / structural selectors that never worked**: rules meant
   to style content projected from a *different* component (e.g.
   `LlmAccordionGroup`'s CSS reaching into `<llm-accordion-item>`, or
   `LlmTabGroup`'s CSS reaching into `<llm-tab>`'s own `[role="tabpanel"]`)
   — Angular's emulated encapsulation never lets one component's stylesheet
   match another component's own host or template output, projection or not.
   `LlmTable`'s striping (`tr:nth-child(even)`) was structurally broken for a
   different reason: each `<tr>` is wrapped in its own `<llm-tr
   style="display:contents">`, so every `<tr>` is an only-child — `nth-child`
   must count the `<llm-tr>` wrappers, not the `<tr>`s.

## Decision

Fixed all 19, matching the defect actually found rather than applying one
template everywhere:

- **Missing host class** (`LlmAlert`, `LlmCard`+`Header`/`Content`/`Footer`,
  `LlmCheckbox`, `LlmDrawer`+subs, `LlmInput`, `LlmProgress`, `LlmRadio`,
  `LlmRadioGroup`, `LlmSkeleton`, `LlmStepper`, `LlmTable`, `LlmTabGroup`,
  `LlmTextarea`, `LlmToggle`, `LlmAccordionGroup`+`Item`, `LlmBreadcrumbs`+`Item`):
  rewrote `.llm-x` / `.llm-x.variant-y` selectors to `:host` / `:host(.variant-y)`.
  Real template children (`.errors`, `.track`, `.thumb`, native `input`/`textarea`
  elements, …) needed no change — Angular already scopes those correctly
  regardless of the host's own class list.
- **Multi-component shared stylesheets** (`LlmCard`'s 4 components,
  `LlmDialog`'s 4, `LlmDrawer`'s 4, `LlmAccordion`'s 2, `LlmBreadcrumbs`'s 2 —
  each declares the same `styleUrl`, so Angular compiles the *same* CSS text
  once per consumer, independently scoped): a bare `:host {}` in a shared file
  is unsafe — every consumer's copy sees every rule, so an unqualified
  `:host{}` clobbers across components via source order, not scoping. Gave
  each sub-component its own disambiguating class (`class: 'llm-card-header'`,
  etc.) and wrote `:host(.llm-card-header)` — inert in every other
  consumer's copy since only the real header ever carries that class.
- **Cross-component parent-affects-child styling** (`LlmCard`'s
  `padding-*` variant setting header/content/footer padding,
  `LlmAccordionGroup`'s `variant-*` setting item borders): used
  `:host-context()` — the standard CSS mechanism for "style myself based on
  an ancestor's class," which Angular's emulated encapsulation supports
  natively (rewrites it to check the light-DOM ancestor chain, not just
  same-component ancestors).
- **Rules that can never reach another component's own template**
  (`LlmTabGroup`'s `[role="tabpanel"]` padding, which only exists inside
  `LlmTab`'s own template): relocated the rule into `LlmTab`'s own inline
  `styles` block, the only place it can ever match.
- **`LlmDialog`**: its CSS (`position:fixed`, `::backdrop`, `[open]`) was
  always meant to target the *inner* native `<dialog>` element directly —
  `::backdrop` and native `[open]` reflection only exist on the real
  top-layer element — not the `<llm-dialog>` custom-element host. Added
  `class="llm-dialog"` to the template's `<dialog>` tag. Kept the host's
  existing `is-open` class binding as-is: two passing tests
  (`llm-dialog.spec.ts`) assert `<llm-dialog>` carries it, and nothing in the
  CSS ever used it — it's a public state hook for consumers, not dead code,
  despite looking that way at first glance.
- **`LlmTable` striping**: `.llm-table.variant-striped tbody tr:nth-child(even)`
  → `tbody llm-tr:nth-child(even)`, counting the real tbody children.
- **`LlmSelect`**: rewrote the CSS from scratch against the actual
  trigger+panel DOM, matching `LlmCombobox`'s already-correct visual
  language (same tokens, same border/focus/hover treatment) since both are
  the same UX pattern (text-or-button trigger + dropdown panel of options).

Not fixed, flagged instead of silently patched: **`LlmOption`** (the row
inside `<llm-select>`) has no stylesheet and no base class at all — it was
never styled, not just mis-scoped. Rewriting `LlmSelect`'s CSS doesn't touch
it; giving it real styling means authoring new CSS and wiring a `styleUrl`,
which is design work, not a mechanical scoping fix like everything else
here. Reported to the user; not done in this pass.

## Consequences

- Verified with `nx run angular:build/lint/test` (528/528 passing throughout,
  including the two `LlmDialog` tests that regressed once when the host
  class was removed and were fixed by restoring it) and `nx affected -t lint
  test build` for the full workspace gate.
- Verified visually in a real Storybook run for every fixed component
  (Alert, Card, Toggle, Progress, Skeleton, Tabs in both variants, Accordion,
  Breadcrumbs, Pagination, Dialog, Drawer, Table in all variants, Stepper in
  both orientations, Select, Combobox, Checkbox, Textarea, Input,
  Radio/RadioGroup) plus DOM/computed-style inspection where visual
  inspection alone was inconclusive (e.g. confirming `LlmTable`'s `<tr>`
  wrapper structure via `element.matches()`).
- `LlmOption` remains unstyled — a real, pre-existing gap, now documented
  rather than silently left unstated.
- This is a large, low-risk-per-file but wide-blast-radius change (19
  components' CSS/host bindings). Committed separately from the Angular 22 /
  Nx 23 upgrade (ADR-0027) so the two remain independently revertable.
