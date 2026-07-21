import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { TestBed } from '@angular/core/testing';
import {
  AtlToast,
  AtlToastContainer,
  AtlToastService,
} from './atl-toast';
import { covers } from '../../testing/behavior';

describe('AtlToastService', () => {
  let service: AtlToastService;

  beforeEach(() => {
    service = new AtlToastService();
  });

  afterEach(() => {
    service.clear();
  });

  it('starts with no toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  covers('toast', 'show-adds')('show() adds a toast and returns an id', () => {
    const id = service.show('Hello');
    expect(id).toBeTruthy();
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Hello');
  });

  it('show() applies default options', () => {
    service.show('Test');
    const toast = service.toasts()[0];
    expect(toast.variant).toBe('default');
    expect(toast.duration).toBe(5000);
    expect(toast.dismissible).toBe(true);
  });

  it('show() applies custom options', () => {
    service.show('Warning!', { variant: 'warning', duration: 3000, dismissible: false });
    const toast = service.toasts()[0];
    expect(toast.variant).toBe('warning');
    expect(toast.duration).toBe(3000);
    expect(toast.dismissible).toBe(false);
  });

  it('dismiss() removes a toast by id', () => {
    const id = service.show('To remove');
    service.show('Keep');
    expect(service.toasts()).toHaveLength(2);
    service.dismiss(id);
    expect(service.toasts()).toHaveLength(1);
    expect(service.toasts()[0].message).toBe('Keep');
  });

  it('clear() removes all toasts', () => {
    service.show('One');
    service.show('Two');
    service.show('Three');
    expect(service.toasts()).toHaveLength(3);
    service.clear();
    expect(service.toasts()).toEqual([]);
  });

  it('auto-dismisses after duration', () => {
    vi.useFakeTimers();
    service.show('Auto', { duration: 2000 });
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1999);
    expect(service.toasts()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.toasts()).toHaveLength(0);

    vi.useRealTimers();
  });

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers();
    service.show('Persistent', { duration: 0 });
    vi.advanceTimersByTime(60000);
    expect(service.toasts()).toHaveLength(1);
    vi.useRealTimers();
  });

  it('dismiss() clears the auto-dismiss timer', () => {
    vi.useFakeTimers();
    const id = service.show('Will dismiss', { duration: 5000 });
    service.dismiss(id);
    expect(service.toasts()).toHaveLength(0);

    // Ensure no error from timer firing after manual dismiss
    vi.advanceTimersByTime(5000);
    expect(service.toasts()).toHaveLength(0);
    vi.useRealTimers();
  });
});

describe('AtlToast', () => {
  it('renders message text', async () => {
    await render('<atl-toast message="Hello world" />', {
      imports: [AtlToast],
    });
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  covers('toast', 'variant-class').each(['default', 'success', 'warning', 'danger', 'info'] as const)(
    'applies variant-%s class to host',
    async (variant) => {
      const { container } = await render(
        `<atl-toast variant="${variant}" message="Test" />`,
        { imports: [AtlToast] }
      );
      expect(container.querySelector('atl-toast')).toHaveClass(`variant-${variant}`);
    }
  );

  it('has role="status" on host', async () => {
    const { container } = await render('<atl-toast message="Test" />', {
      imports: [AtlToast],
    });
    expect(container.querySelector('atl-toast')).toHaveAttribute('role', 'status');
  });

  it('renders dismiss button when dismissible=true (default)', async () => {
    await render('<atl-toast message="Test" />', {
      imports: [AtlToast],
    });
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('does not render dismiss button when dismissible=false', async () => {
    await render('<atl-toast [dismissible]="false" message="Test" />', {
      imports: [AtlToast],
    });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  covers('toast', 'dismiss-button-click')('emits dismissed with toastId when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const dismissed = vi.fn();
    await render(
      '<atl-toast message="Test" toastId="abc-123" (dismissed)="dismissed($event)" />',
      {
        imports: [AtlToast],
        componentProperties: { dismissed },
      }
    );
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(dismissed).toHaveBeenCalledWith('abc-123');
  });
});

describe('AtlToastContainer', () => {
  it('has aria-live="polite" on host', async () => {
    const { container } = await render('<atl-toast-container />', {
      imports: [AtlToastContainer],
    });
    expect(container.querySelector('atl-toast-container')).toHaveAttribute(
      'aria-live',
      'polite'
    );
  });

  it('has role="status" on host', async () => {
    const { container } = await render('<atl-toast-container />', {
      imports: [AtlToastContainer],
    });
    expect(container.querySelector('atl-toast-container')).toHaveAttribute('role', 'status');
  });

  it('renders toasts from the service', async () => {
    const { fixture } = await render('<atl-toast-container />', {
      imports: [AtlToastContainer],
    });
    const service = TestBed.inject(AtlToastService);
    service.show('First toast');
    service.show('Second toast', { variant: 'success' });

    fixture.detectChanges();

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
  });

  covers('toast', 'position-class')('applies position class to host', async () => {
    const { container } = await render(
      '<atl-toast-container position="top-center" />',
      { imports: [AtlToastContainer] }
    );
    expect(container.querySelector('atl-toast-container')).toHaveClass('position-top-center');
  });

  it('defaults to position-bottom-right', async () => {
    const { container } = await render('<atl-toast-container />', {
      imports: [AtlToastContainer],
    });
    expect(container.querySelector('atl-toast-container')).toHaveClass('position-bottom-right');
  });
});
