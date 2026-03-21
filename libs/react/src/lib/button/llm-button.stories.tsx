import type { Meta, StoryObj } from '@storybook/react';
import { LlmButton } from './llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmButton> = {
  title: 'Components/LlmButton',
  component: LlmButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: { variant: 'primary', size: 'md', disabled: false, loading: false, children: 'Button' },
  parameters: {
    design: figmaNode('3-119'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmButton>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: 'primary' }, parameters: { design: figmaNode('49-47') } };
export const Secondary: Story = { args: { variant: 'secondary' }, parameters: { design: figmaNode('49-71') } };
export const Outline: Story = { args: { variant: 'outline' }, parameters: { design: figmaNode('49-95') } };
export const Small: Story = { args: { size: 'sm' }, parameters: { design: figmaNode('49-39') } };
export const Large: Story = { args: { size: 'lg' }, parameters: { design: figmaNode('49-55') } };
export const Disabled: Story = { args: { disabled: true }, parameters: { design: figmaNode('49-51') } };
export const Loading: Story = { args: { loading: true }, parameters: { design: figmaNode('49-53') } };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <LlmButton variant="primary">Primary</LlmButton>
      <LlmButton variant="secondary">Secondary</LlmButton>
      <LlmButton variant="outline">Outline</LlmButton>
    </div>
  ),
};
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <LlmButton size="sm">Small</LlmButton>
      <LlmButton size="md">Medium</LlmButton>
      <LlmButton size="lg">Large</LlmButton>
    </div>
  ),
};
