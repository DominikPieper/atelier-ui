import type { Meta, StoryObj } from '@storybook/react';
import { LlmToastProvider, LlmToastContainer, useLlmToast } from './llm-toast';

const meta: Meta = {
  title: 'Components/LlmToast',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

function ToastDemo({ position = 'bottom-right' }: { position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center' }) {
  const { show, clear } = useLlmToast();
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <button onClick={() => show('Default notification')}>Default</button>
      <button onClick={() => show('Saved successfully!', { variant: 'success' })}>
        Success
      </button>
      <button onClick={() => show('Warning: check your settings', { variant: 'warning' })}>
        Warning
      </button>
      <button onClick={() => show('Something went wrong', { variant: 'danger' })}>
        Danger
      </button>
      <button onClick={() => show('New message received', { variant: 'info' })}>
        Info
      </button>
      <button
        onClick={() =>
          show('This toast stays until dismissed', { duration: 0, variant: 'info' })
        }
      >
        Persistent
      </button>
      <button
        onClick={() =>
          show('Cannot dismiss this', { dismissible: false, variant: 'warning' })
        }
      >
        Non-dismissible
      </button>
      <button onClick={clear}>Clear all</button>
      <LlmToastContainer position={position} />
    </div>
  );
}

export const BottomRight: Story = {
  render: () => (
    <LlmToastProvider>
      <ToastDemo position="bottom-right" />
    </LlmToastProvider>
  ),
};

export const BottomCenter: Story = {
  render: () => (
    <LlmToastProvider>
      <ToastDemo position="bottom-center" />
    </LlmToastProvider>
  ),
};

export const TopRight: Story = {
  render: () => (
    <LlmToastProvider>
      <ToastDemo position="top-right" />
    </LlmToastProvider>
  ),
};

export const TopCenter: Story = {
  render: () => (
    <LlmToastProvider>
      <ToastDemo position="top-center" />
    </LlmToastProvider>
  ),
};

export const AllVariants: Story = {
  render: () => {
    function AllVariantsDemo() {
      const { show } = useLlmToast();
      return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              show('Default');
              show('Success!', { variant: 'success' });
              show('Warning!', { variant: 'warning' });
              show('Danger!', { variant: 'danger' });
              show('Info!', { variant: 'info' });
            }}
          >
            Show all variants
          </button>
          <LlmToastContainer position="bottom-right" />
        </div>
      );
    }
    return (
      <LlmToastProvider>
        <AllVariantsDemo />
      </LlmToastProvider>
    );
  },
};
