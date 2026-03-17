# LLM-Optimized Angular UI Component Library — Design Guide

This document defines the architectural principles and conventions for building an Angular component library optimized for LLM-assisted code generation (specifically Claude) while remaining intuitive for human developers.

---

## Core Design Philosophy

Traditional component libraries are designed for humans browsing docs, copying examples, and tweaking. An LLM-optimized library flips the priorities: the LLM needs to **infer correct usage from minimal context** and **produce working code on the first attempt** without browsing a docs site.

Design for a developer who has perfect pattern recognition but zero ability to look things up at generation time. Everything must be inferrable from types, conventions, and a small context document.

---

## 1. Maximally Predictable API Surface

Every component must follow identical patterns. If `LlmButton` takes `[variant]`, `[size]`, and `[disabled]`, then `LlmCard`, `LlmAlert`, and `LlmBadge` must use the same property names for the same concepts.

**Rules:**

- Use the same input name for the same concept across all components (`variant`, `size`, `disabled`).
- Use string literal union types everywhere — never enums, never numeric codes.
- Provide sensible defaults for every input so bare usage always works: `<llm-button>Click</llm-button>`.

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
- Form controls implement `FormValueControl<T>` or `FormCheckboxControl` from `@angular/forms/signals` — never legacy `ControlValueAccessor`.

```typescript
@Component({
  selector: 'llm-toggle',
  standalone: true,
  template: `...`,
})
export class LlmToggle implements FormCheckboxControl {
  /** Whether the toggle is on. Bound by [formField] directive. */
  checked = model(false);

  /** Visual variant. */
  variant = input<'default' | 'success' | 'danger'>('default');

  /** Form state: disabled by the form system. */
  disabled = input(false);

  /** Form state: whether the field has validation errors. */
  invalid = input(false);
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
<llm-card>
  <llm-card-header>Title</llm-card-header>
  <llm-card-content>Body text here.</llm-card-content>
  <llm-card-footer>
    <llm-button variant="primary">Save</llm-button>
  </llm-card-footer>
</llm-card>

<!-- Bad: opaque config object -->
<llm-card [config]="{ header: { title: '...' }, footer: { actions: [...] } }" />
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
- Imports are granular: `import { LlmButton } from '@llm-components/llm-components-angular'`.
- No barrel re-exports that pull in the entire library.

```typescript
// Good: direct, granular import
import { LlmButton, LlmCard, LlmCardHeader, LlmCardContent } from '@llm-components/llm-components-angular';

