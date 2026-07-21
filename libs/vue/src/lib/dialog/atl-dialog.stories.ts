import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlDialog from './atl-dialog.vue';
import AtlDialogHeader from './atl-dialog-header.vue';
import AtlDialogContent from './atl-dialog-content.vue';
import AtlDialogFooter from './atl-dialog-footer.vue';
import AtlButton from '../button/atl-button.vue';
import AtlInput from '../input/atl-input.vue';

import { metadata } from '@atelier-ui/spec/metadata/dialog.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlDialog> = {
  title: 'Components/Overlay/AtlDialog',
  component: AtlDialog,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    open: false,
    size: 'md',
    closeOnBackdrop: true,
  },
  parameters: {
    design: figmaNode('55-94'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlDialog>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Dialog</AtlButton>
        <AtlDialog v-bind="args" v-model:open="isOpen">
          <AtlDialogHeader>Confirm Action</AtlDialogHeader>
          <AtlDialogContent>
            <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
          </AtlDialogContent>
          <AtlDialogFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Confirm</AtlButton>
          </AtlDialogFooter>
        </AtlDialog>
      </div>
    `,
  }),
  parameters: { design: figmaNode('55-93') },
};

export const PreOpened: Story = {
  name: 'Pre-opened (no trigger)',
  render: (args) => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton },
    setup() {
      const isOpen = ref(true);
      return { args, isOpen };
    },
    template: `
      <AtlDialog v-bind="args" v-model:open="isOpen">
        <AtlDialogHeader>Pre-opened Dialog</AtlDialogHeader>
        <AtlDialogContent><p>This dialog is open on load.</p></AtlDialogContent>
        <AtlDialogFooter>
          <AtlButton variant="primary" @click="isOpen = false">Close</AtlButton>
        </AtlDialogFooter>
      </AtlDialog>
    `,
  }),
};

export const CloseButtonDismiss: Story = {
  name: 'Close via header X button',
  render: (args) => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Dialog</AtlButton>
        <AtlDialog v-bind="args" v-model:open="isOpen">
          <AtlDialogHeader>Confirm Action</AtlDialogHeader>
          <AtlDialogContent>
            <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
          </AtlDialogContent>
          <AtlDialogFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Confirm</AtlButton>
          </AtlDialogFooter>
        </AtlDialog>
      </div>
    `,
  }),
};

export const EscapeToClose: Story = {
  name: 'Escape key closes dialog',
  render: (args) => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Dialog</AtlButton>
        <AtlDialog v-bind="args" v-model:open="isOpen">
          <AtlDialogHeader>Confirm Action</AtlDialogHeader>
          <AtlDialogContent>
            <p>Press Escape to close this dialog.</p>
          </AtlDialogContent>
          <AtlDialogFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Confirm</AtlButton>
          </AtlDialogFooter>
        </AtlDialog>
      </div>
    `,
  }),
};

export const SizeVariants: Story = {
  render: () => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton },
    setup() {
      const openSize = ref<string | null>(null);
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
      return { openSize, sizes };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <AtlButton v-for="size in sizes" :key="size" variant="outline" size="sm" @click="openSize = size">
          {{ size.toUpperCase() }}
        </AtlButton>
        <AtlDialog
          v-for="size in sizes"
          :key="size"
          :open="openSize === size"
          :size="size"
          @update:open="openSize = null"
        >
          <AtlDialogHeader>{{ size.toUpperCase() }} Dialog</AtlDialogHeader>
          <AtlDialogContent><p>This is a {{ size }} dialog.</p></AtlDialogContent>
          <AtlDialogFooter>
            <AtlButton variant="primary" @click="openSize = null">Close</AtlButton>
          </AtlDialogFooter>
        </AtlDialog>
      </div>
    `,
  }),
};

export const WithForm: Story = {
  render: (args) => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton, AtlInput },
    setup() {
      const isOpen = ref(false);
      const name = ref('');
      const email = ref('');
      return { args, isOpen, name, email };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Form Dialog</AtlButton>
        <AtlDialog v-bind="args" v-model:open="isOpen">
          <AtlDialogHeader>User Details</AtlDialogHeader>
          <AtlDialogContent>
            <div style="display:flex;flex-direction:column;gap:1rem">
              <AtlInput label="Name" placeholder="Enter your name" v-model:value="name" />
              <AtlInput label="Email" type="email" placeholder="you@example.com" v-model:value="email" />
            </div>
          </AtlDialogContent>
          <AtlDialogFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Save</AtlButton>
          </AtlDialogFooter>
        </AtlDialog>
      </div>
    `,
  }),
};

export const LongContent: Story = {
  render: (args) => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Long Content Dialog</AtlButton>
        <AtlDialog v-bind="args" v-model:open="isOpen">
          <AtlDialogHeader>Terms of Service</AtlDialogHeader>
          <AtlDialogContent>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.</p>
            <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
            <p>Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam.</p>
            <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
            <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.</p>
          </AtlDialogContent>
          <AtlDialogFooter>
            <AtlButton variant="outline" @click="isOpen = false">Decline</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Accept</AtlButton>
          </AtlDialogFooter>
        </AtlDialog>
      </div>
    `,
  }),
};

export const NoBackdropClose: Story = {
  args: { closeOnBackdrop: false },
  render: (args) => ({
    components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter, AtlButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <AtlButton variant="primary" @click="isOpen = true">Open Dialog</AtlButton>
        <AtlDialog v-bind="args" v-model:open="isOpen">
          <AtlDialogHeader>Important Decision</AtlDialogHeader>
          <AtlDialogContent>
            <p>This dialog cannot be closed by clicking the backdrop. You must use one of the buttons below.</p>
          </AtlDialogContent>
          <AtlDialogFooter>
            <AtlButton variant="outline" @click="isOpen = false">Cancel</AtlButton>
            <AtlButton variant="primary" @click="isOpen = false">Confirm</AtlButton>
          </AtlDialogFooter>
        </AtlDialog>
      </div>
    `,
  }),
};
