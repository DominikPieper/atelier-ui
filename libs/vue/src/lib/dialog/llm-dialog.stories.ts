import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmDialog from './llm-dialog.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}
import LlmDialogHeader from './llm-dialog-header.vue';
import LlmDialogContent from './llm-dialog-content.vue';
import LlmDialogFooter from './llm-dialog-footer.vue';

const meta: Meta<typeof LlmDialog> = {
  title: 'Components/LlmDialog',
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
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter },
    setup() {
      const isOpen = ref(false);
      return { args, isOpen };
    },
    template: `
      <div>
        <button type="button" @click="isOpen = true">Open Dialog</button>
        <LlmDialog v-bind="args" v-model:open="isOpen">
          <LlmDialogHeader>Confirm Action</LlmDialogHeader>
          <LlmDialogContent>
            Are you sure you want to proceed? This action cannot be undone.
          </LlmDialogContent>
          <LlmDialogFooter>
            <button type="button" @click="isOpen = false">Cancel</button>
            <button type="button" @click="isOpen = false">Confirm</button>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter },
    setup() {
      const openSize = ref<string | null>(null);
      return { openSize, sizes: ['sm', 'md', 'lg', 'xl'] };
    },
    template: `
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button v-for="size in sizes" :key="size" type="button" @click="openSize = size">
          Open {{ size }}
        </button>
        <LlmDialog
          v-for="size in sizes"
          :key="size"
          :open="openSize === size"
          :size="size"
          @update:open="openSize = null"
        >
          <LlmDialogHeader>{{ size.toUpperCase() }} Dialog</LlmDialogHeader>
          <LlmDialogContent>This is a {{ size }} dialog.</LlmDialogContent>
          <LlmDialogFooter>
            <button type="button" @click="openSize = null">Close</button>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};

export const NoBackdropClose: Story = {
  render: () => ({
    components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter },
    setup() {
      const isOpen = ref(false);
      return { isOpen };
    },
    template: `
      <div>
        <button type="button" @click="isOpen = true">Open Required Dialog</button>
        <LlmDialog v-model:open="isOpen" :closeOnBackdrop="false">
          <LlmDialogHeader>Required Action</LlmDialogHeader>
          <LlmDialogContent>You must respond to this dialog. Clicking the backdrop won't close it.</LlmDialogContent>
          <LlmDialogFooter>
            <button type="button" @click="isOpen = false">OK</button>
          </LlmDialogFooter>
        </LlmDialog>
      </div>
    `,
  }),
};
