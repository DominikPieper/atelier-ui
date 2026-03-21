import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter } from './llm-drawer';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmDrawer> = {
  title: 'Components/LlmDrawer',
  component: LlmDrawer,
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    position: { control: 'select', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: { position: 'right', size: 'md', closeOnBackdrop: true },
  parameters: {
    design: figmaNode('3-1111'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmDrawer>;

function DrawerDemo({
  position = 'right',
  size = 'md',
  closeOnBackdrop = true,
  label = 'Open Drawer',
}: {
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnBackdrop?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <LlmDrawer
        open={open}
        onOpenChange={setOpen}
        position={position}
        size={size}
        closeOnBackdrop={closeOnBackdrop}
      >
        <LlmDrawerHeader>Settings</LlmDrawerHeader>
        <LlmDrawerContent>
          <p>Drawer content goes here. This area scrolls if content is long.</p>
          <p style={{ marginTop: '1rem' }}>You can put forms, lists, or any content here.</p>
        </LlmDrawerContent>
        <LlmDrawerFooter>
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={() => setOpen(false)}>Save</button>
        </LlmDrawerFooter>
      </LlmDrawer>
    </>
  );
}

export const Default: Story = {
  render: () => <DrawerDemo />,
  parameters: { design: figmaNode('55-95') },
};

export const LeftPosition: Story = {
  render: () => <DrawerDemo position="left" label="Open Left Drawer" />,
  parameters: { design: figmaNode('55-96') },
};

export const TopPosition: Story = {
  render: () => <DrawerDemo position="top" label="Open Top Drawer" />,
};

export const BottomPosition: Story = {
  render: () => <DrawerDemo position="bottom" label="Open Bottom Drawer" />,
  parameters: { design: figmaNode('55-97') },
};

export const SmallSize: Story = {
  render: () => <DrawerDemo size="sm" label="Open Small Drawer" />,
};

export const LargeSize: Story = {
  render: () => <DrawerDemo size="lg" label="Open Large Drawer" />,
};

export const NoBackdropClose: Story = {
  render: () => (
    <DrawerDemo closeOnBackdrop={false} label="Open (no backdrop close)" />
  ),
};

export const AllPositions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <DrawerDemo position="right" label="Right" />
      <DrawerDemo position="left" label="Left" />
      <DrawerDemo position="top" label="Top" />
      <DrawerDemo position="bottom" label="Bottom" />
    </div>
  ),
};
