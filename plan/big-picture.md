# LLM-Optimized UI Component Library — Design Guide

This document defines the architectural principles and conventions for building a multi-framework component library (Angular, React, Vue) optimized for LLM-assisted code generation (specifically Claude) while remaining intuitive for human developers.

---

## Core Design Philosophy

Traditional component libraries are designed for humans browsing docs, copying examples, and tweaking. An LLM-optimized library flips the priorities: the LLM needs to **infer correct usage from minimal context** and **produce working code on the first attempt** without browsing a docs site.

Design for a developer who has perfect pattern recognition but zero ability to look things up at generation time. Everything must be inferrable from types, conventions, and a small context document.

---

## 1. Maximally Predictable API Surface

Every component must follow identical patterns. If `AtlButton` takes `[variant]`, `[size]`, and `[disabled]`, then `AtlCard`, `AtlAlert`, and `AtlBadge` must use the same property names for the same concepts.

**Rules:**

- Use the same input name for the same concept across all components (`variant`, `size`, `disabled`).
- Use string literal union types everywhere — never enums, never numeric codes.
- Provide sensible defaults for every input so bare usage always works: `<atl-button>Click</atl-button>`.

```typescript
// Good: predictable, narrow, self-documenting
variant = input<'primary' | 'secondary' | 'outline' | 'danger'>('primary');
size = input<'sm' | 'md' | 'lg'>('md');
disabled = input(false);

// Bad: inconsistent naming, wide types
kind = input<string>('default');
scale = input<number>(2);
```

---

## 2. Signals as the Single Reactivity Model

Use Angular 22 signal primitives exclusively. No `@Input()` / `@Output()` decorators. One mental model means one pattern for the LLM to follow.

**Rules:**

- `input()` for all inputs.
- `output()` for all event outputs.
- `model()` for two-way bound state.
- `computed()` and `effect()` internally — never exposed as public API.
- Form controls implement `FormValueControl<T>` or `FormCheckboxControl` from `@angular/forms/signals` — never legacy `ControlValueAccessor`.

```typescript
@Component({
  selector: 'atl-toggle',
  standalone: true,
  template: `...`,
})
export class AtlToggle implements FormCheckboxControl {
  /** Whether the toggle is on. Bound by [formField] directive. */
  checked = model(false);

  /** Form state: disabled by the form system. */
  disabled = input(false);

  /** Form state: whether the field has validation errors. */
  invalid = input(false);
}
```

*(The real `AtlToggle` has no `variant` input — `AtlToggleSpec` in `libs/spec/src/index.ts`
carries only `checked`/`onCheckedChange` plus the shared form-field state. An earlier
draft of this example invented one; cut rather than carried forward.)*

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
<atl-card>
  <atl-card-header>Title</atl-card-header>
  <atl-card-content>Body text here.</atl-card-content>
  <atl-card-footer>
    <atl-button variant="primary">Save</atl-button>
  </atl-card-footer>
</atl-card>

<!-- Bad: opaque config object -->
<atl-card [config]="{ header: { title: '...' }, footer: { actions: [...] } }" />
```

---

## 5. Styling: CSS Custom Properties + Design Tokens

Components consume a design token layer internally. Users (human or LLM) don't think about styling — they pick a `variant` and the tokens handle the rest.

**Rules:**

- All visual decisions are driven by CSS custom properties (design tokens).
- Components never accept arbitrary class or style inputs for internal elements.
- Theming is done by overriding token values, not by passing Tailwind classes.
- Layout around components (page structure, spacing) is the consumer's responsibility.

Token *names* are the stable part of this API and are safe to memorize; token *values*
are not — they have already changed once (the "Direction A" teal rebrand moved
`--ui-color-primary` off blue, and the radius scale moved with it), so this example
shows names and purpose only. Read current values from the one canonical file
(`libs/create-workspace/src/generators/preset/files/styles/tokens.css`, ADR-0115) —
every other `tokens.css` in the repo is a generated projection of it via
`npm run sync:tokens`.

| Token name | Purpose |
|---|---|
| `--ui-color-primary`, `--ui-color-primary-hover` | Brand accent, and its hover state |
| `--ui-color-secondary`, `--ui-color-danger` | Secondary actions; destructive actions |
| `--ui-color-surface`, `--ui-color-border` | Card/dialog background; decorative borders |
| `--ui-color-text`, `--ui-color-text-muted` | Body text; secondary text |
| `--ui-radius-sm` / `-md` / `-lg` | Small controls, chips / default control radius / cards, dialogs |
| `--ui-spacing-1` … `-8` | 4px base-unit ladder; `-4` is the most common gap/padding |
| `--ui-font-size-sm` / `-md` / `-lg` | Type scale; `-md` is body text |
| `--ui-shadow-sm` / `-md` | Subtle elevation / raised surfaces (dialogs, popovers) |
| `--ui-transition-fast` / `-normal` | Hover/focus feedback timing |

(Deliberately not shown as a `:root { }` block with literal values — a copy-pasted
value here would be wrong the moment the brand changes again, and an agent generating
code from this document should read a real value from the canonical file, not from a
number that was accurate on 2026-09-09.)

```css
/* Inside a component's styles — consumes tokens only. Angular selects on
   :host; React and Vue use a class on the component's root element instead
   (see the Framework Differences table below) — both patterns are real,
   verified against libs/angular/src/lib/button/atl-button.css. */
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
- Imports are granular: `import { AtlButton } from '@atelier-ui/angular'`.
- No barrel re-exports that pull in the entire library.

