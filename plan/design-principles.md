# Design Principles

## 1. Physical Authenticity

Interactive elements signal state through color and elevation, not motion. Hover and active/press swap to a dedicated `-hover` / `-active` color token; disabled = faded/unreachable.

- **Rule:** No `transform` on hover or press for a standard control — no shrink, no lift, no inset shadow. A color/border-color token swap is the only state signal. Confirmed across all three framework libs (`libs/{angular,react,vue}/src/lib/**/*.css`, 2026-09-09: no component scales on `:active`, none lifts on `:hover`); matches `skills/atelier-design/references/brand-guide.md`'s Press-states section ("No shrink, no inset shadow"). This corrects the prior `scale(0.97)` / lift rule, which no implementation ever carried out.
- **The one live exception, so nobody "fixes" it:** the Chat popup's floating action button grows on hover (`.atl-chat.variant-popup .fab-bubble:hover { transform: scale(1.05) }`, `libs/react/src/lib/chat/atl-chat.css:138`). A FAB is a persistent floating affordance, not an inline control, and the growth is its hit-target invitation. Read the rule above as governing inline controls; a new floating affordance may follow the FAB, and nothing else may.

## 2. Purposeful Motion

Every animation serves exactly one purpose: (a) confirm action, (b) orient spatial relationship, or (c) smooth visual transition. No decorative animation.

- **Rule:** If you can't name the purpose, remove it.

## 3. Consistent Timing Hierarchy

Three tiers only: `fast` (150ms) for micro-interactions, `normal` (200ms) for state transitions, `slow` (300ms) for layout changes. No custom durations in components.

## 4. Accessible by Default

Focus meets WCAG 2.4.13. Animations respect `prefers-reduced-motion`. All states distinguishable without color alone. `:focus-visible` for buttons/links, `:focus` for form inputs.

- **Rule:** Global `prefers-reduced-motion` override zeroes all duration tokens.

## 5. Surface Hierarchy = Depth

Three layers: sunken (inputs), surface (default), raised (cards/dropdowns). Each has distinct background + shadow. Dark mode: raised = lighter (closer to light source).

## 6. Typography Creates Rhythm

Headings: tight letter-spacing (-0.01em). Body: neutral (0). Small text: slightly open (0.01em). Larger heading sizes (xl, 2xl) for dialogs and cards.

## 7. Dark Mode is First-Class

No hardcoded `#fff` or `#000` in component CSS. Every color goes through tokens. `color-mix()` targets must use token-based colors, not `#000`.

## 8. Disabled = Unreachable, Not Hidden

Consistent `opacity: var(--ui-opacity-disabled); cursor: not-allowed; pointer-events: none` across all components. One token, one value.
