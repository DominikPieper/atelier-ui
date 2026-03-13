# LLM-Optimized Angular UI Component Library — Design Guide

This document defines the architectural principles and conventions for building an Angular component library optimized for LLM-assisted code generation (specifically Claude) while remaining intuitive for human developers.

---

## Core Design Philosophy

Traditional component libraries are designed for humans browsing docs, copying examples, and tweaking. An LLM-optimized library flips the priorities: the LLM needs to **infer correct usage from minimal context** and **produce working code on the first attempt** without browsing a docs site.

Design for a developer who has perfect pattern recognition but zero ability to look things up at generation time. Everything must be inferrable from types, conventions, and a small context document.

---

## 1. Maximally Predictable API Surface

Every component must follow identical patterns. If `UiButton` takes `[variant]`, `[size]`, and `[disabled]`, then `UiCard`, `UiAlert`, and `UiBadge` must use the same property names for the same concepts.

**Rules:**

- Use the same input name for the same concept across all components (`variant`, `size`, `disabled`).
- Use string literal union types everywhere — never enums, never numeric codes.
- Provide sensible defaults for every input so bare usage always works: `<ui-button>Click</ui-button>`.

```typescript
// Good: predictable, narrow, self-documenting
variant = input<'primary' | 'secondary' | 'outline'>('primary');
size = input<'sm' | 'md' | 'lg'>('md');
disabled = input(false);

// Bad: inconsistent naming, wide types
kind = input<string>('default');
scale = input<number>(2);
```

---

## 2. Signals as the Single Reactivity Model

Use Angular 21 signal primitives exclusively. No `@Input()` / `@Output()` decorators. One mental model means one pattern for the LLM to follow.

**Rules:**

- `input()` for all inputs.
- `output()` for all event outputs.
- `model()` for two-way bound state.
- `computed()` and `effect()` internally — never exposed as public API.

```typescript
@Component({
  selector: 'ui-toggle',
  standalone: true,
  template: `...`,
})
export class UiToggle {
  /** Whether the toggle is on. Supports two-way binding via [(checked)]. */
  checked = model(false);

  /** Visual variant. */
  variant = input<'default' | 'success' | 'danger'>('default');

  /** Emitted after the toggle state changes. */
  changed = output<boolean>();
}
```

---

## 3. Self-Describing Components via TypeScript Types

The LLM reads type signatures, not docs sites. Types must do the heavy lifting.

**Rules:**

- Use narrow literal union types instead of `string` or `number`.
- Use flat inputs with defaults instead of config objects with optional fields.
- Every public member must be understandable from its type signature alone.

```typescript
// Good: the type IS the documentation
size = input<'sm' | 'md' | 'lg'>('md');

// Bad: requires reading docs to know valid values
size = input<string>('md');
```

---

## 4. Composition over Configuration

Prefer content projection and structural composition over config objects. LLMs are better at composing templates than constructing complex configuration shapes.

**Rules:**

- Use `<ng-content>` and named slots via `select` for structural composition.
- Never accept complex config/option objects as inputs.
- Follow HTML-like nesting patterns — they map directly to the LLM's training data.

```html
<!-- Good: composition via content projection -->
<ui-card>
  <ui-card-header>Title</ui-card-header>
  <ui-card-content>Body text here.</ui-card-content>
  <ui-card-footer>
    <ui-button variant="primary">Save</ui-button>
  </ui-card-footer>
</ui-card>

<!-- Bad: opaque config object -->
<ui-card [config]="{ header: { title: '...' }, footer: { actions: [...] } }" />
```

---

## 5. Styling: CSS Custom Properties + Design Tokens

Components consume a design token layer internally. Users (human or LLM) don't think about styling — they pick a `variant` and the tokens handle the rest.

**Rules:**

- All visual decisions are driven by CSS custom properties (design tokens).
- Components never accept arbitrary class or style inputs for internal elements.
- Theming is done by overriding token values, not by passing Tailwind classes.
- Layout around components (page structure, spacing) is the consumer's responsibility.

```css
/* Token layer (provided by the library) */
:root {
  --ui-color-primary: #3b82f6;
  --ui-color-primary-hover: #2563eb;
  --ui-color-secondary: #64748b;
  --ui-color-danger: #ef4444;
  --ui-color-surface: #ffffff;
  --ui-color-border: #e2e8f0;
  --ui-color-text: #0f172a;
  --ui-color-text-muted: #64748b;

  --ui-radius-sm: 0.25rem;
  --ui-radius-md: 0.375rem;
  --ui-radius-lg: 0.5rem;

  --ui-spacing-1: 0.25rem;
  --ui-spacing-2: 0.5rem;
  --ui-spacing-3: 0.75rem;
  --ui-spacing-4: 1rem;
  --ui-spacing-6: 1.5rem;
  --ui-spacing-8: 2rem;

  --ui-font-size-sm: 0.875rem;
  --ui-font-size-md: 1rem;
  --ui-font-size-lg: 1.125rem;

  --ui-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --ui-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);

  --ui-transition-fast: 150ms ease;
  --ui-transition-normal: 200ms ease;
}
```

```css
/* Inside a component's styles — consumes tokens only */
:host {
  display: inline-flex;
  border-radius: var(--ui-radius-md);
  transition: background-color var(--ui-transition-fast);
}

:host(.variant-primary) {
  background-color: var(--ui-color-primary);
  color: white;
}

:host(.variant-primary:hover) {
  background-color: var(--ui-color-primary-hover);
}
```

---

## 6. Standalone Components, Always

Every component must be standalone and directly importable. No `NgModule` indirection.

**Rules:**

- Every component sets `standalone: true`.
- Imports are granular: `import { UiButton } from '@scope/ui'`.
- No barrel re-exports that pull in the entire library.