```typescript
// Good: direct, granular import
import { AtlButton, AtlCard, AtlCardHeader, AtlCardContent } from '@atelier-ui/angular';

@Component({
  standalone: true,
  imports: [AtlButton, AtlCard, AtlCardHeader, AtlCardContent],
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

The example below is copied verbatim (rules only) from the real `AtlDialog`
(`libs/angular/src/lib/dialog/atl-dialog.ts`) rather than invented — the same class,
props and defaults it ships today.

```typescript
/**
 * Accessible modal dialog using the native `<dialog>` element.
 * Includes focus trap, Escape to close, backdrop click to close, and animation.
 * Compose with `atl-dialog-header`, `atl-dialog-content`, and `atl-dialog-footer`.
 *
 * Usage:
 * ```html
 * <atl-dialog [(open)]="isOpen">
 *   <atl-dialog-header>Dialog Title</atl-dialog-header>
 *   <atl-dialog-content>Dialog body content.</atl-dialog-content>
 *   <atl-dialog-footer>
 *     <atl-button variant="primary" (click)="isOpen = false">Confirm</atl-button>
 *   </atl-dialog-footer>
 * </atl-dialog>
 * ```
 */
@Component({ ... })
export class AtlDialog {
  /** Whether the dialog is open. Two-way bindable via [(open)]. */
  open = model(false);

  /** Whether clicking the backdrop closes the dialog. */
  closeOnBackdrop = input(true);

  /** Dialog size. */
  size = input<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md');
}
```

*(There is no `closeOnEscape` input — Escape-to-close is unconditional native `<dialog>`
behavior, not a configurable prop. An earlier draft of this example showed one; cut.)*

---

## 8. Form Integration: Angular Signal Forms

Form controls integrate with Angular 22's Signal Forms (`@angular/forms/signals`). This replaces `ControlValueAccessor` entirely and aligns with our signal-only reactivity model.

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
  selector: 'atl-input',
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
export class AtlInput implements FormValueControl<string> {
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
  selector: 'atl-checkbox',
  standalone: true,
  template: `
    <label>
      <input type="checkbox" [checked]="checked()" (change)="checked.set(!checked())" />
      <ng-content />
    </label>
  `,
})
export class AtlCheckbox implements FormCheckboxControl {
  checked = model(false);
  disabled = input(false);
  touched = model(false);
}
```

**Consumer usage with Signal Forms:**

```typescript
@Component({
  imports: [FormField, AtlInput, AtlCheckbox],
  template: `
    <atl-input [formField]="loginForm.email" placeholder="Email" />
    <atl-checkbox [formField]="loginForm.rememberMe">Remember me</atl-checkbox>
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

Every row below is verified against the real component template (`role="…"` attributes
in `libs/angular/src/lib/**/*.ts`), not carried forward from description alone:

| Component       | ARIA Pattern                | Key Behaviors                           |
|-----------------|------------------------------|------------------------------------------|
| `AtlDialog`     | Dialog (modal)               | Focus trap, Escape to close, backdrop   |
| `AtlTabGroup`   | Tabs                         | Arrow keys to switch, roving tabindex   |
| `AtlMenu`       | Menu / Menubar               | Arrow keys, Enter to select, Escape     |
| `AtlTooltip`    | Tooltip                      | Focus/hover trigger, `role="tooltip"`   |
| `AtlAccordionGroup` | Accordion                | Enter/Space to toggle, `aria-expanded`  |
| `AtlSelect`     | Combobox (listbox popup)     | Arrow keys, type-ahead, `aria-selected`, `aria-expanded` on the trigger (`role="combobox"` + `role="listbox"`, ADR-0109) |
| `AtlToggle`     | Switch                       | Space to toggle, `role="switch"`        |
| `AtlInput`      | Textbox                      | Native `<input>`, `aria-invalid`        |
| `AtlCheckbox`   | Checkbox                     | Space to toggle, native `<input type="checkbox">` |
| `AtlRadioGroup` | Radio Group                  | Arrow keys within group, `role="radiogroup"` |

