import type { Meta, StoryObj } from '@storybook/react-vite';
import { LlmSkeleton } from './llm-skeleton';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmSkeleton> = {
  title: 'Components/Display/LlmSkeleton',
  component: LlmSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    animated: { control: 'boolean' },
  },
  args: { variant: 'text', animated: true },
  parameters: {
    design: figmaNode('55-102'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmSkeleton>;

export const Default: Story = { parameters: { design: figmaNode('55-99') } };
export const Circular: Story = { args: { variant: 'circular', width: '48px' }, parameters: { design: figmaNode('55-100') } };
export const Rectangular: Story = { args: { variant: 'rectangular', height: '200px' }, parameters: { design: figmaNode('55-101') } };
export const TextLines: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '320px' }}>
      <LlmSkeleton variant="text" />
      <LlmSkeleton variant="text" width="80%" />
      <LlmSkeleton variant="text" width="60%" />
    </div>
  ),
};

export const NoAnimation: Story = { args: { variant: 'rectangular', height: '200px', animated: false } };

export const CardLayout: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <LlmSkeleton variant="circular" width="48px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <LlmSkeleton variant="text" width="40%" />
        <LlmSkeleton variant="text" />
        <LlmSkeleton variant="text" width="80%" />
      </div>
    </div>
  ),
};
