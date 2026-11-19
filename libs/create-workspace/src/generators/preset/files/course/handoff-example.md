# Handoff document: a filled example

Used in Day 2 Block 01 (you write yours) and as the input of every Day 2 prompt. This is the
document filled in for the Toast brief (`briefs/toast.md`), in {{FRAMEWORK}}. It is a
checklist, not a form: its value is that you decide the scope and write the behaviour in
your own words before any code exists.

Note the two blanks only you can fill: your draft URL and node id, and the auto-dismiss time
(the brief says "configurable" and leaves the number to you).

Every line of it is something the diff can be held against: a variant that is not on the
"In scope" line is a finding, and so is a behaviour line with no play function.

---

# Handoff — AtlToast · {{FRAMEWORK}}

**Source.** Duplicate of the Atelier file in my drafts, <draft URL>, node
`<node id of my copy>` (copied from the starter frame `Toast / Starter`, node
`703:341`). Page: my copy of the Toast frame.

**Canonical record.** The brief, `briefs/toast.md`, is the source
for what the component is.

**Reuse or new.** New component. The status glyph reuses AtlIcon. It is not an
Alert (inline, persistent) and not a Dialog (blocking).

**In scope.** variant = success | danger; states = open | closing.
`dismissible` and `hasIcon` as Booleans if time allows.
Hover and focus-visible are CSS, not variants.

**Explicitly out.** variants info and warning; the six position values (one
corner only); stacking; the progress affordance. Each is named in the Figma
description of the master, not left out silently.

**Token bindings.** Container: fill `--ui-color-surface-raised`, border
`--ui-color-border`, radius `--ui-radius-md`, padding and gap from the
`--ui-spacing-*` ladder. success: `--ui-color-success-bg` and
`--ui-color-success-text`. danger: `--ui-color-danger-bg` and
`--ui-color-danger-text`. Close button: `--ui-color-text-muted`.
Elevation: `--ui-shadow-lg`, CSS only. Figma has no shadow variable, so the
Figma description says so.

**Deliberate differences.** What the code does differently from the design on
purpose, and why. Hover and focus-visible are CSS, not variants or properties.
Elevation is `--ui-shadow-lg` in CSS only, because Figma has no shadow variable
to bind.

**Behaviour.** Each line becomes the title of one play function.

- Auto-dismisses after N seconds (I choose N and write it here: ___).
- Pauses on pointer-enter and on focus-in; resumes, does not restart, when both are out.
- Escape closes the toast while focus is inside it.
- success announces politely (role="status"); danger announces assertively (role="alert").
- The close button has one accessible name, from aria-label or hidden text, never both.

**Accessibility.** success and danger differ without colour (glyph and text).
The glyph is aria-hidden. The action, if present, is a real button. A critical
error is never shown as a toast.

**Target files.** The component, its unit test and its story file (one story
per variant value and Boolean state, a play function per behaviour line above).

**Acceptance.** Unit tests and lint exit 0. check:stories green (every story
renders, axe clean). docs-show describes the component: a description and a line
per property. figma_check_design_parity run on my node, every difference it
reports sorted: code, Figma, or kept on purpose (then it is listed under
Deliberate differences).
