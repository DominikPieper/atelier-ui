import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmAlert from './llm-alert.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmAlert> = {
  title: 'Components/LlmAlert',
  component: LlmAlert,
  tags: ['autodocs'],
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
  render: (args) => ({
    components: { LlmAlert },
    setup() { return { args }; },
    template: '<LlmAlert v-bind="args">This is an alert message.</LlmAlert>',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmAlert },
    template: `
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <LlmAlert variant="info">Info: Your session will expire in 10 minutes.</LlmAlert>
        <LlmAlert variant="success">Success: Your changes have been saved.</LlmAlert>
        <LlmAlert variant="warning" :dismissible="true">Warning: You are running low on storage.</LlmAlert>
        <LlmAlert variant="danger" :dismissible="true">Error: Something went wrong.</LlmAlert>
      </div>
    `,
  }),
};
