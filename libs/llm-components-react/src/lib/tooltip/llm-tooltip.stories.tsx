import type { Meta, StoryObj } from '@storybook/react';
import { LlmTooltip } from './llm-tooltip';
import { LlmButton } from '../button/llm-button';

const meta: Meta<typeof LlmTooltip> = {
  title: 'Components/LlmTooltip',
  component: LlmTooltip,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LlmTooltip>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <LlmTooltip content="Save your changes">
        <LlmButton>Save</LlmButton>
      </LlmTooltip>
    </div>
  ),
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
      <LlmTooltip content="Above tooltip" position="above">
        <LlmButton variant="outline">Above</LlmButton>
      </LlmTooltip>
      <LlmTooltip content="Below tooltip" position="below">
        <LlmButton variant="outline">Below</LlmButton>
      </LlmTooltip>
      <LlmTooltip content="Left tooltip" position="left">
        <LlmButton variant="outline">Left</LlmButton>
      </LlmTooltip>
      <LlmTooltip content="Right tooltip" position="right">
        <LlmButton variant="outline">Right</LlmButton>
      </LlmTooltip>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <LlmTooltip content="This tooltip is disabled" disabled>
        <LlmButton variant="secondary">No tooltip</LlmButton>
      </LlmTooltip>
    </div>
  ),
};

export const CustomDelay: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <LlmTooltip content="Slow tooltip (1s delay)" showDelay={1000}>
        <LlmButton variant="outline">Slow tooltip</LlmButton>
      </LlmTooltip>
    </div>
  ),
};
