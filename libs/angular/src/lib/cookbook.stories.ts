/* eslint-disable @angular-eslint/component-selector */
import type { Meta, StoryObj } from '@storybook/angular';
import { userEvent, expect, screen } from 'storybook/test';
import { Component, signal } from '@angular/core';
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
import { AtlSelect } from './select/atl-select';
import { AtlOption } from './select/atl-option';
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
  AtlMenu,
  AtlMenuItem,
  AtlMenuSeparator,
  AtlMenuTrigger,
} from './menu/atl-menu';
import { AtlTooltip } from './tooltip/atl-tooltip';
import {
  AtlTable,
  AtlThead,
  AtlTbody,
  AtlTr,
  AtlTh,
  AtlTd,
} from './table/atl-table';
import { AtlProgress } from './progress/atl-progress';

// ---------------------------------------------------------------------------
// 1. Login Form
// ---------------------------------------------------------------------------

/**
 * Login forms are the #1 most frequently AI-generated page. This pattern shows
 * Card + form control composition, validation error display, and loading state
 * management.
 */
@Component({
  selector: 'cookbook-login-form',
  standalone: true,
  imports: [
    AtlButton,
    AtlCard,
    AtlCardHeader,
    AtlCardContent,
    AtlCardFooter,
    AtlInput,
    AtlCheckbox,
    AtlAlert,
  ],
  template: `
    <!-- eslint-disable -->
    <div class="wrapper">
      <atl-card variant="elevated" padding="lg">
        <atl-card-header>
          <div class="login-header">
            <h2 class="login-title">Sign in</h2>
            <p class="login-subtitle">Enter your credentials to continue</p>
          </div>
        </atl-card-header>
        <atl-card-content>
          @if (showErrors) {
            <atl-alert variant="danger">
              Invalid email or password. Please try again.
            </atl-alert>
          }
          <div class="form-stack">
            <div class="form-field">
              <label class="field-label">Email</label>
              <atl-input
                type="email"
                placeholder="you@example.com"
                [invalid]="showErrors"
              />
            </div>
            <div class="form-field">
              <label class="field-label">Password</label>
              <atl-input
                type="password"
                placeholder="Enter your password"
                [invalid]="showErrors"
              />
            </div>
            <atl-checkbox>Remember me</atl-checkbox>
          </div>
        </atl-card-content>
        <atl-card-footer>
          <atl-button
            variant="primary"
            size="md"
            [loading]="loading()"
            (click)="onSubmit()"
          >
            Sign in
          </atl-button>
        </atl-card-footer>
      </atl-card>
    </div>
  `,
  styles: [
    `
      .wrapper {
        max-width: 400px;
        margin: 0 auto;
        padding: var(--ui-spacing-6);
      }
      .login-header {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-1);
      }
      .login-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .login-subtitle {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ui-color-text-muted);
      }
      .form-stack {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-4);
        margin-top: var(--ui-spacing-4);
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-1);
      }
      .field-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ui-color-text);
      }
    `,
  ],
})
class LoginFormComponent {
  showErrors = false;
  readonly loading = signal(false);

  onSubmit(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 2000);
  }
}

@Component({
  selector: 'cookbook-login-form-errors',
  standalone: true,
  imports: [
    AtlButton,
    AtlCard,
    AtlCardHeader,
    AtlCardContent,
    AtlCardFooter,
    AtlInput,
    AtlCheckbox,
    AtlAlert,
  ],
  template: `
    <!-- eslint-disable -->
    <div class="wrapper">
      <atl-card variant="elevated" padding="lg">
        <atl-card-header>
          <div class="login-header">
            <h2 class="login-title">Sign in</h2>
            <p class="login-subtitle">Enter your credentials to continue</p>
          </div>
        </atl-card-header>
        <atl-card-content>
          <atl-alert variant="danger">
            Invalid email or password. Please try again.
          </atl-alert>
          <div class="form-stack">
            <div class="form-field">
              <label class="field-label">Email</label>
              <atl-input
                type="email"
                placeholder="you@example.com"
                [invalid]="true"
              />
            </div>
            <div class="form-field">
              <label class="field-label">Password</label>
              <atl-input
                type="password"
                placeholder="Enter your password"
                [invalid]="true"
              />
            </div>
            <atl-checkbox>Remember me</atl-checkbox>
          </div>
        </atl-card-content>
        <atl-card-footer>
          <atl-button variant="primary" size="md" [loading]="loading()">
            Sign in
          </atl-button>
        </atl-card-footer>
      </atl-card>
    </div>
  `,
  styles: [
    `
      .wrapper {
        max-width: 400px;
        margin: 0 auto;
        padding: var(--ui-spacing-6);
      }
      .login-header {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-1);
      }
      .login-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .login-subtitle {
        margin: 0;
        font-size: 0.875rem;
        color: var(--ui-color-text-muted);
      }
      .form-stack {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-4);
        margin-top: var(--ui-spacing-4);
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-1);
      }
      .field-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ui-color-text);
      }
    `,
  ],
})
class LoginFormWithErrorsComponent {
  readonly loading = signal(false);
}

