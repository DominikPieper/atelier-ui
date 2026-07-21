import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlCheckbox } from './atl-checkbox';

import { metadata } from '@atelier-ui/spec/metadata/checkbox.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlCheckbox> = {
  title: 'Components/Inputs/AtlCheckbox',
  component: AtlCheckbox,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-checkbox ${argsToTemplate(args)}>Accept terms</atl-checkbox>`,
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlCheckbox>;

export const Default: Story = {
  parameters: { design: figmaNode('55-32') },
};

export const Checked: Story = {
  args: { checked: true },
  parameters: { design: figmaNode('55-33') },
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
    template: `<atl-checkbox ${argsToTemplate(args)} [errors]="errors" [touched]="touched">Accept terms</atl-checkbox>`,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => ({
    props: args,
    template: `<atl-checkbox ${argsToTemplate(args)}>Select all</atl-checkbox>`,
  }),
  parameters: { design: figmaNode('55-34') },
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-checkbox ${argsToTemplate(args)}>Playground label</atl-checkbox>`,
  }),
};
