import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlSelect, AtlOption } from './atl-select';

import { metadata } from '@atelier-ui/spec/metadata/select.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlSelect> = {
  title: 'Components/Inputs/AtlSelect',
  component: AtlSelect,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-92'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlSelect>;

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <AtlSelect value={value} onValueChange={setValue} placeholder="Select a country">
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
        <AtlOption optionValue="uk">United Kingdom</AtlOption>
      </AtlSelect>
    );
  },
  parameters: { design: figmaNode('55-88') },
};

export const WithLabel: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <AtlSelect
        label="Country"
        value={value}
        onValueChange={setValue}
        placeholder="Select a country"
      >
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
        <AtlOption optionValue="uk">United Kingdom</AtlOption>
      </AtlSelect>
    );
  },
};

export const WithValue: Story = {
  render: function Render() {
    const [value, setValue] = useState('ca');
    return (
      <AtlSelect value={value} onValueChange={setValue}>
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
        <AtlOption optionValue="uk">United Kingdom</AtlOption>
      </AtlSelect>
    );
  },
  parameters: { design: figmaNode('55-89') },
};

export const Disabled: Story = {
  render: () => (
    <AtlSelect value="ca" disabled>
      <AtlOption optionValue="us">United States</AtlOption>
      <AtlOption optionValue="ca">Canada</AtlOption>
    </AtlSelect>
  ),
};

export const Invalid: Story = {
  render: () => (
    <AtlSelect
      label="Country"
      value=""
      invalid
      placeholder="Select a country"
      errors={['Please select a country']}
    >
      <AtlOption optionValue="us">United States</AtlOption>
      <AtlOption optionValue="ca">Canada</AtlOption>
    </AtlSelect>
  ),
};

export const DisabledOption: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <AtlSelect value={value} onValueChange={setValue} placeholder="Select a country">
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
        <AtlOption optionValue="uk" disabled>
          United Kingdom (unavailable)
        </AtlOption>
      </AtlSelect>
    );
  },
};
