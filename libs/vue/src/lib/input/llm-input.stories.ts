import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmInput from './llm-input.vue';

const meta: Meta<typeof LlmInput> = {
  title: 'Components/LlmInput',
  component: LlmInput,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    type: 'text',
    placeholder: 'Enter value...',
    invalid: false,
    disabled: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmInput>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmInput },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<LlmInput v-bind="args" v-model:value="value" />',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmInput },
    setup() {
      const email = ref('');
      const password = ref('');
      return { email, password };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <LlmInput label="Email" type="email" placeholder="you@example.com" v-model:value="email" />
        <LlmInput label="Password" type="password" placeholder="Password" v-model:value="password" />
        <LlmInput placeholder="Disabled" :disabled="true" />
        <LlmInput placeholder="With error" :invalid="true" :errors="['This field is required']" />
        <LlmInput placeholder="Read only" :readonly="true" value="Read only value" />
      </div>
    `,
  }),
};
