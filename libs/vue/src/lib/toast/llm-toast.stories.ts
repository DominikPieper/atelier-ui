import type { Meta } from '@storybook/vue3';
import { defineComponent } from 'vue';
import LlmToastProvider from './llm-toast-provider.vue';
import LlmToastContainer from './llm-toast-container.vue';
import { useLlmToast } from './llm-toast';

const meta: Meta = {
  title: 'Components/LlmToast',
  tags: ['autodocs'],
};

export default meta;

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

export const Default = {
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

export const TopCenter = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer, ToastTrigger },
    template: `
      <LlmToastProvider>
        <ToastTrigger />
        <LlmToastContainer position="top-center" />
      </LlmToastProvider>
    `,
  }),
};

export const Positions = {
  render: () => ({
    components: { LlmToastProvider, LlmToastContainer },
    setup() {
      // Cannot use useLlmToast at root render level; use a child component
    },
    template: `
      <p style="padding:1rem;color:#666">
        Positions: top-right, top-center, bottom-right, bottom-center<br/>
        Use the Default story to interact with different positions.
      </p>
    `,
  }),
};
