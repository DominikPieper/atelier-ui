import type { Meta, StoryObj } from '@storybook/angular';
import { Component, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader } from '../accordion/llm-accordion';
import { LlmAlert } from '../alert/llm-alert';
import { LlmAvatar, LlmAvatarGroup } from '../avatar/llm-avatar';
import { LlmBadge } from '../badge/llm-badge';
import { LlmBreadcrumbs, LlmBreadcrumbItem } from '../breadcrumbs/llm-breadcrumbs';
import { LlmButton } from '../button/llm-button';
import { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter } from '../card/llm-card';
import { LlmCheckbox } from '../checkbox/llm-checkbox';
import { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter } from '../dialog/llm-dialog';
import { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter } from '../drawer/llm-drawer';
import { LlmInput } from '../input/llm-input';
import { LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger } from '../menu/llm-menu';
import { LlmPagination } from '../pagination/llm-pagination';
import { LlmProgress } from '../progress/llm-progress';
import { LlmRadioGroup } from '../radio-group/llm-radio-group';
import { LlmRadio } from '../radio/llm-radio';
import { LlmSelect } from '../select/llm-select';
import { LlmOption } from '../select/llm-option';
import { LlmSkeleton } from '../skeleton/llm-skeleton';
import { LlmTabGroup, LlmTab } from '../tabs/llm-tabs';
import { LlmTextarea } from '../textarea/llm-textarea';
import { LlmToastService, LlmToastContainer } from '../toast/llm-toast';
import { LlmToggle } from '../toggle/llm-toggle';
import { LlmTooltip } from '../tooltip/llm-tooltip';

