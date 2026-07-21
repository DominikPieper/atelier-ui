import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlProgress } from './atl-progress';

import { metadata } from '@atelier-ui/spec/metadata/progress.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlProgress> = {
  title: 'Components/Display/AtlProgress',
  component: AtlProgress,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
    indeterminate: { control: 'boolean' },
  },
  args: { value: 50, max: 100, variant: 'default', size: 'md', indeterminate: false },
  parameters: { design: figmaNode('420-153'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlProgress>;

export const Default: Story = {
  parameters: { design: figmaNode('420-87') },
};
export const Success: Story = {
  args: { variant: 'success', value: 100 },
  parameters: { design: figmaNode('420-105') },
};
export const Warning: Story = {
  args: { variant: 'warning', value: 60 },
  parameters: { design: figmaNode('420-123') },
};
export const Danger: Story = {
  args: { variant: 'danger', value: 30 },
  parameters: { design: figmaNode('420-141') },
};
export const Small: Story = {
  args: { size: 'sm' },
  parameters: { design: figmaNode('420-81') },
};
export const Large: Story = {
  args: { size: 'lg' },
  parameters: { design: figmaNode('420-93') },
};
export const Indeterminate: Story = {
  args: { indeterminate: true },
  parameters: { design: figmaNode('420-87') },
};
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <AtlProgress value={75} variant="default" />
      <AtlProgress value={100} variant="success" />
      <AtlProgress value={60} variant="warning" />
      <AtlProgress value={30} variant="danger" />
    </div>
  ),
  parameters: { design: figmaNode('420-153') },
};
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <AtlProgress value={60} size="sm" />
      <AtlProgress value={60} size="md" />
      <AtlProgress value={60} size="lg" />
    </div>
  ),
  parameters: { design: figmaNode('420-153') },
};
