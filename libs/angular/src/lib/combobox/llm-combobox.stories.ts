import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
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

const meta: Meta<LlmCombobox> = {
  title: 'Components/LlmCombobox',
  component: LlmCombobox,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<LlmCombobox>;

export const Default: Story = {
  args: {
    options: FRUITS,
    placeholder: 'Search fruit…',
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    props: args,
    template: `<llm-combobox ${argsToTemplate(args)} />`,
  }),
};

export const WithPreselection: Story = {
  args: {
    options: FRUITS,
    value: 'cherry',
    placeholder: 'Search fruit…',
  },
  render: (args) => ({
    props: args,
    template: `<llm-combobox ${argsToTemplate(args)} />`,
  }),
};

export const Countries: Story = {
  args: {
    options: COUNTRIES,
    placeholder: 'Search country…',
  },
  render: (args) => ({
    props: args,
    template: `<llm-combobox ${argsToTemplate(args)} />`,
  }),
};

export const Disabled: Story = {
  args: {
    options: FRUITS,
    value: 'banana',
    disabled: true,
    placeholder: 'Search fruit…',
  },
  render: (args) => ({
    props: args,
    template: `<llm-combobox ${argsToTemplate(args)} />`,
  }),
};

export const Invalid: Story = {
  args: {
    options: FRUITS,
    invalid: true,
    placeholder: 'Search fruit…',
  },
  render: (args) => ({
    props: args,
    template: `<llm-combobox ${argsToTemplate(args)} />`,
  }),
};

export const WithDisabledOption: Story = {
  args: {
    options: FRUITS,
    placeholder: 'Search fruit… (Honeydew is disabled)',
  },
  render: (args) => ({
    props: args,
    template: `<llm-combobox ${argsToTemplate(args)} />`,
  }),
};