---

## 10. LLM Context File — generated, not hand-maintained

Ship a compressed API reference file designed to be dropped into a system prompt or an
agent's project context. This is the single most impactful artifact for LLM code
generation quality — and, unlike everything else on this page, it is not a principle
to apply by hand. It is already built: `npm run gen:llms`
(`tools/scripts/gen-llms-txt.mjs`) generates `docs/public/llms-full.txt` from the same
component data the docs site renders (props, defaults, descriptions, per-framework
usage), and `check:llms` — part of both `check:all` and `sync:generated` — fails the
build the moment the checked-in file and a fresh generator run disagree. A hand-copied
context file cannot make that promise; a generated, gated one can.

**Rules:**

- Generate it from the same source the docs site reads (`docs/src/data/components.ts`)
  — never hand-author or hand-edit it. A generator run is one command away; a forgotten
  manual edit is not detectable until someone notices the drift.
- Cover every framework's calling convention in one file, not one framework's syntax
  assumed to generalize — the generated file opens with a "Framework Syntax
  Cheatsheet" translating JSX-as-lingua-franca into Angular and Vue idioms before the
  first component entry.
- Gate it (`check:llms`) so a docs change that isn't reflected in the generated file
  fails CI instead of silently drifting.

**Excerpt of the real generated file** (`docs/public/llms-full.txt`, trimmed —
component count and package version inside this quote are the file's own words as of
this rewrite, not a fact this document is asserting on its own account):

````markdown
# Atelier UI — Full API Reference

> Complete component API for LLM consumption. 28 accessible components for Angular,
> React, and Vue with consistent prop naming across all frameworks.
> Version 0.2.41 | https://atelier.pieper.io

### AtlButton

  A versatile button component with multiple variants and sizes. Supports loading and disabled states.

  Props:
    variant     'primary' | 'secondary' | 'outline' | 'danger'  'primary'  Visual style variant
    size        'sm' | 'md' | 'lg'                              'md'       Size of the button
    disabled    boolean                                         false      Disables the button
    loading     boolean                                         false      Shows a loading spinner, disables interaction
    aria-label  string                                          —          Accessible name. Required for icon-only buttons (no children).

  Usage:
    Angular:
      <atl-button variant="primary">Primary</atl-button>
      <atl-button [loading]="true">Loading</atl-button>
    React:
      <AtlButton variant="primary">Primary</AtlButton>
      <AtlButton loading={true}>Loading</AtlButton>
    Vue:
      <AtlButton variant="primary">Primary</AtlButton>
      <AtlButton :loading="true">Loading</AtlButton>
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
8. **Generated LLM context file** (`llms-full.txt`, gated by `check:llms` — not hand-maintained)
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

## Framework Adapters: React and Vue

### Rationale

The same LLM-optimized design principles that make the Angular library predictable
apply directly to React and Vue. Identical prop names (`variant`, `size`, `disabled`,
`loading`), identical variant unions, and the same `--ui-*` CSS token system mean an
LLM can transfer knowledge between all three libraries without additional context.

Both frameworks are held to the same `libs/spec` contract Angular is — by the gate
chain, not the compiler. Only React's props interfaces extend the spec at the type level;
Angular's signal inputs and Vue's hand-written props are compared against it by
`check:props` (ADR-0093), and the axis literals by `check:variants` and `check:defaults`.
A prop renamed in the spec is therefore a red gate in all three adapters — not a type
error in all three, and not a note someone has to remember to apply three times either.

### Framework Differences and How They Are Handled

Verified against `libs/angular/src/lib/toast/atl-toast.ts` (`AtlToastService`),
`libs/react/src/lib/toast/atl-toast.tsx` (`useAtlToast`, `AtlToastProvider`) and
`libs/vue/src/lib/toast/atl-toast.ts` + `atl-toast-provider.vue`
(`useAtlToast`, `AtlToastProvider`, Vue `provide`/`inject`) as the representative case
for dependency injection, plus the button, card and dialog components for the rest.

