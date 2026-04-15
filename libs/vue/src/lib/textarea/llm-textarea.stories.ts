import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmTextarea from './llm-textarea.vue';

const meta: Meta<typeof LlmTextarea> = {
  title: 'Components/LlmTextarea',
  component: LlmTextarea,
  tags: ['autodocs'],
  argTypes: {
    rows: { control: { type: 'number', min: 1, max: 20 } },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    rows: 3,
    placeholder: 'Enter text...',
    invalid: false,
    disabled: false,
    autoResize: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmTextarea>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmTextarea },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<LlmTextarea v-bind="args" v-model:value="value" />',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmTextarea },
    setup() {
      const bio = ref('');
      const notes = ref('');
      return { bio, notes };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <LlmTextarea label="Bio" placeholder="Tell us about yourself" v-model:value="bio" />
        <LlmTextarea label="Notes" :autoResize="true" placeholder="Auto-resizing textarea..." v-model:value="notes" />
        <LlmTextarea placeholder="Disabled" :disabled="true" />
        <LlmTextarea placeholder="With error" :invalid="true" :errors="['This field is required']" />
        <LlmTextarea :rows="6" placeholder="6 rows tall" />
      </div>
    `,
  }),
};
