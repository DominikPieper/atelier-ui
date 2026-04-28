import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmBadge from './llm-badge.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmBadge> = {
  title: 'Components/Display/LlmBadge',
  component: LlmBadge,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmBadge },
    setup() { return { args }; },
    template: '<LlmBadge v-bind="args">Badge</LlmBadge>',
  }),
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: {
    variant: 'default',
    size: 'md',
  },
  parameters: {
    design: figmaNode('55-22'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmBadge>;

export const Default: Story = {
  parameters: { design: figmaNode('55-12') },
};

export const Success: Story = {
  render: (args) => ({
    components: { LlmBadge },
    setup() { return { args }; },
    template: '<LlmBadge v-bind="args">Active</LlmBadge>',
  }),
  args: { variant: 'success' },
  parameters: { design: figmaNode('55-13') },
};

export const Warning: Story = {
  render: (args) => ({
    components: { LlmBadge },
    setup() { return { args }; },
    template: '<LlmBadge v-bind="args">Pending</LlmBadge>',
  }),
  args: { variant: 'warning' },
  parameters: { design: figmaNode('55-14') },
};

export const Danger: Story = {
  render: (args) => ({
    components: { LlmBadge },
    setup() { return { args }; },
    template: '<LlmBadge v-bind="args">Error</LlmBadge>',
  }),
  args: { variant: 'danger' },
  parameters: { design: figmaNode('55-15') },
};

export const Info: Story = {
  render: (args) => ({
    components: { LlmBadge },
    setup() { return { args }; },
    template: '<LlmBadge v-bind="args">Info</LlmBadge>',
  }),
  args: { variant: 'info' },
  parameters: { design: figmaNode('55-16') },
};

export const Small: Story = {
  args: { size: 'sm' },
  parameters: { design: figmaNode('55-17') },
};

export const Medium: Story = {
  args: { size: 'md' },
  parameters: { design: figmaNode('55-12') },
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmBadge },
    template: `
      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
        <LlmBadge variant="default">Default</LlmBadge>
        <LlmBadge variant="success">Success</LlmBadge>
        <LlmBadge variant="warning">Warning</LlmBadge>
        <LlmBadge variant="danger">Danger</LlmBadge>
        <LlmBadge variant="info">Info</LlmBadge>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { LlmBadge },
    template: `
      <div style="display:flex;gap:0.75rem;align-items:center">
        <LlmBadge variant="success" size="sm">Small</LlmBadge>
        <LlmBadge variant="success" size="md">Medium</LlmBadge>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmBadge },
    setup() { return { args }; },
    template: '<LlmBadge v-bind="args">Playground</LlmBadge>',
  }),
};
