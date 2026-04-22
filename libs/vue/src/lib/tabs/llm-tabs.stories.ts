import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmTabGroup from './llm-tab-group.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}
import LlmTab from './llm-tab.vue';

const meta: Meta<typeof LlmTabGroup> = {
  title: 'Components/LlmTabGroup',
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
    setup() {
      return { args };
    },
    template: `
      <LlmTabGroup v-bind="args">
        <LlmTab label="Account">
          <div style="padding:1rem">Account settings content.</div>
        </LlmTab>
        <LlmTab label="Notifications">
          <div style="padding:1rem">Notification preferences content.</div>
        </LlmTab>
        <LlmTab label="Billing">
          <div style="padding:1rem">Billing information content.</div>
        </LlmTab>
      </LlmTabGroup>
    `,
  }),
};

export const Pills: Story = {
  render: () => ({
    components: { LlmTabGroup, LlmTab },
    template: `
      <LlmTabGroup variant="pills">
        <LlmTab label="All">All items.</LlmTab>
        <LlmTab label="Active">Active items.</LlmTab>
        <LlmTab label="Archived">Archived items.</LlmTab>
      </LlmTabGroup>
    `,
  }),
};

export const WithDisabledTab: Story = {
  render: () => ({
    components: { LlmTabGroup, LlmTab },
    template: `
      <LlmTabGroup>
        <LlmTab label="Available">Available content.</LlmTab>
        <LlmTab label="Disabled" :disabled="true">This content is not reachable.</LlmTab>
        <LlmTab label="Also Available">Also available content.</LlmTab>
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
