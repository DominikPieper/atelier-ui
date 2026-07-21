import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlCheckbox from './atl-checkbox.vue';

import { metadata } from '@atelier-ui/spec/metadata/checkbox.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlCheckbox> = {
  title: 'Components/Inputs/AtlCheckbox',
  component: AtlCheckbox,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlCheckbox },
    setup() { return { args }; },
    template: '<AtlCheckbox v-bind="args">Accept terms</AtlCheckbox>',
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
type Story = StoryObj<typeof AtlCheckbox>;

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
    components: { AtlCheckbox },
    setup() {
      const errors = ['You must accept the terms'];
      return { args, errors };
    },
    template: '<AtlCheckbox v-bind="args" :errors="errors">Accept terms</AtlCheckbox>',
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => ({
    components: { AtlCheckbox },
    setup() { return { args }; },
    template: '<AtlCheckbox v-bind="args">Select all</AtlCheckbox>',
  }),
  parameters: { design: figmaNode('55-34') },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlCheckbox },
    setup() {
      const checked1 = ref(false);
      const checked2 = ref(true);
      const allChecked = ref(false);
      return { checked1, checked2, allChecked };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem">
        <AtlCheckbox v-model:checked="checked1">Unchecked</AtlCheckbox>
        <AtlCheckbox v-model:checked="checked2">Checked</AtlCheckbox>
        <AtlCheckbox :indeterminate="true" v-model:checked="allChecked">Indeterminate (select all)</AtlCheckbox>
        <AtlCheckbox :disabled="true">Disabled</AtlCheckbox>
        <AtlCheckbox :invalid="true" :errors="['This field is required']">With error</AtlCheckbox>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlCheckbox },
    setup() { return { args }; },
    template: '<AtlCheckbox v-bind="args">Playground label</AtlCheckbox>',
  }),
};
