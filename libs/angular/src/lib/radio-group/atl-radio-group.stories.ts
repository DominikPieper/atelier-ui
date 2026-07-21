import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlRadio } from '../radio/atl-radio';
import { AtlRadioGroup } from './atl-radio-group';

import { metadata } from '@atelier-ui/spec/metadata/radio.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlRadioGroup> = {
  title: 'Components/Inputs/AtlRadioGroup',
  component: AtlRadioGroup,
  tags: ['autodocs'],
  decorators: [],
  render: (args) => ({
    props: { ...args, value: 'md' },
    moduleMetadata: { imports: [AtlRadio] },
    template: `
      <atl-radio-group ${argsToTemplate(args)} [(value)]="value">
        <atl-radio radioValue="sm">Small</atl-radio>
        <atl-radio radioValue="md">Medium</atl-radio>
        <atl-radio radioValue="lg">Large</atl-radio>
      </atl-radio-group>
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
    design: figmaNode('55-137'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlRadioGroup>;

export const Default: Story = {
  parameters: { design: figmaNode('55-131') },
};

export const WithSelection: Story = {
  render: (args) => ({
    props: { ...args, value: 'lg' },
    moduleMetadata: { imports: [AtlRadio] },
    template: `
      <atl-radio-group ${argsToTemplate(args)} [(value)]="value">
        <atl-radio radioValue="sm">Small</atl-radio>
        <atl-radio radioValue="md">Medium</atl-radio>
        <atl-radio radioValue="lg">Large</atl-radio>
      </atl-radio-group>
    `,
  }),
  parameters: { design: figmaNode('55-132') },
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
      errors: [{ kind: 'required', message: 'Please select a size' }],
      touched: true,
    },
    moduleMetadata: { imports: [AtlRadio] },
    template: `
      <atl-radio-group ${argsToTemplate(args)} [(value)]="value" [errors]="errors" [touched]="touched">
        <atl-radio radioValue="sm">Small</atl-radio>
        <atl-radio radioValue="md">Medium</atl-radio>
        <atl-radio radioValue="lg">Large</atl-radio>
      </atl-radio-group>
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
    moduleMetadata: { imports: [AtlRadio] },
    template: `
      <atl-radio-group ${argsToTemplate(args)} [(value)]="value">
        <atl-radio radioValue="sm">Small</atl-radio>
        <atl-radio radioValue="md" [disabled]="true">Medium (unavailable)</atl-radio>
        <atl-radio radioValue="lg">Large</atl-radio>
      </atl-radio-group>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    moduleMetadata: { imports: [AtlRadio] },
    template: `
      <atl-radio-group ${argsToTemplate(args)} [(value)]="value">
        <atl-radio radioValue="a">Option A</atl-radio>
        <atl-radio radioValue="b">Option B</atl-radio>
        <atl-radio radioValue="c">Option C</atl-radio>
      </atl-radio-group>
    `,
  }),
};
