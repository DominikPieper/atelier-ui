import type { Meta, StoryObj } from '@storybook/react';
import { LlmAlert } from './llm-alert';

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
    children: 'Alert message here.',
  },
};

export default meta;
type Story = StoryObj<typeof LlmAlert>;

export const Default: Story = {};

export const Info: Story = {
  args: { variant: 'info', children: 'This is an informational message.' },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Changes saved successfully.' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Your session expires soon.' },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Something went wrong.' },
};

export const Dismissible: Story = {
  args: { dismissible: true, variant: 'warning', children: 'Dismiss me.' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <LlmAlert variant="info">Info message</LlmAlert>
      <LlmAlert variant="success">Success message</LlmAlert>
      <LlmAlert variant="warning">Warning message</LlmAlert>
      <LlmAlert variant="danger">Danger message</LlmAlert>
    </div>
  ),
};

export const AllDismissible: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <LlmAlert variant="info" dismissible>
        Info message (dismissible)
      </LlmAlert>
      <LlmAlert variant="success" dismissible>
        Success message (dismissible)
      </LlmAlert>
      <LlmAlert variant="warning" dismissible>
        Warning message (dismissible)
      </LlmAlert>
      <LlmAlert variant="danger" dismissible>
        Danger message (dismissible)
      </LlmAlert>
    </div>
  ),
};
