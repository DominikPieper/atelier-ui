import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlRadioGroup } from './atl-radio-group';
import { AtlRadio } from '../radio/atl-radio';

import { metadata } from '@atelier-ui/spec/metadata/radio.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlRadioGroup> = {
  title: 'Components/Inputs/AtlRadioGroup',
  component: AtlRadioGroup,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-137'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlRadioGroup>;

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = useState('free');
    return (
      <AtlRadioGroup value={value} onValueChange={setValue} name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
        <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
      </AtlRadioGroup>
    );
  },
  parameters: { design: figmaNode('55-131') },
};

export const Disabled: Story = {
  render: () => (
    <AtlRadioGroup value="free" name="plan-disabled" disabled>
      <AtlRadio radioValue="free">Free</AtlRadio>
      <AtlRadio radioValue="pro">Pro</AtlRadio>
    </AtlRadioGroup>
  ),
};

export const IndividualDisabled: Story = {
  render: function Render() {
    const [value, setValue] = useState('free');
    return (
      <AtlRadioGroup value={value} onValueChange={setValue} name="plan-individual">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
        <AtlRadio radioValue="enterprise" disabled>
          Enterprise (unavailable)
        </AtlRadio>
      </AtlRadioGroup>
    );
  },
};

export const Invalid: Story = {
  render: () => (
    <AtlRadioGroup value="" name="plan-invalid" invalid errors={['Please select a plan']}>
      <AtlRadio radioValue="free">Free</AtlRadio>
      <AtlRadio radioValue="pro">Pro</AtlRadio>
    </AtlRadioGroup>
  ),
};

export const WithErrors: Story = {
  render: () => (
    <AtlRadioGroup value="" name="plan-errors" invalid errors={['Selection required', 'Please choose a plan to continue']}>
      <AtlRadio radioValue="free">Free</AtlRadio>
      <AtlRadio radioValue="pro">Pro</AtlRadio>
      <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
    </AtlRadioGroup>
  ),
};

export const Required: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <AtlRadioGroup value={value} onValueChange={setValue} name="plan-required" required>
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
        <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
      </AtlRadioGroup>
    );
  },
};
