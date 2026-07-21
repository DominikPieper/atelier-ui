import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from './atl-breadcrumbs';

import { metadata } from '@atelier-ui/spec/metadata/breadcrumbs.metadata';
const ALL_IMPORTS = [AtlBreadcrumbs, AtlBreadcrumbItem];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlBreadcrumbs> = {
  title: 'Components/Navigation/AtlBreadcrumbs',
  component: AtlBreadcrumbs,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-141'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlBreadcrumbs>;

export const Default: Story = {
  render: () => ({
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-breadcrumbs>
        <atl-breadcrumb-item href="/home">Home</atl-breadcrumb-item>
        <atl-breadcrumb-item href="/products">Products</atl-breadcrumb-item>
        <atl-breadcrumb-item>Widget X</atl-breadcrumb-item>
      </atl-breadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-138') },
};

export const SingleItem: Story = {
  render: () => ({
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-breadcrumbs>
        <atl-breadcrumb-item>Dashboard</atl-breadcrumb-item>
      </atl-breadcrumbs>
    `,
  }),
};

export const LongTrail: Story = {
  render: () => ({
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-breadcrumbs>
        <atl-breadcrumb-item href="/">Home</atl-breadcrumb-item>
        <atl-breadcrumb-item href="/catalog">Catalog</atl-breadcrumb-item>
        <atl-breadcrumb-item href="/catalog/electronics">Electronics</atl-breadcrumb-item>
        <atl-breadcrumb-item href="/catalog/electronics/phones">Phones</atl-breadcrumb-item>
        <atl-breadcrumb-item href="/catalog/electronics/phones/smartphones">Smartphones</atl-breadcrumb-item>
        <atl-breadcrumb-item>Acme Pro Max Ultra</atl-breadcrumb-item>
      </atl-breadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-140') },
};

export const NoLinks: Story = {
  render: () => ({
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-breadcrumbs>
        <atl-breadcrumb-item>Home</atl-breadcrumb-item>
        <atl-breadcrumb-item>Settings</atl-breadcrumb-item>
        <atl-breadcrumb-item>Profile</atl-breadcrumb-item>
      </atl-breadcrumbs>
    `,
  }),
};

export const Dynamic: Story = {
  render: () => ({
    props: {
      items: signal([
        { href: '/home', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/products/widgets', label: 'Widgets' },
      ]),
      addItem() {
        this['items'].update((items: { href: string; label: string }[]) => [
          ...items,
          { href: `/level-${items.length + 1}`, label: `Level ${items.length + 1}` },
        ]);
      },
      removeItem() {
        this['items'].update((items: { href: string; label: string }[]) =>
          items.length > 1 ? items.slice(0, -1) : items
        );
      },
    },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <button
          style="padding: 0.25rem 0.75rem; border: 1px solid var(--ui-color-border); border-radius: var(--ui-radius-md); cursor: pointer; background: var(--ui-color-surface); color: var(--ui-color-text); font-size: 0.875rem;"
          (click)="addItem()">+ Add</button>
        <button
          style="padding: 0.25rem 0.75rem; border: 1px solid var(--ui-color-border); border-radius: var(--ui-radius-md); cursor: pointer; background: var(--ui-color-surface); color: var(--ui-color-text); font-size: 0.875rem;"
          (click)="removeItem()">- Remove</button>
      </div>
      <atl-breadcrumbs>
        @for (item of items(); track item.href) {
          <atl-breadcrumb-item [href]="item.href">{{ item.label }}</atl-breadcrumb-item>
        }
      </atl-breadcrumbs>
    `,
  }),
};
