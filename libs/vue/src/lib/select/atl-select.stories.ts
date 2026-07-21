import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlSelect from './atl-select.vue';
import AtlOption from './atl-option.vue';

import { metadata } from '@atelier-ui/spec/metadata/select.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlSelect> = {
  title: 'Components/Inputs/AtlSelect',
  component: AtlSelect,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlSelect, AtlOption },
    setup() {
      const value = ref(args.value ?? '');
      return { args, value };
    },
    template: `
      <AtlSelect v-bind="args" v-model:value="value">
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
        <AtlOption optionValue="uk">United Kingdom</AtlOption>
        <AtlOption optionValue="au">Australia</AtlOption>
      </AtlSelect>
    `,
  }),
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    value: '',
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
type Story = StoryObj<typeof AtlSelect>;

export const Default: Story = {
  parameters: { design: figmaNode('55-88') },
};

export const WithSelection: Story = {
  args: { value: 'ca' },
  parameters: { design: figmaNode('55-89') },
};

export const WithLabel: Story = {
  render: () => ({
    components: { AtlSelect, AtlOption },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <AtlSelect v-model:value="value" label="Country" placeholder="Select a country">
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
        <AtlOption optionValue="uk">United Kingdom</AtlOption>
      </AtlSelect>
    `,
  }),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    components: { AtlSelect, AtlOption },
    setup() {
      const value = ref('');
      const errors = ['Please select a country'];
      return { args, value, errors };
    },
    template: `
      <AtlSelect v-bind="args" v-model:value="value" :errors="errors">
        <AtlOption optionValue="us">United States</AtlOption>
        <AtlOption optionValue="ca">Canada</AtlOption>
        <AtlOption optionValue="uk">United Kingdom</AtlOption>
      </AtlSelect>
    `,
  }),
};

export const WithDisabledOption: Story = {
  render: () => ({
    components: { AtlSelect, AtlOption },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <AtlSelect v-model:value="value" label="Plan" placeholder="Select a plan">
        <AtlOption optionValue="free">Free</AtlOption>
        <AtlOption optionValue="pro">Pro</AtlOption>
        <AtlOption optionValue="enterprise" :disabled="true">Enterprise (unavailable)</AtlOption>
      </AtlSelect>
    `,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlSelect, AtlOption },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <AtlSelect v-bind="args" v-model:value="value">
        <AtlOption optionValue="a">Option A</AtlOption>
        <AtlOption optionValue="b">Option B</AtlOption>
        <AtlOption optionValue="c">Option C</AtlOption>
      </AtlSelect>
    `,
  }),
};
