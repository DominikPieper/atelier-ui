import type { Meta, StoryObj } from '@storybook/angular';
import { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader } from './llm-accordion';

const IMPORTS = [LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmAccordionGroup> = {
  title: 'Components/LlmAccordionGroup',
  component: LlmAccordionGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'separated'],
    },
  },
  args: {
    variant: 'default',
  },
  parameters: {
    design: figmaNode('3-576'),
  },
};

export default meta;
type Story = StoryObj<LlmAccordionGroup>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <llm-accordion-group [variant]="variant">
        <llm-accordion-item>
          <span llmAccordionHeader>What is this component library?</span>
          A set of accessible, LLM-optimized Angular components built with modern signals and design tokens.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>How do I install it?</span>
          Install via npm and import the components you need. All components are standalone.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Does it support dark mode?</span>
          Yes! All components use CSS custom properties that automatically adapt to dark mode.
        </llm-accordion-item>
      </llm-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-124') },
};

export const MultiExpand: Story = {
  render: (args) => ({
    props: { ...args, multi: true },
    moduleMetadata: { imports: IMPORTS },
    template: `
      <llm-accordion-group [variant]="variant" [multi]="true">
        <llm-accordion-item>
          <span llmAccordionHeader>First Section</span>
          Multiple sections can be open at the same time in multi mode.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Second Section</span>
          Try clicking multiple headers — they all stay open.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Third Section</span>
          Each item toggles independently.
        </llm-accordion-item>
      </llm-accordion-group>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <llm-accordion-group [variant]="variant">
        <llm-accordion-item>
          <span llmAccordionHeader>Enabled Item</span>
          This item can be toggled.
        </llm-accordion-item>
        <llm-accordion-item [disabled]="true">
          <span llmAccordionHeader>Disabled Item</span>
          This item cannot be toggled.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Another Enabled Item</span>
          This item can also be toggled.
        </llm-accordion-item>
      </llm-accordion-group>
    `,
  }),
};

export const Bordered: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <llm-accordion-group variant="bordered">
        <llm-accordion-item>
          <span llmAccordionHeader>Account Settings</span>
          Manage your account details, profile picture, and display name.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Privacy & Security</span>
          Configure two-factor authentication, manage sessions, and privacy settings.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Notifications</span>
          Choose which notifications you receive and how they are delivered.
        </llm-accordion-item>
      </llm-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-125') },
};

export const Separated: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <llm-accordion-group variant="separated">
        <llm-accordion-item>
          <span llmAccordionHeader>Getting Started</span>
          Follow the quick start guide to set up your first project in minutes.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>API Reference</span>
          Browse the full API documentation for all available endpoints.
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Troubleshooting</span>
          Find solutions to common issues and how to report bugs.
        </llm-accordion-item>
      </llm-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-126') },
};

export const PreExpanded: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <llm-accordion-group [variant]="variant">
        <llm-accordion-item>
          <span llmAccordionHeader>Collapsed by default</span>
          This section starts closed.
        </llm-accordion-item>
        <llm-accordion-item [expanded]="true">
          <span llmAccordionHeader>Pre-expanded</span>
          This section starts open!
        </llm-accordion-item>
        <llm-accordion-item>
          <span llmAccordionHeader>Also collapsed</span>
          This section starts closed too.
        </llm-accordion-item>
      </llm-accordion-group>
    `,
  }),
};
