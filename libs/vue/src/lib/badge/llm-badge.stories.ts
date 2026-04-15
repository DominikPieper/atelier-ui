import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmBadge from './llm-badge.vue';

const meta: Meta<typeof LlmBadge> = {
  title: 'Components/LlmBadge',
  component: LlmBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: {
    variant: 'default',
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof LlmBadge>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmBadge },
    setup() { return { args }; },
    template: '<LlmBadge v-bind="args">Badge</LlmBadge>',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmBadge },
    template: `
      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
        <LlmBadge variant="default">Default</LlmBadge>
        <LlmBadge variant="success">Success</LlmBadge>
        <LlmBadge variant="warning">Warning</LlmBadge>
        <LlmBadge variant="danger">Danger</LlmBadge>
        <LlmBadge variant="info">Info</LlmBadge>
        <LlmBadge variant="default" size="sm">Small</LlmBadge>
      </div>
    `,
  }),
};
