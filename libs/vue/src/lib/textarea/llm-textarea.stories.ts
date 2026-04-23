import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmTextarea from './llm-textarea.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTextarea> = {
  title: 'Components/Inputs/LlmTextarea',
  component: LlmTextarea,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmTextarea },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<LlmTextarea v-bind="args" v-model:value="value" />',
  }),
  argTypes: {
    rows: { control: { type: 'number', min: 1, max: 20 } },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    autoResize: { control: 'boolean' },
  },
  args: {
    rows: 3,
    placeholder: 'Enter text...',
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    autoResize: false,
  },
  parameters: {
    design: figmaNode('55-87'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmTextarea>;

export const Default: Story = {
  parameters: { design: figmaNode('55-82') },
};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Tell us about yourself...' },
};

export const TallRows: Story = {
  args: { rows: 8, placeholder: 'Enter a long description...' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Cannot edit' },
  parameters: { design: figmaNode('55-86') },
};

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => ({
    components: { LlmTextarea },
    setup() { return { args }; },
    template: '<LlmTextarea v-bind="args" value="This content cannot be edited." />',
  }),
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    components: { LlmTextarea },
    setup() {
      const errors = [
        'This field is required',
        'Must be at least 20 characters',
      ];
      return { args, errors };
    },
    template: '<LlmTextarea v-bind="args" :errors="errors" />',
  }),
};

export const AutoResize: Story = {
  args: { autoResize: true, placeholder: 'Start typing — this grows automatically...' },
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

export const Playground: Story = {
  render: (args) => ({
    components: { LlmTextarea },
    setup() { return { args }; },
    template: '<LlmTextarea v-bind="args" />',
  }),
};
