import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  LlmButton,
  LlmCard,
  LlmCardHeader,
  LlmCardContent,
  LlmCardFooter,
  LlmInput,
  LlmCheckbox,
  LlmAlert,
  LlmToggle,
  LlmSelect,
  LlmOption,
  LlmTabGroup,
  LlmTab,
  LlmDialog,
  LlmDialogHeader,
  LlmDialogContent,
  LlmDialogFooter,
  LlmBadge,
  LlmMenu,
  LlmMenuItem,
  LlmMenuSeparator,
  LlmMenuTrigger,
  LlmTooltip,
  LlmAccordionGroup,
  LlmAccordionItem,
} from '@atelier-ui/react';
import { MultiCodeBlock, CodeFile } from '../shared/code-block';

export const Route = createFileRoute('/patterns')({
  component: PatternsPage,
});

const muted: React.CSSProperties = {
  lineHeight: '1.6',
  marginBottom: '1rem',
  color: 'var(--ui-color-text-muted)',
};

function PatternSection({
  title,
  description,
  children,
  angularCode,
  reactCode,
  vueCode,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  angularCode: string;
  reactCode: string;
  vueCode: string;
}) {
  const files: CodeFile[] = [
    { label: 'Angular', code: angularCode, lang: 'jsx' },
    { label: 'React', code: reactCode, lang: 'jsx' },
    { label: 'Vue', code: vueCode, lang: 'jsx' },
  ];

  return (
    <div className="docs-section">
      <h2 className="docs-section-title">{title}</h2>
      <p style={muted}>{description}</p>
      <div className="docs-demo" style={{ marginBottom: '1.5rem' }}>
        <div className="docs-demo-canvas docs-demo-canvas--column" style={{ background: 'var(--ui-color-surface-sunken)' }}>
          {children}
        </div>
      </div>
      <MultiCodeBlock files={files} />
    </div>
  );
}

// ─── 1. Login Form ───────────────────────────────────────────────────────────

function LoginFormDemo() {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowError(true);
    }, 1500);
  };

  return (
    <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
      <LlmCard variant="elevated" padding="lg">
        <LlmCardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Sign in</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}>Enter your credentials to continue</p>
          </div>
        </LlmCardHeader>
        <LlmCardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {showError && (
              <LlmAlert variant="danger" dismissible onDismissed={() => setShowError(false)}>
                Invalid email or password.
              </LlmAlert>
            )}
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
          <LlmButton variant="primary" loading={loading} onClick={handleSubmit}>
            Sign in
          </LlmButton>
        </LlmCardFooter>
      </LlmCard>
    </div>
  );
}

const loginAngular = `
<llm-card variant="elevated" padding="lg">
  <llm-card-header>
    <h3>Sign in</h3>
    <p>Enter your credentials to continue</p>
  </llm-card-header>
  <llm-card-content>
    @if (showError()) {
      <llm-alert variant="danger">Invalid email or password.</llm-alert>
    }
    <div class="form-field">
      <label>Email</label>
      <llm-input type="email" placeholder="you@example.com" [invalid]="showError()" />
    </div>
    <div class="form-field">
      <label>Password</label>
      <llm-input type="password" placeholder="••••••••" [invalid]="showError()" />
    </div>
    <llm-checkbox>Remember me</llm-checkbox>
  </llm-card-content>
  <llm-card-footer>
    <llm-button variant="primary" [loading]="loading()" (click)="signIn()">
      Sign in
    </llm-button>
  </llm-card-footer>
</llm-card>
`;

