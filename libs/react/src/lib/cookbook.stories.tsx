import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmButton } from './button/llm-button';
import {
  LlmCard,
  LlmCardHeader,
  LlmCardContent,
  LlmCardFooter,
} from './card/llm-card';
import { LlmBadge } from './badge/llm-badge';
import { LlmInput } from './input/llm-input';
import { LlmCheckbox } from './checkbox/llm-checkbox';
import { LlmToggle } from './toggle/llm-toggle';
import { LlmAlert } from './alert/llm-alert';
import { LlmSelect } from './select/llm-select';
import { LlmOption } from './select/llm-option';
import {
  LlmDialog,
  LlmDialogHeader,
  LlmDialogContent,
  LlmDialogFooter,
} from './dialog/llm-dialog';
import { LlmTabGroup, LlmTab } from './tabs/llm-tabs';
import {
  LlmAccordionGroup,
  LlmAccordionItem,
  LlmAccordionHeader,
} from './accordion/llm-accordion';
import {
  LlmTable,
  LlmThead,
  LlmTbody,
  LlmTr,
  LlmTh,
  LlmTd,
} from './table/llm-table';
import { LlmProgress } from './progress/llm-progress';

// ---------------------------------------------------------------------------
// 1. Login Form
// ---------------------------------------------------------------------------

