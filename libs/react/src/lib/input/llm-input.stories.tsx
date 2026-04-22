import type { Meta, StoryObj } from '@storybook/react-vite';
import { LlmInput } from './llm-input';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmInput> = {
  title: 'Components/LlmInput',
  component: LlmInput,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
  args: { type: 'text', placeholder: 'Enter value' },
  parameters: {
    design: figmaNode('129-33'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmInput>;

export const Default: Story = {
  parameters: { design: figmaNode('129-23') },
};

export const WithLabel: Story = {
  args: { label: 'Email address', type: 'email', placeholder: 'you@example.com' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Disabled value', placeholder: '' },
  parameters: { design: figmaNode('129-31') },
};

export const ReadOnly: Story = {
  args: { readOnly: true, value: 'Read-only value', placeholder: '' },
};

export const Invalid: Story = {
  args: { invalid: true, errors: ['This field is required'], label: 'Name' },
};

export const InvalidWithMultipleErrors: Story = {
  args: {
    invalid: true,
    errors: ['This field is required', 'Must be at least 3 characters'],
    label: 'Username',
  },
};

export const Password: Story = {
  args: { type: 'password', label: 'Password', placeholder: '••••••••' },
};

export const Email: Story = {
  args: { type: 'email', label: 'Email', placeholder: 'you@example.com' },
};

export const Number: Story = {
  args: { type: 'number', label: 'Quantity', placeholder: '0' },
};

export const Tel: Story = {
  args: { type: 'tel', label: 'Phone number', placeholder: '+1 (555) 000-0000' },
};

export const Url: Story = {
  args: { type: 'url', label: 'Website', placeholder: 'https://example.com' },
};

export const Required: Story = {
  args: { required: true, label: 'Full name', placeholder: 'Enter your full name' },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px' }}>
      <LlmInput label="Default" placeholder="Enter text" />
      <LlmInput label="Disabled" disabled value="Disabled value" />
      <LlmInput label="Read-only" readOnly value="Read-only value" />
      <LlmInput label="Invalid" invalid errors={['This field is required']} />
    </div>
  ),
};
