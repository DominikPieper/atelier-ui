import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlStepper, AtlStep, useAtlStepper } from './atl-stepper';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/stepper.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlStepper> = {
  title: 'Components/Navigation/AtlStepper',
  component: AtlStepper,
  tags: ['autodocs'],
  parameters: { design: figmaNode('421-505'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlStepper>;

function NavigableStepper({ orientation = 'horizontal' as const, linear = false }) {
  const [step, setStep] = useState(0);
  return (
    <AtlStepper activeStep={step} onActiveStepChange={setStep} orientation={orientation} linear={linear}>
      <AtlStep label="Account" description="Basic info">
        <p>Fill in your account details.</p>
        <AtlButton variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>Next</AtlButton>
      </AtlStep>
      <AtlStep label="Profile">
        <p>Set up your profile.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <AtlButton variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>Back</AtlButton>
          <AtlButton variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>Next</AtlButton>
        </div>
      </AtlStep>
      <AtlStep label="Review">
        <p>Review and confirm.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <AtlButton variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>Back</AtlButton>
          <AtlButton variant="primary" size="sm">Submit</AtlButton>
        </div>
      </AtlStep>
    </AtlStepper>
  );
}

export const Default: Story = {
  render: () => <NavigableStepper />,
  parameters: { design: figmaNode('421-407') },
};

export const WithCompletedSteps: Story = {
  render: () => (
    <AtlStepper activeStep={1}>
      <AtlStep label="Account" completed>Account content</AtlStep>
      <AtlStep label="Profile">Profile content</AtlStep>
      <AtlStep label="Review">Review content</AtlStep>
    </AtlStepper>
  ),
  parameters: { design: figmaNode('421-427') },
};

export const WithErrorStep: Story = {
  render: () => (
    <AtlStepper activeStep={2}>
      <AtlStep label="Account" completed>Account content</AtlStep>
      <AtlStep label="Profile" error>Profile had an error</AtlStep>
      <AtlStep label="Review">Review content</AtlStep>
    </AtlStepper>
  ),
  parameters: { design: figmaNode('421-446') },
};

export const WithOptionalStep: Story = {
  render: () => (
    <AtlStepper>
      <AtlStep label="Account">Account content</AtlStep>
      <AtlStep label="Profile" optional>Profile content</AtlStep>
      <AtlStep label="Review">Review content</AtlStep>
    </AtlStepper>
  ),
  parameters: { design: figmaNode('421-465') },
};

export const Vertical: Story = {
  render: () => <NavigableStepper orientation="vertical" />,
  parameters: { design: figmaNode('421-485') },
};

function StepWithHook({ label, children }: { label: string; children: React.ReactNode }) {
  const { next, prev } = useAtlStepper();
  return (
    <AtlStep label={label}>
      <p>{children}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <AtlButton variant="outline" size="sm" onClick={prev}>Back</AtlButton>
        <AtlButton variant="primary" size="sm" onClick={next}>Next</AtlButton>
      </div>
    </AtlStep>
  );
}

export const WithHook: Story = {
  render: () => (
    <AtlStepper>
      <StepWithHook label="Step 1">First step content.</StepWithHook>
      <StepWithHook label="Step 2">Second step content.</StepWithHook>
      <StepWithHook label="Step 3">Third step content.</StepWithHook>
    </AtlStepper>
  ),
  parameters: { design: figmaNode('421-407') },
};