function LoginFormPattern({ showErrors = false }: { showErrors?: boolean }) {
  const [loading, setLoading] = useState(false);
  return (
    <div style={wrapper(400)}>
      <LlmCard variant="elevated" padding="lg">
        <LlmCardHeader>
          <div>
            <h2 style={titleStyle}>Sign in</h2>
            <p style={subtitleStyle}>Enter your credentials to continue</p>
          </div>
        </LlmCardHeader>
        <LlmCardContent>
          {showErrors && (
            <LlmAlert variant="danger">
              Invalid email or password. Please try again.
            </LlmAlert>
          )}
          <div style={formStackStyle}>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Email</label>
              <LlmInput
                type="email"
                placeholder="you@example.com"
                invalid={showErrors}
              />
            </div>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Password</label>
              <LlmInput
                type="password"
                placeholder="Enter your password"
                invalid={showErrors}
              />
            </div>
            <LlmCheckbox>Remember me</LlmCheckbox>
          </div>
        </LlmCardContent>
        <LlmCardFooter>
          <LlmButton
            variant="primary"
            size="md"
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 2000);
            }}
          >
            Sign in
          </LlmButton>
        </LlmCardFooter>
      </LlmCard>
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
      <LlmTabGroup selectedIndex={tab} onSelectedIndexChange={setTab}>
        <LlmTab label="Account">
          <div style={sectionStackStyle}>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Display name</label>
              <LlmInput placeholder="Jane Doe" />
            </div>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Email</label>
              <LlmInput type="email" placeholder="you@example.com" />
            </div>
            <div style={formFieldStyle}>
              <label style={fieldLabelStyle}>Timezone</label>
              <LlmSelect placeholder="Select timezone">
                <LlmOption optionValue="utc">UTC</LlmOption>
                <LlmOption optionValue="cet">Central European Time</LlmOption>
                <LlmOption optionValue="pst">Pacific Standard Time</LlmOption>
              </LlmSelect>
            </div>
          </div>
        </LlmTab>
        <LlmTab label="Notifications">
          <div style={sectionStackStyle}>
            <div style={toggleRowStyle}>
              <div>
                <div style={toggleLabelStyle}>Product updates</div>
                <div style={toggleHintStyle}>
                  Release notes and feature announcements
                </div>
              </div>
              <LlmToggle checked={true} />
            </div>
            <div style={toggleRowStyle}>
              <div>
                <div style={toggleLabelStyle}>Weekly digest</div>
                <div style={toggleHintStyle}>Activity summary every Monday</div>
              </div>
              <LlmToggle checked={false} />
            </div>
            <div style={toggleRowStyle}>
              <div>
                <div style={toggleLabelStyle}>Security alerts</div>
                <div style={toggleHintStyle}>Critical account notifications</div>
              </div>
              <LlmToggle checked={true} />
            </div>
          </div>
        </LlmTab>
        <LlmTab label="Billing">
          <div style={sectionStackStyle}>
            <LlmAlert variant="info">
              Your next invoice of $29.00 will be charged on Apr 30.
            </LlmAlert>
            <LlmButton variant="outline" size="sm">
              Manage payment method
            </LlmButton>
          </div>
        </LlmTab>
      </LlmTabGroup>
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
      <LlmButton variant="outline" onClick={() => setOpen(true)}>
        Delete account
      </LlmButton>
      <LlmDialog open={open} onOpenChange={setOpen} size="sm">
        <LlmDialogHeader>Delete this account?</LlmDialogHeader>
        <LlmDialogContent>
          This action is permanent. All your data, workspaces, and API keys
          will be removed immediately. This cannot be undone.
        </LlmDialogContent>
        <LlmDialogFooter>
          <LlmButton variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </LlmButton>
          <LlmButton variant="primary" onClick={() => setOpen(false)}>
            Delete permanently
          </LlmButton>
        </LlmDialogFooter>
      </LlmDialog>
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
        <LlmButton variant="primary" size="sm">
          New project
        </LlmButton>
      </div>
      {dataListItems.map((item) => (
        <LlmCard key={item.id} variant="outlined" padding="md">
          <LlmCardContent>
            <div style={listRowStyle}>
              <div style={rowInfoStyle}>
                <div style={rowTitleLineStyle}>
                  <span style={rowTitleStyle}>{item.name}</span>
                  <LlmBadge variant={item.statusVariant} size="sm">
                    {item.status}
                  </LlmBadge>
                </div>
                <p style={rowDescStyle}>{item.description}</p>
              </div>
              <div style={rowActionsStyle}>
                <LlmButton variant="outline" size="sm">
                  View
                </LlmButton>
                <LlmButton variant="outline" size="sm">
                  ...
                </LlmButton>
              </div>
            </div>
          </LlmCardContent>
        </LlmCard>
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
        <LlmButton
          variant="outline"
          size="sm"
          onClick={() => {
            setErrors([]);
            setWarnings([]);
            setInfos([]);
          }}
        >
          Clear all
        </LlmButton>
      </div>
      <LlmAccordionGroup multi={true} variant="separated">
        {errors.length > 0 && (
          <LlmAccordionItem expanded={true}>
            <LlmAccordionHeader>
              <span style={groupHeaderStyle}>
                Errors
                <LlmBadge variant="danger" size="sm">
                  {errors.length}
                </LlmBadge>
              </span>
            </LlmAccordionHeader>
            <div style={alertListStyle}>
              {errors.map((e) => (
                <LlmAlert
                  key={e.id}
                  variant="danger"
                  dismissible={true}
                  onDismissed={() =>
                    setErrors((list) => list.filter((x) => x.id !== e.id))
                  }
                >
                  {e.message}
                </LlmAlert>
              ))}
            </div>
          </LlmAccordionItem>
        )}
        {warnings.length > 0 && (
          <LlmAccordionItem>
            <LlmAccordionHeader>
              <span style={groupHeaderStyle}>
                Warnings
                <LlmBadge variant="warning" size="sm">
                  {warnings.length}
                </LlmBadge>
              </span>
            </LlmAccordionHeader>
            <div style={alertListStyle}>
              {warnings.map((w) => (
                <LlmAlert
                  key={w.id}
                  variant="warning"
                  dismissible={true}
                  onDismissed={() =>
                    setWarnings((list) => list.filter((x) => x.id !== w.id))
                  }
                >
                  {w.message}
                </LlmAlert>
              ))}
            </div>
          </LlmAccordionItem>
        )}
        {infos.length > 0 && (
          <LlmAccordionItem>
            <LlmAccordionHeader>
              <span style={groupHeaderStyle}>
                Info
                <LlmBadge variant="info" size="sm">
                  {infos.length}
                </LlmBadge>
              </span>
            </LlmAccordionHeader>
            <div style={alertListStyle}>
              {infos.map((i) => (
                <LlmAlert
                  key={i.id}
                  variant="info"
                  dismissible={true}
                  onDismissed={() =>
                    setInfos((list) => list.filter((x) => x.id !== i.id))
                  }
                >
                  {i.message}
                </LlmAlert>
              ))}
            </div>
          </LlmAccordionItem>
        )}
      </LlmAccordionGroup>
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
        <LlmTabGroup
          variant="pills"
          selectedIndex={rangeIndex}
          onSelectedIndexChange={setRangeIndex}
        >
          <LlmTab label="7D">{' '}</LlmTab>
          <LlmTab label="30D">{' '}</LlmTab>
          <LlmTab label="90D">{' '}</LlmTab>
        </LlmTabGroup>
      </div>

      {quotaPercent >= 85 && (
        <LlmAlert variant="warning" dismissible={true}>
          API request quota is at {quotaPercent}%. Upgrade your plan before
          the monthly reset to avoid throttling.
        </LlmAlert>
      )}

      <div style={metricsGridStyle}>
        {metrics.map((metric) => (
          <LlmCard key={metric.label} variant="elevated" padding="md">
            <LlmCardContent>
              <div style={metricLabelStyle}>{metric.label}</div>
              <div style={metricValueRowStyle}>
                <span style={metricValueStyle}>{metric.value}</span>
                <LlmBadge variant={metric.deltaVariant} size="sm">
                  {metric.delta}
                </LlmBadge>
              </div>
              <p style={metricFootStyle}>{metric.foot}</p>
            </LlmCardContent>
          </LlmCard>
        ))}
      </div>

      <div style={lowerGridStyle}>
        <LlmCard variant="elevated" padding="none">
          <LlmCardHeader>
            <div style={panelHeaderStyle}>
              <h3 style={panelTitleStyle}>Recent Activity</h3>
              <LlmButton variant="outline" size="sm">
                Export
              </LlmButton>
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
                {activity.map((row) => (
                  <LlmTr key={row.id}>
                    <LlmTd>{row.user}</LlmTd>
                    <LlmTd>{row.action}</LlmTd>
                    <LlmTd>
                      <LlmBadge variant={row.statusVariant} size="sm">
                        {row.status}
                      </LlmBadge>
                    </LlmTd>
                    <LlmTd align="end">{row.time}</LlmTd>
                  </LlmTr>
                ))}
              </LlmTbody>
            </LlmTable>
          </LlmCardContent>
        </LlmCard>

        <LlmCard variant="elevated" padding="md">
          <LlmCardHeader>
            <h3 style={panelTitleStyle}>Plan Usage</h3>
          </LlmCardHeader>
          <LlmCardContent>
            <div style={quotaStackStyle}>
              <QuotaRow label="API requests" value={quotaPercent} display={`${quotaPercent}%`} variant="warning" />
              <QuotaRow label="Storage" value={42} display="42%" variant="success" />
              <QuotaRow label="Seats" value={75} display="9 / 12" variant="default" />
            </div>
          </LlmCardContent>
        </LlmCard>
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
      <LlmProgress value={value} variant={variant} size="sm" />
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
};

export const LoginFormWithValidationErrors: Story = {
  name: 'Login Form / With Validation Errors',
  render: () => <LoginFormPattern showErrors={true} />,
};

export const SettingsPage: Story = {
  render: () => <SettingsPagePattern />,
};

export const ConfirmationDialog: Story = {
  render: () => <ConfirmationDialogPattern />,
};

export const DataListWithActions: Story = {
  name: 'Data List with Actions',
  render: () => <DataListPattern />,
};

export const NotificationCenter: Story = {
  render: () => <NotificationCenterPattern />,
};

export const ManagementDashboard: Story = {
  render: () => <ManagementDashboardPattern />,
};