const loginReact = `
<LlmCard variant="elevated" padding="lg">
  <LlmCardHeader>
    <h3>Sign in</h3>
    <p>Enter your credentials to continue</p>
  </LlmCardHeader>
  <LlmCardContent>
    {showError && <LlmAlert variant="danger">Invalid email or password.</LlmAlert>}
    <div className="form-field">
      <label>Email</label>
      <LlmInput type="email" placeholder="you@example.com" invalid={showError} />
    </div>
    <div className="form-field">
      <label>Password</label>
      <LlmInput type="password" placeholder="••••••••" invalid={showError} />
    </div>
    <LlmCheckbox>Remember me</LlmCheckbox>
  </LlmCardContent>
  <LlmCardFooter>
    <LlmButton variant="primary" loading={loading} onClick={signIn}>
      Sign in
    </LlmButton>
  </LlmCardFooter>
</LlmCard>
`;

const loginVue = `
<LlmCard variant="elevated" padding="lg">
  <LlmCardHeader>Sign in</LlmCardHeader>
  <LlmCardContent>
    <LlmAlert v-if="showError" variant="danger">Invalid email or password.</LlmAlert>
    <div class="form-field">
      <label>Email</label>
      <LlmInput type="email" placeholder="you@example.com" v-model:value="email" />
    </div>
    <div class="form-field">
      <label>Password</label>
      <LlmInput type="password" placeholder="••••••••" v-model:value="password" />
    </div>
    <LlmCheckbox v-model:checked="remember">Remember me</LlmCheckbox>
  </LlmCardContent>
  <LlmCardFooter>
    <LlmButton variant="primary" :loading="loading" @click="signIn">
      Sign in
    </LlmButton>
  </LlmCardFooter>
</LlmCard>
`;

// ─── 2. Settings Page ────────────────────────────────────────────────────────

function SettingsPageDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [success, setSuccess] = useState(false);

  const onSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto' }}>
      <h3 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 600 }}>Settings</h3>
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.9375rem', opacity: 0.7 }}>Manage your account preferences.</p>

      {success && (
        <div style={{ marginBottom: '1.5rem' }}>
          <LlmAlert variant="success" dismissible onDismissed={() => setSuccess(false)}>
            Settings saved successfully.
          </LlmAlert>
        </div>
      )}

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
        <LlmButton variant="primary" onClick={onSave}>Save changes</LlmButton>
        <LlmButton variant="outline">Cancel</LlmButton>
      </div>
    </div>
  );
}

const settingsAngular = `
<llm-tab-group [(selectedIndex)]="activeTab">
  <llm-tab label="Account">
    <div class="grid">
      <llm-input label="Full Name" placeholder="John Doe" />
      <llm-input label="Email" placeholder="john@example.com" />
    </div>
  </llm-tab>
  <llm-tab label="Notifications">
    <llm-toggle [(checked)]="emailOn">Email notifications</llm-toggle>
    <llm-toggle [(checked)]="pushOn">Push notifications</llm-toggle>
  </llm-tab>
  <llm-tab label="Privacy">
    <llm-select [(value)]="visibility" placeholder="Select visibility">
      <llm-option optionValue="public">Public</llm-option>
      <llm-option optionValue="friends">Friends only</llm-option>
      <llm-option optionValue="private">Private</llm-option>
    </llm-select>
  </llm-tab>
</llm-tab-group>
<div class="actions">
  <llm-button variant="primary" (click)="save()">Save</llm-button>
  <llm-button variant="outline">Cancel</llm-button>
</div>
`;

const settingsReact = `
<LlmTabGroup selectedIndex={tab} onSelectedIndexChange={setTab}>
  <LlmTab label="Account">
    <div className="grid">
      <LlmInput label="Full Name" placeholder="John Doe" />
      <LlmInput label="Email" placeholder="john@example.com" />
    </div>
  </LlmTab>
  <LlmTab label="Notifications">
    <LlmToggle checked={emailOn} onCheckedChange={setEmailOn}>Email notifications</LlmToggle>
    <LlmToggle checked={pushOn} onCheckedChange={setPushOn}>Push notifications</LlmToggle>
  </LlmTab>
</LlmTabGroup>
<div className="actions">
  <LlmButton variant="primary" onClick={save}>Save</LlmButton>
  <LlmButton variant="outline">Cancel</LlmButton>
</div>
`;

