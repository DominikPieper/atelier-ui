// Pattern metadata + code snippets for /patterns.
// Lives outside PatternsPage.tsx so the Astro page can render the static
// content (titles, descriptions, code blocks) at build time, while only the
// live demos hydrate as React islands.

export type PatternId =
  | 'login-form'
  | 'settings-page'
  | 'confirmation-dialog'
  | 'data-list'
  | 'notification-center'
  | 'management-dashboard';

export interface PatternVariation {
  title: string;
  note: string;
}

export interface PatternMeta {
  id: PatternId;
  num: number;
  title: string;
  description: string;
  tags: string[];
  angular: string;
  react: string;
  vue: string;
  /** Two to three short bullets — when this pattern is the right reach. */
  whenToUse: string[];
  /** Two to three short bullets — when to pick something else. */
  whenNotToUse: string[];
  /** Focus order, ARIA roles, screen-reader behaviour, contrast notes. */
  a11yNotes: string[];
  /** What an LLM most commonly gets wrong here. */
  pitfalls: string[];
  /** One or two alternative compositions a reader might want next. */
  variations: PatternVariation[];
  /** Storybook deep-link path, framework-specific. */
  storybook: {
    angular: string;
    react: string;
    vue: string;
  };
}

/**
 * Maps the PascalCase component tag used in `tags[]` (and read by agents
 * via /.well-known/cookbook-patterns.json) onto the docs route slug used
 * by /components/<slug>. Centralised here so /patterns and /patterns/[id]
 * can render every tag as a link to its component reference.
 */
export const TAG_TO_SLUG: Record<string, string> = {
  LlmAccordionGroup: 'accordion',
  LlmAlert: 'alert',
  LlmAvatar: 'avatar',
  LlmBadge: 'badge',
  LlmBreadcrumbs: 'breadcrumbs',
  LlmButton: 'button',
  LlmCard: 'card',
  LlmCheckbox: 'checkbox',
  LlmCodeBlock: 'code-block',
  LlmCombobox: 'combobox',
  LlmDialog: 'dialog',
  LlmDrawer: 'drawer',
  LlmIcon: 'icon',
  LlmInput: 'input',
  LlmMenu: 'menu',
  LlmPagination: 'pagination',
  LlmProgress: 'progress',
  LlmRadioGroup: 'radio-group',
  LlmSelect: 'select',
  LlmSkeleton: 'skeleton',
  LlmStepper: 'stepper',
  LlmTabGroup: 'tabs',
  LlmTable: 'table',
  LlmTextarea: 'textarea',
  LlmToast: 'toast',
  LlmToggle: 'toggle',
  LlmTooltip: 'tooltip',
};

const loginAngular = `<llm-card variant="elevated" padding="lg">
  <llm-card-header>
    <h3>Sign in</h3>
  </llm-card-header>
  <llm-card-content>
    @if (showError()) {
      <llm-alert variant="danger">Invalid email or password.</llm-alert>
    }
    <llm-input type="email" placeholder="you@example.com" [invalid]="showError()" />
    <llm-input type="password" placeholder="••••••••" [invalid]="showError()" />
    <llm-checkbox>Remember me</llm-checkbox>
  </llm-card-content>
  <llm-card-footer>
    <llm-button variant="primary" [loading]="loading()" (click)="signIn()">
      Sign in
    </llm-button>
  </llm-card-footer>
</llm-card>`;

const loginReact = `<LlmCard variant="elevated" padding="lg">
  <LlmCardHeader><h3>Sign in</h3></LlmCardHeader>
  <LlmCardContent>
    {showError && <LlmAlert variant="danger">Invalid email or password.</LlmAlert>}
    <LlmInput type="email" placeholder="you@example.com" invalid={showError} />
    <LlmInput type="password" placeholder="••••••••" invalid={showError} />
    <LlmCheckbox>Remember me</LlmCheckbox>
  </LlmCardContent>
  <LlmCardFooter>
    <LlmButton variant="primary" loading={loading} onClick={signIn}>
      Sign in
    </LlmButton>
  </LlmCardFooter>
</LlmCard>`;