// ---------------------------------------------------------------------------
// 2. Settings Page
// ---------------------------------------------------------------------------

/**
 * Settings pages exercise the most components simultaneously and test tab-based
 * layout composition. This is the pattern LLMs need when building SaaS tools.
 */
@Component({
  selector: 'cookbook-settings-page',
  standalone: true,
  imports: [
    AtlButton,
    AtlInput,
    AtlToggle,
    AtlSelect,
    AtlOption,
    AtlAlert,
    AtlTabGroup,
    AtlTab,
  ],
  template: `
    <!-- eslint-disable -->
    <div class="wrapper">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Manage your account preferences.</p>

      @if (showSuccess()) {
        <atl-alert
          variant="success"
          [dismissible]="true"
          (dismissed)="showSuccess.set(false)"
        >
          Your settings have been saved successfully.
        </atl-alert>
      }

      <atl-tab-group [(selectedIndex)]="activeTab">
        <atl-tab label="Account">
          <div class="tab-content">
            <div class="form-grid">
              <div class="form-field">
                <label class="field-label">Full Name</label>
                <atl-input type="text" placeholder="John Doe" />
              </div>
              <div class="form-field">
                <label class="field-label">Email</label>
                <atl-input type="email" placeholder="john@example.com" />
              </div>
            </div>
          </div>
        </atl-tab>

        <atl-tab label="Notifications">
          <div class="tab-content">
            <div class="toggle-list">
              <atl-toggle [(checked)]="emailNotifications">
                Email notifications
              </atl-toggle>
              <atl-toggle [(checked)]="pushNotifications">
                Push notifications
              </atl-toggle>
              <atl-toggle [(checked)]="weeklyDigest">
                Weekly digest
              </atl-toggle>
              <atl-toggle [(checked)]="marketingEmails">
                Marketing emails
              </atl-toggle>
            </div>
          </div>
        </atl-tab>

        <atl-tab label="Privacy">
          <div class="tab-content">
            <div class="form-field">
              <label class="field-label">Profile visibility</label>
              <atl-select
                [(value)]="visibility"
                placeholder="Select visibility"
              >
                <atl-option optionValue="public">Public</atl-option>
                <atl-option optionValue="friends">Friends only</atl-option>
                <atl-option optionValue="private">Private</atl-option>
              </atl-select>
            </div>
          </div>
        </atl-tab>
      </atl-tab-group>

      <div class="actions">
        <atl-button variant="primary" (click)="onSave()">
          Save changes
        </atl-button>
        <atl-button variant="outline">Cancel</atl-button>
      </div>
    </div>
  `,
  styles: [
    `
      .wrapper {
        max-width: 640px;
        margin: 0 auto;
        padding: var(--ui-spacing-6);
      }
      .page-title {
        margin: 0 0 var(--ui-spacing-1);
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .page-subtitle {
        margin: 0 0 var(--ui-spacing-5);
        font-size: 0.9375rem;
        color: var(--ui-color-text-muted);
      }
      .tab-content {
        padding: var(--ui-spacing-5) 0;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--ui-spacing-4);
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-1);
      }
      .field-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ui-color-text);
      }
      .toggle-list {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-4);
      }
      .actions {
        display: flex;
        gap: var(--ui-spacing-3);
        margin-top: var(--ui-spacing-5);
        padding-top: var(--ui-spacing-5);
        border-top: 1px solid var(--ui-color-border);
      }
    `,
  ],
})
class SettingsPageComponent {
  readonly activeTab = signal(0);
  readonly showSuccess = signal(false);
  readonly emailNotifications = signal(true);
  readonly pushNotifications = signal(false);
  readonly weeklyDigest = signal(true);
  readonly marketingEmails = signal(false);
  readonly visibility = signal('public');

