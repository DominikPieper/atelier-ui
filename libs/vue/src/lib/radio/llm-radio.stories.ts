import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmRadio from './llm-radio.vue';
import LlmRadioGroup from '../radio-group/llm-radio-group.vue';

const meta: Meta<typeof LlmRadio> = {
  title: 'Components/LlmRadio',
  component: LlmRadio,
  tags: ['autodocs'],
  argTypes: {
    radioValue: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    radioValue: 'option',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmRadio>;

export const Default: Story = {
  render: () => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <LlmRadioGroup v-model:value="value" name="example">
        <LlmRadio radioValue="option-a">Option A</LlmRadio>
        <LlmRadio radioValue="option-b">Option B</LlmRadio>
        <LlmRadio radioValue="option-c">Option C</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { LlmRadioGroup, LlmRadio },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <LlmRadioGroup v-model:value="value" name="example">
        <LlmRadio radioValue="option-a">Option A</LlmRadio>
        <LlmRadio radioValue="option-b" :disabled="true">Option B (disabled)</LlmRadio>
        <LlmRadio radioValue="option-c">Option C</LlmRadio>
      </LlmRadioGroup>
    `,
  }),
};
