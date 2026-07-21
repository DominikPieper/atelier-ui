import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlTextarea } from './atl-textarea';

import { metadata } from '@atelier-ui/spec/metadata/textarea.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlTextarea> = {
  title: 'Components/Inputs/AtlTextarea',
  component: AtlTextarea,
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
    design: figmaNode('55-87'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlTextarea>;

export const Default: Story = {
  parameters: { design: figmaNode('55-82') },
};

export const WithLabel: Story = {
  args: { label: 'Bio', placeholder: 'Tell us about yourself' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'This content is disabled.' },
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
      <AtlTextarea label="Default" placeholder="Enter text" />
      <AtlTextarea label="Disabled" disabled value="Disabled content" />
      <AtlTextarea label="Read-only" readOnly value="Read-only content" />
      <AtlTextarea label="Invalid" invalid errors={['This field is required']} />
      <AtlTextarea label="Auto-resize" autoResize placeholder="Type to auto-resize..." />
    </div>
  ),
};
