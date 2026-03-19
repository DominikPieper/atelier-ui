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

### Storybook MCP Workflows

**When creating or editing components/stories:**
1. Call `get-storybook-story-instructions` before writing any code
2. After any change, call `preview-stories` and include the returned URLs in your response
3. Run `run-story-tests` after each change — fix failures before reporting completion

**When reading component docs:**
1. Call `list-all-documentation` once at session start to get valid IDs
2. Use `get-documentation` with those IDs — never guess IDs or invent props
3. If a prop isn't documented, say so rather than inventing it

**Which MCP to use:**
- Angular components → `storybook-angular` MCP
- React components → `storybook-react` MCP

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Big Picture
- The project idea are in `plan`

---

## Component API Reference

### LlmAvatar + LlmAvatarGroup

Selectors: `llm-avatar`, `llm-avatar-group`

Fallback order: image → initials (from `name`) → generic icon placeholder.

#### LlmAvatar

| Input | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` | `''` | Image URL |
| `alt` | `string` | `''` | Alt text / aria-label |
| `name` | `string` | `''` | Used for initials fallback and aria-label |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | |
| `shape` | `'circle' \| 'square'` | `'circle'` | |
| `status` | `'online' \| 'offline' \| 'away' \| 'busy' \| ''` | `''` | Dot indicator |

#### LlmAvatarGroup

| Input | Type | Default |
|---|---|---|
| `max` | `number` | `5` |
| `size` | same as LlmAvatar size | `'md'` |

```html
<!-- Standalone image avatar -->
<llm-avatar src="https://example.com/photo.jpg" alt="Jane Doe" size="md" status="online" />

<!-- Initials fallback -->
<llm-avatar name="John Smith" size="lg" shape="square" />

<!-- Group with overflow -->
<llm-avatar-group [max]="3" size="md">
  <llm-avatar src="..." name="Alice" />
  <llm-avatar src="..." name="Bob" />
  <llm-avatar src="..." name="Carol" />
  <llm-avatar src="..." name="Dave" />
</llm-avatar-group>
```

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
| `errors` | `readonly WithOptionalFieldTree<ValidationError>[]` | `[]` |
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
| `errors` | `readonly WithOptionalFieldTree<ValidationError>[]` | `[]` |
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
| `errors` | `readonly WithOptionalFieldTree<ValidationError>[]` | `[]` |
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
| `errors` | `readonly WithOptionalFieldTree<ValidationError>[]` | `[]` |
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
| `errors` | `readonly WithOptionalFieldTree<ValidationError>[]` | `[]` |

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
| `errors` | `readonly WithOptionalFieldTree<ValidationError>[]` | `[]` |
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

### LlmAlert

Selector: `llm-alert`

| Input | Type | Default |
|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` |
| `dismissible` | `boolean` | `false` |

| Output | Description |
|---|---|
| `dismissed` | Emitted when the dismiss button is clicked |

```html
<llm-alert variant="success">Your changes were saved.</llm-alert>
<llm-alert variant="warning" [dismissible]="true" (dismissed)="onDismiss()">
  Your session expires soon.
</llm-alert>
<llm-alert variant="danger">Something went wrong.</llm-alert>
```

### LlmDialog

Selector: `llm-dialog`
Sub-components: `llm-dialog-header`, `llm-dialog-content`, `llm-dialog-footer`

Uses the native `<dialog>` element with `showModal()`. Includes focus trap, Escape to close, backdrop click to close, and entry/exit animation via `@starting-style`.

#### LlmDialog

| Input | Type | Default |
|---|---|---|
| `open` | `model<boolean>` | `false` |
| `closeOnBackdrop` | `boolean` | `true` |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` |
| `aria-label` | `string` | `''` |
| `aria-labelledby` | `string` | `''` |

```html
<!-- Basic usage -->
<llm-button (click)="isOpen = true">Open</llm-button>
<llm-dialog [(open)]="isOpen">
  <llm-dialog-header>Confirm Action</llm-dialog-header>
  <llm-dialog-content>
    Are you sure you want to proceed?
  </llm-dialog-content>
  <llm-dialog-footer>
    <llm-button variant="outline" (click)="isOpen = false">Cancel</llm-button>
    <llm-button variant="primary" (click)="isOpen = false">Confirm</llm-button>
  </llm-dialog-footer>
