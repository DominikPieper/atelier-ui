import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmButton from './llm-button.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmButton> = {
  title: 'Components/Inputs/LlmButton',
  component: LlmButton,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmButton },
    setup() { return { args }; },
    template: '<LlmButton v-bind="args">Button</LlmButton>',
  }),
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

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: 'primary' },
  parameters: { design: figmaNode('129-4') },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  parameters: { design: figmaNode('129-10') },
};

export const Outline: Story = {
  args: { variant: 'outline' },
  parameters: { design: figmaNode('129-16') },
};

export const Small: Story = {
  args: { size: 'sm' },
  parameters: { design: figmaNode('129-2') },
};

export const Medium: Story = {
  args: { size: 'md' },
  parameters: { design: figmaNode('129-4') },
};

export const Large: Story = {
  args: { size: 'lg' },
  parameters: { design: figmaNode('129-6') },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmButton },
    template: `
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
        <LlmButton variant="primary">Primary</LlmButton>
        <LlmButton variant="secondary">Secondary</LlmButton>
        <LlmButton variant="outline">Outline</LlmButton>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { LlmButton },
    template: `
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
        <LlmButton size="sm">Small</LlmButton>
        <LlmButton size="md">Medium</LlmButton>
        <LlmButton size="lg">Large</LlmButton>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmButton },
    setup() { return { args }; },
    template: '<LlmButton v-bind="args">Playground</LlmButton>',
  }),
};
