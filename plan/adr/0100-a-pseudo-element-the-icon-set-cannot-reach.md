---
status: accepted
date: 2026-09-06
sources:
  - plan/adr/0050-a-glyph-in-a-string-map-is-still-an-icon.md (the rule this amends for CSS-generated, decorative separators)
  - plan/adr/0046-one-concept-one-drawing.md ([CSS-GLYPH]'s original motivation — "Figma cannot place an icon instance where the code renders a text node" — which applies just as much here)
  - libs/angular/src/lib/breadcrumbs/atl-breadcrumbs.css, libs/react/src/lib/breadcrumbs/atl-breadcrumbs.css, libs/vue/src/lib/breadcrumbs/atl-breadcrumbs.css
  - tools/scripts/check-iconography.js ([CSS-GLYPH]'s regex, which does not fire on this pattern)
  - workshop/briefs/toast.md (severity-drives-politeness precedent used elsewhere in this same change)
---

# ADR-0100: A pseudo-element the icon set cannot reach

## Status

Accepted. `.atl-breadcrumb-item::after` keeps its CSS-generated separator glyph
in all three adapters; it is not rendered as an `AtlIcon`. The `content:`
declaration gained a CSS Generated Content alt-text pair (`content: <value> /
''`) once measuring showed the glyph was reaching the accessibility tree
without it.

## Context

`AtlBreadcrumbs` draws its separator with a CSS pseudo-element:

```css
.atl-breadcrumb-item::after {
  content: var(--atl-separator, '›');
  ...
}
```

ADR-0046 built the icon set specifically because a literal glyph in a CSS
`content:` was one of the ways a pictogram could exist outside it, and
ADR-0050 closed a fifth way (a glyph quoted in a TypeScript string map) on the
same general principle: a pictogram gets one drawing, and every consumer of it
is `AtlIcon`. Read at that level of generality, the breadcrumb separator looks
like a sixth instance of the same bug.

It is not payable the same way. `[CSS-GLYPH]` (`check-iconography.js`) exists
to catch exactly this shape of literal — and does not fire here, because the
value is wrapped in `var(--atl-separator, '›')` rather than a bare quoted
string; the regex looks for `content:` followed immediately by a quote. That
is a gap in the gate, not the reason this is fine — the real reason is
structural: **a CSS pseudo-element cannot host a component.** `::after` has no
DOM node to mount `<atl-icon>`/`<AtlIcon>`/`AtlIcon.vue` into; making the
separator a real icon means giving every `AtlBreadcrumbItem` an actual child
element for it, in all three templates, for a mark that is pure wayfinding
punctuation — the hierarchy is already fully conveyed by the `<ol>` of
`<a>`/`<span aria-current="page">` items surrounding it (an explicit
`role="list"`, in all three frameworks now — Angular already had it, React and
Vue did not until this same change: their `.breadcrumbs-list` sets
`list-style: none`, and an unstyled-marker `<ol>`/`<ul>` with no explicit
`role="list"` is the documented Safari/VoiceOver case where the implicit list
semantics can be dropped, so the two adapters were relying on an implicit role
that is not safe to rely on unstyled). Nobody is meant to perceive the
separator directly; the breadcrumb's meaning survives its removal.

**The comment already sitting beside the CSS was itself an unverified claim.**
It read "chevron, CSS-generated, not read by screen readers" — plausible,
since generated content is not a DOM node and jsdom (this repo's whole a11y-
parity test harness, `libs/*/src/testing/a11y-tree.ts`) never sees it. But
jsdom does not compute layout or paint, so it cannot settle what a _real_
browser exposes. Measured instead, with a small Playwright script — and the
three frameworks it targets give genuinely different-strength evidence, worth
keeping apart rather than lumping under "the browsers' accessibility trees":
on **Chromium**, `CDPSession.send('Accessibility.getFullAXTree')` reads the
browser's own native accessibility tree, the same one it exposes to platform
accessibility APIs (and so to a real screen reader) — this is direct evidence.
Playwright has no equivalent native-tree API for **Firefox** or **WebKit**, so
those two used `page.locator('body').ariaSnapshot()`, which is Playwright's
own DOM-based implementation of the WAI-ARIA name/role computation — a
spec-conformance check against the same algorithm real engines are supposed to
follow, not a read of either engine's actual internal accessibility tree.
Against the rendered markup, all three reported the separator as its own
accessible text node, sitting between the link and the next list item —

```
listitem:
  - link "Home": {/url: /home}
  - text: /
```

— natively confirmed on Chromium, and consistent with (not independently
proven by) Playwright's own ARIA computation on Firefox and WebKit. The claim
in the comment was false on the evidence available for all three, not just
the historically-flaky Firefox/NVDA combination accessibility folklore usually
blames for this class of bug — though only the Chromium result is native-tree
evidence in the strict sense.

## Decision

**State the pseudo-element as the one allowed exception to "every pictogram is
an AtlIcon,"** rather than rendering `AtlIcon name="chevron-right"` in
`AtlBreadcrumbs`/`AtlBreadcrumbItem` across Angular, React and Vue — and fix
the CSS so the exception is actually silent to assistive tech, which it was
not.

The fix is the CSS Generated Content Module Level 3 alt-text pair: `content:
<value> / <alt-text>`, where the string after `/` is the pseudo-element's
explicit accessible-text override and an empty string means "this generated
content has no textual equivalent — do not expose it." All three stylesheets
now read:

```css
.atl-breadcrumb-item::after {
  content: var(--atl-separator, '›') / '';
  ...
}
```

Re-measured with the same script: the computed style still reports `content:
"/" / ""` and `display: block` in Chromium, Firefox and WebKit alike (the
glyph still renders, unchanged — this part genuinely is each engine's own CSS
parser/layout engine, not an approximation), and the `text: /` node is gone
from Chromium's native `Accessibility.getFullAXTree` dump and from all three
engines' `ariaSnapshot()` output. Verified natively for Chromium; for Firefox
and WebKit, verified against Playwright's own ARIA-spec computation, which is
the strongest same-tooling evidence available here but is not a native-tree
read for those two (see Context).

**Why not render `AtlIcon` instead**, the alternative ADR-0046/0050's general
rule would literally demand:

- **A pseudo-element has no DOM node to mount a component into.** The icon
  would have to be a real sibling element inside `.atl-breadcrumb-item`, in
  three templates, changing the item's DOM shape.
- **The icon set's value (one drawing, Figma-instanceable, themeable,
  drift-gated) buys nothing for content nobody is meant to hear.** The
  separator is decorative punctuation redundant with structure the list
  already exposes (`role="list"` on the `<ol>`, `aria-current="page"` on the
  current item).
  Paying a DOM node per separator, times three frameworks, to make an
  accessibility-invisible mark instanceable in Figma is cost with no
  corresponding benefit — the opposite problem from ADR-0046's original
  finding, where the _visible_ meaning (which icon is this?) genuinely needed
  one source of truth.
- **Once actually hidden, the glyph poses no risk the icon set exists to
  prevent.** ADR-0046/0050's worry is drift (three checkmarks that don't
  agree) and font-dependence (a Unicode glyph missing from Instrument Sans).
  A `›` that assistive tech never perceives cannot drift in a way that
  matters to anyone but a sighted reader of the CSS, and its fallback value is
  declared once, in the token (`--atl-separator`), not scattered.

