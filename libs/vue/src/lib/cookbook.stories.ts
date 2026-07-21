import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { userEvent, expect, screen } from 'storybook/test';
import { ref } from 'vue';

import AtlButton from './button/atl-button.vue';
import AtlCard from './card/atl-card.vue';
import AtlCardHeader from './card/atl-card-header.vue';
import AtlCardContent from './card/atl-card-content.vue';
import AtlCardFooter from './card/atl-card-footer.vue';
import AtlBadge from './badge/atl-badge.vue';
import AtlInput from './input/atl-input.vue';
import AtlCheckbox from './checkbox/atl-checkbox.vue';
import AtlToggle from './toggle/atl-toggle.vue';
import AtlAlert from './alert/atl-alert.vue';
import AtlSelect from './select/atl-select.vue';
import AtlOption from './select/atl-option.vue';
import AtlDialog from './dialog/atl-dialog.vue';
import AtlDialogHeader from './dialog/atl-dialog-header.vue';
import AtlDialogContent from './dialog/atl-dialog-content.vue';
import AtlDialogFooter from './dialog/atl-dialog-footer.vue';
import AtlTabGroup from './tabs/atl-tab-group.vue';
import AtlTab from './tabs/atl-tab.vue';
import AtlAccordionGroup from './accordion/atl-accordion-group.vue';
import AtlAccordionItem from './accordion/atl-accordion-item.vue';
import AtlAccordionHeader from './accordion/atl-accordion-header.vue';
import AtlTable from './table/atl-table.vue';
import AtlThead from './table/atl-thead.vue';
import AtlTbody from './table/atl-tbody.vue';
import AtlTr from './table/atl-tr.vue';
import AtlTh from './table/atl-th.vue';
import AtlTd from './table/atl-td.vue';
import AtlProgress from './progress/atl-progress.vue';
import AtlMenu from './menu/atl-menu.vue';
import AtlMenuItem from './menu/atl-menu-item.vue';
import AtlMenuSeparator from './menu/atl-menu-separator.vue';
import AtlMenuTrigger from './menu/atl-menu-trigger.vue';
import AtlTooltip from './tooltip/atl-tooltip.vue';

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
    <AtlCard variant="elevated" padding="lg">
      <AtlCardHeader>
        <div>
          <h2 style="${S.title}">Sign in</h2>
          <p style="${S.subtitle}">Enter your credentials to continue</p>
        </div>
      </AtlCardHeader>
      <AtlCardContent>
        ${showErrors ? '<AtlAlert variant="danger">Invalid email or password. Please try again.</AtlAlert>' : ''}
        <div style="${S.stack}gap:var(--ui-spacing-4);margin-top:var(--ui-spacing-4);">
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Email</label>
            <AtlInput type="email" placeholder="you@example.com" :invalid="${showErrors}" />
          </div>
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Password</label>
            <AtlInput type="password" placeholder="Enter your password" :invalid="${showErrors}" />
          </div>
          <AtlCheckbox>Remember me</AtlCheckbox>
        </div>
      </AtlCardContent>
      <AtlCardFooter>
        <AtlButton variant="primary" size="md" :loading="loading" @click="onSubmit">
          Sign in
        </AtlButton>
      </AtlCardFooter>
    </AtlCard>
  </div>