</llm-dialog>

<!-- No backdrop close -->
<llm-dialog [(open)]="isOpen" [closeOnBackdrop]="false">
  <llm-dialog-header>Required Action</llm-dialog-header>
  <llm-dialog-content>You must respond to this dialog.</llm-dialog-content>
  <llm-dialog-footer>
    <llm-button variant="primary" (click)="isOpen = false">OK</llm-button>
  </llm-dialog-footer>
</llm-dialog>
```

`llm-dialog-header` automatically receives an `id` used as `aria-labelledby` on the `<dialog>`. Tab cycling is trapped within the dialog. Focus returns to the triggering element on close.

### LlmTabGroup + LlmTab

Selectors: `llm-tab-group`, `llm-tab`

Accessible tabbed interface with roving tabindex and automatic activation.

#### LlmTabGroup

| Input | Type | Default |
|---|---|---|
| `selectedIndex` | `model<number>` | `0` |
| `variant` | `'default' \| 'pills'` | `'default'` |

#### LlmTab

| Input | Type | Default |
|---|---|---|
| `label` | `string` | required |
| `disabled` | `boolean` | `false` |

```html
<!-- Basic usage -->
<llm-tab-group [(selectedIndex)]="activeTab">
  <llm-tab label="Account">Account settings here.</llm-tab>
  <llm-tab label="Notifications">Notification prefs here.</llm-tab>
  <llm-tab label="Billing" [disabled]="true">Billing info here.</llm-tab>
</llm-tab-group>

<!-- Pills variant -->
<llm-tab-group variant="pills">
  <llm-tab label="All">All items.</llm-tab>
  <llm-tab label="Active">Active items.</llm-tab>
</llm-tab-group>
```

Keyboard navigation: ArrowRight/Left (navigate and activate, wraps), Home/End (first/last enabled tab), arrow keys skip disabled tabs. Uses `role="tablist"` / `role="tab"` / `role="tabpanel"` with `aria-selected`, `aria-controls`, `aria-labelledby`.

### LlmAccordionGroup + LlmAccordionItem

Selectors: `llm-accordion-group`, `llm-accordion-item`
Directive: `llmAccordionHeader`

#### LlmAccordionGroup

| Input | Type | Default |
|---|---|---|
| `multi` | `boolean` | `false` |
| `variant` | `'default' \| 'bordered' \| 'separated'` | `'default'` |

#### LlmAccordionItem

| Input | Type | Default |
|---|---|---|
| `expanded` | `model<boolean>` | `false` |
| `disabled` | `boolean` | `false` |

Content projection: `[llmAccordionHeader]` for header text, default slot for body.

```html
<!-- Basic usage -->
<llm-accordion-group>
  <llm-accordion-item [(expanded)]="faqOpen">
    <span llmAccordionHeader>Question 1</span>
    Answer content here.
  </llm-accordion-item>
  <llm-accordion-item>
    <span llmAccordionHeader>Question 2</span>
    Another answer.
  </llm-accordion-item>
</llm-accordion-group>

<!-- Multi-expand with separated variant -->
<llm-accordion-group [multi]="true" variant="separated">
  <llm-accordion-item>
    <span llmAccordionHeader>Section A</span>
    Content A.
  </llm-accordion-item>
  <llm-accordion-item>
    <span llmAccordionHeader>Section B</span>
    Content B.
  </llm-accordion-item>
