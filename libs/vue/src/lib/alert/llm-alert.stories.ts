import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmAlert from './llm-alert.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmAlert> = {
  title: 'Components/Feedback/LlmAlert',
  component: LlmAlert,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmAlert },
    setup() { return { args }; },
    template: '<LlmAlert v-bind="args">This is an alert message.</LlmAlert>',
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmAlert>;

export const Default: Story = {
  parameters: { design: figmaNode('55-23') },
};

export const Success: Story = {
  render: (args) => ({
    components: { LlmAlert },
    setup() { return { args }; },
    template: '<LlmAlert v-bind="args">Your changes were saved successfully.</LlmAlert>',
  }),
  args: { variant: 'success' },
  parameters: { design: figmaNode('55-25') },
};

export const Warning: Story = {
  render: (args) => ({
    components: { LlmAlert },
    setup() { return { args }; },
    template: '<LlmAlert v-bind="args">Your session expires in 5 minutes.</LlmAlert>',
  }),
  args: { variant: 'warning' },
  parameters: { design: figmaNode('55-27') },
};

export const Danger: Story = {
  render: (args) => ({
    components: { LlmAlert },
    setup() { return { args }; },
    template: '<LlmAlert v-bind="args">An error occurred. Please try again.</LlmAlert>',
  }),
  args: { variant: 'danger' },
  parameters: { design: figmaNode('55-29') },
};

export const Dismissible: Story = {
  render: (args) => ({
    components: { LlmAlert },
    setup() { return { args }; },
    template: '<LlmAlert v-bind="args">This alert can be dismissed.</LlmAlert>',
  }),
  args: { variant: 'warning', dismissible: true },
  parameters: { design: figmaNode('55-28') },
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <LlmAlert variant="info">Info: Here is some useful information.</LlmAlert>
        <LlmAlert variant="success">Success: Your changes were saved.</LlmAlert>
        <LlmAlert variant="warning">Warning: Your session expires soon.</LlmAlert>
        <LlmAlert variant="danger">Error: Something went wrong.</LlmAlert>
      </div>
    `,
  }),
};

export const AllDismissible: Story = {
  render: () => ({
    components: { LlmAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <LlmAlert variant="info" :dismissible="true">Info: Here is some useful information.</LlmAlert>
        <LlmAlert variant="success" :dismissible="true">Success: Your changes were saved.</LlmAlert>
        <LlmAlert variant="warning" :dismissible="true">Warning: Your session expires soon.</LlmAlert>
        <LlmAlert variant="danger" :dismissible="true">Error: Something went wrong.</LlmAlert>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmAlert },
    setup() { return { args }; },
    template: '<LlmAlert v-bind="args">Playground alert message.</LlmAlert>',
  }),
};
