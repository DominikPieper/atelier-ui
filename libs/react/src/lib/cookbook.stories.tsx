import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, expect, screen } from 'storybook/test';
import { useState } from 'react';
import { AtlButton } from './button/atl-button';
import {
  AtlCard,
  AtlCardHeader,
  AtlCardContent,
  AtlCardFooter,
} from './card/atl-card';
import { AtlBadge } from './badge/atl-badge';
import { AtlInput } from './input/atl-input';
import { AtlCheckbox } from './checkbox/atl-checkbox';
import { AtlToggle } from './toggle/atl-toggle';
import { AtlAlert } from './alert/atl-alert';
import { AtlSelect, AtlOption } from './select/atl-select';
import {
  AtlDialog,
  AtlDialogHeader,
  AtlDialogContent,
  AtlDialogFooter,
} from './dialog/atl-dialog';
import { AtlTabGroup, AtlTab } from './tabs/atl-tabs';
import {
  AtlAccordionGroup,
  AtlAccordionItem,
  AtlAccordionHeader,
} from './accordion/atl-accordion';
import {
  AtlTable,
  AtlThead,
  AtlTbody,
  AtlTr,
  AtlTh,
  AtlTd,
} from './table/atl-table';
import { AtlProgress } from './progress/atl-progress';
import {
  AtlMenu,
  AtlMenuItem,
  AtlMenuSeparator,
  AtlMenuTrigger,
} from './menu/atl-menu';
import { AtlTooltip } from './tooltip/atl-tooltip';

// ---------------------------------------------------------------------------
// 1. Login Form
// ---------------------------------------------------------------------------