</llm-accordion-group>
```

Keyboard navigation: ArrowUp/Down (navigate headers, wraps), Home/End (first/last enabled item), Enter/Space (toggle via native button). Arrow keys skip disabled items. Uses `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`. CSS grid animation (`0fr` → `1fr`) for smooth expand/collapse.

### LlmMenu + LlmMenuItem

Selectors: `llm-menu`, `llm-menu-item`, `llm-menu-separator`
Directive: `[llmMenuTriggerFor]`

Built on `@angular/cdk/menu` — CDK handles keyboard navigation, focus management, ARIA roles, overlay positioning, and nested submenus.

#### LlmMenuTrigger (Directive)

| Input | Type | Default |
|---|---|---|
| `llmMenuTriggerFor` | `TemplateRef` | required |

#### LlmMenu

| Input | Type | Default |
|---|---|---|
| `variant` | `'default' \| 'compact'` | `'default'` |

#### LlmMenuItem

| Input | Type | Default |
|---|---|---|
| `disabled` | `boolean` | `false` |

| Output | Description |
|---|---|
| `triggered` | Emitted when the item is activated (click or Enter) |

```html
<!-- Basic menu -->
<llm-button [llmMenuTriggerFor]="actions">Actions</llm-button>
<ng-template #actions>
  <llm-menu>
    <llm-menu-item (triggered)="onCopy()">Copy</llm-menu-item>
    <llm-menu-item (triggered)="onPaste()">Paste</llm-menu-item>
    <llm-menu-separator />
    <llm-menu-item [disabled]="true">Delete</llm-menu-item>
  </llm-menu>
</ng-template>

<!-- Nested submenu -->
<llm-menu-item [llmMenuTriggerFor]="exportMenu">Export</llm-menu-item>
<ng-template #exportMenu>
  <llm-menu>
    <llm-menu-item (triggered)="exportPdf()">PDF</llm-menu-item>
    <llm-menu-item (triggered)="exportCsv()">CSV</llm-menu-item>
  </llm-menu>
</ng-template>
```

Keyboard navigation: ArrowDown/Up (navigate items), Enter/Space (activate), Escape (close), ArrowRight (open submenu), ArrowLeft (close submenu), Home/End (first/last item), type-ahead. All handled by CDK.

### LlmTooltip

Selector: `[llmTooltip]` (attribute directive)

Built on `@angular/cdk/overlay` for viewport-aware positioning.

| Input | Type | Default |
|---|---|---|
| `llmTooltip` | `string` | required |
| `llmTooltipPosition` | `'above' \| 'below' \| 'left' \| 'right'` | `'above'` |
| `llmTooltipDisabled` | `boolean` | `false` |
| `llmTooltipShowDelay` | `number` | `300` |
| `llmTooltipHideDelay` | `number` | `0` |

```html
<llm-button llmTooltip="Save your changes">Save</llm-button>
<llm-button llmTooltip="Copy to clipboard" llmTooltipPosition="right">Copy</llm-button>
<llm-button [llmTooltip]="helpText" [llmTooltipDisabled]="!showHelp">Info</llm-button>
```

Shows on hover/focus, hides on mouseleave/focusout/Escape. Sets `aria-describedby` on the host and `role="tooltip"` on the tooltip content. Falls back to opposite side if clipped by viewport.

### LlmToast + LlmToastService

Selectors: `llm-toast`, `llm-toast-container`
Service: `LlmToastService` (providedIn: 'root')

Transient notifications that auto-dismiss. Service-based imperative API — place `<llm-toast-container>` once in the app root.

**Why this component:** Every app needs "action completed" / "error occurred" messages. Alert is inline-only. Toast handles transient feedback without disrupting layout. Service-based API is natural for LLM-generated code (`inject(LlmToastService)`).

#### LlmToastService

```typescript
const toast = inject(LlmToastService);
toast.show('Saved!', { variant: 'success' });
toast.show('Error occurred', { variant: 'danger', duration: 8000 });
toast.show('Persistent message', { duration: 0 }); // no auto-dismiss
toast.dismiss(id); // dismiss by id
toast.clear(); // dismiss all
```

#### LlmToastContainer

| Input | Type | Default |
|---|---|---|
| `position` | `'top-right' \| 'top-center' \| 'bottom-right' \| 'bottom-center'` | `'bottom-right'` |

#### ToastOptions

| Option | Type | Default |
|---|---|---|
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `duration` | `number` | `5000` (0 = no auto-dismiss) |
| `dismissible` | `boolean` | `true` |

```html
<!-- Place once in app root -->
<llm-toast-container position="bottom-right" />
```

Uses `role="status"` + `aria-live="polite"`. Enter animation with `prefers-reduced-motion` support.

### LlmSkeleton

Selector: `llm-skeleton`

Loading placeholder that mimics content shape while data loads. Pure CSS component — zero JS logic, extremely lightweight.

**Why this component:** Loading states are universal but LLMs consistently forget them. Having a dedicated, discoverable component prompts AI-generated apps to include loading states. Composes from three primitives (text, circular, rectangular) to build any loading layout.

| Input | Type | Default |
|---|---|---|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'text'` |
| `width` | `string` | `'100%'` |
| `height` | `string` | `''` (auto per variant) |
| `animated` | `boolean` | `true` |