@Component({
  standalone: true,
  imports: [LlmButton, LlmCard, LlmCardHeader, LlmCardContent],
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
 * <llm-dialog [(open)]="showDialog">
 *   <llm-dialog-header>Confirm Action</llm-dialog-header>
 *   <llm-dialog-content>Are you sure?</llm-dialog-content>
 *   <llm-dialog-footer>
 *     <llm-button variant="secondary" (click)="showDialog.set(false)">Cancel</llm-button>
 *     <llm-button variant="primary" (click)="confirm()">Confirm</llm-button>
 *   </llm-dialog-footer>
 * </llm-dialog>
 * ```
 */
@Component({ ... })
export class LlmDialog {
  /** Controls dialog visibility. Supports two-way binding via [(open)]. */
  open = model(false);

  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdrop = input(true);

  /** Whether pressing Escape closes the dialog. */
  closeOnEscape = input(true);
}
```

---

## 8. Form Integration: Angular Signal Forms

Form controls integrate with Angular 21's Signal Forms (`@angular/forms/signals`). This replaces `ControlValueAccessor` entirely and aligns with our signal-only reactivity model.

**Rules:**

- Value-based controls (input, textarea, select) implement `FormValueControl<T>` and expose a `value = model<T>(...)` signal.
- Boolean toggle controls (checkbox, toggle) implement `FormCheckboxControl` and expose a `checked = model(false)` signal.
- Controls must **not** implement both interfaces. `FormValueControl` must not have `checked`; `FormCheckboxControl` must not have `value`.
- Optional state signals (`disabled`, `invalid`, `errors`, `touched`, `required`, `readonly`, `hidden`) are declared as `input()` signals. The `[formField]` directive binds them automatically.
- Validation logic lives in the form schema, never inside the control. Controls only display validation results.
- The `touched` signal uses `model()` (not `input()`) so the control can set it on blur.

```typescript
// Value control pattern
@Component({
  selector: 'llm-input',
  standalone: true,
  template: `
    <input
      [type]="type()"
      [value]="value()"
      (input)="value.set($event.target.value)"
      [disabled]="disabled()"
      [attr.aria-invalid]="invalid()"
      (blur)="touched.set(true)"
    />
  `,
})
export class LlmInput implements FormValueControl<string> {
  value = model('');
  type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');
  disabled = input(false);
  invalid = input(false);
  errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  touched = model(false);
  required = input(false);
}

// Checkbox control pattern
@Component({
  selector: 'llm-checkbox',
  standalone: true,
  template: `
    <label>
      <input type="checkbox" [checked]="checked()" (change)="checked.set(!checked())" />
      <ng-content />
    </label>
  `,
})
export class LlmCheckbox implements FormCheckboxControl {
  checked = model(false);
  disabled = input(false);
  touched = model(false);
}
```

**Consumer usage with Signal Forms:**

```typescript
@Component({
  imports: [FormField, LlmInput, LlmCheckbox],
  template: `
    <llm-input [formField]="loginForm.email" placeholder="Email" />
    <llm-checkbox [formField]="loginForm.rememberMe">Remember me</llm-checkbox>
  `,
})
export class LoginPage {
  loginModel = signal({ email: '', rememberMe: false });
  loginForm = form(this.loginModel, (schema) => {
    required(schema.email, { message: 'Email is required' });
    email(schema.email, { message: 'Enter a valid email' });
  });
}
```

---

## 9. Behavior: Follow WAI-ARIA Patterns

The LLM has deep familiarity with ARIA roles, keyboard interactions, and accessibility patterns from web standards. Following ARIA patterns means the LLM can correctly infer expected behavior.

**Rules:**

- Every interactive component implements the corresponding WAI-ARIA design pattern.
- Use native HTML elements where possible (`<button>`, `<dialog>`, `<input>`).
- Keyboard interactions follow ARIA authoring practices (arrow keys for menus, Escape to close overlays, Tab for focus order).
- Use `aria-label` or `aria-labelledby` explicitly when the purpose is not visually clear from the context.
- Never invent custom interaction models.

| Component       | ARIA Pattern            | Key Behaviors                           |
|-----------------|-------------------------|-----------------------------------------|
| `LlmDialog`     | Dialog (modal)          | Focus trap, Escape to close, backdrop   |
| `LlmTabs`       | Tabs                    | Arrow keys to switch, roving tabindex   |
| `LlmMenu`       | Menu / Menubar          | Arrow keys, Enter to select, Escape     |
| `LlmTooltip`    | Tooltip                 | Focus/hover trigger, `role="tooltip"`   |
| `LlmAccordion`  | Accordion               | Enter/Space to toggle, `aria-expanded`  |
| `LlmSelect`     | Listbox                 | Arrow keys, type-ahead, `aria-selected` |
| `LlmToggle`     | Switch                  | Space to toggle, `role="switch"`        |
| `LlmInput`      | Textbox                 | Native `<input>`, `aria-invalid`        |
| `LlmCheckbox`   | Checkbox                | Space to toggle, `aria-checked`         |
| `LlmRadio`      | Radio Group             | Arrow keys within group, `aria-checked` |

---

## 10. LLM Context File (CLAUDE.md / llm-context.md)

Ship a compressed API reference file designed to be dropped into a system prompt or Claude Code's project context. This is the single most impactful artifact for LLM code generation quality.

**Rules:**

- List every component with its selector, inputs (with types and defaults), outputs, and one minimal template example.
- Keep it under 4000 tokens.
- Update it as part of the release process — it's a first-class artifact, not an afterthought.

**Example format:**

````markdown
## LlmButton

Selector: `llm-button`

| Input      | Type                                      | Default     |
|------------|-------------------------------------------|-------------|
| `variant`  | `'primary' \| 'secondary' \| 'outline'`  | `'primary'` |
| `size`     | `'sm' \| 'md' \| 'lg'`                   | `'md'`      |
| `disabled` | `boolean`                                 | `false`     |
| `loading`  | `boolean`                                 | `false`     |

```html
<llm-button variant="primary" size="md" (click)="save()">Save</llm-button>
```

## LlmCard

Selector: `llm-card`
Sub-components: `llm-card-header`, `llm-card-content`, `llm-card-footer`

| Input     | Type                                       | Default     |
|-----------|--------------------------------------------|-------------|
| `variant` | `'elevated' \| 'outlined' \| 'flat'`      | `'elevated'`|
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'`         | `'md'`      |

```html
<llm-card variant="elevated">
  <llm-card-header>Title</llm-card-header>
  <llm-card-content>Content goes here.</llm-card-content>
</llm-card>
```
````

---

## Priority Ranking

Ordered by impact on LLM code generation quality:

1. **Consistent API patterns** across all components
2. **Signal-only reactivity** (`input`, `output`, `model` — nothing else)
3. **Narrow TypeScript types** (literal unions with defaults)
4. **Signal Forms integration** (`FormValueControl` / `FormCheckboxControl` — no CVA)
5. **Composition via content projection** (no config objects)
6. **Standalone imports** (no NgModule indirection)
7. **Inline JSDoc with examples** on every public member
8. **LLM context cheat sheet file** (compressed API reference)
9. **CSS custom properties** for theming (design tokens, not utility classes)
10. **ARIA-based behavior** (familiar, standards-aligned interaction patterns)

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
| Implicit A11y | If ARIA roles aren't explicitly used, the LLM may fail to generate accessible markup. |
| Legacy `ControlValueAccessor` for form controls | Signal Forms (`FormValueControl`/`FormCheckboxControl`) is simpler and signal-native |
| Validation logic inside controls | Validation belongs in the form schema; controls only display results |

---

## React Library (`libs/llm-components-react`)

### Rationale

The same LLM-optimized design principles that make the Angular library predictable apply directly to React. Identical prop names (`variant`, `size`, `disabled`, `loading`), identical variant unions (`'primary' | 'secondary' | 'outline'`), and the same `--ui-*` CSS token system mean LLMs can transfer knowledge between the two libraries without additional context.

React represents the other dominant frontend framework. Providing a parallel library enables AI-generated apps to use the same design system regardless of whether the user picked Angular or React.

### Framework Differences and How They Are Handled

| Angular pattern | React equivalent |
|---|---|
| `input()` / `model()` signals | Regular props with optional callback (`onValueChange`) |
| Angular injection tokens | React Context (`createContext` / `useContext`) |
| `Injectable` service (`LlmToastService`) | Custom hook (`useLlmToast()`) + `LlmToastProvider` |
| `FormValueControl` / `FormCheckboxControl` | Props with controlled/uncontrolled pattern |
| CDK `Overlay` for tooltip/select | `useState` + `useRef` + `useEffect` |
| CDK Menu keyboard nav | Custom keyboard handler in `LlmMenuTrigger` |
| `:host` CSS selector | `.llm-<component>` class on the root element |
| Content projection (`<ng-content>`) | `children: ReactNode` prop |
| Sub-components as Angular elements | Named function exports (`LlmCardHeader`, `LlmCardContent`, etc.) |

### CSS Sharing Strategy

The CSS files in `libs/llm-components-react` are adapted copies of the Angular CSS. The only transformation applied is replacing `:host` selectors with class-based equivalents:

```css
/* Angular */
:host(.variant-primary) { ... }

/* React */
.llm-button.variant-primary { ... }
```

All design tokens (`--ui-*`) are identical — both libraries import from their own copy of `tokens.css`, which is a mirror of the same file.

### Import Pattern

```typescript
import { LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
         LlmBadge, LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
         LlmRadio, LlmRadioGroup, LlmAlert, LlmSelect, LlmOption,
         LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
         LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader,
         LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
         LlmTooltip, LlmToast, LlmToastContainer, LlmToastProvider, useLlmToast,
         LlmSkeleton, LlmAvatar, LlmAvatarGroup, LlmProgress,
         LlmBreadcrumbs, LlmBreadcrumbItem, LlmPagination,
         LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter }
  from '@llm-components/llm-components-react';
```

```css
@import '@llm-components/llm-components-react/styles/tokens.css';
```

### Toast Hook Pattern

Because React has no dependency injection, the toast service is replaced by a hook:

```tsx
// In your app root
<LlmToastProvider>
  <App />
  <LlmToastContainer position="bottom-right" />
</LlmToastProvider>

// Anywhere inside the tree
const { show, dismiss, clear } = useLlmToast();
show('Saved!', { variant: 'success' });
```

### Scaffold New React Components

```bash
nx generate @llm-components/generators:llm-component-react --name=<name>
# e.g.: nx generate @llm-components/generators:llm-component-react --name=date-picker
```

Generated files: `llm-<name>.tsx`, `llm-<name>.css`, `llm-<name>.spec.tsx`, `llm-<name>.stories.tsx`
Auto-exports from `libs/llm-components-react/src/index.ts`.
