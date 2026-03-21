import type { Meta, StoryObj } from '@storybook/vue3';
import LlmProgress from './llm-progress.vue';

const meta: Meta<typeof LlmProgress> = {
  title: 'Components/LlmProgress',
  component: LlmProgress,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
    max: { control: 'number' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    value: 60,
    max: 100,
    variant: 'default',
    size: 'md',
    indeterminate: false,
  },
};

export default meta;
type Story = StoryObj<typeof LlmProgress>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <LlmProgress :value="60" variant="default" />
        <LlmProgress :value="80" variant="success" />
        <LlmProgress :value="40" variant="warning" />
        <LlmProgress :value="20" variant="danger" />
        <LlmProgress :indeterminate="true" />
        <LlmProgress :value="50" size="sm" />
        <LlmProgress :value="50" size="lg" />
      </div>
    `,
  }),
};
