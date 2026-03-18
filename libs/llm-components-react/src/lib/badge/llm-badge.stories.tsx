import type { Meta, StoryObj } from '@storybook/react';
import { LlmBadge } from './llm-badge';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmBadge> = {
  title: 'Components/LlmBadge',
  component: LlmBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger', 'info'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  args: { variant: 'default', size: 'md', children: 'Badge' },
  parameters: {
    design: figmaNode('3-456'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmBadge>;

export const Default: Story = {};
export const Success: Story = { args: { variant: 'success', children: 'Success' } };
export const Warning: Story = { args: { variant: 'warning', children: 'Warning' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Error' } };
export const Info: Story = { args: { variant: 'info', children: 'Info' } };
export const Small: Story = { args: { variant: 'default', size: 'sm', children: 'New' } };

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <LlmBadge variant="default">Default</LlmBadge>
      <LlmBadge variant="success">Success</LlmBadge>
      <LlmBadge variant="warning">Warning</LlmBadge>
      <LlmBadge variant="danger">Danger</LlmBadge>
      <LlmBadge variant="info">Info</LlmBadge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <LlmBadge variant="default" size="sm">Default sm</LlmBadge>
        <LlmBadge variant="success" size="sm">Success sm</LlmBadge>
        <LlmBadge variant="warning" size="sm">Warning sm</LlmBadge>
        <LlmBadge variant="danger" size="sm">Danger sm</LlmBadge>
        <LlmBadge variant="info" size="sm">Info sm</LlmBadge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <LlmBadge variant="default" size="md">Default md</LlmBadge>
        <LlmBadge variant="success" size="md">Success md</LlmBadge>
        <LlmBadge variant="warning" size="md">Warning md</LlmBadge>
        <LlmBadge variant="danger" size="md">Danger md</LlmBadge>
        <LlmBadge variant="info" size="md">Info md</LlmBadge>
      </div>
    </div>
  ),
};
