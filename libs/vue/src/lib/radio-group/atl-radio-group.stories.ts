import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlRadioGroup from './atl-radio-group.vue';
import AtlRadio from '../radio/atl-radio.vue';

import { metadata } from '@atelier-ui/spec/metadata/radio.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlRadioGroup> = {
  title: 'Components/Inputs/AtlRadioGroup',
  component: AtlRadioGroup,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref(args.value ?? '');
      return { args, value };
    },
    template: `
      <AtlRadioGroup v-bind="args" v-model:value="value">
        <AtlRadio radioValue="sm">Small</AtlRadio>
        <AtlRadio radioValue="md">Medium</AtlRadio>
        <AtlRadio radioValue="lg">Large</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    name: 'size',
    value: 'md',
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
type Story = StoryObj<typeof AtlRadioGroup>;

export const Default: Story = {
  parameters: { design: figmaNode('55-131') },
};

export const WithSelection: Story = {
  args: { value: 'lg' },
  parameters: { design: figmaNode('55-132') },
};

export const WithPreselection: Story = {
  args: { value: 'pro', name: 'plan' },
  render: (args) => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref(args.value ?? '');
      return { args, value };
    },
    template: `
      <AtlRadioGroup v-bind="args" v-model:value="value">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
        <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
      </AtlRadioGroup>
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
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref('');
      const errors = ['Please select a size'];
      return { args, value, errors };
    },
    template: `
      <AtlRadioGroup v-bind="args" v-model:value="value" :errors="errors">
        <AtlRadio radioValue="sm">Small</AtlRadio>
        <AtlRadio radioValue="md">Medium</AtlRadio>
        <AtlRadio radioValue="lg">Large</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const WithDisabledOption: Story = {
  render: () => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref('sm');
      return { value };
    },
    template: `
      <AtlRadioGroup v-model:value="value" name="size">
        <AtlRadio radioValue="sm">Small</AtlRadio>
        <AtlRadio radioValue="md" :disabled="true">Medium (unavailable)</AtlRadio>
        <AtlRadio radioValue="lg">Large</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <AtlRadioGroup v-bind="args" v-model:value="value">
        <AtlRadio radioValue="a">Option A</AtlRadio>
        <AtlRadio radioValue="b">Option B</AtlRadio>
        <AtlRadio radioValue="c">Option C</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
};
