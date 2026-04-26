// Live demo components for /patterns. Each pattern is exported as a named
// component so the Astro page can hydrate them individually as React islands;
// titles, descriptions, and code blocks are rendered statically by Astro
// (see docs/src/pages/patterns.astro and docs/src/data/patterns.ts).

import { useState } from 'react';
import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmCheckbox, LlmAlert, LlmToggle, LlmSelect, LlmOption,
  LlmTabGroup, LlmTab, LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmBadge, LlmAccordionGroup, LlmAccordionItem,
  LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd,
  LlmProgress,
} from '@atelier-ui/react';

// ── 1. Login Form ──
export function LoginFormDemo() {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  function handleSubmit() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setShowError(true); }, 1500);
  }
  return (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <LlmCard variant="elevated" padding="lg">
        <LlmCardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Sign in</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>Enter your credentials to continue</p>
          </div>
        </LlmCardHeader>
        <LlmCardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {showError && <LlmAlert variant="danger" dismissible onDismissed={() => setShowError(false)}>Invalid email or password.</LlmAlert>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
              <LlmInput type="email" placeholder="you@example.com" invalid={showError} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <LlmInput type="password" placeholder="••••••••" invalid={showError} />
            </div>
            <LlmCheckbox>Remember me</LlmCheckbox>
          </div>
        </LlmCardContent>
        <LlmCardFooter>
          <LlmButton variant="primary" loading={loading} onClick={handleSubmit}>Sign in</LlmButton>
        </LlmCardFooter>
      </LlmCard>
    </div>
  );
}

// ── 2. Settings Page ──
export function SettingsPageDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [success, setSuccess] = useState(false);
  return (
    <div style={{ maxWidth: '640px', width: '100%' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 600 }}>Settings</h3>
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.9375rem', opacity: 0.7 }}>Manage your account preferences.</p>
      {success && <div style={{ marginBottom: '1.5rem' }}><LlmAlert variant="success" dismissible onDismissed={() => setSuccess(false)}>Settings saved successfully.</LlmAlert></div>}
      <LlmTabGroup selectedIndex={activeTab} onSelectedIndexChange={setActiveTab}>
        <LlmTab label="Account">
          <div style={{ padding: '1.5rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <LlmInput type="text" placeholder="John Doe" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
              <LlmInput type="email" placeholder="john@example.com" />
            </div>
          </div>
        </LlmTab>
        <LlmTab label="Notifications">
          <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <LlmToggle checked={true}>Email notifications</LlmToggle>
            <LlmToggle>Push notifications</LlmToggle>
            <LlmToggle checked={true}>Weekly digest</LlmToggle>
          </div>
        </LlmTab>
        <LlmTab label="Privacy">
          <div style={{ padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Profile visibility</label>
              <LlmSelect placeholder="Select visibility">
                <LlmOption optionValue="public">Public</LlmOption>
                <LlmOption optionValue="friends">Friends only</LlmOption>
                <LlmOption optionValue="private">Private</LlmOption>
              </LlmSelect>
            </div>
          </div>
        </LlmTab>
      </LlmTabGroup>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ui-color-border)' }}>
        <LlmButton variant="primary" onClick={() => setSuccess(true)}>Save changes</LlmButton>
        <LlmButton variant="outline">Cancel</LlmButton>
      </div>
    </div>
  );
}

// ── 3. Confirmation Dialog ──
export function ConfirmationDemo() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div style={{ maxWidth: '480px', width: '100%' }}>
      <div style={{ padding: '1.25rem', border: '1px solid var(--ui-color-border)', borderRadius: '8px', background: 'var(--ui-color-surface)' }}>
        <h4 style={{ margin: '0 0 4px', fontSize: '1.125rem', fontWeight: 600, color: 'var(--ui-color-danger)' }}>Danger Zone</h4>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', opacity: 0.7 }}>Deleting your account is permanent.</p>
        <LlmButton variant="primary" onClick={() => setOpen(true)}>Delete account</LlmButton>
      </div>
      <LlmDialog open={open} onOpenChange={setOpen} size="sm">
        <LlmDialogHeader>Delete Account</LlmDialogHeader>
        <LlmDialogContent>
          <LlmAlert variant="warning">This action cannot be undone.</LlmAlert>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Are you sure you want to delete your account?</p>
        </LlmDialogContent>
        <LlmDialogFooter>
          <LlmButton variant="outline" onClick={() => setOpen(false)}>Cancel</LlmButton>
          <LlmButton variant="primary" onClick={() => { setOpen(false); setConfirmed(true); }}>Yes, delete</LlmButton>
        </LlmDialogFooter>
      </LlmDialog>
      {confirmed && <div style={{ marginTop: '1rem' }}><LlmAlert variant="success" dismissible onDismissed={() => setConfirmed(false)}>Account deletion simulated.</LlmAlert></div>}
    </div>
  );
}

// ── 4. Data List with Actions ──
const dataListRows = [
  { id: 1, name: 'Marketing Website', description: 'Brand-refresh landing page', status: 'Active', statusVariant: 'success' as const },
  { id: 2, name: 'Mobile App v2', description: 'Cross-platform rewrite in Flutter', status: 'In Review', statusVariant: 'warning' as const },
  { id: 3, name: 'API Gateway', description: 'Microservices ingress layer', status: 'Draft', statusVariant: 'default' as const },
  { id: 4, name: 'Legacy Migration', description: 'PHP monolith → Node services', status: 'Paused', statusVariant: 'danger' as const },
];

