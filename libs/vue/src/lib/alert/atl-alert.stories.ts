import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlAlert from './atl-alert.vue';

import { metadata } from '@atelier-ui/spec/metadata/alert.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlAlert> = {
  title: 'Components/Feedback/AtlAlert',
  component: AtlAlert,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlAlert },
    setup() { return { args }; },
    template: '<AtlAlert v-bind="args">This is an alert message.</AtlAlert>',
  }),
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
    dismissible: { control: 'boolean' },
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
type Story = StoryObj<typeof AtlAlert>;

export const Default: Story = {
  parameters: { design: figmaNode('55-23') },
};

export const Success: Story = {
  render: (args) => ({
    components: { AtlAlert },
    setup() { return { args }; },
    template: '<AtlAlert v-bind="args">Your changes were saved successfully.</AtlAlert>',
  }),
  args: { variant: 'success' },
  parameters: { design: figmaNode('55-25') },
};

export const Warning: Story = {
  render: (args) => ({
    components: { AtlAlert },
    setup() { return { args }; },
    template: '<AtlAlert v-bind="args">Your session expires in 5 minutes.</AtlAlert>',
  }),
  args: { variant: 'warning' },
  parameters: { design: figmaNode('55-27') },
};

export const Danger: Story = {
  render: (args) => ({
    components: { AtlAlert },
    setup() { return { args }; },
    template: '<AtlAlert v-bind="args">An error occurred. Please try again.</AtlAlert>',
  }),
  args: { variant: 'danger' },
  parameters: { design: figmaNode('55-29') },
};

export const Dismissible: Story = {
  render: (args) => ({
    components: { AtlAlert },
    setup() { return { args }; },
    template: '<AtlAlert v-bind="args">This alert can be dismissed.</AtlAlert>',
  }),
  args: { variant: 'warning', dismissible: true },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <AtlAlert variant="info">Info: Here is some useful information.</AtlAlert>
        <AtlAlert variant="success">Success: Your changes were saved.</AtlAlert>
        <AtlAlert variant="warning">Warning: Your session expires soon.</AtlAlert>
        <AtlAlert variant="danger">Error: Something went wrong.</AtlAlert>
      </div>
    `,
  }),
};

export const AllDismissible: Story = {
  render: () => ({
    components: { AtlAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <AtlAlert variant="info" :dismissible="true">Info: Here is some useful information.</AtlAlert>
        <AtlAlert variant="success" :dismissible="true">Success: Your changes were saved.</AtlAlert>
        <AtlAlert variant="warning" :dismissible="true">Warning: Your session expires soon.</AtlAlert>
        <AtlAlert variant="danger" :dismissible="true">Error: Something went wrong.</AtlAlert>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlAlert },
    setup() { return { args }; },
    template: '<AtlAlert v-bind="args">Playground alert message.</AtlAlert>',
  }),
};
