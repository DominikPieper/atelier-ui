---
status: accepted
date: 2026-10-09
sources:
  - plan/research/ai-ds-course-gap-2026-10-08/wave3-b3-cold-start-log.md (the cold-start agent that found the Angular button does not submit a form)
  - libs/angular/src/lib/button/atl-button.ts (before: selector `atl-button`, host `role="button"`, no tabindex; after: `button[atl-button]`)
  - libs/react/src/lib/button/atl-button.tsx, libs/vue/src/lib/button/atl-button.vue (both render a native `<button>`)
  - plan/adr/0043-the-geometry-contract-ships-with-the-component.md (the custom-element host that once measured 60px)
  - tools/eslint-rules/atl-button-icon-only-needs-name.js (ADR-0152)
---

# ADR-0163: The Angular button is a native button

## Status

Accepted. Recorded at decision time. Breaking for Angular consumers: `<atl-button>` becomes
`<button atl-button>`.

## Context

On 2026-10-09 an agent with no repo access built an Angular form from `llms.txt` and found
that Save did not submit: `<atl-button>` was a custom element with `role="button"` and no inner
`<button>`, so it had no `type` and took no part in a `<form>`. React and Vue render a native
`<button>`, and the Figma master's description says "native HTML <button>".

The same day, a tooltip test that tabbed to an `<atl-button>` failed: the host had no
`tabindex`, so **the Angular button could not be reached with the keyboard at all**. Nothing had
caught it. Every story is axe-checked, but axe sees an element with `role="button"` and an
accessible name and has no rule that requires it to be focusable in practice; the
cross-framework accessibility-tree snapshot normalised the host to the same tree as React's
`<button>`, so `check:a11y-parity` agreed too. Paint probes that focus the button silently
recorded "no probe" for Angular.

The design has been the same since the first commit; no ADR chose it.

## Decision

1. **`AtlButton` is an attribute component on a native button: selector `button[atl-button]`**,
   the pattern Angular Material uses. Form submission, `type`, focus, `disabled` and every
   `aria-*` the consumer writes are the platform's, with no forwarding.
2. **The host mirrors React and Vue:** no `role`, native `disabled` when disabled or loading,
   `aria-disabled` only when true, the same classes and spinner. A `type` input defaults to
   `'button'`, as Vue does, so a button inside a form does not submit unless asked to.
3. **Everything that named the element follows:** the ESLint rule (ADR-0152) matches a
   `button` with the `atl-button` attribute; stories, docs snippets, `llms` sources, skills and
   the create-workspace templates use `<button atl-button>`; the Angular ESLint
   `component-selector` rule allows an attribute selector for this one file only.
4. **`a[atl-button]` is not included.** A link styled as a button needs its own disabled
   semantics (`aria-disabled`, no `disabled` attribute). Recorded as a follow-up.

Rejected:

- **Keep `<atl-button>` and render an inner `<button>`.** Tooltip (`aria-describedby`), the menu
  trigger and a consumer's `aria-label` all land on the host, not on the inner button; each
  would need forwarding of attributes, focus and clicks. More code for a worse result.
- **Add `tabindex="0"` and key handlers to the host.** Fixes focus, not form submission or
  `type`, and re-implements what `<button>` already does.

## Consequences

- Breaking change for Angular: the next release moves the packages from 0.3 to 0.4 (released
  with a `feat(angular)!:` commit under conventional commits).
- New tests pin what was missing: Tab reaches the button, a disabled one is skipped, `type="submit"`
  submits on click and Enter, the default does not, disabled and loading block both.
- With the button focusable, `check:paint` now measures its focus state in Angular too and
  records the outline variant's focus border (`rgb(100,116,139)` against Figma's primary) as it
  already did for React and Vue — a real CSS gap that Angular had been hiding.
- React's button sets no default `type`, so a React `AtlButton` in a form still submits by
  default while Angular and Vue do not. Recorded as a follow-up decision, not changed here.
- Weakest point: the proof is jsdom and Storybook, not a consumer app. The combination of the
  `type` input with a static `type="submit"` attribute is covered by specs only.
