import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmRadioGroup from './llm-radio-group.vue';
import LlmRadio from '../radio/llm-radio.vue';

const meta: Meta<typeof LlmRadioGroup> = {
  title: 'Components/LlmRadioGroup',
  component: LlmRadioGroup,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    value: '',
    name: 'plan',
    disabled: false,
    invalid: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmRadioGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref(args.value ?? '');
      return { args, value };
    },
    template: `
      <LlmRadioGroup v-bind="args" v-model:value="value" name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};

export const WithPreselection: Story = {
  render: () => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('pro');
      return { value };
    },
    template: `
      <LlmRadioGroup v-model:value="value" name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('free');
      return { value };
    },
    template: `
      <LlmRadioGroup v-model:value="value" name="plan" :disabled="true">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};

export const WithDisabledOption: Story = {
  render: () => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <LlmRadioGroup v-model:value="value" name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise" :disabled="true">Enterprise (unavailable)</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};

export const WithErrors: Story = {
  render: () => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <LlmRadioGroup v-model:value="value" name="plan" :invalid="true" :errors="['Please select a plan']">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};
