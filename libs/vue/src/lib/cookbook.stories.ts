import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { userEvent, expect, screen } from 'storybook/test';
import { ref } from 'vue';

import LlmButton from './button/llm-button.vue';
import LlmCard from './card/llm-card.vue';
import LlmCardHeader from './card/llm-card-header.vue';
import LlmCardContent from './card/llm-card-content.vue';
import LlmCardFooter from './card/llm-card-footer.vue';
import LlmBadge from './badge/llm-badge.vue';
import LlmInput from './input/llm-input.vue';
import LlmCheckbox from './checkbox/llm-checkbox.vue';
import LlmToggle from './toggle/llm-toggle.vue';
import LlmAlert from './alert/llm-alert.vue';
import LlmSelect from './select/llm-select.vue';
import LlmOption from './select/llm-option.vue';
import LlmDialog from './dialog/llm-dialog.vue';
import LlmDialogHeader from './dialog/llm-dialog-header.vue';
import LlmDialogContent from './dialog/llm-dialog-content.vue';
import LlmDialogFooter from './dialog/llm-dialog-footer.vue';
import LlmTabGroup from './tabs/llm-tab-group.vue';
import LlmTab from './tabs/llm-tab.vue';
import LlmAccordionGroup from './accordion/llm-accordion-group.vue';
import LlmAccordionItem from './accordion/llm-accordion-item.vue';
import LlmAccordionHeader from './accordion/llm-accordion-header.vue';
import LlmTable from './table/llm-table.vue';
import LlmThead from './table/llm-thead.vue';
import LlmTbody from './table/llm-tbody.vue';
import LlmTr from './table/llm-tr.vue';
import LlmTh from './table/llm-th.vue';
import LlmTd from './table/llm-td.vue';
import LlmProgress from './progress/llm-progress.vue';
import LlmMenu from './menu/llm-menu.vue';
import LlmMenuItem from './menu/llm-menu-item.vue';
import LlmMenuSeparator from './menu/llm-menu-separator.vue';
import LlmMenuTrigger from './menu/llm-menu-trigger.vue';
import LlmTooltip from './tooltip/llm-tooltip.vue';

// ---------------------------------------------------------------------------
// Shared inline style fragments. Keeping them in one place avoids duplicating
// long style="..." attributes across every pattern template.
// ---------------------------------------------------------------------------

const S = {
  wrapper: (w: number) => `max-width:${w}px;margin:0 auto;padding:var(--ui-spacing-6);`,
  stack: 'display:flex;flex-direction:column;',
  title: 'margin:0;font-size:1.25rem;font-weight:600;color:var(--ui-color-text);',
  subtitle: 'margin:var(--ui-spacing-1) 0 0;font-size:0.875rem;color:var(--ui-color-text-muted);',
  fieldLabel: 'font-size:0.875rem;font-weight:500;color:var(--ui-color-text);',
  formField: 'display:flex;flex-direction:column;gap:var(--ui-spacing-1);',
  panelTitle: 'margin:0;font-size:1rem;font-weight:600;color:var(--ui-color-text);',
};

// ---------------------------------------------------------------------------
// 1. Login Form
// ---------------------------------------------------------------------------

const loginTemplate = (showErrors: boolean) => `
  <div style="${S.wrapper(400)}">
    <LlmCard variant="elevated" padding="lg">
      <LlmCardHeader>
        <div>
          <h2 style="${S.title}">Sign in</h2>
          <p style="${S.subtitle}">Enter your credentials to continue</p>
        </div>
      </LlmCardHeader>
      <LlmCardContent>
        ${showErrors ? '<LlmAlert variant="danger">Invalid email or password. Please try again.</LlmAlert>' : ''}
        <div style="${S.stack}gap:var(--ui-spacing-4);margin-top:var(--ui-spacing-4);">
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Email</label>
            <LlmInput type="email" placeholder="you@example.com" :invalid="${showErrors}" />
          </div>
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Password</label>
            <LlmInput type="password" placeholder="Enter your password" :invalid="${showErrors}" />
          </div>
          <LlmCheckbox>Remember me</LlmCheckbox>
        </div>
      </LlmCardContent>
      <LlmCardFooter>
        <LlmButton variant="primary" size="md" :loading="loading" @click="onSubmit">
          Sign in
        </LlmButton>
      </LlmCardFooter>
    </LlmCard>
  </div>
`;