| Angular pattern | React equivalent | Vue equivalent |
|---|---|---|
| `input()` / `model()` signals | Regular props with optional callback (`onValueChange`) | Typed `defineProps<...>()` + `v-model`-style prop/`update:*` emit pair |
| Angular injection tokens (`ATL_DIALOG`, `ATL_TAB_GROUP`, …) | React Context (`createContext` / `useContext`) | Vue `provide`/`inject` with a typed `InjectionKey` (e.g. `AtlToastKey`) |
| `Injectable` service (`AtlToastService`) | Custom hook (`useAtlToast()`) + `AtlToastProvider` | Composable (`useAtlToast()`) + `AtlToastProvider` component, same `provide`/`inject` pair |
| `FormValueControl` / `FormCheckboxControl` | Controlled props (`value`/`onValueChange`, `checked`/`onCheckedChange`) | Controlled props + `v-model` emits (`value`/`update:value`, `checked`/`update:checked`) |
| CDK `A11y` (focus trap in `AtlDialog`) | `useRef` + manual focus management | `ref` + `onMounted`/composable — no CDK equivalent; Vue has no CDK dependency |
| CDK Menu keyboard nav | Custom keyboard handler in the component (`AtlMenuTrigger`) | Custom keyboard handler in the component (`AtlMenuTrigger`) |
| `:host` CSS selector | `.atl-<component>` class on the root element | `.atl-<component>` class on the root element (same convention as React, not scoped `<style scoped>`) |
| Content projection (`<ng-content>`) | `children: ReactNode` prop | Default `<slot />` |
| Sub-components as Angular elements | Named function exports (`AtlCardHeader`, `AtlCardContent`, etc.) | Named SFC exports (`AtlCardHeader.vue`, etc.), same one-component-per-file split |

### CSS Sharing Strategy

The CSS files in `libs/react` and `libs/vue` are adapted copies of the Angular CSS. The
only transformation applied is replacing `:host` selectors with class-based
equivalents on the component's root element — verified identical in both frameworks
(`libs/react/src/lib/button/atl-button.css`, `libs/vue/src/lib/button/atl-button.css`):

```css
/* Angular */
:host(.variant-primary) { ... }

/* React and Vue */
.atl-button.variant-primary { ... }
```

Design tokens (`--ui-*`) are not hand-copied between frameworks: every library's
`styles/tokens.css` is a generated projection of one canonical file, regenerated
together by `npm run sync:tokens` (ADR-0115). Editing a value in the canonical file
and running that one script keeps all three in sync; editing a framework's copy
directly is drift.

### Import Pattern

```typescript
// React — libs/react/src/index.ts re-exports every component below.
// Vue equivalents have the same names; import from '@atelier-ui/vue' instead.
import {
  AtlButton, AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter,
  AtlBadge, AtlIcon, AtlInput, AtlTextarea, AtlCheckbox, AtlToggle,
  AtlRadio, AtlRadioGroup, AtlAlert, AtlSelect, AtlOption, AtlCombobox,
  AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter,
  AtlTabGroup, AtlTab, AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader,
  AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger,
  AtlTooltip, AtlToastProvider, AtlToastContainer, useAtlToast,
  AtlSkeleton, AtlAvatar, AtlAvatarGroup, AtlProgress,
  AtlBreadcrumbs, AtlBreadcrumbItem, AtlPagination,
  AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter,
  AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd,
  AtlStepper, AtlStep, AtlCodeBlock,
  AtlChat, AtlChatHeader, AtlChatMessages, AtlChatMessage,
  AtlChatTyping, AtlChatSuggestion, AtlChatInput,
} from '@atelier-ui/react';
```

```css
@import '@atelier-ui/react/styles/tokens.css';
/* or: @import '@atelier-ui/vue/styles/tokens.css'; */
```

### Toast Hook Pattern

React has no dependency injection, so the toast service becomes a hook; Vue reaches
the same shape through its own native `provide`/`inject`, not through a service class
either:

```tsx
// React — in your app root
<AtlToastProvider>
  <App />
  <AtlToastContainer position="bottom-right" />
</AtlToastProvider>

// Anywhere inside the tree
const { show, dismiss, clear } = useAtlToast();
show('Saved!', { variant: 'success' });
```

```vue
<!-- Vue — in your app root -->
<AtlToastProvider>
  <App />
  <AtlToastContainer position="bottom-right" />
</AtlToastProvider>
```
```typescript
// Anywhere inside the tree
import { useAtlToast } from '@atelier-ui/vue';
const { show, dismiss, clear } = useAtlToast();
show('Saved!', { variant: 'success' });
```

### Scaffold New Components

```bash
# Scaffolds Angular + React + Vue together by default:
nx generate @atelier-ui/generators:atl-component --name=<name>
# Target one framework: --framework=angular|react|vue|both|all

# Or the framework-specific generators directly:
nx generate @atelier-ui/generators:atl-component-react --name=<name>
nx generate @atelier-ui/generators:atl-component-vue --name=<name>
```

