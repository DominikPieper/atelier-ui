import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { userEvent, expect } from 'storybook/test';
import { LlmButton } from '../button/llm-button';
import { LlmInput } from '../input/llm-input';
import { LlmDrawer, LlmDrawerContent, LlmDrawerFooter, LlmDrawerHeader } from './llm-drawer';

const ALL_IMPORTS = [LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter, LlmButton];

const meta: Meta<LlmDrawer> = {
  title: 'Components/LlmDrawer',
  component: LlmDrawer,
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
};

export default meta;
type Story = StoryObj<LlmDrawer>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    imports: ALL_IMPORTS,
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Open Drawer</llm-button>
      <llm-drawer [(open)]="open" [position]="position" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <llm-drawer-header>Settings</llm-drawer-header>
        <llm-drawer-content>
          <p>Drawer content goes here. You can put any form controls or content inside.</p>
        </llm-drawer-content>
        <llm-drawer-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Save</llm-button>
        </llm-drawer-footer>
      </llm-drawer>
    `,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open Drawer' }));
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(dialog).not.toHaveAttribute('open');
  },
};

export const Left: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    imports: ALL_IMPORTS,
    template: `
      <llm-button variant="outline" (click)="open.set(true)">Open Left Drawer</llm-button>
      <llm-drawer [(open)]="open" position="left" [size]="size">
        <llm-drawer-header>Navigation</llm-drawer-header>
        <llm-drawer-content>
          <p>Left-side navigation drawer.</p>
        </llm-drawer-content>
        <llm-drawer-footer>
          <llm-button variant="primary" (click)="open.set(false)">Close</llm-button>
        </llm-drawer-footer>
      </llm-drawer>
    `,
  }),
  args: { position: 'left' },
};

export const Top: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    imports: ALL_IMPORTS,
    template: `
      <llm-button variant="outline" (click)="open.set(true)">Open Top Drawer</llm-button>
      <llm-drawer [(open)]="open" position="top" [size]="size">
        <llm-drawer-header>Filters</llm-drawer-header>
        <llm-drawer-content>
          <p>Top panel for filters or search.</p>
        </llm-drawer-content>
        <llm-drawer-footer>
          <llm-button variant="primary" (click)="open.set(false)">Apply</llm-button>
        </llm-drawer-footer>
      </llm-drawer>
    `,
  }),
  args: { position: 'top' },
};

export const Bottom: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    imports: ALL_IMPORTS,
    template: `
      <llm-button variant="outline" (click)="open.set(true)">Open Bottom Drawer</llm-button>
      <llm-drawer [(open)]="open" position="bottom" [size]="size">
        <llm-drawer-header>Action Sheet</llm-drawer-header>
        <llm-drawer-content>
          <p>Mobile-style action sheet from the bottom.</p>
        </llm-drawer-content>
        <llm-drawer-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Confirm</llm-button>
        </llm-drawer-footer>
      </llm-drawer>
    `,
  }),
  args: { position: 'bottom' },
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
    imports: ALL_IMPORTS,
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <llm-button variant="outline" size="sm" (click)="smOpen.set(true)">Small</llm-button>
        <llm-button variant="outline" size="sm" (click)="mdOpen.set(true)">Medium</llm-button>
        <llm-button variant="outline" size="sm" (click)="lgOpen.set(true)">Large</llm-button>
        <llm-button variant="outline" size="sm" (click)="fullOpen.set(true)">Full</llm-button>
      </div>

      <llm-drawer [(open)]="smOpen" size="sm">
        <llm-drawer-header>Small Drawer</llm-drawer-header>
        <llm-drawer-content><p>Width: 20rem</p></llm-drawer-content>
        <llm-drawer-footer><llm-button variant="primary" (click)="smOpen.set(false)">Close</llm-button></llm-drawer-footer>
      </llm-drawer>

      <llm-drawer [(open)]="mdOpen" size="md">
        <llm-drawer-header>Medium Drawer</llm-drawer-header>
        <llm-drawer-content><p>Width: 28rem (default)</p></llm-drawer-content>
        <llm-drawer-footer><llm-button variant="primary" (click)="mdOpen.set(false)">Close</llm-button></llm-drawer-footer>
      </llm-drawer>

      <llm-drawer [(open)]="lgOpen" size="lg">
        <llm-drawer-header>Large Drawer</llm-drawer-header>
        <llm-drawer-content><p>Width: 40rem</p></llm-drawer-content>
        <llm-drawer-footer><llm-button variant="primary" (click)="lgOpen.set(false)">Close</llm-button></llm-drawer-footer>
      </llm-drawer>

      <llm-drawer [(open)]="fullOpen" size="full">
        <llm-drawer-header>Full Drawer</llm-drawer-header>
        <llm-drawer-content><p>Width: 100vw</p></llm-drawer-content>
        <llm-drawer-footer><llm-button variant="primary" (click)="fullOpen.set(false)">Close</llm-button></llm-drawer-footer>
      </llm-drawer>
    `,
  }),
};

export const NoBackdropClose: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    imports: ALL_IMPORTS,
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Open Drawer</llm-button>
      <llm-drawer [(open)]="open" [closeOnBackdrop]="false">
        <llm-drawer-header>Required Action</llm-drawer-header>
        <llm-drawer-content>
          <p>This drawer cannot be closed by clicking the backdrop. Use the buttons below.</p>
        </llm-drawer-content>
        <llm-drawer-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Confirm</llm-button>
        </llm-drawer-footer>
      </llm-drawer>
    `,
  }),
  args: { closeOnBackdrop: false },
};

export const WithForm: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false), name: signal(''), email: signal('') },
    imports: [...ALL_IMPORTS, LlmInput],
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Edit Profile</llm-button>
      <llm-drawer [(open)]="open" [size]="size">
        <llm-drawer-header>Edit Profile</llm-drawer-header>
        <llm-drawer-content>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Name</label>
              <llm-input [(value)]="name" placeholder="Your name" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Email</label>
              <llm-input type="email" [(value)]="email" placeholder="you@example.com" />
            </div>
          </div>
        </llm-drawer-content>
        <llm-drawer-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Save Changes</llm-button>
        </llm-drawer-footer>
      </llm-drawer>
    `,
  }),
};