const settingsVue = `
<LlmTabGroup v-model:selectedIndex="activeTab">
  <LlmTab label="Account">
    <LlmInput v-model:value="name" label="Full Name" />
    <LlmInput v-model:value="email" label="Email" />
  </LlmTab>
  <LlmTab label="Notifications">
    <LlmToggle v-model:checked="emailOn">Email notifications</LlmToggle>
  </LlmTab>
</LlmTabGroup>
<div class="actions">
  <LlmButton variant="primary" @click="save">Save changes</LlmButton>
</div>
`;

// ─── 3. Confirmation Dialog ──────────────────────────────────────────────────


function ConfirmationDemo() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
      <div style={{ padding: '1.25rem', border: '1px solid var(--ui-color-border)', borderRadius: '8px', background: 'var(--ui-color-surface)' }}>
        <h4 style={{ margin: '0 0 4px', fontSize: '1.125rem', fontWeight: 600, color: 'var(--ui-color-danger)' }}>Danger Zone</h4>
        <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', opacity: 0.7 }}>
          Deleting your account is permanent and cannot be undone.
        </p>
        <LlmButton variant="primary" onClick={() => setOpen(true)}>Delete account</LlmButton>
      </div>

      <LlmDialog open={open} onOpenChange={setOpen} size="sm">
        <LlmDialogHeader>Delete Account</LlmDialogHeader>
        <LlmDialogContent>
          <LlmAlert variant="warning">This action cannot be undone.</LlmAlert>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
            Are you sure you want to delete your account? All projects and data will be permanently removed.
          </p>
        </LlmDialogContent>
        <LlmDialogFooter>
          <LlmButton variant="outline" onClick={() => setOpen(false)}>Cancel</LlmButton>
          <LlmButton variant="primary" onClick={() => { setOpen(false); setConfirmed(true); }}>
            Yes, delete account
          </LlmButton>
        </LlmDialogFooter>
      </LlmDialog>

      {confirmed && (
        <div style={{ marginTop: '1rem' }}>
          <LlmAlert variant="success" dismissible onDismissed={() => setConfirmed(false)}>
            Account deletion simulated.
          </LlmAlert>
        </div>
      )}
    </div>
  );
}

const confirmAngular = `
<llm-button variant="primary" (click)="isOpen.set(true)">Delete account</llm-button>

<llm-dialog [(open)]="isOpen" size="sm">
  <llm-dialog-header>Delete Account</llm-dialog-header>
  <llm-dialog-content>
    <llm-alert variant="warning">This action cannot be undone.</llm-alert>
    <p>Are you sure you want to delete your account?</p>
  </llm-dialog-content>
  <llm-dialog-footer>
    <llm-button variant="outline" (click)="isOpen.set(false)">Cancel</llm-button>
    <llm-button variant="primary" (click)="confirm()">Yes, delete</llm-button>
  </llm-dialog-footer>
</llm-dialog>
`;

const confirmReact = `
<LlmButton onClick={() => setOpen(true)}>Delete account</LlmButton>

<LlmDialog open={open} onOpenChange={setOpen} size="sm">
  <LlmDialogHeader>Delete Account</LlmDialogHeader>
  <LlmDialogContent>
    <LlmAlert variant="warning">This action cannot be undone.</LlmAlert>
    <p>Are you sure you want to delete your account?</p>
  </LlmDialogContent>
  <LlmDialogFooter>
    <LlmButton variant="outline" onClick={() => setOpen(false)}>Cancel</LlmButton>
    <LlmButton variant="primary" onClick={confirm}>Yes, delete</LlmButton>
  </LlmDialogFooter>
</LlmDialog>
`;

