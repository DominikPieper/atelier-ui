import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { userEvent, expect } from 'storybook/test';
import { AtlButton } from '../button/atl-button';
import { AtlInput } from '../input/atl-input';
import { AtlDrawer, AtlDrawerContent, AtlDrawerFooter, AtlDrawerHeader } from './atl-drawer';

import { metadata } from '@atelier-ui/spec/metadata/drawer.metadata';
const ALL_IMPORTS = [AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter, AtlButton];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlDrawer> = {
  title: 'Components/Overlay/AtlDrawer',
  component: AtlDrawer,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
    },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    position: 'right',
    size: 'md',
    closeOnBackdrop: true,
  },
  parameters: { design: figmaNode('421-398'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<AtlDrawer>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Drawer</atl-button>
      <atl-drawer [(open)]="open" [position]="position" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <atl-drawer-header>Settings</atl-drawer-header>
        <atl-drawer-content>
          <p>Drawer content goes here. You can put any form controls or content inside.</p>
        </atl-drawer-content>
        <atl-drawer-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Save</atl-button>
        </atl-drawer-footer>
      </atl-drawer>
    `,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open Drawer' }));
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(dialog).not.toHaveAttribute('open');
  },
  parameters: { design: figmaNode('421-342') },
};

export const Left: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="outline" (click)="open.set(true)">Open Left Drawer</atl-button>
      <atl-drawer [(open)]="open" position="left" [size]="size">
        <atl-drawer-header>Navigation</atl-drawer-header>
        <atl-drawer-content>
          <p>Left-side navigation drawer.</p>
        </atl-drawer-content>
        <atl-drawer-footer>
          <atl-button variant="primary" (click)="open.set(false)">Close</atl-button>
        </atl-drawer-footer>
      </atl-drawer>
    `,
  }),
  args: { position: 'left' },
  parameters: { design: figmaNode('421-356') },
};

export const Top: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="outline" (click)="open.set(true)">Open Top Drawer</atl-button>
      <atl-drawer [(open)]="open" position="top" [size]="size">
        <atl-drawer-header>Filters</atl-drawer-header>
        <atl-drawer-content>
          <p>Top panel for filters or search.</p>
        </atl-drawer-content>
        <atl-drawer-footer>
          <atl-button variant="primary" (click)="open.set(false)">Apply</atl-button>
        </atl-drawer-footer>
      </atl-drawer>
    `,
  }),
  args: { position: 'top' },
  parameters: { design: figmaNode('421-370') },
};

export const Bottom: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="outline" (click)="open.set(true)">Open Bottom Drawer</atl-button>
      <atl-drawer [(open)]="open" position="bottom" [size]="size">
        <atl-drawer-header>Action Sheet</atl-drawer-header>
        <atl-drawer-content>
          <p>Mobile-style action sheet from the bottom.</p>
        </atl-drawer-content>
        <atl-drawer-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Confirm</atl-button>
        </atl-drawer-footer>
      </atl-drawer>
    `,
  }),
  args: { position: 'bottom' },
  parameters: { design: figmaNode('421-384') },
};

export const SizeVariants: Story = {
  render: (args) => ({
    props: {
      ...args,
      smOpen: signal(false),
      mdOpen: signal(false),
      lgOpen: signal(false),
      fullOpen: signal(false),
    },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <atl-button variant="outline" size="sm" (click)="smOpen.set(true)">Small</atl-button>
        <atl-button variant="outline" size="sm" (click)="mdOpen.set(true)">Medium</atl-button>
        <atl-button variant="outline" size="sm" (click)="lgOpen.set(true)">Large</atl-button>
        <atl-button variant="outline" size="sm" (click)="fullOpen.set(true)">Full</atl-button>
      </div>

      <atl-drawer [(open)]="smOpen" size="sm">
        <atl-drawer-header>Small Drawer</atl-drawer-header>
        <atl-drawer-content><p>Width: 20rem</p></atl-drawer-content>
        <atl-drawer-footer><atl-button variant="primary" (click)="smOpen.set(false)">Close</atl-button></atl-drawer-footer>
      </atl-drawer>

      <atl-drawer [(open)]="mdOpen" size="md">
        <atl-drawer-header>Medium Drawer</atl-drawer-header>
        <atl-drawer-content><p>Width: 28rem (default)</p></atl-drawer-content>
        <atl-drawer-footer><atl-button variant="primary" (click)="mdOpen.set(false)">Close</atl-button></atl-drawer-footer>
      </atl-drawer>

      <atl-drawer [(open)]="lgOpen" size="lg">
        <atl-drawer-header>Large Drawer</atl-drawer-header>
        <atl-drawer-content><p>Width: 40rem</p></atl-drawer-content>
        <atl-drawer-footer><atl-button variant="primary" (click)="lgOpen.set(false)">Close</atl-button></atl-drawer-footer>
      </atl-drawer>

      <atl-drawer [(open)]="fullOpen" size="full">
        <atl-drawer-header>Full Drawer</atl-drawer-header>
        <atl-drawer-content><p>Width: 100vw</p></atl-drawer-content>
        <atl-drawer-footer><atl-button variant="primary" (click)="fullOpen.set(false)">Close</atl-button></atl-drawer-footer>
      </atl-drawer>
    `,
  }),
  parameters: { design: figmaNode('421-398') },
};

export const NoBackdropClose: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Drawer</atl-button>
      <atl-drawer [(open)]="open" [closeOnBackdrop]="false">
        <atl-drawer-header>Required Action</atl-drawer-header>
        <atl-drawer-content>
          <p>This drawer cannot be closed by clicking the backdrop. Use the buttons below.</p>
        </atl-drawer-content>
        <atl-drawer-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Confirm</atl-button>
        </atl-drawer-footer>
      </atl-drawer>
    `,
  }),
  args: { closeOnBackdrop: false },
  parameters: { design: figmaNode('421-342') },
};

export const WithForm: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false), name: signal(''), email: signal('') },
    moduleMetadata: { imports: [...ALL_IMPORTS, AtlInput] },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Edit Profile</atl-button>
      <atl-drawer [(open)]="open" [size]="size">
        <atl-drawer-header>Edit Profile</atl-drawer-header>
        <atl-drawer-content>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Name</label>
              <atl-input [(value)]="name" placeholder="Your name" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Email</label>
              <atl-input type="email" [(value)]="email" placeholder="you@example.com" />
            </div>
          </div>
        </atl-drawer-content>
        <atl-drawer-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Save Changes</atl-button>
        </atl-drawer-footer>
      </atl-drawer>
    `,
  }),
  parameters: { design: figmaNode('421-342') },
};
