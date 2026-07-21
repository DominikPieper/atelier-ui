import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlTextarea from './atl-textarea.vue';

import { metadata } from '@atelier-ui/spec/metadata/textarea.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlTextarea> = {
  title: 'Components/Inputs/AtlTextarea',
  component: AtlTextarea,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlTextarea },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: '<AtlTextarea v-bind="args" v-model:value="value" />',
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlTextarea>;

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
};

export const Readonly: Story = {
  args: { readonly: true },
  render: (args) => ({
    components: { AtlTextarea },
    setup() { return { args }; },
    template: '<AtlTextarea v-bind="args" value="This content cannot be edited." />',
  }),
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    components: { AtlTextarea },
    setup() {
      const errors = [
        'This field is required',
        'Must be at least 20 characters',
      ];
      return { args, errors };
    },
    template: '<AtlTextarea v-bind="args" :errors="errors" />',
  }),
};

export const AutoResize: Story = {
  args: { autoResize: true, placeholder: 'Start typing — this grows automatically...' },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlTextarea },
    setup() {
      const bio = ref('');
      const notes = ref('');
      return { bio, notes };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <AtlTextarea label="Bio" placeholder="Tell us about yourself" v-model:value="bio" />
        <AtlTextarea label="Notes" :autoResize="true" placeholder="Auto-resizing textarea..." v-model:value="notes" />
        <AtlTextarea placeholder="Disabled" :disabled="true" />
        <AtlTextarea placeholder="With error" :invalid="true" :errors="['This field is required']" />
        <AtlTextarea :rows="6" placeholder="6 rows tall" />
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlTextarea },
    setup() { return { args }; },
    template: '<AtlTextarea v-bind="args" />',
  }),
};
