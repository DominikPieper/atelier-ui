import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmStepper, LlmStep, useLlmStepper } from './llm-stepper';
import { LlmButton } from '../button/llm-button';

const meta: Meta<typeof LlmStepper> = {
  title: 'Components/LlmStepper',
  component: LlmStepper,
  tags: ['autodocs'],
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
};

export const WithCompletedSteps: Story = {
  render: () => (
    <LlmStepper activeStep={1}>
      <LlmStep label="Account" completed>Account content</LlmStep>
      <LlmStep label="Profile">Profile content</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  ),
};

export const WithErrorStep: Story = {
  render: () => (
    <LlmStepper activeStep={2}>
      <LlmStep label="Account" completed>Account content</LlmStep>
      <LlmStep label="Profile" error>Profile had an error</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  ),
};

export const WithOptionalStep: Story = {
  render: () => (
    <LlmStepper>
      <LlmStep label="Account">Account content</LlmStep>
      <LlmStep label="Profile" optional>Profile content</LlmStep>
      <LlmStep label="Review">Review content</LlmStep>
    </LlmStepper>
  ),
};

export const Vertical: Story = {
  render: () => <NavigableStepper orientation="vertical" />,
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
};
