import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlRadio } from './atl-radio';
import { AtlRadioGroup } from '../radio-group/atl-radio-group';

import { metadata } from '@atelier-ui/spec/metadata/radio.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlRadio> = {
  title: 'Components/Inputs/AtlRadio',
  component: AtlRadio,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('420-185'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlRadio>;

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
  parameters: { design: figmaNode('420-165') },
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
