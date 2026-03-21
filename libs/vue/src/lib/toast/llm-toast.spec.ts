import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { defineComponent } from 'vue';
import LlmToastProvider from './llm-toast-provider.vue';
import LlmToastContainer from './llm-toast-container.vue';
import { useLlmToast } from './llm-toast';


const TriggerChild = defineComponent({
  name: 'TriggerChild',
  setup() {
    const toast = useLlmToast();
    return { toast };
  },
  template: `
    <div>
      <button type="button" @click="toast.show('Hello!', { variant: 'success' })">Show success</button>
      <button type="button" @click="toast.show('Error occurred', { variant: 'danger' })">Show danger</button>
      <button type="button" @click="toast.show('Persistent', { duration: 0 })">Show persistent</button>
      <button type="button" @click="toast.clear()">Clear all</button>
    </div>
  `,
});

describe('LlmToast', () => {
  it('shows a toast when show() is called', async () => {
    const user = userEvent.setup();
    render({
      components: { LlmToastProvider, LlmToastContainer, TriggerChild },
      template: `<LlmToastProvider><TriggerChild /><LlmToastContainer /></LlmToastProvider>`,
    });
    await user.click(screen.getByRole('button', { name: 'Show success' }));
    expect(screen.getByText('Hello!')).toBeInTheDocument();
  });

  it('applies variant class to toast', async () => {
    const user = userEvent.setup();
    const { container } = render({
      components: { LlmToastProvider, LlmToastContainer, TriggerChild },
      template: `<LlmToastProvider><TriggerChild /><LlmToastContainer /></LlmToastProvider>`,
    });
    await user.click(screen.getByRole('button', { name: 'Show danger' }));
    expect(container.querySelector('.llm-toast')).toHaveClass('variant-danger');
  });

  it('dismisses a toast when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    render({
      components: { LlmToastProvider, LlmToastContainer, TriggerChild },
      template: `<LlmToastProvider><TriggerChild /><LlmToastContainer /></LlmToastProvider>`,
    });
    await user.click(screen.getByRole('button', { name: 'Show success' }));
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Hello!')).not.toBeInTheDocument();
  });

  it('clears all toasts when clear() is called', async () => {
    const user = userEvent.setup();
    render({
      components: { LlmToastProvider, LlmToastContainer, TriggerChild },
      template: `<LlmToastProvider><TriggerChild /><LlmToastContainer /></LlmToastProvider>`,
    });
    await user.click(screen.getByRole('button', { name: 'Show success' }));
    await user.click(screen.getByRole('button', { name: 'Show danger' }));
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.queryByText('Hello!')).not.toBeInTheDocument();
    expect(screen.queryByText('Error occurred')).not.toBeInTheDocument();
  });

  it('applies position class to container', () => {
    const { container } = render({
      components: { LlmToastProvider, LlmToastContainer },
      template: `<LlmToastProvider><LlmToastContainer position="top-center" /></LlmToastProvider>`,
    });
    expect(container.querySelector('.llm-toast-container')).toHaveClass('position-top-center');
  });

  it('throws if useLlmToast is used outside provider', () => {
    const BadComponent = defineComponent({
      setup() {
        expect(() => useLlmToast()).toThrow();
      },
      template: `<div />`,
    });
    render(BadComponent);
  });
});
