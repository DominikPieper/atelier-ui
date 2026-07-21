import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlAlert } from './atl-alert';

import { metadata } from '@atelier-ui/spec/metadata/alert.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlAlert> = {
  title: 'Components/Feedback/AtlAlert',
  component: AtlAlert,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-alert ${argsToTemplate(args)}>This is an alert message.</atl-alert>`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
    dismissible: {
      control: 'boolean',
    },
    dismissed: { action: 'dismissed' },
  },
  args: {
    variant: 'info',
    dismissible: false,
  },
  parameters: {
    design: figmaNode('55-31'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlAlert>;

export const Default: Story = {
  parameters: { design: figmaNode('55-23') },
};

export const Success: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-alert ${argsToTemplate(args)}>Your changes were saved successfully.</atl-alert>`,
  }),
  args: { variant: 'success' },
  parameters: { design: figmaNode('55-25') },
};

export const Warning: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-alert ${argsToTemplate(args)}>Your session expires in 5 minutes.</atl-alert>`,
  }),
  args: { variant: 'warning' },
  parameters: { design: figmaNode('55-27') },
};

export const Danger: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-alert ${argsToTemplate(args)}>An error occurred. Please try again.</atl-alert>`,
  }),
  args: { variant: 'danger' },
  parameters: { design: figmaNode('55-29') },
};

export const Dismissible: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-alert ${argsToTemplate(args)}>This alert can be dismissed.</atl-alert>`,
  }),
  args: { variant: 'warning', dismissible: true },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <atl-alert variant="info">Info: Here is some useful information.</atl-alert>
        <atl-alert variant="success">Success: Your changes were saved.</atl-alert>
        <atl-alert variant="warning">Warning: Your session expires soon.</atl-alert>
        <atl-alert variant="danger">Error: Something went wrong.</atl-alert>
      </div>
    `,
  }),
};

export const AllDismissible: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <atl-alert variant="info" [dismissible]="true">Info: Here is some useful information.</atl-alert>
        <atl-alert variant="success" [dismissible]="true">Success: Your changes were saved.</atl-alert>
        <atl-alert variant="warning" [dismissible]="true">Warning: Your session expires soon.</atl-alert>
        <atl-alert variant="danger" [dismissible]="true">Error: Something went wrong.</atl-alert>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-alert ${argsToTemplate(args)}>Playground alert message.</atl-alert>`,
  }),
};
