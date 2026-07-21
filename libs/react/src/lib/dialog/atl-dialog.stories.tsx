import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter } from './atl-dialog';

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
    open: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
  },
  args: { size: 'md', closeOnBackdrop: true },
  parameters: {
    design: figmaNode('55-94'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlDialog>;

function DialogDemo({ size = 'md', closeOnBackdrop = true }: { size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; closeOnBackdrop?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        Open Dialog
      </button>
      <AtlDialog open={open} onOpenChange={setOpen} size={size} closeOnBackdrop={closeOnBackdrop}>
        <AtlDialogHeader>Dialog Title</AtlDialogHeader>
        <AtlDialogContent>
          <p>This is the dialog body content. You can put any content here.</p>
        </AtlDialogContent>
        <AtlDialogFooter>
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={() => setOpen(false)}>Confirm</button>
        </AtlDialogFooter>
      </AtlDialog>
    </>
  );
}

export const Default: Story = {
  render: () => <DialogDemo />,
  parameters: { design: figmaNode('55-93') },
};

export const SmallSize: Story = {
  render: () => <DialogDemo size="sm" />,
  parameters: { design: figmaNode('73-334') },
};

export const LargeSize: Story = {
  render: () => <DialogDemo size="lg" />,
  parameters: { design: figmaNode('73-347') },
};

export const FullSize: Story = {
  render: () => <DialogDemo size="full" />,
  parameters: { design: figmaNode('73-373') },
};

export const NoBackdropClose: Story = {
  render: () => <DialogDemo closeOnBackdrop={false} />,
};

export const ConfirmationDialog: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          onClick={() => setOpen(true)}
        >
          Delete Item
        </button>
        <AtlDialog open={open} onOpenChange={setOpen} size="sm">
          <AtlDialogHeader>Confirm Delete</AtlDialogHeader>
          <AtlDialogContent>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          </AtlDialogContent>
          <AtlDialogFooter>
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button
              style={{ background: 'var(--ui-color-danger)', color: 'white' }}
              onClick={() => setOpen(false)}
            >
              Delete
            </button>
          </AtlDialogFooter>
        </AtlDialog>
      </>
    );
  },
};
