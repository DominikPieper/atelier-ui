import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlTabGroup, AtlTab } from './atl-tabs';

import { metadata } from '@atelier-ui/spec/metadata/tabs.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlTabGroup> = {
  title: 'Components/Navigation/AtlTabGroup',
  component: AtlTabGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'pills'] },
    selectedIndex: { control: 'number' },
  },
  args: { variant: 'default' },
  parameters: {
    design: figmaNode('55-123'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlTabGroup>;

export const Default: Story = {
  render: (args) => (
    <AtlTabGroup {...args}>
      <AtlTab label="Account">
        <p>Account settings here.</p>
      </AtlTab>
      <AtlTab label="Notifications">
        <p>Notification preferences here.</p>
      </AtlTab>
      <AtlTab label="Billing">
        <p>Billing information here.</p>
      </AtlTab>
    </AtlTabGroup>
  ),
  parameters: { design: figmaNode('55-120') },
};

export const Pills: Story = {
  args: { variant: 'pills' },
  render: (args) => (
    <AtlTabGroup {...args}>
      <AtlTab label="All">
        <p>All items.</p>
      </AtlTab>
      <AtlTab label="Active">
        <p>Active items.</p>
      </AtlTab>
      <AtlTab label="Archived">
        <p>Archived items.</p>
      </AtlTab>
    </AtlTabGroup>
  ),
  parameters: { design: figmaNode('55-122') },
};

export const WithDisabledTab: Story = {
  render: () => (
    <AtlTabGroup>
      <AtlTab label="Tab One">
        <p>Content one.</p>
      </AtlTab>
      <AtlTab label="Tab Two" disabled>
        <p>Content two (disabled).</p>
      </AtlTab>
      <AtlTab label="Tab Three">
        <p>Content three.</p>
      </AtlTab>
    </AtlTabGroup>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [index, setIndex] = useState(0);
    return (
      <div>
        <p style={{ marginBottom: '1rem' }}>Active tab index: {index}</p>
        <AtlTabGroup selectedIndex={index} onSelectedIndexChange={setIndex}>
          <AtlTab label="First">
            <p>First tab content.</p>
          </AtlTab>
          <AtlTab label="Second">
            <p>Second tab content.</p>
          </AtlTab>
          <AtlTab label="Third">
            <p>Third tab content.</p>
          </AtlTab>
        </AtlTabGroup>
      </div>
    );
  },
};

export const ManyTabs: Story = {
  render: () => (
    <AtlTabGroup>
      {['Overview', 'Analytics', 'Reports', 'Integrations', 'Activity', 'Security', 'Settings'].map(
        (label) => (
          <AtlTab key={label} label={label}>
            <p>{label} content here.</p>
          </AtlTab>
        )
      )}
    </AtlTabGroup>
  ),
};
