import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import LlmDrawer from './llm-drawer.vue';
import LlmDrawerHeader from './llm-drawer-header.vue';
import LlmDrawerContent from './llm-drawer-content.vue';
import LlmDrawerFooter from './llm-drawer-footer.vue';

const meta: Meta<typeof LlmDrawer> = {
  title: 'Components/LlmDrawer',
  component: LlmDrawer,
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    open: false,
    position: 'right',
    size: 'md',
    closeOnBackdrop: true,
  },
};

export default meta;
type Story = StoryObj<typeof LlmDrawer>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <button type="button" @click="isOpen = true">Open Drawer</button>
        <LlmDrawer v-bind="args" v-model:open="isOpen">
          <LlmDrawerHeader>Drawer Title</LlmDrawerHeader>
          <LlmDrawerContent>
            <p>Drawer body content goes here.</p>
            <p>You can place any content inside.</p>
          </LlmDrawerContent>
          <LlmDrawerFooter>
            <button type="button" @click="isOpen = false">Cancel</button>
            <button type="button" @click="isOpen = false">Save</button>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
};

export const AllPositions: Story = {
  render: () => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter },
    setup() {
      const openPosition = ref<string | null>(null);
      return { openPosition, positions: ['left', 'right', 'top', 'bottom'] };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button
          v-for="pos in positions"
          :key="pos"
          type="button"
          @click="openPosition = pos"
        >
          Open {{ pos }}
        </button>
        <LlmDrawer
          v-for="pos in positions"
          :key="pos"
          :open="openPosition === pos"
          :position="pos"
          @update:open="openPosition = null"
        >
          <LlmDrawerHeader>{{ pos.charAt(0).toUpperCase() + pos.slice(1) }} Drawer</LlmDrawerHeader>
          <LlmDrawerContent>
            <p>This drawer slides in from the {{ pos }}.</p>
          </LlmDrawerContent>
          <LlmDrawerFooter>
            <button type="button" @click="openPosition = null">Close</button>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
};

export const NoBackdropClose: Story = {
  render: () => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter },
    setup() {
      const isOpen = ref(false);
      return { isOpen };
    },
    template: `
      <div>
        <button type="button" @click="isOpen = true">Open Persistent Drawer</button>
        <LlmDrawer v-model:open="isOpen" :closeOnBackdrop="false">
          <LlmDrawerHeader>Persistent Drawer</LlmDrawerHeader>
          <LlmDrawerContent>
            <p>Clicking the backdrop won't close this drawer. Use the close button.</p>
          </LlmDrawerContent>
          <LlmDrawerFooter>
            <button type="button" @click="isOpen = false">Done</button>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
};
