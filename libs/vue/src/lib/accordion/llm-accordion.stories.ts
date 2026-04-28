import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmAccordionGroup from './llm-accordion-group.vue';
import LlmAccordionItem from './llm-accordion-item.vue';
import LlmAccordionHeader from './llm-accordion-header.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmAccordionGroup> = {
  title: 'Components/Feedback/LlmAccordionGroup',
  component: LlmAccordionGroup,
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmAccordionGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    setup() { return { args }; },
    template: `
      <LlmAccordionGroup v-bind="args">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>What is this component library?</LlmAccordionHeader></template>
          A collection of accessible, LLM-friendly UI components for Vue 3.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>How do I install it?</LlmAccordionHeader></template>
          Install via npm and import the components you need.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Does it support dark mode?</LlmAccordionHeader></template>
          Yes — components use CSS custom properties that adapt to dark mode.
        </LlmAccordionItem>
      </LlmAccordionGroup>
    `,
  }),
  parameters: { design: figmaNode('55-124') },
};

export const MultiExpand: Story = {
  render: (args) => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    setup() { return { args: { ...args, multi: true } }; },
    template: `
      <LlmAccordionGroup v-bind="args">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>First Section</LlmAccordionHeader></template>
          Multiple sections can be open at the same time in multi mode.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Second Section</LlmAccordionHeader></template>
          Try clicking multiple headers — they all stay open.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Third Section</LlmAccordionHeader></template>
          Each item toggles independently.
        </LlmAccordionItem>
      </LlmAccordionGroup>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    setup() { return { args }; },
    template: `
      <LlmAccordionGroup v-bind="args">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Enabled Item</LlmAccordionHeader></template>
          This item can be toggled.
        </LlmAccordionItem>
        <LlmAccordionItem :disabled="true">
          <template #header><LlmAccordionHeader>Disabled Item</LlmAccordionHeader></template>
          This item cannot be toggled.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Another Enabled Item</LlmAccordionHeader></template>
          This item can also be toggled.
        </LlmAccordionItem>
      </LlmAccordionGroup>
    `,
  }),
};

export const Bordered: Story = {
  render: () => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    template: `
      <LlmAccordionGroup variant="bordered">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Account Settings</LlmAccordionHeader></template>
          Manage your account details, profile picture, and display name.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Privacy & Security</LlmAccordionHeader></template>
          Configure two-factor authentication, manage sessions, and privacy settings.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Notifications</LlmAccordionHeader></template>
          Choose which notifications you receive and how they are delivered.
        </LlmAccordionItem>
      </LlmAccordionGroup>
    `,
  }),
  parameters: { design: figmaNode('55-125') },
};

export const Separated: Story = {
  render: () => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    template: `
      <LlmAccordionGroup variant="separated">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Getting Started</LlmAccordionHeader></template>
          Follow the quick start guide to set up your first project in minutes.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>API Reference</LlmAccordionHeader></template>
          Browse the full API documentation for all available endpoints.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Troubleshooting</LlmAccordionHeader></template>
          Find solutions to common issues and how to report bugs.
        </LlmAccordionItem>
      </LlmAccordionGroup>
    `,
  }),
  parameters: { design: figmaNode('55-126') },
};

export const PreExpanded: Story = {
  render: (args) => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    setup() { return { args }; },
    template: `
      <LlmAccordionGroup v-bind="args">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Collapsed by default</LlmAccordionHeader></template>
          This section starts closed.
        </LlmAccordionItem>
        <LlmAccordionItem :expanded="true">
          <template #header><LlmAccordionHeader>Pre-expanded</LlmAccordionHeader></template>
          This section starts open!
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Also collapsed</LlmAccordionHeader></template>
          This section starts closed too.
        </LlmAccordionItem>
      </LlmAccordionGroup>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    template: `
      <div style="display:flex;flex-direction:column;gap:2rem">
        <div>
          <p style="margin-bottom:0.5rem;font-weight:600">Default</p>
          <LlmAccordionGroup variant="default">
            <LlmAccordionItem><template #header><LlmAccordionHeader>Item 1</LlmAccordionHeader></template>Content 1</LlmAccordionItem>
            <LlmAccordionItem><template #header><LlmAccordionHeader>Item 2</LlmAccordionHeader></template>Content 2</LlmAccordionItem>
          </LlmAccordionGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem;font-weight:600">Bordered</p>
          <LlmAccordionGroup variant="bordered">
            <LlmAccordionItem><template #header><LlmAccordionHeader>Item 1</LlmAccordionHeader></template>Content 1</LlmAccordionItem>
            <LlmAccordionItem><template #header><LlmAccordionHeader>Item 2</LlmAccordionHeader></template>Content 2</LlmAccordionItem>
          </LlmAccordionGroup>
        </div>
        <div>
          <p style="margin-bottom:0.5rem;font-weight:600">Separated</p>
          <LlmAccordionGroup variant="separated">
            <LlmAccordionItem><template #header><LlmAccordionHeader>Item 1</LlmAccordionHeader></template>Content 1</LlmAccordionItem>
            <LlmAccordionItem><template #header><LlmAccordionHeader>Item 2</LlmAccordionHeader></template>Content 2</LlmAccordionItem>
          </LlmAccordionGroup>
        </div>
      </div>
    `,
  }),
};

export const ControlledExpanded: Story = {
  render: () => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    setup() {
      const isOpen = ref(true);
      return { isOpen };
    },
    template: `
      <div>
        <button type="button" @click="isOpen = !isOpen" style="margin-bottom:1rem">
          Toggle first item ({{ isOpen ? 'open' : 'closed' }})
        </button>
        <LlmAccordionGroup>
          <LlmAccordionItem :expanded="isOpen" @update:expanded="isOpen = $event">
            <template #header><LlmAccordionHeader>Controlled Item</LlmAccordionHeader></template>
            This item's state is controlled externally.
          </LlmAccordionItem>
          <LlmAccordionItem>
            <template #header><LlmAccordionHeader>Uncontrolled Item</LlmAccordionHeader></template>
            This item is managed by the group.
          </LlmAccordionItem>
        </LlmAccordionGroup>
      </div>
    `,
  }),
};