const LoginFormStory = (showErrors: boolean): StoryObj => ({
  render: () => ({
    components: {
      LlmButton,
      LlmCard,
      LlmCardHeader,
      LlmCardContent,
      LlmCardFooter,
      LlmInput,
      LlmCheckbox,
      LlmAlert,
    },
    setup() {
      const loading = ref(false);
      const onSubmit = () => {
        loading.value = true;
        setTimeout(() => (loading.value = false), 2000);
      };
      return { loading, onSubmit };
    },
    template: loginTemplate(showErrors),
  }),
});

// ---------------------------------------------------------------------------
// 2. Settings Page
// ---------------------------------------------------------------------------

const settingsTemplate = `
  <div style="${S.wrapper(560)}">
    <h2 style="${S.title}">Settings</h2>
    <LlmTabGroup v-model:selectedIndex="tab">
      <LlmTab label="Account">
        <div style="${S.stack}gap:var(--ui-spacing-4);padding:var(--ui-spacing-4) 0;">
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Display name</label>
            <LlmInput placeholder="Jane Doe" />
          </div>
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Email</label>
            <LlmInput type="email" placeholder="you@example.com" />
          </div>
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Timezone</label>
            <LlmSelect placeholder="Select timezone">
              <LlmOption optionValue="utc">UTC</LlmOption>
              <LlmOption optionValue="cet">Central European Time</LlmOption>
              <LlmOption optionValue="pst">Pacific Standard Time</LlmOption>
            </LlmSelect>
          </div>
        </div>
      </LlmTab>
      <LlmTab label="Notifications">
        <div style="${S.stack}gap:var(--ui-spacing-4);padding:var(--ui-spacing-4) 0;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
            <div>
              <div style="font-size:0.9375rem;font-weight:500;color:var(--ui-color-text)">Product updates</div>
              <div style="font-size:0.8125rem;color:var(--ui-color-text-muted)">Release notes and feature announcements</div>
            </div>
            <LlmToggle :checked="true" />
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
            <div>
              <div style="font-size:0.9375rem;font-weight:500;color:var(--ui-color-text)">Weekly digest</div>
              <div style="font-size:0.8125rem;color:var(--ui-color-text-muted)">Activity summary every Monday</div>
            </div>
            <LlmToggle :checked="false" />
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
            <div>
              <div style="font-size:0.9375rem;font-weight:500;color:var(--ui-color-text)">Security alerts</div>
              <div style="font-size:0.8125rem;color:var(--ui-color-text-muted)">Critical account notifications</div>
            </div>
            <LlmToggle :checked="true" />
          </div>
        </div>
      </LlmTab>
      <LlmTab label="Billing">
        <div style="${S.stack}gap:var(--ui-spacing-4);padding:var(--ui-spacing-4) 0;">
          <LlmAlert variant="info">Your next invoice of $29.00 will be charged on Apr 30.</LlmAlert>
          <LlmButton variant="outline" size="sm">Manage payment method</LlmButton>
        </div>
      </LlmTab>
    </LlmTabGroup>
  </div>
`;

// ---------------------------------------------------------------------------
// 3. Confirmation Dialog
// ---------------------------------------------------------------------------

