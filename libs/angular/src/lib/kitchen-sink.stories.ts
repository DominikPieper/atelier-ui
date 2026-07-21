import type { Meta, StoryObj } from '@storybook/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AtlButton } from './button/atl-button';
import {
  AtlCard,
  AtlCardHeader,
  AtlCardContent,
  AtlCardFooter,
} from './card/atl-card';
import { AtlBadge } from './badge/atl-badge';
import { AtlInput } from './input/atl-input';
import { AtlTextarea } from './textarea/atl-textarea';
import { AtlCheckbox } from './checkbox/atl-checkbox';
import { AtlRadioGroup } from './radio-group/atl-radio-group';
import { AtlRadio } from './radio/atl-radio';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'kitchen-sink-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AtlButton,
    AtlCard,
    AtlCardHeader,
    AtlCardContent,
    AtlCardFooter,
    AtlBadge,
    AtlInput,
    AtlTextarea,
    AtlCheckbox,
    AtlRadioGroup,
    AtlRadio,
  ],
  template: `
    <!-- eslint-disable @angular-eslint/template/label-has-associated-control -->
    <div class="kitchen-sink">
      <h1 class="page-title">Account Settings</h1>
      <p class="page-subtitle">Manage your profile and preferences.</p>

      <!-- Profile card -->
      <atl-card variant="elevated" padding="lg">
        <atl-card-header>
          <div class="header-row">
            Profile Information
            <atl-badge variant="success" size="sm">Active</atl-badge>
          </div>
        </atl-card-header>
        <atl-card-content>
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
          <div class="form-field" style="margin-top: 1rem;">
            <label class="field-label">Bio</label>
            <atl-textarea placeholder="Tell us about yourself..." [rows]="3" />
          </div>
        </atl-card-content>
        <atl-card-footer>
          <atl-button variant="primary" size="md">Save Changes</atl-button>
          <atl-button variant="outline" size="md">Cancel</atl-button>
        </atl-card-footer>
      </atl-card>

      <!-- Preferences card -->
      <atl-card variant="outlined" padding="lg" style="margin-top: 1.5rem;">
        <atl-card-header>Preferences</atl-card-header>
        <atl-card-content>
          <div class="preferences-list">
            <atl-checkbox>Enable email notifications</atl-checkbox>
            <atl-checkbox>Show profile publicly</atl-checkbox>
            <atl-checkbox [checked]="true">Enable two-factor authentication</atl-checkbox>
          </div>

          <div class="form-field" style="margin-top: 1.5rem;">
            <label class="field-label">Theme</label>
            <atl-radio-group name="theme" value="system">
              <div class="radio-list">
                <atl-radio radioValue="light">Light</atl-radio>
                <atl-radio radioValue="dark">Dark</atl-radio>
                <atl-radio radioValue="system">System</atl-radio>
              </div>
            </atl-radio-group>
          </div>
        </atl-card-content>
      </atl-card>

      <!-- Status badges showcase -->
      <atl-card variant="flat" padding="md" style="margin-top: 1.5rem;">
        <atl-card-content>
          <label class="field-label">Account Status</label>
          <div class="badge-row">
            <atl-badge variant="success">Verified</atl-badge>
            <atl-badge variant="info">Pro Plan</atl-badge>
            <atl-badge variant="warning">Storage 80%</atl-badge>
            <atl-badge variant="default">v2.4.1</atl-badge>
          </div>
        </atl-card-content>
      </atl-card>

      <!-- Button variants -->
      <div class="button-showcase" style="margin-top: 1.5rem;">
        <atl-button variant="primary" size="lg">Get Started</atl-button>
        <atl-button variant="secondary" size="md">Learn More</atl-button>
        <atl-button variant="outline" size="sm">View Docs</atl-button>
        <atl-button variant="primary" [loading]="true" size="md">Saving</atl-button>
      </div>
    </div>
  `,
  styles: [
    `
      .kitchen-sink {
        max-width: 640px;
        margin: 0 auto;
        padding: 2rem;
      }
      .page-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ui-color-text);
        margin: 0 0 0.25rem;
      }
      .page-subtitle {
        font-size: 0.9375rem;
        color: var(--ui-color-text-muted);
        margin: 0 0 1.5rem;
      }
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
      }
      .field-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--ui-color-text);
      }
      .preferences-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .radio-list {
        display: flex;
        gap: 1.5rem;
      }
      .badge-row {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }
      .button-showcase {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
class KitchenSinkDemoComponent {}

const meta: Meta<KitchenSinkDemoComponent> = {
  title: 'Showcase/Kitchen Sink',
  component: KitchenSinkDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<KitchenSinkDemoComponent>;

export const Default: Story = {};
