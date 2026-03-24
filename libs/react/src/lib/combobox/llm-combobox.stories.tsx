import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmCombobox } from './llm-combobox';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew', disabled: true },
];

const COUNTRIES = [
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'jp', label: 'Japan' },
];

const meta: Meta<typeof LlmCombobox> = {
  title: 'Components/LlmCombobox',
  component: LlmCombobox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LlmCombobox>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <LlmCombobox {...args} value={value} onValueChange={setValue} />;
  },
  args: {
    options: FRUITS,
    placeholder: 'Search fruit…',
  },
};

export const WithPreselection: Story = {
  render: (args) => {
    const [value, setValue] = useState('cherry');
    return <LlmCombobox {...args} value={value} onValueChange={setValue} />;
  },
  args: {
    options: FRUITS,
    placeholder: 'Search fruit…',
  },
};

export const Countries: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <LlmCombobox {...args} value={value} onValueChange={setValue} />;
  },
  args: {
    options: COUNTRIES,
    placeholder: 'Search country…',
  },
};

export const Disabled: Story = {
  args: {
    options: FRUITS,
    value: 'banana',
    disabled: true,
    placeholder: 'Search fruit…',
  },
};

export const Invalid: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <LlmCombobox {...args} value={value} onValueChange={setValue} />;
  },
  args: {
    options: FRUITS,
    invalid: true,
    errors: ['Please select a fruit'],
    placeholder: 'Search fruit…',
  },
};

export const WithDisabledOption: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <LlmCombobox {...args} value={value} onValueChange={setValue} />;
  },
  args: {
    options: FRUITS,
    placeholder: 'Search fruit… (Honeydew is disabled)',
  },
};
