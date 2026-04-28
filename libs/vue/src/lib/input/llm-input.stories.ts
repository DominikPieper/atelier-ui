import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmInput from './llm-input.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmInput> = {
  title: 'Components/Inputs/LlmInput',
  component: LlmInput,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmInput },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<LlmInput v-bind="args" v-model:value="value" />',
  }),
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number', 'tel', 'url'] },
    placeholder: { control: 'text' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    invalid: false,
    disabled: false,
    readonly: false,
    required: false,
  },
  parameters: {
    design: figmaNode('129-33'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmInput>;

export const Default: Story = {
  parameters: { design: figmaNode('129-23') },
};

export const Email: Story = {
  args: { type: 'email', placeholder: 'you@example.com' },
};

export const Password: Story = {
  args: { type: 'password', placeholder: 'Enter password' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Cannot edit' },
};

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => ({
    components: { LlmInput },
    setup() { return { args }; },
    template: '<LlmInput v-bind="args" value="Read-only value" />',
  }),
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    components: { LlmInput },
    setup() {
      const errors = [
        'This field is required',
        'Please enter a valid email address',
      ];
      return { args, errors };
    },
    template: '<LlmInput v-bind="args" :errors="errors" />',
  }),
};

export const AllTypes: Story = {
  render: () => ({
    components: { LlmInput },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:320px">
        <LlmInput type="text" placeholder="Text input" />
        <LlmInput type="email" placeholder="Email input" />
        <LlmInput type="password" placeholder="Password input" />
        <LlmInput type="number" placeholder="Number input" />
        <LlmInput type="tel" placeholder="Tel input" />
        <LlmInput type="url" placeholder="URL input" />
      </div>
    `,
  }),
};

export const Required: Story = {
  args: { required: true, placeholder: 'Required field' },
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

export const Playground: Story = {
  render: (args) => ({
    components: { LlmInput },
    setup() { return { args }; },
    template: '<LlmInput v-bind="args" />',
  }),
};