export function DataListDemo() {
  return (
    <div style={{ maxWidth: '560px', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Projects</h4>
        <LlmButton variant="primary" size="sm">New project</LlmButton>
      </div>
      {dataListRows.map((item) => (
        <LlmCard key={item.id} variant="outlined" padding="md">
          <LlmCardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.name}</span>
                  <LlmBadge variant={item.statusVariant} size="sm">{item.status}</LlmBadge>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', opacity: 0.7 }}>{item.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <LlmButton variant="outline" size="sm">View</LlmButton>
                <LlmButton variant="outline" size="sm">...</LlmButton>
              </div>
            </div>
          </LlmCardContent>
        </LlmCard>
      ))}
    </div>
  );
}

// ── 5. Notification Center ──
export function NotificationCenterDemo() {
  return (
    <div style={{ maxWidth: '500px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Notifications</h4>
        <LlmButton variant="outline" size="sm">Clear all</LlmButton>
      </div>
      <LlmAccordionGroup multi variant="separated">
        <LlmAccordionItem expanded>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Errors <LlmBadge variant="danger" size="sm">2</LlmBadge>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
            <LlmAlert variant="danger">Database connection failed on replica-3.</LlmAlert>
            <LlmAlert variant="danger">Payment service returned 503.</LlmAlert>
          </div>
        </LlmAccordionItem>
        <LlmAccordionItem>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Warnings <LlmBadge variant="warning" size="sm">1</LlmBadge>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
            <LlmAlert variant="warning">Disk usage at 89% on worker-7.</LlmAlert>
          </div>
        </LlmAccordionItem>
      </LlmAccordionGroup>
    </div>
  );
}

// ── 6. Management Dashboard ──
const dashboardMetrics = [
  { label: 'Active users', value: '8,412', delta: '+12%', deltaVariant: 'success' as const, foot: 'vs. previous period' },
  { label: 'Sessions', value: '24,390', delta: '+4%', deltaVariant: 'success' as const, foot: 'vs. previous period' },
  { label: 'Revenue', value: '$42,108', delta: '-2%', deltaVariant: 'danger' as const, foot: 'vs. previous period' },
  { label: 'Avg. response', value: '184 ms', delta: '+18 ms', deltaVariant: 'warning' as const, foot: 'P95 across edges' },
];
const dashboardActivity = [
  { id: 1, user: 'alex@acme.dev', action: 'Rotated API key', status: 'Success', statusVariant: 'success' as const, time: '2m ago' },
  { id: 2, user: 'maria@acme.dev', action: 'Invited new member', status: 'Pending', statusVariant: 'warning' as const, time: '14m ago' },
  { id: 3, user: 'deploy-bot', action: 'Pushed build v3.2.1', status: 'Success', statusVariant: 'success' as const, time: '1h ago' },
  { id: 4, user: 'lee@acme.dev', action: 'Removed webhook', status: 'Failed', statusVariant: 'danger' as const, time: '2h ago' },
];

export function ManagementDashboardDemo() {
  const [range, setRange] = useState(1);
  const quota = 87;
  return (
    <div style={{ maxWidth: '820px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Operations Overview</h4>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', opacity: 0.7 }}>Snapshot across the selected range</p>
        </div>
        <LlmTabGroup variant="pills" selectedIndex={range} onSelectedIndexChange={setRange}>
          <LlmTab label="7D">{' '}</LlmTab>
          <LlmTab label="30D">{' '}</LlmTab>
          <LlmTab label="90D">{' '}</LlmTab>
        </LlmTabGroup>
      </div>
      {quota >= 85 && (
        <LlmAlert variant="warning" dismissible>
          API request quota is at {quota}%. Upgrade to avoid throttling.
        </LlmAlert>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {dashboardMetrics.map((m) => (
          <LlmCard key={m.label} variant="elevated" padding="md">
            <LlmCardContent>
              <div style={{ fontSize: '0.75rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{m.value}</span>
                <LlmBadge variant={m.deltaVariant} size="sm">{m.delta}</LlmBadge>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.7rem', opacity: 0.65 }}>{m.foot}</p>
            </LlmCardContent>
          </LlmCard>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
        <LlmCard variant="elevated" padding="none">
          <LlmCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h5 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Recent Activity</h5>
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
                {dashboardActivity.map((row) => (
                  <LlmTr key={row.id}>
                    <LlmTd>{row.user}</LlmTd>
                    <LlmTd>{row.action}</LlmTd>
                    <LlmTd><LlmBadge variant={row.statusVariant} size="sm">{row.status}</LlmBadge></LlmTd>
                    <LlmTd align="end">{row.time}</LlmTd>
                  </LlmTr>
                ))}
              </LlmTbody>
            </LlmTable>
          </LlmCardContent>
        </LlmCard>
        <LlmCard variant="elevated" padding="md">
          <LlmCardHeader>
            <h5 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Plan Usage</h5>
          </LlmCardHeader>
          <LlmCardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>API requests</span>
                  <span style={{ opacity: 0.7 }}>{quota}%</span>
                </div>
                <LlmProgress value={quota} variant="warning" size="sm" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>Storage</span>
                  <span style={{ opacity: 0.7 }}>42%</span>
                </div>
                <LlmProgress value={42} variant="success" size="sm" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>Seats</span>
                  <span style={{ opacity: 0.7 }}>9 / 12</span>
                </div>
                <LlmProgress value={75} variant="default" size="sm" />
              </div>
            </div>
          </LlmCardContent>
        </LlmCard>
      </div>
    </div>
  );
}
