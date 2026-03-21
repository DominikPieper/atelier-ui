import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import LlmSelect from './llm-select.vue';
import LlmOption from './llm-option.vue';

const meta: Meta<typeof LlmSelect> = {
  title: 'Components/LlmSelect',
  component: LlmSelect,
  tags: ['autodocs'],
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    value: '',
    placeholder: 'Select an option',
    invalid: false,
    disabled: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmSelect>;

export const Default: Story = {
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
      </LlmSelect>
    `,
  }),
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

export const WithErrors: Story = {
  render: () => ({
    components: { LlmSelect, LlmOption },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <LlmSelect v-model:value="value" label="Country" placeholder="Select a country" :invalid="true" :errors="['Please select a country']">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
      </LlmSelect>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { LlmSelect, LlmOption },
    template: `
      <LlmSelect value="us" label="Country" :disabled="true">
        <LlmOption optionValue="us">United States</LlmOption>
        <LlmOption optionValue="ca">Canada</LlmOption>
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
