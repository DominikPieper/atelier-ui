import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlAccordionGroup from './atl-accordion-group.vue';
import AtlAccordionItem from './atl-accordion-item.vue';
import AtlAccordionHeader from './atl-accordion-header.vue';

import { metadata } from '@atelier-ui/spec/metadata/accordion.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlAccordionGroup> = {
  title: 'Components/Feedback/AtlAccordionGroup',
  component: AtlAccordionGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'bordered', 'separated'] },
    multi: { control: 'boolean' },
  },
  args: {
    variant: 'default',
    multi: false,
  },
  parameters: {
    design: figmaNode('55-127'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlAccordionGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    setup() { return { args }; },
    template: `
      <AtlAccordionGroup v-bind="args">
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>What is this component library?</AtlAccordionHeader></template>
          A collection of accessible, LLM-friendly UI components for Vue 3.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>How do I install it?</AtlAccordionHeader></template>
          Install via npm and import the components you need.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Does it support dark mode?</AtlAccordionHeader></template>
          Yes — components use CSS custom properties that adapt to dark mode.
        </AtlAccordionItem>
      </AtlAccordionGroup>
    `,
  }),
  parameters: { design: figmaNode('55-124') },
};

export const MultiExpand: Story = {
  render: (args) => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    setup() { return { args: { ...args, multi: true } }; },
    template: `
      <AtlAccordionGroup v-bind="args">
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>First Section</AtlAccordionHeader></template>
          Multiple sections can be open at the same time in multi mode.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Second Section</AtlAccordionHeader></template>
          Try clicking multiple headers — they all stay open.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Third Section</AtlAccordionHeader></template>
          Each item toggles independently.
        </AtlAccordionItem>
      </AtlAccordionGroup>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    setup() { return { args }; },
    template: `
      <AtlAccordionGroup v-bind="args">
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Enabled Item</AtlAccordionHeader></template>
          This item can be toggled.
        </AtlAccordionItem>
        <AtlAccordionItem :disabled="true">
          <template #header><AtlAccordionHeader>Disabled Item</AtlAccordionHeader></template>
          This item cannot be toggled.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Another Enabled Item</AtlAccordionHeader></template>
          This item can also be toggled.
        </AtlAccordionItem>
      </AtlAccordionGroup>
    `,
  }),
};

export const Bordered: Story = {
  render: () => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    template: `
      <AtlAccordionGroup variant="bordered">
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Account Settings</AtlAccordionHeader></template>
          Manage your account details, profile picture, and display name.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Privacy & Security</AtlAccordionHeader></template>
          Configure two-factor authentication, manage sessions, and privacy settings.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Notifications</AtlAccordionHeader></template>
          Choose which notifications you receive and how they are delivered.
        </AtlAccordionItem>
      </AtlAccordionGroup>
    `,
  }),
  parameters: { design: figmaNode('55-125') },
};

export const Separated: Story = {
  render: () => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    template: `
      <AtlAccordionGroup variant="separated">
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Getting Started</AtlAccordionHeader></template>
          Follow the quick start guide to set up your first project in minutes.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>API Reference</AtlAccordionHeader></template>
          Browse the full API documentation for all available endpoints.
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Troubleshooting</AtlAccordionHeader></template>
          Find solutions to common issues and how to report bugs.
        </AtlAccordionItem>
      </AtlAccordionGroup>
    `,
  }),
  parameters: { design: figmaNode('55-126') },
};

export const PreExpanded: Story = {
  render: (args) => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    setup() { return { args }; },
    template: `
      <AtlAccordionGroup v-bind="args">
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Collapsed by default</AtlAccordionHeader></template>
          This section starts closed.
        </AtlAccordionItem>
        <AtlAccordionItem :expanded="true">
          <template #header><AtlAccordionHeader>Pre-expanded</AtlAccordionHeader></template>
          This section starts open!
        </AtlAccordionItem>
        <AtlAccordionItem>
          <template #header><AtlAccordionHeader>Also collapsed</AtlAccordionHeader></template>
          This section starts closed too.
        </AtlAccordionItem>
      </AtlAccordionGroup>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem">
        <div>
          <p style="margin-bottom:0.5rem;font-weight:600">Default</p>
          <AtlAccordionGroup variant="default">
            <AtlAccordionItem><template #header><AtlAccordionHeader>Item 1</AtlAccordionHeader></template>Content 1</AtlAccordionItem>
            <AtlAccordionItem><template #header><AtlAccordionHeader>Item 2</AtlAccordionHeader></template>Content 2</AtlAccordionItem>
          </AtlAccordionGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem;font-weight:600">Bordered</p>
          <AtlAccordionGroup variant="bordered">
            <AtlAccordionItem><template #header><AtlAccordionHeader>Item 1</AtlAccordionHeader></template>Content 1</AtlAccordionItem>
            <AtlAccordionItem><template #header><AtlAccordionHeader>Item 2</AtlAccordionHeader></template>Content 2</AtlAccordionItem>
          </AtlAccordionGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem;font-weight:600">Separated</p>
          <AtlAccordionGroup variant="separated">
            <AtlAccordionItem><template #header><AtlAccordionHeader>Item 1</AtlAccordionHeader></template>Content 1</AtlAccordionItem>
            <AtlAccordionItem><template #header><AtlAccordionHeader>Item 2</AtlAccordionHeader></template>Content 2</AtlAccordionItem>
          </AtlAccordionGroup>
        </div>
      </div>
    `,
  }),
};

export const ControlledExpanded: Story = {
  render: () => ({
    components: { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader },
    setup() {
      const isOpen = ref(true);
      return { isOpen };
    },
    template: `
      <div>
        <button type="button" @click="isOpen = !isOpen" style="margin-bottom:1rem">
          Toggle first item ({{ isOpen ? 'open' : 'closed' }})
        </button>
        <AtlAccordionGroup>
          <AtlAccordionItem :expanded="isOpen" @update:expanded="isOpen = $event">
            <template #header><AtlAccordionHeader>Controlled Item</AtlAccordionHeader></template>
            This item's state is controlled externally.
          </AtlAccordionItem>
          <AtlAccordionItem>
            <template #header><AtlAccordionHeader>Uncontrolled Item</AtlAccordionHeader></template>
            This item is managed by the group.
          </AtlAccordionItem>
        </AtlAccordionGroup>
      </div>
    `,
  }),
};
