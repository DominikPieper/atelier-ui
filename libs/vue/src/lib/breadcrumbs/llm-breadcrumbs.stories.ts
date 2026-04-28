import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmBreadcrumbs from './llm-breadcrumbs.vue';
import LlmBreadcrumbItem from './llm-breadcrumb-item.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

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
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/products">Products</LlmBreadcrumbItem>
        <LlmBreadcrumbItem :current="true">Widget Pro</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-138') },
};

export const SingleItem: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem :current="true">Home</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
};

export const DeepNavigation: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/admin">Admin</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/admin/users">Users</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/admin/users/42">John Doe</LlmBreadcrumbItem>
        <LlmBreadcrumbItem :current="true">Edit</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-140') },
};

export const LongTrail: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/catalog">Catalog</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/catalog/electronics">Electronics</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/catalog/electronics/phones">Phones</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/catalog/electronics/phones/smartphones">Smartphones</LlmBreadcrumbItem>
        <LlmBreadcrumbItem :current="true">Acme Pro Max Ultra</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
  parameters: { design: figmaNode('55-140') },
};

export const NoLinks: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
    template: `
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem>Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem>Settings</LlmBreadcrumbItem>
        <LlmBreadcrumbItem :current="true">Profile</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
};

export const Dynamic: Story = {
  render: () => ({
    components: { LlmBreadcrumbs, LlmBreadcrumbItem },
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
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem v-for="(item, idx) in items" :key="item.href" :href="idx === items.length - 1 ? undefined : item.href" :current="idx === items.length - 1">
          {{ item.label }}
        </LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    `,
  }),
};
