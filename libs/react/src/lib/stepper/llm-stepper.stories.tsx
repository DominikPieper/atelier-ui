import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmStepper, LlmStep, useLlmStepper } from './llm-stepper';
import { LlmButton } from '../button/llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmStepper> = {
  title: 'Components/Navigation/LlmStepper',
  component: LlmStepper,
  tags: ['autodocs'],
  parameters: { design: figmaNode('421-505') },
};

export default meta;
type Story = StoryObj<typeof LlmStepper>;

function NavigableStepper({ orientation = 'horizontal' as const, linear = false }) {
  const [step, setStep] = useState(0);
  return (
    <LlmStepper activeStep={step} onActiveStepChange={setStep} orientation={orientation} linear={linear}>
      <LlmStep label="Account" description="Basic info">
        <p>Fill in your account details.</p>
        <LlmButton variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>Next</LlmButton>
      </LlmStep>
      <LlmStep label="Profile">
        <p>Set up your profile.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <LlmButton variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>Back</LlmButton>
          <LlmButton variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>Next</LlmButton>
        </div>
      </LlmStep>
      <LlmStep label="Review">
        <p>Review and confirm.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <LlmButton variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>Back</LlmButton>
          <LlmButton variant="primary" size="sm">Submit</LlmButton>
        </div>
      </LlmStep>
    </LlmStepper>
  );
}

export const Default: Story = {
  render: () => <NavigableStepper />,
  parameters: { design: figmaNode('421-407') },
};

export const WithCompletedSteps: Story = {
  render: () => (
    <LlmStepper activeStep={1}>
      <LlmStep label="Account" completed>Account content</LlmStep>
      <LlmStep label="Profile">Profile content</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  ),
  parameters: { design: figmaNode('421-427') },
};

export const WithErrorStep: Story = {
  render: () => (
    <LlmStepper activeStep={2}>
      <LlmStep label="Account" completed>Account content</LlmStep>
      <LlmStep label="Profile" error>Profile had an error</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  ),
  parameters: { design: figmaNode('421-446') },
};

export const WithOptionalStep: Story = {
  render: () => (
    <LlmStepper>
      <LlmStep label="Account">Account content</LlmStep>
      <LlmStep label="Profile" optional>Profile content</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  ),
  parameters: { design: figmaNode('421-465') },
};

export const Vertical: Story = {
  render: () => <NavigableStepper orientation="vertical" />,
  parameters: { design: figmaNode('421-485') },
};

function StepWithHook({ label, children }: { label: string; children: React.ReactNode }) {
  const { next, prev } = useLlmStepper();
  return (
    <LlmStep label={label}>
      <p>{children}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <LlmButton variant="outline" size="sm" onClick={prev}>Back</LlmButton>
        <LlmButton variant="primary" size="sm" onClick={next}>Next</LlmButton>
      </div>
    </LlmStep>
  );
}

export const WithHook: Story = {
  render: () => (
    <LlmStepper>
      <StepWithHook label="Step 1">First step content.</StepWithHook>
      <StepWithHook label="Step 2">Second step content.</StepWithHook>
      <StepWithHook label="Step 3">Third step content.</StepWithHook>
    </LlmStepper>
  ),
  parameters: { design: figmaNode('421-407') },
};
