import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import LlmCheckbox from './llm-checkbox.vue';

const meta: Meta<typeof LlmCheckbox> = {
  title: 'Components/LlmCheckbox',
  component: LlmCheckbox,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    checked: false,
    indeterminate: false,
    invalid: false,
    disabled: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmCheckbox>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmCheckbox },
    setup() {
      const checked = ref(args.checked ?? false);
      return { args, checked };
    },
    template: '<LlmCheckbox v-bind="args" v-model:checked="checked">I agree to the terms</LlmCheckbox>',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmCheckbox },
    setup() {
      const checked1 = ref(false);
      const checked2 = ref(true);
      const allChecked = ref(false);
      return { checked1, checked2, allChecked };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem">
        <LlmCheckbox v-model:checked="checked1">Unchecked</LlmCheckbox>
        <LlmCheckbox v-model:checked="checked2">Checked</LlmCheckbox>
        <LlmCheckbox :indeterminate="true" v-model:checked="allChecked">Indeterminate (select all)</LlmCheckbox>
        <LlmCheckbox :disabled="true">Disabled</LlmCheckbox>
        <LlmCheckbox :invalid="true" :errors="['This field is required']">With error</LlmCheckbox>
      </div>
    `,
  }),
};
