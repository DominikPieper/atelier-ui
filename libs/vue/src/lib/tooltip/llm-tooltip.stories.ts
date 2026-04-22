import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmTooltip from './llm-tooltip.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTooltip> = {
  title: 'Components/LlmTooltip',
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
    components: { LlmTooltip },
    setup() { return { args }; },
    template: '<LlmTooltip v-bind="args"><button>Hover me</button></LlmTooltip>',
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmTooltip },
    template: `
      <div style="display:flex;gap:2rem;padding:4rem;justify-content:center;align-items:center;flex-wrap:wrap">
        <LlmTooltip llmTooltip="Above tooltip" llmTooltipPosition="above" :llmTooltipShowDelay="0">
          <button>Above</button>
        </LlmTooltip>
        <LlmTooltip llmTooltip="Below tooltip" llmTooltipPosition="below" :llmTooltipShowDelay="0">
          <button>Below</button>
        </LlmTooltip>
        <LlmTooltip llmTooltip="Left tooltip" llmTooltipPosition="left" :llmTooltipShowDelay="0">
          <button>Left</button>
        </LlmTooltip>
        <LlmTooltip llmTooltip="Right tooltip" llmTooltipPosition="right" :llmTooltipShowDelay="0">
          <button>Right</button>
        </LlmTooltip>
      </div>
    `,
  }),
};
