import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlIcon } from './atl-icon';

import { metadata } from '@atelier-ui/spec/metadata/icon.metadata';
const ICON_NAMES = [
  'success', 'warning', 'danger', 'info', 'error',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'sort-asc', 'sort-desc', 'arrow-right', 'arrow-left',
  'copy', 'paste', 'add', 'edit', 'delete', 'close', 'more', 'default-toast',
] as const;

const meta: Meta<AtlIcon> = {
  title: 'Components/Display/AtlIcon',
  component: AtlIcon,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-icon ${argsToTemplate(args)} />`,
  }),
  argTypes: {
    name: { control: 'select', options: [...ICON_NAMES] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: { name: 'success', size: 'md' },
  parameters: { docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<AtlIcon>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <atl-icon name="success" size="sm" />
        <atl-icon name="success" size="md" />
        <atl-icon name="success" size="lg" />
      </div>
    `,
  }),
};

export const StatusIcons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <atl-icon name="success" label="Success" />
        <atl-icon name="warning" label="Warning" />
        <atl-icon name="danger" label="Danger" />
        <atl-icon name="info" label="Info" />
        <atl-icon name="error" label="Error" />
      </div>
    `,
  }),
};

export const NavigationChevrons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <atl-icon name="chevron-up" />
        <atl-icon name="chevron-down" />
        <atl-icon name="chevron-left" />
        <atl-icon name="chevron-right" />
        <atl-icon name="sort-asc" />
        <atl-icon name="sort-desc" />
        <atl-icon name="arrow-left" />
        <atl-icon name="arrow-right" />
      </div>
    `,
  }),
};

export const ActionIcons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <atl-icon name="copy" />
        <atl-icon name="paste" />
        <atl-icon name="add" />
        <atl-icon name="edit" />
        <atl-icon name="delete" />
        <atl-icon name="close" />
        <atl-icon name="more" />
      </div>
    `,
  }),
};

export const AllIcons: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.25rem; max-width: 540px;">
        ${ICON_NAMES.map(
          (n) => `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.375rem;">
              <atl-icon name="${n}" size="lg" />
              <span style="font-size: 0.6875rem; color: var(--ui-color-text-muted); text-align: center;">${n}</span>
            </div>
          `,
        ).join('')}
      </div>
    `,
  }),
};

export const WithAccessibleLabel: Story = {
  args: { name: 'warning', label: 'Warning' },
};

export const Playground: Story = {};
