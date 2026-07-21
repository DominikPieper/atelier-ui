import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { userEvent, expect } from 'storybook/test';
import { AtlButton } from '../button/atl-button';
import { AtlInput } from '../input/atl-input';
import { AtlOption } from '../select/atl-option';
import { AtlSelect } from '../select/atl-select';
import { AtlDialog, AtlDialogContent, AtlDialogFooter, AtlDialogHeader } from './atl-dialog';

import { metadata } from '@atelier-ui/spec/metadata/dialog.metadata';
const ALL_IMPORTS = [
  AtlDialog,
  AtlDialogHeader,
  AtlDialogContent,
  AtlDialogFooter,
  AtlButton,
];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlDialog> = {
  title: 'Components/Overlay/AtlDialog',
  component: AtlDialog,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    closeOnBackdrop: { control: 'boolean' },
  },
  args: {
    size: 'md',
    closeOnBackdrop: true,
  },
  parameters: {
    design: figmaNode('55-94'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlDialog>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Dialog</atl-button>
      <atl-dialog [(open)]="open" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <atl-dialog-header>Confirm Action</atl-dialog-header>
        <atl-dialog-content>
          <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        </atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Confirm</atl-button>
        </atl-dialog-footer>
      </atl-dialog>
    `,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(dialog).not.toHaveAttribute('open');
  },
  parameters: { design: figmaNode('55-93') },
};

export const PreOpened: Story = {
  name: 'Pre-opened (no trigger)',
  render: (args) => ({
    props: { ...args, open: signal(true) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-dialog [(open)]="open" [size]="size">
        <atl-dialog-header>Pre-opened Dialog</atl-dialog-header>
        <atl-dialog-content><p>This dialog is open on load.</p></atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="primary" (click)="open.set(false)">Close</atl-button>
        </atl-dialog-footer>
      </atl-dialog>
    `,
  }),
};

export const CloseButtonDismiss: Story = {
  name: 'Close via header X button',
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Dialog</atl-button>
      <atl-dialog [(open)]="open" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <atl-dialog-header>Confirm Action</atl-dialog-header>
        <atl-dialog-content>
          <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        </atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Confirm</atl-button>
        </atl-dialog-footer>
      </atl-dialog>
    `,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close dialog' }));
    await expect(dialog).not.toHaveAttribute('open');
  },
};

export const EscapeToClose: Story = {
  name: 'Escape key closes dialog',
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Dialog</atl-button>
      <atl-dialog [(open)]="open" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <atl-dialog-header>Confirm Action</atl-dialog-header>
        <atl-dialog-content>
          <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        </atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Confirm</atl-button>
        </atl-dialog-footer>
      </atl-dialog>
    `,
  }),
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).toBeVisible();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    await expect(dialog).not.toHaveAttribute('open');
  },
};

