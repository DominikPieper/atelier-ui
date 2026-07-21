import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlAvatar, AtlAvatarGroup } from './atl-avatar';

import { metadata } from '@atelier-ui/spec/metadata/avatar.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlAvatar> = {
  title: 'Components/Display/AtlAvatar',
  component: AtlAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'select', options: ['circle', 'square'] },
    status: { control: 'select', options: ['', 'online', 'offline', 'away', 'busy'] },
  },
  args: { size: 'md', shape: 'circle', status: '' },
  parameters: {
    design: figmaNode('55-151'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlAvatar>;

export const Default: Story = { args: { name: 'Jane Doe' }, parameters: { design: figmaNode('55-148') } };
export const WithImage: Story = {
  args: { src: 'https://i.pravatar.cc/150?img=1', alt: 'User', size: 'lg' },
  parameters: { design: figmaNode('55-149') },
};
export const Initials: Story = {
  args: { name: 'John Smith', size: 'lg' },
  parameters: { design: figmaNode('55-149') },
};
export const WithStatus: Story = { args: { name: 'Alice', status: 'online' } };
export const Square: Story = {
  args: { name: 'AB', shape: 'square', size: 'lg' },
  parameters: { design: figmaNode('73-392') },
};
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <AtlAvatar key={size} size={size} name="AB" />
      ))}
    </div>
  ),
};
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {(['online', 'offline', 'away', 'busy'] as const).map(status => (
        <AtlAvatar key={status} name="AB" status={status} size="lg" />
      ))}
    </div>
  ),
};
export const Group: Story = {
  render: () => (
    <AtlAvatarGroup max={3} size="md">
      <AtlAvatar name="Alice" />
      <AtlAvatar name="Bob" />
      <AtlAvatar name="Carol" />
      <AtlAvatar name="Dave" />
      <AtlAvatar name="Eve" />
    </AtlAvatarGroup>
  ),
  parameters: { design: figmaNode('507-6305') },
};
