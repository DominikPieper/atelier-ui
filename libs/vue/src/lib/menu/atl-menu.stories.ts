import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlMenuTrigger from './atl-menu-trigger.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}
import AtlMenu from './atl-menu.vue';
import AtlMenuItem from './atl-menu-item.vue';
import AtlMenuSeparator from './atl-menu-separator.vue';

import { metadata } from '@atelier-ui/spec/metadata/menu.metadata';
const meta: Meta<typeof AtlMenu> = {
  title: 'Components/Navigation/AtlMenu',
  component: AtlMenu,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'compact'] },
  },
  args: {
    variant: 'default',
  },
  parameters: {
    design: figmaNode('55-130'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlMenu>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlMenuTrigger, AtlMenu, AtlMenuItem, AtlMenuSeparator },
    setup() {
      return { args };
    },
    template: `
      <AtlMenuTrigger>
        <template #trigger>
          <button type="button">Actions</button>
        </template>
        <template #menu>
          <AtlMenu v-bind="args">
            <AtlMenuItem @triggered="() => alert('Copy!')">Copy</AtlMenuItem>
            <AtlMenuItem @triggered="() => alert('Paste!')">Paste</AtlMenuItem>
            <AtlMenuSeparator />
            <AtlMenuItem :disabled="true">Delete</AtlMenuItem>
          </AtlMenu>
        </template>
      </AtlMenuTrigger>
    `,
  }),
  parameters: { design: figmaNode('55-128') },
};

export const Compact: Story = {
  render: () => ({
    components: { AtlMenuTrigger, AtlMenu, AtlMenuItem },
    template: `
      <AtlMenuTrigger>
        <template #trigger>
          <button type="button">···</button>
        </template>
        <template #menu>
          <AtlMenu variant="compact">
            <AtlMenuItem>Edit</AtlMenuItem>
            <AtlMenuItem>Duplicate</AtlMenuItem>
            <AtlMenuItem>Archive</AtlMenuItem>
          </AtlMenu>
        </template>
      </AtlMenuTrigger>
    `,
  }),
  parameters: { design: figmaNode('55-129') },
};

export const WithSeparators: Story = {
  render: () => ({
    components: { AtlMenuTrigger, AtlMenu, AtlMenuItem, AtlMenuSeparator },
    template: `
      <AtlMenuTrigger>
        <template #trigger>
          <button type="button">File</button>
        </template>
        <template #menu>
          <AtlMenu>
            <AtlMenuItem>New</AtlMenuItem>
            <AtlMenuItem>Open</AtlMenuItem>
            <AtlMenuSeparator />
            <AtlMenuItem>Save</AtlMenuItem>
            <AtlMenuItem>Save As…</AtlMenuItem>
            <AtlMenuSeparator />
            <AtlMenuItem>Exit</AtlMenuItem>
          </AtlMenu>
        </template>
      </AtlMenuTrigger>
    `,
  }),
};

export const MultipleMenus: Story = {
  render: () => ({
    components: { AtlMenuTrigger, AtlMenu, AtlMenuItem, AtlMenuSeparator },
    template: `
      <div style="display:flex;gap:1rem">
        <AtlMenuTrigger>
          <template #trigger><button type="button">File</button></template>
          <template #menu>
            <AtlMenu>
              <AtlMenuItem>New</AtlMenuItem>
              <AtlMenuItem>Open</AtlMenuItem>
            </AtlMenu>
          </template>
        </AtlMenuTrigger>
        <AtlMenuTrigger>
          <template #trigger><button type="button">Edit</button></template>
          <template #menu>
            <AtlMenu>
              <AtlMenuItem>Undo</AtlMenuItem>
              <AtlMenuItem>Redo</AtlMenuItem>
              <AtlMenuSeparator />
              <AtlMenuItem>Cut</AtlMenuItem>
              <AtlMenuItem>Copy</AtlMenuItem>
              <AtlMenuItem>Paste</AtlMenuItem>
            </AtlMenu>
          </template>
        </AtlMenuTrigger>
      </div>
    `,
  }),
};
