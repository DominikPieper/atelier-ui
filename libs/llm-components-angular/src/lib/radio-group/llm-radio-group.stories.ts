import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmRadio } from '../radio/llm-radio';
import { LlmRadioGroup } from './llm-radio-group';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmRadioGroup> = {
  title: 'Components/LlmRadioGroup',
  component: LlmRadioGroup,
  tags: ['autodocs'],
  decorators: [],
  render: (args) => ({
    props: { ...args, value: 'md' },
    imports: [LlmRadio],
    template: `
      <llm-radio-group ${argsToTemplate(args)} [(value)]="value">
        <llm-radio radioValue="sm">Small</llm-radio>
        <llm-radio radioValue="md">Medium</llm-radio>
        <llm-radio radioValue="lg">Large</llm-radio>
      </llm-radio-group>
    `,
  }),
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    name: 'size',
    disabled: false,
    invalid: false,
    required: false,
  },
  parameters: {
    design: figmaNode('3-822'),
  },
};

export default meta;
type Story = StoryObj<LlmRadioGroup>;

export const Default: Story = {
  parameters: { design: figmaNode('55-131') },
};

export const WithSelection: Story = {
  render: (args) => ({
    props: { ...args, value: 'lg' },
    imports: [LlmRadio],
    template: `
      <llm-radio-group ${argsToTemplate(args)} [(value)]="value">
        <llm-radio radioValue="sm">Small</llm-radio>
        <llm-radio radioValue="md">Medium</llm-radio>
        <llm-radio radioValue="lg">Large</llm-radio>
      </llm-radio-group>
    `,
  }),
  parameters: { design: figmaNode('55-132') },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { design: figmaNode('55-136') },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const WithErrors: Story = {
  render: (args) => ({
    props: {
      ...args,
      value: '',
      errors: [{ kind: 'required', message: 'Please select a size' }],
      touched: true,
    },
    imports: [LlmRadio],
    template: `
      <llm-radio-group ${argsToTemplate(args)} [(value)]="value" [errors]="errors" [touched]="touched">
        <llm-radio radioValue="sm">Small</llm-radio>
        <llm-radio radioValue="md">Medium</llm-radio>
        <llm-radio radioValue="lg">Large</llm-radio>
      </llm-radio-group>
    `,
  }),
  args: { invalid: true },
};

export const Required: Story = {
  args: { required: true },
};

export const WithDisabledOption: Story = {
  render: (args) => ({
    props: { ...args, value: 'sm' },
    imports: [LlmRadio],
    template: `
      <llm-radio-group ${argsToTemplate(args)} [(value)]="value">
        <llm-radio radioValue="sm">Small</llm-radio>
        <llm-radio radioValue="md" [disabled]="true">Medium (unavailable)</llm-radio>
        <llm-radio radioValue="lg">Large</llm-radio>
      </llm-radio-group>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    imports: [LlmRadio],
    template: `
      <llm-radio-group ${argsToTemplate(args)} [(value)]="value">
        <llm-radio radioValue="a">Option A</llm-radio>
        <llm-radio radioValue="b">Option B</llm-radio>
        <llm-radio radioValue="c">Option C</llm-radio>
      </llm-radio-group>
    `,
  }),
};
