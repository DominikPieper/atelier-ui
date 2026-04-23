import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmTabGroup from './llm-tab-group.vue';
import LlmTab from './llm-tab.vue';
import LlmInput from '../input/llm-input.vue';
import LlmButton from '../button/llm-button.vue';
import LlmBadge from '../badge/llm-badge.vue';
import LlmCard from '../card/llm-card.vue';
import LlmCardContent from '../card/llm-card-content.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTabGroup> = {
  title: 'Components/Navigation/LlmTabGroup',
  component: LlmTabGroup,
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmTabGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmTabGroup, LlmTab },
    setup() { return { args }; },
    template: `
      <LlmTabGroup v-bind="args">
        <LlmTab label="Account">
          <div style="padding:1rem">
            <h3>Account Settings</h3>
            <p>Manage your account details and preferences.</p>
          </div>
        </LlmTab>
        <LlmTab label="Notifications">
          <div style="padding:1rem">
            <h3>Notification Preferences</h3>
            <p>Choose how you'd like to be notified.</p>
          </div>
        </LlmTab>
        <LlmTab label="Security">
          <div style="padding:1rem">
            <h3>Security Settings</h3>
            <p>Update your password and security options.</p>
          </div>
        </LlmTab>
      </LlmTabGroup>
    `,
  }),
  parameters: { design: figmaNode('55-120') },
};

export const WithDisabledTab: Story = {
  render: (args) => ({
    components: { LlmTabGroup, LlmTab },
    setup() { return { args }; },
    template: `
      <LlmTabGroup v-bind="args">
        <LlmTab label="Active">This tab is active.</LlmTab>
        <LlmTab label="Disabled" :disabled="true">This content is hidden.</LlmTab>
        <LlmTab label="Also Active">This tab is also active.</LlmTab>
      </LlmTabGroup>
    `,
  }),
};

export const PillsVariant: Story = {
  render: () => ({
    components: { LlmTabGroup, LlmTab },
    template: `
      <LlmTabGroup variant="pills">
        <LlmTab label="All">Showing all items.</LlmTab>
        <LlmTab label="Active">Showing active items only.</LlmTab>
        <LlmTab label="Archived">Showing archived items.</LlmTab>
      </LlmTabGroup>
    `,
  }),
  parameters: { design: figmaNode('55-122') },
};

export const ManyTabs: Story = {
  render: (args) => ({
    components: { LlmTabGroup, LlmTab },
    setup() { return { args }; },
    template: `
      <LlmTabGroup v-bind="args">
        <LlmTab label="Overview">Overview content</LlmTab>
        <LlmTab label="Analytics">Analytics content</LlmTab>
        <LlmTab label="Reports">Reports content</LlmTab>
        <LlmTab label="Notifications">Notifications content</LlmTab>
        <LlmTab label="Integrations">Integrations content</LlmTab>
        <LlmTab label="API Keys">API Keys content</LlmTab>
        <LlmTab label="Billing">Billing content</LlmTab>
        <LlmTab label="Team">Team content</LlmTab>
      </LlmTabGroup>
    `,
  }),
};

export const PreSelectedTab: Story = {
  args: { selectedIndex: 2 },
  render: (args) => ({
    components: { LlmTabGroup, LlmTab },
    setup() { return { args }; },
    template: `
      <LlmTabGroup v-bind="args">
        <LlmTab label="First">First panel</LlmTab>
        <LlmTab label="Second">Second panel</LlmTab>
        <LlmTab label="Third">Third panel — pre-selected!</LlmTab>
      </LlmTabGroup>
    `,
  }),
};

export const WithRichContent: Story = {
  render: (args) => ({
    components: { LlmTabGroup, LlmTab, LlmInput, LlmButton, LlmBadge, LlmCard, LlmCardContent },
    setup() { return { args }; },
    template: `
      <LlmTabGroup v-bind="args">
        <LlmTab label="Profile">
          <div style="display:flex;flex-direction:column;gap:12px;max-width:400px;padding:1rem">
            <LlmInput placeholder="Display name" />
            <LlmInput type="email" placeholder="Email address" />
            <LlmButton variant="primary" size="sm">Save Changes</LlmButton>
          </div>
        </LlmTab>
        <LlmTab label="Status">
          <div style="padding:1rem">
            <LlmCard variant="flat">
              <LlmCardContent>
                <div style="display:flex;gap:8px;align-items:center">
                  <LlmBadge variant="success">Online</LlmBadge>
                  <span>All systems operational</span>
                </div>
              </LlmCardContent>
            </LlmCard>
          </div>
        </LlmTab>
      </LlmTabGroup>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { LlmTabGroup, LlmTab },
    setup() {
      const activeTab = ref(0);
      return { activeTab };
    },
    template: `
      <div>
        <p style="margin-bottom:0.5rem">Active tab index: {{ activeTab }}</p>
        <LlmTabGroup v-model:selectedIndex="activeTab">
          <LlmTab label="First">First tab panel.</LlmTab>
          <LlmTab label="Second">Second tab panel.</LlmTab>
          <LlmTab label="Third">Third tab panel.</LlmTab>
        </LlmTabGroup>
        <div style="margin-top:1rem;display:flex;gap:0.5rem">
          <button type="button" @click="activeTab = 0">Go to First</button>
          <button type="button" @click="activeTab = 1">Go to Second</button>
          <button type="button" @click="activeTab = 2">Go to Third</button>
        </div>
      </div>
    `,
  }),
};
