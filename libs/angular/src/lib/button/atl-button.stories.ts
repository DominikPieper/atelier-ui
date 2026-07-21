import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlButton } from './atl-button';

import { metadata } from '@atelier-ui/spec/metadata/button.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlButton> = {
  title: 'Components/Inputs/AtlButton',
  component: AtlButton,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-button ${argsToTemplate(args)}>Button</atl-button>`,
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlButton>;

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
        <atl-button variant="primary">Primary</atl-button>
        <atl-button variant="secondary">Secondary</atl-button>
        <atl-button variant="outline">Outline</atl-button>
        <atl-button variant="danger">Danger</atl-button>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
        <atl-button size="sm">Small</atl-button>
        <atl-button size="md">Medium</atl-button>
        <atl-button size="lg">Large</atl-button>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-button ${argsToTemplate(args)}>Playground</atl-button>`,
  }),
};
