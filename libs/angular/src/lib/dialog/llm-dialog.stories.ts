import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { userEvent, expect } from 'storybook/test';
import { LlmButton } from '../button/llm-button';
import { LlmInput } from '../input/llm-input';
import { LlmOption } from '../select/llm-option';
import { LlmSelect } from '../select/llm-select';
import { LlmDialog, LlmDialogContent, LlmDialogFooter, LlmDialogHeader } from './llm-dialog';

const ALL_IMPORTS = [
  LlmDialog,
  LlmDialogHeader,
  LlmDialogContent,
  LlmDialogFooter,
  LlmButton,
];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmDialog> = {
  title: 'Components/Overlay/LlmDialog',
  component: LlmDialog,
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
  },
};

export default meta;
type Story = StoryObj<LlmDialog>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Open Dialog</llm-button>
      <llm-dialog [(open)]="open" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <llm-dialog-header>Confirm Action</llm-dialog-header>
        <llm-dialog-content>
          <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        </llm-dialog-content>
        <llm-dialog-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Confirm</llm-button>
        </llm-dialog-footer>
      </llm-dialog>
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
      <llm-dialog [(open)]="open" [size]="size">
        <llm-dialog-header>Pre-opened Dialog</llm-dialog-header>
        <llm-dialog-content><p>This dialog is open on load.</p></llm-dialog-content>
        <llm-dialog-footer>
          <llm-button variant="primary" (click)="open.set(false)">Close</llm-button>
        </llm-dialog-footer>
      </llm-dialog>
    `,
  }),
};

export const CloseButtonDismiss: Story = {
  name: 'Close via header X button',
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Open Dialog</llm-button>
      <llm-dialog [(open)]="open" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <llm-dialog-header>Confirm Action</llm-dialog-header>
        <llm-dialog-content>
          <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        </llm-dialog-content>
        <llm-dialog-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Confirm</llm-button>
        </llm-dialog-footer>
      </llm-dialog>
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
      <llm-button variant="primary" (click)="open.set(true)">Open Dialog</llm-button>
      <llm-dialog [(open)]="open" [size]="size" [closeOnBackdrop]="closeOnBackdrop">
        <llm-dialog-header>Confirm Action</llm-dialog-header>
        <llm-dialog-content>
          <p>Are you sure you want to proceed with this action? This cannot be undone.</p>
        </llm-dialog-content>
        <llm-dialog-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Confirm</llm-button>
        </llm-dialog-footer>
      </llm-dialog>
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
        <llm-button variant="outline" size="sm" (click)="smOpen.set(true)">Small</llm-button>
        <llm-button variant="outline" size="sm" (click)="mdOpen.set(true)">Medium</llm-button>
        <llm-button variant="outline" size="sm" (click)="lgOpen.set(true)">Large</llm-button>
        <llm-button variant="outline" size="sm" (click)="xlOpen.set(true)">Extra Large</llm-button>
        <llm-button variant="outline" size="sm" (click)="fullOpen.set(true)">Full Screen</llm-button>
      </div>

      <llm-dialog [(open)]="smOpen" size="sm">
        <llm-dialog-header>Small Dialog</llm-dialog-header>
        <llm-dialog-content><p>This is a small (sm) dialog.</p></llm-dialog-content>
        <llm-dialog-footer><llm-button variant="primary" (click)="smOpen.set(false)">Close</llm-button></llm-dialog-footer>
      </llm-dialog>

      <llm-dialog [(open)]="mdOpen" size="md">
        <llm-dialog-header>Medium Dialog</llm-dialog-header>
        <llm-dialog-content><p>This is a medium (md) dialog — the default size.</p></llm-dialog-content>
        <llm-dialog-footer><llm-button variant="primary" (click)="mdOpen.set(false)">Close</llm-button></llm-dialog-footer>
      </llm-dialog>

      <llm-dialog [(open)]="lgOpen" size="lg">
        <llm-dialog-header>Large Dialog</llm-dialog-header>
        <llm-dialog-content><p>This is a large (lg) dialog.</p></llm-dialog-content>
        <llm-dialog-footer><llm-button variant="primary" (click)="lgOpen.set(false)">Close</llm-button></llm-dialog-footer>
      </llm-dialog>

      <llm-dialog [(open)]="xlOpen" size="xl">
        <llm-dialog-header>Extra Large Dialog</llm-dialog-header>
        <llm-dialog-content><p>This is an extra large (xl) dialog.</p></llm-dialog-content>
        <llm-dialog-footer><llm-button variant="primary" (click)="xlOpen.set(false)">Close</llm-button></llm-dialog-footer>
      </llm-dialog>

      <llm-dialog [(open)]="fullOpen" size="full">
        <llm-dialog-header>Full Screen Dialog</llm-dialog-header>
        <llm-dialog-content><p>This dialog fills the entire viewport.</p></llm-dialog-content>
        <llm-dialog-footer><llm-button variant="primary" (click)="fullOpen.set(false)">Close</llm-button></llm-dialog-footer>
      </llm-dialog>
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
    moduleMetadata: { imports: [...ALL_IMPORTS, LlmInput, LlmSelect, LlmOption] },
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Open Form Dialog</llm-button>
      <llm-dialog [(open)]="open" [size]="size">
        <llm-dialog-header>User Details</llm-dialog-header>
        <llm-dialog-content>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Name</label>
              <llm-input [(value)]="name" placeholder="Enter your name" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500;">Country</label>
              <llm-select [(value)]="country" placeholder="Select a country">
                <llm-option optionValue="us">United States</llm-option>
                <llm-option optionValue="ca">Canada</llm-option>
                <llm-option optionValue="uk">United Kingdom</llm-option>
              </llm-select>
            </div>
          </div>
        </llm-dialog-content>
        <llm-dialog-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Save</llm-button>
        </llm-dialog-footer>
      </llm-dialog>
    `,
  }),
};

export const LongContent: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Open Long Content Dialog</llm-button>
      <llm-dialog [(open)]="open" [size]="size">
        <llm-dialog-header>Terms of Service</llm-dialog-header>
        <llm-dialog-content>
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
        </llm-dialog-content>
        <llm-dialog-footer>
          <llm-button variant="outline" (click)="open.set(false)">Decline</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Accept</llm-button>
        </llm-dialog-footer>
      </llm-dialog>
    `,
  }),
};

export const NoBackdropClose: Story = {
  render: (args) => ({
    props: { ...args, open: signal(false) },
    moduleMetadata: { imports: ALL_IMPORTS },
    template: `
      <llm-button variant="primary" (click)="open.set(true)">Open Dialog</llm-button>
      <llm-dialog [(open)]="open" [closeOnBackdrop]="false">
        <llm-dialog-header>Important Decision</llm-dialog-header>
        <llm-dialog-content>
          <p>This dialog cannot be closed by clicking the backdrop. You must use one of the buttons below.</p>
        </llm-dialog-content>
        <llm-dialog-footer>
          <llm-button variant="outline" (click)="open.set(false)">Cancel</llm-button>
          <llm-button variant="primary" (click)="open.set(false)">Confirm</llm-button>
        </llm-dialog-footer>
      </llm-dialog>
    `,
  }),
  args: { closeOnBackdrop: false },
};