  onSave(): void {
    this.showSuccess.set(true);
  }
}

// ---------------------------------------------------------------------------
// 3. Confirmation Dialog
// ---------------------------------------------------------------------------

/**
 * Confirmation dialogs are required in nearly every CRUD application. This
 * pattern demonstrates the trigger -> dialog -> action flow that LLMs must
 * compose correctly.
 */
@Component({
  selector: 'cookbook-confirmation-dialog',
  standalone: true,
  imports: [
    AtlButton,
    AtlDialog,
    AtlDialogHeader,
    AtlDialogContent,
    AtlDialogFooter,
    AtlAlert,
  ],
  template: `
    <div class="wrapper">
      <div class="demo-area">
        <h2 class="demo-title">Danger Zone</h2>
        <p class="demo-description">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <atl-button variant="primary" (click)="isOpen.set(true)">
          Delete account
        </atl-button>
      </div>

      <atl-dialog [(open)]="isOpen" size="sm">
        <atl-dialog-header>Delete Account</atl-dialog-header>
        <atl-dialog-content>
          <atl-alert variant="warning">
            This action cannot be undone. All your data will be permanently removed.
          </atl-alert>
          <p class="confirm-text">
            Are you sure you want to delete your account? This will remove all of
            your data including projects, settings, and team associations.
          </p>
        </atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="outline" (click)="isOpen.set(false)">
            Cancel
          </atl-button>
          <atl-button variant="primary" (click)="onConfirm()">
            Yes, delete my account
          </atl-button>
        </atl-dialog-footer>
      </atl-dialog>

      @if (confirmed()) {
        <div class="result">
          <atl-alert variant="success" [dismissible]="true" (dismissed)="confirmed.set(false)">
            Account deletion confirmed (demo only).
          </atl-alert>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .wrapper {
        max-width: 480px;
        margin: 0 auto;
        padding: var(--ui-spacing-6);
      }
      .demo-area {
        padding: var(--ui-spacing-5);
        border: 1px solid var(--ui-color-border);
        border-radius: var(--ui-radius-md);
        background: var(--ui-color-surface);
      }
      .demo-title {
        margin: 0 0 var(--ui-spacing-1);
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ui-color-danger);
      }
      .demo-description {
        margin: 0 0 var(--ui-spacing-4);
        font-size: 0.875rem;
        color: var(--ui-color-text-muted);
      }
      .confirm-text {
        margin: var(--ui-spacing-4) 0 0;
        font-size: 0.875rem;
        color: var(--ui-color-text);
        line-height: 1.5;
      }
      .result {
        margin-top: var(--ui-spacing-4);
      }
    `,
  ],
})
class ConfirmationDialogComponent {
  readonly isOpen = signal(false);
  readonly confirmed = signal(false);

  onConfirm(): void {
    this.isOpen.set(false);
    this.confirmed.set(true);
  }
}

// ---------------------------------------------------------------------------
// 4. Data List with Actions
// ---------------------------------------------------------------------------

/**
 * Data lists with inline actions are the core pattern for dashboards and admin
 * panels. Shows Badge status indicators, Menu for contextual actions, and
 * Tooltip for icon affordance.
 */
