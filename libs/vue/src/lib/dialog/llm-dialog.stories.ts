import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmDialog from './llm-dialog.vue';
import LlmDialogHeader from './llm-dialog-header.vue';
import LlmDialogContent from './llm-dialog-content.vue';
import LlmDialogFooter from './llm-dialog-footer.vue';
import LlmButton from '../button/llm-button.vue';
import LlmInput from '../input/llm-input.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmDialog> = {
  title: 'Components/Overlay/LlmDialog',
  component: LlmDialog,
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmDialog>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Dialog</LlmButton>
        <LlmDialog v-bind="args" v-model:open="isOpen">
          <LlmDialogHeader>Confirm Action</LlmDialogHeader>
          <LlmDialogContent>
            <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
          </LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Confirm</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
  parameters: { design: figmaNode('55-93') },
};

export const PreOpened: Story = {
  name: 'Pre-opened (no trigger)',
  render: (args) => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton },
    setup() {
      const isOpen = ref(true);
      return { args, isOpen };
    },
    template: `
      <LlmDialog v-bind="args" v-model:open="isOpen">
        <LlmDialogHeader>Pre-opened Dialog</LlmDialogHeader>
        <LlmDialogContent><p>This dialog is open on load.</p></LlmDialogContent>
        <LlmDialogFooter>
          <LlmButton variant="primary" @click="isOpen = false">Close</LlmButton>
        </LlmDialogFooter>
      </LlmDialog>
    `,
  }),
};

export const CloseButtonDismiss: Story = {
  name: 'Close via header X button',
  render: (args) => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Dialog</LlmButton>
        <LlmDialog v-bind="args" v-model:open="isOpen">
          <LlmDialogHeader>Confirm Action</LlmDialogHeader>
          <LlmDialogContent>
            <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
          </LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Confirm</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

export const EscapeToClose: Story = {
  name: 'Escape key closes dialog',
  render: (args) => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Dialog</LlmButton>
        <LlmDialog v-bind="args" v-model:open="isOpen">
          <LlmDialogHeader>Confirm Action</LlmDialogHeader>
          <LlmDialogContent>
            <p>Press Escape to close this dialog.</p>
          </LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Confirm</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

export const SizeVariants: Story = {
  render: () => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton },
    setup() {
      const openSize = ref<string | null>(null);
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
      return { openSize, sizes };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <LlmButton v-for="size in sizes" :key="size" variant="outline" size="sm" @click="openSize = size">
          {{ size.toUpperCase() }}
        </LlmButton>
        <LlmDialog
          v-for="size in sizes"
          :key="size"
          :open="openSize === size"
          :size="size"
          @update:open="openSize = null"
        >
          <LlmDialogHeader>{{ size.toUpperCase() }} Dialog</LlmDialogHeader>
          <LlmDialogContent><p>This is a {{ size }} dialog.</p></LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="primary" @click="openSize = null">Close</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

export const WithForm: Story = {
  render: (args) => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton, LlmInput },
    setup() {
      const isOpen = ref(false);
      const name = ref('');
      const email = ref('');
      return { args, isOpen, name, email };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Form Dialog</LlmButton>
        <LlmDialog v-bind="args" v-model:open="isOpen">
          <LlmDialogHeader>User Details</LlmDialogHeader>
          <LlmDialogContent>
            <div style="display:flex;flex-direction:column;gap:1rem">
              <LlmInput label="Name" placeholder="Enter your name" v-model:value="name" />
              <LlmInput label="Email" type="email" placeholder="you@example.com" v-model:value="email" />
            </div>
          </LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Save</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

export const LongContent: Story = {
  render: (args) => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Long Content Dialog</LlmButton>
        <LlmDialog v-bind="args" v-model:open="isOpen">
          <LlmDialogHeader>Terms of Service</LlmDialogHeader>
          <LlmDialogContent>
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
          </LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="outline" @click="isOpen = false">Decline</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Accept</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

export const NoBackdropClose: Story = {
  args: { closeOnBackdrop: false },
  render: (args) => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter, LlmButton },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <LlmButton variant="primary" @click="isOpen = true">Open Dialog</LlmButton>
        <LlmDialog v-bind="args" v-model:open="isOpen">
          <LlmDialogHeader>Important Decision</LlmDialogHeader>
          <LlmDialogContent>
            <p>This dialog cannot be closed by clicking the backdrop. You must use one of the buttons below.</p>
          </LlmDialogContent>
          <LlmDialogFooter>
            <LlmButton variant="outline" @click="isOpen = false">Cancel</LlmButton>
            <LlmButton variant="primary" @click="isOpen = false">Confirm</LlmButton>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};
