## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## MCP Servers

- Always use the **Nx MCP server** and **Angular CLI MCP server** available in this project.
- Use `list_projects` and `nx_docs` as a first step to understand the workspace before making changes.
- Prefer MCP tools (e.g., `get_best_practices`, `search_documentation`, `find_examples`) over guessing Angular/Nx conventions.

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Big Picture
- The project idea are in `plan`

---

## Component API Reference

### LlmButton

Selector: `llm-button`

| Input | Type | Default |
|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `disabled` | `boolean` | `false` |
| `loading` | `boolean` | `false` |

```html
<llm-button variant="primary" size="md" (click)="save()">Save</llm-button>
<llm-button variant="outline" [disabled]="isDisabled">Cancel</llm-button>
<llm-button [loading]="isSaving">Saving…</llm-button>
```

### LlmCard

Selector: `llm-card`
Sub-components: `llm-card-header`, `llm-card-content`, `llm-card-footer`

| Input | Type | Default |
|---|---|---|
| `variant` | `'elevated' \| 'outlined' \| 'flat'` | `'elevated'` |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` |

```html
<llm-card variant="elevated" padding="md">
  <llm-card-header>Title</llm-card-header>
  <llm-card-content>Body text here.</llm-card-content>
  <llm-card-footer>
    <llm-button variant="primary" size="sm">Save</llm-button>
  </llm-card-footer>
</llm-card>
```

### LlmBadge

Selector: `llm-badge`

| Input | Type | Default |
|---|---|---|
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `size` | `'sm' \| 'md'` | `'md'` |

```html
<llm-badge variant="success">Active</llm-badge>
<llm-badge variant="danger" size="sm">Error</llm-badge>
```

### LlmInput

Selector: `llm-input`
Implements: `FormValueControl<string>` from `@angular/forms/signals`

| Input | Type | Default |
|---|---|---|
| `value` | `model<string>` | `''` |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'` |
| `placeholder` | `string` | `''` |
| `disabled` | `boolean` | `false` |
| `readonly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `touched` | `model<boolean>` | `false` |
| `errors` | `readonly WithOptionalField<ValidationError>[]` | `[]` |
| `name` | `string` | `''` |

```html
<!-- Standalone usage -->
<llm-input type="email" placeholder="you@example.com" [(value)]="email" />

<!-- With Signal Forms -->
<llm-input [formField]="loginForm.email" placeholder="Email" />
```

### LlmTextarea

Selector: `llm-textarea`
Implements: `FormValueControl<string>` from `@angular/forms/signals`

| Input | Type | Default |
|---|---|---|
| `value` | `model<string>` | `''` |
| `rows` | `number` | `3` |
| `placeholder` | `string` | `''` |
| `disabled` | `boolean` | `false` |
| `readonly` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `touched` | `model<boolean>` | `false` |
| `errors` | `readonly WithOptionalField<ValidationError>[]` | `[]` |
| `name` | `string` | `''` |
| `autoResize` | `boolean` | `false` |

```html
<!-- Standalone usage -->
<llm-textarea placeholder="Tell us about yourself" [rows]="4" [(value)]="bio" />

<!-- Auto-growing height -->
<llm-textarea [autoResize]="true" placeholder="Start typing..." />

<!-- With Signal Forms -->
<llm-textarea [formField]="form.description" placeholder="Description" />
```

### LlmCheckbox

Selector: `llm-checkbox`
Implements: `FormCheckboxControl` from `@angular/forms/signals`

| Input | Type | Default |
|---|---|---|
| `checked` | `model<boolean>` | `false` |
| `touched` | `model<boolean>` | `false` |
| `indeterminate` | `boolean` | `false` |
| `disabled` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `errors` | `readonly WithOptionalField<ValidationError>[]` | `[]` |
| `name` | `string` | `''` |

```html
<!-- Standalone usage -->
<llm-checkbox [(checked)]="accepted">I agree to the terms</llm-checkbox>

<!-- Indeterminate (select all) -->
<llm-checkbox [indeterminate]="someChecked" [(checked)]="allChecked">Select all</llm-checkbox>