@Component({
  selector: 'cookbook-data-list',
  standalone: true,
  imports: [
    AtlCard,
    AtlCardContent,
    AtlBadge,
    AtlButton,
    AtlMenu,
    AtlMenuItem,
    AtlMenuSeparator,
    AtlMenuTrigger,
    AtlTooltip,
  ],
  template: `
    <div class="wrapper">
      <div class="list-header">
        <h2 class="list-title">Projects</h2>
        <atl-button variant="primary" size="sm">New project</atl-button>
      </div>

      @for (item of items; track item.id) {
        <atl-card variant="outlined" padding="md">
          <atl-card-content>
            <div class="list-row">
              <div class="row-info">
                <div class="row-title-line">
                  <span class="row-title">{{ item.name }}</span>
                  <atl-badge [variant]="item.statusVariant" size="sm">
                    {{ item.status }}
                  </atl-badge>
                </div>
                <p class="row-description">{{ item.description }}</p>
              </div>
              <div class="row-actions">
                <atl-button
                  variant="outline"
                  size="sm"
                  atlTooltip="View details"
                  atlTooltipPosition="above"
                >
                  View
                </atl-button>
                <atl-button
                  variant="outline"
                  size="sm"
                  [atlMenuTriggerFor]="actionsMenu"
                  atlTooltip="More actions"
                  atlTooltipPosition="above"
                >
                  ...
                </atl-button>
                <ng-template #actionsMenu>
                  <atl-menu>
                    <atl-menu-item>Edit</atl-menu-item>
                    <atl-menu-item>Duplicate</atl-menu-item>
                    <atl-menu-separator />
                    <atl-menu-item>Delete</atl-menu-item>
                  </atl-menu>
                </ng-template>
              </div>
            </div>
          </atl-card-content>
        </atl-card>
      }
    </div>
  `,
  styles: [
    `
      .wrapper {
        max-width: 640px;
        margin: 0 auto;
        padding: var(--ui-spacing-6);
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-3);
      }
      .list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--ui-spacing-2);
      }
      .list-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .list-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ui-spacing-4);
      }
      .row-info {
        flex: 1;
        min-width: 0;
      }
      .row-title-line {
        display: flex;
        align-items: center;
        gap: var(--ui-spacing-2);
      }
      .row-title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .row-description {
        margin: var(--ui-spacing-1) 0 0;
        font-size: 0.8125rem;
        color: var(--ui-color-text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-actions {
        display: flex;
        gap: var(--ui-spacing-2);
        flex-shrink: 0;
      }
    `,
  ],
})
class DataListComponent {
  items = [
    {
      id: 1,
      name: 'Marketing Website',
      description: 'Company landing page redesign with new brand assets',
      status: 'Active',
      statusVariant: 'success' as const,
    },
    {
      id: 2,
      name: 'Mobile App v2',
      description: 'Cross-platform mobile application rewrite in Flutter',
      status: 'In Review',
      statusVariant: 'warning' as const,
    },
    {
      id: 3,
      name: 'API Gateway',
      description: 'Centralized API gateway for microservices architecture',
      status: 'Draft',
      statusVariant: 'default' as const,
    },
    {
      id: 4,
      name: 'Legacy Migration',
      description: 'Migrate legacy PHP monolith to Node.js microservices',
      status: 'Paused',
      statusVariant: 'danger' as const,
    },
  ];
}

// ---------------------------------------------------------------------------
// 5. Notification Center
// ---------------------------------------------------------------------------

/**
 * Notification centers combine Accordion grouping with Alert display -- common
 * in monitoring dashboards and admin tools. Shows how to compose structural and
 * feedback components.
 */
@Component({
  selector: 'cookbook-notification-center',
  standalone: true,
  imports: [
    AtlAccordionGroup,
    AtlAccordionItem,
    AtlAccordionHeader,
    AtlAlert,
    AtlBadge,
    AtlButton,
  ],
  template: `
    <div class="wrapper">
      <div class="header">
        <h2 class="header-title">Notifications</h2>
        <atl-button variant="outline" size="sm" (click)="dismissAll()">
          Clear all
        </atl-button>
      </div>

      <atl-accordion-group [multi]="true" variant="separated">
        @if (errors().length > 0) {
          <atl-accordion-item [expanded]="true">
            <span atlAccordionHeader>
              <span class="group-header">
                Errors
                <atl-badge variant="danger" size="sm">
                  {{ errors().length }}
                </atl-badge>
              </span>
            </span>
            <div class="alert-list">
              @for (error of errors(); track error.id) {
                <atl-alert
                  variant="danger"
                  [dismissible]="true"
                  (dismissed)="dismissError(error.id)"
                >
                  {{ error.message }}
                </atl-alert>
              }
            </div>
          </atl-accordion-item>
        }

        @if (warnings().length > 0) {
          <atl-accordion-item>
            <span atlAccordionHeader>
              <span class="group-header">
                Warnings
                <atl-badge variant="warning" size="sm">
                  {{ warnings().length }}
                </atl-badge>
              </span>
            </span>
            <div class="alert-list">
              @for (warning of warnings(); track warning.id) {
                <atl-alert
                  variant="warning"
                  [dismissible]="true"
                  (dismissed)="dismissWarning(warning.id)"
                >
                  {{ warning.message }}
                </atl-alert>
              }
            </div>
          </atl-accordion-item>
        }

        @if (infos().length > 0) {
          <atl-accordion-item>
            <span atlAccordionHeader>
              <span class="group-header">
                Info
                <atl-badge variant="info" size="sm">
                  {{ infos().length }}
                </atl-badge>
              </span>
            </span>
            <div class="alert-list">
              @for (info of infos(); track info.id) {
                <atl-alert
                  variant="info"
                  [dismissible]="true"
                  (dismissed)="dismissInfo(info.id)"
                >
                  {{ info.message }}
                </atl-alert>
              }
            </div>
          </atl-accordion-item>
        }
      </atl-accordion-group>
    </div>
  `,
  styles: [
    `
      .wrapper {
        max-width: 560px;
        margin: 0 auto;
        padding: var(--ui-spacing-6);
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--ui-spacing-4);
      }
      .header-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .group-header {
        display: inline-flex;
        align-items: center;
        gap: var(--ui-spacing-2);
      }
      .alert-list {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-2);
        padding: var(--ui-spacing-3) 0;
      }
    `,
  ],
})
class NotificationCenterComponent {
  readonly errors = signal([
    { id: 1, message: 'Database connection failed on replica-3. Automatic failover engaged.' },
    { id: 2, message: 'Payment processing service returned 503 for 12 transactions.' },
  ]);