```typescript
// Good: direct, granular import
import { UiButton, UiCard, UiCardHeader, UiCardContent } from '@scope/ui';

@Component({
  standalone: true,
  imports: [UiButton, UiCard, UiCardHeader, UiCardContent],
  // ...
})
export class MyPage {}
```

---

## 7. Inline Documentation as JSDoc

When the LLM has access to source (via LSP, context file, or pasted types), JSDoc on every public member becomes the documentation layer. Keep it short and example-rich.

**Rules:**

- Every component class gets a JSDoc block with one usage example.
- Every public `input()`, `output()`, and `model()` gets a one-line JSDoc description.
- Examples use realistic, minimal templates — not abstract placeholders.

```typescript
/**
 * Accessible dialog/modal overlay.
 *
 * Usage:
 * ```html
 * <ui-dialog [(open)]="showDialog">
 *   <ui-dialog-header>Confirm Action</ui-dialog-header>
 *   <ui-dialog-content>Are you sure?</ui-dialog-content>
 *   <ui-dialog-footer>
 *     <ui-button variant="secondary" (click)="showDialog.set(false)">Cancel</ui-button>
 *     <ui-button variant="primary" (click)="confirm()">Confirm</ui-button>
 *   </ui-dialog-footer>
 * </ui-dialog>
 * ```
 */
@Component({ ... })
export class UiDialog {
  /** Controls dialog visibility. Supports two-way binding via [(open)]. */
  open = model(false);

  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdrop = input(true);

  /** Whether pressing Escape closes the dialog. */
  closeOnEscape = input(true);
}
```

---

## 8. Behavior: Follow WAI-ARIA Patterns

The LLM has deep familiarity with ARIA roles, keyboard interactions, and accessibility patterns from web standards. Following ARIA patterns means the LLM can correctly infer expected behavior.

**Rules:**

- Every interactive component implements the corresponding WAI-ARIA design pattern.
- Use native HTML elements where possible (`<button>`, `<dialog>`, `<input>`).
- Keyboard interactions follow ARIA authoring practices (arrow keys for menus, Escape to close overlays, Tab for focus order).
- Never invent custom interaction models.

| Component     | ARIA Pattern            | Key Behaviors                           |
|---------------|-------------------------|-----------------------------------------|
| `UiDialog`    | Dialog (modal)          | Focus trap, Escape to close, backdrop   |
| `UiTabs`      | Tabs                    | Arrow keys to switch, roving tabindex   |
| `UiMenu`      | Menu / Menubar          | Arrow keys, Enter to select, Escape     |
| `UiTooltip`   | Tooltip                 | Focus/hover trigger, `role="tooltip"`   |
| `UiAccordion` | Accordion               | Enter/Space to toggle, `aria-expanded`  |
| `UiSelect`    | Listbox                 | Arrow keys, type-ahead, `aria-selected` |
| `UiToggle`    | Switch                  | Space to toggle, `role="switch"`        |

---

## 9. LLM Context File (CLAUDE.md / llm-context.md)

Ship a compressed API reference file designed to be dropped into a system prompt or Claude Code's project context. This is the single most impactful artifact for LLM code generation quality.

**Rules:**

- List every component with its selector, inputs (with types and defaults), outputs, and one minimal template example.
- Keep it under 4000 tokens.
- Update it as part of the release process — it's a first-class artifact, not an afterthought.

**Example format:**

````markdown
## UiButton

Selector: `ui-button`

| Input      | Type                                      | Default     |
|------------|-------------------------------------------|-------------|
| `variant`  | `'primary' \| 'secondary' \| 'outline'`  | `'primary'` |
| `size`     | `'sm' \| 'md' \| 'lg'`                   | `'md'`      |
| `disabled` | `boolean`                                 | `false`     |
| `loading`  | `boolean`                                 | `false`     |

```html
<ui-button variant="primary" size="md" (click)="save()">Save</ui-button>
```

## UiCard

Selector: `ui-card`
Sub-components: `ui-card-header`, `ui-card-content`, `ui-card-footer`

| Input     | Type                                       | Default     |
|-----------|--------------------------------------------|-------------|
| `variant` | `'elevated' \| 'outlined' \| 'flat'`      | `'elevated'`|
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'`         | `'md'`      |

```html
<ui-card variant="elevated">
  <ui-card-header>Title</ui-card-header>
  <ui-card-content>Content goes here.</ui-card-content>
</ui-card>
```
````

---

## Priority Ranking

Ordered by impact on LLM code generation quality:

1. **Consistent API patterns** across all components
2. **Signal-only reactivity** (`input`, `output`, `model` — nothing else)
3. **Narrow TypeScript types** (literal unions with defaults)
4. **Composition via content projection** (no config objects)
5. **Standalone imports** (no NgModule indirection)
6. **Inline JSDoc with examples** on every public member
7. **LLM context cheat sheet file** (compressed API reference)
8. **CSS custom properties** for theming (design tokens, not utility classes)
9. **ARIA-based behavior** (familiar, standards-aligned interaction patterns)

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Hurts LLM Generation |
|---|---|
| Config objects as inputs | LLM must guess nested shape; high error rate |
| `@Input()` / `@Output()` decorators mixed with signals | Two mental models; inconsistent generated code |
| Enums for variants/sizes | LLMs produce string literals more reliably |
| `NgModule`-based architecture | Import resolution errors; unnecessary indirection |
| Arbitrary `class` / `style` inputs | Unbounded styling decisions the LLM shouldn't make |
| Undocumented internal state | LLM can't infer correct behavior from types alone |
| Custom keyboard interaction patterns | LLM defaults to ARIA patterns; custom ones get misgenerated |
| Deep component hierarchies with implicit context | LLM loses track of injected dependencies and context |
