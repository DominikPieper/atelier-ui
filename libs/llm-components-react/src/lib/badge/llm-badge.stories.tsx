import type { Meta, StoryObj } from '@storybook/react';
import { LlmBadge } from './llm-badge';

const meta: Meta<typeof LlmBadge> = {
  title: 'Components/LlmBadge',
  component: LlmBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: { variant: 'default', size: 'md', children: 'Badge' },
};

export default meta;
type Story = StoryObj<typeof LlmBadge>;

export const Default: Story = {};
export const Success: Story = { args: { variant: 'success', children: 'Success' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Warning' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Error' } };
export const Info: Story = { args: { variant: 'info', children: 'Info' } };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <LlmBadge variant="default">Default</LlmBadge>
      <LlmBadge variant="success">Success</LlmBadge>
      <LlmBadge variant="warning">Warning</LlmBadge>
      <LlmBadge variant="danger">Danger</LlmBadge>
      <LlmBadge variant="info">Info</LlmBadge>
    </div>
  ),
};
