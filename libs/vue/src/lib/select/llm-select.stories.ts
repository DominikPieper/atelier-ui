import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmSelect from './llm-select.vue';
import LlmOption from './llm-option.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmSelect> = {
  title: 'Components/Inputs/LlmSelect',
  component: LlmSelect,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmSelect, LlmOption },
    setup() {
      const value = ref(args.value ?? '');
      return { args, value };
    },
    template: `
      <LlmSelect v-bind="args" v-model:value="value">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk">United Kingdom</LlmOption>
        <LlmOption optionValue="au">Australia</LlmOption>
      </LlmSelect>
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmSelect>;

export const Default: Story = {
  parameters: { design: figmaNode('55-88') },
};

export const WithSelection: Story = {
  args: { value: 'ca' },
  parameters: { design: figmaNode('55-89') },
};

export const WithLabel: Story = {
  render: () => ({
    components: { LlmSelect, LlmOption },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <LlmSelect v-model:value="value" label="Country" placeholder="Select a country">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk">United Kingdom</LlmOption>
      </LlmSelect>
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
    components: { LlmSelect, LlmOption },
    setup() {
      const value = ref('');
      const errors = ['Please select a country'];
      return { args, value, errors };
    },
    template: `
      <LlmSelect v-bind="args" v-model:value="value" :errors="errors">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
        <LlmOption optionValue="uk">United Kingdom</LlmOption>
      </LlmSelect>
    `,
  }),
};

export const WithDisabledOption: Story = {
  render: () => ({
    components: { LlmSelect, LlmOption },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <LlmSelect v-model:value="value" label="Plan" placeholder="Select a plan">
        <LlmOption optionValue="free">Free</LlmOption>
        <LlmOption optionValue="pro">Pro</LlmOption>
        <LlmOption optionValue="enterprise" :disabled="true">Enterprise (unavailable)</LlmOption>
      </LlmSelect>
    `,
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmSelect, LlmOption },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <LlmSelect v-bind="args" v-model:value="value">
        <LlmOption optionValue="a">Option A</LlmOption>
        <LlmOption optionValue="b">Option B</LlmOption>
        <LlmOption optionValue="c">Option C</LlmOption>
      </LlmSelect>
    `,
  }),
};