const confirmationTemplate = `
  <div style="${S.wrapper(400)}">
    <LlmButton variant="outline" @click="open = true">Delete account</LlmButton>
    <LlmDialog v-model:open="open" size="sm">
      <LlmDialogHeader>Delete this account?</LlmDialogHeader>
      <LlmDialogContent>
        <LlmAlert variant="warning">This action cannot be undone.</LlmAlert>
        <p style="margin:var(--ui-spacing-3) 0 0;color:var(--ui-color-text-muted);font-size:0.875rem">
          All your data, workspaces, and API keys will be removed immediately.
        </p>
      </LlmDialogContent>
      <LlmDialogFooter>
        <LlmButton variant="outline" @click="open = false">Cancel</LlmButton>
        <LlmButton variant="primary" @click="open = false">Delete permanently</LlmButton>
      </LlmDialogFooter>
    </LlmDialog>
  </div>
`;

// ---------------------------------------------------------------------------
// 4. Data List with Actions
// ---------------------------------------------------------------------------

const dataListItems = [
  {
    id: 1,
    name: 'Marketing Website',
    description: 'Company landing page redesign with new brand assets',
    status: 'Active',
    statusVariant: 'success',
  },
  {
    id: 2,
    name: 'Mobile App v2',
    description: 'Cross-platform mobile application rewrite in Flutter',
    status: 'In Review',
    statusVariant: 'warning',
  },
  {
    id: 3,
    name: 'API Gateway',
    description: 'Centralized API gateway for microservices architecture',
    status: 'Draft',
    statusVariant: 'default',
  },
  {
    id: 4,
    name: 'Legacy Migration',
    description: 'Migrate legacy PHP monolith to Node.js microservices',
    status: 'Paused',
    statusVariant: 'danger',
  },
];

const dataListTemplate = `
  <div style="${S.wrapper(640)}display:flex;flex-direction:column;gap:var(--ui-spacing-3);">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--ui-spacing-2)">
      <h2 style="${S.title}">Projects</h2>
      <LlmButton variant="primary" size="sm">New project</LlmButton>
    </div>
    <LlmCard v-for="item in items" :key="item.id" variant="outlined" padding="md">
      <LlmCardContent>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:var(--ui-spacing-2)">
              <span style="font-size:0.9375rem;font-weight:600;color:var(--ui-color-text)">{{ item.name }}</span>
              <LlmBadge :variant="item.statusVariant" size="sm">{{ item.status }}</LlmBadge>
            </div>
            <p style="margin:var(--ui-spacing-1) 0 0;font-size:0.8125rem;color:var(--ui-color-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ item.description }}</p>
          </div>
          <div style="display:flex;gap:var(--ui-spacing-2);flex-shrink:0">
            <LlmTooltip llmTooltip="View details" llmTooltipPosition="above">
              <LlmButton variant="outline" size="sm">View</LlmButton>
            </LlmTooltip>
            <LlmMenuTrigger>
              <template #trigger>
                <LlmTooltip llmTooltip="More actions" llmTooltipPosition="above">
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
          </div>
        </div>
      </LlmCardContent>
    </LlmCard>
  </div>
`;

// ---------------------------------------------------------------------------
// 5. Notification Center
// ---------------------------------------------------------------------------