const loginVue = `<LlmCard variant="elevated" padding="lg">
  <LlmCardHeader>Sign in</LlmCardHeader>
  <LlmCardContent>
    <LlmAlert v-if="showError" variant="danger">Invalid email or password.</LlmAlert>
    <LlmInput type="email" placeholder="you@example.com" v-model:value="email" />
    <LlmInput type="password" placeholder="••••••••" v-model:value="password" />
    <LlmCheckbox v-model:checked="remember">Remember me</LlmCheckbox>
  </LlmCardContent>
  <LlmCardFooter>
    <LlmButton variant="primary" :loading="loading" @click="signIn">Sign in</LlmButton>
  </LlmCardFooter>
</LlmCard>`;

const settingsAngular = `<llm-tab-group [(selectedIndex)]="activeTab">
  <llm-tab label="Account">
    <llm-input label="Full Name" placeholder="John Doe" />
    <llm-input label="Email" placeholder="john@example.com" />
  </llm-tab>
  <llm-tab label="Notifications">
    <llm-toggle [(checked)]="emailOn">Email notifications</llm-toggle>
    <llm-toggle [(checked)]="pushOn">Push notifications</llm-toggle>
  </llm-tab>
</llm-tab-group>
<llm-button variant="primary" (click)="save()">Save changes</llm-button>`;

const settingsReact = `<LlmTabGroup selectedIndex={tab} onSelectedIndexChange={setTab}>
  <LlmTab label="Account">
    <LlmInput label="Full Name" placeholder="John Doe" />
    <LlmInput label="Email" placeholder="john@example.com" />
  </LlmTab>
  <LlmTab label="Notifications">
    <LlmToggle checked={emailOn} onCheckedChange={setEmailOn}>Email</LlmToggle>
    <LlmToggle checked={pushOn} onCheckedChange={setPushOn}>Push</LlmToggle>
  </LlmTab>
</LlmTabGroup>
<LlmButton variant="primary" onClick={save}>Save changes</LlmButton>`;

const settingsVue = `<LlmTabGroup v-model:selectedIndex="activeTab">
  <LlmTab label="Account">
    <LlmInput v-model:value="name" label="Full Name" />
    <LlmInput v-model:value="email" label="Email" />
  </LlmTab>
  <LlmTab label="Notifications">
    <LlmToggle v-model:checked="emailOn">Email notifications</LlmToggle>
  </LlmTab>
</LlmTabGroup>
<LlmButton variant="primary" @click="save">Save changes</LlmButton>`;

const confirmAngular = `<llm-button variant="primary" (click)="isOpen.set(true)">Delete account</llm-button>

<llm-dialog [(open)]="isOpen" size="sm">
  <llm-dialog-header>Delete Account</llm-dialog-header>
  <llm-dialog-content>
    <llm-alert variant="warning">This action cannot be undone.</llm-alert>
  </llm-dialog-content>
  <llm-dialog-footer>
    <llm-button variant="outline" (click)="isOpen.set(false)">Cancel</llm-button>
    <llm-button variant="primary" (click)="confirm()">Yes, delete</llm-button>
  </llm-dialog-footer>
</llm-dialog>`;

const confirmReact = `<LlmButton onClick={() => setOpen(true)}>Delete account</LlmButton>

<LlmDialog open={open} onOpenChange={setOpen} size="sm">
  <LlmDialogHeader>Delete Account</LlmDialogHeader>
  <LlmDialogContent>
    <LlmAlert variant="warning">This action cannot be undone.</LlmAlert>
  </LlmDialogContent>
  <LlmDialogFooter>
    <LlmButton variant="outline" onClick={() => setOpen(false)}>Cancel</LlmButton>
    <LlmButton variant="primary" onClick={confirm}>Yes, delete</LlmButton>
  </LlmDialogFooter>
</LlmDialog>`;

