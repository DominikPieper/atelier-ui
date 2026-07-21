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
  AtlAccordionGroup: 'accordion',
  AtlAlert: 'alert',
  AtlAvatar: 'avatar',
  AtlBadge: 'badge',
  AtlBreadcrumbs: 'breadcrumbs',
  AtlButton: 'button',
  AtlCard: 'card',
  AtlCheckbox: 'checkbox',
  AtlCodeBlock: 'code-block',
  AtlCombobox: 'combobox',
  AtlDialog: 'dialog',
  AtlDrawer: 'drawer',
  AtlIcon: 'icon',
  AtlInput: 'input',
  AtlMenu: 'menu',
  AtlPagination: 'pagination',
  AtlProgress: 'progress',
  AtlRadioGroup: 'radio-group',
  AtlSelect: 'select',
  AtlSkeleton: 'skeleton',
  AtlStepper: 'stepper',
  AtlTabGroup: 'tabs',
  AtlTable: 'table',
  AtlTextarea: 'textarea',
  AtlToast: 'toast',
  AtlToggle: 'toggle',
  AtlTooltip: 'tooltip',
};

const loginAngular = `<atl-card variant="elevated" padding="lg">
  <atl-card-header>
    <h3>Sign in</h3>
  </atl-card-header>
  <atl-card-content>
    @if (showError()) {
      <atl-alert variant="danger">Invalid email or password.</atl-alert>
    }
    <atl-input type="email" placeholder="you@example.com" [invalid]="showError()" />
    <atl-input type="password" placeholder="••••••••" [invalid]="showError()" />
    <atl-checkbox>Remember me</atl-checkbox>
  </atl-card-content>
  <atl-card-footer>
    <atl-button variant="primary" [loading]="loading()" (click)="signIn()">
      Sign in
    </atl-button>
  </atl-card-footer>
</atl-card>`;

const loginReact = `<AtlCard variant="elevated" padding="lg">
  <AtlCardHeader><h3>Sign in</h3></AtlCardHeader>
  <AtlCardContent>
    {showError && <AtlAlert variant="danger">Invalid email or password.</AtlAlert>}
    <AtlInput type="email" placeholder="you@example.com" invalid={showError} />
    <AtlInput type="password" placeholder="••••••••" invalid={showError} />
    <AtlCheckbox>Remember me</AtlCheckbox>
  </AtlCardContent>
  <AtlCardFooter>
    <AtlButton variant="primary" loading={loading} onClick={signIn}>
      Sign in
    </AtlButton>
  </AtlCardFooter>
</AtlCard>`;

const loginVue = `<AtlCard variant="elevated" padding="lg">
  <AtlCardHeader>Sign in</AtlCardHeader>
  <AtlCardContent>
    <AtlAlert v-if="showError" variant="danger">Invalid email or password.</AtlAlert>
    <AtlInput type="email" placeholder="you@example.com" v-model:value="email" />
    <AtlInput type="password" placeholder="••••••••" v-model:value="password" />
    <AtlCheckbox v-model:checked="remember">Remember me</AtlCheckbox>
  </AtlCardContent>
  <AtlCardFooter>
    <AtlButton variant="primary" :loading="loading" @click="signIn">Sign in</AtlButton>
  </AtlCardFooter>
</AtlCard>`;

const settingsAngular = `<atl-tab-group [(selectedIndex)]="activeTab">
  <atl-tab label="Account">
    <label>
      Full Name
      <atl-input placeholder="John Doe" />
    </label>
    <label>
      Email
      <atl-input placeholder="john@example.com" />
    </label>
  </atl-tab>
  <atl-tab label="Notifications">
    <atl-toggle [(checked)]="emailOn">Email notifications</atl-toggle>
    <atl-toggle [(checked)]="pushOn">Push notifications</atl-toggle>
  </atl-tab>
</atl-tab-group>
<atl-button variant="primary" (click)="save()">Save changes</atl-button>`;

const settingsReact = `<AtlTabGroup selectedIndex={tab} onSelectedIndexChange={setTab}>
  <AtlTab label="Account">
    <AtlInput label="Full Name" placeholder="John Doe" />
    <AtlInput label="Email" placeholder="john@example.com" />
  </AtlTab>
  <AtlTab label="Notifications">
    <AtlToggle checked={emailOn} onCheckedChange={setEmailOn}>Email</AtlToggle>
    <AtlToggle checked={pushOn} onCheckedChange={setPushOn}>Push</AtlToggle>
  </AtlTab>
</AtlTabGroup>
<AtlButton variant="primary" onClick={save}>Save changes</AtlButton>`;

