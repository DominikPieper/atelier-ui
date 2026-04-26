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

export interface PatternMeta {
  id: PatternId;
  num: number;
  title: string;
  description: string;
  tags: string[];
  angular: string;
  react: string;
  vue: string;
}

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
  },
];
