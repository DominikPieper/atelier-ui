import type { Meta, StoryObj } from '@storybook/react';
import { LlmProgress } from './llm-progress';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmProgress> = {
  title: 'Components/LlmProgress',
  component: LlmProgress,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
    indeterminate: { control: 'boolean' },
  },
  args: { value: 50, max: 100, variant: 'default', size: 'md', indeterminate: false },
  parameters: {
    design: figmaNode('3-875'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmProgress>;

export const Default: Story = { parameters: { design: figmaNode('55-104') } };
export const Success: Story = { args: { variant: 'success', value: 100 }, parameters: { design: figmaNode('55-110') } };
export const Warning: Story = { args: { variant: 'warning', value: 60 } };
export const Danger: Story = { args: { variant: 'danger', value: 30 } };
export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <LlmProgress value={75} variant="default" />
      <LlmProgress value={100} variant="success" />
      <LlmProgress value={60} variant="warning" />
      <LlmProgress value={30} variant="danger" />
    </div>
  ),
};
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <LlmProgress value={60} size="sm" />
      <LlmProgress value={60} size="md" />
      <LlmProgress value={60} size="lg" />
    </div>
  ),
};
