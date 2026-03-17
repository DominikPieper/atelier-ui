import type { Meta, StoryObj } from '@storybook/react';
import { LlmAvatar, LlmAvatarGroup } from './llm-avatar';

const meta: Meta<typeof LlmAvatar> = {
  title: 'Components/LlmAvatar',
  component: LlmAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    status: { control: 'select', options: ['', 'online', 'offline', 'away', 'busy'] },
  },
  args: { size: 'md', shape: 'circle', status: '' },
};

export default meta;
type Story = StoryObj<typeof LlmAvatar>;

export const Default: Story = { args: { name: 'Jane Doe' } };
export const WithImage: Story = { args: { src: 'https://i.pravatar.cc/150?img=1', alt: 'User', size: 'lg' } };
export const Initials: Story = { args: { name: 'John Smith', size: 'lg' } };
export const WithStatus: Story = { args: { name: 'Alice', status: 'online' } };
export const Square: Story = { args: { name: 'AB', shape: 'square', size: 'lg' } };
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <LlmAvatar key={size} size={size} name="AB" />
      ))}
    </div>
  ),
};
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {(['online', 'offline', 'away', 'busy'] as const).map(status => (
        <LlmAvatar key={status} name="AB" status={status} size="lg" />
      ))}
    </div>
  ),
};
export const Group: Story = {
  render: () => (
    <LlmAvatarGroup max={3} size="md">
      <LlmAvatar name="Alice" />
      <LlmAvatar name="Bob" />
      <LlmAvatar name="Carol" />
      <LlmAvatar name="Dave" />
      <LlmAvatar name="Eve" />
    </LlmAvatarGroup>
  ),
};
