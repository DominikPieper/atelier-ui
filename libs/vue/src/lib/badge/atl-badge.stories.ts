import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlBadge from './atl-badge.vue';

import { metadata } from '@atelier-ui/spec/metadata/badge.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlBadge> = {
  title: 'Components/Display/AtlBadge',
  component: AtlBadge,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlBadge },
    setup() { return { args }; },
    template: '<AtlBadge v-bind="args">Badge</AtlBadge>',
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlBadge>;

export const Default: Story = {
  parameters: { design: figmaNode('55-12') },
};

export const Success: Story = {
  render: (args) => ({
    components: { AtlBadge },
    setup() { return { args }; },
    template: '<AtlBadge v-bind="args">Active</AtlBadge>',
  }),
  args: { variant: 'success' },
  parameters: { design: figmaNode('55-13') },
};

export const Warning: Story = {
  render: (args) => ({
    components: { AtlBadge },
    setup() { return { args }; },
    template: '<AtlBadge v-bind="args">Pending</AtlBadge>',
  }),
  args: { variant: 'warning' },
  parameters: { design: figmaNode('55-14') },
};

export const Danger: Story = {
  render: (args) => ({
    components: { AtlBadge },
    setup() { return { args }; },
    template: '<AtlBadge v-bind="args">Error</AtlBadge>',
  }),
  args: { variant: 'danger' },
  parameters: { design: figmaNode('55-15') },
};

export const Info: Story = {
  render: (args) => ({
    components: { AtlBadge },
    setup() { return { args }; },
    template: '<AtlBadge v-bind="args">Info</AtlBadge>',
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
    components: { AtlBadge },
    template: `
      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
        <AtlBadge variant="default">Default</AtlBadge>
        <AtlBadge variant="success">Success</AtlBadge>
        <AtlBadge variant="warning">Warning</AtlBadge>
        <AtlBadge variant="danger">Danger</AtlBadge>
        <AtlBadge variant="info">Info</AtlBadge>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { AtlBadge },
    template: `
      <div style="display:flex;gap:0.75rem;align-items:center">
        <AtlBadge variant="success" size="sm">Small</AtlBadge>
        <AtlBadge variant="success" size="md">Medium</AtlBadge>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlBadge },
    setup() { return { args }; },
    template: '<AtlBadge v-bind="args">Playground</AtlBadge>',
  }),
};
