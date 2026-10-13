---
status: accepted
date: 2026-10-13
sources:
  - plan/adr/0159-a-disabled-button-is-not-a-dimmed-one.md
  - plan/adr/0163-the-angular-button-is-a-native-button.md
  - libs/angular/src/lib/button/atl-button.ts, libs/react/src/lib/button/atl-button.tsx, libs/vue/src/lib/button/atl-button.vue
  - libs/styles/src/button/atl-button.css (.variant-danger:focus-visible, .is-loading:focus-visible)
  - libs/spec/src/metadata/button.metadata.ts (accessibility.keyboardBehavior)
  - libs/spec/src/index.ts (AtlRadioGroupSpec), libs/{angular,react,vue}/src/lib/radio-group
  - tasks/reviews.md (R-133, R-134, R-135, R-178)
---

# ADR-0171: A loading button stays focusable, and a radio group gets named

## Status

Accepted. Recorded at decision time. Revises ADR-0159 §2 and ADR-0163 §2 in the one point
below (what `loading` does to the DOM); both carry a dated "Corrected" paragraph. Breaking
for React consumers: `AtlRadioGroup` requires `aria-label` or `aria-labelledby` at the type
level.

## Context

Four open review items, all found by reading the code rather than by a failing gate:

- **R-134.** `.atl-button.variant-danger` (and its hover and active rules) set `box-shadow`
  at the same or higher specificity as `.atl-button:focus-visible` and come later, so a
  focused danger button showed only its inset border and no focus ring (WCAG 2.4.7). The
  other three variants set no `box-shadow`, so they were fine. Confirmed in all three
  frameworks, since the stylesheet is shared (`libs/styles`).
- **R-135 / R-178.** `loading` set native `disabled` (Angular, React, Vue alike). Chrome and
  Firefox drop focus from a button that becomes disabled, so a keyboard user who pressed
  Save lost their place, and nothing announced the busy state. `button.metadata.ts` said
  both "remove from the tab order" and "loading retains focus".
- **R-133.** `AtlRadioGroup` carries `role="radiogroup"` and has no name. `aria-label` and
  `aria-labelledby` already reached the element in all three frameworks (React spreads
  `InputHTMLAttributes`, Vue falls attributes through to the root, Angular's host _is_ the
  role element), so the claim "no mechanism" is half true: nothing in the spec, metadata,
  stories, docs or a dev warning said so. axe has no rule that requires a name on
  `role="radiogroup"` (`aria-input-field-name` covers combobox, listbox, slider, spinbutton,
  textbox and searchbox), which is why 20 lint rules and axe both missed it. The committed
  a11y snapshots even recorded the unnamed group as named "Small Large": the accessible name
  computed from content.

The canonical-anatomy server (`uianatomy`) was not reachable from this session, so the
loading decision rests on the ARIA Authoring Practices guidance for a button that starts an
async action: keep it focusable, mark it `aria-busy`, ignore activation.

## Decision

1. **Loading is not native `disabled`.** `disabled` keeps its meaning: native `disabled`,
   `aria-disabled`, out of the tab order. `loading` sets `aria-disabled="true"` and
   `aria-busy="true"`, leaves the button focusable and in the tab order, keeps the
   `is-disabled` and `is-loading` classes (so ADR-0159's neutral paint still applies), and
   ignores activation: a capture-phase click listener calls `preventDefault` (which also stops
   a `type="submit"` from submitting) and, in Angular and Vue, `stopImmediatePropagation`
   so a consumer `(click)` bound on the same element never fires. React swaps `onClick` for a
   `preventDefault` handler while loading. Enter and Space go through the click event, so
   they are covered. `aria-busy` is absent when not loading.
2. **A loading button keeps its focus ring.** `.is-disabled` clears `box-shadow`, which would
   hide the ring on a focusable element; `.atl-button.is-loading:focus-visible` restores
   `var(--ui-focus-ring)`.
3. **Danger gets its ring back, by combining the two shadows**:
   `.atl-button.variant-danger:focus-visible:not(.is-disabled)` sets `var(--ui-focus-ring),
inset 0 0 0 1px rgba(0, 0, 0, 0.18)`, the shared token plus the existing non-colour inset
   cue (WCAG 1.4.1, explained in the CSS comment). The ring is a two-band shadow (surface, then
   primary), so it does not depend on the red fill: its inner band is the surface colour, 6.47:1
   against the light danger fill and 6.87:1 against the dark one, and its outer band is the
   `primary` pair `check:contrast` already gates against the surface as "primary heading /
   focus ring" (6.87:1 light, 10.83:1 dark, floor 3:1 for WCAG 1.4.11). The inset `rgba` is the
   literal the three danger rules already carried, not a new one. Rejected:
   `--ui-focus-ring-danger`, whose outer band is red next to a red fill: legible only through
   the 2px gap and no better than the shared ring.
4. **A radio group is named by `aria-label` or `aria-labelledby`, not by a `label` prop.**
   `AtlRadioGroupSpec` gains both as optional strings. They are plain attributes written on the
   element. Angular's host carries the role, so the aliased `aria-label`/`aria-labelledby`
   inputs only write the value back onto the host (declared so the API is visible in the
   manifest and `check:props`; unlike `AtlInput`, whose host is not the control). Vue declares
   `ariaLabel`/`ariaLabelledby` props for the same reason; React already spreads. Dev mode warns after mount in Angular and Vue when neither is present
   (`warnIfUnnamedHost`, beside `warnIfUnnamedControl`). React makes it a build error through a
   discriminated union, the pattern `AtlButtonAccessibleName` set. Rejected: a visible `label`
   prop like Input/Textarea/Select. A `<label for>` cannot name a group, a caption inside a flex
   group changes its box model (and `orientation`), the Figma master does not model a group
   caption, and the ARIA name is what a checker needs either way. Rejected: `<fieldset><legend>`
   as the root, which changes the element, the CSS and the `role`.
5. **Figma.** No new Figma-side property: `aria-label`/`aria-labelledby` are attributes, not
   axes, and `loading` already exists on the master. The contracts need no entry; the
   button contract's `impliesBoolean` reason (loading paints the disabled cover) still holds.

## Consequences

- ADR-0159 §2 said loading "sets `is-disabled`" and the stylesheet comment said the same;
  both remain true for the class, but ADR-0163 §2 ("native `disabled` when disabled or
  loading") no longer holds for loading. Corrected in place in both.
- A consumer that relied on `loading` to make `button:disabled` match (a test, a CSS rule)
  must use `[aria-busy="true"]` or `.is-loading`. The unit specs of all three frameworks and
  the React and Vue composed-story specs changed accordingly.
- React consumers of `AtlRadioGroup` must add `aria-label` or `aria-labelledby`. Angular and
  Vue get a console warning in dev mode only. The stories, showcase stories, docs previews
  and the cross-framework a11y snapshots now name every group.
- Story `play` functions pin the behaviour in a real browser, where axe cannot: the button
  stories assert focus, `aria-busy` and the computed ring (all four variants, and the loading
  button); the radio-group Default story asserts the group's name.
- Weakest point: the capture-phase listener relies on registration order for Angular and Vue
  (it runs before the consumer's listener on the same target in Chromium and jsdom; it is not
  a spec guarantee for every engine) and `stopImmediatePropagation` also hides the click from
  other capture listeners on the button itself. React's `onClick` swap has no such caveat.