`;

const LoginFormStory = (showErrors: boolean): StoryObj => ({
  render: () => ({
    components: {
      AtlButton,
      AtlCard,
      AtlCardHeader,
      AtlCardContent,
      AtlCardFooter,
      AtlInput,
      AtlCheckbox,
      AtlAlert,
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
    <AtlTabGroup v-model:selectedIndex="tab">
      <AtlTab label="Account">
        <div style="${S.stack}gap:var(--ui-spacing-4);padding:var(--ui-spacing-4) 0;">
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Display name</label>
            <AtlInput placeholder="Jane Doe" />
          </div>
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Email</label>
            <AtlInput type="email" placeholder="you@example.com" />
          </div>
          <div style="${S.formField}">
            <label style="${S.fieldLabel}">Timezone</label>
            <AtlSelect placeholder="Select timezone">
              <AtlOption optionValue="utc">UTC</AtlOption>
              <AtlOption optionValue="cet">Central European Time</AtlOption>
              <AtlOption optionValue="pst">Pacific Standard Time</AtlOption>
            </AtlSelect>
          </div>
        </div>
      </AtlTab>
      <AtlTab label="Notifications">
        <div style="${S.stack}gap:var(--ui-spacing-4);padding:var(--ui-spacing-4) 0;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
            <div>
              <div style="font-size:0.9375rem;font-weight:500;color:var(--ui-color-text)">Product updates</div>
              <div style="font-size:0.8125rem;color:var(--ui-color-text-muted)">Release notes and feature announcements</div>
            </div>
            <AtlToggle :checked="true" />
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
            <div>
              <div style="font-size:0.9375rem;font-weight:500;color:var(--ui-color-text)">Weekly digest</div>
              <div style="font-size:0.8125rem;color:var(--ui-color-text-muted)">Activity summary every Monday</div>
            </div>
            <AtlToggle :checked="false" />
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
            <div>
              <div style="font-size:0.9375rem;font-weight:500;color:var(--ui-color-text)">Security alerts</div>
              <div style="font-size:0.8125rem;color:var(--ui-color-text-muted)">Critical account notifications</div>
            </div>
            <AtlToggle :checked="true" />
          </div>
        </div>
      </AtlTab>
      <AtlTab label="Billing">
        <div style="${S.stack}gap:var(--ui-spacing-4);padding:var(--ui-spacing-4) 0;">
          <AtlAlert variant="info">Your next invoice of $29.00 will be charged on Apr 30.</AtlAlert>
          <AtlButton variant="outline" size="sm">Manage payment method</AtlButton>
        </div>
      </AtlTab>
    </AtlTabGroup>
  </div>
`;

// ---------------------------------------------------------------------------
// 3. Confirmation Dialog
// ---------------------------------------------------------------------------

const confirmationTemplate = `
  <div style="${S.wrapper(400)}">
    <AtlButton variant="outline" @click="open = true">Delete account</AtlButton>
    <AtlDialog v-model:open="open" size="sm">
      <AtlDialogHeader>Delete this account?</AtlDialogHeader>
      <AtlDialogContent>
        <AtlAlert variant="warning">This action cannot be undone.</AtlAlert>
        <p style="margin:var(--ui-spacing-3) 0 0;color:var(--ui-color-text-muted);font-size:0.875rem">
          All your data, workspaces, and API keys will be removed immediately.
        </p>
      </AtlDialogContent>
      <AtlDialogFooter>
        <AtlButton variant="outline" @click="open = false">Cancel</AtlButton>
        <AtlButton variant="primary" @click="open = false">Delete permanently</AtlButton>
      </AtlDialogFooter>
    </AtlDialog>
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
      <AtlButton variant="primary" size="sm">New project</AtlButton>
    </div>
    <AtlCard v-for="item in items" :key="item.id" variant="outlined" padding="md">
      <AtlCardContent>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--ui-spacing-4)">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:var(--ui-spacing-2)">
              <span style="font-size:0.9375rem;font-weight:600;color:var(--ui-color-text)">{{ item.name }}</span>
              <AtlBadge :variant="item.statusVariant" size="sm">{{ item.status }}</AtlBadge>
            </div>
            <p style="margin:var(--ui-spacing-1) 0 0;font-size:0.8125rem;color:var(--ui-color-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ item.description }}</p>
          </div>
          <div style="display:flex;gap:var(--ui-spacing-2);flex-shrink:0">
            <AtlTooltip atlTooltip="View details" atlTooltipPosition="above">
              <AtlButton variant="outline" size="sm">View</AtlButton>
            </AtlTooltip>
            <AtlMenuTrigger>
              <template #trigger>
                <AtlTooltip atlTooltip="More actions" atlTooltipPosition="above">
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
          </div>
        </div>
      </AtlCardContent>
    </AtlCard>
  </div>
`;