function LoginFormPattern({ showErrors = false }: { showErrors?: boolean }) {
  const [loading, setLoading] = useState(false);
  return (
    <div style={wrapper(400)}>
      <AtlCard variant="elevated" padding="lg">
        <AtlCardHeader>
          <div>
            <h2 style={titleStyle}>Sign in</h2>
            <p style={subtitleStyle}>Enter your credentials to continue</p>
          </div>
        </AtlCardHeader>
        <AtlCardContent>
          {showErrors && (
            <AtlAlert variant="danger">
              Invalid email or password. Please try again.
            </AtlAlert>
          )}
          <div style={formStackStyle}>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Email</label>
              <AtlInput
                type="email"
                placeholder="you@example.com"
                invalid={showErrors}
              />
            </div>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Password</label>
              <AtlInput
                type="password"
                placeholder="Enter your password"
                invalid={showErrors}
              />
            </div>
            <AtlCheckbox>Remember me</AtlCheckbox>
          </div>
        </AtlCardContent>
        <AtlCardFooter>
          <AtlButton
            variant="primary"
            size="md"
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            Sign in
          </AtlButton>
        </AtlCardFooter>
      </AtlCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Settings Page
// ---------------------------------------------------------------------------

function SettingsPagePattern() {
  const [tab, setTab] = useState(0);
  return (
    <div style={wrapper(560)}>
      <h2 style={titleStyle}>Settings</h2>
      <AtlTabGroup selectedIndex={tab} onSelectedIndexChange={setTab}>
        <AtlTab label="Account">
          <div style={sectionStackStyle}>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Display name</label>
              <AtlInput placeholder="Jane Doe" />
            </div>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Email</label>
              <AtlInput type="email" placeholder="you@example.com" />
            </div>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Timezone</label>
              <AtlSelect placeholder="Select timezone">
                <AtlOption optionValue="utc">UTC</AtlOption>
                <AtlOption optionValue="cet">Central European Time</AtlOption>
                <AtlOption optionValue="pst">Pacific Standard Time</AtlOption>
              </AtlSelect>
            </div>
          </div>
        </AtlTab>
        <AtlTab label="Notifications">
          <div style={sectionStackStyle}>
            <div style={toggleRowStyle}>
              <div>
                <div style={toggleLabelStyle}>Product updates</div>
                <div style={toggleHintStyle}>
                  Release notes and feature announcements
                </div>
              </div>
              <AtlToggle checked={true} />
            </div>
            <div style={toggleRowStyle}>
              <div>
                <div style={toggleLabelStyle}>Weekly digest</div>
                <div style={toggleHintStyle}>Activity summary every Monday</div>
              </div>
              <AtlToggle checked={false} />
            </div>
            <div style={toggleRowStyle}>
              <div>
                <div style={toggleLabelStyle}>Security alerts</div>
                <div style={toggleHintStyle}>Critical account notifications</div>
              </div>
              <AtlToggle checked={true} />
            </div>
          </div>
        </AtlTab>
        <AtlTab label="Billing">
          <div style={sectionStackStyle}>
            <AtlAlert variant="info">
              Your next invoice of $29.00 will be charged on Apr 30.
            </AtlAlert>
            <AtlButton variant="outline" size="sm">
              Manage payment method
            </AtlButton>
          </div>
        </AtlTab>
      </AtlTabGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Confirmation Dialog
// ---------------------------------------------------------------------------

function ConfirmationDialogPattern() {
  const [open, setOpen] = useState(false);
  return (
    <div style={wrapper(400)}>
      <AtlButton variant="outline" onClick={() => setOpen(true)}>
        Delete account
      </AtlButton>
      <AtlDialog open={open} onOpenChange={setOpen} size="sm">
        <AtlDialogHeader>Delete this account?</AtlDialogHeader>
        <AtlDialogContent>
          <AtlAlert variant="warning">This action cannot be undone.</AtlAlert>
          <p style={{ margin: 'var(--ui-spacing-3) 0 0', color: 'var(--ui-color-text-muted)', fontSize: '0.875rem' }}>
            All your data, workspaces, and API keys will be removed immediately.
          </p>
        </AtlDialogContent>
        <AtlDialogFooter>
          <AtlButton variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </AtlButton>
          <AtlButton variant="primary" onClick={() => setOpen(false)}>
            Delete permanently
          </AtlButton>
        </AtlDialogFooter>
      </AtlDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Data List with Actions
// ---------------------------------------------------------------------------

type StatusVariant = 'success' | 'warning' | 'danger' | 'default';
const dataListItems: Array<{
  id: number;
  name: string;
  description: string;
  status: string;
  statusVariant: StatusVariant;
}> = [
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

function DataListPattern() {
  return (
    <div style={{ ...wrapper(640), gap: 'var(--ui-spacing-3)', display: 'flex', flexDirection: 'column' }}>
      <div style={listHeaderStyle}>
        <h2 style={titleStyle}>Projects</h2>
        <AtlButton variant="primary" size="sm">
          New project
        </AtlButton>
      </div>
      {dataListItems.map((item) => (
        <AtlCard key={item.id} variant="outlined" padding="md">
          <AtlCardContent>
            <div style={listRowStyle}>
              <div style={rowInfoStyle}>
                <div style={rowTitleLineStyle}>
                  <span style={rowTitleStyle}>{item.name}</span>
                  <AtlBadge variant={item.statusVariant} size="sm">
                    {item.status}
                  </AtlBadge>
                </div>
                <p style={rowDescStyle}>{item.description}</p>
              </div>
              <div style={rowActionsStyle}>
                <AtlTooltip atlTooltip="View details" atlTooltipPosition="above">
                  <AtlButton variant="outline" size="sm">
                    View
                  </AtlButton>
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
                    <AtlTooltip atlTooltip="More actions" atlTooltipPosition="above">
                      <AtlButton
                        ref={ref as React.RefObject<HTMLButtonElement>}
                        onClick={onClick}
                        variant="outline"
                        size="sm"
                      >
                        ...
                      </AtlButton>
                    </AtlTooltip>
                  )}
                </AtlMenuTrigger>
              </div>
            </div>
          </AtlCardContent>
        </AtlCard>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. Notification Center
// ---------------------------------------------------------------------------

function NotificationCenterPattern() {
  const [errors, setErrors] = useState([
    { id: 1, message: 'Database connection failed on replica-3. Automatic failover engaged.' },
    { id: 2, message: 'Payment processing service returned 503 for 12 transactions.' },
  ]);
  const [warnings, setWarnings] = useState([
    { id: 3, message: 'Disk usage on worker-7 is at 89%. Consider scaling storage.' },
    { id: 4, message: 'SSL certificate for api.example.com expires in 14 days.' },
    { id: 5, message: 'Rate limiter triggered 230 times in the last hour.' },
  ]);
  const [infos, setInfos] = useState([
    { id: 6, message: 'Deployment v3.2.1 completed successfully across all regions.' },
    { id: 7, message: 'Scheduled maintenance window begins Saturday at 02:00 UTC.' },
  ]);

  return (
    <div style={wrapper(560)}>
      <div style={listHeaderStyle}>
        <h2 style={titleStyle}>Notifications</h2>
        <AtlButton
          variant="outline"
          size="sm"
          onClick={() => {
            setErrors([]);
            setWarnings([]);
            setInfos([]);
          }}
        >
          Clear all
        </AtlButton>
      </div>
      <AtlAccordionGroup multi={true} variant="separated">
        {errors.length > 0 && (
          <AtlAccordionItem expanded={true}>
            <AtlAccordionHeader>
              <span style={groupHeaderStyle}>
                Errors
                <AtlBadge variant="danger" size="sm">
                  {errors.length}
                </AtlBadge>
              </span>
            </AtlAccordionHeader>
            <div style={alertListStyle}>
              {errors.map((e) => (
                <AtlAlert
                  key={e.id}
                  variant="danger"
                  dismissible={true}
                  onDismissed={() =>
                    setErrors((list) => list.filter((x) => x.id !== e.id))
                  }
                >
                  {e.message}
                </AtlAlert>
              ))}
            </div>
          </AtlAccordionItem>
        )}
        {warnings.length > 0 && (
          <AtlAccordionItem>
            <AtlAccordionHeader>
              <span style={groupHeaderStyle}>
                Warnings
                <AtlBadge variant="warning" size="sm">
                  {warnings.length}
                </AtlBadge>
              </span>
            </AtlAccordionHeader>
            <div style={alertListStyle}>
              {warnings.map((w) => (
                <AtlAlert
                  key={w.id}
                  variant="warning"
                  dismissible={true}
                  onDismissed={() =>
                    setWarnings((list) => list.filter((x) => x.id !== w.id))
                  }
                >
                  {w.message}
                </AtlAlert>
              ))}
            </div>
          </AtlAccordionItem>
        )}
        {infos.length > 0 && (
          <AtlAccordionItem>
            <AtlAccordionHeader>
              <span style={groupHeaderStyle}>
                Info
                <AtlBadge variant="info" size="sm">
                  {infos.length}
                </AtlBadge>
              </span>
            </AtlAccordionHeader>
            <div style={alertListStyle}>
              {infos.map((i) => (
                <AtlAlert
                  key={i.id}
                  variant="info"
                  dismissible={true}
                  onDismissed={() =>
                    setInfos((list) => list.filter((x) => x.id !== i.id))
                  }
                >
                  {i.message}
                </AtlAlert>
              ))}
            </div>
          </AtlAccordionItem>
        )}
      </AtlAccordionGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 6. Management Dashboard
// ---------------------------------------------------------------------------

type MetricDeltaVariant = 'success' | 'danger' | 'warning';
const metrics: Array<{
  label: string;
  value: string;
  delta: string;
  deltaVariant: MetricDeltaVariant;
  foot: string;
}> = [
  { label: 'Active users', value: '8,412', delta: '+12%', deltaVariant: 'success', foot: 'vs. previous period' },
  { label: 'Sessions', value: '24,390', delta: '+4%', deltaVariant: 'success', foot: 'vs. previous period' },
  { label: 'Revenue', value: '$42,108', delta: '-2%', deltaVariant: 'danger', foot: 'vs. previous period' },
  { label: 'Avg. response', value: '184 ms', delta: '+18 ms', deltaVariant: 'warning', foot: 'P95 across edge nodes' },
];

const activity: Array<{
  id: number;
  user: string;
  action: string;
  status: string;
  statusVariant: StatusVariant;
  time: string;
}> = [
  { id: 1, user: 'alex@acme.dev', action: 'Rotated API key', status: 'Success', statusVariant: 'success', time: '2m ago' },
  { id: 2, user: 'maria@acme.dev', action: 'Invited new member', status: 'Pending', statusVariant: 'warning', time: '14m ago' },
  { id: 3, user: 'deploy-bot', action: 'Pushed build v3.2.1', status: 'Success', statusVariant: 'success', time: '1h ago' },
  { id: 4, user: 'lee@acme.dev', action: 'Removed webhook', status: 'Failed', statusVariant: 'danger', time: '2h ago' },
  { id: 5, user: 'system', action: 'Nightly backup complete', status: 'Success', statusVariant: 'success', time: '6h ago' },
];

function ManagementDashboardPattern() {
  const [rangeIndex, setRangeIndex] = useState(1);
  const quotaPercent = 87;

  return (
    <div style={{ ...wrapper(1040), gap: 'var(--ui-spacing-4)', display: 'flex', flexDirection: 'column' }}>
      <div style={dashHeaderStyle}>
        <div>
          <h2 style={titleStyle}>Operations Overview</h2>
          <p style={subtitleStyle}>Snapshot across the selected time range</p>
        </div>
        <AtlTabGroup
          variant="pills"
          selectedIndex={rangeIndex}
          onSelectedIndexChange={setRangeIndex}
        >
          <AtlTab label="7D">{' '}</AtlTab>
          <AtlTab label="30D">{' '}</AtlTab>
          <AtlTab label="90D">{' '}</AtlTab>
        </AtlTabGroup>
      </div>

      {quotaPercent >= 85 && (
        <AtlAlert variant="warning" dismissible={true}>
          API request quota is at {quotaPercent}%. Upgrade your plan before
          the monthly reset to avoid throttling.
        </AtlAlert>
      )}

      <div style={metricsGridStyle}>
        {metrics.map((metric) => (
          <AtlCard key={metric.label} variant="elevated" padding="md">
            <AtlCardContent>
              <div style={metricLabelStyle}>{metric.label}</div>
              <div style={metricValueRowStyle}>
                <span style={metricValueStyle}>{metric.value}</span>
                <AtlBadge variant={metric.deltaVariant} size="sm">
                  {metric.delta}
                </AtlBadge>
              </div>
              <p style={metricFootStyle}>{metric.foot}</p>
            </AtlCardContent>
          </AtlCard>
        ))}
      </div>

      <div style={lowerGridStyle}>
        <AtlCard variant="elevated" padding="none">
          <AtlCardHeader>
            <div style={panelHeaderStyle}>
              <h3 style={panelTitleStyle}>Recent Activity</h3>
              <AtlButton variant="outline" size="sm">
                Export
              </AtlButton>
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
                {activity.map((row) => (
                  <AtlTr key={row.id}>
                    <AtlTd>{row.user}</AtlTd>
                    <AtlTd>{row.action}</AtlTd>
                    <AtlTd>
                      <AtlBadge variant={row.statusVariant} size="sm">
                        {row.status}
                      </AtlBadge>
                    </AtlTd>
                    <AtlTd align="end">{row.time}</AtlTd>
                  </AtlTr>
                ))}
              </AtlTbody>
            </AtlTable>
          </AtlCardContent>
        </AtlCard>

        <AtlCard variant="elevated" padding="md">
          <AtlCardHeader>
            <h3 style={panelTitleStyle}>Plan Usage</h3>
          </AtlCardHeader>
          <AtlCardContent>
            <div style={quotaStackStyle}>
              <QuotaRow label="API requests" value={quotaPercent} display={`${quotaPercent}%`} variant="warning" />
              <QuotaRow label="Storage" value={42} display="42%" variant="success" />
              <QuotaRow label="Seats" value={75} display="9 / 12" variant="default" />
            </div>
          </AtlCardContent>
        </AtlCard>
      </div>
    </div>
  );
}

function QuotaRow({
  label,
  value,
  display,
  variant,
}: {
  label: string;
  value: number;
  display: string;
  variant: 'default' | 'success' | 'warning' | 'danger';
}) {
  return (
    <div>
      <div style={quotaLabelRowStyle}>
        <span style={quotaLabelStyle}>{label}</span>
        <span style={quotaNumberStyle}>{display}</span>
      </div>
      <AtlProgress value={value} variant={variant} size="sm" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared inline styles. Inline keeps the stories self-contained -- no CSS
// file needed so the cookbook can be copied into a workshop workspace and
// run with zero extra setup.
// ---------------------------------------------------------------------------

const wrapper = (maxWidth: number): React.CSSProperties => ({
  maxWidth,
  margin: '0 auto',
  padding: 'var(--ui-spacing-6)',
});
const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--ui-color-text)',
};
const subtitleStyle: React.CSSProperties = {
  margin: 'var(--ui-spacing-1) 0 0',
  fontSize: '0.875rem',
  color: 'var(--ui-color-text-muted)',
};
const formStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ui-spacing-4)',
  marginTop: 'var(--ui-spacing-4)',
};
const formFieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ui-spacing-1)',
};
const fieldLabelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'var(--ui-color-text)',
};
const sectionStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ui-spacing-4)',
  padding: 'var(--ui-spacing-4) 0',
};
const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ui-spacing-4)',
};
const toggleLabelStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 500,
  color: 'var(--ui-color-text)',
};
const toggleHintStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--ui-color-text-muted)',
};
const listHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 'var(--ui-spacing-2)',
};
const listRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--ui-spacing-4)',
};
const rowInfoStyle: React.CSSProperties = { flex: 1, minWidth: 0 };
const rowTitleLineStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-2)',
};
const rowTitleStyle: React.CSSProperties = {
  fontSize: '0.9375rem',
  fontWeight: 600,
  color: 'var(--ui-color-text)',
};
const rowDescStyle: React.CSSProperties = {
  margin: 'var(--ui-spacing-1) 0 0',
  fontSize: '0.8125rem',
  color: 'var(--ui-color-text-muted)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
const rowActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--ui-spacing-2)',
  flexShrink: 0,
};
const groupHeaderStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--ui-spacing-2)',
};
const alertListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ui-spacing-2)',
  padding: 'var(--ui-spacing-3) 0',
};
const dashHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 'var(--ui-spacing-4)',
};
const metricsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 'var(--ui-spacing-3)',
};
const metricLabelStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--ui-color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};
const metricValueRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 'var(--ui-spacing-2)',
  marginTop: 'var(--ui-spacing-2)',
};
const metricValueStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--ui-color-text)',
};
const metricFootStyle: React.CSSProperties = {
  margin: 'var(--ui-spacing-2) 0 0',
  fontSize: '0.75rem',
  color: 'var(--ui-color-text-muted)',
};
const lowerGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: 'var(--ui-spacing-3)',
};
const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--ui-color-text)',
};
const quotaStackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ui-spacing-4)',
};
const quotaLabelRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 'var(--ui-spacing-1)',
  fontSize: '0.8125rem',
};
const quotaLabelStyle: React.CSSProperties = {
  color: 'var(--ui-color-text)',
  fontWeight: 500,
};
const quotaNumberStyle: React.CSSProperties = {
  color: 'var(--ui-color-text-muted)',
  fontVariantNumeric: 'tabular-nums',
};

