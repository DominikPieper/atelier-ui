import type { Meta, StoryObj } from '@storybook/react-vite';
import { LlmAlert } from './llm-alert';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmAlert> = {
  title: 'Components/Feedback/LlmAlert',
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
  parameters: {
    design: figmaNode('55-31'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmAlert>;

export const Default: Story = {
  parameters: { design: figmaNode('55-23') },
};

export const Info: Story = {
  args: { variant: 'info', children: 'This is an informational message.' },
  parameters: { design: figmaNode('55-23') },
};

export const Success: Story = {
  args: { variant: 'success', children: 'Changes saved successfully.' },
  parameters: { design: figmaNode('55-25') },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Your session expires soon.' },
  parameters: { design: figmaNode('55-27') },
};

export const Danger: Story = {
  args: { variant: 'danger', children: 'Something went wrong.' },
  parameters: { design: figmaNode('55-29') },
};

export const Dismissible: Story = {
  args: { dismissible: true, variant: 'warning', children: 'Dismiss me.' },
  parameters: { design: figmaNode('55-28') },
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
