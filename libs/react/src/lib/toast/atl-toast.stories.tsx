import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlToastProvider, AtlToastContainer, useAtlToast } from './atl-toast';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta = {
  title: 'Components/Overlay/AtlToast',
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-47'),
  },
};

export default meta;
type Story = StoryObj;

function ToastDemo({ position = 'bottom-right' }: { position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center' }) {
  const { show, clear } = useAtlToast();
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
      <AtlToastContainer position={position} />
    </div>
  );
}

export const BottomRight: Story = {
  render: () => (
    <AtlToastProvider>
      <ToastDemo position="bottom-right" />
    </AtlToastProvider>
  ),
  parameters: { design: figmaNode('508-7046') },
};

export const BottomCenter: Story = {
  render: () => (
    <AtlToastProvider>
      <ToastDemo position="bottom-center" />
    </AtlToastProvider>
  ),
  parameters: { design: figmaNode('508-7051') },
};

export const TopRight: Story = {
  render: () => (
    <AtlToastProvider>
      <ToastDemo position="top-right" />
    </AtlToastProvider>
  ),
  parameters: { design: figmaNode('55-42') },
};

export const TopCenter: Story = {
  render: () => (
    <AtlToastProvider>
      <ToastDemo position="top-center" />
    </AtlToastProvider>
  ),
  parameters: { design: figmaNode('508-7041') },
};

export const AutoDismiss: Story = {
  render: () => {
    function AutoDismissDemo() {
      const { show } = useAtlToast();
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => show('Auto-dismissed in 2 seconds', { variant: 'info', duration: 2000 })}>
            Show (2s)
          </button>
          <AtlToastContainer position="bottom-right" />
        </div>
      );
    }
    return (
      <AtlToastProvider>
        <AutoDismissDemo />
      </AtlToastProvider>
    );
  },
};

export const Persistent: Story = {
  render: () => {
    function PersistentDemo() {
      const { show, clear } = useAtlToast();
      return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => show('This stays until dismissed', { variant: 'warning', duration: 0 })}>
            Show persistent
          </button>
          <button onClick={clear}>Clear all</button>
          <AtlToastContainer position="bottom-right" />
        </div>
      );
    }
    return (
      <AtlToastProvider>
        <PersistentDemo />
      </AtlToastProvider>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    function AllVariantsDemo() {
      const { show } = useAtlToast();
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
          <AtlToastContainer position="bottom-right" />
        </div>
      );
    }
    return (
      <AtlToastProvider>
        <AllVariantsDemo />
      </AtlToastProvider>
    );
  },
};