```html
<!-- Text lines -->
<llm-skeleton variant="text" />
<llm-skeleton variant="text" width="60%" />

<!-- Avatar placeholder -->
<llm-skeleton variant="circular" width="40px" />

<!-- Image/card placeholder -->
<llm-skeleton variant="rectangular" height="200px" />

<!-- Card skeleton composition -->
<div style="display: flex; gap: 1rem; align-items: center;">
  <llm-skeleton variant="circular" width="48px" />
  <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
    <llm-skeleton variant="text" width="40%" />
    <llm-skeleton variant="text" />
    <llm-skeleton variant="text" width="80%" />
  </div>
</div>
```

Sets `aria-hidden="true"`. Shimmer animation respects `prefers-reduced-motion`.

---

## Composition Cookbook

Storybook stories under "Cookbook" showing how to compose multiple components into real page layouts. Each pattern was chosen based on frequency in AI-generated applications.

### Login Form
**Why:** #1 most frequently AI-generated page. Shows Card + form control composition, validation, loading state.
```html
<llm-card variant="elevated" padding="lg">
  <llm-card-header>Sign in</llm-card-header>
  <llm-card-content>
    <llm-input type="email" placeholder="you@example.com" />
    <llm-input type="password" placeholder="Password" />
    <llm-checkbox>Remember me</llm-checkbox>
  </llm-card-content>
  <llm-card-footer>
    <llm-button variant="primary" [loading]="loading()">Sign in</llm-button>
  </llm-card-footer>
</llm-card>
```

### Settings Page
**Why:** Exercises the most components simultaneously. Core SaaS pattern.
```html
<llm-tab-group [(selectedIndex)]="activeTab">
  <llm-tab label="Account">
    <llm-input type="text" placeholder="Name" />
    <llm-input type="email" placeholder="Email" />
  </llm-tab>
  <llm-tab label="Notifications">
    <llm-toggle [(checked)]="emailNotifs">Email notifications</llm-toggle>
    <llm-toggle [(checked)]="pushNotifs">Push notifications</llm-toggle>
  </llm-tab>
  <llm-tab label="Privacy">
    <llm-select [(value)]="visibility" placeholder="Profile visibility">
      <llm-option optionValue="public">Public</llm-option>
      <llm-option optionValue="private">Private</llm-option>
    </llm-select>
  </llm-tab>
</llm-tab-group>
<llm-button variant="primary" (click)="save()">Save changes</llm-button>
```

### Confirmation Dialog
**Why:** Required in every CRUD app. Shows trigger→dialog→action flow.
```html
<llm-button (click)="isOpen = true">Delete</llm-button>
<llm-dialog [(open)]="isOpen" size="sm">
  <llm-dialog-header>Confirm Delete</llm-dialog-header>
  <llm-dialog-content>Are you sure? This cannot be undone.</llm-dialog-content>
  <llm-dialog-footer>
    <llm-button variant="outline" (click)="isOpen = false">Cancel</llm-button>
    <llm-button variant="primary" (click)="onConfirm()">Delete</llm-button>
  </llm-dialog-footer>
</llm-dialog>
```

### Data List with Actions
**Why:** Core dashboard/admin pattern. Badge + Menu + Tooltip composition.
```html
@for (item of items; track item.id) {
  <llm-card variant="outlined" padding="md">
    <llm-card-content>
      <span>{{ item.name }}</span>
      <llm-badge [variant]="item.statusVariant">{{ item.status }}</llm-badge>
      <llm-button [llmMenuTriggerFor]="actions" llmTooltip="More actions">...</llm-button>
      <ng-template #actions>
        <llm-menu>
          <llm-menu-item (triggered)="edit(item)">Edit</llm-menu-item>
          <llm-menu-separator />
          <llm-menu-item (triggered)="delete(item)">Delete</llm-menu-item>
        </llm-menu>
      </ng-template>
    </llm-card-content>
  </llm-card>
}
```

