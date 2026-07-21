import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlOption } from './atl-option';
import { AtlSelect } from './atl-select';

import { metadata } from '@atelier-ui/spec/metadata/select.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlSelect> = {
  title: 'Components/Inputs/AtlSelect',
  component: AtlSelect,
  tags: ['autodocs'],
  render: (args) => ({
    props: { ...args, value: '' },
    moduleMetadata: { imports: [AtlOption] },
    template: `
      <atl-select ${argsToTemplate(args)} [(value)]="value">
        <atl-option optionValue="us">United States</atl-option>
        <atl-option optionValue="ca">Canada</atl-option>
        <atl-option optionValue="uk">United Kingdom</atl-option>
        <atl-option optionValue="au">Australia</atl-option>
      </atl-select>
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlSelect>;

export const Default: Story = {
  parameters: { design: figmaNode('55-88') },
};

export const WithSelection: Story = {
  render: (args) => ({
    props: { ...args, value: 'ca' },
    moduleMetadata: { imports: [AtlOption] },
    template: `
      <atl-select ${argsToTemplate(args)} [(value)]="value">
        <atl-option optionValue="us">United States</atl-option>
        <atl-option optionValue="ca">Canada</atl-option>
        <atl-option optionValue="uk">United Kingdom</atl-option>
        <atl-option optionValue="au">Australia</atl-option>
      </atl-select>
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
    moduleMetadata: { imports: [AtlOption] },
    template: `
      <atl-select ${argsToTemplate(args)} [(value)]="value" [errors]="errors" [touched]="touched">
        <atl-option optionValue="us">United States</atl-option>
        <atl-option optionValue="ca">Canada</atl-option>
        <atl-option optionValue="uk">United Kingdom</atl-option>
      </atl-select>
    `,
  }),
  args: { invalid: true },
};

export const WithDisabledOption: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    moduleMetadata: { imports: [AtlOption] },
    template: `
      <atl-select ${argsToTemplate(args)} [(value)]="value">
        <atl-option optionValue="us">United States</atl-option>
        <atl-option optionValue="ca" [disabled]="true">Canada (unavailable)</atl-option>
        <atl-option optionValue="uk">United Kingdom</atl-option>
      </atl-select>
    `,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    moduleMetadata: { imports: [AtlOption] },
    template: `
      <atl-select ${argsToTemplate(args)} [(value)]="value">
        <atl-option optionValue="a">Option A</atl-option>
        <atl-option optionValue="b">Option B</atl-option>
        <atl-option optionValue="c">Option C</atl-option>
      </atl-select>
    `,
  }),
};