const notificationTemplate = `
  <div style="${S.wrapper(560)}">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--ui-spacing-4)">
      <h2 style="${S.title}">Notifications</h2>
      <LlmButton variant="outline" size="sm" @click="clearAll">Clear all</LlmButton>
    </div>
    <LlmAccordionGroup :multi="true" variant="separated">
      <LlmAccordionItem v-if="errors.length > 0" :expanded="true">
        <template #header>
          <LlmAccordionHeader>
            <span style="display:inline-flex;align-items:center;gap:var(--ui-spacing-2)">
              Errors
              <LlmBadge variant="danger" size="sm">{{ errors.length }}</LlmBadge>
            </span>
          </LlmAccordionHeader>
        </template>
        <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-2);padding:var(--ui-spacing-3) 0">
          <LlmAlert
            v-for="e in errors"
            :key="e.id"
            variant="danger"
            :dismissible="true"
            @dismissed="dismissError(e.id)"
          >{{ e.message }}</LlmAlert>
        </div>
      </LlmAccordionItem>
      <LlmAccordionItem v-if="warnings.length > 0">
        <template #header>
          <LlmAccordionHeader>
            <span style="display:inline-flex;align-items:center;gap:var(--ui-spacing-2)">
              Warnings
              <LlmBadge variant="warning" size="sm">{{ warnings.length }}</LlmBadge>
            </span>
          </LlmAccordionHeader>
        </template>
        <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-2);padding:var(--ui-spacing-3) 0">
          <LlmAlert
            v-for="w in warnings"
            :key="w.id"
            variant="warning"
            :dismissible="true"
            @dismissed="dismissWarning(w.id)"
          >{{ w.message }}</LlmAlert>
        </div>
      </LlmAccordionItem>
      <LlmAccordionItem v-if="infos.length > 0">
        <template #header>
          <LlmAccordionHeader>
            <span style="display:inline-flex;align-items:center;gap:var(--ui-spacing-2)">
              Info
              <LlmBadge variant="info" size="sm">{{ infos.length }}</LlmBadge>
            </span>
          </LlmAccordionHeader>
        </template>
        <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-2);padding:var(--ui-spacing-3) 0">
          <LlmAlert
            v-for="i in infos"
            :key="i.id"
            variant="info"
            :dismissible="true"
            @dismissed="dismissInfo(i.id)"
          >{{ i.message }}</LlmAlert>
        </div>
      </LlmAccordionItem>
    </LlmAccordionGroup>
  </div>
`;

// ---------------------------------------------------------------------------
// 6. Management Dashboard
// ---------------------------------------------------------------------------

const metrics = [
  { label: 'Active users', value: '8,412', delta: '+12%', deltaVariant: 'success', foot: 'vs. previous period' },
  { label: 'Sessions', value: '24,390', delta: '+4%', deltaVariant: 'success', foot: 'vs. previous period' },
  { label: 'Revenue', value: '$42,108', delta: '-2%', deltaVariant: 'danger', foot: 'vs. previous period' },
  { label: 'Avg. response', value: '184 ms', delta: '+18 ms', deltaVariant: 'warning', foot: 'P95 across edge nodes' },
];

const activity = [
  { id: 1, user: 'alex@acme.dev', action: 'Rotated API key', status: 'Success', statusVariant: 'success', time: '2m ago' },
  { id: 2, user: 'maria@acme.dev', action: 'Invited new member', status: 'Pending', statusVariant: 'warning', time: '14m ago' },
  { id: 3, user: 'deploy-bot', action: 'Pushed build v3.2.1', status: 'Success', statusVariant: 'success', time: '1h ago' },
  { id: 4, user: 'lee@acme.dev', action: 'Removed webhook', status: 'Failed', statusVariant: 'danger', time: '2h ago' },
  { id: 5, user: 'system', action: 'Nightly backup complete', status: 'Success', statusVariant: 'success', time: '6h ago' },
];

