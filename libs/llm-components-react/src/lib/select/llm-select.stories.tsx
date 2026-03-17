import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmSelect, LlmOption } from './llm-select';

const meta: Meta<typeof LlmSelect> = {
  title: 'Components/LlmSelect',
  component: LlmSelect,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LlmSelect>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <LlmSelect value={value} onValueChange={setValue} placeholder="Select a country">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk">United Kingdom</LlmOption>
      </LlmSelect>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
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
  render: () => {
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
  render: () => {
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
