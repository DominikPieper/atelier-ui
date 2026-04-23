import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmCheckbox } from './llm-checkbox';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmCheckbox> = {
  title: 'Components/Inputs/LlmCheckbox',
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
  parameters: {
    design: figmaNode('55-36'),
  },
};

export default meta;
type Story = StoryObj<LlmCheckbox>;

export const Default: Story = {
  parameters: { design: figmaNode('55-32') },
};

export const Checked: Story = {
  args: { checked: true },
  parameters: { design: figmaNode('55-33') },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { design: figmaNode('55-35') },
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
  parameters: { design: figmaNode('55-34') },
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-checkbox ${argsToTemplate(args)}>Playground label</llm-checkbox>`,
  }),
};