const dashboardTemplate = `
  <div style="${S.wrapper(1040)}display:flex;flex-direction:column;gap:var(--ui-spacing-4);">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--ui-spacing-4)">
      <div>
        <h2 style="${S.title}">Operations Overview</h2>
        <p style="${S.subtitle}">Snapshot across the selected time range</p>
      </div>
      <LlmTabGroup variant="pills" v-model:selectedIndex="rangeIndex">
        <LlmTab label="7D">&nbsp;</LlmTab>
        <LlmTab label="30D">&nbsp;</LlmTab>
        <LlmTab label="90D">&nbsp;</LlmTab>
      </LlmTabGroup>
    </div>
    <LlmAlert v-if="quotaPercent >= 85" variant="warning" :dismissible="true">
      API request quota is at {{ quotaPercent }}%. Upgrade your plan before
      the monthly reset to avoid throttling.
    </LlmAlert>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--ui-spacing-3)">
      <LlmCard v-for="metric in metrics" :key="metric.label" variant="elevated" padding="md">
        <LlmCardContent>
          <div style="font-size:0.8125rem;color:var(--ui-color-text-muted);text-transform:uppercase;letter-spacing:0.04em">
            {{ metric.label }}
          </div>
          <div style="display:flex;align-items:baseline;gap:var(--ui-spacing-2);margin-top:var(--ui-spacing-2)">
            <span style="font-size:1.75rem;font-weight:700;color:var(--ui-color-text)">{{ metric.value }}</span>
            <LlmBadge :variant="metric.deltaVariant" size="sm">{{ metric.delta }}</LlmBadge>
          </div>
          <p style="margin:var(--ui-spacing-2) 0 0;font-size:0.75rem;color:var(--ui-color-text-muted)">
            {{ metric.foot }}
          </p>
        </LlmCardContent>
      </LlmCard>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--ui-spacing-3)">
      <LlmCard variant="elevated" padding="none">
        <LlmCardHeader>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 style="${S.panelTitle}">Recent Activity</h3>
            <LlmButton variant="outline" size="sm">Export</LlmButton>
          </div>
        </LlmCardHeader>
        <LlmCardContent>
          <LlmTable variant="striped" size="sm">
            <LlmThead>
              <LlmTr>
                <LlmTh>User</LlmTh>
                <LlmTh>Action</LlmTh>
                <LlmTh>Status</LlmTh>
                <LlmTh align="end">Time</LlmTh>
              </LlmTr>
            </LlmThead>
            <LlmTbody>
              <LlmTr v-for="row in activity" :key="row.id">
                <LlmTd>{{ row.user }}</LlmTd>
                <LlmTd>{{ row.action }}</LlmTd>
                <LlmTd>
                  <LlmBadge :variant="row.statusVariant" size="sm">{{ row.status }}</LlmBadge>
                </LlmTd>
                <LlmTd align="end">{{ row.time }}</LlmTd>
              </LlmTr>
            </LlmTbody>
          </LlmTable>
        </LlmCardContent>
      </LlmCard>
      <LlmCard variant="elevated" padding="md">
        <LlmCardHeader>
          <h3 style="${S.panelTitle}">Plan Usage</h3>
        </LlmCardHeader>
        <LlmCardContent>
          <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-4)">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--ui-spacing-1);font-size:0.8125rem">
                <span style="color:var(--ui-color-text);font-weight:500">API requests</span>
                <span style="color:var(--ui-color-text-muted);font-variant-numeric:tabular-nums">{{ quotaPercent }}%</span>
              </div>
              <LlmProgress :value="quotaPercent" variant="warning" size="sm" />
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--ui-spacing-1);font-size:0.8125rem">
                <span style="color:var(--ui-color-text);font-weight:500">Storage</span>
                <span style="color:var(--ui-color-text-muted);font-variant-numeric:tabular-nums">42%</span>
              </div>
              <LlmProgress :value="42" variant="success" size="sm" />
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--ui-spacing-1);font-size:0.8125rem">
                <span style="color:var(--ui-color-text);font-weight:500">Seats</span>
                <span style="color:var(--ui-color-text-muted);font-variant-numeric:tabular-nums">9 / 12</span>
              </div>
              <LlmProgress :value="75" variant="default" size="sm" />
            </div>
          </div>
        </LlmCardContent>
      </LlmCard>
    </div>
  </div>
`;

// ---------------------------------------------------------------------------
// Storybook Meta & Stories
// ---------------------------------------------------------------------------

const meta: Meta = { title: 'Cookbook' };

export default meta;
type Story = StoryObj;

export const LoginForm: Story = {
  ...LoginFormStory(false),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(await canvas.findByLabelText('Remember me')).toBeInTheDocument();
  },
};

export const LoginFormWithValidationErrors: Story = {
  name: 'Login Form / With Validation Errors',
  ...LoginFormStory(true),
};

