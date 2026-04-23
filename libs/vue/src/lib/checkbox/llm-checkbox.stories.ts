import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmCheckbox from './llm-checkbox.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmCheckbox> = {
  title: 'Components/Inputs/LlmCheckbox',
  component: LlmCheckbox,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmCheckbox },
    setup() { return { args }; },
    template: '<LlmCheckbox v-bind="args">Accept terms</LlmCheckbox>',
  }),
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    checked: false,
    disabled: false,
    invalid: false,
    required: false,
    indeterminate: false,
  },
  parameters: {
    design: figmaNode('55-36'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmCheckbox>;

export const Default: Story = {
  parameters: { design: figmaNode('55-32') },
};

export const Checked: Story = {
  args: { checked: true },
  parameters: { design: figmaNode('55-33') },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { design: figmaNode('55-35') },
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
    components: { LlmCheckbox },
    setup() {
      const errors = ['You must accept the terms'];
      return { args, errors };
    },
    template: '<LlmCheckbox v-bind="args" :errors="errors">Accept terms</LlmCheckbox>',
  }),
};

export const Required: Story = {
  args: { required: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
  render: (args) => ({
    components: { LlmCheckbox },
    setup() { return { args }; },
    template: '<LlmCheckbox v-bind="args">Select all</LlmCheckbox>',
  }),
  parameters: { design: figmaNode('55-34') },
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

export const Playground: Story = {
  render: (args) => ({
    components: { LlmCheckbox },
    setup() { return { args }; },
    template: '<LlmCheckbox v-bind="args">Playground label</LlmCheckbox>',
  }),
};