### Notification Center
**Why:** Common in monitoring dashboards. Accordion + Alert composition.
```html
<llm-accordion-group [multi]="true" variant="separated">
  <llm-accordion-item [expanded]="true">
    <span llmAccordionHeader>
      Errors <llm-badge variant="danger">{{ errors.length }}</llm-badge>
    </span>
    @for (err of errors(); track err.id) {
      <llm-alert variant="danger" [dismissible]="true" (dismissed)="dismiss(err.id)">
        {{ err.message }}
      </llm-alert>
    }
  </llm-accordion-item>
</llm-accordion-group>
```

---

### Scaffold new components

```bash
nx generate @llm-components/generators:llm-component --name=<name>
# e.g.: nx generate @llm-components/generators:llm-component --name=alert
```

Generated files: `llm-<name>.ts`, `llm-<name>.css`, `llm-<name>.spec.ts`, `llm-<name>.stories.ts`
Auto-exports from `libs/llm-components-angular/src/index.ts`.

### Import pattern

```typescript
import { LlmAvatar, LlmAvatarGroup, LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter, LlmBadge, LlmInput, LlmTextarea, LlmCheckbox, LlmToggle, LlmRadio, LlmRadioGroup, LlmAlert, LlmSelect, LlmOption, LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader, LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger, LlmTooltip, LlmToast, LlmToastContainer, LlmToastService, LlmSkeleton }
  from '@llm-components/llm-components-angular';
```

### Design tokens

```css
@import '@llm-components/llm-components-angular/styles/tokens.css';
```

All tokens use the `--ui-*` prefix. Key tokens: `--ui-color-primary`, `--ui-color-secondary`, `--ui-color-danger`, `--ui-color-surface`, `--ui-color-border`, `--ui-color-text`, `--ui-radius-sm/md/lg`, `--ui-spacing-1..8`, `--ui-shadow-sm/md`.

---

## React Library (`@llm-components/llm-components-react`)

Same components, same prop names, same `--ui-*` tokens — just React JSX instead of Angular templates.

### Scaffold new React components

```bash
nx generate @llm-components/generators:llm-component-react --name=<name>
# e.g.: nx generate @llm-components/generators:llm-component-react --name=date-picker
```

Generated files: `llm-<name>.tsx`, `llm-<name>.css`, `llm-<name>.spec.tsx`, `llm-<name>.stories.tsx`
Auto-exports from `libs/llm-components-react/src/index.ts`.

### Import pattern (React)

```typescript
import { LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
         LlmBadge, LlmInput, LlmTextarea, LlmCheckbox, LlmToggle,
         LlmRadio, LlmRadioGroup, LlmAlert, LlmSelect, LlmOption,
         LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
         LlmTabGroup, LlmTab, LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader,
         LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
         LlmTooltip, LlmSkeleton, LlmAvatar, LlmAvatarGroup, LlmProgress,
         LlmBreadcrumbs, LlmBreadcrumbItem, LlmPagination,
         LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter,
         LlmToastProvider, LlmToastContainer, LlmToast, useLlmToast }
  from '@llm-components/llm-components-react';
```

### Design tokens (React)

```css
@import '@llm-components/llm-components-react/styles/tokens.css';
```

### Toast (React) — hook pattern instead of service

```tsx
// App root
<LlmToastProvider>
  <App />
  <LlmToastContainer position="bottom-right" />
</LlmToastProvider>

// Any component
const { show } = useLlmToast();
show('Saved!', { variant: 'success' });
show('Error', { variant: 'danger', duration: 8000 });
```

### Key prop differences from Angular

| Concept | Angular | React |
|---|---|---|
| Two-way binding | `[(value)]="email"` | `value={email} onValueChange={setEmail}` |
| Checkbox binding | `[(checked)]="accepted"` | `checked={accepted} onCheckedChange={setAccepted}` |
| Tab selection | `[(selectedIndex)]="tab"` | `selectedIndex={tab} onSelectedIndexChange={setTab}` |
| Dialog open | `[(open)]="isOpen"` | `open={isOpen} onOpenChange={setIsOpen}` |
| Toast service | `inject(LlmToastService)` | `useLlmToast()` |
