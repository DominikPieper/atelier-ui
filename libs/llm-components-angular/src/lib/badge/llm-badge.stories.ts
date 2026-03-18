import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmBadge } from './llm-badge';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmBadge> = {
  title: 'Components/LlmBadge',
  component: LlmBadge,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-badge ${argsToTemplate(args)}>Badge</llm-badge>`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
  args: {
    variant: 'default',
    size: 'md',
  },
  parameters: {
    design: figmaNode('3-456'),
  },
};

export default meta;
type Story = StoryObj<LlmBadge>;

export const Default: Story = {};

export const Success: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-badge ${argsToTemplate(args)}>Active</llm-badge>`,
  }),
  args: { variant: 'success' },
};

export const Warning: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-badge ${argsToTemplate(args)}>Pending</llm-badge>`,
  }),
  args: { variant: 'warning' },
};

export const Danger: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-badge ${argsToTemplate(args)}>Error</llm-badge>`,
  }),
  args: { variant: 'danger' },
};

export const Info: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-badge ${argsToTemplate(args)}>Info</llm-badge>`,
  }),
  args: { variant: 'info' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
        <llm-badge variant="default">Default</llm-badge>
        <llm-badge variant="success">Success</llm-badge>
        <llm-badge variant="warning">Warning</llm-badge>
        <llm-badge variant="danger">Danger</llm-badge>
        <llm-badge variant="info">Info</llm-badge>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <llm-badge variant="success" size="sm">Small</llm-badge>
        <llm-badge variant="success" size="md">Medium</llm-badge>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-badge ${argsToTemplate(args)}>Playground</llm-badge>`,
  }),
};
