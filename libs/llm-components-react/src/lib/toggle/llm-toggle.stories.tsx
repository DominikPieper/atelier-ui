import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmToggle } from './llm-toggle';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

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
  parameters: {
    design: figmaNode('3-775'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmToggle>;

export const Default: Story = {
  args: { children: 'Enable notifications' },
  parameters: { design: figmaNode('55-37') },
};

export const Checked: Story = {
  args: { checked: true, children: 'Enabled' },
  parameters: { design: figmaNode('55-38') },
};

export const Unchecked: Story = {
  args: { checked: false, children: 'Disabled' },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled toggle' },
  parameters: { design: figmaNode('55-39') },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true, children: 'Disabled (on)' },
  parameters: { design: figmaNode('55-40') },
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
