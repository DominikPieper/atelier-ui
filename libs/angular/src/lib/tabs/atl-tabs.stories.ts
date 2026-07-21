import type { Meta, StoryObj } from '@storybook/angular';
import { AtlTabGroup, AtlTab } from './atl-tabs';
import { AtlInput } from '../input/atl-input';
import { AtlButton } from '../button/atl-button';
import { AtlBadge } from '../badge/atl-badge';
import { AtlCard, AtlCardContent } from '../card/atl-card';

import { metadata } from '@atelier-ui/spec/metadata/tabs.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlTabGroup> = {
  title: 'Components/Navigation/AtlTabGroup',
  component: AtlTabGroup,
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
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlTabGroup>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [AtlTabGroup, AtlTab] },
    template: `
      <atl-tab-group [variant]="variant">
        <atl-tab label="Account">
          <h3>Account Settings</h3>
          <p>Manage your account details and preferences.</p>
        </atl-tab>
        <atl-tab label="Notifications">
          <h3>Notification Preferences</h3>
          <p>Choose how you'd like to be notified.</p>
        </atl-tab>
        <atl-tab label="Security">
          <h3>Security Settings</h3>
          <p>Update your password and security options.</p>
        </atl-tab>
      </atl-tab-group>
    `,
  }),
  parameters: { design: figmaNode('55-120') },
};

export const WithDisabledTab: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [AtlTabGroup, AtlTab] },
    template: `
      <atl-tab-group [variant]="variant">
        <atl-tab label="Active">This tab is active.</atl-tab>
        <atl-tab label="Disabled" [disabled]="true">This content is hidden.</atl-tab>
        <atl-tab label="Also Active">This tab is also active.</atl-tab>
      </atl-tab-group>
    `,
  }),
};

export const PillsVariant: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlTabGroup, AtlTab] },
    template: `
      <atl-tab-group variant="pills">
        <atl-tab label="All">Showing all items.</atl-tab>
        <atl-tab label="Active">Showing active items only.</atl-tab>
        <atl-tab label="Archived">Showing archived items.</atl-tab>
      </atl-tab-group>
    `,
  }),
  parameters: { design: figmaNode('55-122') },
};

export const ManyTabs: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [AtlTabGroup, AtlTab] },
    template: `
      <atl-tab-group [variant]="variant">
        <atl-tab label="Overview">Overview content</atl-tab>
        <atl-tab label="Analytics">Analytics content</atl-tab>
        <atl-tab label="Reports">Reports content</atl-tab>
        <atl-tab label="Notifications">Notifications content</atl-tab>
        <atl-tab label="Integrations">Integrations content</atl-tab>
        <atl-tab label="API Keys">API Keys content</atl-tab>
        <atl-tab label="Billing">Billing content</atl-tab>
        <atl-tab label="Team">Team content</atl-tab>
      </atl-tab-group>
    `,
  }),
};

export const PreSelectedTab: Story = {
  render: (args) => ({
    props: { ...args, selectedIndex: 2 },
    moduleMetadata: { imports: [AtlTabGroup, AtlTab] },
    template: `
      <atl-tab-group [variant]="variant" [selectedIndex]="selectedIndex">
        <atl-tab label="First">First panel</atl-tab>
        <atl-tab label="Second">Second panel</atl-tab>
        <atl-tab label="Third">Third panel — pre-selected!</atl-tab>
      </atl-tab-group>
    `,
  }),
};

export const WithRichContent: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [AtlTabGroup, AtlTab, AtlInput, AtlButton, AtlBadge, AtlCard, AtlCardContent],
    },
    template: `
      <atl-tab-group [variant]="variant">
        <atl-tab label="Profile">
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
            <atl-input placeholder="Display name" />
            <atl-input type="email" placeholder="Email address" />
            <atl-button variant="primary" size="sm">Save Changes</atl-button>
          </div>
        </atl-tab>
        <atl-tab label="Status">
          <atl-card variant="flat">
            <atl-card-content>
              <div style="display: flex; gap: 8px; align-items: center;">
                <atl-badge variant="success">Online</atl-badge>
                <span>All systems operational</span>
              </div>
            </atl-card-content>
          </atl-card>
        </atl-tab>
      </atl-tab-group>
    `,
  }),
};