**Rejected alternatives:**

- **Leave the CSS comment's claim standing** (do nothing, on the assumption
  generated content is already excluded). Rejected once measured: it is not,
  in any of the three engines this library targets.
- **Render `AtlIcon name="chevron-right"` in all three templates.** Rejected
  above — real DOM cost, no accessibility benefit once the alt-text fix is in
  place, and Figma still cannot place an icon instance behind a
  pseudo-element regardless (ADR-0046's original observation, restated here
  because it is still true).
- **Wrap the glyph in a plain `<span aria-hidden="true">` instead of a
  pseudo-element.** Would also work, and pseudo-elements can't carry
  `aria-hidden` directly — but it trades a zero-DOM-cost mechanism for a
  three-framework template change, to reach an accessibility outcome the CSS
  alt-text pair already reaches for free. No reason to pay for the same
  answer twice.

## Consequences

- **The separator is verified silent to assistive tech on Chromium's native
  tree, and consistent with that on Firefox/WebKit via Playwright's own ARIA
  computation — not merely assumed to be, on either count.** Re-run
  `Accessibility.getFullAXTree` (Chromium) and `ariaSnapshot()`
  (Chromium/Firefox/WebKit) against `AtlBreadcrumbs` output if this ever needs
  re-checking — the DOM/CSS is otherwise unchanged, so the same script
  applies to all three frameworks. A real macOS Safari + VoiceOver pass (or
  equivalent native-tree access for Firefox) would close the one remaining
  gap: this record does not claim that.
- **React and Vue's `<ol>` gained an explicit `role="list"` in this same
  change**, alongside the separator fix — found while writing this ADR's own
  "the hierarchy is already conveyed by the list" argument and checking
  whether that was actually true. It was true for Angular and assumed, not
  verified, for React/Vue; `.breadcrumbs-list`'s `list-style: none` is exactly
  the shape of the documented Safari/VoiceOver list-role-dropping case, so the
  assumption was worth checking and wrong. Angular was already explicit;
  React and Vue now match it.
- **`[CSS-GLYPH]`'s regex gap is now moot for this instance, not closed.**
  `content: var(--atl-separator, '›') / ''` still would not trip
  `check-iconography.js`'s `content:\s*(['"])` pattern (the value isn't a bare
  quoted literal) — this ADR is the record that the gap does not matter here,
  not a claim that the gate learned to see it. A future bare `content: '✕'`
  elsewhere is still exactly the bug ADR-0046 built the rule to catch.
- **This is a narrow exception, not a reopening of ADR-0046/0050's rule.** It
  applies to CSS-generated content that is (a) purely decorative and (b)
  verified hidden from assistive tech by the alt-text pair. A CSS glyph that
  carries meaning on its own, or that some engine still exposes despite the
  alt-text pair, is not covered by this exception and should render `AtlIcon`
  like everything else.
