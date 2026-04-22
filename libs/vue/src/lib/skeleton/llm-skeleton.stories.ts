import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmSkeleton from './llm-skeleton.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmSkeleton> = {
  title: 'Components/LlmSkeleton',
  component: LlmSkeleton,
  tags: ['autodocs'],
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

export const Default: Story = {};

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
