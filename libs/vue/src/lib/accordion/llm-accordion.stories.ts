import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmAccordionGroup from './llm-accordion-group.vue';
import LlmAccordionItem from './llm-accordion-item.vue';
import LlmAccordionHeader from './llm-accordion-header.vue';

const meta: Meta<typeof LlmAccordionGroup> = {
  title: 'Components/LlmAccordionGroup',
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
};

export default meta;
type Story = StoryObj<typeof LlmAccordionGroup>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    setup() {
      return { args };
    },
    template: `
      <LlmAccordionGroup v-bind="args">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>What is this library?</LlmAccordionHeader></template>
          A collection of accessible, LLM-friendly UI components for Vue 3.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>How do I get started?</LlmAccordionHeader></template>
          Install the package and import components from @atelier-ui/vue.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Is it accessible?</LlmAccordionHeader></template>
          Yes — it uses semantic HTML with proper ARIA attributes and keyboard navigation.
        </LlmAccordionItem>
      </LlmAccordionGroup>
    `,
  }),
};

export const MultiExpand: Story = {
  render: () => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    template: `
      <LlmAccordionGroup :multi="true" variant="separated">
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Section A</LlmAccordionHeader></template>
          Content for section A.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Section B</LlmAccordionHeader></template>
          Content for section B.
        </LlmAccordionItem>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Section C</LlmAccordionHeader></template>
          Content for section C.
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

export const WithDisabledItem: Story = {
  render: () => ({
    components: { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader },
    template: `
      <LlmAccordionGroup>
        <LlmAccordionItem>
          <template #header><LlmAccordionHeader>Available item</LlmAccordionHeader></template>
          This item can be expanded.
        </LlmAccordionItem>
        <LlmAccordionItem :disabled="true">
          <template #header><LlmAccordionHeader>Disabled item</LlmAccordionHeader></template>
          This content is not reachable.
        </LlmAccordionItem>
      </LlmAccordionGroup>
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