<!-- With Signal Forms -->
<llm-checkbox [formField]="form.accepted">Accept</llm-checkbox>
```

### LlmToggle

Selector: `llm-toggle`
Implements: `FormCheckboxControl` from `@angular/forms/signals`

| Input | Type | Default |
|---|---|---|
| `checked` | `model<boolean>` | `false` |
| `touched` | `model<boolean>` | `false` |
| `disabled` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `errors` | `readonly WithOptionalField<ValidationError>[]` | `[]` |
| `name` | `string` | `''` |

```html
<!-- Standalone usage -->
<llm-toggle [(checked)]="enabled">Enable notifications</llm-toggle>

<!-- With Signal Forms -->
<llm-toggle [formField]="form.enabled">Enable</llm-toggle>
```

### LlmRadioGroup + LlmRadio

Selectors: `llm-radio-group`, `llm-radio`
`LlmRadioGroup` implements: `FormValueControl<string>` from `@angular/forms/signals`

#### LlmRadioGroup

| Input | Type | Default |
|---|---|---|
| `value` | `model<string>` | `''` |
| `touched` | `model<boolean>` | `false` |
| `disabled` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `name` | `string` | `''` |
| `errors` | `readonly WithOptionalField<ValidationError>[]` | `[]` |

#### LlmRadio

| Input | Type | Default |
|---|---|---|
| `radioValue` | `string` | required |
| `disabled` | `boolean` | `false` |

```html
<!-- Standalone usage -->
<llm-radio-group [(value)]="plan" name="plan">
  <llm-radio radioValue="free">Free</llm-radio>
  <llm-radio radioValue="pro">Pro</llm-radio>
  <llm-radio radioValue="enterprise">Enterprise</llm-radio>
</llm-radio-group>

<!-- With Signal Forms -->
<llm-radio-group [formField]="form.plan">
  <llm-radio radioValue="free">Free</llm-radio>
  <llm-radio radioValue="pro">Pro</llm-radio>
</llm-radio-group>
```

Arrow key navigation (Up/Left = previous, Down/Right = next) is handled automatically by the group. The group propagates `name` to all child radios.

### LlmSelect + LlmOption

Selectors: `llm-select`, `llm-option`
`LlmSelect` implements: `FormValueControl<string>` from `@angular/forms/signals`

#### LlmSelect

| Input | Type | Default |
|---|---|---|
| `value` | `model<string>` | `''` |
| `placeholder` | `string` | `''` |
| `disabled` | `boolean` | `false` |
| `invalid` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `touched` | `model<boolean>` | `false` |
| `errors` | `readonly WithOptionalField<ValidationError>[]` | `[]` |
| `name` | `string` | `''` |

#### LlmOption

| Input | Type | Default |
|---|---|---|
| `optionValue` | `string` | required |
| `disabled` | `boolean` | `false` |

```html
<!-- Standalone usage -->
<llm-select [(value)]="country" placeholder="Select a country">
  <llm-option optionValue="us">United States</llm-option>
  <llm-option optionValue="ca">Canada</llm-option>
  <llm-option optionValue="uk" [disabled]="true">United Kingdom (unavailable)</llm-option>
</llm-select>

<!-- With Signal Forms -->
<llm-select [formField]="form.country" placeholder="Select a country">
  <llm-option optionValue="us">United States</llm-option>
  <llm-option optionValue="ca">Canada</llm-option>
</llm-select>
```

Keyboard navigation: ArrowDown/Up (navigate options), Enter/Space (select or open), Escape (close), Home/End (first/last enabled option), printable char (type-ahead with 500ms reset). Uses native Popover API with `popover="manual"`.

### Scaffold new components

```bash
nx generate @angular-llm-components/generators:llm-component --name=<name>
# e.g.: nx generate @angular-llm-components/generators:llm-component --name=alert
```

Generated files: `llm-<name>.ts`, `llm-<name>.css`, `llm-<name>.spec.ts`, `llm-<name>.stories.ts`
Auto-exports from `libs/llm-components/src/index.ts`.

### Import pattern

```typescript
import { LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter, LlmBadge, LlmInput, LlmTextarea, LlmCheckbox, LlmToggle, LlmRadio, LlmRadioGroup }
  from '@angular-llm-components/llm-components';
```

### Design tokens

```css
@import '@angular-llm-components/llm-components/styles/tokens.css';
```

All tokens use the `--ui-*` prefix. Key tokens: `--ui-color-primary`, `--ui-color-secondary`, `--ui-color-danger`, `--ui-color-surface`, `--ui-color-border`, `--ui-color-text`, `--ui-radius-sm/md/lg`, `--ui-spacing-1..8`, `--ui-shadow-sm/md`.
