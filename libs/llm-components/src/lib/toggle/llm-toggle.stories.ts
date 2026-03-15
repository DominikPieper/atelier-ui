import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmToggle } from './llm-toggle';

const meta: Meta<LlmToggle> = {
  title: 'Components/LlmToggle',
  component: LlmToggle,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-toggle ${argsToTemplate(args)}>Enable notifications</llm-toggle>`,
  }),
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    checked: false,
    disabled: false,
    invalid: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<LlmToggle>;

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
      errors: [{ kind: 'required', message: 'You must enable this setting' }],
      touched: true,
    },
    template: `<llm-toggle ${argsToTemplate(args)} [errors]="errors" [touched]="touched">Enable notifications</llm-toggle>`,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-toggle ${argsToTemplate(args)}>Playground label</llm-toggle>`,
  }),
};
