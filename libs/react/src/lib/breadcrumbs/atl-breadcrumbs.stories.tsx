import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from './atl-breadcrumbs';

import { metadata } from '@atelier-ui/spec/metadata/breadcrumbs.metadata';
import { contract } from '@atelier-ui/spec/contracts/breadcrumbs.contract';
const FIGMA_FILE =
  'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

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
    contract,
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
  play: async ({ canvas }) => {
    // Only the current page is semibold + aria-current; a crumb without a link
    // that is not the current page is plain text (regular weight, no aria-current).
    for (const name of ['Home', 'Settings']) {
      const el = canvas.getByText(name);
      await expect(el).not.toHaveAttribute('aria-current');
      await expect(getComputedStyle(el).fontWeight).toBe('400');
    }
    const current = canvas.getByText('Profile');
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(getComputedStyle(current).fontWeight).toBe('600');
  },
};
