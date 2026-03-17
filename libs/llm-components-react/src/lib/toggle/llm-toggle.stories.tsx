import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmToggle } from './llm-toggle';

const meta: Meta<typeof LlmToggle> = {
  title: 'Components/LlmToggle',
  component: LlmToggle,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: { checked: false, disabled: false, invalid: false },
};

export default meta;
type Story = StoryObj<typeof LlmToggle>;

export const Default: Story = {
  args: { children: 'Enable notifications' },
};

export const Checked: Story = {
  args: { checked: true, children: 'Enabled' },
};

export const Unchecked: Story = {
  args: { checked: false, children: 'Disabled' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled toggle' },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true, children: 'Disabled (on)' },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    errors: ['This setting is required'],
    children: 'Accept terms',
  },
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <LlmToggle checked={checked} onCheckedChange={setChecked}>
        {checked ? 'On' : 'Off'}
      </LlmToggle>
    );
  },
};

export const SettingsPanel: Story = {
  render: () => {
    const [email, setEmail] = useState(true);
    const [push, setPush] = useState(false);
    const [sms, setSms] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        <LlmToggle checked={email} onCheckedChange={setEmail}>
          Email notifications
        </LlmToggle>
        <LlmToggle checked={push} onCheckedChange={setPush}>
          Push notifications
        </LlmToggle>
        <LlmToggle checked={sms} onCheckedChange={setSms}>
          SMS notifications
        </LlmToggle>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <LlmToggle>Default (off)</LlmToggle>
      <LlmToggle checked>Default (on)</LlmToggle>
      <LlmToggle disabled>Disabled (off)</LlmToggle>
      <LlmToggle disabled checked>Disabled (on)</LlmToggle>
      <LlmToggle invalid>Invalid</LlmToggle>
    </div>
  ),
};
