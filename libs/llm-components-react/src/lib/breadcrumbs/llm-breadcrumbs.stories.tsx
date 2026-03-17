import type { Meta, StoryObj } from '@storybook/react';
import { LlmBreadcrumbs, LlmBreadcrumbItem } from './llm-breadcrumbs';

const meta: Meta<typeof LlmBreadcrumbs> = {
  title: 'Components/LlmBreadcrumbs',
  component: LlmBreadcrumbs,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LlmBreadcrumbs>;

export const Default: Story = {
  render: () => (
    <LlmBreadcrumbs>
      <LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>
      <LlmBreadcrumbItem href="/products">Products</LlmBreadcrumbItem>
      <LlmBreadcrumbItem>Widget X</LlmBreadcrumbItem>
    </LlmBreadcrumbs>
  ),
};

export const TwoLevels: Story = {
  render: () => (
    <LlmBreadcrumbs>
      <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
      <LlmBreadcrumbItem>Settings</LlmBreadcrumbItem>
    </LlmBreadcrumbs>
  ),
};

export const DeepNesting: Story = {
  render: () => (
    <LlmBreadcrumbs>
      <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
      <LlmBreadcrumbItem href="/docs">Documentation</LlmBreadcrumbItem>
      <LlmBreadcrumbItem href="/docs/components">Components</LlmBreadcrumbItem>
      <LlmBreadcrumbItem href="/docs/components/forms">Forms</LlmBreadcrumbItem>
      <LlmBreadcrumbItem>Select</LlmBreadcrumbItem>
    </LlmBreadcrumbs>
  ),
};

export const SingleItem: Story = {
  render: () => (
    <LlmBreadcrumbs>
      <LlmBreadcrumbItem>Home</LlmBreadcrumbItem>
    </LlmBreadcrumbs>
  ),
};
