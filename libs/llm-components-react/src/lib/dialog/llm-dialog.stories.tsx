import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter } from './llm-dialog';

const meta: Meta<typeof LlmDialog> = {
  title: 'Components/LlmDialog',
  component: LlmDialog,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    closeOnBackdrop: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl', 'full'] },
  },
  args: { size: 'md', closeOnBackdrop: true },
};

export default meta;
type Story = StoryObj<typeof LlmDialog>;

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
      <LlmDialog open={open} onOpenChange={setOpen} size={size} closeOnBackdrop={closeOnBackdrop}>
        <LlmDialogHeader>Dialog Title</LlmDialogHeader>
        <LlmDialogContent>
          <p>This is the dialog body content. You can put any content here.</p>
        </LlmDialogContent>
        <LlmDialogFooter>
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={() => setOpen(false)}>Confirm</button>
        </LlmDialogFooter>
      </LlmDialog>
    </>
  );
}

export const Default: Story = {
  render: () => <DialogDemo />,
};

export const SmallSize: Story = {
  render: () => <DialogDemo size="sm" />,
};

export const LargeSize: Story = {
  render: () => <DialogDemo size="lg" />,
};

export const FullSize: Story = {
  render: () => <DialogDemo size="full" />,
};

export const NoBackdropClose: Story = {
  render: () => <DialogDemo closeOnBackdrop={false} />,
};

export const ConfirmationDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
          onClick={() => setOpen(true)}
        >
          Delete Item
        </button>
        <LlmDialog open={open} onOpenChange={setOpen} size="sm">
          <LlmDialogHeader>Confirm Delete</LlmDialogHeader>
          <LlmDialogContent>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
          </LlmDialogContent>
          <LlmDialogFooter>
            <button onClick={() => setOpen(false)}>Cancel</button>
            <button
              style={{ background: 'var(--ui-color-danger)', color: 'white' }}
              onClick={() => setOpen(false)}
            >
              Delete
            </button>
          </LlmDialogFooter>
        </LlmDialog>
      </>
    );
  },
};
