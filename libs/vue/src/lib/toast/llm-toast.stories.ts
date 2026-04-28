import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { defineComponent } from 'vue';
import LlmToastProvider from './llm-toast-provider.vue';
import LlmToastContainer from './llm-toast-container.vue';
import { useLlmToast } from './llm-toast';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const ToastTrigger = defineComponent({
  name: 'ToastTrigger',
  setup() {
    const toast = useLlmToast();
    return { toast };
  },
  template: `
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <button type="button" @click="toast.show('Default notification')">Default</button>
      <button type="button" @click="toast.show('Action completed successfully!', { variant: 'success' })">Success</button>
      <button type="button" @click="toast.show('Check your input data.', { variant: 'warning' })">Warning</button>
      <button type="button" @click="toast.show('Something went wrong.', { variant: 'danger' })">Danger</button>
      <button type="button" @click="toast.show('New feature available.', { variant: 'info' })">Info</button>
      <button type="button" @click="toast.show('This stays until dismissed.', { duration: 0 })">Persistent</button>
      <button type="button" @click="toast.clear()">Clear all</button>
    </div>
  `,
});

const AllVariantsTrigger = defineComponent({
  name: 'AllVariantsTrigger',
  setup() {
    const toast = useLlmToast();
    function showAll() {
      toast.show('This is a default notification.', { variant: 'default' });
      toast.show('Operation completed successfully!', { variant: 'success' });
      toast.show('Please review before continuing.', { variant: 'warning' });
      toast.show('An error occurred. Please try again.', { variant: 'danger' });
      toast.show('Here is some useful information.', { variant: 'info' });
    }
    return { toast, showAll };
  },
  template: `
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <button type="button" @click="showAll">Show All Variants</button>
      <button type="button" @click="toast.clear()">Clear All</button>
    </div>
  `,
});

const AutoDismissTrigger = defineComponent({
  name: 'AutoDismissTrigger',
  setup() {
    const toast = useLlmToast();
    function showQuick() {
      toast.show('This will disappear in 2 seconds.', {
        variant: 'info',
        duration: 2000,
      });
    }
    return { showQuick };
  },
  template: `
    <button type="button" @click="showQuick">Show Toast (2s auto-dismiss)</button>
  `,
});

const PersistentTrigger = defineComponent({
  name: 'PersistentTrigger',
  setup() {
    const toast = useLlmToast();
    function showPersistent() {
      toast.show('This toast will not auto-dismiss. Click X to close.', {
        variant: 'warning',
        duration: 0,
        dismissible: true,
      });
    }
    return { showPersistent };
  },
  template: `
    <button type="button" @click="showPersistent">Show Persistent Toast</button>
  `,
});

const meta: Meta = {
  title: 'Components/Overlay/LlmToast',
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-47'),
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer, ToastTrigger },
    template: `
      <LlmToastProvider>
        <ToastTrigger />
        <LlmToastContainer position="bottom-right" />
      </LlmToastProvider>
    `,
  }),
  parameters: { design: figmaNode('55-42') },
};

export const TopCenter: Story = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer, ToastTrigger },
    template: `
      <LlmToastProvider>
        <ToastTrigger />
        <LlmToastContainer position="top-center" />
      </LlmToastProvider>
    `,
  }),
  parameters: { design: figmaNode('508-7041') },
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer, AllVariantsTrigger },
    template: `
      <LlmToastProvider>
        <AllVariantsTrigger />
        <LlmToastContainer position="bottom-right" />
      </LlmToastProvider>
    `,
  }),
};

export const AutoDismiss: Story = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer, AutoDismissTrigger },
    template: `
      <LlmToastProvider>
        <AutoDismissTrigger />
        <LlmToastContainer position="bottom-right" />
      </LlmToastProvider>
    `,
  }),
};

export const Persistent: Story = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer, PersistentTrigger },
    template: `
      <LlmToastProvider>
        <PersistentTrigger />
        <LlmToastContainer position="bottom-right" />
      </LlmToastProvider>
    `,
  }),
};

export const Playground: Story = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer, ToastTrigger },
    template: `
      <LlmToastProvider>
        <ToastTrigger />
        <LlmToastContainer position="bottom-right" />
      </LlmToastProvider>
    `,
  }),
};