// ---------------------------------------------------------------------------
// 5. Notification Center
// ---------------------------------------------------------------------------

const notificationTemplate = `
  <div style="${S.wrapper(560)}">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--ui-spacing-4)">
      <h2 style="${S.title}">Notifications</h2>
      <AtlButton variant="outline" size="sm" @click="clearAll">Clear all</AtlButton>
    </div>
    <AtlAccordionGroup :multi="true" variant="separated">
      <AtlAccordionItem v-if="errors.length > 0" :expanded="true">
        <template #header>
          <AtlAccordionHeader>
            <span style="display:inline-flex;align-items:center;gap:var(--ui-spacing-2)">
              Errors
              <AtlBadge variant="danger" size="sm">{{ errors.length }}</AtlBadge>
            </span>
          </AtlAccordionHeader>
        </template>
        <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-2);padding:var(--ui-spacing-3) 0">
          <AtlAlert
            v-for="e in errors"
            :key="e.id"
            variant="danger"
            :dismissible="true"
            @dismissed="dismissError(e.id)"
          >{{ e.message }}</AtlAlert>
        </div>
      </AtlAccordionItem>
      <AtlAccordionItem v-if="warnings.length > 0">
        <template #header>
          <AtlAccordionHeader>
            <span style="display:inline-flex;align-items:center;gap:var(--ui-spacing-2)">
              Warnings
              <AtlBadge variant="warning" size="sm">{{ warnings.length }}</AtlBadge>
            </span>
          </AtlAccordionHeader>
        </template>
        <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-2);padding:var(--ui-spacing-3) 0">
          <AtlAlert
            v-for="w in warnings"
            :key="w.id"
            variant="warning"
            :dismissible="true"
            @dismissed="dismissWarning(w.id)"
          >{{ w.message }}</AtlAlert>
        </div>
      </AtlAccordionItem>
      <AtlAccordionItem v-if="infos.length > 0">
        <template #header>
          <AtlAccordionHeader>
            <span style="display:inline-flex;align-items:center;gap:var(--ui-spacing-2)">
              Info
              <AtlBadge variant="info" size="sm">{{ infos.length }}</AtlBadge>
            </span>
          </AtlAccordionHeader>
        </template>
        <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-2);padding:var(--ui-spacing-3) 0">
          <AtlAlert
            v-for="i in infos"
            :key="i.id"
            variant="info"
            :dismissible="true"
            @dismissed="dismissInfo(i.id)"
          >{{ i.message }}</AtlAlert>
        </div>
      </AtlAccordionItem>
    </AtlAccordionGroup>
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
      <AtlTabGroup variant="pills" v-model:selectedIndex="rangeIndex">
        <AtlTab label="7D">&nbsp;</AtlTab>
        <AtlTab label="30D">&nbsp;</AtlTab>
        <AtlTab label="90D">&nbsp;</AtlTab>
      </AtlTabGroup>
    </div>
    <AtlAlert v-if="quotaPercent >= 85" variant="warning" :dismissible="true">
      API request quota is at {{ quotaPercent }}%. Upgrade your plan before
      the monthly reset to avoid throttling.
    </AtlAlert>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--ui-spacing-3)">
      <AtlCard v-for="metric in metrics" :key="metric.label" variant="elevated" padding="md">
        <AtlCardContent>
          <div style="font-size:0.8125rem;color:var(--ui-color-text-muted);text-transform:uppercase;letter-spacing:0.04em">
            {{ metric.label }}
          </div>
          <div style="display:flex;align-items:baseline;gap:var(--ui-spacing-2);margin-top:var(--ui-spacing-2)">
            <span style="font-size:1.75rem;font-weight:700;color:var(--ui-color-text)">{{ metric.value }}</span>
            <AtlBadge :variant="metric.deltaVariant" size="sm">{{ metric.delta }}</AtlBadge>
          </div>
          <p style="margin:var(--ui-spacing-2) 0 0;font-size:0.75rem;color:var(--ui-color-text-muted)">
            {{ metric.foot }}
          </p>
        </AtlCardContent>
      </AtlCard>
    </div>
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:var(--ui-spacing-3)">
      <AtlCard variant="elevated" padding="none">
        <AtlCardHeader>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <h3 style="${S.panelTitle}">Recent Activity</h3>
            <AtlButton variant="outline" size="sm">Export</AtlButton>
          </div>
        </AtlCardHeader>
        <AtlCardContent>
          <AtlTable variant="striped" size="sm">
            <AtlThead>
              <AtlTr>
                <AtlTh>User</AtlTh>
                <AtlTh>Action</AtlTh>
                <AtlTh>Status</AtlTh>
                <AtlTh align="end">Time</AtlTh>
              </AtlTr>
            </AtlThead>
            <AtlTbody>
              <AtlTr v-for="row in activity" :key="row.id">
                <AtlTd>{{ row.user }}</AtlTd>
                <AtlTd>{{ row.action }}</AtlTd>
                <AtlTd>
                  <AtlBadge :variant="row.statusVariant" size="sm">{{ row.status }}</AtlBadge>
                </AtlTd>
                <AtlTd align="end">{{ row.time }}</AtlTd>
              </AtlTr>
            </AtlTbody>
          </AtlTable>
        </AtlCardContent>
      </AtlCard>
      <AtlCard variant="elevated" padding="md">
        <AtlCardHeader>
          <h3 style="${S.panelTitle}">Plan Usage</h3>
        </AtlCardHeader>
        <AtlCardContent>
          <div style="display:flex;flex-direction:column;gap:var(--ui-spacing-4)">
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--ui-spacing-1);font-size:0.8125rem">
                <span style="color:var(--ui-color-text);font-weight:500">API requests</span>
                <span style="color:var(--ui-color-text-muted);font-variant-numeric:tabular-nums">{{ quotaPercent }}%</span>
              </div>
              <AtlProgress :value="quotaPercent" variant="warning" size="sm" />
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--ui-spacing-1);font-size:0.8125rem">
                <span style="color:var(--ui-color-text);font-weight:500">Storage</span>
                <span style="color:var(--ui-color-text-muted);font-variant-numeric:tabular-nums">42%</span>
              </div>
              <AtlProgress :value="42" variant="success" size="sm" />
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:var(--ui-spacing-1);font-size:0.8125rem">
                <span style="color:var(--ui-color-text);font-weight:500">Seats</span>
                <span style="color:var(--ui-color-text-muted);font-variant-numeric:tabular-nums">9 / 12</span>
              </div>
              <AtlProgress :value="75" variant="default" size="sm" />
            </div>
          </div>
        </AtlCardContent>
      </AtlCard>
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
      AtlTabGroup,
      AtlTab,
      AtlInput,
      AtlSelect,
      AtlOption,
      AtlToggle,
      AtlAlert,
      AtlButton,
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
      AtlButton,
      AtlDialog,
      AtlDialogHeader,
      AtlDialogContent,
      AtlDialogFooter,
      AtlAlert,
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
      AtlCard,
      AtlCardContent,
      AtlButton,
      AtlBadge,
      AtlMenu,
      AtlMenuItem,
      AtlMenuSeparator,
      AtlMenuTrigger,
      AtlTooltip,
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
      AtlAccordionGroup,
      AtlAccordionItem,
      AtlAccordionHeader,
      AtlAlert,
      AtlBadge,
      AtlButton,
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
      AtlCard,
      AtlCardHeader,
      AtlCardContent,
      AtlBadge,
      AtlButton,
      AtlTable,
      AtlThead,
      AtlTbody,
      AtlTr,
      AtlTh,
      AtlTd,
      AtlTabGroup,
      AtlTab,
      AtlAlert,
      AtlProgress,
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
