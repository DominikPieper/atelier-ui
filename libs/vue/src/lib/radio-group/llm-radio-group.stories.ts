import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmRadioGroup from './llm-radio-group.vue';
import LlmRadio from '../radio/llm-radio.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmRadioGroup> = {
  title: 'Components/Inputs/LlmRadioGroup',
  component: LlmRadioGroup,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref(args.value ?? '');
      return { args, value };
    },
    template: `
      <LlmRadioGroup v-bind="args" v-model:value="value">
        <LlmRadio radioValue="sm">Small</LlmRadio>
        <LlmRadio radioValue="md">Medium</LlmRadio>
        <LlmRadio radioValue="lg">Large</LlmRadio>
      </LlmRadioGroup>
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmRadioGroup>;

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
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref(args.value ?? '');
      return { args, value };
    },
    template: `
      <LlmRadioGroup v-bind="args" v-model:value="value">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
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
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('');
      const errors = ['Please select a size'];
      return { args, value, errors };
    },
    template: `
      <LlmRadioGroup v-bind="args" v-model:value="value" :errors="errors">
        <LlmRadio radioValue="sm">Small</LlmRadio>
        <LlmRadio radioValue="md">Medium</LlmRadio>
        <LlmRadio radioValue="lg">Large</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const WithDisabledOption: Story = {
  render: () => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('sm');
      return { value };
    },
    template: `
      <LlmRadioGroup v-model:value="value" name="size">
        <LlmRadio radioValue="sm">Small</LlmRadio>
        <LlmRadio radioValue="md" :disabled="true">Medium (unavailable)</LlmRadio>
        <LlmRadio radioValue="lg">Large</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <LlmRadioGroup v-bind="args" v-model:value="value">
        <LlmRadio radioValue="a">Option A</LlmRadio>
        <LlmRadio radioValue="b">Option B</LlmRadio>
        <LlmRadio radioValue="c">Option C</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};
