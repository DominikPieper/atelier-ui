import { useState } from 'react';
import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmCheckbox, LlmAlert, LlmToggle, LlmSelect, LlmOption,
  LlmTabGroup, LlmTab, LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmBadge, LlmAccordionGroup, LlmAccordionItem,
  LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd,
  LlmProgress,
} from '@atelier-ui/react';

function CodeTabs({ files }: { files: Array<{ label: string; code: string }> }) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(files[active].code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div>
      <div className="docs-multi-code-tabs" style={{ borderRadius: '8px 8px 0 0', marginBottom: 0 }}>
        {files.map((f, i) => (
          <button key={f.label} className={`docs-multi-code-tab${active === i ? ' active' : ''}`} onClick={() => { setActive(i); setCopied(false); }}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="docs-code-block" style={{ borderRadius: '0 0 var(--ui-radius-md) var(--ui-radius-md)' }}>
        <div className="docs-code-block-header">
          <span className="docs-code-block-lang">jsx</span>
          <button className="docs-code-block-copy" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
        <pre><code>{files[active].code}</code></pre>
      </div>
    </div>
  );
}

function PatternSection({
  title,
  description,
  children,
  angularCode,
  reactCode,
  vueCode,
  tags,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  angularCode: string;
  reactCode: string;
  vueCode: string;
  tags?: string[];
}) {
  const match = title.match(/^(\d+)\.\s+(.+)$/);
  const num = match ? match[1].padStart(2, '0') : null;
  const label = match ? match[2] : title;

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', marginBottom: '0.65rem' }}>
        {num && (
          <span style={{
            fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 700,
            color: 'var(--ui-color-primary)', background: 'rgba(68,218,218,0.1)',
            padding: '0.15rem 0.4rem', borderRadius: '3px', letterSpacing: '0.04em',
            flexShrink: 0, marginTop: '4px',
          }}>{num}</span>
        )}
        <div>
          <h2 id={num ? `pattern-${parseInt(num, 10)}` : undefined} style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.3rem', color: 'var(--ui-color-text)' }}>
            {label}
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            {description}
          </p>
          {tags && tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
              {tags.map(tag => (
                <span key={tag} style={{
                  fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 600,
                  color: 'var(--docs-secondary, #89ceff)', background: 'rgba(137,206,255,0.08)',
                  padding: '0.1rem 0.4rem', borderRadius: '3px',
                }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{
        background: 'var(--ui-color-surface-sunken)', borderRadius: 'var(--ui-radius-md)',
        padding: '2rem 1.5rem', marginBottom: '1rem', marginTop: '1rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {children}
        </div>
      </div>
      <CodeTabs files={[
        { label: 'Angular', code: angularCode },
        { label: 'React', code: reactCode },
        { label: 'Vue', code: vueCode },
      ]} />
    </div>
  );
}

// ── 1. Login Form ──
function LoginFormDemo() {
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
function SettingsPageDemo() {
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
function ConfirmationDemo() {
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

function DataListDemo() {
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
function NotificationCenterDemo() {
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

function ManagementDashboardDemo() {
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

// Code snippets
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
      <llm-button variant="outline" size="sm">View</llm-button>
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
      <LlmButton variant="outline" size="sm">View</LlmButton>
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
    <LlmButton variant="outline" size="sm">View</LlmButton>
  </LlmCardContent>
</LlmCard>`;

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

export default function PatternsPage() {
  return (
    <div className="docs-inline-page">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1.1,
          margin: '0 0 0.6rem',
          background: 'linear-gradient(135deg, var(--ui-color-primary) 0%, var(--docs-secondary, #89ceff) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Cookbook Patterns
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ui-color-text-muted)', margin: 0, maxWidth: '560px', lineHeight: '1.65' }}>
          Composition patterns for common UI scenarios. These examples demonstrate how to combine
          atomic components into accessible, functional interfaces.
        </p>
      </div>

      <div style={{
        padding: '1rem 1.25rem', background: 'rgba(68,218,218,0.05)',
        border: '1px solid rgba(68,218,218,0.1)', borderRadius: 'var(--ui-radius-md)',
        marginBottom: '2.5rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>💡</span>
        <div>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--ui-color-text)' }}>Prototyping hint</p>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--ui-color-text-muted)', lineHeight: '1.6' }}>
            Share these patterns with your LLM to ensure it understands the intended composition logic.
            Patterns provide higher-level context than atomic API references alone.
          </p>
        </div>
      </div>

      <PatternSection
        title="1. Login Form"
        description="The most frequent AI-generated page. Shows Card composition, validation error display, and loading states."
        tags={['LlmCard', 'LlmInput', 'LlmButton', 'LlmAlert', 'LlmCheckbox']}
        angularCode={loginAngular} reactCode={loginReact} vueCode={loginVue}
      >
        <LoginFormDemo />
      </PatternSection>

      <PatternSection
        title="2. Settings Page"
        description="Exercises tabs, form controls, and layout composition. The bread and butter of SaaS applications."
        tags={['LlmTabGroup', 'LlmToggle', 'LlmSelect', 'LlmInput', 'LlmButton']}
        angularCode={settingsAngular} reactCode={settingsReact} vueCode={settingsVue}
      >
        <SettingsPageDemo />
      </PatternSection>

      <PatternSection
        title="3. Confirmation Dialog"
        description="Accessible modal flow for destructive actions. Shows trigger → dialog → action logic."
        tags={['LlmDialog', 'LlmAlert', 'LlmButton']}
        angularCode={confirmAngular} reactCode={confirmReact} vueCode={confirmVue}
      >
        <ConfirmationDemo />
      </PatternSection>

      <PatternSection
        title="4. Data List with Actions"
        description="Inline actions on a list of items. The core pattern for dashboards and admin panels — Card + Badge + Button composition."
        tags={['LlmCard', 'LlmBadge', 'LlmButton']}
        angularCode={dataListAngular} reactCode={dataListReact} vueCode={dataListVue}
      >
        <DataListDemo />
      </PatternSection>

      <PatternSection
        title="5. Notification Center"
        description="Structural feedback grouping using Accordion and Alert. Useful for monitoring and admin tools."
        tags={['LlmAccordionGroup', 'LlmAlert', 'LlmBadge']}
        angularCode={notificationsAngular} reactCode={notificationsReact} vueCode={notificationsVue}
      >
        <NotificationCenterDemo />
      </PatternSection>

      <PatternSection
        title="6. Management Dashboard"
        description="The densest cookbook pattern — metric cards, activity table, and quota indicators combined. Shows how Card, Table, TabGroup, Badge, Alert, and Progress fit together."
        tags={['LlmCard', 'LlmTable', 'LlmTabGroup', 'LlmBadge', 'LlmAlert', 'LlmProgress']}
        angularCode={dashboardAngular} reactCode={dashboardReact} vueCode={dashboardVue}
      >
        <ManagementDashboardDemo />
      </PatternSection>
    </div>
  );
}
