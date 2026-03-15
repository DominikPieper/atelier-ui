# Roadmap: LLM-Optimized Angular UI Components

This document outlines the development phases, existing status, and future backlog for the component library.

## Current Status (2026-03-15)

### Foundation
- [x] Nx Workspace structure
- [x] Angular 21, Vite, Vitest configuration
- [x] Storybook 10 configuration
- [x] Big Picture Design Guide (`plan/big-picture.md`)
- [x] Global Design Tokens (`libs/llm-components/src/styles/tokens.css`)
- [x] LLM Context File (`CLAUDE.md` Component API Reference section)
- [x] Visual Design Refresh (tokens overhaul, component CSS polish, Kitchen Sink story)

### Component Status

| Component | Status | Priority | Notes |
|-----------|--------|----------|-------|
| `LlmButton` | Done | P0 | Signals, OnPush, ARIA, tests, stories, hover lift/press |
| `LlmCard` | Done | P0 | Composition pattern, sub-components, surface hierarchy |
| `LlmBadge` | Done | P1 | role=status, bordered tints, tests, stories |
| `LlmInput` | Done | P0 | `FormValueControl`, sunken bg, focus brightening |
| `LlmTextarea` | Done | P0 | `FormValueControl`, autoResize, matched input styling |
| `LlmCheckbox` | Done | P0 | `FormCheckboxControl`, spring pop animation |
| `LlmRadio` | Done | P0 | `FormValueControl` (via group), pop animation |
| `LlmToggle` | Not Started | P1 | Switch, `FormCheckboxControl` |
| `LlmAlert` | Not Started | P1 | Inline notification |
| `LlmSelect` | Not Started | P1 | Complex input with dropdown, `FormValueControl` |
| `LlmDialog` | Not Started | P2 | Overlay/Modal |
| `LlmTabs` | Not Started | P2 | Navigation |
| `LlmAccordion` | Not Started | P2 | Content organization |
| `LlmMenu` | Not Started | P2 | Complex navigation |
| `LlmTooltip` | Not Started | P3 | Hover info |

---

## Phase 1: Foundation & Core Components — COMPLETE
*Focus: Establish the design system tokens and the most used atoms.*

1. **Design Tokens**: `libs/llm-components/src/styles/tokens.css` — all `--ui-*` variables
2. **`LlmButton`**: `variant`, `size`, `disabled`, `loading` signals. Native `<button>`, ARIA.
3. **`LlmBadge`**: `variant`, `size` signals. `role="status"`.
4. **`LlmCard`**: `variant`, `padding` + sub-components (`llm-card-header/content/footer`).
5. **Nx Generator**: `nx generate @angular-llm-components/generators:llm-component --name=<name>`
6. **LLM Context**: `CLAUDE.md` Component API Reference section.

## Phase 2a: Form Foundation (Signal Forms) — COMPLETE
*Focus: Build simple form controls using Angular 21's native Signal Forms API.*

> **Architecture**: Angular 21 ships Signal Forms (`@angular/forms/signals`) which replaces `ControlValueAccessor` entirely. Form controls implement `FormValueControl<T>` (for value-based controls) or `FormCheckboxControl` (for boolean toggle controls).

1. **`LlmInput`**: Implements `FormValueControl<string>`. Inputs: `type`, `placeholder`. State: `value` model, optional form state inputs.
2. **`LlmTextarea`**: Implements `FormValueControl<string>`. Inputs: `rows`, `placeholder`. Same state pattern.
3. **`LlmCheckbox`**: Implements `FormCheckboxControl`. `checked` model. Label via content projection.
4. **`LlmRadio`** (+ `LlmRadioGroup`): `LlmRadioGroup` implements `FormValueControl<string>`. Arrow key navigation.

## Visual Design Refresh — COMPLETE
*Focus: Polish the visual identity before building more components.*

1. **Token overhaul**: Inter font, larger radii, multi-layer shadows, refined color palette with surface hierarchy, custom cubic-bezier easings, double-ring focus.
2. **Component CSS refresh**: Button hover lift/press, card surface hierarchy, input sunken→bright-on-focus, checkbox/radio spring-pop animations, badge bordered tints.
3. **Storybook enhancement**: Font loading, themed backgrounds, Kitchen Sink showcase story.

## Phase 2b: More Inputs & Feedback — NEXT
*Focus: Richer input controls and system feedback, built with the refreshed design from day one.*

1. **`LlmToggle`**: Implements `FormCheckboxControl`. `role="switch"`, `checked` model. Animated knob.
2. **`LlmAlert`**: Inline notification. `variant` = `info | success | warning | danger`. Optional `dismissible` input.

## Phase 3: Dark Mode + Select
*Focus: Dark mode while the design system is fresh; Select needs overlay research.*

1. **Dark mode tokens**: `prefers-color-scheme` media query + explicit `data-theme="dark"` support. All existing components get dark mode for free through token overrides.
2. **`LlmSelect`**: Implements `FormValueControl<string>`. Dropdown with keyboard nav, type-ahead, `aria-selected`. Options via content projection (`<llm-option>`). Requires overlay positioning decision (Popover API recommended).

## Phase 4: Overlays & Navigation
*Focus: Managing complex UI states. All built with light + dark mode from the start.*

1. **`LlmDialog`**: Accessible modal using native `<dialog>`. Focus trap, Escape to close, backdrop click.
2. **`LlmTabs`**: Accessible tabbed interface. Arrow keys, roving tabindex.
3. **`LlmAccordion`**: Collapsible content sections. `aria-expanded`.
4. **`LlmMenu`**: Dropdown and context menus. Arrow keys, Escape.
5. **`LlmTooltip`**: Hover/focus-based info. `role="tooltip"`.

## Phase 5: Publishing & Tooling
*Focus: Make the library consumable and self-documenting.*

1. **Composition cookbook**: 5–10 pre-composed patterns (login form, settings page, data table layout, confirmation dialog, etc.) as Storybook stories and LLM context snippets.
2. **Auto-generated API reference**: Script/generator that produces the CLAUDE.md Component API Reference section from source type signatures + JSDoc.
3. **npm packaging**: Versioning strategy, changelog generation, publish pipeline.
4. **Demo app**: Standalone Angular app showcasing all components and composition patterns.

---

## Open Architectural Questions

- ~~**CVA + Signals**: Resolved — use Angular 21 Signal Forms (`FormValueControl` / `FormCheckboxControl`). No CVA needed.~~
- **Dark mode token structure**: Single set of tokens with CSS media query overrides, or separate token files per theme?
- **Overlay positioning**: CSS Popover API recommended for dropdowns/tooltips/menus. Research needed for Phase 4.
