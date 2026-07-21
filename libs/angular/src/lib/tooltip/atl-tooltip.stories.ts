import type { Meta, StoryObj } from '@storybook/angular';
import { AtlTooltip } from './atl-tooltip';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/tooltip.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlTooltip> = {
  title: 'Components/Overlay/AtlTooltip',
  component: AtlTooltip,
  tags: ['autodocs'],
  argTypes: {
    atlTooltipPosition: {
      control: 'select',
      options: ['above', 'below', 'left', 'right'],
    },
    atlTooltipShowDelay: { control: 'number' },
    atlTooltipHideDelay: { control: 'number' },
    atlTooltipDisabled: { control: 'boolean' },
  },
  args: {
    atlTooltipPosition: 'above',
    atlTooltipShowDelay: 300,
    atlTooltipHideDelay: 0,
    atlTooltipDisabled: false,
  },
  parameters: {
    design: figmaNode('55-52'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlTooltip>;

export const Default: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlButton] },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <atl-button atlTooltip="Save your changes">Save</atl-button>
      </div>
    `,
  }),
  parameters: { design: figmaNode('55-48') },
};

export const Positions: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlButton] },
    template: `
      <div style="padding: 6rem; display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
        <atl-button atlTooltip="Tooltip above" atlTooltipPosition="above">Above</atl-button>
        <atl-button atlTooltip="Tooltip below" atlTooltipPosition="below">Below</atl-button>
        <atl-button atlTooltip="Tooltip left" atlTooltipPosition="left">Left</atl-button>
        <atl-button atlTooltip="Tooltip right" atlTooltipPosition="right">Right</atl-button>
      </div>
    `,
  }),
};

export const LongText: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlButton] },
    template: `
      <div style="padding: 4rem; display: flex; justify-content: center;">
        <atl-button
          atlTooltip="This is a longer tooltip message that will wrap across multiple lines when it exceeds the maximum width of the tooltip container."
        >Hover for details</atl-button>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlButton] },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <atl-button atlTooltip="This tooltip is active">Enabled</atl-button>
        <atl-button atlTooltip="This tooltip is hidden" [atlTooltipDisabled]="true">Disabled</atl-button>
      </div>
    `,
  }),
};

export const CustomDelay: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlButton] },
    template: `
      <div style="padding: 4rem; display: flex; gap: 2rem; justify-content: center;">
        <atl-button atlTooltip="No delay" [atlTooltipShowDelay]="0">Instant</atl-button>
        <atl-button atlTooltip="300ms delay (default)">Default</atl-button>
        <atl-button atlTooltip="1 second delay" [atlTooltipShowDelay]="1000">Slow</atl-button>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, tooltipText: 'Tooltip content' },
    moduleMetadata: { imports: [AtlButton] },
    template: `
      <div style="padding: 6rem; display: flex; justify-content: center;">
        <atl-button
          [atlTooltip]="tooltipText"
          [atlTooltipPosition]="atlTooltipPosition"
          [atlTooltipShowDelay]="atlTooltipShowDelay"
          [atlTooltipHideDelay]="atlTooltipHideDelay"
          [atlTooltipDisabled]="atlTooltipDisabled"
        >Hover me</atl-button>
      </div>
    `,
  }),
};
