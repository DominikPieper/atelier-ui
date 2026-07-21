import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlBadge } from './atl-badge';

import { metadata } from '@atelier-ui/spec/metadata/badge.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlBadge> = {
  title: 'Components/Display/AtlBadge',
  component: AtlBadge,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-badge ${argsToTemplate(args)}>Badge</atl-badge>`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
  args: {
    variant: 'default',
    size: 'md',
  },
  parameters: {
    design: figmaNode('55-22'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlBadge>;

export const Default: Story = {
  parameters: { design: figmaNode('55-12') },
};

export const Success: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-badge ${argsToTemplate(args)}>Active</atl-badge>`,
  }),
  args: { variant: 'success' },
  parameters: { design: figmaNode('55-13') },
};

export const Warning: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-badge ${argsToTemplate(args)}>Pending</atl-badge>`,
  }),
  args: { variant: 'warning' },
  parameters: { design: figmaNode('55-14') },
};

export const Danger: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-badge ${argsToTemplate(args)}>Error</atl-badge>`,
  }),
  args: { variant: 'danger' },
  parameters: { design: figmaNode('55-15') },
};

export const Info: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-badge ${argsToTemplate(args)}>Info</atl-badge>`,
  }),
  args: { variant: 'info' },
  parameters: { design: figmaNode('55-16') },
};

export const Small: Story = {
  args: { size: 'sm' },
  parameters: { design: figmaNode('55-17') },
};

export const Medium: Story = {
  args: { size: 'md' },
  parameters: { design: figmaNode('55-12') },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
        <atl-badge variant="default">Default</atl-badge>
        <atl-badge variant="success">Success</atl-badge>
        <atl-badge variant="warning">Warning</atl-badge>
        <atl-badge variant="danger">Danger</atl-badge>
        <atl-badge variant="info">Info</atl-badge>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <atl-badge variant="success" size="sm">Small</atl-badge>
        <atl-badge variant="success" size="md">Medium</atl-badge>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-badge ${argsToTemplate(args)}>Playground</atl-badge>`,
  }),
};
