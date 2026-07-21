import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlTextarea } from './atl-textarea';

import { metadata } from '@atelier-ui/spec/metadata/textarea.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlTextarea> = {
  title: 'Components/Inputs/AtlTextarea',
  component: AtlTextarea,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-textarea ${argsToTemplate(args)} />`,
  }),
  argTypes: {
    rows: { control: { type: 'number', min: 1, max: 20 } },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    autoResize: { control: 'boolean' },
  },
  args: {
    rows: 3,
    placeholder: 'Enter text...',
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    autoResize: false,
  },
  parameters: {
    design: figmaNode('55-87'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlTextarea>;

export const Default: Story = {
  parameters: { design: figmaNode('55-82') },
};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Tell us about yourself...' },
};

export const TallRows: Story = {
  args: { rows: 8, placeholder: 'Enter a long description...' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Cannot edit' },
};

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => ({
    props: args,
    template: `<atl-textarea ${argsToTemplate(args)} value="This content cannot be edited." />`,
  }),
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    props: {
      ...args,
      errors: [
        { kind: 'required', message: 'This field is required' },
        { kind: 'minLength', message: 'Must be at least 20 characters' },
      ],
    },
    template: `<atl-textarea ${argsToTemplate(args)} [errors]="errors" [touched]="true" />`,
  }),
};

export const AutoResize: Story = {
  args: { autoResize: true, placeholder: 'Start typing — this grows automatically...' },
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-textarea ${argsToTemplate(args)} />`,
  }),
};
