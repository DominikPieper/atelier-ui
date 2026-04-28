import type { Meta, StoryObj } from '@storybook/react-vite';
import { LlmIcon } from './llm-icon';
import type { LlmIconName } from '../spec';

const ICON_NAMES: LlmIconName[] = [
  'success', 'warning', 'danger', 'info', 'error',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'sort-asc', 'sort-desc', 'arrow-right', 'arrow-left',
  'copy', 'paste', 'add', 'edit', 'delete', 'close', 'more', 'default-toast',
];

const meta: Meta<typeof LlmIcon> = {
  title: 'Components/Display/LlmIcon',
  component: LlmIcon,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: { name: 'success', size: 'md' },
};

export default meta;
type Story = StoryObj<typeof LlmIcon>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <LlmIcon name="success" size="sm" />
      <LlmIcon name="success" size="md" />
      <LlmIcon name="success" size="lg" />
    </div>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <LlmIcon name="success" label="Success" />
      <LlmIcon name="warning" label="Warning" />
      <LlmIcon name="danger" label="Danger" />
      <LlmIcon name="info" label="Info" />
      <LlmIcon name="error" label="Error" />
    </div>
  ),
};

export const NavigationChevrons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <LlmIcon name="chevron-up" />
      <LlmIcon name="chevron-down" />
      <LlmIcon name="chevron-left" />
      <LlmIcon name="chevron-right" />
      <LlmIcon name="sort-asc" />
      <LlmIcon name="sort-desc" />
      <LlmIcon name="arrow-left" />
      <LlmIcon name="arrow-right" />
    </div>
  ),
};

export const ActionIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <LlmIcon name="copy" />
      <LlmIcon name="paste" />
      <LlmIcon name="add" />
      <LlmIcon name="edit" />
      <LlmIcon name="delete" />
      <LlmIcon name="close" />
      <LlmIcon name="more" />
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
          <LlmIcon name={n} size="lg" />
          <span style={{ fontSize: '0.6875rem', color: 'var(--ui-color-text-muted)', textAlign: 'center' }}>{n}</span>
        </div>
      ))}
    </div>
  ),
};

export const WithAccessibleLabel: Story = {
  args: { name: 'warning', label: 'Warning' },
};
