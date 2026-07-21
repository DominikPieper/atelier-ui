import type { Meta, StoryObj } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader } from '../accordion/atl-accordion';
import { AtlAlert } from '../alert/atl-alert';
import { AtlAvatar, AtlAvatarGroup } from '../avatar/atl-avatar';
import { AtlBadge } from '../badge/atl-badge';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from '../breadcrumbs/atl-breadcrumbs';
import { AtlButton } from '../button/atl-button';
import { AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter } from '../card/atl-card';
import { AtlCheckbox } from '../checkbox/atl-checkbox';
import { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter } from '../dialog/atl-dialog';
import { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter } from '../drawer/atl-drawer';
import { AtlInput } from '../input/atl-input';
import { AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger } from '../menu/atl-menu';
import { AtlPagination } from '../pagination/atl-pagination';
import { AtlProgress } from '../progress/atl-progress';
import { AtlRadioGroup } from '../radio-group/atl-radio-group';
import { AtlRadio } from '../radio/atl-radio';
import { AtlSelect } from '../select/atl-select';
import { AtlOption } from '../select/atl-option';
import { AtlSkeleton } from '../skeleton/atl-skeleton';
import { AtlTabGroup, AtlTab } from '../tabs/atl-tabs';
import { AtlTextarea } from '../textarea/atl-textarea';
import { AtlToastService, AtlToastContainer } from '../toast/atl-toast';
import { AtlToggle } from '../toggle/atl-toggle';
import { AtlTooltip } from '../tooltip/atl-tooltip';

