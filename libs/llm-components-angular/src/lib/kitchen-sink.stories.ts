import type { Meta, StoryObj } from '@storybook/angular';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LlmButton } from './button/llm-button';
import {
  LlmCard,
  LlmCardHeader,
  LlmCardContent,
  LlmCardFooter,
} from './card/llm-card';
import { LlmBadge } from './badge/llm-badge';
import { LlmInput } from './input/llm-input';
import { LlmTextarea } from './textarea/llm-textarea';
import { LlmCheckbox } from './checkbox/llm-checkbox';
import { LlmRadioGroup } from './radio-group/llm-radio-group';
import { LlmRadio } from './radio/llm-radio';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'kitchen-sink-demo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LlmButton,
    LlmCard,
    LlmCardHeader,
    LlmCardContent,
    LlmCardFooter,
    LlmBadge,
    LlmInput,
    LlmTextarea,
    LlmCheckbox,
    LlmRadioGroup,
    LlmRadio,
  ],
  template: `
    <!-- eslint-disable @angular-eslint/template/label-has-associated-control -->
    <div class="kitchen-sink">
      <h1 class="page-title">Account Settings</h1>
      <p class="page-subtitle">Manage your profile and preferences.</p>

      <!-- Profile card -->
      <llm-card variant="elevated" padding="lg">
        <llm-card-header>
          <div class="header-row">
            Profile Information
            <llm-badge variant="success" size="sm">Active</llm-badge>
          </div>
        </llm-card-header>
        <llm-card-content>
          <div class="form-grid">
            <div class="form-field">
              <label class="field-label">Full Name</label>
              <llm-input type="text" placeholder="John Doe" />
            </div>
            <div class="form-field">
              <label class="field-label">Email</label>
              <llm-input type="email" placeholder="john@example.com" />
            </div>
          </div>
          <div class="form-field" style="margin-top: 1rem;">
            <label class="field-label">Bio</label>
            <llm-textarea placeholder="Tell us about yourself..." [rows]="3" />
          </div>
        </llm-card-content>
        <llm-card-footer>
          <llm-button variant="primary" size="md">Save Changes</llm-button>
          <llm-button variant="outline" size="md">Cancel</llm-button>
        </llm-card-footer>
      </llm-card>

      <!-- Preferences card -->
      <llm-card variant="outlined" padding="lg" style="margin-top: 1.5rem;">
        <llm-card-header>Preferences</llm-card-header>
        <llm-card-content>
          <div class="preferences-list">
            <llm-checkbox>Enable email notifications</llm-checkbox>
            <llm-checkbox>Show profile publicly</llm-checkbox>
            <llm-checkbox [checked]="true">Enable two-factor authentication</llm-checkbox>
          </div>

          <div class="form-field" style="margin-top: 1.5rem;">
            <label class="field-label">Theme</label>
            <llm-radio-group name="theme" value="system">
              <div class="radio-list">
                <llm-radio radioValue="light">Light</llm-radio>
                <llm-radio radioValue="dark">Dark</llm-radio>
                <llm-radio radioValue="system">System</llm-radio>
              </div>
            </llm-radio-group>
          </div>
        </llm-card-content>
      </llm-card>

      <!-- Status badges showcase -->
      <llm-card variant="flat" padding="md" style="margin-top: 1.5rem;">
        <llm-card-content>
          <label class="field-label">Account Status</label>
          <div class="badge-row">
            <llm-badge variant="success">Verified</llm-badge>
            <llm-badge variant="info">Pro Plan</llm-badge>
            <llm-badge variant="warning">Storage 80%</llm-badge>
            <llm-badge variant="default">v2.4.1</llm-badge>
          </div>
        </llm-card-content>
      </llm-card>

      <!-- Button variants -->
      <div class="button-showcase" style="margin-top: 1.5rem;">
        <llm-button variant="primary" size="lg">Get Started</llm-button>
        <llm-button variant="secondary" size="md">Learn More</llm-button>
        <llm-button variant="outline" size="sm">View Docs</llm-button>
        <llm-button variant="primary" [loading]="true" size="md">Saving</llm-button>
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