const settingsVue = `<AtlTabGroup v-model:selectedIndex="activeTab">
  <AtlTab label="Account">
    <AtlInput v-model:value="name" label="Full Name" />
    <AtlInput v-model:value="email" label="Email" />
  </AtlTab>
  <AtlTab label="Notifications">
    <AtlToggle v-model:checked="emailOn">Email notifications</AtlToggle>
  </AtlTab>
</AtlTabGroup>
<AtlButton variant="primary" @click="save">Save changes</AtlButton>`;

const confirmAngular = `<atl-button variant="primary" (click)="isOpen.set(true)">Delete account</atl-button>

<atl-dialog [(open)]="isOpen" size="sm">
  <atl-dialog-header>Delete Account</atl-dialog-header>
  <atl-dialog-content>
    <atl-alert variant="warning">This action cannot be undone.</atl-alert>
  </atl-dialog-content>
  <atl-dialog-footer>
    <atl-button variant="outline" (click)="isOpen.set(false)">Cancel</atl-button>
    <atl-button variant="primary" (click)="confirm()">Yes, delete</atl-button>
  </atl-dialog-footer>
</atl-dialog>`;

const confirmReact = `<AtlButton onClick={() => setOpen(true)}>Delete account</AtlButton>

<AtlDialog open={open} onOpenChange={setOpen} size="sm">
  <AtlDialogHeader>Delete Account</AtlDialogHeader>
  <AtlDialogContent>
    <AtlAlert variant="warning">This action cannot be undone.</AtlAlert>
  </AtlDialogContent>
  <AtlDialogFooter>
    <AtlButton variant="outline" onClick={() => setOpen(false)}>Cancel</AtlButton>
    <AtlButton variant="primary" onClick={confirm}>Yes, delete</AtlButton>
  </AtlDialogFooter>
</AtlDialog>`;

const confirmVue = `<AtlButton variant="primary" @click="isOpen = true">Delete account</AtlButton>

<AtlDialog v-model:open="isOpen" size="sm">
  <AtlDialogHeader>Delete Account</AtlDialogHeader>
  <AtlDialogContent>
    <AtlAlert variant="warning">This action cannot be undone.</AtlAlert>
  </AtlDialogContent>
  <AtlDialogFooter>
    <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
    <AtlButton variant="primary" @click="confirm">Yes, delete</AtlButton>
  </AtlDialogFooter>
</AtlDialog>`;

const dataListAngular = `<div class="list-header">
  <h2>Projects</h2>
  <atl-button variant="primary" size="sm">New project</atl-button>
</div>
@for (item of items(); track item.id) {
  <atl-card variant="outlined" padding="md">
    <atl-card-content>
      <span>{{ item.name }}</span>
      <atl-badge [variant]="item.statusVariant" size="sm">{{ item.status }}</atl-badge>
      <p>{{ item.description }}</p>
      <atl-button variant="outline" size="sm" atlTooltip="View details">View</atl-button>
      <atl-button
        variant="outline"
        size="sm"
        [atlMenuTriggerFor]="actionsMenu"
        atlTooltip="More actions"
      >...</atl-button>
      <ng-template #actionsMenu>
        <atl-menu>
          <atl-menu-item>Edit</atl-menu-item>
          <atl-menu-item>Duplicate</atl-menu-item>
          <atl-menu-separator />
          <atl-menu-item>Delete</atl-menu-item>
        </atl-menu>
      </ng-template>
    </atl-card-content>
  </atl-card>
}`;

const dataListReact = `<div className="list-header">
  <h2>Projects</h2>
  <AtlButton variant="primary" size="sm">New project</AtlButton>
</div>
{items.map(item => (
  <AtlCard key={item.id} variant="outlined" padding="md">
    <AtlCardContent>
      <span>{item.name}</span>
      <AtlBadge variant={item.statusVariant} size="sm">{item.status}</AtlBadge>
      <p>{item.description}</p>
      <AtlTooltip atlTooltip="View details">
        <AtlButton variant="outline" size="sm">View</AtlButton>
      </AtlTooltip>
      <AtlMenuTrigger
        menu={
          <AtlMenu variant="compact">
            <AtlMenuItem>Edit</AtlMenuItem>
            <AtlMenuItem>Duplicate</AtlMenuItem>
            <AtlMenuSeparator />
            <AtlMenuItem>Delete</AtlMenuItem>
          </AtlMenu>
        }
      >
        {({ onClick, ref }) => (
          <AtlTooltip atlTooltip="More actions">
            <AtlButton ref={ref} onClick={onClick} variant="outline" size="sm">...</AtlButton>
          </AtlTooltip>
        )}
      </AtlMenuTrigger>
    </AtlCardContent>
  </AtlCard>
))}`;