const confirmVue = `<LlmButton variant="primary" @click="isOpen = true">Delete account</LlmButton>

<LlmDialog v-model:open="isOpen" size="sm">
  <LlmDialogHeader>Delete Account</LlmDialogHeader>
  <LlmDialogContent>
    <LlmAlert variant="warning">This action cannot be undone.</LlmAlert>
  </LlmDialogContent>
  <LlmDialogFooter>
    <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
    <LlmButton variant="primary" @click="confirm">Yes, delete</LlmButton>
  </LlmDialogFooter>
</LlmDialog>`;

const dataListAngular = `<div class="list-header">
  <h2>Projects</h2>
  <llm-button variant="primary" size="sm">New project</llm-button>
</div>
@for (item of items(); track item.id) {
  <llm-card variant="outlined" padding="md">
    <llm-card-content>
      <span>{{ item.name }}</span>
      <llm-badge [variant]="item.statusVariant" size="sm">{{ item.status }}</llm-badge>
      <p>{{ item.description }}</p>
      <llm-button variant="outline" size="sm" llmTooltip="View details">View</llm-button>
      <llm-button
        variant="outline"
        size="sm"
        [llmMenuTriggerFor]="actionsMenu"
        llmTooltip="More actions"
      >...</llm-button>
      <ng-template #actionsMenu>
        <llm-menu>
          <llm-menu-item>Edit</llm-menu-item>
          <llm-menu-item>Duplicate</llm-menu-item>
          <llm-menu-separator />
          <llm-menu-item>Delete</llm-menu-item>
        </llm-menu>
      </ng-template>
    </llm-card-content>
  </llm-card>
}`;

const dataListReact = `<div className="list-header">
  <h2>Projects</h2>
  <LlmButton variant="primary" size="sm">New project</LlmButton>
</div>
{items.map(item => (
  <LlmCard key={item.id} variant="outlined" padding="md">
    <LlmCardContent>
      <span>{item.name}</span>
      <LlmBadge variant={item.statusVariant} size="sm">{item.status}</LlmBadge>
      <p>{item.description}</p>
      <LlmTooltip llmTooltip="View details">
        <LlmButton variant="outline" size="sm">View</LlmButton>
      </LlmTooltip>
      <LlmMenuTrigger
        menu={
          <LlmMenu variant="compact">
            <LlmMenuItem>Edit</LlmMenuItem>
            <LlmMenuItem>Duplicate</LlmMenuItem>
            <LlmMenuSeparator />
            <LlmMenuItem>Delete</LlmMenuItem>
          </LlmMenu>
        }
      >
        {({ onClick, ref }) => (
          <LlmTooltip llmTooltip="More actions">
            <LlmButton ref={ref} onClick={onClick} variant="outline" size="sm">...</LlmButton>
          </LlmTooltip>
        )}
      </LlmMenuTrigger>
    </LlmCardContent>
  </LlmCard>
))}`;

const dataListVue = `<div class="list-header">
  <h2>Projects</h2>
  <LlmButton variant="primary" size="sm">New project</LlmButton>
</div>
<LlmCard v-for="item in items" :key="item.id" variant="outlined" padding="md">
  <LlmCardContent>
    <span>{{ item.name }}</span>
    <LlmBadge :variant="item.statusVariant" size="sm">{{ item.status }}</LlmBadge>
    <p>{{ item.description }}</p>
    <LlmTooltip llmTooltip="View details">
      <LlmButton variant="outline" size="sm">View</LlmButton>
    </LlmTooltip>
    <LlmMenuTrigger>
      <template #trigger>
        <LlmTooltip llmTooltip="More actions">
          <LlmButton variant="outline" size="sm">...</LlmButton>
        </LlmTooltip>
      </template>
      <template #menu>
        <LlmMenu variant="compact">
          <LlmMenuItem>Edit</LlmMenuItem>
          <LlmMenuItem>Duplicate</LlmMenuItem>
          <LlmMenuSeparator />
          <LlmMenuItem>Delete</LlmMenuItem>
        </LlmMenu>
      </template>
    </LlmMenuTrigger>
  </LlmCardContent>
</LlmCard>`;