export const SettingsPage: Story = {
  render: () => ({
    components: {
      LlmTabGroup,
      LlmTab,
      LlmInput,
      LlmSelect,
      LlmOption,
      LlmToggle,
      LlmAlert,
      LlmButton,
    },
    setup() {
      const tab = ref(0);
      return { tab };
    },
    template: settingsTemplate,
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(await canvas.findByRole('tab', { name: 'Account' })).toBeVisible();
  },
};

export const ConfirmationDialog: Story = {
  render: () => ({
    components: {
      LlmButton,
      LlmDialog,
      LlmDialogHeader,
      LlmDialogContent,
      LlmDialogFooter,
      LlmAlert,
    },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: confirmationTemplate,
  }),
  play: async ({ canvas }) => {
    const trigger = await canvas.findByRole('button', { name: 'Delete account' });
    await userEvent.click(trigger);
    // Native <dialog> renders to the top-layer outside the Storybook canvas root,
    // so query the whole document via `screen` instead of the scoped `canvas`.
    const dialog = await screen.findByRole('dialog');
    await expect(dialog).toHaveAttribute('open');
    await expect(
      await screen.findByRole('button', { name: 'Delete permanently' }),
    ).toBeInTheDocument();
  },
};

export const DataListWithActions: Story = {
  name: 'Data List with Actions',
  render: () => ({
    components: {
      LlmCard,
      LlmCardContent,
      LlmButton,
      LlmBadge,
      LlmMenu,
      LlmMenuItem,
      LlmMenuSeparator,
      LlmMenuTrigger,
      LlmTooltip,
    },
    setup() {
      return { items: dataListItems };
    },
    template: dataListTemplate,
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(await canvas.findByText('Marketing Website')).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'New project' })).toBeVisible();
  },
};

export const NotificationCenter: Story = {
  render: () => ({
    components: {
      LlmAccordionGroup,
      LlmAccordionItem,
      LlmAccordionHeader,
      LlmAlert,
      LlmBadge,
      LlmButton,
    },
    setup() {
      const errors = ref([
        { id: 1, message: 'Database connection failed on replica-3. Automatic failover engaged.' },
        { id: 2, message: 'Payment processing service returned 503 for 12 transactions.' },
      ]);
      const warnings = ref([
        { id: 3, message: 'Disk usage on worker-7 is at 89%. Consider scaling storage.' },
        { id: 4, message: 'SSL certificate for api.example.com expires in 14 days.' },
        { id: 5, message: 'Rate limiter triggered 230 times in the last hour.' },
      ]);
      const infos = ref([
        { id: 6, message: 'Deployment v3.2.1 completed successfully across all regions.' },
        { id: 7, message: 'Scheduled maintenance window begins Saturday at 02:00 UTC.' },
      ]);
      const dismissError = (id: number) => {
        errors.value = errors.value.filter((x) => x.id !== id);
      };
      const dismissWarning = (id: number) => {
        warnings.value = warnings.value.filter((x) => x.id !== id);
      };
      const dismissInfo = (id: number) => {
        infos.value = infos.value.filter((x) => x.id !== id);
      };
      const clearAll = () => {
        errors.value = [];
        warnings.value = [];
        infos.value = [];
      };
      return { errors, warnings, infos, dismissError, dismissWarning, dismissInfo, clearAll };
    },
    template: notificationTemplate,
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'Clear all' })).toBeVisible();
    await expect(await canvas.findByText('Errors')).toBeVisible();
  },
};

export const ManagementDashboard: Story = {
  render: () => ({
    components: {
      LlmCard,
      LlmCardHeader,
      LlmCardContent,
      LlmBadge,
      LlmButton,
      LlmTable,
      LlmThead,
      LlmTbody,
      LlmTr,
      LlmTh,
      LlmTd,
      LlmTabGroup,
      LlmTab,
      LlmAlert,
      LlmProgress,
    },
    setup() {
      const rangeIndex = ref(1);
      const quotaPercent = ref(87);
      return { rangeIndex, quotaPercent, metrics, activity };
    },
    template: dashboardTemplate,
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Operations Overview' })).toBeVisible();
    await expect(await canvas.findByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(await canvas.findByRole('heading', { name: 'Plan Usage' })).toBeVisible();
  },
};
