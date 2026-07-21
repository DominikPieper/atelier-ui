import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from './atl-breadcrumbs';

import { metadata } from '@atelier-ui/spec/metadata/breadcrumbs.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlBreadcrumbs> = {
  title: 'Components/Navigation/AtlBreadcrumbs',
  component: AtlBreadcrumbs,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-141'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlBreadcrumbs>;

export const Default: Story = {
  render: () => (
    <AtlBreadcrumbs>
      <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
      <AtlBreadcrumbItem href="/products">Products</AtlBreadcrumbItem>
      <AtlBreadcrumbItem>Widget X</AtlBreadcrumbItem>
    </AtlBreadcrumbs>
  ),
  parameters: { design: figmaNode('55-138') },
};

export const TwoLevels: Story = {
  render: () => (
    <AtlBreadcrumbs>
      <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
      <AtlBreadcrumbItem>Settings</AtlBreadcrumbItem>
    </AtlBreadcrumbs>
  ),
};

export const DeepNesting: Story = {
  render: () => (
    <AtlBreadcrumbs>
      <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
      <AtlBreadcrumbItem href="/docs">Documentation</AtlBreadcrumbItem>
      <AtlBreadcrumbItem href="/docs/components">Components</AtlBreadcrumbItem>
      <AtlBreadcrumbItem href="/docs/components/forms">Forms</AtlBreadcrumbItem>
      <AtlBreadcrumbItem>Select</AtlBreadcrumbItem>
    </AtlBreadcrumbs>
  ),
  parameters: { design: figmaNode('55-140') },
};

export const SingleItem: Story = {
  render: () => (
    <AtlBreadcrumbs>
      <AtlBreadcrumbItem>Home</AtlBreadcrumbItem>
    </AtlBreadcrumbs>
  ),
};

export const NoLinks: Story = {
  render: () => (
    <AtlBreadcrumbs>
      <AtlBreadcrumbItem>Home</AtlBreadcrumbItem>
      <AtlBreadcrumbItem>Settings</AtlBreadcrumbItem>
      <AtlBreadcrumbItem>Profile</AtlBreadcrumbItem>
    </AtlBreadcrumbs>
  ),
};
