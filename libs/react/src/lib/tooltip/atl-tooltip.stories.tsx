import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlTooltip } from './atl-tooltip';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/tooltip.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlTooltip> = {
  title: 'Components/Overlay/AtlTooltip',
  component: AtlTooltip,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-52'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlTooltip>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <AtlTooltip atlTooltip="Save your changes">
        <AtlButton>Save</AtlButton>
      </AtlTooltip>
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
      <AtlTooltip atlTooltip="Above tooltip" atlTooltipPosition="above">
        <AtlButton variant="outline">Above</AtlButton>
      </AtlTooltip>
      <AtlTooltip atlTooltip="Below tooltip" atlTooltipPosition="below">
        <AtlButton variant="outline">Below</AtlButton>
      </AtlTooltip>
      <AtlTooltip atlTooltip="Left tooltip" atlTooltipPosition="left">
        <AtlButton variant="outline">Left</AtlButton>
      </AtlTooltip>
      <AtlTooltip atlTooltip="Right tooltip" atlTooltipPosition="right">
        <AtlButton variant="outline">Right</AtlButton>
      </AtlTooltip>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <AtlTooltip atlTooltip="This tooltip is disabled" atlTooltipDisabled>
        <AtlButton variant="secondary">No tooltip</AtlButton>
      </AtlTooltip>
    </div>
  ),
};

export const CustomDelay: Story = {
  render: () => (
    <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
      <AtlTooltip atlTooltip="Slow tooltip (1s delay)" atlTooltipShowDelay={1000}>
        <AtlButton variant="outline">Slow tooltip</AtlButton>
      </AtlTooltip>
    </div>
  ),
};
