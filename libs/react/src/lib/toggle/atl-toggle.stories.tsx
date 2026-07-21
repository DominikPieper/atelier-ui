import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlToggle } from './atl-toggle';

import { metadata } from '@atelier-ui/spec/metadata/toggle.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlToggle> = {
  title: 'Components/Inputs/AtlToggle',
  component: AtlToggle,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
  },
  args: { checked: false, disabled: false, invalid: false },
  parameters: {
    design: figmaNode('55-41'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlToggle>;

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
  parameters: { design: figmaNode('55-37') },
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
  render: function InteractiveRender() {
    const [checked, setChecked] = useState(false);
    return (
      <AtlToggle checked={checked} onCheckedChange={setChecked}>
        {checked ? 'On' : 'Off'}
      </AtlToggle>
    );
  },
};

export const SettingsPanel: Story = {
  render: function SettingsPanelRender() {
    const [email, setEmail] = useState(true);
    const [push, setPush] = useState(false);
    const [sms, setSms] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
        <AtlToggle checked={email} onCheckedChange={setEmail}>
          Email notifications
        </AtlToggle>
        <AtlToggle checked={push} onCheckedChange={setPush}>
          Push notifications
        </AtlToggle>
        <AtlToggle checked={sms} onCheckedChange={setSms}>
          SMS notifications
        </AtlToggle>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AtlToggle>Default (off)</AtlToggle>
      <AtlToggle checked>Default (on)</AtlToggle>
      <AtlToggle disabled>Disabled (off)</AtlToggle>
      <AtlToggle disabled checked>Disabled (on)</AtlToggle>
      <AtlToggle invalid>Invalid</AtlToggle>
    </div>
  ),
};