const notificationsAngular = `<llm-accordion-group [multi]="true" variant="separated">
  <llm-accordion-item [expanded]="true">
    <span llmAccordionHeader>
      Errors <llm-badge variant="danger" size="sm">2</llm-badge>
    </span>
    <llm-alert variant="danger">Database failed.</llm-alert>
    <llm-alert variant="danger">Service 503.</llm-alert>
  </llm-accordion-item>
  <llm-accordion-item>
    <span llmAccordionHeader>
      Warnings <llm-badge variant="warning" size="sm">1</llm-badge>
    </span>
    <llm-alert variant="warning">Disk at 89%.</llm-alert>
  </llm-accordion-item>
</llm-accordion-group>`;

const notificationsReact = `<LlmAccordionGroup multi variant="separated">
  <LlmAccordionItem expanded>
    <span>Errors <LlmBadge variant="danger" size="sm">2</LlmBadge></span>
    <LlmAlert variant="danger">Database failed.</LlmAlert>
    <LlmAlert variant="danger">Service 503.</LlmAlert>
  </LlmAccordionItem>
  <LlmAccordionItem>
    <span>Warnings <LlmBadge variant="warning" size="sm">1</LlmBadge></span>
    <LlmAlert variant="warning">Disk at 89%.</LlmAlert>
  </LlmAccordionItem>
</LlmAccordionGroup>`;

const notificationsVue = `<LlmAccordionGroup :multi="true" variant="separated">
  <LlmAccordionItem :expanded="true">
    <template #header>
      Errors <LlmBadge variant="danger">2</LlmBadge>
    </template>
    <LlmAlert variant="danger">Database failed.</LlmAlert>
  </LlmAccordionItem>
  <LlmAccordionItem>
    <template #header>
      Warnings <LlmBadge variant="warning">1</LlmBadge>
    </template>
    <LlmAlert variant="warning">Disk at 89%.</LlmAlert>
  </LlmAccordionItem>
</LlmAccordionGroup>`;

const dashboardAngular = `<!-- Metric cards + activity table + quota widget.
     Uses Card, Table, TabGroup, Badge, Alert, Progress. -->
<llm-tab-group variant="pills" [(selectedIndex)]="range">
  <llm-tab label="7D" />
  <llm-tab label="30D" />
  <llm-tab label="90D" />
</llm-tab-group>
@if (quota() >= 85) {
  <llm-alert variant="warning">API quota at {{ quota() }}%.</llm-alert>
}
<!-- ...metric cards grid (LlmCard + LlmBadge delta)... -->
<llm-table variant="striped" size="sm">
  <llm-thead>
    <llm-tr><llm-th>User</llm-th><llm-th>Action</llm-th></llm-tr>
  </llm-thead>
  <llm-tbody>
    @for (row of activity(); track row.id) {
      <llm-tr>
        <llm-td>{{ row.user }}</llm-td>
        <llm-td>{{ row.action }}</llm-td>
      </llm-tr>
    }
  </llm-tbody>
</llm-table>
<llm-progress [value]="quota()" variant="warning" size="sm" />`;

const dashboardReact = `<LlmTabGroup variant="pills" selectedIndex={range} onSelectedIndexChange={setRange}>
  <LlmTab label="7D">{' '}</LlmTab>
  <LlmTab label="30D">{' '}</LlmTab>
  <LlmTab label="90D">{' '}</LlmTab>
</LlmTabGroup>
{quota >= 85 && <LlmAlert variant="warning">API quota at {quota}%.</LlmAlert>}
{/* ...metric cards grid (LlmCard + LlmBadge delta)... */}
<LlmTable variant="striped" size="sm">
  <LlmThead>
    <LlmTr><LlmTh>User</LlmTh><LlmTh>Action</LlmTh></LlmTr>
  </LlmThead>
  <LlmTbody>
    {activity.map(row => (
      <LlmTr key={row.id}>
        <LlmTd>{row.user}</LlmTd>
        <LlmTd>{row.action}</LlmTd>
      </LlmTr>
    ))}
  </LlmTbody>
</LlmTable>
<LlmProgress value={quota} variant="warning" size="sm" />`;

