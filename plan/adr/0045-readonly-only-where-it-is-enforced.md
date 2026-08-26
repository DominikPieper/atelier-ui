---
status: accepted
date: 2026-08-26
sources:
  - tasks/design-findings-2026-08-26.md (Decision C)
  - libs/spec/src/index.ts (AtlFormFieldSpec → AtlReadonlySpec)
---

# ADR-0045: `readonly` lives only where it is enforced

## Status

Accepted. `readonly` moves out of `AtlFormFieldSpec` into an `AtlReadonlySpec`
mixin, applied to AtlInput, AtlTextarea, AtlCombobox and AtlRadioGroup. AtlCheckbox,
AtlToggle and AtlSelect no longer accept it. Where it is kept, it is enforced in
every framework and has a visual treatment.

## Context

The finding was cosmetic: **`readonly` rendered identically to `default`** —
`--ui-color-input-bg` already *is* `var(--ui-color-surface-sunken)`, and
`.is-readonly input` set the same value, so only the cursor differed.

Measuring it turned up something worse. `readonly` was declared once on
`AtlFormFieldSpec` and inherited by seven specs, but what it actually did differed
per component **and per framework**:

| Component | Angular | React | Vue |
|---|---|---|---|
| input, textarea | works (HTML) | works (HTML) | works (HTML) |
| combobox | **prop absent** | works (JS guard) | works (JS guard) |
| radio-group | **prop absent** | works (JS guard) | works (JS guard) |
| checkbox | prop absent | **inert** | **inert** |
| toggle | prop absent | **inert** | works (JS guard) |
| select | prop absent | **inert** (class only) | works (JS guard) |

"Inert" is measured, not inferred: in chromium, `<input type="checkbox" readonly>`
and `<input type="radio" readonly>` still flip when clicked, and
`HTMLSelectElement` has no `readOnly` property at all (`'readOnly' in el` is
`false`). Worse than doing nothing: React's checkbox and toggle passed the
attribute *and* fired `onCheckedChange`, so they reported the change the prop
promised to prevent. React's select emitted an `is-readonly` class that no
stylesheet has a rule for.

The tests were green throughout. They assert that the class is applied — never
that the state does anything.

Two structural facts made this possible: `readonly` is absent from
`behaviors.json`, so `check:behavior` has nothing to enforce; and **no gate checks
that a spec-declared prop exists in all three adapters.** `check:spec` copies the
spec file into each lib; `check:defaults` compares default *values* for axis props
(variant/size/shape/position) only. A boolean state prop can therefore be declared
once and implemented in two frameworks out of three with every gate green.

## Decision

**`readonly` is declared only where it is enforced.** A prop that silently does
nothing is worse than an absent one — it invites the consumer to build a
non-editable form that is fully editable. So:

- `AtlReadonlySpec` replaces the inherited field, applied to input, textarea,
  combobox and radio-group.
- AtlCheckbox, AtlToggle and AtlSelect drop it. React's checkbox and toggle already
  `Omit` `readOnly` from their HTML passthrough, so it is now rejected rather than
  ignored.
- **Vue loses two working guards** (toggle, select). That is the real cost of this
  option: those two *could* enforce it, as Vue proved. Chosen anyway, because the
  alternative — implementing it across four components × three frameworks — buys a
  state nobody has asked for, and consistency across frameworks is what `libs/spec`
  exists for. If a use case appears, the mixin is the place to add it back.
- **Angular gains it** on combobox and radio-group, or the kept set would be a lie
  in one framework: an input signal plus guards in `open()`, `onOptionSelect()`,
  `onKeydown()` and `select()`, and `is-readonly` on the host to match.

**Enforcement needs the click cancelled, not just the model guarded.** Blocking the
change handler leaves the native radio flipping its own DOM state, and nothing
re-renders to correct it — the signal never changed. So all three radios now
`preventDefault()` the click while readonly. Verified in chromium: a radio group
whose click is cancelled keeps its previous selection. jsdom does not implement that
restore, which is why the Angular tests assert the **model** and say so in a comment.

**Visually, readonly is content rather than a control:** the border goes
transparent while the filled surface stays.

```css
.atl-input.is-readonly input {
  border-color: transparent;
  cursor: default;
}
```

Transparent rather than removed, so the 1px border keeps its space and the height
stays exactly `--ui-control-height-md` — measured at 40px in all three states, light
and dark. Rejected: a lighter background (a white field reads as *more* editable in
a system whose default field is filled), and rendering the value as plain text
(changes the DOM per state, so the height, so every form row it sits in).

## Consequences

- **Three distinguishable states** where there were two: default is bordered,
  readonly is a borderless slab, disabled is faded. Checked in light and dark.
- **A prop disappears from three components.** Formally breaking; in practice it
  removes something that never worked in Angular and was inert in React.
- **New tests pin the guards** — Angular combobox (no open on focus, `readOnly` on
  the input, `is-readonly` on the host) and radio-group (no change on click, none on
  arrow keys). 558 Angular / 416 Vue / 286 React green.
- **The hole that hid this is still open.** Nothing gates spec-prop presence across
  the three adapters, and `readonly` is still absent from `behaviors.json` — so the
  guards added here are pinned by unit tests but not by the behaviour manifest.
  Tracked as the next candidate gate; recorded here so it is not rediscovered a
  third time.
