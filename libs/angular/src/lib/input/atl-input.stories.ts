import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlInput } from './atl-input';

import { metadata } from '@atelier-ui/spec/metadata/input.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlInput> = {
  title: 'Components/Inputs/AtlInput',
  component: AtlInput,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-input ${argsToTemplate(args)} />`,
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlInput>;

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
};

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => ({
    props: args,
    template: `<atl-input ${argsToTemplate(args)} value="Read-only value" />`,
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
    template: `<atl-input ${argsToTemplate(args)} [errors]="errors" [touched]="true" />`,
  }),
};

export const AllTypes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px;">
        <atl-input type="text" placeholder="Text input" />
        <atl-input type="email" placeholder="Email input" />
        <atl-input type="password" placeholder="Password input" />
        <atl-input type="number" placeholder="Number input" />
        <atl-input type="tel" placeholder="Tel input" />
        <atl-input type="url" placeholder="URL input" />
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
    template: `<atl-input ${argsToTemplate(args)} />`,
  }),
};
