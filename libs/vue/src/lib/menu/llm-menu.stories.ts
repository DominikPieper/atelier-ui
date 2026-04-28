import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmMenuTrigger from './llm-menu-trigger.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}
import LlmMenu from './llm-menu.vue';
import LlmMenuItem from './llm-menu-item.vue';
import LlmMenuSeparator from './llm-menu-separator.vue';

const meta: Meta<typeof LlmMenu> = {
  title: 'Components/Navigation/LlmMenu',
  component: LlmMenu,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'compact'] },
  },
  args: {
    variant: 'default',
  },
  parameters: {
    design: figmaNode('55-130'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmMenu>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmMenuTrigger, LlmMenu, LlmMenuItem, LlmMenuSeparator },
    setup() {
      return { args };
    },
    template: `
      <LlmMenuTrigger>
        <template #trigger>
          <button type="button">Actions</button>
        </template>
        <template #menu>
          <LlmMenu v-bind="args">
            <LlmMenuItem @triggered="() => alert('Copy!')">Copy</LlmMenuItem>
            <LlmMenuItem @triggered="() => alert('Paste!')">Paste</LlmMenuItem>
            <LlmMenuSeparator />
            <LlmMenuItem :disabled="true">Delete</LlmMenuItem>
          </LlmMenu>
        </template>
      </LlmMenuTrigger>
    `,
  }),
  parameters: { design: figmaNode('55-128') },
};

export const Compact: Story = {
  render: () => ({
    components: { LlmMenuTrigger, LlmMenu, LlmMenuItem },
    template: `
      <LlmMenuTrigger>
        <template #trigger>
          <button type="button">···</button>
        </template>
        <template #menu>
          <LlmMenu variant="compact">
            <LlmMenuItem>Edit</LlmMenuItem>
            <LlmMenuItem>Duplicate</LlmMenuItem>
            <LlmMenuItem>Archive</LlmMenuItem>
          </LlmMenu>
        </template>
      </LlmMenuTrigger>
    `,
  }),
  parameters: { design: figmaNode('55-129') },
};

export const WithSeparators: Story = {
  render: () => ({
    components: { LlmMenuTrigger, LlmMenu, LlmMenuItem, LlmMenuSeparator },
    template: `
      <LlmMenuTrigger>
        <template #trigger>
          <button type="button">File</button>
        </template>
        <template #menu>
          <LlmMenu>
            <LlmMenuItem>New</LlmMenuItem>
            <LlmMenuItem>Open</LlmMenuItem>
            <LlmMenuSeparator />
            <LlmMenuItem>Save</LlmMenuItem>
            <LlmMenuItem>Save As…</LlmMenuItem>
            <LlmMenuSeparator />
            <LlmMenuItem>Exit</LlmMenuItem>
          </LlmMenu>
        </template>
      </LlmMenuTrigger>
    `,
  }),
};

export const MultipleMenus: Story = {
  render: () => ({
    components: { LlmMenuTrigger, LlmMenu, LlmMenuItem, LlmMenuSeparator },
    template: `
      <div style="display:flex;gap:1rem">
        <LlmMenuTrigger>
          <template #trigger><button type="button">File</button></template>
          <template #menu>
            <LlmMenu>
              <LlmMenuItem>New</LlmMenuItem>
              <LlmMenuItem>Open</LlmMenuItem>
            </LlmMenu>
          </template>
        </LlmMenuTrigger>
        <LlmMenuTrigger>
          <template #trigger><button type="button">Edit</button></template>
          <template #menu>
            <LlmMenu>
              <LlmMenuItem>Undo</LlmMenuItem>
              <LlmMenuItem>Redo</LlmMenuItem>
              <LlmMenuSeparator />
              <LlmMenuItem>Cut</LlmMenuItem>
              <LlmMenuItem>Copy</LlmMenuItem>
              <LlmMenuItem>Paste</LlmMenuItem>
            </LlmMenu>
          </template>
        </LlmMenuTrigger>
      </div>
    `,
  }),
};
