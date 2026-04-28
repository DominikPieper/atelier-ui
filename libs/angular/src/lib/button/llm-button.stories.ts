import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmButton } from './llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmButton> = {
  title: 'Components/Inputs/LlmButton',
  component: LlmButton,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-button ${argsToTemplate(args)}>Button</llm-button>`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger'],
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
    design: figmaNode('129-20'),
  },
};

export default meta;
type Story = StoryObj<LlmButton>;

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

export const Danger: Story = {
  args: { variant: 'danger' },
  parameters: { design: figmaNode('468-2590') },
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
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <llm-button variant="primary">Primary</llm-button>
        <llm-button variant="secondary">Secondary</llm-button>
        <llm-button variant="outline">Outline</llm-button>
        <llm-button variant="danger">Danger</llm-button>
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
