import type { Meta, StoryObj } from '@storybook/react';
import { LlmTextarea } from './llm-textarea';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTextarea> = {
  title: 'Components/LlmTextarea',
  component: LlmTextarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    autoResize: { control: 'boolean' },
    rows: { control: 'number' },
  },
  args: { placeholder: 'Enter text here...', rows: 3 },
  parameters: {
    design: figmaNode('3-798'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmTextarea>;

export const Default: Story = {
  parameters: { design: figmaNode('55-82') },
};

export const WithLabel: Story = {
  args: { label: 'Bio', placeholder: 'Tell us about yourself' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'This content is disabled.' },
  parameters: { design: figmaNode('55-86') },
};

export const ReadOnly: Story = {
  args: { readOnly: true, value: 'This content is read-only.' },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    errors: ['This field is required'],
    label: 'Description',
  },
};

export const AutoResize: Story = {
  args: {
    autoResize: true,
    label: 'Auto-resizing textarea',
    placeholder: 'Start typing and the textarea will grow...',
  },
};

export const TallRows: Story = {
  args: { rows: 8, label: 'Long description', placeholder: 'Enter a detailed description...' },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
      <LlmTextarea label="Default" placeholder="Enter text" />
      <LlmTextarea label="Disabled" disabled value="Disabled content" />
      <LlmTextarea label="Read-only" readOnly value="Read-only content" />
      <LlmTextarea label="Invalid" invalid errors={['This field is required']} />
      <LlmTextarea label="Auto-resize" autoResize placeholder="Type to auto-resize..." />
    </div>
  ),
};
