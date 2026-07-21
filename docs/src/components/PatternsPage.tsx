// Live demo components for /patterns. Each pattern is exported as a named
// component so the Astro page can hydrate them individually as React islands;
// titles, descriptions, and code blocks are rendered statically by Astro
// (see docs/src/pages/patterns.astro and docs/src/data/patterns.ts).

import { useState } from 'react';
import {
  AtlButton, AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter,
  AtlInput, AtlCheckbox, AtlAlert, AtlToggle, AtlSelect, AtlOption,
  AtlTabGroup, AtlTab, AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter,
  AtlBadge, AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader,
  AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd,
  AtlProgress,
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
      <AtlCard variant="elevated" padding="lg">
        <AtlCardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Sign in</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>Enter your credentials to continue</p>
          </div>
        </AtlCardHeader>
        <AtlCardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {showError && <AtlAlert variant="danger" dismissible onDismissed={() => setShowError(false)}>Invalid email or password.</AtlAlert>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
              <AtlInput type="email" placeholder="you@example.com" invalid={showError} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <AtlInput type="password" placeholder="••••••••" invalid={showError} />
            </div>
            <AtlCheckbox>Remember me</AtlCheckbox>
          </div>
        </AtlCardContent>
        <AtlCardFooter>
          <AtlButton variant="primary" loading={loading} onClick={handleSubmit}>Sign in</AtlButton>
        </AtlCardFooter>
      </AtlCard>
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
      {success && <div style={{ marginBottom: '1.5rem' }}><AtlAlert variant="success" dismissible onDismissed={() => setSuccess(false)}>Settings saved successfully.</AtlAlert></div>}
      <AtlTabGroup selectedIndex={activeTab} onSelectedIndexChange={setActiveTab}>
        <AtlTab label="Account">
          <div style={{ padding: '1.5rem 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
              <AtlInput type="text" placeholder="John Doe" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
              <AtlInput type="email" placeholder="john@example.com" />
            </div>
          </div>
        </AtlTab>
        <AtlTab label="Notifications">
          <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AtlToggle checked={true}>Email notifications</AtlToggle>
            <AtlToggle>Push notifications</AtlToggle>
            <AtlToggle checked={true}>Weekly digest</AtlToggle>
          </div>
        </AtlTab>
        <AtlTab label="Privacy">
          <div style={{ padding: '1.5rem 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '300px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Profile visibility</label>
              <AtlSelect placeholder="Select visibility">
                <AtlOption optionValue="public">Public</AtlOption>
                <AtlOption optionValue="friends">Friends only</AtlOption>
                <AtlOption optionValue="private">Private</AtlOption>
              </AtlSelect>
            </div>
          </div>
        </AtlTab>
      </AtlTabGroup>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--ui-color-border)' }}>
        <AtlButton variant="primary" onClick={() => setSuccess(true)}>Save changes</AtlButton>
        <AtlButton variant="outline">Cancel</AtlButton>
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
        <h3 style={{ margin: '0 0 4px', fontSize: '1.125rem', fontWeight: 600, color: 'var(--ui-color-danger)' }}>Danger Zone</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', opacity: 0.7 }}>Deleting your account is permanent.</p>
        <AtlButton variant="primary" onClick={() => setOpen(true)}>Delete account</AtlButton>
      </div>
      <AtlDialog open={open} onOpenChange={setOpen} size="sm">
        <AtlDialogHeader>Delete Account</AtlDialogHeader>
        <AtlDialogContent>
          <AtlAlert variant="warning">This action cannot be undone.</AtlAlert>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>Are you sure you want to delete your account?</p>
        </AtlDialogContent>
        <AtlDialogFooter>
          <AtlButton variant="outline" onClick={() => setOpen(false)}>Cancel</AtlButton>
          <AtlButton variant="primary" onClick={() => { setOpen(false); setConfirmed(true); }}>Yes, delete</AtlButton>
        </AtlDialogFooter>
      </AtlDialog>
      {confirmed && <div style={{ marginTop: '1rem' }}><AtlAlert variant="success" dismissible onDismissed={() => setConfirmed(false)}>Account deletion simulated.</AtlAlert></div>}
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
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Projects</h3>
        <AtlButton variant="primary" size="sm">New project</AtlButton>
      </div>
      {dataListRows.map((item) => (
        <AtlCard key={item.id} variant="outlined" padding="md">
          <AtlCardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{item.name}</span>
                  <AtlBadge variant={item.statusVariant} size="sm">{item.status}</AtlBadge>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', opacity: 0.7 }}>{item.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <AtlButton variant="outline" size="sm">View</AtlButton>
                <AtlButton variant="outline" size="sm" aria-label="More actions">…</AtlButton>
              </div>
            </div>
          </AtlCardContent>
        </AtlCard>
      ))}
    </div>
  );
}

// ── 5. Notification Center ──
export function NotificationCenterDemo() {
  return (
    <div style={{ maxWidth: '500px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Notifications</h3>
        <AtlButton variant="outline" size="sm">Clear all</AtlButton>
      </div>
      <AtlAccordionGroup multi variant="separated">
        <AtlAccordionItem expanded headingLevel={4}>
          <AtlAccordionHeader>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Errors <AtlBadge variant="danger" size="sm">2</AtlBadge>
            </span>
          </AtlAccordionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
            <AtlAlert variant="danger">Database connection failed on replica-3.</AtlAlert>
            <AtlAlert variant="danger">Payment service returned 503.</AtlAlert>
          </div>
        </AtlAccordionItem>
        <AtlAccordionItem headingLevel={4}>
          <AtlAccordionHeader>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Warnings <AtlBadge variant="warning" size="sm">1</AtlBadge>
            </span>
          </AtlAccordionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 0' }}>
            <AtlAlert variant="warning">Disk usage at 89% on worker-7.</AtlAlert>
          </div>
        </AtlAccordionItem>
      </AtlAccordionGroup>
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
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Operations Overview</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', opacity: 0.7 }}>Snapshot across the selected range</p>
        </div>
        <AtlTabGroup variant="pills" selectedIndex={range} onSelectedIndexChange={setRange}>
          <AtlTab label="7D">{' '}</AtlTab>
          <AtlTab label="30D">{' '}</AtlTab>
          <AtlTab label="90D">{' '}</AtlTab>
        </AtlTabGroup>
      </div>
      {quota >= 85 && (
        <AtlAlert variant="warning" dismissible>
          API request quota is at {quota}%. Upgrade to avoid throttling.
        </AtlAlert>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {dashboardMetrics.map((m) => (
          <AtlCard key={m.label} variant="elevated" padding="md">
            <AtlCardContent>
              <div style={{ fontSize: '0.75rem', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{m.value}</span>
                <AtlBadge variant={m.deltaVariant} size="sm">{m.delta}</AtlBadge>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '0.7rem', opacity: 0.65 }}>{m.foot}</p>
            </AtlCardContent>
          </AtlCard>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
        <AtlCard variant="elevated" padding="none">
          <AtlCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Recent Activity</h4>
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
                {dashboardActivity.map((row) => (
                  <AtlTr key={row.id}>
                    <AtlTd>{row.user}</AtlTd>
                    <AtlTd>{row.action}</AtlTd>
                    <AtlTd><AtlBadge variant={row.statusVariant} size="sm">{row.status}</AtlBadge></AtlTd>
                    <AtlTd align="end">{row.time}</AtlTd>
                  </AtlTr>
                ))}
              </AtlTbody>
            </AtlTable>
          </AtlCardContent>
        </AtlCard>
        <AtlCard variant="elevated" padding="md">
          <AtlCardHeader>
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Plan Usage</h4>
          </AtlCardHeader>
          <AtlCardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>API requests</span>
                  <span style={{ opacity: 0.7 }}>{quota}%</span>
                </div>
                <AtlProgress value={quota} variant="warning" size="sm" label="API requests" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>Storage</span>
                  <span style={{ opacity: 0.7 }}>42%</span>
                </div>
                <AtlProgress value={42} variant="success" size="sm" label="Storage" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>Seats</span>
                  <span style={{ opacity: 0.7 }}>9 / 12</span>
                </div>
                <AtlProgress value={75} variant="default" size="sm" label="Seats used" />
              </div>
            </div>
          </AtlCardContent>
        </AtlCard>
      </div>
    </div>
  );
}
