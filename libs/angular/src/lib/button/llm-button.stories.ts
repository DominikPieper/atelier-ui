import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmButton } from './llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmButton> = {
  title: 'Components/LlmButton',
  component: LlmButton,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-button ${argsToTemplate(args)}>Button</llm-button>`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
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
    design: figmaNode('3-119'),
  },
};

export default meta;
type Story = StoryObj<LlmButton>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: 'primary' },
  parameters: { design: figmaNode('49-47') },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  parameters: { design: figmaNode('49-71') },
};

export const Outline: Story = {
  args: { variant: 'outline' },
  parameters: { design: figmaNode('49-95') },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: { design: figmaNode('49-51') },
};

export const Loading: Story = {
  args: { loading: true },
  parameters: { design: figmaNode('49-53') },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <llm-button variant="primary">Primary</llm-button>
        <llm-button variant="secondary">Secondary</llm-button>
        <llm-button variant="outline">Outline</llm-button>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <llm-button size="sm">Small</llm-button>
        <llm-button size="md">Medium</llm-button>
        <llm-button size="lg">Large</llm-button>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-button ${argsToTemplate(args)}>Playground</llm-button>`,
  }),
};
