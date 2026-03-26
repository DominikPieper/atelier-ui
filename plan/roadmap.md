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
| `LlmToggle` | Done | P1 | Switch, `FormCheckboxControl` |
| `LlmAlert` | Done | P1 | Inline notification |
| `LlmSelect` | Done | P1 | Complex input with dropdown, `FormValueControl` |
| `LlmDialog` | Done | P2 | Overlay/Modal, native `<dialog>`, focus trap, animations |
| `LlmTabs` | Done | P2 | Tabbed interface, roving tabindex, arrow nav, default + pills variants |
| `LlmAccordion` | Done | P2 | Collapsible sections, single/multi mode, 3 variants, CSS grid animation |
| `LlmMenu` | Done | P2 | CDK Menu wrapper, nested submenus, keyboard nav |
| `LlmTooltip` | Done | P3 | CDK Overlay directive, viewport-aware positioning |
| `LlmTable` | Done | P1 | Composable data table with sorting, selection, sticky header |
| `LlmCombobox` | Done | P1 | Filterable autocomplete with popover |
| `LlmStepper` | Done | P2 | Multi-step wizard |

---

## Phase 1: Foundation & Core Components — COMPLETE
*Focus: Establish the design system tokens and the most used atoms.*

1. **Design Tokens**: `libs/llm-components/src/styles/tokens.css` — all `--ui-*` variables
2. **`LlmButton`**: `variant`, `size`, `disabled`, `loading` signals. Native `<button>`, ARIA.
3. **`LlmBadge`**: `variant`, `size` signals. `role="status"`.
4. **`LlmCard`**: `variant`, `padding` + sub-components (`llm-card-header/content/footer`).
5. **Nx Generator**: `nx generate @atelier-ui/generators:llm-component --name=<name>`
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

## Phase 2b: More Inputs & Feedback — COMPLETE
*Focus: Richer input controls and system feedback, built with the refreshed design from day one.*

1. **`LlmToggle`**: Implements `FormCheckboxControl`. `role="switch"`, `checked` model. Animated knob.
2. **`LlmAlert`**: Inline notification. `variant` = `info | success | warning | danger`. Optional `dismissible` input.

## Phase 3: Dark Mode + Select — COMPLETE
*Focus: Dark mode while the design system is fresh; Select needs overlay research.*

1. **Dark mode tokens**: `prefers-color-scheme` media query + explicit `data-theme="dark"` support. All existing components get dark mode for free through token overrides.
2. **`LlmSelect`**: Implements `FormValueControl<string>`. Dropdown with keyboard nav, type-ahead, `aria-selected`. Options via content projection (`<llm-option>`). Requires overlay positioning decision (Popover API recommended).

## Phase 4: Overlays & Navigation — COMPLETE
*Focus: Managing complex UI states. All built with light + dark mode from the start.*

1. **`LlmDialog`**: ✅ Done. Accessible modal using native `<dialog>`. Focus trap, Escape to close, backdrop click.
2. **`LlmTabs`**: ✅ Done. Accessible tabbed interface. Arrow keys, roving tabindex, default + pills variants.
3. **`LlmAccordion`**: ✅ Done. Collapsible content sections. Single/multi mode, 3 variants, CSS grid animation.
4. **`LlmMenu`**: ✅ Done. Thin wrapper over `@angular/cdk/menu` (`CdkMenu`, `CdkMenuItem`, `CdkMenuTrigger`). Full keyboard nav, nested submenus, focus management, and ARIA — all handled by CDK. Library provides styling via design tokens.
5. **`LlmTooltip`**: ✅ Done. Attribute directive using `@angular/cdk/overlay` (`createOverlayRef`, `createFlexibleConnectedPositionStrategy`) for viewport-aware positioning. Show on hover/focus, `aria-describedby` linking, configurable delays.

## Phase 5: Publishing & Tooling — IN PROGRESS
*Focus: Make the library consumable and self-documenting.*

1. **Composition cookbook**: 6 pre-composed patterns (login form, settings page, confirmation dialog, data list, notification center, and management dashboard) as documentation examples and Storybook stories.
2. **Auto-generated API reference**: Script/generator that produces the CLAUDE.md Component API Reference section from source type signatures + JSDoc.
3. **npm packaging**: Versioning strategy, changelog generation, publish pipeline.
4. **Demo app**: Standalone Angular app showcasing all components and composition patterns.

---

## Backlog: CDK Refactoring

> **`@angular/cdk` v21.2.2 is installed** but currently unused. Several existing components have manual implementations of patterns that CDK provides out of the box. Refactoring to CDK would reduce code, improve accessibility correctness, and lower maintenance burden.

### High Impact (significant code reduction)

| Component | CDK Module | Current Manual Code | CDK Replacement | Est. Reduction |
|-----------|-----------|-------------------|-----------------|----------------|
| `LlmSelect` | `@angular/cdk/a11y` | ~125 lines: 11-case switch for keyboard nav, type-ahead with 500ms debounce, wrap-around logic | `ActiveDescendantKeyManager` handles arrow nav, wrap, Home/End, type-ahead natively | ~80 lines |
| `LlmDialog` | `@angular/cdk/a11y` | ~25 lines: manual focus trap (Tab/Shift+Tab wrapping, focusable element query) | `cdkTrapFocus` directive | ~20 lines |
| `LlmAccordion` | `@angular/cdk/accordion` | Manual expand state tracking via Set, single/multi logic, item registration | `CdkAccordion` + `CdkAccordionItem` with `multi` input and `expanded` state | ~30 lines |

### Medium Impact

| Component | CDK Module | Current Manual Code | CDK Replacement | Est. Reduction |
|-----------|-----------|-------------------|-----------------|----------------|
| `LlmTabs` | `@angular/cdk/a11y` | ~40 lines: roving tabindex + keyboard nav | `FocusKeyManager` with wrap, skip disabled, Home/End | ~25 lines |
| `LlmRadioGroup` | `@angular/cdk/a11y` | ~20 lines: arrow key navigation | `FocusKeyManager` with horizontal/vertical mode | ~15 lines |

### Low Impact (optional)

| Component | CDK Module | Current Manual Code | CDK Replacement | Est. Reduction |
|-----------|-----------|-------------------|-----------------|----------------|
| `LlmTextarea` | `@angular/cdk/text-field` | Manual autoResize with ResizeObserver | `cdkTextareaAutosize` directive | ~10 lines |

### Verification Approach
- After each refactor: run existing tests (`nx test llm-components`) to ensure no regressions
- Storybook visual check for each touched component
- Confirm CDK imports resolve correctly via build check (`nx build llm-components`)

---

## Open Architectural Questions

- ~~**CVA + Signals**: Resolved — use Angular 21 Signal Forms (`FormValueControl` / `FormCheckboxControl`). No CVA needed.~~
- **Dark mode token structure**: Single set of tokens with CSS media query overrides, or separate token files per theme?
- **Overlay positioning**: CSS Popover API used for `LlmSelect`. For `LlmMenu` and `LlmTooltip`, use `@angular/cdk/overlay` + `@angular/cdk/menu` instead — they provide positioning, scroll handling, and viewport boundary detection that the Popover API doesn't cover well for complex cases.