const dashboardVue = `<LlmTabGroup variant="pills" v-model:selectedIndex="range">
  <LlmTab label="7D">&nbsp;</LlmTab>
  <LlmTab label="30D">&nbsp;</LlmTab>
  <LlmTab label="90D">&nbsp;</LlmTab>
</LlmTabGroup>
<LlmAlert v-if="quota >= 85" variant="warning">API quota at {{ quota }}%.</LlmAlert>
<!-- ...metric cards grid (LlmCard + LlmBadge delta)... -->
<LlmTable variant="striped" size="sm">
  <LlmThead>
    <LlmTr><LlmTh>User</LlmTh><LlmTh>Action</LlmTh></LlmTr>
  </LlmThead>
  <LlmTbody>
    <LlmTr v-for="row in activity" :key="row.id">
      <LlmTd>{{ row.user }}</LlmTd>
      <LlmTd>{{ row.action }}</LlmTd>
    </LlmTr>
  </LlmTbody>
</LlmTable>
<LlmProgress :value="quota" variant="warning" size="sm" />`;

function storybookLinks(storyId: string): PatternMeta['storybook'] {
  return {
    angular: `/storybook-angular/?path=/docs/cookbook--${storyId}`,
    react: `/storybook-react/?path=/docs/cookbook--${storyId}`,
    vue: `/storybook-vue/?path=/docs/cookbook--${storyId}`,
  };
}

