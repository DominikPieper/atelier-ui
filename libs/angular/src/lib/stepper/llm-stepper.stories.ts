import type { Meta, StoryObj } from '@storybook/angular';
import { LlmStepper, LlmStep } from './llm-stepper';
import { LlmButton } from '../button/llm-button';

const meta: Meta<LlmStepper> = {
  title: 'Components/LlmStepper',
  component: LlmStepper,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    linear: { control: 'boolean' },
    activeStep: { control: 'number' },
  },
  args: {
    orientation: 'horizontal',
    linear: false,
    activeStep: 0,
  },
};

export default meta;
type Story = StoryObj<LlmStepper>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [LlmStepper, LlmStep, LlmButton] },
    template: `
      <llm-stepper [orientation]="orientation" [linear]="linear" [(activeStep)]="activeStep">
        <llm-step label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <llm-button variant="primary" size="sm" (click)="activeStep = activeStep + 1">Next</llm-button>
        </llm-step>
        <llm-step label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px">
            <llm-button variant="outline" size="sm" (click)="activeStep = activeStep - 1">Back</llm-button>
            <llm-button variant="primary" size="sm" (click)="activeStep = activeStep + 1">Next</llm-button>
          </div>
        </llm-step>
        <llm-step label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px">
            <llm-button variant="outline" size="sm" (click)="activeStep = activeStep - 1">Back</llm-button>
            <llm-button variant="primary" size="sm">Submit</llm-button>
          </div>
        </llm-step>
      </llm-stepper>
    `,
  }),
};

export const WithCompletedSteps: Story = {
  render: () => ({
    moduleMetadata: { imports: [LlmStepper, LlmStep] },
    template: `
      <llm-stepper [activeStep]="1">
        <llm-step label="Account" [completed]="true">Account content</llm-step>
        <llm-step label="Profile">Profile content</llm-step>
        <llm-step label="Review">Review content</llm-step>
      </llm-stepper>
    `,
  }),
};

export const WithErrorStep: Story = {
  render: () => ({
    moduleMetadata: { imports: [LlmStepper, LlmStep] },
    template: `
      <llm-stepper [activeStep]="2">
        <llm-step label="Account" [completed]="true">Account content</llm-step>
        <llm-step label="Profile" [error]="true">Profile had an error</llm-step>
        <llm-step label="Review">Review content</llm-step>
      </llm-stepper>
    `,
  }),
};

export const WithOptionalStep: Story = {
  render: () => ({
    moduleMetadata: { imports: [LlmStepper, LlmStep] },
    template: `
      <llm-stepper>
        <llm-step label="Account">Account content</llm-step>
        <llm-step label="Profile" [optional]="true">Profile content</llm-step>
        <llm-step label="Review">Review content</llm-step>
      </llm-stepper>
    `,
  }),
};

export const Vertical: Story = {
  render: (args) => ({
    props: { ...args, step: 0 },
    moduleMetadata: { imports: [LlmStepper, LlmStep, LlmButton] },
    template: `
      <llm-stepper orientation="vertical" [(activeStep)]="step">
        <llm-step label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <llm-button variant="primary" size="sm" (click)="step = step + 1" style="margin-top:8px">Next</llm-button>
        </llm-step>
        <llm-step label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <llm-button variant="outline" size="sm" (click)="step = step - 1">Back</llm-button>
            <llm-button variant="primary" size="sm" (click)="step = step + 1">Next</llm-button>
          </div>
        </llm-step>
        <llm-step label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <llm-button variant="outline" size="sm" (click)="step = step - 1">Back</llm-button>
            <llm-button variant="primary" size="sm">Submit</llm-button>
          </div>
        </llm-step>
      </llm-stepper>
    `,
  }),
};
