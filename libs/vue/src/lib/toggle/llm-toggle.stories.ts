import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmToggle from './llm-toggle.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmToggle> = {
  title: 'Components/Inputs/LlmToggle',
  component: LlmToggle,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmToggle },
    setup() { return { args }; },
    template: '<LlmToggle v-bind="args">Enable notifications</LlmToggle>',
  }),
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    checked: false,
    disabled: false,
    invalid: false,
    required: false,
  },
  parameters: {
    design: figmaNode('55-41'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmToggle>;

export const Default: Story = {
  parameters: { design: figmaNode('55-37') },
};

export const Checked: Story = {
  args: { checked: true },
  parameters: { design: figmaNode('55-38') },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true },
};

export const Invalid: Story = {
  args: { invalid: true },
};

export const WithErrors: Story = {
  args: { invalid: true },
  render: (args) => ({
    components: { LlmToggle },
    setup() {
      const errors = ['You must enable this setting'];
      return { args, errors };
    },
    template: '<LlmToggle v-bind="args" :errors="errors">Enable notifications</LlmToggle>',
  }),
};

export const Required: Story = {
  args: { required: true },
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

export const Playground: Story = {
  render: (args) => ({
    components: { LlmToggle },
    setup() { return { args }; },
    template: '<LlmToggle v-bind="args">Playground label</LlmToggle>',
  }),
};