const dataListVue = `<div class="list-header">
  <h2>Projects</h2>
  <AtlButton variant="primary" size="sm">New project</AtlButton>
</div>
<AtlCard v-for="item in items" :key="item.id" variant="outlined" padding="md">
  <AtlCardContent>
    <span>{{ item.name }}</span>
    <AtlBadge :variant="item.statusVariant" size="sm">{{ item.status }}</AtlBadge>
    <p>{{ item.description }}</p>
    <AtlTooltip atlTooltip="View details">
      <AtlButton variant="outline" size="sm">View</AtlButton>
    </AtlTooltip>
    <AtlMenuTrigger>
      <template #trigger>
        <AtlTooltip atlTooltip="More actions">
          <AtlButton variant="outline" size="sm">...</AtlButton>
        </AtlTooltip>
      </template>
      <template #menu>
        <AtlMenu variant="compact">
          <AtlMenuItem>Edit</AtlMenuItem>
          <AtlMenuItem>Duplicate</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem>Delete</AtlMenuItem>
        </AtlMenu>
      </template>
    </AtlMenuTrigger>
  </AtlCardContent>
</AtlCard>`;

const notificationsAngular = `<atl-accordion-group [multi]="true" variant="separated">
  <atl-accordion-item [expanded]="true">
    <span atlAccordionHeader>
      Errors <atl-badge variant="danger" size="sm">2</atl-badge>
    </span>
    <atl-alert variant="danger">Database failed.</atl-alert>
    <atl-alert variant="danger">Service 503.</atl-alert>
  </atl-accordion-item>
  <atl-accordion-item>
    <span atlAccordionHeader>
      Warnings <atl-badge variant="warning" size="sm">1</atl-badge>
    </span>
    <atl-alert variant="warning">Disk at 89%.</atl-alert>
  </atl-accordion-item>
</atl-accordion-group>`;

const notificationsReact = `<AtlAccordionGroup multi variant="separated">
  <AtlAccordionItem expanded>
    <span>Errors <AtlBadge variant="danger" size="sm">2</AtlBadge></span>
    <AtlAlert variant="danger">Database failed.</AtlAlert>
    <AtlAlert variant="danger">Service 503.</AtlAlert>
  </AtlAccordionItem>
  <AtlAccordionItem>
    <span>Warnings <AtlBadge variant="warning" size="sm">1</AtlBadge></span>
    <AtlAlert variant="warning">Disk at 89%.</AtlAlert>
  </AtlAccordionItem>
</AtlAccordionGroup>`;

const notificationsVue = `<AtlAccordionGroup :multi="true" variant="separated">
  <AtlAccordionItem :expanded="true">
    <template #header>
      Errors <AtlBadge variant="danger">2</AtlBadge>
    </template>
    <AtlAlert variant="danger">Database failed.</AtlAlert>
  </AtlAccordionItem>
  <AtlAccordionItem>
    <template #header>
      Warnings <AtlBadge variant="warning">1</AtlBadge>
    </template>
    <AtlAlert variant="warning">Disk at 89%.</AtlAlert>
  </AtlAccordionItem>
</AtlAccordionGroup>`;

const dashboardAngular = `<!-- Metric cards + activity table + quota widget.
     Uses Card, Table, TabGroup, Badge, Alert, Progress. -->
<atl-tab-group variant="pills" [(selectedIndex)]="range">
  <atl-tab label="7D" />
  <atl-tab label="30D" />
  <atl-tab label="90D" />
</atl-tab-group>
@if (quota() >= 85) {
  <atl-alert variant="warning">API quota at {{ quota() }}%.</atl-alert>
}
<!-- ...metric cards grid (AtlCard + AtlBadge delta)... -->
<atl-table variant="striped" size="sm">
  <atl-thead>
    <atl-tr><atl-th>User</atl-th><atl-th>Action</atl-th></atl-tr>
  </atl-thead>
  <atl-tbody>
    @for (row of activity(); track row.id) {
      <atl-tr>
        <atl-td>{{ row.user }}</atl-td>
        <atl-td>{{ row.action }}</atl-td>
      </atl-tr>
    }
  </atl-tbody>
</atl-table>
<atl-progress [value]="quota()" variant="warning" size="sm" />`;

