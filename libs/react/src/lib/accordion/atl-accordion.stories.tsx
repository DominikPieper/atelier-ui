import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlAccordionGroup, AtlAccordionItem, AtlAccordionHeader } from './atl-accordion';

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
    multi: { control: 'boolean' },
    variant: { control: 'select', options: ['default', 'bordered', 'separated'] },
  },
  args: { multi: false, variant: 'default' },
  parameters: {
    design: figmaNode('55-127'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlAccordionGroup>;

export const Default: Story = {
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>What is this component library?</AtlAccordionHeader>
        A set of accessible, composable UI components designed for use with LLM-generated applications.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>How do I install it?</AtlAccordionHeader>
        Install via npm and import the components you need.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Is it accessible?</AtlAccordionHeader>
        Yes. All components follow WAI-ARIA patterns with keyboard navigation support.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
  parameters: { design: figmaNode('55-124') },
};

export const MultiExpand: Story = {
  args: { multi: true },
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section A</AtlAccordionHeader>
        Content for section A. Multiple items can be open at once.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section B</AtlAccordionHeader>
        Content for section B.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Section C</AtlAccordionHeader>
        Content for section C.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
};

export const Bordered: Story = {
  args: { variant: 'bordered' },
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>Bordered Section 1</AtlAccordionHeader>
        Content inside bordered accordion.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Bordered Section 2</AtlAccordionHeader>
        More content here.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
  parameters: { design: figmaNode('55-125') },
};

export const Separated: Story = {
  args: { variant: 'separated', multi: true },
  render: (args) => (
    <AtlAccordionGroup {...args}>
      <AtlAccordionItem>
        <AtlAccordionHeader>Card Section 1</AtlAccordionHeader>
        Content inside separated card-style accordion.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Card Section 2</AtlAccordionHeader>
        More content here.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Card Section 3</AtlAccordionHeader>
        Even more content.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
  parameters: { design: figmaNode('55-126') },
};

export const WithDisabledItem: Story = {
  render: () => (
    <AtlAccordionGroup>
      <AtlAccordionItem>
        <AtlAccordionHeader>Available Section</AtlAccordionHeader>
        This section is enabled.
      </AtlAccordionItem>
      <AtlAccordionItem disabled>
        <AtlAccordionHeader>Disabled Section</AtlAccordionHeader>
        This content is not accessible.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Another Available Section</AtlAccordionHeader>
        This section is also enabled.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
};

export const PreExpanded: Story = {
  render: () => (
    <AtlAccordionGroup>
      <AtlAccordionItem expanded>
        <AtlAccordionHeader>Pre-expanded Section</AtlAccordionHeader>
        This item starts expanded.
      </AtlAccordionItem>
      <AtlAccordionItem>
        <AtlAccordionHeader>Collapsed Section</AtlAccordionHeader>
        This item starts collapsed.
      </AtlAccordionItem>
    </AtlAccordionGroup>
  ),
};
