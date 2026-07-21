import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlTooltip from './atl-tooltip.vue';
import AtlButton from '../button/atl-button.vue';

import { metadata } from '@atelier-ui/spec/metadata/tooltip.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlTooltip> = {
  title: 'Components/Overlay/AtlTooltip',
  component: AtlTooltip,
  tags: ['autodocs'],
  argTypes: {
    atlTooltipPosition: { control: 'select', options: ['above', 'below', 'left', 'right'] },
    atlTooltipDisabled: { control: 'boolean' },
    atlTooltipShowDelay: { control: 'number' },
    atlTooltipHideDelay: { control: 'number' },
  },
  args: {
    atlTooltip: 'Helpful tooltip',
    atlTooltipPosition: 'above',
    atlTooltipDisabled: false,
    atlTooltipShowDelay: 300,
    atlTooltipHideDelay: 0,
  },
  parameters: {
    design: figmaNode('55-52'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlTooltip>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlTooltip, AtlButton },
    setup() { return { args }; },
    template: `
      <div style="padding:4rem;display:flex;justify-content:center">
        <AtlTooltip v-bind="args">
          <AtlButton>Save</AtlButton>
        </AtlTooltip>
      </div>
    `,
  }),
  parameters: { design: figmaNode('55-48') },
};

export const Positions: Story = {
  render: () => ({
    components: { AtlTooltip, AtlButton },
    template: `
      <div style="padding:6rem;display:flex;gap:2rem;justify-content:center;flex-wrap:wrap">
        <AtlTooltip atlTooltip="Tooltip above" atlTooltipPosition="above"><AtlButton>Above</AtlButton></AtlTooltip>
        <AtlTooltip atlTooltip="Tooltip below" atlTooltipPosition="below"><AtlButton>Below</AtlButton></AtlTooltip>
        <AtlTooltip atlTooltip="Tooltip left" atlTooltipPosition="left"><AtlButton>Left</AtlButton></AtlTooltip>
        <AtlTooltip atlTooltip="Tooltip right" atlTooltipPosition="right"><AtlButton>Right</AtlButton></AtlTooltip>
      </div>
    `,
  }),
};

export const LongText: Story = {
  render: () => ({
    components: { AtlTooltip, AtlButton },
    template: `
      <div style="padding:4rem;display:flex;justify-content:center">
        <AtlTooltip atlTooltip="This is a longer tooltip message that will wrap across multiple lines when it exceeds the maximum width of the tooltip container.">
          <AtlButton>Hover for details</AtlButton>
        </AtlTooltip>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { AtlTooltip, AtlButton },
    template: `
      <div style="padding:4rem;display:flex;gap:2rem;justify-content:center">
        <AtlTooltip atlTooltip="This tooltip is active"><AtlButton>Enabled</AtlButton></AtlTooltip>
        <AtlTooltip atlTooltip="This tooltip is hidden" :atlTooltipDisabled="true"><AtlButton>Disabled</AtlButton></AtlTooltip>
      </div>
    `,
  }),
};

export const CustomDelay: Story = {
  render: () => ({
    components: { AtlTooltip, AtlButton },
    template: `
      <div style="padding:4rem;display:flex;gap:2rem;justify-content:center">
        <AtlTooltip atlTooltip="No delay" :atlTooltipShowDelay="0"><AtlButton>Instant</AtlButton></AtlTooltip>
        <AtlTooltip atlTooltip="300ms delay (default)"><AtlButton>Default</AtlButton></AtlTooltip>
        <AtlTooltip atlTooltip="1 second delay" :atlTooltipShowDelay="1000"><AtlButton>Slow</AtlButton></AtlTooltip>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlTooltip, AtlButton },
    template: `
      <div style="display:flex;gap:2rem;padding:4rem;justify-content:center;align-items:center;flex-wrap:wrap">
        <AtlTooltip atlTooltip="Above tooltip" atlTooltipPosition="above" :atlTooltipShowDelay="0">
          <AtlButton>Above</AtlButton>
        </AtlTooltip>
        <AtlTooltip atlTooltip="Below tooltip" atlTooltipPosition="below" :atlTooltipShowDelay="0">
          <AtlButton>Below</AtlButton>
        </AtlTooltip>
        <AtlTooltip atlTooltip="Left tooltip" atlTooltipPosition="left" :atlTooltipShowDelay="0">
          <AtlButton>Left</AtlButton>
        </AtlTooltip>
        <AtlTooltip atlTooltip="Right tooltip" atlTooltipPosition="right" :atlTooltipShowDelay="0">
          <AtlButton>Right</AtlButton>
        </AtlTooltip>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlTooltip, AtlButton },
    setup() { return { args }; },
    template: `
      <div style="padding:6rem;display:flex;justify-content:center">
        <AtlTooltip v-bind="args"><AtlButton>Hover me</AtlButton></AtlTooltip>
      </div>
    `,
  }),
};
