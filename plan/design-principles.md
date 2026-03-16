# Design Principles

## 1. Physical Authenticity
Interactive elements behave as if in physical space. Hover = lift (translateY + shadow increase). Active/press = compress (scale down). Disabled = faded/unreachable.
- **Rule:** Use `scale(0.97)` for active states. Pair shadow changes with transforms.

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