export const SizeVariants: Story = {
  render: () => ({
    props: {
      smOpen: signal(false),
      mdOpen: signal(false),
      lgOpen: signal(false),
      xlOpen: signal(false),
      fullOpen: signal(false),
    },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <atl-button variant="outline" size="sm" (click)="smOpen.set(true)">Small</atl-button>
        <atl-button variant="outline" size="sm" (click)="mdOpen.set(true)">Medium</atl-button>
        <atl-button variant="outline" size="sm" (click)="lgOpen.set(true)">Large</atl-button>
        <atl-button variant="outline" size="sm" (click)="xlOpen.set(true)">Extra Large</atl-button>
        <atl-button variant="outline" size="sm" (click)="fullOpen.set(true)">Full Screen</atl-button>
      </div>

      <atl-dialog [(open)]="smOpen" size="sm">
        <atl-dialog-header>Small Dialog</atl-dialog-header>
        <atl-dialog-content><p>This is a small (sm) dialog.</p></atl-dialog-content>
        <atl-dialog-footer><atl-button variant="primary" (click)="smOpen.set(false)">Close</atl-button></atl-dialog-footer>
      </atl-dialog>

      <atl-dialog [(open)]="mdOpen" size="md">
        <atl-dialog-header>Medium Dialog</atl-dialog-header>
        <atl-dialog-content><p>This is a medium (md) dialog — the default size.</p></atl-dialog-content>
        <atl-dialog-footer><atl-button variant="primary" (click)="mdOpen.set(false)">Close</atl-button></atl-dialog-footer>
      </atl-dialog>

      <atl-dialog [(open)]="lgOpen" size="lg">
        <atl-dialog-header>Large Dialog</atl-dialog-header>
        <atl-dialog-content><p>This is a large (lg) dialog.</p></atl-dialog-content>
        <atl-dialog-footer><atl-button variant="primary" (click)="lgOpen.set(false)">Close</atl-button></atl-dialog-footer>
      </atl-dialog>

      <atl-dialog [(open)]="xlOpen" size="xl">
        <atl-dialog-header>Extra Large Dialog</atl-dialog-header>
        <atl-dialog-content><p>This is an extra large (xl) dialog.</p></atl-dialog-content>
        <atl-dialog-footer><atl-button variant="primary" (click)="xlOpen.set(false)">Close</atl-button></atl-dialog-footer>
      </atl-dialog>

      <atl-dialog [(open)]="fullOpen" size="full">
        <atl-dialog-header>Full Screen Dialog</atl-dialog-header>
        <atl-dialog-content><p>This dialog fills the entire viewport.</p></atl-dialog-content>
        <atl-dialog-footer><atl-button variant="primary" (click)="fullOpen.set(false)">Close</atl-button></atl-dialog-footer>
      </atl-dialog>
    `,
  }),
};

export const WithForm: Story = {
  render: (args) => ({
    props: {
      ...args,
      open: signal(false),
      name: signal(''),
      country: signal(''),
    },
    moduleMetadata: { imports: [...ALL_IMPORTS, AtlInput, AtlSelect, AtlOption] },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Form Dialog</atl-button>
      <atl-dialog [(open)]="open" [size]="size">
        <atl-dialog-header>User Details</atl-dialog-header>
        <atl-dialog-content>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Name</label>
              <atl-input [(value)]="name" placeholder="Enter your name" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Country</label>
              <atl-select [(value)]="country" placeholder="Select a country">
                <atl-option optionValue="us">United States</atl-option>
                <atl-option optionValue="ca">Canada</atl-option>
                <atl-option optionValue="uk">United Kingdom</atl-option>
              </atl-select>
            </div>
          </div>
        </atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Save</atl-button>
        </atl-dialog-footer>
      </atl-dialog>
    `,
  }),
};

export const LongContent: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Long Content Dialog</atl-button>
      <atl-dialog [(open)]="open" [size]="size">
        <atl-dialog-header>Terms of Service</atl-dialog-header>
        <atl-dialog-content>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.</p>
          <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
          <p>Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam.</p>
          <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
          <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.</p>
        </atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="outline" (click)="open.set(false)">Decline</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Accept</atl-button>
        </atl-dialog-footer>
      </atl-dialog>
    `,
  }),
};

export const NoBackdropClose: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <atl-button variant="primary" (click)="open.set(true)">Open Dialog</atl-button>
      <atl-dialog [(open)]="open" [closeOnBackdrop]="false">
        <atl-dialog-header>Important Decision</atl-dialog-header>
        <atl-dialog-content>
          <p>This dialog cannot be closed by clicking the backdrop. You must use one of the buttons below.</p>
        </atl-dialog-content>
        <atl-dialog-footer>
          <atl-button variant="outline" (click)="open.set(false)">Cancel</atl-button>
          <atl-button variant="primary" (click)="open.set(false)">Confirm</atl-button>
        </atl-dialog-footer>
      </atl-dialog>
    `,
  }),
  args: { closeOnBackdrop: false },
};
