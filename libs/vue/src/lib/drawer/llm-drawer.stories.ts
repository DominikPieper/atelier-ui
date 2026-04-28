import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmDrawer from './llm-drawer.vue';
import LlmDrawerHeader from './llm-drawer-header.vue';
import LlmDrawerContent from './llm-drawer-content.vue';
import LlmDrawerFooter from './llm-drawer-footer.vue';
import LlmButton from '../button/llm-button.vue';
import LlmInput from '../input/llm-input.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmDrawer> = {
  title: 'Components/Overlay/LlmDrawer',
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
  parameters: { design: figmaNode('421-398') },
};

export default meta;
type Story = StoryObj<typeof LlmDrawer>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Drawer</LlmButton>
        <LlmDrawer v-bind="args" v-model:open="isOpen">
          <LlmDrawerHeader>Settings</LlmDrawerHeader>
          <LlmDrawerContent>
            <p>Drawer content goes here. You can put any form controls or content inside.</p>
          </LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Save</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-342') },
};

export const Left: Story = {
  args: { position: 'left' },
  render: (args) => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="outline" @click="isOpen = true">Open Left Drawer</LlmButton>
        <LlmDrawer v-bind="args" v-model:open="isOpen">
          <LlmDrawerHeader>Navigation</LlmDrawerHeader>
          <LlmDrawerContent><p>Left-side navigation drawer.</p></LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="primary" @click="isOpen = false">Close</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-356') },
};

export const Top: Story = {
  args: { position: 'top' },
  render: (args) => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="outline" @click="isOpen = true">Open Top Drawer</LlmButton>
        <LlmDrawer v-bind="args" v-model:open="isOpen">
          <LlmDrawerHeader>Filters</LlmDrawerHeader>
          <LlmDrawerContent><p>Top panel for filters or search.</p></LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="primary" @click="isOpen = false">Apply</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-370') },
};

export const Bottom: Story = {
  args: { position: 'bottom' },
  render: (args) => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="outline" @click="isOpen = true">Open Bottom Drawer</LlmButton>
        <LlmDrawer v-bind="args" v-model:open="isOpen">
          <LlmDrawerHeader>Action Sheet</LlmDrawerHeader>
          <LlmDrawerContent><p>Mobile-style action sheet from the bottom.</p></LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Confirm</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-384') },
};

export const SizeVariants: Story = {
  render: () => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton },
    setup() {
      const openSize = ref<string | null>(null);
      const sizes = ['sm', 'md', 'lg', 'full'] as const;
      return { openSize, sizes };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <LlmButton v-for="size in sizes" :key="size" variant="outline" size="sm" @click="openSize = size">
          {{ size.toUpperCase() }}
        </LlmButton>
        <LlmDrawer
          v-for="size in sizes"
          :key="size"
          :open="openSize === size"
          :size="size"
          @update:open="openSize = null"
        >
          <LlmDrawerHeader>{{ size.toUpperCase() }} Drawer</LlmDrawerHeader>
          <LlmDrawerContent><p>This is a {{ size }} drawer.</p></LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="primary" @click="openSize = null">Close</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-398') },
};

export const WithForm: Story = {
  render: (args) => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton, LlmInput },
    setup() {
      const isOpen = ref(false);
      const name = ref('');
      const email = ref('');
      return { args, isOpen, name, email };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Edit Profile</LlmButton>
        <LlmDrawer v-bind="args" v-model:open="isOpen">
          <LlmDrawerHeader>Edit Profile</LlmDrawerHeader>
          <LlmDrawerContent>
            <div style="display:flex;flex-direction:column;gap:1rem">
              <LlmInput label="Name" placeholder="Your name" v-model:value="name" />
              <LlmInput label="Email" type="email" placeholder="you@example.com" v-model:value="email" />
            </div>
          </LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Save Changes</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-342') },
};

export const AllPositions: Story = {
  render: () => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton },
    setup() {
      const openPosition = ref<string | null>(null);
      const positions = ['left', 'right', 'top', 'bottom'] as const;
      return { openPosition, positions };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <LlmButton v-for="pos in positions" :key="pos" variant="outline" @click="openPosition = pos">
          Open {{ pos }}
        </LlmButton>
        <LlmDrawer
          v-for="pos in positions"
          :key="pos"
          :open="openPosition === pos"
          :position="pos"
          @update:open="openPosition = null"
        >
          <LlmDrawerHeader>{{ pos.charAt(0).toUpperCase() + pos.slice(1) }} Drawer</LlmDrawerHeader>
          <LlmDrawerContent><p>This drawer slides in from the {{ pos }}.</p></LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="primary" @click="openPosition = null">Close</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-398') },
};

export const NoBackdropClose: Story = {
  render: () => ({
    components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Persistent Drawer</LlmButton>
        <LlmDrawer v-model:open="isOpen" :closeOnBackdrop="false">
          <LlmDrawerHeader>Persistent Drawer</LlmDrawerHeader>
          <LlmDrawerContent>
            <p>Clicking the backdrop won't close this drawer. Use the close button.</p>
          </LlmDrawerContent>
          <LlmDrawerFooter>
            <LlmButton variant="primary" @click="isOpen = false">Done</LlmButton>
          </LlmDrawerFooter>
        </LlmDrawer>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-342') },
};
