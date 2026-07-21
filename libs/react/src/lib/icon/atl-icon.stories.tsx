import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlIcon } from './atl-icon';
import type { AtlIconName } from '../spec';

import { metadata } from '@atelier-ui/spec/metadata/icon.metadata';
const ICON_NAMES: AtlIconName[] = [
  'success', 'warning', 'danger', 'info', 'error',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'sort-asc', 'sort-desc', 'arrow-right', 'arrow-left',
  'copy', 'paste', 'add', 'edit', 'delete', 'close', 'more', 'default-toast',
];

const meta: Meta<typeof AtlIcon> = {
  title: 'Components/Display/AtlIcon',
  component: AtlIcon,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: { name: 'success', size: 'md' },
  parameters: { docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlIcon>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <AtlIcon name="success" size="sm" />
      <AtlIcon name="success" size="md" />
      <AtlIcon name="success" size="lg" />
    </div>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <AtlIcon name="success" label="Success" />
      <AtlIcon name="warning" label="Warning" />
      <AtlIcon name="danger" label="Danger" />
      <AtlIcon name="info" label="Info" />
      <AtlIcon name="error" label="Error" />
    </div>
  ),
};

export const NavigationChevrons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <AtlIcon name="chevron-up" />
      <AtlIcon name="chevron-down" />
      <AtlIcon name="chevron-left" />
      <AtlIcon name="chevron-right" />
      <AtlIcon name="sort-asc" />
      <AtlIcon name="sort-desc" />
      <AtlIcon name="arrow-left" />
      <AtlIcon name="arrow-right" />
    </div>
  ),
};

export const ActionIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <AtlIcon name="copy" />
      <AtlIcon name="paste" />
      <AtlIcon name="add" />
      <AtlIcon name="edit" />
      <AtlIcon name="delete" />
      <AtlIcon name="close" />
      <AtlIcon name="more" />
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1.25rem',
      maxWidth: '540px',
    }}>
      {ICON_NAMES.map((n) => (
        <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <AtlIcon name={n} size="lg" />
          <span style={{ fontSize: '0.6875rem', color: 'var(--ui-color-text-muted)', textAlign: 'center' }}>{n}</span>
        </div>
      ))}
    </div>
  ),
};

export const WithAccessibleLabel: Story = {
  args: { name: 'warning', label: 'Warning' },
};
