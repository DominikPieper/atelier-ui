import type { Meta, StoryObj } from '@storybook/react-vite';
import { LlmBreadcrumbs, LlmBreadcrumbItem } from './llm-breadcrumbs';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmBreadcrumbs> = {
  title: 'Components/Navigation/LlmBreadcrumbs',
  component: LlmBreadcrumbs,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-141'),
  },
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
  parameters: { design: figmaNode('55-138') },
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
  parameters: { design: figmaNode('55-140') },
};

export const SingleItem: Story = {
  render: () => (
    <LlmBreadcrumbs>
      <LlmBreadcrumbItem>Home</LlmBreadcrumbItem>
    </LlmBreadcrumbs>
  ),
};

export const NoLinks: Story = {
  render: () => (
    <LlmBreadcrumbs>
      <LlmBreadcrumbItem>Home</LlmBreadcrumbItem>
      <LlmBreadcrumbItem>Settings</LlmBreadcrumbItem>
      <LlmBreadcrumbItem>Profile</LlmBreadcrumbItem>
    </LlmBreadcrumbs>
  ),
};