@Component({
  selector: 'llm-showcase-all',
  standalone: true,
  imports: [
    LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader,
    LlmAlert,
    LlmAvatar, LlmAvatarGroup,
    LlmBadge,
    LlmBreadcrumbs, LlmBreadcrumbItem,
    LlmButton,
    LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter,
    LlmCheckbox,
    LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter,
    LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter,
    LlmInput,
    LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger,
    LlmPagination,
    LlmProgress,
    LlmRadioGroup, LlmRadio,
    LlmSelect, LlmOption,
    LlmSkeleton,
    LlmTabGroup, LlmTab,
    LlmTextarea,
    LlmToastContainer,
    LlmToggle,
    LlmTooltip,
    TitleCasePipe,
  ],
  template: `
    <div style="max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem;">

      <header style="margin-bottom: 3rem;">
        <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: -0.02em;">
          Component Showcase
        </h1>
        <p style="color: var(--ui-color-text-muted); font-size: 0.9rem;">
          All available Angular components at a glance.
        </p>
      </header>

      <!-- ── Button ──────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Button</h2>
        <div class="section-body">
          <div class="row">
            <llm-button variant="primary">Primary</llm-button>
            <llm-button variant="secondary">Secondary</llm-button>
            <llm-button variant="outline">Outline</llm-button>
            <llm-button variant="primary" [disabled]="true">Disabled</llm-button>
            <llm-button variant="primary" [loading]="true">Loading</llm-button>
          </div>
          <div class="row">
            <llm-button size="sm">Small</llm-button>
            <llm-button size="md">Medium</llm-button>
            <llm-button size="lg">Large</llm-button>
          </div>
        </div>
      </section>

      <!-- ── Badge ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Badge</h2>
        <div class="section-body">
          <div class="row">
            <llm-badge variant="default">Default</llm-badge>
            <llm-badge variant="success">Success</llm-badge>
            <llm-badge variant="warning">Warning</llm-badge>
            <llm-badge variant="danger">Danger</llm-badge>
            <llm-badge variant="info">Info</llm-badge>
            <llm-badge variant="success" size="sm">Small</llm-badge>
          </div>
        </div>
      </section>

      <!-- ── Avatar ──────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Avatar &amp; AvatarGroup</h2>
        <div class="section-body">
          <div class="row">
            <llm-avatar name="Alice Chen" size="xs" />
            <llm-avatar name="Bob Smith" size="sm" status="online" />
            <llm-avatar name="Carol Jones" size="md" status="away" />
            <llm-avatar name="Dave Brown" size="lg" shape="square" />
            <llm-avatar name="Eve Wilson" size="xl" status="busy" />
          </div>
          <div class="row">
            <llm-avatar-group [max]="3" size="md">
              <llm-avatar name="Alice Chen" />
              <llm-avatar name="Bob Smith" />
              <llm-avatar name="Carol Jones" />
              <llm-avatar name="Dave Brown" />
              <llm-avatar name="Eve Wilson" />
            </llm-avatar-group>
          </div>
        </div>
      </section>

      <!-- ── Alert ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Alert</h2>
        <div class="section-body">
          <llm-alert variant="info">This is an info alert.</llm-alert>
          <llm-alert variant="success">Your changes were saved successfully.</llm-alert>
          <llm-alert variant="warning">Your session will expire in 5 minutes.</llm-alert>
          <llm-alert variant="danger">Something went wrong. Please try again.</llm-alert>
          <llm-alert variant="info" [dismissible]="true">This alert can be dismissed.</llm-alert>
        </div>
      </section>

      <!-- ── Card ────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Card</h2>
        <div class="section-body">
          <div class="row" style="align-items: stretch; flex-wrap: wrap;">
            @for (v of cardVariants; track v) {
              <llm-card [variant]="v" padding="md" style="flex: 1; min-width: 180px;">
                <llm-card-header>{{ v | titlecase }}</llm-card-header>
                <llm-card-content>Card content goes here.</llm-card-content>
                <llm-card-footer>
                  <llm-button size="sm">Action</llm-button>
                </llm-card-footer>
              </llm-card>
            }
          </div>
        </div>
      </section>

      <!-- ── Input ────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Input</h2>
        <div class="section-body">
          <div class="row">
            <div style="flex: 1; min-width: 180px;">
              <llm-input placeholder="Text input" [(value)]="inputValue" />
            </div>
            <div style="flex: 1; min-width: 180px;">
              <llm-input type="email" placeholder="Email input" />
            </div>
            <div style="flex: 1; min-width: 180px;">
              <llm-input placeholder="Invalid state" [invalid]="true" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Textarea ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Textarea</h2>
        <div class="section-body">
          <llm-textarea placeholder="Write something here…" [rows]="3" [(value)]="textareaValue" />
          <llm-textarea placeholder="Auto-resize" [autoResize]="true" />
        </div>
      </section>

      <!-- ── Checkbox ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Checkbox</h2>
        <div class="section-body">
          <div class="row">
            <llm-checkbox [(checked)]="checkboxChecked">Accept terms and conditions</llm-checkbox>
            <llm-checkbox [checked]="true" [indeterminate]="true">Indeterminate</llm-checkbox>
            <llm-checkbox [checked]="true" [disabled]="true">Disabled</llm-checkbox>
          </div>
        </div>
      </section>

      <!-- ── Toggle ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Toggle</h2>
        <div class="section-body">
          <div class="row">
            <llm-toggle [(checked)]="toggleOn">Enable notifications</llm-toggle>
            <llm-toggle [checked]="false" [disabled]="true">Disabled</llm-toggle>
          </div>
        </div>
      </section>

      <!-- ── RadioGroup ────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">RadioGroup</h2>
        <div class="section-body">
          <llm-radio-group [(value)]="radioValue" name="plan">
            <div class="row">
              <llm-radio radioValue="free">Free</llm-radio>
              <llm-radio radioValue="pro">Pro</llm-radio>
              <llm-radio radioValue="enterprise">Enterprise</llm-radio>
              <llm-radio radioValue="legacy" [disabled]="true">Legacy (disabled)</llm-radio>
            </div>
          </llm-radio-group>
        </div>
      </section>

      <!-- ── Select ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Select</h2>
        <div class="section-body">
          <div style="max-width: 300px;">
            <llm-select [(value)]="selectValue" placeholder="Select a country">
              <llm-option optionValue="us">United States</llm-option>
              <llm-option optionValue="ca">Canada</llm-option>
              <llm-option optionValue="uk">United Kingdom</llm-option>
              <llm-option optionValue="de">Germany</llm-option>
              <llm-option optionValue="jp" [disabled]="true">Japan (unavailable)</llm-option>
            </llm-select>
          </div>
        </div>
      </section>

      <!-- ── Progress ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Progress</h2>
        <div class="section-body">
          <llm-progress [value]="20" />
          <llm-progress [value]="50" variant="success" />
          <llm-progress [value]="75" variant="warning" />
          <llm-progress [value]="90" variant="danger" size="lg" />
          <llm-progress [indeterminate]="true" />
        </div>
      </section>

      <!-- ── Skeleton ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Skeleton</h2>
        <div class="section-body">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <llm-skeleton variant="circular" width="48px" />
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
              <llm-skeleton variant="text" width="40%" />
              <llm-skeleton variant="text" />
              <llm-skeleton variant="text" width="70%" />
            </div>
          </div>
          <llm-skeleton variant="rectangular" height="80px" />
        </div>
      </section>

      <!-- ── Tabs ──────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Tabs</h2>
        <div class="section-body">
          <llm-tab-group [(selectedIndex)]="tabIndex">
            <llm-tab label="Overview">Overview — general information about the item.</llm-tab>
            <llm-tab label="Details">Detailed specifications and technical information.</llm-tab>
            <llm-tab label="History">Historical records and activity log.</llm-tab>
            <llm-tab label="Disabled" [disabled]="true">Not accessible.</llm-tab>
          </llm-tab-group>
          <llm-tab-group variant="pills">
            <llm-tab label="All">All items shown here.</llm-tab>
            <llm-tab label="Active">Only active items.</llm-tab>
            <llm-tab label="Archived">Archived items.</llm-tab>
          </llm-tab-group>
        </div>
      </section>

      <!-- ── Accordion ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Accordion</h2>
        <div class="section-body">
          <llm-accordion-group variant="bordered">
            <llm-accordion-item>
              <span llmAccordionHeader>What is this component library?</span>
              A set of accessible, composable UI components built for LLM-generated applications.
            </llm-accordion-item>
            <llm-accordion-item>
              <span llmAccordionHeader>How do I get started?</span>
              Import any component from <code>@atelier-ui/angular</code>.
            </llm-accordion-item>
            <llm-accordion-item [disabled]="true">
              <span llmAccordionHeader>Disabled section</span>
              This is not accessible.
            </llm-accordion-item>
          </llm-accordion-group>
        </div>
      </section>

      <!-- ── Breadcrumbs ───────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Breadcrumbs</h2>
        <div class="section-body">
          <llm-breadcrumbs>
            <llm-breadcrumb-item href="#">Home</llm-breadcrumb-item>
            <llm-breadcrumb-item href="#">Products</llm-breadcrumb-item>
            <llm-breadcrumb-item href="#">Category</llm-breadcrumb-item>
            <llm-breadcrumb-item>Current Page</llm-breadcrumb-item>
          </llm-breadcrumbs>
        </div>
      </section>

      <!-- ── Pagination ────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Pagination</h2>
        <div class="section-body">
          <llm-pagination [(page)]="page" [pageCount]="10" />
        </div>
      </section>

      <!-- ── Tooltip ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Tooltip</h2>
        <div class="section-body">
          <div class="row">
            <llm-button variant="outline" size="sm" llmTooltip="Appears above (default)">Above</llm-button>
            <llm-button variant="outline" size="sm" llmTooltip="Appears below" llmTooltipPosition="below">Below</llm-button>
            <llm-button variant="outline" size="sm" llmTooltip="Appears to the right" llmTooltipPosition="right">Right</llm-button>
            <llm-button variant="outline" size="sm" llmTooltip="Appears to the left" llmTooltipPosition="left">Left</llm-button>
          </div>
        </div>
      </section>

      <!-- ── Menu ─────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Menu</h2>
        <div class="section-body">
          <div class="row">
            <llm-button variant="outline" size="sm" [llmMenuTriggerFor]="actionsMenu">Open Menu ▾</llm-button>
            <ng-template #actionsMenu>
              <llm-menu>
                <llm-menu-item>Edit</llm-menu-item>
                <llm-menu-item>Duplicate</llm-menu-item>
                <llm-menu-separator />
                <llm-menu-item>Archive</llm-menu-item>
                <llm-menu-item [disabled]="true">Delete (disabled)</llm-menu-item>
              </llm-menu>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- ── Dialog ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Dialog</h2>
        <div class="section-body">
          <div class="row">
            <llm-button (click)="dialogOpen.set(true)">Open Dialog</llm-button>
          </div>
          <llm-dialog [(open)]="dialogOpen" size="sm">
            <llm-dialog-header>Confirm Action</llm-dialog-header>
            <llm-dialog-content>
              Are you sure you want to proceed? This action cannot be undone.
            </llm-dialog-content>
            <llm-dialog-footer>
              <llm-button variant="outline" (click)="dialogOpen.set(false)">Cancel</llm-button>
              <llm-button variant="primary" (click)="dialogOpen.set(false)">Confirm</llm-button>
            </llm-dialog-footer>
          </llm-dialog>
        </div>
      </section>

      <!-- ── Drawer ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Drawer</h2>
        <div class="section-body">
          <div class="row">
            <llm-button variant="outline" (click)="drawerOpen.set(true)">Open Drawer</llm-button>
          </div>
          <llm-drawer [(open)]="drawerOpen" position="right" size="md">
            <llm-drawer-header>Settings Panel</llm-drawer-header>
            <llm-drawer-content>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <llm-input placeholder="Display name" />
                <llm-toggle [(checked)]="toggleOn">Email notifications</llm-toggle>
                <llm-toggle [checked]="false">Push notifications</llm-toggle>
              </div>
            </llm-drawer-content>
            <llm-drawer-footer>
              <llm-button variant="outline" (click)="drawerOpen.set(false)">Cancel</llm-button>
              <llm-button (click)="drawerOpen.set(false)">Save</llm-button>
            </llm-drawer-footer>
          </llm-drawer>
        </div>
      </section>

      <!-- ── Toast ────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Toast</h2>
        <div class="section-body">
          <div class="row">
            <llm-button size="sm" (click)="showToast('Saved!', 'success')">Success</llm-button>
            <llm-button size="sm" variant="secondary" (click)="showToast('Something went wrong', 'danger')">Danger</llm-button>
            <llm-button size="sm" variant="outline" (click)="showToast('New message', 'info')">Info</llm-button>
            <llm-button size="sm" variant="outline" (click)="showToast('Check your settings', 'warning')">Warning</llm-button>
          </div>
        </div>
      </section>

      <llm-toast-container position="bottom-right" />
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--ui-color-border, #e5e7eb);
      color: var(--ui-color-text, #111827);
      letter-spacing: -0.01em;
    }
    .section-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  `],
})
class ShowcaseAllComponent {
  private toast = inject(LlmToastService);

  readonly cardVariants = ['elevated', 'outlined', 'flat'] as const;

  readonly dialogOpen = signal(false);
  readonly drawerOpen = signal(false);
  readonly checkboxChecked = signal(false);
  readonly toggleOn = signal(true);
  readonly radioValue = signal('pro');
  readonly selectValue = signal('');
  readonly inputValue = signal('');
  readonly textareaValue = signal('');
  readonly page = signal(3);
  readonly tabIndex = signal(0);

  showToast(message: string, variant: 'success' | 'danger' | 'info' | 'warning') {
    this.toast.show(message, { variant });
  }
}

// ─── Story ───────────────────────────────────────────────────────────────────

const meta: Meta<ShowcaseAllComponent> = {
  title: 'Showcase/All Components',
  component: ShowcaseAllComponent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<ShowcaseAllComponent>;

export const AllComponents: Story = {};