  readonly warnings = signal([
    { id: 3, message: 'Disk usage on worker-7 is at 89%. Consider scaling storage.' },
    { id: 4, message: 'SSL certificate for api.example.com expires in 14 days.' },
    { id: 5, message: 'Rate limiter triggered 230 times in the last hour.' },
  ]);

  readonly infos = signal([
    { id: 6, message: 'Deployment v3.2.1 completed successfully across all regions.' },
    { id: 7, message: 'Scheduled maintenance window begins Saturday at 02:00 UTC.' },
  ]);

  dismissError(id: number): void {
    this.errors.update((list) => list.filter((item) => item.id !== id));
  }

  dismissWarning(id: number): void {
    this.warnings.update((list) => list.filter((item) => item.id !== id));
  }

  dismissInfo(id: number): void {
    this.infos.update((list) => list.filter((item) => item.id !== id));
  }

  dismissAll(): void {
    this.errors.set([]);
    this.warnings.set([]);
    this.infos.set([]);
  }
}

// ---------------------------------------------------------------------------
// 6. Management Dashboard
// ---------------------------------------------------------------------------

/**
 * Management dashboards combine metric cards, tabular activity feeds, and
 * quota indicators. Demonstrates composition across Card, Table, TabGroup,
 * Badge, Progress, and Alert -- the densest single pattern in the cookbook.
 */
