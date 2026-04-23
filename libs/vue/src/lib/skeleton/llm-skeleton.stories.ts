import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmSkeleton from './llm-skeleton.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmSkeleton> = {
  title: 'Components/Display/LlmSkeleton',
  component: LlmSkeleton,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmSkeleton },
    setup() { return { args }; },
    template: '<LlmSkeleton v-bind="args" />',
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmSkeleton>;

export const Default: Story = {
  parameters: { design: figmaNode('55-99') },
};

export const TextLines: Story = {
  render: () => ({
    components: { LlmSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.5rem;max-width:400px">
        <LlmSkeleton width="100%" />
        <LlmSkeleton width="90%" />
        <LlmSkeleton width="75%" />
        <LlmSkeleton width="60%" />
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
    components: { LlmSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:320px;padding:1rem;border:1px solid var(--ui-color-border, #e5e7eb);border-radius:8px">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <LlmSkeleton variant="circular" width="48px" />
          <div style="flex:1;display:flex;flex-direction:column;gap:0.375rem">
            <LlmSkeleton width="60%" />
            <LlmSkeleton width="40%" />
          </div>
        </div>
        <LlmSkeleton variant="rectangular" height="160px" />
        <div style="display:flex;flex-direction:column;gap:0.375rem">
          <LlmSkeleton width="100%" />
          <LlmSkeleton width="85%" />
          <LlmSkeleton width="70%" />
        </div>
      </div>
    `,
  }),
};

export const NoAnimation: Story = {
  args: { animated: false },
  render: (args) => ({
    components: { LlmSkeleton },
    setup() { return { args }; },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.5rem;max-width:400px">
        <LlmSkeleton v-bind="args" width="100%" />
        <LlmSkeleton v-bind="args" width="80%" />
        <LlmSkeleton v-bind="args" width="60%" />
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmSkeleton },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <LlmSkeleton variant="text" />
        <LlmSkeleton variant="text" width="60%" />
        <LlmSkeleton variant="circular" width="48px" />
        <LlmSkeleton variant="rectangular" height="120px" />
        <div style="display:flex;gap:1rem;align-items:center">
          <LlmSkeleton variant="circular" width="48px" />
          <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem">
            <LlmSkeleton variant="text" width="40%" />
            <LlmSkeleton variant="text" />
            <LlmSkeleton variant="text" width="80%" />
          </div>
        </div>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmSkeleton },
    setup() { return { args }; },
    template: '<LlmSkeleton v-bind="args" />',
  }),
};