const confirmVue = `
<LlmButton variant="primary" @click="isOpen = true">Delete account</LlmButton>

<LlmDialog v-model:open="isOpen" size="sm">
  <LlmDialogHeader>Delete Account</LlmDialogHeader>
  <LlmDialogContent>
    <LlmAlert variant="warning">This action cannot be undone.</LlmAlert>
    <p>Are you sure you want to delete your account?</p>
  </LlmDialogContent>
  <LlmDialogFooter>
    <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
    <LlmButton variant="primary" @click="confirm">Yes, delete</LlmButton>
  </LlmDialogFooter>
</LlmDialog>
`;

// ─── 4. Data List ────────────────────────────────────────────────────────────

function DataListDemo() {
  const items = [
    { id: 1, name: 'Marketing Website', status: 'Active', variant: 'success' },
    { id: 2, name: 'Mobile App v2', status: 'In Review', variant: 'warning' },
    { id: 3, name: 'API Gateway', status: 'Draft', variant: 'default' },
  ];

  return (
    <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
        <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Projects</h4>
        <LlmButton variant="primary" size="sm">New Project</LlmButton>
      </div>
      {items.map(item => (
        <LlmCard key={item.id} variant="outlined" padding="md">
          <LlmCardContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{item.name}</span>
                <LlmBadge variant={item.variant as 'success' | 'warning' | 'default'} size="sm">{item.status}</LlmBadge>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <LlmTooltip llmTooltip="View Details">
                  <LlmButton variant="outline" size="sm">View</LlmButton>
                </LlmTooltip>
                <LlmMenuTrigger
                  menu={
                    <LlmMenu>
                      <LlmMenuItem>Edit</LlmMenuItem>
                      <LlmMenuItem>Duplicate</LlmMenuItem>
                      <LlmMenuSeparator />
                      <LlmMenuItem>Delete</LlmMenuItem>
                    </LlmMenu>
                  }
                >
                  {({ onClick, ref }) => (
                    <LlmButton variant="outline" size="sm" onClick={onClick} ref={ref as React.RefObject<HTMLButtonElement>}>...</LlmButton>
                  )}
                </LlmMenuTrigger>
              </div>
            </div>
          </LlmCardContent>
        </LlmCard>
      ))}
    </div>
  );
}

const listAngular = `
@for (item of items; track item.id) {
  <llm-card variant="outlined" padding="md">
    <div class="row">
      <div class="info">
        <span>{{ item.name }}</span>
        <llm-badge [variant]="item.variant" size="sm">{{ item.status }}</llm-badge>
      </div>
      <div class="actions">
        <llm-button variant="outline" size="sm" llmTooltip="View">View</llm-button>
        <llm-button variant="outline" size="sm" [llmMenuTriggerFor]="m">...</llm-button>
        <ng-template #m>
          <llm-menu>
            <llm-menu-item>Edit</llm-menu-item>
            <llm-menu-item>Delete</llm-menu-item>
          </llm-menu>
        </ng-template>
      </div>
    </div>
  </llm-card>
}
`;

const listReact = `
{items.map(item => (
  <LlmCard key={item.id} variant="outlined" padding="md">
    <div className="row">
      <div className="info">
        <span>{item.name}</span>
        <LlmBadge variant={item.variant} size="sm">{item.status}</LlmBadge>
      </div>
      <div className="actions">
        <LlmTooltip llmTooltip="View">
          <LlmButton variant="outline" size="sm">View</LlmButton>
        </LlmTooltip>
        <LlmMenuTrigger menu={<LlmMenu><LlmMenuItem>Edit</LlmMenuItem></LlmMenu>}>
          {({ onClick, ref }) => <LlmButton onClick={onClick} ref={ref}>...</LlmButton>}
        </LlmMenuTrigger>
      </div>
    </div>
  </LlmCard>
))}`;

