import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlBreadcrumbs from './atl-breadcrumbs.vue';
import AtlBreadcrumbItem from './atl-breadcrumb-item.vue';

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
  render: () => ({
    components: { AtlBreadcrumbs, AtlBreadcrumbItem },
    template: `
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/products">Products</AtlBreadcrumbItem>
        <AtlBreadcrumbItem :current="true">Widget Pro</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-138') },
};

export const SingleItem: Story = {
  render: () => ({
    components: { AtlBreadcrumbs, AtlBreadcrumbItem },
    template: `
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem :current="true">Home</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    `,
  }),
};

export const DeepNavigation: Story = {
  render: () => ({
    components: { AtlBreadcrumbs, AtlBreadcrumbItem },
    template: `
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/admin">Admin</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/admin/users">Users</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/admin/users/42">John Doe</AtlBreadcrumbItem>
        <AtlBreadcrumbItem :current="true">Edit</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-140') },
};

export const LongTrail: Story = {
  render: () => ({
    components: { AtlBreadcrumbs, AtlBreadcrumbItem },
    template: `
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/catalog">Catalog</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/catalog/electronics">Electronics</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/catalog/electronics/phones">Phones</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/catalog/electronics/phones/smartphones">Smartphones</AtlBreadcrumbItem>
        <AtlBreadcrumbItem :current="true">Acme Pro Max Ultra</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-140') },
};

export const NoLinks: Story = {
  render: () => ({
    components: { AtlBreadcrumbs, AtlBreadcrumbItem },
    template: `
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem>Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Settings</AtlBreadcrumbItem>
        <AtlBreadcrumbItem :current="true">Profile</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    `,
  }),
};

export const Dynamic: Story = {
  render: () => ({
    components: { AtlBreadcrumbs, AtlBreadcrumbItem },
    setup() {
      const items = ref([
        { href: '/home', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/products/widgets', label: 'Widgets' },
      ]);
      function addItem() {
        items.value = [
          ...items.value,
          { href: `/level-${items.value.length + 1}`, label: `Level ${items.value.length + 1}` },
        ];
      }
      function removeItem() {
        if (items.value.length > 1) items.value = items.value.slice(0, -1);
      }
      return { items, addItem, removeItem };
    },
    template: `
      <div style="display:flex;gap:0.5rem;margin-bottom:1rem">
        <button
          type="button"
          style="padding:0.25rem 0.75rem;border:1px solid var(--ui-color-border);border-radius:var(--ui-radius-md);cursor:pointer;background:var(--ui-color-surface);color:var(--ui-color-text);font-size:0.875rem"
          @click="addItem"
        >+ Add</button>
        <button
          type="button"
          style="padding:0.25rem 0.75rem;border:1px solid var(--ui-color-border);border-radius:var(--ui-radius-md);cursor:pointer;background:var(--ui-color-surface);color:var(--ui-color-text);font-size:0.875rem"
          @click="removeItem"
        >- Remove</button>
      </div>
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem v-for="(item, idx) in items" :key="item.href" :href="idx === items.length - 1 ? undefined : item.href" :current="idx === items.length - 1">
          {{ item.label }}
        </AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    `,
  }),
};