const dashboardReact = `<AtlTabGroup variant="pills" selectedIndex={range} onSelectedIndexChange={setRange}>
  <AtlTab label="7D">{' '}</AtlTab>
  <AtlTab label="30D">{' '}</AtlTab>
  <AtlTab label="90D">{' '}</AtlTab>
</AtlTabGroup>
{quota >= 85 && <AtlAlert variant="warning">API quota at {quota}%.</AtlAlert>}
{/* ...metric cards grid (AtlCard + AtlBadge delta)... */}
<AtlTable variant="striped" size="sm">
  <AtlThead>
    <AtlTr><AtlTh>User</AtlTh><AtlTh>Action</AtlTh></AtlTr>
  </AtlThead>
  <AtlTbody>
    {activity.map(row => (
      <AtlTr key={row.id}>
        <AtlTd>{row.user}</AtlTd>
        <AtlTd>{row.action}</AtlTd>
      </AtlTr>
    ))}
  </AtlTbody>
</AtlTable>
<AtlProgress value={quota} variant="warning" size="sm" />`;

const dashboardVue = `<AtlTabGroup variant="pills" v-model:selectedIndex="range">
  <AtlTab label="7D">&nbsp;</AtlTab>
  <AtlTab label="30D">&nbsp;</AtlTab>
  <AtlTab label="90D">&nbsp;</AtlTab>
</AtlTabGroup>
<AtlAlert v-if="quota >= 85" variant="warning">API quota at {{ quota }}%.</AtlAlert>
<!-- ...metric cards grid (AtlCard + AtlBadge delta)... -->
<AtlTable variant="striped" size="sm">
  <AtlThead>
    <AtlTr><AtlTh>User</AtlTh><AtlTh>Action</AtlTh></AtlTr>
  </AtlThead>
  <AtlTbody>
    <AtlTr v-for="row in activity" :key="row.id">
      <AtlTd>{{ row.user }}</AtlTd>
      <AtlTd>{{ row.action }}</AtlTd>
    </AtlTr>
  </AtlTbody>
</AtlTable>
<AtlProgress :value="quota" variant="warning" size="sm" />`;

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
    tags: ['AtlCard', 'AtlInput', 'AtlButton', 'AtlAlert', 'AtlCheckbox'],
    angular: loginAngular,
    react: loginReact,
    vue: loginVue,
    whenToUse: [
      'Email + password authentication on a public marketing or app surface.',
      'A short, focused form (≤ 5 fields) where one Card is enough scaffolding.',
      'You need an inline error region that does not navigate the user away from the form.',
    ],
    whenNotToUse: [
      'Multi-step onboarding flows — reach for AtlStepper instead.',
      'Passwordless / magic-link flows where the response is a separate state, not a form error.',
      'When the form needs more than one Card column or section — switch to a Settings-style tabbed layout.',
    ],
    a11yNotes: [
      'AtlInput exposes invalid + describedBy linkage automatically when paired with the Alert via aria-describedby — keep the Alert above the inputs so screen readers reach the error first.',
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
        note: 'Add an AtlCardFooter row with a secondary link aligned opposite to the submit button — same Card / form structure, no new components.',
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
    tags: ['AtlTabGroup', 'AtlToggle', 'AtlSelect', 'AtlInput', 'AtlButton', 'AtlAlert'],
    angular: settingsAngular,
    react: settingsReact,
    vue: settingsVue,
    whenToUse: [
      'A surface where the user toggles roughly 5–25 settings grouped by topic (account, notifications, security, billing).',
      'Settings change rarely and the user expects a "Save" button rather than autosave.',
      'You need stable URLs per tab so screenshots and support links survive navigation — wire `selectedIndex` to the route.',
    ],
    whenNotToUse: [
      'Single-screen inline edit of one or two values — use an AtlCard with the input directly, not a tabbed shell.',
      'Wizard-style sequences where order matters — AtlStepper enforces progression that TabGroup intentionally does not.',
      'Nested settings that need their own sub-tabs — collapse to an accordion or a list-detail layout instead of nesting tab groups.',
    ],
    a11yNotes: [
      'AtlTabGroup uses a roving-tabindex keyboard handler: arrow keys move focus between tabs, Home/End jump to ends, Tab moves into the active panel. Don\'t override these.',
      'Each AtlToggle is a `role="switch"` — its label must describe the on-state ("Email notifications") not the action ("Toggle email").',
      'Autosaving silently is a screen-reader trap. Either keep an explicit Save button (current pattern) or surface autosave with an `aria-live="polite"` region after the fact.',
    ],
    pitfalls: [
      'LLMs frequently hoist tab content into a giant switch in the parent. Each AtlTab\'s body is the projected child — keep state co-located with the inputs, not the parent.',
      'Saving a partial form across tab switches breaks the user\'s mental model. Either persist optimistically per change or block the save button until the user returns to a complete state.',
      'Don\'t bind `AtlSelect` to a tuple `{value, label}` — bind the primitive value and let the option element project the label.',
    ],
    variations: [
      {
        title: 'Vertical-tab variant for ≥ 6 sections',
        note: 'TabGroup has no orientation prop — `variant="pills"` only restyles the tabs, it doesn\'t turn them vertical. You supply the side-tab layout in surrounding CSS (e.g. a flex row with the tablist in a column); the same primitive keeps its keyboard semantics either way.',
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
    tags: ['AtlDialog', 'AtlAlert', 'AtlButton'],
    angular: confirmAngular,
    react: confirmReact,
    vue: confirmVue,
    whenToUse: [
      'Irreversible actions: deleting an account, revoking an API key, leaving an organization.',
      'Actions whose blast radius the user might underestimate ("delete project" hides "delete all 4,000 issues").',
      'When the operation is fast enough that a modal is acceptable — anything > ~3 s should open a separate destination, not a dialog.',
    ],
    whenNotToUse: [
      'Reversible actions with an undo affordance — show an AtlToast with an "Undo" action instead.',
      'Form-style multi-field confirmation ("type the project name to confirm") — that\'s a destructive form, render it on its own page or in an AtlDrawer.',
      'As an "are you sure?" wrapper around every save button. Confirmation fatigue trains users to click through.',
    ],
    a11yNotes: [
      'AtlDialog uses the native `<dialog>` element with `cdkTrapFocus` — focus moves to the first focusable inside, restores on close. Don\'t reimplement.',
      'Escape-to-close comes from the native `<dialog>` element\'s cancel event — the component intercepts it and routes it through the `open` binding as a close request. If an in-flight operation must not be interrupted, ignore that request (keep `open` true) until the mutation settles.',
      'The destructive button must remain the *secondary* visual call to action — Cancel as `outline`, "Yes, delete" as `primary`. Reversing colour just to make red prominent is a contrast trap.',
    ],
    pitfalls: [
      'LLMs frequently add `autoFocus` to the destructive button — this nudges users into an accidental confirm. The first Tab stop should be Cancel.',
      'Forgetting to gate the trigger when the action is already in flight produces double-deletes; flip the dialog\'s `open` to false only after the mutation resolves.',
      'Putting body content as a raw string inside `AtlDialogContent` skips the AtlAlert composition the cookbook recommends — the Alert is what carries the warning role for assistive tech.',
    ],
    variations: [
      {
        title: 'With type-to-confirm input',
        note: 'Add an AtlInput inside `AtlDialogContent` that the user must type the resource name into. Disable the destructive button until match.',
      },
      {
        title: 'Loading state',
        note: 'Bind `loading={pending}` on the destructive AtlButton; keep the dialog open so a slow network failure doesn\'t lose context.',
      },
    ],
    storybook: storybookLinks('confirmation-dialog'),
  },
  {
    id: 'data-list',
    num: 4,
    title: 'Data List with Actions',
    description: 'Inline actions on a list of items. The core pattern for dashboards and admin panels — Card + Badge + Button composition.',
    tags: ['AtlCard', 'AtlBadge', 'AtlButton', 'AtlMenu', 'AtlTooltip'],
    angular: dataListAngular,
    react: dataListReact,
    vue: dataListVue,
    whenToUse: [
      'Lists of 5–50 items where each item has 1 primary action and 2–4 secondary actions.',
      'Items have a status indicator that benefits from a Badge\'s colour semantics (Active, Pending, Failed).',
      'You want each row independently focusable so keyboard users can act on it without tab-trapping in a Table.',
    ],
    whenNotToUse: [
      'More than ~50 items — switch to AtlTable with sorting, sticky header, and pagination.',
      'Items whose primary affordance is reading, not acting — use a plain styled list without per-row buttons.',
      'Lists that need column alignment across rows — Cards collapse content; Tables align it.',
    ],
    a11yNotes: [
      'AtlMenuTrigger from CDK Menu manages roving focus inside the popped menu — don\'t hand-roll arrow-key handlers, you\'ll fight the focus manager.',
      'Each "..." button needs an `aria-label` ("More actions for Marketing Website"). Tooltips improve hover but don\'t replace the accessible name.',
      'When status changes async, surface the Badge update via an `aria-live="polite"` region on the list, not a per-row live region — fewer announcements.',
    ],
    pitfalls: [
      'LLMs render `<a>` and `<button>` interchangeably for row actions — use `<button>` for "Edit", `<a>` only for navigation. Mixing breaks Cmd-click behaviour.',
      'Putting the entire row inside a `<button>` swallows the inner buttons\' click handlers. Use a clickable region pattern (cursor + keydown) rather than a wrapping button.',
      'The cookbook story uses AtlMenu for Edit / Duplicate / Delete because each is a separate operation. If you only have one secondary action, drop the menu and inline the button.',
    ],
    variations: [
      {
        title: 'With selection checkboxes',
        note: 'Add an AtlCheckbox at the row start; lift selection state to the parent and surface a bulk-action bar above the list.',
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
    tags: ['AtlAccordionGroup', 'AtlAlert', 'AtlBadge', 'AtlButton'],
    angular: notificationsAngular,
    react: notificationsReact,
    vue: notificationsVue,
    whenToUse: [
      'A surface where users review historical notifications grouped by severity (errors, warnings, info).',
      'Notifications can be dismissed independently and the user wants to see related items together.',
      'You expect 10–200 items — fewer than 10 should render flat without the accordion wrapper.',
    ],
    whenNotToUse: [
      'Transient toast-style notifications — use AtlToast with `aria-live="assertive"` (error) or `polite` (info), not an accordion.',
      'A single critical message — inline AtlAlert above the page is louder and harder to ignore than a collapsed accordion section.',
      'Real-time logs / streaming output — the accordion expansion animation fights the auto-scroll. Use a virtual-scrolled list instead.',
    ],
    a11yNotes: [
      'AtlAccordionGroup with `multi={true}` lets users keep severity sections open simultaneously — match the user\'s mental model of triage.',
      'Each AtlAlert\'s `role` is bound to its variant (`alert` for danger/warning, `status` for info/success). Don\'t override.',
      'The badge counts beside each accordion header must update when items are dismissed — assistive tech reads the header text on focus, not the changing count below.',
    ],
    pitfalls: [
      'LLMs frequently nest AtlAccordionGroup inside another accordion — flat groupings work better; switch to AtlTabs if you really need two axes.',
      'Auto-collapsing the section when its last item is dismissed is jarring on keyboard users mid-action — leave it open and show an empty-state row.',
      'Marking everything as `variant="danger"` so the user "really sees it" trains them to ignore the colour. Reserve danger for actual failures.',
    ],
    variations: [
      {
        title: 'With "Mark all read" + filter chips',
        note: 'Add a AtlTabGroup above the accordion with severity filters; drive the visible groups from selected filter state.',
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
    tags: ['AtlCard', 'AtlTable', 'AtlTabGroup', 'AtlBadge', 'AtlAlert', 'AtlProgress', 'AtlButton'],
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
      'AtlProgress for quota uses `role="progressbar"` with `aria-valuenow` — don\'t add a duplicate visible-text-only readout for screen readers; the role surfaces the value automatically.',
      'The metric card delta uses a Badge whose colour encodes direction. Pair every coloured delta with a `+` / `-` glyph so the meaning survives without colour.',
      'Recent-activity table\'s status column is colour-only when read alone — keep the textual label ("Success", "Pending", "Failed") inside the Badge.',
    ],
    pitfalls: [
      'LLMs love to project tab content into a giant `ngSwitch` / ternary that re-renders the entire grid on each tab change. Bind only the data-fetch scope to the tab; let the layout stay static.',
      'Using `variant="warning"` Alerts for every quota above 50 % numbs the signal. Reserve for crossings of the actual SLA / billing threshold.',
      'Putting the table and the side panel into a single AtlCard collapses their independent scroll regions. They\'re siblings, not parent/child.',
    ],
    variations: [
      {
        title: 'With drill-down per metric',
        note: 'Add an `onClick` that opens an AtlDrawer with the metric\'s history — Drawer keeps the dashboard context, Dialog would dim it.',
      },
      {
        title: 'Empty state',
        note: 'When no activity exists, replace the table with a centered AtlAlert + AtlButton ("Invite your first member") inside the same Card.',
      },
    ],
    storybook: storybookLinks('management-dashboard'),
  },
];