// ---------------------------------------------------------------------------
// Storybook Meta & Stories
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Cookbook',
};

export default meta;
type Story = StoryObj;

export const LoginForm: Story = {
  render: () => <LoginFormPattern />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(await canvas.findByLabelText('Remember me')).toBeInTheDocument();
  },
};

export const LoginFormWithValidationErrors: Story = {
  name: 'Login Form / With Validation Errors',
  render: () => <LoginFormPattern showErrors={true} />,
};

export const SettingsPage: Story = {
  render: () => <SettingsPagePattern />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(await canvas.findByRole('tab', { name: 'Account' })).toBeVisible();
  },
};

export const ConfirmationDialog: Story = {
  render: () => <ConfirmationDialogPattern />,
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
  render: () => <DataListPattern />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(await canvas.findByText('Marketing Website')).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'New project' })).toBeVisible();
  },
};

export const NotificationCenter: Story = {
  render: () => <NotificationCenterPattern />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'Clear all' })).toBeVisible();
    await expect(await canvas.findByText('Errors')).toBeVisible();
  },
};

export const ManagementDashboard: Story = {
  render: () => <ManagementDashboardPattern />,
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Operations Overview' })).toBeVisible();
    await expect(await canvas.findByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(await canvas.findByRole('heading', { name: 'Plan Usage' })).toBeVisible();
  },
};
