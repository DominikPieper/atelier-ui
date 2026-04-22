import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmTabGroup, LlmTab } from './llm-tabs';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTabGroup> = {
  title: 'Components/LlmTabGroup',
  component: LlmTabGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'pills'] },
    selectedIndex: { control: 'number' },
  },
  args: { variant: 'default' },
  parameters: {
    design: figmaNode('55-123'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmTabGroup>;

export const Default: Story = {
  render: (args) => (
    <LlmTabGroup {...args}>
      <LlmTab label="Account">
        <p>Account settings here.</p>
      </LlmTab>
      <LlmTab label="Notifications">
        <p>Notification preferences here.</p>
      </LlmTab>
      <LlmTab label="Billing">
        <p>Billing information here.</p>
      </LlmTab>
    </LlmTabGroup>
  ),
  parameters: { design: figmaNode('55-120') },
};

export const Pills: Story = {
  args: { variant: 'pills' },
  render: (args) => (
    <LlmTabGroup {...args}>
      <LlmTab label="All">
        <p>All items.</p>
      </LlmTab>
      <LlmTab label="Active">
        <p>Active items.</p>
      </LlmTab>
      <LlmTab label="Archived">
        <p>Archived items.</p>
      </LlmTab>
    </LlmTabGroup>
  ),
  parameters: { design: figmaNode('55-122') },
};

export const WithDisabledTab: Story = {
  render: () => (
    <LlmTabGroup>
      <LlmTab label="Tab One">
        <p>Content one.</p>
      </LlmTab>
      <LlmTab label="Tab Two" disabled>
        <p>Content two (disabled).</p>
      </LlmTab>
      <LlmTab label="Tab Three">
        <p>Content three.</p>
      </LlmTab>
    </LlmTabGroup>
  ),
};

export const Controlled: Story = {
  render: function Render() {
    const [index, setIndex] = useState(0);
    return (
      <div>
        <p style={{ marginBottom: '1rem' }}>Active tab index: {index}</p>
        <LlmTabGroup selectedIndex={index} onSelectedIndexChange={setIndex}>
          <LlmTab label="First">
            <p>First tab content.</p>
          </LlmTab>
          <LlmTab label="Second">
            <p>Second tab content.</p>
          </LlmTab>
          <LlmTab label="Third">
            <p>Third tab content.</p>
          </LlmTab>
        </LlmTabGroup>
      </div>
    );
  },
};

export const ManyTabs: Story = {
  render: () => (
    <LlmTabGroup>
      {['Overview', 'Analytics', 'Reports', 'Integrations', 'Activity', 'Security', 'Settings'].map(
        (label) => (
          <LlmTab key={label} label={label}>
            <p>{label} content here.</p>
          </LlmTab>
        )
      )}
    </LlmTabGroup>
  ),
};