export const PATTERNS: PatternMeta[] = [
  {
    id: 'login-form',
    num: 1,
    title: 'Login Form',
    description: 'The most frequent AI-generated page. Shows Card composition, validation error display, and loading states.',
    tags: ['LlmCard', 'LlmInput', 'LlmButton', 'LlmAlert', 'LlmCheckbox'],
    angular: loginAngular,
    react: loginReact,
    vue: loginVue,
    whenToUse: [
      'Email + password authentication on a public marketing or app surface.',
      'A short, focused form (≤ 5 fields) where one Card is enough scaffolding.',
      'You need an inline error region that does not navigate the user away from the form.',
    ],
    whenNotToUse: [
      'Multi-step onboarding flows — reach for LlmStepper instead.',
      'Passwordless / magic-link flows where the response is a separate state, not a form error.',
      'When the form needs more than one Card column or section — switch to a Settings-style tabbed layout.',
    ],
    a11yNotes: [
      'LlmInput exposes invalid + describedBy linkage automatically when paired with the Alert via aria-describedby — keep the Alert above the inputs so screen readers reach the error first.',
      'The submit button needs an explicit loading state, not a disabled state with a spinner — disabled buttons are skipped by some assistive tech.',
      'Label every input. Placeholder is a hint, not a label — never the only descriptor for a field.',
    ],
    pitfalls: [
      'LLMs love to put `aria-required` on every field. Mark required state via the validation schema and the visible label, not as a duplicate ARIA attribute.',
      'Returning the password value into the input on a failed submit reveals it in the DOM — clear it on error like a native browser would.',
      'Using `<button type="button">` instead of `type="submit"` breaks Enter-to-submit. Cookbook story uses native submit semantics.',
    ],
    variations: [
      {
        title: 'With "Forgot password?" link',
        note: 'Add an LlmCardFooter row with a secondary link aligned opposite to the submit button — same Card / form structure, no new components.',
      },
      {
        title: 'Social-login alternates',
        note: 'Keep this Card as the email form, then group OAuth buttons in a sibling Card with `variant="outlined"`. Avoid nesting them inside the same form element.',
      },
    ],
    storybook: storybookLinks('login-form'),
  },
  {
    id: 'settings-page',
    num: 2,
    title: 'Settings Page',
    description: 'Exercises tabs, form controls, and layout composition. The bread and butter of SaaS applications.',
    tags: ['LlmTabGroup', 'LlmToggle', 'LlmSelect', 'LlmInput', 'LlmButton', 'LlmAlert'],
    angular: settingsAngular,
    react: settingsReact,
    vue: settingsVue,
    whenToUse: [
      'A surface where the user toggles roughly 5–25 settings grouped by topic (account, notifications, security, billing).',
      'Settings change rarely and the user expects a "Save" button rather than autosave.',
      'You need stable URLs per tab so screenshots and support links survive navigation — wire `selectedIndex` to the route.',
    ],
    whenNotToUse: [
      'Single-screen inline edit of one or two values — use an LlmCard with the input directly, not a tabbed shell.',
      'Wizard-style sequences where order matters — LlmStepper enforces progression that TabGroup intentionally does not.',
      'Nested settings that need their own sub-tabs — collapse to an accordion or a list-detail layout instead of nesting tab groups.',
    ],
    a11yNotes: [
      'LlmTabGroup uses CDK FocusKeyManager: arrow keys move focus between tabs, Home/End jump to ends, Tab moves into the active panel. Don\'t override these.',
      'Each LlmToggle is a `role="switch"` — its label must describe the on-state ("Email notifications") not the action ("Toggle email").',
      'Autosaving silently is a screen-reader trap. Either keep an explicit Save button (current pattern) or surface autosave with an `aria-live="polite"` region after the fact.',
    ],
    pitfalls: [
      'LLMs frequently hoist tab content into a giant switch in the parent. Each LlmTab\'s body is the projected child — keep state co-located with the inputs, not the parent.',
      'Saving a partial form across tab switches breaks the user\'s mental model. Either persist optimistically per change or block the save button until the user returns to a complete state.',
      'Don\'t bind `LlmSelect` to a tuple `{value, label}` — bind the primitive value and let the option element project the label.',
    ],
    variations: [
      {
        title: 'Vertical-tab variant for ≥ 6 sections',
        note: 'Set `variant="pills"` and a vertical container — the same TabGroup primitive renders side-tabs without changing keyboard semantics.',
      },
      {
        title: 'With unsaved-changes prompt',
        note: 'Wrap the save button in a confirmation flow when `dirty` is true — reuse the Confirmation Dialog pattern verbatim.',
      },
    ],
    storybook: storybookLinks('settings-page'),
  },
  {
    id: 'confirmation-dialog',
    num: 3,
    title: 'Confirmation Dialog',
    description: 'Accessible modal flow for destructive actions. Shows trigger → dialog → action logic.',
    tags: ['LlmDialog', 'LlmAlert', 'LlmButton'],
    angular: confirmAngular,
    react: confirmReact,
    vue: confirmVue,
    whenToUse: [
      'Irreversible actions: deleting an account, revoking an API key, leaving an organization.',
      'Actions whose blast radius the user might underestimate ("delete project" hides "delete all 4,000 issues").',
      'When the operation is fast enough that a modal is acceptable — anything > ~3 s should open a separate destination, not a dialog.',
    ],
    whenNotToUse: [
      'Reversible actions with an undo affordance — show an LlmToast with an "Undo" action instead.',
      'Form-style multi-field confirmation ("type the project name to confirm") — that\'s a destructive form, render it on its own page or in an LlmDrawer.',
      'As an "are you sure?" wrapper around every save button. Confirmation fatigue trains users to click through.',
    ],
    a11yNotes: [
      'LlmDialog uses the native `<dialog>` element with `cdkTrapFocus` — focus moves to the first focusable inside, restores on close. Don\'t reimplement.',
      'Escape closes the dialog by default (`closeOnEscape={true}`). Disable it only when an in-progress operation cannot be cancelled mid-flight.',
      'The destructive button must remain the *secondary* visual call to action — Cancel as `outline`, "Delete permanently" as `primary`. Reversing colour just to make red prominent is a contrast trap.',
    ],
    pitfalls: [
      'LLMs frequently add `autoFocus` to the destructive button — this nudges users into an accidental confirm. The first Tab stop should be Cancel.',
      'Forgetting to gate the trigger when the action is already in flight produces double-deletes; flip the dialog\'s `open` to false only after the mutation resolves.',
      'Putting body content as a raw string inside `LlmDialogContent` skips the LlmAlert composition the cookbook recommends — the Alert is what carries the warning role for assistive tech.',
    ],
    variations: [
      {
        title: 'With type-to-confirm input',
        note: 'Add an LlmInput inside `LlmDialogContent` that the user must type the resource name into. Disable the destructive button until match.',
      },
      {
        title: 'Loading state',
        note: 'Bind `loading={pending}` on the destructive LlmButton; keep the dialog open so a slow network failure doesn\'t lose context.',
      },
    ],
    storybook: storybookLinks('confirmation-dialog'),
  },
  {
    id: 'data-list',
    num: 4,
    title: 'Data List with Actions',
    description: 'Inline actions on a list of items. The core pattern for dashboards and admin panels — Card + Badge + Button composition.',
    tags: ['LlmCard', 'LlmBadge', 'LlmButton', 'LlmMenu', 'LlmTooltip'],
    angular: dataListAngular,
    react: dataListReact,
    vue: dataListVue,
    whenToUse: [
      'Lists of 5–50 items where each item has 1 primary action and 2–4 secondary actions.',
      'Items have a status indicator that benefits from a Badge\'s colour semantics (Active, Pending, Failed).',
      'You want each row independently focusable so keyboard users can act on it without tab-trapping in a Table.',
    ],
    whenNotToUse: [
      'More than ~50 items — switch to LlmTable with sorting, sticky header, and pagination.',
      'Items whose primary affordance is reading, not acting — use a plain styled list without per-row buttons.',
      'Lists that need column alignment across rows — Cards collapse content; Tables align it.',
    ],
    a11yNotes: [
      'LlmMenuTrigger from CDK Menu manages roving focus inside the popped menu — don\'t hand-roll arrow-key handlers, you\'ll fight the focus manager.',
      'Each "..." button needs an `aria-label` ("More actions for Marketing Website"). Tooltips improve hover but don\'t replace the accessible name.',
      'When status changes async, surface the Badge update via an `aria-live="polite"` region on the list, not a per-row live region — fewer announcements.',
    ],
    pitfalls: [
      'LLMs render `<a>` and `<button>` interchangeably for row actions — use `<button>` for "Edit", `<a>` only for navigation. Mixing breaks Cmd-click behaviour.',
      'Putting the entire row inside a `<button>` swallows the inner buttons\' click handlers. Use a clickable region pattern (cursor + keydown) rather than a wrapping button.',
      'The cookbook story uses LlmMenu for Edit / Duplicate / Delete because each is a separate operation. If you only have one secondary action, drop the menu and inline the button.',
    ],
    variations: [
      {
        title: 'With selection checkboxes',
        note: 'Add an LlmCheckbox at the row start; lift selection state to the parent and surface a bulk-action bar above the list.',
      },
      {
        title: 'With drag-handle reorder',
        note: 'Add a drag handle button — wrap rows in `@angular/cdk/drag-drop` (Angular) / `dnd-kit` (React) / `vuedraggable` (Vue). The cookbook stays component-only.',
      },
    ],
    storybook: storybookLinks('data-list-with-actions'),
  },
  {
    id: 'notification-center',
    num: 5,
    title: 'Notification Center',
    description: 'Structural feedback grouping using Accordion and Alert. Useful for monitoring and admin tools.',
    tags: ['LlmAccordionGroup', 'LlmAlert', 'LlmBadge', 'LlmButton'],
    angular: notificationsAngular,
    react: notificationsReact,
    vue: notificationsVue,
    whenToUse: [
      'A surface where users review historical notifications grouped by severity (errors, warnings, info).',
      'Notifications can be dismissed independently and the user wants to see related items together.',
      'You expect 10–200 items — fewer than 10 should render flat without the accordion wrapper.',
    ],
    whenNotToUse: [
      'Transient toast-style notifications — use LlmToast with `aria-live="assertive"` (error) or `polite` (info), not an accordion.',
      'A single critical message — inline LlmAlert above the page is louder and harder to ignore than a collapsed accordion section.',
      'Real-time logs / streaming output — the accordion expansion animation fights the auto-scroll. Use a virtual-scrolled list instead.',
    ],
    a11yNotes: [
      'LlmAccordionGroup with `multi={true}` lets users keep severity sections open simultaneously — match the user\'s mental model of triage.',
      'Each LlmAlert\'s `role` is bound to its variant (`alert` for danger/warning, `status` for info/success). Don\'t override.',
      'The badge counts beside each accordion header must update when items are dismissed — assistive tech reads the header text on focus, not the changing count below.',
    ],
    pitfalls: [
      'LLMs frequently nest LlmAccordionGroup inside another accordion — flat groupings work better; switch to LlmTabs if you really need two axes.',
      'Auto-collapsing the section when its last item is dismissed is jarring on keyboard users mid-action — leave it open and show an empty-state row.',
      'Marking everything as `variant="danger"` so the user "really sees it" trains them to ignore the colour. Reserve danger for actual failures.',
    ],
    variations: [
      {
        title: 'With "Mark all read" + filter chips',
        note: 'Add a LlmTabGroup above the accordion with severity filters; drive the visible groups from selected filter state.',
      },
      {
        title: 'Inline-only (no accordion)',
        note: 'For ≤ 5 items, drop the AccordionGroup and render Alerts directly; preserves the same dismiss handlers.',
      },
    ],
    storybook: storybookLinks('notification-center'),
  },
  {
    id: 'management-dashboard',
    num: 6,
    title: 'Management Dashboard',
    description: 'The densest cookbook pattern — metric cards, activity table, and quota indicators combined. Shows how Card, Table, TabGroup, Badge, Alert, and Progress fit together.',
    tags: ['LlmCard', 'LlmTable', 'LlmTabGroup', 'LlmBadge', 'LlmAlert', 'LlmProgress', 'LlmButton'],
    angular: dashboardAngular,
    react: dashboardReact,
    vue: dashboardVue,
    whenToUse: [
      'Operational overview pages: metric cards above, table of recent activity below, supplementary indicators (quota, plan usage) on the side.',
      'Dashboards with a global time-range selector that re-scopes every widget — TabGroup with `variant="pills"` is the right control.',
      'When the user needs to triage at a glance and only drill in if a metric is anomalous (warning Alert above the threshold).',
    ],
    whenNotToUse: [
      'Single-metric pages — all this scaffolding is overkill for one number with a sparkline.',
      'Pages where the data is the whole point and side-by-side cards add no value — render the table full-bleed instead.',
      'Real-time dashboards with sub-second updates — these fight the static layout; use an SVG/canvas chart and drop the Card grids.',
    ],
    a11yNotes: [
      'LlmProgress for quota uses `role="progressbar"` with `aria-valuenow` — don\'t add a duplicate visible-text-only readout for screen readers; the role surfaces the value automatically.',
      'The metric card delta uses a Badge whose colour encodes direction. Pair every coloured delta with a `+` / `-` glyph so the meaning survives without colour.',
      'Recent-activity table\'s status column is colour-only when read alone — keep the textual label ("Success", "Pending", "Failed") inside the Badge.',
    ],
    pitfalls: [
      'LLMs love to project tab content into a giant `ngSwitch` / ternary that re-renders the entire grid on each tab change. Bind only the data-fetch scope to the tab; let the layout stay static.',
      'Using `variant="warning"` Alerts for every quota above 50 % numbs the signal. Reserve for crossings of the actual SLA / billing threshold.',
      'Putting the table and the side panel into a single LlmCard collapses their independent scroll regions. They\'re siblings, not parent/child.',
    ],
    variations: [
      {
        title: 'With drill-down per metric',
        note: 'Add an `onClick` that opens an LlmDrawer with the metric\'s history — Drawer keeps the dashboard context, Dialog would dim it.',
      },
      {
        title: 'Empty state',
        note: 'When no activity exists, replace the table with a centered LlmAlert + LlmButton ("Invite your first member") inside the same Card.',
      },
    ],
    storybook: storybookLinks('management-dashboard'),
  },
];
