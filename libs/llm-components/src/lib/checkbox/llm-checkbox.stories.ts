import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmCheckbox } from './llm-checkbox';

const meta: Meta<LlmCheckbox> = {
  title: 'Components/LlmCheckbox',
  component: LlmCheckbox,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-checkbox ${argsToTemplate(args)}>Accept terms</llm-checkbox>`,
  }),
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    checked: false,
    disabled: false,
    invalid: false,
    required: false,
    indeterminate: false,
  },
};

export default meta;
type Story = StoryObj<LlmCheckbox>;

export const Default: Story = {};

export const Checked: Story = {
  args: { checked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    props: {
      ...args,
      errors: [{ kind: 'required', message: 'You must accept the terms' }],
      touched: true,
    },
    template: `<llm-checkbox ${argsToTemplate(args)} [errors]="errors" [touched]="touched">Accept terms</llm-checkbox>`,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => ({
    props: args,
    template: `<llm-checkbox ${argsToTemplate(args)}>Select all</llm-checkbox>`,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-checkbox ${argsToTemplate(args)}>Playground label</llm-checkbox>`,
  }),
};
