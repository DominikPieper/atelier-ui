import type { Meta, StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { signal } from '@angular/core';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from './atl-breadcrumbs';

import { metadata } from '@atelier-ui/spec/metadata/breadcrumbs.metadata';
import { contract } from '@atelier-ui/spec/contracts/breadcrumbs.contract';
const ALL_IMPORTS = [AtlBreadcrumbs, AtlBreadcrumbItem];

const FIGMA_FILE =
  'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlBreadcrumbs> = {
  title: 'Components/Navigation/AtlBreadcrumbs',
  component: AtlBreadcrumbs,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-141'),
    docs: { description: { component: metadata.purpose } },
    a11y: {
      config: {
        rules: [
          // a11y debt (S0, 2026-09-12): listitem — every <atl-breadcrumb-item> wraps its own host element around the <li>, so axe sees the <li> as a child of <atl-breadcrumb-item>, not a direct child of the <ol> — tasks/todo.md "a11y backlog"; fix, then remove.
          { id: 'listitem', enabled: false },
        ],
      },
    },
    contract,
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
          {
            href: `/level-${items.length + 1}`,
            label: `Level ${items.length + 1}`,
          },
        ]);
      },
      removeItem() {
        this['items'].update((items: { href: string; label: string }[]) =>
          items.length > 1 ? items.slice(0, -1) : items,
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
