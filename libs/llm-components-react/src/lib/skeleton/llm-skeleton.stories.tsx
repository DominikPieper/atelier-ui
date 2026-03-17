import type { Meta, StoryObj } from '@storybook/react';
import { LlmSkeleton } from './llm-skeleton';

const meta: Meta<typeof LlmSkeleton> = {
  title: 'Components/LlmSkeleton',
  component: LlmSkeleton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['text', 'circular', 'rectangular'] },
    animated: { control: 'boolean' },
  },
  args: { variant: 'text', animated: true },
};

export default meta;
type Story = StoryObj<typeof LlmSkeleton>;

export const Default: Story = {};
export const Circular: Story = { args: { variant: 'circular', width: '48px' } };
export const Rectangular: Story = { args: { variant: 'rectangular', height: '200px' } };
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
