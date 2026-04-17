import { useState } from 'react';
import {
  LlmButton, LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
  LlmInput, LlmCheckbox, LlmAlert, LlmToggle, LlmSelect, LlmOption,
  LlmTabGroup, LlmTab, LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
  LlmBadge, LlmAccordionGroup, LlmAccordionItem,
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
        title="4. Notification Center"
        description="Structural feedback grouping using Accordion and Alert. Useful for monitoring and admin tools."
        tags={['LlmAccordionGroup', 'LlmAlert', 'LlmBadge']}
        angularCode={notificationsAngular} reactCode={notificationsReact} vueCode={notificationsVue}
      >
        <NotificationCenterDemo />
      </PatternSection>
    </div>
  );
}
