import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmOption } from './llm-option';
import { LlmSelect } from './llm-select';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmSelect> = {
  title: 'Components/Inputs/LlmSelect',
  component: LlmSelect,
  tags: ['autodocs'],
  render: (args) => ({
    props: { ...args, value: '' },
    moduleMetadata: { imports: [LlmOption] },
    template: `
      <llm-select ${argsToTemplate(args)} [(value)]="value">
        <llm-option optionValue="us">United States</llm-option>
        <llm-option optionValue="ca">Canada</llm-option>
        <llm-option optionValue="uk">United Kingdom</llm-option>
        <llm-option optionValue="au">Australia</llm-option>
      </llm-select>
    `,
  }),
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    placeholder: 'Select a country',
    disabled: false,
    invalid: false,
    required: false,
  },
  parameters: {
    design: figmaNode('55-92'),
  },
};

export default meta;
type Story = StoryObj<LlmSelect>;

export const Default: Story = {
  parameters: { design: figmaNode('55-88') },
};

export const WithSelection: Story = {
  render: (args) => ({
    props: { ...args, value: 'ca' },
    moduleMetadata: { imports: [LlmOption] },
    template: `
      <llm-select ${argsToTemplate(args)} [(value)]="value">
        <llm-option optionValue="us">United States</llm-option>
        <llm-option optionValue="ca">Canada</llm-option>
        <llm-option optionValue="uk">United Kingdom</llm-option>
        <llm-option optionValue="au">Australia</llm-option>
      </llm-select>
    `,
  }),
  parameters: { design: figmaNode('55-89') },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const WithErrors: Story = {
  render: (args) => ({
    props: {
      ...args,
      value: '',
      errors: [{ kind: 'required', message: 'Please select a country' }],
      touched: true,
    },
    moduleMetadata: { imports: [LlmOption] },
    template: `
      <llm-select ${argsToTemplate(args)} [(value)]="value" [errors]="errors" [touched]="touched">
        <llm-option optionValue="us">United States</llm-option>
        <llm-option optionValue="ca">Canada</llm-option>
        <llm-option optionValue="uk">United Kingdom</llm-option>
      </llm-select>
    `,
  }),
  args: { invalid: true },
};

export const WithDisabledOption: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    moduleMetadata: { imports: [LlmOption] },
    template: `
      <llm-select ${argsToTemplate(args)} [(value)]="value">
        <llm-option optionValue="us">United States</llm-option>
        <llm-option optionValue="ca" [disabled]="true">Canada (unavailable)</llm-option>
        <llm-option optionValue="uk">United Kingdom</llm-option>
      </llm-select>
    `,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    moduleMetadata: { imports: [LlmOption] },
    template: `
      <llm-select ${argsToTemplate(args)} [(value)]="value">
        <llm-option optionValue="a">Option A</llm-option>
        <llm-option optionValue="b">Option B</llm-option>
        <llm-option optionValue="c">Option C</llm-option>
      </llm-select>
    `,
  }),
};
