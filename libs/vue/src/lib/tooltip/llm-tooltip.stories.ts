import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmTooltip from './llm-tooltip.vue';
import LlmButton from '../button/llm-button.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTooltip> = {
  title: 'Components/Overlay/LlmTooltip',
  component: LlmTooltip,
  tags: ['autodocs'],
  argTypes: {
    llmTooltipPosition: { control: 'select', options: ['above', 'below', 'left', 'right'] },
    llmTooltipDisabled: { control: 'boolean' },
    llmTooltipShowDelay: { control: 'number' },
    llmTooltipHideDelay: { control: 'number' },
  },
  args: {
    llmTooltip: 'Helpful tooltip',
    llmTooltipPosition: 'above',
    llmTooltipDisabled: false,
    llmTooltipShowDelay: 300,
    llmTooltipHideDelay: 0,
  },
  parameters: {
    design: figmaNode('55-52'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmTooltip>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmTooltip, LlmButton },
    setup() { return { args }; },
    template: `
      <div style="padding:4rem;display:flex;justify-content:center">
        <LlmTooltip v-bind="args">
          <LlmButton>Save</LlmButton>
        </LlmTooltip>
      </div>
    `,
  }),
  parameters: { design: figmaNode('55-48') },
};

export const Positions: Story = {
  render: () => ({
    components: { LlmTooltip, LlmButton },
    template: `
      <div style="padding:6rem;display:flex;gap:2rem;justify-content:center;flex-wrap:wrap">
        <LlmTooltip llmTooltip="Tooltip above" llmTooltipPosition="above"><LlmButton>Above</LlmButton></LlmTooltip>
        <LlmTooltip llmTooltip="Tooltip below" llmTooltipPosition="below"><LlmButton>Below</LlmButton></LlmTooltip>
        <LlmTooltip llmTooltip="Tooltip left" llmTooltipPosition="left"><LlmButton>Left</LlmButton></LlmTooltip>
        <LlmTooltip llmTooltip="Tooltip right" llmTooltipPosition="right"><LlmButton>Right</LlmButton></LlmTooltip>
      </div>
    `,
  }),
};

export const LongText: Story = {
  render: () => ({
    components: { LlmTooltip, LlmButton },
    template: `
      <div style="padding:4rem;display:flex;justify-content:center">
        <LlmTooltip llmTooltip="This is a longer tooltip message that will wrap across multiple lines when it exceeds the maximum width of the tooltip container.">
          <LlmButton>Hover for details</LlmButton>
        </LlmTooltip>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { LlmTooltip, LlmButton },
    template: `
      <div style="padding:4rem;display:flex;gap:2rem;justify-content:center">
        <LlmTooltip llmTooltip="This tooltip is active"><LlmButton>Enabled</LlmButton></LlmTooltip>
        <LlmTooltip llmTooltip="This tooltip is hidden" :llmTooltipDisabled="true"><LlmButton>Disabled</LlmButton></LlmTooltip>
      </div>
    `,
  }),
};

export const CustomDelay: Story = {
  render: () => ({
    components: { LlmTooltip, LlmButton },
    template: `
      <div style="padding:4rem;display:flex;gap:2rem;justify-content:center">
        <LlmTooltip llmTooltip="No delay" :llmTooltipShowDelay="0"><LlmButton>Instant</LlmButton></LlmTooltip>
        <LlmTooltip llmTooltip="300ms delay (default)"><LlmButton>Default</LlmButton></LlmTooltip>
        <LlmTooltip llmTooltip="1 second delay" :llmTooltipShowDelay="1000"><LlmButton>Slow</LlmButton></LlmTooltip>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmTooltip, LlmButton },
    template: `
      <div style="display:flex;gap:2rem;padding:4rem;justify-content:center;align-items:center;flex-wrap:wrap">
        <LlmTooltip llmTooltip="Above tooltip" llmTooltipPosition="above" :llmTooltipShowDelay="0">
          <LlmButton>Above</LlmButton>
        </LlmTooltip>
        <LlmTooltip llmTooltip="Below tooltip" llmTooltipPosition="below" :llmTooltipShowDelay="0">
          <LlmButton>Below</LlmButton>
        </LlmTooltip>
        <LlmTooltip llmTooltip="Left tooltip" llmTooltipPosition="left" :llmTooltipShowDelay="0">
          <LlmButton>Left</LlmButton>
        </LlmTooltip>
        <LlmTooltip llmTooltip="Right tooltip" llmTooltipPosition="right" :llmTooltipShowDelay="0">
          <LlmButton>Right</LlmButton>
        </LlmTooltip>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmTooltip, LlmButton },
    setup() { return { args }; },
    template: `
      <div style="padding:6rem;display:flex;justify-content:center">
        <LlmTooltip v-bind="args"><LlmButton>Hover me</LlmButton></LlmTooltip>
      </div>
    `,
  }),
};