@Component({
  selector: 'cookbook-management-dashboard',
  standalone: true,
  imports: [
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
  ],
  template: `
    <div class="wrapper">
      <div class="dashboard-header">
        <div>
          <h2 class="dashboard-title">Operations Overview</h2>
          <p class="dashboard-subtitle">
            Snapshot across the selected time range
          </p>
        </div>
        <atl-tab-group
          variant="pills"
          [selectedIndex]="rangeIndex()"
          (selectedIndexChange)="rangeIndex.set($event)"
        >
          <atl-tab label="7D">&nbsp;</atl-tab>
          <atl-tab label="30D">&nbsp;</atl-tab>
          <atl-tab label="90D">&nbsp;</atl-tab>
        </atl-tab-group>
      </div>

      @if (quotaPercent() >= 85) {
        <atl-alert variant="warning" [dismissible]="true">
          API request quota is at {{ quotaPercent() }}%. Upgrade your plan
          before the monthly reset to avoid throttling.
        </atl-alert>
      }

      <div class="metrics-grid">
        @for (metric of metrics(); track metric.label) {
          <atl-card variant="elevated" padding="md">
            <atl-card-content>
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value-row">
                <span class="metric-value">{{ metric.value }}</span>
                <atl-badge [variant]="metric.deltaVariant" size="sm">
                  {{ metric.delta }}
                </atl-badge>
              </div>
              <p class="metric-foot">{{ metric.foot }}</p>
            </atl-card-content>
          </atl-card>
        }
      </div>

      <div class="lower-grid">
        <atl-card variant="elevated" padding="none">
          <atl-card-header>
            <div class="panel-header">
              <h3 class="panel-title">Recent Activity</h3>
              <atl-button variant="outline" size="sm">Export</atl-button>
            </div>
          </atl-card-header>
          <atl-card-content>
            <atl-table variant="striped" size="sm">
              <atl-thead>
                <atl-tr>
                  <atl-th>User</atl-th>
                  <atl-th>Action</atl-th>
                  <atl-th>Status</atl-th>
                  <atl-th align="end">Time</atl-th>
                </atl-tr>
              </atl-thead>
              <atl-tbody>
                @for (row of activity(); track row.id) {
                  <atl-tr>
                    <atl-td>{{ row.user }}</atl-td>
                    <atl-td>{{ row.action }}</atl-td>
                    <atl-td>
                      <atl-badge [variant]="row.statusVariant" size="sm">
                        {{ row.status }}
                      </atl-badge>
                    </atl-td>
                    <atl-td align="end">{{ row.time }}</atl-td>
                  </atl-tr>
                }
              </atl-tbody>
            </atl-table>
          </atl-card-content>
        </atl-card>

        <atl-card variant="elevated" padding="md">
          <atl-card-header>
            <h3 class="panel-title">Plan Usage</h3>
          </atl-card-header>
          <atl-card-content>
            <div class="quota-stack">
              <div class="quota-item">
                <div class="quota-label-row">
                  <span class="quota-label">API requests</span>
                  <span class="quota-number">{{ quotaPercent() }}%</span>
                </div>
                <atl-progress
                  [value]="quotaPercent()"
                  variant="warning"
                  size="sm"
                />
              </div>
              <div class="quota-item">
                <div class="quota-label-row">
                  <span class="quota-label">Storage</span>
                  <span class="quota-number">42%</span>
                </div>
                <atl-progress [value]="42" variant="success" size="sm" />
              </div>
              <div class="quota-item">
                <div class="quota-label-row">
                  <span class="quota-label">Seats</span>
                  <span class="quota-number">9 / 12</span>
                </div>
                <atl-progress [value]="75" variant="default" size="sm" />
              </div>
            </div>
          </atl-card-content>
        </atl-card>
      </div>
    </div>
  `,
  styles: [
    `
      .wrapper {
        max-width: 1040px;
        margin: 0 auto;
        padding: var(--ui-spacing-6);
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-4);
      }
      .dashboard-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--ui-spacing-4);
      }
      .dashboard-title {
        margin: 0;
        font-size: 1.375rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .dashboard-subtitle {
        margin: var(--ui-spacing-1) 0 0;
        font-size: 0.875rem;
        color: var(--ui-color-text-muted);
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--ui-spacing-3);
      }
      .metric-label {
        font-size: 0.8125rem;
        color: var(--ui-color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .metric-value-row {
        display: flex;
        align-items: baseline;
        gap: var(--ui-spacing-2);
        margin-top: var(--ui-spacing-2);
      }
      .metric-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: var(--ui-color-text);
      }
      .metric-foot {
        margin: var(--ui-spacing-2) 0 0;
        font-size: 0.75rem;
        color: var(--ui-color-text-muted);
      }
      .lower-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--ui-spacing-3);
      }
      @media (max-width: 720px) {
        .lower-grid {
          grid-template-columns: 1fr;
        }
      }
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .panel-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--ui-color-text);
      }
      .quota-stack {
        display: flex;
        flex-direction: column;
        gap: var(--ui-spacing-4);
      }
      .quota-label-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: var(--ui-spacing-1);
        font-size: 0.8125rem;
      }
      .quota-label {
        color: var(--ui-color-text);
        font-weight: 500;
      }
      .quota-number {
        color: var(--ui-color-text-muted);
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
class ManagementDashboardComponent {
  readonly rangeIndex = signal(1);
  readonly quotaPercent = signal(87);

  readonly metrics = signal([
    {
      label: 'Active users',
      value: '8,412',
      delta: '+12%',
      deltaVariant: 'success' as const,
      foot: 'vs. previous period',
    },
    {
      label: 'Sessions',
      value: '24,390',
      delta: '+4%',
      deltaVariant: 'success' as const,
      foot: 'vs. previous period',
    },
    {
      label: 'Revenue',
      value: '$42,108',
      delta: '-2%',
      deltaVariant: 'danger' as const,
      foot: 'vs. previous period',
    },
    {
      label: 'Avg. response',
      value: '184 ms',
      delta: '+18 ms',
      deltaVariant: 'warning' as const,
      foot: 'P95 across edge nodes',
    },
  ]);

  readonly activity = signal([
    {
      id: 1,
      user: 'alex@acme.dev',
      action: 'Rotated API key',
      status: 'Success',
      statusVariant: 'success' as const,
      time: '2m ago',
    },
    {
      id: 2,
      user: 'maria@acme.dev',
      action: 'Invited new member',
      status: 'Pending',
      statusVariant: 'warning' as const,
      time: '14m ago',
    },
    {
      id: 3,
      user: 'deploy-bot',
      action: 'Pushed build v3.2.1',
      status: 'Success',
      statusVariant: 'success' as const,
      time: '1h ago',
    },
    {
      id: 4,
      user: 'lee@acme.dev',
      action: 'Removed webhook',
      status: 'Failed',
      statusVariant: 'danger' as const,
      time: '2h ago',
    },
    {
      id: 5,
      user: 'system',
      action: 'Nightly backup complete',
      status: 'Success',
      statusVariant: 'success' as const,
      time: '6h ago',
    },
  ]);
}

// ---------------------------------------------------------------------------
// Storybook Meta & Stories
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Cookbook',
};

export default meta;

// --- Login Form ---

export const LoginForm: StoryObj = {
  render: () => ({
    props: {},
    template: `<cookbook-login-form />`,
    moduleMetadata: {
      imports: [LoginFormComponent],
    },
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(await canvas.findByLabelText('Remember me')).toBeInTheDocument();
  },
};

export const LoginFormWithValidationErrors: StoryObj = {
  name: 'Login Form / With Validation Errors',
  render: () => ({
    props: {},
    template: `<cookbook-login-form-errors />`,
    moduleMetadata: {
      imports: [LoginFormWithErrorsComponent],
    },
  }),
};

// --- Settings Page ---

export const SettingsPage: StoryObj = {
  render: () => ({
    props: {},
    template: `<cookbook-settings-page />`,
    moduleMetadata: {
      imports: [SettingsPageComponent],
    },
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(await canvas.findByRole('tab', { name: 'Account' })).toBeVisible();
  },
};

// --- Confirmation Dialog ---

export const ConfirmationDialog: StoryObj = {
  render: () => ({
    props: {},
    template: `<cookbook-confirmation-dialog />`,
    moduleMetadata: {
      imports: [ConfirmationDialogComponent],
    },
  }),
  play: async ({ canvas }) => {
    const trigger = await canvas.findByRole('button', { name: 'Delete account' });
    await userEvent.click(trigger);
    // Native <dialog> renders to the top-layer outside the Storybook canvas root,
    // so query the whole document via `screen` instead of the scoped `canvas`.
    const dialog = await screen.findByRole('dialog');
    await expect(dialog).toHaveAttribute('open');
    await expect(
      await screen.findByRole('button', { name: 'Yes, delete my account' }),
    ).toBeInTheDocument();
  },
};

// --- Data List with Actions ---

export const DataListWithActions: StoryObj = {
  name: 'Data List with Actions',
  render: () => ({
    props: {},
    template: `<cookbook-data-list />`,
    moduleMetadata: {
      imports: [DataListComponent],
    },
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(await canvas.findByText('Marketing Website')).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'New project' })).toBeVisible();
  },
};

// --- Notification Center ---

export const NotificationCenter: StoryObj = {
  render: () => ({
    props: {},
    template: `<cookbook-notification-center />`,
    moduleMetadata: {
      imports: [NotificationCenterComponent],
    },
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Notifications' })).toBeVisible();
    await expect(await canvas.findByRole('button', { name: 'Clear all' })).toBeVisible();
    await expect(await canvas.findByText('Errors')).toBeVisible();
  },
};

// --- Management Dashboard ---

export const ManagementDashboard: StoryObj = {
  render: () => ({
    props: {},
    template: `<cookbook-management-dashboard />`,
    moduleMetadata: {
      imports: [ManagementDashboardComponent],
    },
  }),
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('heading', { name: 'Operations Overview' })).toBeVisible();
    await expect(await canvas.findByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(await canvas.findByRole('heading', { name: 'Plan Usage' })).toBeVisible();
  },
};