const listVue = `
<LlmCard v-for="item in items" :key="item.id" variant="outlined">
  <div class="row">
    <span>{{ item.name }}</span>
    <LlmBadge :variant="item.variant">{{ item.status }}</LlmBadge>
    <LlmMenuTrigger>
      <template #trigger>
        <LlmButton variant="outline">···</LlmButton>
      </template>
      <template #menu>
        <LlmMenu><LlmMenuItem>Edit</LlmMenuItem></LlmMenu>
      </template>
    </LlmMenuTrigger>
  </div>
</LlmCard>
`;

// ─── 5. Notification Center ──────────────────────────────────────────────────

function NotificationCenterDemo() {
  return (
    <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
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

const notificationsAngular = `
<llm-accordion-group [multi]="true" variant="separated">
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
</llm-accordion-group>
`;

const notificationsReact = `
<LlmAccordionGroup multi variant="separated">
  <LlmAccordionItem expanded>
    <span>Errors <LlmBadge variant="danger" size="sm">2</LlmBadge></span>
    <LlmAlert variant="danger">Database failed.</LlmAlert>
    <LlmAlert variant="danger">Service 503.</LlmAlert>
  </LlmAccordionItem>
</LlmAccordionGroup>
`;

const notificationsVue = `
<LlmAccordionGroup :multi="true" variant="separated">
  <LlmAccordionItem :expanded="true">
    <template #header>
      Errors <LlmBadge variant="danger">2</LlmBadge>
    </template>
    <LlmAlert variant="danger">Database failed.</LlmAlert>
  </LlmAccordionItem>
</LlmAccordionGroup>
`;

// ─── Main Page ───────────────────────────────────────────────────────────────

function PatternsPage() {
  return (
    <div className="docs-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="docs-page-header">
        <h1 className="docs-page-title">Cookbook Patterns</h1>
        <p className="docs-page-description">
          Composition patterns for common UI scenarios. These examples demonstrate how to combine
          atomic components into accessible, functional interfaces.
        </p>
      </div>

      <div style={{ marginBottom: '3rem', padding: '1.5rem', background: 'var(--ui-color-primary-light)', border: '1px solid var(--ui-color-primary)', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px', color: 'var(--ui-color-primary)', fontWeight: 700 }}>Prototyping Hint</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ui-color-primary)', opacity: 0.9, lineHeight: 1.5 }}>
          Share these patterns with your LLM to ensure it understands the intended composition logic.
          Patterns provide higher-level context than atomic API references alone.
        </p>
      </div>

      <PatternSection
        title="1. Login Form"
        description="The most frequent AI-generated page. Shows Card composition, validation error display, and loading states."
        angularCode={loginAngular}
        reactCode={loginReact}
        vueCode={loginVue}
      >
        <LoginFormDemo />
      </PatternSection>

      <PatternSection
        title="2. Settings Page"
        description="Exercises tabs, form controls, and layout composition. The bread and butter of SaaS applications."
        angularCode={settingsAngular}
        reactCode={settingsReact}
        vueCode={settingsVue}
      >
        <SettingsPageDemo />
      </PatternSection>

      <PatternSection
        title="3. Confirmation Dialog"
        description="Accessible modal flow for destructive actions. Shows trigger -> dialog -> action logic."
        angularCode={confirmAngular}
        reactCode={confirmReact}
        vueCode={confirmVue}
      >
        <ConfirmationDemo />
      </PatternSection>

      <PatternSection
        title="4. Data List with Actions"
        description="Core pattern for dashboards. Combines Card, Badge, Tooltip, and Menu for complex row-level interactions."
        angularCode={listAngular}
        reactCode={listReact}
        vueCode={listVue}
      >
        <DataListDemo />
      </PatternSection>

      <PatternSection
        title="5. Notification Center"
        description="Structural feedback grouping using Accordion and Alert. Useful for monitoring and admin tools."
        angularCode={notificationsAngular}
        reactCode={notificationsReact}
        vueCode={notificationsVue}
      >
        <NotificationCenterDemo />
      </PatternSection>
    </div>
  );
}
