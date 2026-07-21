import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlInput from './atl-input.vue';

import { metadata } from '@atelier-ui/spec/metadata/input.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlInput> = {
  title: 'Components/Inputs/AtlInput',
  component: AtlInput,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlInput },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<AtlInput v-bind="args" v-model:value="value" />',
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlInput>;

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
    components: { AtlInput },
    setup() { return { args }; },
    template: '<AtlInput v-bind="args" value="Read-only value" />',
  }),
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    components: { AtlInput },
    setup() {
      const errors = [
        'This field is required',
        'Please enter a valid email address',
      ];
      return { args, errors };
    },
    template: '<AtlInput v-bind="args" :errors="errors" />',
  }),
};

export const AllTypes: Story = {
  render: () => ({
    components: { AtlInput },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:320px">
        <AtlInput type="text" placeholder="Text input" />
        <AtlInput type="email" placeholder="Email input" />
        <AtlInput type="password" placeholder="Password input" />
        <AtlInput type="number" placeholder="Number input" />
        <AtlInput type="tel" placeholder="Tel input" />
        <AtlInput type="url" placeholder="URL input" />
      </div>
    `,
  }),
};

export const Required: Story = {
  args: { required: true, placeholder: 'Required field' },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlInput },
    setup() {
      const email = ref('');
      const password = ref('');
      return { email, password };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <AtlInput label="Email" type="email" placeholder="you@example.com" v-model:value="email" />
        <AtlInput label="Password" type="password" placeholder="Password" v-model:value="password" />
        <AtlInput placeholder="Disabled" :disabled="true" />
        <AtlInput placeholder="With error" :invalid="true" :errors="['This field is required']" />
        <AtlInput placeholder="Read only" :readonly="true" value="Read only value" />
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlInput },
    setup() { return { args }; },
    template: '<AtlInput v-bind="args" />',
  }),
};
