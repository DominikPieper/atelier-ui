import type { Meta, StoryObj } from '@storybook/angular';
import { LlmTooltip } from './llm-tooltip';
import { LlmButton } from '../button/llm-button';

const meta: Meta<LlmTooltip> = {
  title: 'Components/LlmTooltip',
  component: LlmTooltip,
  tags: ['autodocs'],
  argTypes: {
    llmTooltipPosition: {
      control: 'select',
      options: ['above', 'below', 'left', 'right'],
    },
    llmTooltipShowDelay: { control: 'number' },
    llmTooltipHideDelay: { control: 'number' },
    llmTooltipDisabled: { control: 'boolean' },
  },
  args: {
    llmTooltipPosition: 'above',
    llmTooltipShowDelay: 300,
    llmTooltipHideDelay: 0,
    llmTooltipDisabled: false,
  },
};

export default meta;
type Story = StoryObj<LlmTooltip>;

export const Default: Story = {
  render: () => ({
    imports: [LlmButton],
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <llm-button llmTooltip="Save your changes">Save</llm-button>
      </div>
    `,
  }),
};

export const Positions: Story = {
  render: () => ({
    imports: [LlmButton],
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
        <llm-button llmTooltip="Tooltip above" llmTooltipPosition="above">Above</llm-button>
        <llm-button llmTooltip="Tooltip below" llmTooltipPosition="below">Below</llm-button>
        <llm-button llmTooltip="Tooltip left" llmTooltipPosition="left">Left</llm-button>
        <llm-button llmTooltip="Tooltip right" llmTooltipPosition="right">Right</llm-button>
      </div>
    `,
  }),
};

export const LongText: Story = {
  render: () => ({
    imports: [LlmButton],
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <llm-button
          llmTooltip="This is a longer tooltip message that will wrap across multiple lines when it exceeds the maximum width of the tooltip container."
        >Hover for details</llm-button>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    imports: [LlmButton],
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <llm-button llmTooltip="This tooltip is active">Enabled</llm-button>
        <llm-button llmTooltip="This tooltip is hidden" [llmTooltipDisabled]="true">Disabled</llm-button>
      </div>
    `,
  }),
};

export const CustomDelay: Story = {
  render: () => ({
    imports: [LlmButton],
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <llm-button llmTooltip="No delay" [llmTooltipShowDelay]="0">Instant</llm-button>
        <llm-button llmTooltip="300ms delay (default)">Default</llm-button>
        <llm-button llmTooltip="1 second delay" [llmTooltipShowDelay]="1000">Slow</llm-button>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, tooltipText: 'Tooltip content' },
    imports: [LlmButton],
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <llm-button
          [llmTooltip]="tooltipText"
          [llmTooltipPosition]="llmTooltipPosition"
          [llmTooltipShowDelay]="llmTooltipShowDelay"
          [llmTooltipHideDelay]="llmTooltipHideDelay"
          [llmTooltipDisabled]="llmTooltipDisabled"
        >Hover me</llm-button>
      </div>
    `,
  }),
};
