import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlDrawer from './atl-drawer.vue';
import AtlDrawerHeader from './atl-drawer-header.vue';
import AtlDrawerContent from './atl-drawer-content.vue';
import AtlDrawerFooter from './atl-drawer-footer.vue';
import AtlButton from '../button/atl-button.vue';
import AtlInput from '../input/atl-input.vue';

import { metadata } from '@atelier-ui/spec/metadata/drawer.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlDrawer> = {
  title: 'Components/Overlay/AtlDrawer',
  component: AtlDrawer,
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
  parameters: { design: figmaNode('421-398'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlDrawer>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Drawer</AtlButton>
        <AtlDrawer v-bind="args" v-model:open="isOpen">
          <AtlDrawerHeader>Settings</AtlDrawerHeader>
          <AtlDrawerContent>
            <p>Drawer content goes here. You can put any form controls or content inside.</p>
          </AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Save</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-342') },
};

export const Left: Story = {
  args: { position: 'left' },
  render: (args) => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="outline" @click="isOpen = true">Open Left Drawer</AtlButton>
        <AtlDrawer v-bind="args" v-model:open="isOpen">
          <AtlDrawerHeader>Navigation</AtlDrawerHeader>
          <AtlDrawerContent><p>Left-side navigation drawer.</p></AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="primary" @click="isOpen = false">Close</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-356') },
};

export const Top: Story = {
  args: { position: 'top' },
  render: (args) => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="outline" @click="isOpen = true">Open Top Drawer</AtlButton>
        <AtlDrawer v-bind="args" v-model:open="isOpen">
          <AtlDrawerHeader>Filters</AtlDrawerHeader>
          <AtlDrawerContent><p>Top panel for filters or search.</p></AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="primary" @click="isOpen = false">Apply</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-370') },
};

export const Bottom: Story = {
  args: { position: 'bottom' },
  render: (args) => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="outline" @click="isOpen = true">Open Bottom Drawer</AtlButton>
        <AtlDrawer v-bind="args" v-model:open="isOpen">
          <AtlDrawerHeader>Action Sheet</AtlDrawerHeader>
          <AtlDrawerContent><p>Mobile-style action sheet from the bottom.</p></AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Confirm</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-384') },
};

export const SizeVariants: Story = {
  render: () => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton },
    setup() {
      const openSize = ref<string | null>(null);
      const sizes = ['sm', 'md', 'lg', 'full'] as const;
      return { openSize, sizes };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <AtlButton v-for="size in sizes" :key="size" variant="outline" size="sm" @click="openSize = size">
          {{ size.toUpperCase() }}
        </AtlButton>
        <AtlDrawer
          v-for="size in sizes"
          :key="size"
          :open="openSize === size"
          :size="size"
          @update:open="openSize = null"
        >
          <AtlDrawerHeader>{{ size.toUpperCase() }} Drawer</AtlDrawerHeader>
          <AtlDrawerContent><p>This is a {{ size }} drawer.</p></AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="primary" @click="openSize = null">Close</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-398') },
};

export const WithForm: Story = {
  render: (args) => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton, AtlInput },
    setup() {
      const isOpen = ref(false);
      const name = ref('');
      const email = ref('');
      return { args, isOpen, name, email };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Edit Profile</AtlButton>
        <AtlDrawer v-bind="args" v-model:open="isOpen">
          <AtlDrawerHeader>Edit Profile</AtlDrawerHeader>
          <AtlDrawerContent>
            <div style="display:flex;flex-direction:column;gap:1rem">
              <AtlInput label="Name" placeholder="Your name" v-model:value="name" />
              <AtlInput label="Email" type="email" placeholder="you@example.com" v-model:value="email" />
            </div>
          </AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Save Changes</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-342') },
};

export const AllPositions: Story = {
  render: () => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton },
    setup() {
      const openPosition = ref<string | null>(null);
      const positions = ['left', 'right', 'top', 'bottom'] as const;
      return { openPosition, positions };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <AtlButton v-for="pos in positions" :key="pos" variant="outline" @click="openPosition = pos">
          Open {{ pos }}
        </AtlButton>
        <AtlDrawer
          v-for="pos in positions"
          :key="pos"
          :open="openPosition === pos"
          :position="pos"
          @update:open="openPosition = null"
        >
          <AtlDrawerHeader>{{ pos.charAt(0).toUpperCase() + pos.slice(1) }} Drawer</AtlDrawerHeader>
          <AtlDrawerContent><p>This drawer slides in from the {{ pos }}.</p></AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="primary" @click="openPosition = null">Close</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-398') },
};

export const NoBackdropClose: Story = {
  render: () => ({
    components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { isOpen };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Persistent Drawer</AtlButton>
        <AtlDrawer v-model:open="isOpen" :closeOnBackdrop="false">
          <AtlDrawerHeader>Persistent Drawer</AtlDrawerHeader>
          <AtlDrawerContent>
            <p>Clicking the backdrop won't close this drawer. Use the close button.</p>
          </AtlDrawerContent>
          <AtlDrawerFooter>
            <AtlButton variant="primary" @click="isOpen = false">Done</AtlButton>
          </AtlDrawerFooter>
        </AtlDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-342') },
};
