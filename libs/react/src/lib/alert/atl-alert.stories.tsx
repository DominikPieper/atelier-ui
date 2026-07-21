import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlAlert } from './atl-alert';

import { metadata } from '@atelier-ui/spec/metadata/alert.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlAlert> = {
  title: 'Components/Feedback/AtlAlert',
  component: AtlAlert,
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlAlert>;

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
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AtlAlert variant="info">Info message</AtlAlert>
      <AtlAlert variant="success">Success message</AtlAlert>
      <AtlAlert variant="warning">Warning message</AtlAlert>
      <AtlAlert variant="danger">Danger message</AtlAlert>
    </div>
  ),
};

export const AllDismissible: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <AtlAlert variant="info" dismissible>
        Info message (dismissible)
      </AtlAlert>
      <AtlAlert variant="success" dismissible>
        Success message (dismissible)
      </AtlAlert>
      <AtlAlert variant="warning" dismissible>
        Warning message (dismissible)
      </AtlAlert>
      <AtlAlert variant="danger" dismissible>
        Danger message (dismissible)
      </AtlAlert>
    </div>
  ),
};
