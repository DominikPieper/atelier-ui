import type { Meta, StoryObj } from '@storybook/angular';
import { LlmTabGroup, LlmTab } from './llm-tabs';
import { LlmInput } from '../input/llm-input';
import { LlmButton } from '../button/llm-button';
import { LlmBadge } from '../badge/llm-badge';
import { LlmCard, LlmCardContent } from '../card/llm-card';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmTabGroup> = {
  title: 'Components/Navigation/LlmTabGroup',
  component: LlmTabGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'pills'],
    },
  },
  args: {
    variant: 'default',
  },
  parameters: {
    design: figmaNode('55-123'),
  },
};

export default meta;
type Story = StoryObj<LlmTabGroup>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [LlmTabGroup, LlmTab] },
    template: `
      <llm-tab-group [variant]="variant">
        <llm-tab label="Account">
          <h3>Account Settings</h3>
          <p>Manage your account details and preferences.</p>
        </llm-tab>
        <llm-tab label="Notifications">
          <h3>Notification Preferences</h3>
          <p>Choose how you'd like to be notified.</p>
        </llm-tab>
        <llm-tab label="Security">
          <h3>Security Settings</h3>
          <p>Update your password and security options.</p>
        </llm-tab>
      </llm-tab-group>
    `,
  }),
  parameters: { design: figmaNode('55-120') },
};

export const WithDisabledTab: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [LlmTabGroup, LlmTab] },
    template: `
      <llm-tab-group [variant]="variant">
        <llm-tab label="Active">This tab is active.</llm-tab>
        <llm-tab label="Disabled" [disabled]="true">This content is hidden.</llm-tab>
        <llm-tab label="Also Active">This tab is also active.</llm-tab>
      </llm-tab-group>
    `,
  }),
};

export const PillsVariant: Story = {
  render: () => ({
    moduleMetadata: { imports: [LlmTabGroup, LlmTab] },
    template: `
      <llm-tab-group variant="pills">
        <llm-tab label="All">Showing all items.</llm-tab>
        <llm-tab label="Active">Showing active items only.</llm-tab>
        <llm-tab label="Archived">Showing archived items.</llm-tab>
      </llm-tab-group>
    `,
  }),
  parameters: { design: figmaNode('55-122') },
};

export const ManyTabs: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [LlmTabGroup, LlmTab] },
    template: `
      <llm-tab-group [variant]="variant">
        <llm-tab label="Overview">Overview content</llm-tab>
        <llm-tab label="Analytics">Analytics content</llm-tab>
        <llm-tab label="Reports">Reports content</llm-tab>
        <llm-tab label="Notifications">Notifications content</llm-tab>
        <llm-tab label="Integrations">Integrations content</llm-tab>
        <llm-tab label="API Keys">API Keys content</llm-tab>
        <llm-tab label="Billing">Billing content</llm-tab>
        <llm-tab label="Team">Team content</llm-tab>
      </llm-tab-group>
    `,
  }),
};

export const PreSelectedTab: Story = {
  render: (args) => ({
    props: { ...args, selectedIndex: 2 },
    moduleMetadata: { imports: [LlmTabGroup, LlmTab] },
    template: `
      <llm-tab-group [variant]="variant" [selectedIndex]="selectedIndex">
        <llm-tab label="First">First panel</llm-tab>
        <llm-tab label="Second">Second panel</llm-tab>
        <llm-tab label="Third">Third panel — pre-selected!</llm-tab>
      </llm-tab-group>
    `,
  }),
};

export const WithRichContent: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [LlmTabGroup, LlmTab, LlmInput, LlmButton, LlmBadge, LlmCard, LlmCardContent],
    },
    template: `
      <llm-tab-group [variant]="variant">
        <llm-tab label="Profile">
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
            <llm-input placeholder="Display name" />
            <llm-input type="email" placeholder="Email address" />
            <llm-button variant="primary" size="sm">Save Changes</llm-button>
          </div>
        </llm-tab>
        <llm-tab label="Status">
          <llm-card variant="flat">
            <llm-card-content>
              <div style="display: flex; gap: 8px; align-items: center;">
                <llm-badge variant="success">Online</llm-badge>
                <span>All systems operational</span>
              </div>
            </llm-card-content>
          </llm-card>
        </llm-tab>
      </llm-tab-group>
    `,
  }),
};
