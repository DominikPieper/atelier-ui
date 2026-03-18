import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { LlmBreadcrumbs, LlmBreadcrumbItem } from './llm-breadcrumbs';

const ALL_IMPORTS = [LlmBreadcrumbs, LlmBreadcrumbItem];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmBreadcrumbs> = {
  title: 'Components/LlmBreadcrumbs',
  component: LlmBreadcrumbs,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('3-1021'),
  },
};

export default meta;
type Story = StoryObj<LlmBreadcrumbs>;

export const Default: Story = {
  render: () => ({
    imports: ALL_IMPORTS,
    template: `
      <llm-breadcrumbs>
        <llm-breadcrumb-item href="/home">Home</llm-breadcrumb-item>
        <llm-breadcrumb-item href="/products">Products</llm-breadcrumb-item>
        <llm-breadcrumb-item>Widget X</llm-breadcrumb-item>
      </llm-breadcrumbs>
    `,
  }),
};

export const SingleItem: Story = {
  render: () => ({
    imports: ALL_IMPORTS,
    template: `
      <llm-breadcrumbs>
        <llm-breadcrumb-item>Dashboard</llm-breadcrumb-item>
      </llm-breadcrumbs>
    `,
  }),
};

export const LongTrail: Story = {
  render: () => ({
    imports: ALL_IMPORTS,
    template: `
      <llm-breadcrumbs>
        <llm-breadcrumb-item href="/">Home</llm-breadcrumb-item>
        <llm-breadcrumb-item href="/catalog">Catalog</llm-breadcrumb-item>
        <llm-breadcrumb-item href="/catalog/electronics">Electronics</llm-breadcrumb-item>
        <llm-breadcrumb-item href="/catalog/electronics/phones">Phones</llm-breadcrumb-item>
        <llm-breadcrumb-item href="/catalog/electronics/phones/smartphones">Smartphones</llm-breadcrumb-item>
        <llm-breadcrumb-item>Acme Pro Max Ultra</llm-breadcrumb-item>
      </llm-breadcrumbs>
    `,
  }),
};

export const NoLinks: Story = {
  render: () => ({
    imports: ALL_IMPORTS,
    template: `
      <llm-breadcrumbs>
        <llm-breadcrumb-item>Home</llm-breadcrumb-item>
        <llm-breadcrumb-item>Settings</llm-breadcrumb-item>
        <llm-breadcrumb-item>Profile</llm-breadcrumb-item>
      </llm-breadcrumbs>
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
    imports: ALL_IMPORTS,
    template: `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
        <button
          style="padding: 0.25rem 0.75rem; border: 1px solid var(--ui-color-border); border-radius: var(--ui-radius-md); cursor: pointer; background: var(--ui-color-surface); color: var(--ui-color-text); font-size: 0.875rem;"
          (click)="addItem()">+ Add</button>
        <button
          style="padding: 0.25rem 0.75rem; border: 1px solid var(--ui-color-border); border-radius: var(--ui-radius-md); cursor: pointer; background: var(--ui-color-surface); color: var(--ui-color-text); font-size: 0.875rem;"
          (click)="removeItem()">- Remove</button>
      </div>
      <llm-breadcrumbs>
        @for (item of items(); track item.href) {
          <llm-breadcrumb-item [href]="item.href">{{ item.label }}</llm-breadcrumb-item>
        }
      </llm-breadcrumbs>
    `,
  }),
};