@Component({
  selector: 'atl-showcase-all',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader,
    AtlAlert,
    AtlAvatar, AtlAvatarGroup,
    AtlBadge,
    AtlBreadcrumbs, AtlBreadcrumbItem,
    AtlButton,
    AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter,
    AtlCheckbox,
    AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter,
    AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter,
    AtlInput,
    AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger,
    AtlPagination,
    AtlProgress,
    AtlRadioGroup, AtlRadio,
    AtlSelect, AtlOption,
    AtlSkeleton,
    AtlTabGroup, AtlTab,
    AtlTextarea,
    AtlToastContainer,
    AtlToggle,
    AtlTooltip,
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
            <atl-button variant="primary">Primary</atl-button>
            <atl-button variant="secondary">Secondary</atl-button>
            <atl-button variant="outline">Outline</atl-button>
            <atl-button variant="primary" [disabled]="true">Disabled</atl-button>
            <atl-button variant="primary" [loading]="true">Loading</atl-button>
          </div>
          <div class="row">
            <atl-button size="sm">Small</atl-button>
            <atl-button size="md">Medium</atl-button>
            <atl-button size="lg">Large</atl-button>
          </div>
        </div>
      </section>

      <!-- ── Badge ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Badge</h2>
        <div class="section-body">
          <div class="row">
            <atl-badge variant="default">Default</atl-badge>
            <atl-badge variant="success">Success</atl-badge>
            <atl-badge variant="warning">Warning</atl-badge>
            <atl-badge variant="danger">Danger</atl-badge>
            <atl-badge variant="info">Info</atl-badge>
            <atl-badge variant="success" size="sm">Small</atl-badge>
          </div>
        </div>
      </section>

      <!-- ── Avatar ──────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Avatar &amp; AvatarGroup</h2>
        <div class="section-body">
          <div class="row">
            <atl-avatar name="Alice Chen" size="xs" />
            <atl-avatar name="Bob Smith" size="sm" status="online" />
            <atl-avatar name="Carol Jones" size="md" status="away" />
            <atl-avatar name="Dave Brown" size="lg" shape="square" />
            <atl-avatar name="Eve Wilson" size="xl" status="busy" />
          </div>
          <div class="row">
            <atl-avatar-group [max]="3" size="md">
              <atl-avatar name="Alice Chen" />
              <atl-avatar name="Bob Smith" />
              <atl-avatar name="Carol Jones" />
              <atl-avatar name="Dave Brown" />
              <atl-avatar name="Eve Wilson" />
            </atl-avatar-group>
          </div>
        </div>
      </section>

      <!-- ── Alert ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Alert</h2>
        <div class="section-body">
          <atl-alert variant="info">This is an info alert.</atl-alert>
          <atl-alert variant="success">Your changes were saved successfully.</atl-alert>
          <atl-alert variant="warning">Your session will expire in 5 minutes.</atl-alert>
          <atl-alert variant="danger">Something went wrong. Please try again.</atl-alert>
          <atl-alert variant="info" [dismissible]="true">This alert can be dismissed.</atl-alert>
        </div>
      </section>

      <!-- ── Card ────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Card</h2>
        <div class="section-body">
          <div class="row" style="align-items: stretch; flex-wrap: wrap;">
            @for (v of cardVariants; track v) {
              <atl-card [variant]="v" padding="md" style="flex: 1; min-width: 180px;">
                <atl-card-header>{{ v | titlecase }}</atl-card-header>
                <atl-card-content>Card content goes here.</atl-card-content>
                <atl-card-footer>
                  <atl-button size="sm">Action</atl-button>
                </atl-card-footer>
              </atl-card>
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
              <atl-input placeholder="Text input" [(value)]="inputValue" />
            </div>
            <div style="flex: 1; min-width: 180px;">
              <atl-input type="email" placeholder="Email input" />
            </div>
            <div style="flex: 1; min-width: 180px;">
              <atl-input placeholder="Invalid state" [invalid]="true" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Textarea ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Textarea</h2>
        <div class="section-body">
          <atl-textarea placeholder="Write something here…" [rows]="3" [(value)]="textareaValue" />
          <atl-textarea placeholder="Auto-resize" [autoResize]="true" />
        </div>
      </section>

      <!-- ── Checkbox ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Checkbox</h2>
        <div class="section-body">
          <div class="row">
            <atl-checkbox [(checked)]="checkboxChecked">Accept terms and conditions</atl-checkbox>
            <atl-checkbox [checked]="true" [indeterminate]="true">Indeterminate</atl-checkbox>
            <atl-checkbox [checked]="true" [disabled]="true">Disabled</atl-checkbox>
          </div>
        </div>
      </section>

      <!-- ── Toggle ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Toggle</h2>
        <div class="section-body">
          <div class="row">
            <atl-toggle [(checked)]="toggleOn">Enable notifications</atl-toggle>
            <atl-toggle [checked]="false" [disabled]="true">Disabled</atl-toggle>
          </div>
        </div>
      </section>

      <!-- ── RadioGroup ────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">RadioGroup</h2>
        <div class="section-body">
          <atl-radio-group [(value)]="radioValue" name="plan">
            <div class="row">
              <atl-radio radioValue="free">Free</atl-radio>
              <atl-radio radioValue="pro">Pro</atl-radio>
              <atl-radio radioValue="enterprise">Enterprise</atl-radio>
              <atl-radio radioValue="legacy" [disabled]="true">Legacy (disabled)</atl-radio>
            </div>
          </atl-radio-group>
        </div>
      </section>

      <!-- ── Select ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Select</h2>
        <div class="section-body">
          <div style="max-width: 300px;">
            <atl-select [(value)]="selectValue" placeholder="Select a country">
              <atl-option optionValue="us">United States</atl-option>
              <atl-option optionValue="ca">Canada</atl-option>
              <atl-option optionValue="uk">United Kingdom</atl-option>
              <atl-option optionValue="de">Germany</atl-option>
              <atl-option optionValue="jp" [disabled]="true">Japan (unavailable)</atl-option>
            </atl-select>
          </div>
        </div>
      </section>

      <!-- ── Progress ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Progress</h2>
        <div class="section-body">
          <atl-progress [value]="20" />
          <atl-progress [value]="50" variant="success" />
          <atl-progress [value]="75" variant="warning" />
          <atl-progress [value]="90" variant="danger" size="lg" />
          <atl-progress [indeterminate]="true" />
        </div>
      </section>

      <!-- ── Skeleton ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Skeleton</h2>
        <div class="section-body">
          <div style="display: flex; gap: 1rem; align-items: center;">
            <atl-skeleton variant="circular" width="48px" />
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;">
              <atl-skeleton variant="text" width="40%" />
              <atl-skeleton variant="text" />
              <atl-skeleton variant="text" width="70%" />
            </div>
          </div>
          <atl-skeleton variant="rectangular" height="80px" />
        </div>
      </section>

      <!-- ── Tabs ──────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Tabs</h2>
        <div class="section-body">
          <atl-tab-group [(selectedIndex)]="tabIndex">
            <atl-tab label="Overview">Overview — general information about the item.</atl-tab>
            <atl-tab label="Details">Detailed specifications and technical information.</atl-tab>
            <atl-tab label="History">Historical records and activity log.</atl-tab>
            <atl-tab label="Disabled" [disabled]="true">Not accessible.</atl-tab>
          </atl-tab-group>
          <atl-tab-group variant="pills">
            <atl-tab label="All">All items shown here.</atl-tab>
            <atl-tab label="Active">Only active items.</atl-tab>
            <atl-tab label="Archived">Archived items.</atl-tab>
          </atl-tab-group>
        </div>
      </section>

      <!-- ── Accordion ─────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Accordion</h2>
        <div class="section-body">
          <atl-accordion-group variant="bordered">
            <atl-accordion-item>
              <span atlAccordionHeader>What is this component library?</span>
              A set of accessible, composable UI components built for LLM-generated applications.
            </atl-accordion-item>
            <atl-accordion-item>
              <span atlAccordionHeader>How do I get started?</span>
              Import any component from <code>@atelier-ui/angular</code>.
            </atl-accordion-item>
            <atl-accordion-item [disabled]="true">
              <span atlAccordionHeader>Disabled section</span>
              This is not accessible.
            </atl-accordion-item>
          </atl-accordion-group>
        </div>
      </section>

      <!-- ── Breadcrumbs ───────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Breadcrumbs</h2>
        <div class="section-body">
          <atl-breadcrumbs>
            <atl-breadcrumb-item href="#">Home</atl-breadcrumb-item>
            <atl-breadcrumb-item href="#">Products</atl-breadcrumb-item>
            <atl-breadcrumb-item href="#">Category</atl-breadcrumb-item>
            <atl-breadcrumb-item>Current Page</atl-breadcrumb-item>
          </atl-breadcrumbs>
        </div>
      </section>

      <!-- ── Pagination ────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Pagination</h2>
        <div class="section-body">
          <atl-pagination [(page)]="page" [pageCount]="10" />
        </div>
      </section>

      <!-- ── Tooltip ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Tooltip</h2>
        <div class="section-body">
          <div class="row">
            <atl-button variant="outline" size="sm" atlTooltip="Appears above (default)">Above</atl-button>
            <atl-button variant="outline" size="sm" atlTooltip="Appears below" atlTooltipPosition="below">Below</atl-button>
            <atl-button variant="outline" size="sm" atlTooltip="Appears to the right" atlTooltipPosition="right">Right</atl-button>
            <atl-button variant="outline" size="sm" atlTooltip="Appears to the left" atlTooltipPosition="left">Left</atl-button>
          </div>
        </div>
      </section>

      <!-- ── Menu ─────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Menu</h2>
        <div class="section-body">
          <div class="row">
            <atl-button variant="outline" size="sm" [atlMenuTriggerFor]="actionsMenu">Open Menu ▾</atl-button>
            <ng-template #actionsMenu>
              <atl-menu>
                <atl-menu-item>Edit</atl-menu-item>
                <atl-menu-item>Duplicate</atl-menu-item>
                <atl-menu-separator />
                <atl-menu-item>Archive</atl-menu-item>
                <atl-menu-item [disabled]="true">Delete (disabled)</atl-menu-item>
              </atl-menu>
            </ng-template>
          </div>
        </div>
      </section>

      <!-- ── Dialog ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Dialog</h2>
        <div class="section-body">
          <div class="row">
            <atl-button (click)="dialogOpen.set(true)">Open Dialog</atl-button>
          </div>
          <atl-dialog [(open)]="dialogOpen" size="sm">
            <atl-dialog-header>Confirm Action</atl-dialog-header>
            <atl-dialog-content>
              Are you sure you want to proceed? This action cannot be undone.
            </atl-dialog-content>
            <atl-dialog-footer>
              <atl-button variant="outline" (click)="dialogOpen.set(false)">Cancel</atl-button>
              <atl-button variant="primary" (click)="dialogOpen.set(false)">Confirm</atl-button>
            </atl-dialog-footer>
          </atl-dialog>
        </div>
      </section>

      <!-- ── Drawer ───────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Drawer</h2>
        <div class="section-body">
          <div class="row">
            <atl-button variant="outline" (click)="drawerOpen.set(true)">Open Drawer</atl-button>
          </div>
          <atl-drawer [(open)]="drawerOpen" position="right" size="md">
            <atl-drawer-header>Settings Panel</atl-drawer-header>
            <atl-drawer-content>
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <atl-input placeholder="Display name" />
                <atl-toggle [(checked)]="toggleOn">Email notifications</atl-toggle>
                <atl-toggle [checked]="false">Push notifications</atl-toggle>
              </div>
            </atl-drawer-content>
            <atl-drawer-footer>
              <atl-button variant="outline" (click)="drawerOpen.set(false)">Cancel</atl-button>
              <atl-button (click)="drawerOpen.set(false)">Save</atl-button>
            </atl-drawer-footer>
          </atl-drawer>
        </div>
      </section>

      <!-- ── Toast ────────────────────────────────────────────────── -->
      <section style="margin-bottom: 3rem;">
        <h2 class="section-title">Toast</h2>
        <div class="section-body">
          <div class="row">
            <atl-button size="sm" (click)="showToast('Saved!', 'success')">Success</atl-button>
            <atl-button size="sm" variant="secondary" (click)="showToast('Something went wrong', 'danger')">Danger</atl-button>
            <atl-button size="sm" variant="outline" (click)="showToast('New message', 'info')">Info</atl-button>
            <atl-button size="sm" variant="outline" (click)="showToast('Check your settings', 'warning')">Warning</atl-button>
          </div>
        </div>
      </section>

      <atl-toast-container position="bottom-right" />
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
  private readonly toast = inject(AtlToastService);

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

  showToast(message: string, variant: 'success' | 'danger' | 'info' | 'warning'): void {
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
