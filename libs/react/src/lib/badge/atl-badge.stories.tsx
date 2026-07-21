import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlBadge } from './atl-badge';

import { metadata } from '@atelier-ui/spec/metadata/badge.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlBadge> = {
  title: 'Components/Display/AtlBadge',
  component: AtlBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: { variant: 'default', size: 'md', children: 'Badge' },
  parameters: {
    design: figmaNode('55-22'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlBadge>;

export const Default: Story = { parameters: { design: figmaNode('55-12') } };
export const Success: Story = { args: { variant: 'success', children: 'Success' }, parameters: { design: figmaNode('55-13') } };
export const Warning: Story = { args: { variant: 'warning', children: 'Warning' }, parameters: { design: figmaNode('55-14') } };
export const Danger: Story = { args: { variant: 'danger', children: 'Error' }, parameters: { design: figmaNode('55-15') } };
export const Info: Story = { args: { variant: 'info', children: 'Info' }, parameters: { design: figmaNode('55-16') } };
export const Small: Story = { args: { variant: 'default', size: 'sm', children: 'New' }, parameters: { design: figmaNode('55-17') } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <AtlBadge variant="default">Default</AtlBadge>
      <AtlBadge variant="success">Success</AtlBadge>
      <AtlBadge variant="warning">Warning</AtlBadge>
      <AtlBadge variant="danger">Danger</AtlBadge>
      <AtlBadge variant="info">Info</AtlBadge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <AtlBadge variant="default" size="sm">Default sm</AtlBadge>
        <AtlBadge variant="success" size="sm">Success sm</AtlBadge>
        <AtlBadge variant="warning" size="sm">Warning sm</AtlBadge>
        <AtlBadge variant="danger" size="sm">Danger sm</AtlBadge>
        <AtlBadge variant="info" size="sm">Info sm</AtlBadge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <AtlBadge variant="default" size="md">Default md</AtlBadge>
        <AtlBadge variant="success" size="md">Success md</AtlBadge>
        <AtlBadge variant="warning" size="md">Warning md</AtlBadge>
        <AtlBadge variant="danger" size="md">Danger md</AtlBadge>
        <AtlBadge variant="info" size="md">Info md</AtlBadge>
      </div>
    </div>
  ),
};
