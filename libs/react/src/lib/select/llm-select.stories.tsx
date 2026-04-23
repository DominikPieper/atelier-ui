import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmSelect, LlmOption } from './llm-select';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmSelect> = {
  title: 'Components/Inputs/LlmSelect',
  component: LlmSelect,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-92'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmSelect>;

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <LlmSelect value={value} onValueChange={setValue} placeholder="Select a country">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk">United Kingdom</LlmOption>
      </LlmSelect>
    );
  },
  parameters: { design: figmaNode('55-88') },
};

export const WithLabel: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <LlmSelect
        label="Country"
        value={value}
        onValueChange={setValue}
        placeholder="Select a country"
      >
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk">United Kingdom</LlmOption>
      </LlmSelect>
    );
  },
};

export const WithValue: Story = {
  render: function Render() {
    const [value, setValue] = useState('ca');
    return (
      <LlmSelect value={value} onValueChange={setValue}>
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk">United Kingdom</LlmOption>
      </LlmSelect>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <LlmSelect value="ca" disabled>
      <LlmOption optionValue="us">United States</LlmOption>
      <LlmOption optionValue="ca">Canada</LlmOption>
    </LlmSelect>
  ),
  parameters: { design: figmaNode('55-91') },
};

export const Invalid: Story = {
  render: () => (
    <LlmSelect
      label="Country"
      value=""
      invalid
      placeholder="Select a country"
      errors={['Please select a country']}
    >
      <LlmOption optionValue="us">United States</LlmOption>
      <LlmOption optionValue="ca">Canada</LlmOption>
    </LlmSelect>
  ),
};

export const DisabledOption: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <LlmSelect value={value} onValueChange={setValue} placeholder="Select a country">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk" disabled>
          United Kingdom (unavailable)
        </LlmOption>
      </LlmSelect>
    );
  },
};
