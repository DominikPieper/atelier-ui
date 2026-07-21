import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlSkeleton } from './atl-skeleton';

import { metadata } from '@atelier-ui/spec/metadata/skeleton.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlSkeleton> = {
  title: 'Components/Display/AtlSkeleton',
  component: AtlSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    animated: { control: 'boolean' },
  },
  args: { variant: 'text', animated: true },
  parameters: {
    design: figmaNode('55-102'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlSkeleton>;

export const Default: Story = { parameters: { design: figmaNode('55-99') } };
export const Circular: Story = { args: { variant: 'circular', width: '48px' }, parameters: { design: figmaNode('55-100') } };
export const Rectangular: Story = { args: { variant: 'rectangular', height: '200px' }, parameters: { design: figmaNode('55-101') } };
export const TextLines: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '320px' }}>
      <AtlSkeleton variant="text" />
      <AtlSkeleton variant="text" width="80%" />
      <AtlSkeleton variant="text" width="60%" />
    </div>
  ),
};

export const NoAnimation: Story = { args: { variant: 'rectangular', height: '200px', animated: false } };

export const CardLayout: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <AtlSkeleton variant="circular" width="48px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AtlSkeleton variant="text" width="40%" />
        <AtlSkeleton variant="text" />
        <AtlSkeleton variant="text" width="80%" />
      </div>
    </div>
  ),
};
