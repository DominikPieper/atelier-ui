import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlToggle from './atl-toggle.vue';

import { metadata } from '@atelier-ui/spec/metadata/toggle.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlToggle> = {
  title: 'Components/Inputs/AtlToggle',
  component: AtlToggle,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlToggle },
    setup() { return { args }; },
    template: '<AtlToggle v-bind="args">Enable notifications</AtlToggle>',
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlToggle>;

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
    components: { AtlToggle },
    setup() {
      const errors = ['You must enable this setting'];
      return { args, errors };
    },
    template: '<AtlToggle v-bind="args" :errors="errors">Enable notifications</AtlToggle>',
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlToggle },
    setup() {
      const emailNotifs = ref(true);
      const pushNotifs = ref(false);
      return { emailNotifs, pushNotifs };
    },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem">
        <AtlToggle v-model:checked="emailNotifs">Email notifications</AtlToggle>
        <AtlToggle v-model:checked="pushNotifs">Push notifications</AtlToggle>
        <AtlToggle :disabled="true">Disabled toggle</AtlToggle>
        <AtlToggle :checked="true" :disabled="true">Disabled checked</AtlToggle>
        <AtlToggle :invalid="true" :errors="['This setting is required']">With error</AtlToggle>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlToggle },
    setup() { return { args }; },
    template: '<AtlToggle v-bind="args">Playground label</AtlToggle>',
  }),
};
