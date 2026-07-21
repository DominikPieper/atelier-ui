import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlSkeleton from './atl-skeleton.vue';

import { metadata } from '@atelier-ui/spec/metadata/skeleton.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlSkeleton> = {
  title: 'Components/Display/AtlSkeleton',
  component: AtlSkeleton,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlSkeleton },
    setup() { return { args }; },
    template: '<AtlSkeleton v-bind="args" />',
  }),
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    width: { control: 'text' },
    height: { control: 'text' },
    animated: { control: 'boolean' },
  },
  args: {
    variant: 'text',
    width: '100%',
    animated: true,
  },
  parameters: {
    design: figmaNode('55-102'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlSkeleton>;

export const Default: Story = {
  parameters: { design: figmaNode('55-99') },
};

export const TextLines: Story = {
  render: () => ({
    components: { AtlSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.5rem;max-width:400px">
        <AtlSkeleton width="100%" />
        <AtlSkeleton width="90%" />
        <AtlSkeleton width="75%" />
        <AtlSkeleton width="60%" />
      </div>
    `,
  }),
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: '40px',
  },
  parameters: { design: figmaNode('55-100') },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: '100%',
    height: '200px',
  },
  parameters: { design: figmaNode('55-101') },
};

export const CardSkeleton: Story = {
  render: () => ({
    components: { AtlSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:320px;padding:1rem;border:1px solid var(--ui-color-border, #e5e7eb);border-radius:8px">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <AtlSkeleton variant="circular" width="48px" />
          <div style="flex:1;display:flex;flex-direction:column;gap:0.375rem">
            <AtlSkeleton width="60%" />
            <AtlSkeleton width="40%" />
          </div>
        </div>
        <AtlSkeleton variant="rectangular" height="160px" />
        <div style="display:flex;flex-direction:column;gap:0.375rem">
          <AtlSkeleton width="100%" />
          <AtlSkeleton width="85%" />
          <AtlSkeleton width="70%" />
        </div>
      </div>
    `,
  }),
};

export const NoAnimation: Story = {
  args: { animated: false },
  render: (args) => ({
    components: { AtlSkeleton },
    setup() { return { args }; },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.5rem;max-width:400px">
        <AtlSkeleton v-bind="args" width="100%" />
        <AtlSkeleton v-bind="args" width="80%" />
        <AtlSkeleton v-bind="args" width="60%" />
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <AtlSkeleton variant="text" />
        <AtlSkeleton variant="text" width="60%" />
        <AtlSkeleton variant="circular" width="48px" />
        <AtlSkeleton variant="rectangular" height="120px" />
        <div style="display:flex;gap:1rem;align-items:center">
          <AtlSkeleton variant="circular" width="48px" />
          <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem">
            <AtlSkeleton variant="text" width="40%" />
            <AtlSkeleton variant="text" />
            <AtlSkeleton variant="text" width="80%" />
          </div>
        </div>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlSkeleton },
    setup() { return { args }; },
    template: '<AtlSkeleton v-bind="args" />',
  }),
};
