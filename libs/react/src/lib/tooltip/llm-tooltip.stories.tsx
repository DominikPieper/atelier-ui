import type { Meta, StoryObj } from '@storybook/react-vite';
import { LlmTooltip } from './llm-tooltip';
import { LlmButton } from '../button/llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTooltip> = {
  title: 'Components/Overlay/LlmTooltip',
  component: LlmTooltip,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-52'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmTooltip>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <LlmTooltip llmTooltip="Save your changes">
        <LlmButton>Save</LlmButton>
      </LlmTooltip>
    </div>
  ),
  parameters: { design: figmaNode('55-48') },
};

export const Positions: Story = {
  render: () => (
    <div
      style={{
        padding: '4rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <LlmTooltip llmTooltip="Above tooltip" llmTooltipPosition="above">
        <LlmButton variant="outline">Above</LlmButton>
      </LlmTooltip>
      <LlmTooltip llmTooltip="Below tooltip" llmTooltipPosition="below">
        <LlmButton variant="outline">Below</LlmButton>
      </LlmTooltip>
      <LlmTooltip llmTooltip="Left tooltip" llmTooltipPosition="left">
        <LlmButton variant="outline">Left</LlmButton>
      </LlmTooltip>
      <LlmTooltip llmTooltip="Right tooltip" llmTooltipPosition="right">
        <LlmButton variant="outline">Right</LlmButton>
      </LlmTooltip>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <LlmTooltip llmTooltip="This tooltip is disabled" llmTooltipDisabled>
        <LlmButton variant="secondary">No tooltip</LlmButton>
      </LlmTooltip>
    </div>
  ),
};

export const CustomDelay: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <LlmTooltip llmTooltip="Slow tooltip (1s delay)" llmTooltipShowDelay={1000}>
        <LlmButton variant="outline">Slow tooltip</LlmButton>
      </LlmTooltip>
    </div>
  ),
};
