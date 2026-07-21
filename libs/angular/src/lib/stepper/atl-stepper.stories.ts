import type { Meta, StoryObj } from '@storybook/angular';
import { AtlStepper, AtlStep } from './atl-stepper';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/stepper.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlStepper> = {
  title: 'Components/Navigation/AtlStepper',
  component: AtlStepper,
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
  parameters: { design: figmaNode('421-505'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<AtlStepper>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [AtlStepper, AtlStep, AtlButton] },
    template: `
      <atl-stepper [orientation]="orientation" [linear]="linear" [(activeStep)]="activeStep">
        <atl-step label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <atl-button variant="primary" size="sm" (click)="activeStep = activeStep + 1">Next</atl-button>
        </atl-step>
        <atl-step label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px">
            <atl-button variant="outline" size="sm" (click)="activeStep = activeStep - 1">Back</atl-button>
            <atl-button variant="primary" size="sm" (click)="activeStep = activeStep + 1">Next</atl-button>
          </div>
        </atl-step>
        <atl-step label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px">
            <atl-button variant="outline" size="sm" (click)="activeStep = activeStep - 1">Back</atl-button>
            <atl-button variant="primary" size="sm">Submit</atl-button>
          </div>
        </atl-step>
      </atl-stepper>
    `,
  }),
  parameters: { design: figmaNode('421-407') },
};

export const WithCompletedSteps: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlStepper, AtlStep] },
    template: `
      <atl-stepper [activeStep]="1">
        <atl-step label="Account" [completed]="true">Account content</atl-step>
        <atl-step label="Profile">Profile content</atl-step>
        <atl-step label="Review">Review content</atl-step>
      </atl-stepper>
    `,
  }),
  parameters: { design: figmaNode('421-427') },
};

export const WithErrorStep: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlStepper, AtlStep] },
    template: `
      <atl-stepper [activeStep]="2">
        <atl-step label="Account" [completed]="true">Account content</atl-step>
        <atl-step label="Profile" [error]="true">Profile had an error</atl-step>
        <atl-step label="Review">Review content</atl-step>
      </atl-stepper>
    `,
  }),
  parameters: { design: figmaNode('421-446') },
};

export const WithOptionalStep: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlStepper, AtlStep] },
    template: `
      <atl-stepper>
        <atl-step label="Account">Account content</atl-step>
        <atl-step label="Profile" [optional]="true">Profile content</atl-step>
        <atl-step label="Review">Review content</atl-step>
      </atl-stepper>
    `,
  }),
  parameters: { design: figmaNode('421-465') },
};

export const Vertical: Story = {
  render: (args) => ({
    props: { ...args, step: 0 },
    moduleMetadata: { imports: [AtlStepper, AtlStep, AtlButton] },
    template: `
      <atl-stepper orientation="vertical" [(activeStep)]="step">
        <atl-step label="Account" description="Basic info">
          <p>Fill in your account details.</p>
          <atl-button variant="primary" size="sm" (click)="step = step + 1" style="margin-top:8px">Next</atl-button>
        </atl-step>
        <atl-step label="Profile">
          <p>Set up your profile.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <atl-button variant="outline" size="sm" (click)="step = step - 1">Back</atl-button>
            <atl-button variant="primary" size="sm" (click)="step = step + 1">Next</atl-button>
          </div>
        </atl-step>
        <atl-step label="Review">
          <p>Review and confirm.</p>
          <div style="display:flex;gap:8px;margin-top:8px">
            <atl-button variant="outline" size="sm" (click)="step = step - 1">Back</atl-button>
            <atl-button variant="primary" size="sm">Submit</atl-button>
          </div>
        </atl-step>
      </atl-stepper>
    `,
  }),
  parameters: { design: figmaNode('421-485') },
};
