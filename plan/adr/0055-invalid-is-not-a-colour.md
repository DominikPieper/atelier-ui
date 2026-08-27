---
status: accepted
date: 2026-08-27
sources:
  - AtlSelect.dc.html and AtlCombobox.dc.html in the Claude Design project *Atelier* — both sheets raised this independently
  - plan/adr/0046-one-concept-one-drawing.md (the icon set this finally makes complete)
  - plan/adr/0050-a-glyph-in-a-string-map-is-still-an-icon.md (the rule a sixth mechanism was slipping past)
---

# ADR-0055: invalid is not a colour, and a glyph in a template is still an icon

## Status

Accepted. Applies to the four form fields and to AtlPagination.

## Context

Two artboards raised the same objection: **AtlSelect and AtlCombobox carried
`invalid` on border colour alone**, while AtlInput and AtlTextarea drew a danger
icon inside the field. Two fields side by side in one form, both invalid, one
showing a mark and one not — and a WCAG 1.4.1 failure in the configuration where a
consumer sets `invalid` without passing `errors`, because then nothing but hue says
so.

Auditing the four fields across the three frameworks turned one objection into
five, and only the first was the one that had been noticed:

| divergence | before |
|---|---|
| the danger icon | input, textarea: yes. select, combobox: no |
| `aria-describedby` | present in 5 of 12 field × framework combinations |
| when the message renders | 3 different rules across the 12 |
| the live region | `role="alert"` in React/Vue select and combobox, `aria-live="polite"` everywhere else |
| the chevron | AtlIcon in combobox, the text character `▾` in select |

The last one is a different bug wearing the same clothes. ADR-0050 closed four ways
of drawing an icon without AtlIcon and gated the fifth — a glyph quoted in a source
file. A template writes one as **bare element text** instead:

```html
<span class="select-arrow" aria-hidden="true">▾</span>
```

`check:iconography` matched only quoted glyphs, so nine live instances passed it
while it reported the icon set single-sourced: AtlSelect's chevron and
AtlPagination's two page arrows, in all three frameworks. Measured, the select's
glyph rendered **5.7×15px** beside the combobox's **16×16** AtlIcon.

## Decision

**Four decisions, three of them the user's.**

**The indicator goes in all four fields, and the space for it is reserved
unconditionally.** The inline-end slot is 16px inset + 16px chevron + 4px gap +
16px indicator = a 56px reservation, present whether the field is valid or not, so
nothing moves when the state flips. Measured: the text box is the same width in
both states, in all three frameworks, and the combobox lands on identical numbers
across them — indicator 36px and chevron 16px from the field's inline end.

Rejected: replacing the chevron with the indicator while invalid — it removes the
one affordance that says the control opens. Rejected: a thicker border instead of
an icon — border width is not colour, so it satisfies 1.4.1, but ADR-0041's derived
padding subtracts `--ui-border-width`, so the formula would have to read the actual
border in four components × three frameworks or the box grows 2px when invalid.

**Angular's AtlSelect keeps its own layout, and the difference is recorded rather
than hidden.** It is a button with flex children, not a native `<select>` with an
absolute overlay — the divergence the AtlSelect sheet already documents. The slot is
a flex sibling that is always present and empty when valid. Measured consequence:
its icons sit **one pixel further inboard**, because the padding is inside a
bordered button. The gap between the two icons is 4px in all three.

**A message renders when there is a message** — `errors.length > 0`, everywhere.
Gating on `touched` as well was an Angular-only rule: `touched` is not in the spec
contract and React and Vue have no equivalent, so seven Angular components withheld
their errors until the field was touched while the other two frameworks showed them
at once. Deciding *when* to pass errors belongs to the form layer, which is where
`touched` lives. Angular's `touched` input stays for now and joins the breaking
batch, because it is public API the spec never declared.

**The message is a polite live region the field points at.** `aria-live="polite"`
in all twelve, with `aria-describedby` wired in all twelve. With the description in
place the message is read on focus anyway, so `role="alert"` was both redundant and
an interruption while the user was still typing.

**And the glyphs become icons.** `▾` → `chevron-down`; `‹` `›` →
`chevron-left` / `chevron-right`; `«` `»` → two new names,
`chevron-double-left` / `chevron-double-right`, because "jump to the first page" is
a different shape from "one step back". `check:iconography` gains `[TEXT-GLYPH]`.

## Consequences

- **Every field states invalid twice**, in hue and in shape, so none of them depends
  on colour perception. Verified in all three frameworks by measurement, not by
  reading the markup.
- **`[TEXT-GLYPH]` closes the sixth mechanism**, negative-tested by putting all nine
  glyphs back and confirming the gate fails.
- **The exemption list was wrong on its first draft, and that is the part worth
  keeping.** It exempted `«` and `»` as French and German quotation marks — which is
  true, and let six live page arrows through in the same change that closed the
  rule. A character is exempt because of the job it does on the page, not because of
  a job it can do somewhere else.
- **The pagination a11y baselines change and no interactive element does.** The
  `list` and `listitem` names are computed from visible text, so they lost the
  glyphs; all eight buttons keep the names their `aria-label` gives them —
  "First page", "Previous page", "Page 1" — in all three frameworks. Checked
  explicitly, because a snapshot diff that reads `"name": ""` looks exactly like a
  name being lost.
- **Nine Angular tests and three React/Vue tests pinned the old behaviour** and now
  pin the new contract. The Angular ones were named "does not show errors when not
  touched" — a test can only pin what is, so a decision to change behaviour is
  always partly a decision to rewrite its tests.
- **Open: `touched` is still public on seven Angular components** and in no spec.
  Tracked in `tasks/todo.md` for the breaking batch.
- **Open: two icons joined the set for one component.** `chevron-double-left/right`
  are read only by AtlPagination. That is the right trade against a glyph, but it is
  worth noticing that "one drawing per concept" grows the set every time a component
  needs a shape nobody named yet.
