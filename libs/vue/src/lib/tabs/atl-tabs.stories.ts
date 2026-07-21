import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlTabGroup from './atl-tab-group.vue';
import AtlTab from './atl-tab.vue';
import AtlInput from '../input/atl-input.vue';
import AtlButton from '../button/atl-button.vue';
import AtlBadge from '../badge/atl-badge.vue';
import AtlCard from '../card/atl-card.vue';
import AtlCardContent from '../card/atl-card-content.vue';

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
  args: {
    variant: 'default',
    selectedIndex: 0,
  },
  parameters: {
    design: figmaNode('55-123'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlTabGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlTabGroup, AtlTab },
    setup() { return { args }; },
    template: `
      <AtlTabGroup v-bind="args">
        <AtlTab label="Account">
          <div style="padding:1rem">
            <h3>Account Settings</h3>
            <p>Manage your account details and preferences.</p>
          </div>
        </AtlTab>
        <AtlTab label="Notifications">
          <div style="padding:1rem">
            <h3>Notification Preferences</h3>
            <p>Choose how you'd like to be notified.</p>
          </div>
        </AtlTab>
        <AtlTab label="Security">
          <div style="padding:1rem">
            <h3>Security Settings</h3>
            <p>Update your password and security options.</p>
          </div>
        </AtlTab>
      </AtlTabGroup>
    `,
  }),
  parameters: { design: figmaNode('55-120') },
};

export const WithDisabledTab: Story = {
  render: (args) => ({
    components: { AtlTabGroup, AtlTab },
    setup() { return { args }; },
    template: `
      <AtlTabGroup v-bind="args">
        <AtlTab label="Active">This tab is active.</AtlTab>
        <AtlTab label="Disabled" :disabled="true">This content is hidden.</AtlTab>
        <AtlTab label="Also Active">This tab is also active.</AtlTab>
      </AtlTabGroup>
    `,
  }),
};

export const PillsVariant: Story = {
  render: () => ({
    components: { AtlTabGroup, AtlTab },
    template: `
      <AtlTabGroup variant="pills">
        <AtlTab label="All">Showing all items.</AtlTab>
        <AtlTab label="Active">Showing active items only.</AtlTab>
        <AtlTab label="Archived">Showing archived items.</AtlTab>
      </AtlTabGroup>
    `,
  }),
  parameters: { design: figmaNode('55-122') },
};

export const ManyTabs: Story = {
  render: (args) => ({
    components: { AtlTabGroup, AtlTab },
    setup() { return { args }; },
    template: `
      <AtlTabGroup v-bind="args">
        <AtlTab label="Overview">Overview content</AtlTab>
        <AtlTab label="Analytics">Analytics content</AtlTab>
        <AtlTab label="Reports">Reports content</AtlTab>
        <AtlTab label="Notifications">Notifications content</AtlTab>
        <AtlTab label="Integrations">Integrations content</AtlTab>
        <AtlTab label="API Keys">API Keys content</AtlTab>
        <AtlTab label="Billing">Billing content</AtlTab>
        <AtlTab label="Team">Team content</AtlTab>
      </AtlTabGroup>
    `,
  }),
};

export const PreSelectedTab: Story = {
  args: { selectedIndex: 2 },
  render: (args) => ({
    components: { AtlTabGroup, AtlTab },
    setup() { return { args }; },
    template: `
      <AtlTabGroup v-bind="args">
        <AtlTab label="First">First panel</AtlTab>
        <AtlTab label="Second">Second panel</AtlTab>
        <AtlTab label="Third">Third panel — pre-selected!</AtlTab>
      </AtlTabGroup>
    `,
  }),
};

export const WithRichContent: Story = {
  render: (args) => ({
    components: { AtlTabGroup, AtlTab, AtlInput, AtlButton, AtlBadge, AtlCard, AtlCardContent },
    setup() { return { args }; },
    template: `
      <AtlTabGroup v-bind="args">
        <AtlTab label="Profile">
          <div style="display:flex;flex-direction:column;gap:12px;max-width:400px;padding:1rem">
            <AtlInput placeholder="Display name" />
            <AtlInput type="email" placeholder="Email address" />
            <AtlButton variant="primary" size="sm">Save Changes</AtlButton>
          </div>
        </AtlTab>
        <AtlTab label="Status">
          <div style="padding:1rem">
            <AtlCard variant="flat">
              <AtlCardContent>
                <div style="display:flex;gap:8px;align-items:center">
                  <AtlBadge variant="success">Online</AtlBadge>
                  <span>All systems operational</span>
                </div>
              </AtlCardContent>
            </AtlCard>
          </div>
        </AtlTab>
      </AtlTabGroup>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { AtlTabGroup, AtlTab },
    setup() {
      const activeTab = ref(0);
      return { activeTab };
    },
    template: `
      <div>
        <p style="margin-bottom:0.5rem">Active tab index: {{ activeTab }}</p>
        <AtlTabGroup v-model:selectedIndex="activeTab">
          <AtlTab label="First">First tab panel.</AtlTab>
          <AtlTab label="Second">Second tab panel.</AtlTab>
          <AtlTab label="Third">Third tab panel.</AtlTab>
        </AtlTabGroup>
        <div style="margin-top:1rem;display:flex;gap:0.5rem">
          <button type="button" @click="activeTab = 0">Go to First</button>
          <button type="button" @click="activeTab = 1">Go to Second</button>
          <button type="button" @click="activeTab = 2">Go to Third</button>
        </div>
      </div>
    `,
  }),
};
