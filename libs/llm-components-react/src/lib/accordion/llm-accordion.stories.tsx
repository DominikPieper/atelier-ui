import type { Meta, StoryObj } from '@storybook/react';
import { LlmAccordionGroup, LlmAccordionItem, LlmAccordionHeader } from './llm-accordion';

const meta: Meta<typeof LlmAccordionGroup> = {
  title: 'Components/LlmAccordionGroup',
  component: LlmAccordionGroup,
  tags: ['autodocs'],
  argTypes: {
    multi: { control: 'boolean' },
    variant: { control: 'select', options: ['default', 'bordered', 'separated'] },
  },
  args: { multi: false, variant: 'default' },
};

export default meta;
type Story = StoryObj<typeof LlmAccordionGroup>;

export const Default: Story = {
  render: (args) => (
    <LlmAccordionGroup {...args}>
      <LlmAccordionItem>
        <LlmAccordionHeader>What is this component library?</LlmAccordionHeader>
        A set of accessible, composable UI components designed for use with LLM-generated applications.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>How do I install it?</LlmAccordionHeader>
        Install via npm and import the components you need.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Is it accessible?</LlmAccordionHeader>
        Yes. All components follow WAI-ARIA patterns with keyboard navigation support.
      </LlmAccordionItem>
    </LlmAccordionGroup>
  ),
};

export const MultiExpand: Story = {
  args: { multi: true },
  render: (args) => (
    <LlmAccordionGroup {...args}>
      <LlmAccordionItem>
        <LlmAccordionHeader>Section A</LlmAccordionHeader>
        Content for section A. Multiple items can be open at once.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Section B</LlmAccordionHeader>
        Content for section B.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Section C</LlmAccordionHeader>
        Content for section C.
      </LlmAccordionItem>
    </LlmAccordionGroup>
  ),
};

export const Bordered: Story = {
  args: { variant: 'bordered' },
  render: (args) => (
    <LlmAccordionGroup {...args}>
      <LlmAccordionItem>
        <LlmAccordionHeader>Bordered Section 1</LlmAccordionHeader>
        Content inside bordered accordion.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Bordered Section 2</LlmAccordionHeader>
        More content here.
      </LlmAccordionItem>
    </LlmAccordionGroup>
  ),
};

export const Separated: Story = {
  args: { variant: 'separated', multi: true },
  render: (args) => (
    <LlmAccordionGroup {...args}>
      <LlmAccordionItem>
        <LlmAccordionHeader>Card Section 1</LlmAccordionHeader>
        Content inside separated card-style accordion.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Card Section 2</LlmAccordionHeader>
        More content here.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Card Section 3</LlmAccordionHeader>
        Even more content.
      </LlmAccordionItem>
    </LlmAccordionGroup>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <LlmAccordionGroup>
      <LlmAccordionItem>
        <LlmAccordionHeader>Available Section</LlmAccordionHeader>
        This section is enabled.
      </LlmAccordionItem>
      <LlmAccordionItem disabled>
        <LlmAccordionHeader>Disabled Section</LlmAccordionHeader>
        This content is not accessible.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Another Available Section</LlmAccordionHeader>
        This section is also enabled.
      </LlmAccordionItem>
    </LlmAccordionGroup>
  ),
};

export const PreExpanded: Story = {
  render: () => (
    <LlmAccordionGroup>
      <LlmAccordionItem expanded>
        <LlmAccordionHeader>Pre-expanded Section</LlmAccordionHeader>
        This item starts expanded.
      </LlmAccordionItem>
      <LlmAccordionItem>
        <LlmAccordionHeader>Collapsed Section</LlmAccordionHeader>
        This item starts collapsed.
      </LlmAccordionItem>
    </LlmAccordionGroup>
  ),
};