Generated files (verified against `libs/react/src/lib/button/` and
`libs/vue/src/lib/button/`):

- React: `atl-<name>.tsx`, `atl-<name>.css`, `atl-<name>.spec.tsx`, `atl-<name>.stories.tsx`
- Vue: `atl-<name>.vue`, `atl-<name>.css`, `atl-<name>.spec.ts`, `atl-<name>.stories.ts`

Each generator appends the new export to the target library's own `index.ts`
automatically (`libs/{angular,react,vue}/src/index.ts` — verified in
`tools/generators/{atl-component,atl-component-react,atl-component-vue}/index.ts`); no
manual export step needed.

---

## AtlChat

A top-level library category, **AI**, sits alongside the existing five Storybook
sidebar categories (`Inputs`, `Display`, `Navigation`, `Overlay`, `Feedback` —
verified against `storySort.order` and every story's `title:` prefix in
`libs/{angular,react,vue}/.storybook/preview.*`). It is reserved for AI-surface
components — chat panels, prompt cards, agent traces, tool-call indicators, etc. —
that don't fit cleanly into the existing taxonomy.

Its first component is **`AtlChat`**, an AI assistant surface. Implementation is
**provider-agnostic** — wrapper takes `variant` / `status` / `open`; everything else is
composed via slots. Wiring to CopilotKit, Vercel AI SDK, or a custom backend is a thin
downstream adapter on top of the `(send)` / `(stop)` events.

### Variants and States

| Variant | Description | States |
|---|---|---|
| `drawer` | Right-anchored slide-in panel, full viewport height. Built on native `<dialog>` + CDK A11y focus trap (Angular). | idle · streaming · error |
| `popup` | Floating bubble (bottom-right) that opens a compact 380×560 chat window. | idle · streaming · error |
| `inline` | Embedded as a regular page surface — uses `AtlCard` chrome, no overlay, no close button. | idle · streaming · error |

All states use only existing design tokens — primary teal for the user bubble,
`brand-ai` lime for the assistant accent, `surface-sunken` for assistant bubbles,
`danger` for connection errors and the Stop button.

*(`AtlChatSpec.status` is `'idle' | 'streaming' | 'error'` — three values. The fourth
frame per variant below, "Empty", is a content state — zero messages rendered — not a
fourth `status` value; verified against `libs/spec/src/index.ts` and the real Storybook
stories: `DrawerDefault` / `DrawerEmpty` / `DrawerStreaming` / `DrawerError`, same
pattern × 3 variants.)*

### Sub-component composition

Verified against `libs/react/src/index.ts` — Vue and Angular export the same set:

```
AtlChat                   – Wrapper, holds variant / status / open
├── AtlChatHeader          – Title block + auto close button (hidden on inline)
├── AtlChatMessages        – Scrollable message list
│   ├── AtlChatMessage     – role: 'user' | 'assistant' | 'system', + failed flag
│   ├── AtlChatTyping      – three animated dots, prefers-reduced-motion aware
│   └── AtlChatSuggestion  – tappable starter chip with label + hint
└── AtlChatInput           – textarea + Send button, swaps to danger Stop while streaming
```

### Figma reference

File: `Atelier` (key `QMnDD8uZQPldPrlCwZZ58T`), page `Components`, top-level section
**AI**. Three variant sub-sections (`AtlChat / drawer`, `AtlChat / popup`, `AtlChat /
inline`) each contain four state frames — 12 in total, matching the 12 Storybook
stories per framework below. All Atelier components inside the mockups are real
instances (not detached primitives) so design changes propagate automatically.

### Implementation status

| Area | Status |
|---|---|
| Figma mockups (12 frames) | shipped |
| `AtlButton` `danger` variant (used by Stop button) | shipped (`d46dc94`) |
| Spec types in `libs/spec/src/index.ts` | shipped |
| Angular implementation (`libs/angular/src/lib/chat/`) | shipped (`fc01c4b`) |
| React implementation (`libs/react/src/lib/chat/`) | shipped (`02d7e94`) |
| Vue implementation (`libs/vue/src/lib/chat/`) | shipped (`9cb1fdc`) |
| Storybook stories (12 per framework, mirroring Figma) | shipped |
| Tests (Angular, React, Vue) | shipped |
| Docs entry in `docs/src/data/components.ts` + AI category | shipped (`104ff47`) |
| CopilotKit adapter | deferred — visual surface only for now |
| Vercel AI SDK adapter | not on the roadmap |
