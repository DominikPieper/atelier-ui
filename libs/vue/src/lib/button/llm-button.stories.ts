import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmButton from './llm-button.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmButton> = {
  title: 'Components/LlmButton',
  component: LlmButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  parameters: {
    design: figmaNode('129-20'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmButton>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmButton },
    setup() { return { args }; },
    template: '<LlmButton v-bind="args">Button</LlmButton>',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmButton },
    template: `
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
        <LlmButton variant="primary">Primary</LlmButton>
        <LlmButton variant="secondary">Secondary</LlmButton>
        <LlmButton variant="outline">Outline</LlmButton>
        <LlmButton variant="primary" size="sm">Small</LlmButton>
        <LlmButton variant="primary" size="lg">Large</LlmButton>
        <LlmButton variant="primary" :disabled="true">Disabled</LlmButton>
        <LlmButton variant="primary" :loading="true">Loading</LlmButton>
      </div>
    `,
  }),
};
