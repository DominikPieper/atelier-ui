import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import LlmToggle from './llm-toggle.vue';

const meta: Meta<typeof LlmToggle> = {
  title: 'Components/LlmToggle',
  component: LlmToggle,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    checked: false,
    invalid: false,
    disabled: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmToggle>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmToggle },
    setup() {
      const checked = ref(args.checked ?? false);
      return { args, checked };
    },
    template: '<LlmToggle v-bind="args" v-model:checked="checked">Enable feature</LlmToggle>',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmToggle },
    setup() {
      const emailNotifs = ref(true);
      const pushNotifs = ref(false);
      return { emailNotifs, pushNotifs };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem">
        <LlmToggle v-model:checked="emailNotifs">Email notifications</LlmToggle>
        <LlmToggle v-model:checked="pushNotifs">Push notifications</LlmToggle>
        <LlmToggle :disabled="true">Disabled toggle</LlmToggle>
        <LlmToggle :checked="true" :disabled="true">Disabled checked</LlmToggle>
        <LlmToggle :invalid="true" :errors="['This setting is required']">With error</LlmToggle>
      </div>
    `,
  }),
};
