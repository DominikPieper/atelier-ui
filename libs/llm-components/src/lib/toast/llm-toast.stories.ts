import type { Meta, StoryObj } from '@storybook/angular';
import { Component, inject, input } from '@angular/core';
import { LlmToast, LlmToastContainer, LlmToastService, ToastVariant } from './llm-toast';
import { LlmButton } from '../button/llm-button';

/* ── Wrapper component for stories that need the service ── */
@Component({
  selector: 'toast-story-wrapper',
  standalone: true,
  imports: [LlmToastContainer, LlmButton],
  template: `
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <llm-button variant="primary" (click)="showToast()">Show Toast</llm-button>
      <llm-button variant="outline" (click)="clearAll()">Clear All</llm-button>
    </div>
    <llm-toast-container [position]="position()" />
  `,
})
class ToastStoryWrapper {
  private readonly toastService = inject(LlmToastService);

  readonly position = input<'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'>('bottom-right');
  readonly variant = input<ToastVariant>('default');
  readonly duration = input(5000);
  readonly dismissible = input(true);
  readonly message = input('This is a toast notification.');

  showToast(): void {
    this.toastService.show(this.message(), {
      variant: this.variant(),
      duration: this.duration(),
      dismissible: this.dismissible(),
    });
  }

  clearAll(): void {
    this.toastService.clear();
  }
}

@Component({
  selector: 'toast-all-variants-wrapper',
  standalone: true,
  imports: [LlmToastContainer, LlmButton],
  template: `
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <llm-button variant="outline" (click)="showAll()">Show All Variants</llm-button>
      <llm-button variant="outline" (click)="clearAll()">Clear All</llm-button>
    </div>
    <llm-toast-container position="bottom-right" />
  `,
})
class ToastAllVariantsWrapper {
  private readonly toastService = inject(LlmToastService);

  showAll(): void {
    this.toastService.show('This is a default notification.', { variant: 'default' });
    this.toastService.show('Operation completed successfully!', { variant: 'success' });
    this.toastService.show('Please review before continuing.', { variant: 'warning' });
    this.toastService.show('An error occurred. Please try again.', { variant: 'danger' });
    this.toastService.show('Here is some useful information.', { variant: 'info' });
  }

  clearAll(): void {
    this.toastService.clear();
  }
}

@Component({
  selector: 'toast-auto-dismiss-wrapper',
  standalone: true,
  imports: [LlmToastContainer, LlmButton],
  template: `
    <llm-button variant="primary" (click)="showQuick()">Show Toast (2s auto-dismiss)</llm-button>
    <llm-toast-container position="bottom-right" />
  `,
})
class ToastAutoDismissWrapper {
  private readonly toastService = inject(LlmToastService);

  showQuick(): void {
    this.toastService.show('This will disappear in 2 seconds.', {
      variant: 'info',
      duration: 2000,
    });
  }
}

@Component({
  selector: 'toast-persistent-wrapper',
  standalone: true,
  imports: [LlmToastContainer, LlmButton],
  template: `
    <llm-button variant="primary" (click)="showPersistent()">Show Persistent Toast</llm-button>
    <llm-toast-container position="bottom-right" />
  `,
})
class ToastPersistentWrapper {
  private readonly toastService = inject(LlmToastService);

  showPersistent(): void {
    this.toastService.show('This toast will not auto-dismiss. Click X to close.', {
      variant: 'warning',
      duration: 0,
      dismissible: true,
    });
  }
}

/* ── Individual toast meta (for autodocs) ── */
const meta: Meta<LlmToast> = {
  title: 'Components/LlmToast',
  component: LlmToast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger', 'info'],
    },
    dismissible: { control: 'boolean' },
    message: { control: 'text' },
  },
  args: {
    variant: 'default',
    dismissible: true,
    message: 'This is a toast notification.',
  },
};

export default meta;
type Story = StoryObj<LlmToast>;

export const Default: Story = {
  render: () => ({
    props: {},
    template: `<toast-story-wrapper />`,
    moduleMetadata: { imports: [ToastStoryWrapper] },
  }),
};

export const AllVariants: Story = {
  render: () => ({
    props: {},
    template: `<toast-all-variants-wrapper />`,
    moduleMetadata: { imports: [ToastAllVariantsWrapper] },
  }),
};

export const AutoDismiss: Story = {
  render: () => ({
    props: {},
    template: `<toast-auto-dismiss-wrapper />`,
    moduleMetadata: { imports: [ToastAutoDismissWrapper] },
  }),
};

export const Persistent: Story = {
  render: () => ({
    props: {},
    template: `<toast-persistent-wrapper />`,
    moduleMetadata: { imports: [ToastPersistentWrapper] },
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: {
      ...args,
    },
    template: `
      <toast-story-wrapper
        [variant]="variant"
        [duration]="duration"
        [dismissible]="dismissible"
        [message]="message"
        [position]="position"
      />
    `,
    moduleMetadata: { imports: [ToastStoryWrapper] },
  }),
  argTypes: {
    ...meta.argTypes,
    position: {
      control: 'select',
      options: ['top-right', 'top-center', 'bottom-right', 'bottom-center'],
    },
    duration: { control: 'number' },
  },
  args: {
    variant: 'default',
    dismissible: true,
    message: 'Playground toast notification.',
    position: 'bottom-right' as any,
    duration: 5000 as any,
  },
};
