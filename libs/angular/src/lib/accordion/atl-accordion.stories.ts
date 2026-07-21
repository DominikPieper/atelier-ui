import type { Meta, StoryObj } from '@storybook/angular';
import { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader } from './atl-accordion';

import { metadata } from '@atelier-ui/spec/metadata/accordion.metadata';
const IMPORTS = [AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlAccordionGroup> = {
  title: 'Components/Feedback/AtlAccordionGroup',
  component: AtlAccordionGroup,
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
    design: figmaNode('55-127'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlAccordionGroup>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>What is this component library?</span>
          A set of accessible, LLM-optimized Angular components built with modern signals and design tokens.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>How do I install it?</span>
          Install via npm and import the components you need. All components are standalone.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Does it support dark mode?</span>
          Yes! All components use CSS custom properties that automatically adapt to dark mode.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-124') },
};

export const MultiExpand: Story = {
  render: (args) => ({
    props: { ...args, multi: true },
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant" [multi]="true">
        <atl-accordion-item>
          <span atlAccordionHeader>First Section</span>
          Multiple sections can be open at the same time in multi mode.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Second Section</span>
          Try clicking multiple headers — they all stay open.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Third Section</span>
          Each item toggles independently.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>Enabled Item</span>
          This item can be toggled.
        </atl-accordion-item>
        <atl-accordion-item [disabled]="true">
          <span atlAccordionHeader>Disabled Item</span>
          This item cannot be toggled.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Another Enabled Item</span>
          This item can also be toggled.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
};

export const Bordered: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group variant="bordered">
        <atl-accordion-item>
          <span atlAccordionHeader>Account Settings</span>
          Manage your account details, profile picture, and display name.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Privacy & Security</span>
          Configure two-factor authentication, manage sessions, and privacy settings.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Notifications</span>
          Choose which notifications you receive and how they are delivered.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-125') },
};

export const Separated: Story = {
  render: () => ({
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group variant="separated">
        <atl-accordion-item>
          <span atlAccordionHeader>Getting Started</span>
          Follow the quick start guide to set up your first project in minutes.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>API Reference</span>
          Browse the full API documentation for all available endpoints.
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Troubleshooting</span>
          Find solutions to common issues and how to report bugs.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
  parameters: { design: figmaNode('55-126') },
};

export const PreExpanded: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: IMPORTS },
    template: `
      <atl-accordion-group [variant]="variant">
        <atl-accordion-item>
          <span atlAccordionHeader>Collapsed by default</span>
          This section starts closed.
        </atl-accordion-item>
        <atl-accordion-item [expanded]="true">
          <span atlAccordionHeader>Pre-expanded</span>
          This section starts open!
        </atl-accordion-item>
        <atl-accordion-item>
          <span atlAccordionHeader>Also collapsed</span>
          This section starts closed too.
        </atl-accordion-item>
      </atl-accordion-group>
    `,
  }),
};
