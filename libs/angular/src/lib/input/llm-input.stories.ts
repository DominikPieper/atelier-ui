import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmInput } from './llm-input';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmInput> = {
  title: 'Components/Inputs/LlmInput',
  component: LlmInput,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-input ${argsToTemplate(args)} />`,
  }),
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
  },
  parameters: {
    design: figmaNode('129-33'),
  },
};

export default meta;
type Story = StoryObj<LlmInput>;

export const Default: Story = {
  parameters: { design: figmaNode('129-23') },
};

export const Email: Story = {
  args: { type: 'email', placeholder: 'you@example.com' },
};

export const Password: Story = {
  args: { type: 'password', placeholder: 'Enter password' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Cannot edit' },
  parameters: { design: figmaNode('129-31') },
};

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => ({
    props: args,
    template: `<llm-input ${argsToTemplate(args)} value="Read-only value" />`,
  }),
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    props: {
      ...args,
      errors: [
        { kind: 'required', message: 'This field is required' },
        { kind: 'email', message: 'Please enter a valid email address' },
      ],
    },
    template: `<llm-input ${argsToTemplate(args)} [errors]="errors" [touched]="true" />`,
  }),
};

export const AllTypes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px;">
        <llm-input type="text" placeholder="Text input" />
        <llm-input type="email" placeholder="Email input" />
        <llm-input type="password" placeholder="Password input" />
        <llm-input type="number" placeholder="Number input" />
        <llm-input type="tel" placeholder="Tel input" />
        <llm-input type="url" placeholder="URL input" />
      </div>
    `,
  }),
};

export const Required: Story = {
  args: { required: true, placeholder: 'Required field' },
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-input ${argsToTemplate(args)} />`,
  }),
};
