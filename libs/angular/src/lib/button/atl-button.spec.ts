/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlButton } from './atl-button';

describe('AtlButton', () => {
  covers('button', 'default-render')('renders without error with default inputs', async () => {
    await render('<atl-button>Click me</atl-button>', { imports: [AtlButton] });
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  describe('variant classes', () => {
    it.each(['primary', 'secondary', 'outline', 'danger'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<atl-button variant="${variant}">Btn</atl-button>`,
          { imports: [AtlButton] }
        );
        expect(container.querySelector('atl-button')).toHaveClass(`variant-${variant}`);
      }
    );
  });

  describe('size classes', () => {
    it.each(['sm', 'md', 'lg'] as const)(
      'applies size-%s class to host',
      async (size) => {
        const { container } = await render(
          `<atl-button size="${size}">Btn</atl-button>`,
          { imports: [AtlButton] }
        );
        expect(container.querySelector('atl-button')).toHaveClass(`size-${size}`);
      }
    );
  });

  describe('disabled state', () => {
    covers('button', 'disabled-state')('sets aria-disabled when disabled input is true', async () => {
      const { container } = await render(
        '<atl-button [disabled]="true">Btn</atl-button>',
        { imports: [AtlButton] }
      );
      expect(container.querySelector('atl-button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies is-disabled class when disabled', async () => {
      const { container } = await render(
        '<atl-button [disabled]="true">Btn</atl-button>',
        { imports: [AtlButton] }
      );
      expect(container.querySelector('atl-button')).toHaveClass('is-disabled');
    });
  });

  describe('loading state', () => {
    covers('button', 'loading-spinner')('renders spinner when loading', async () => {
      const { container } = await render(
        '<atl-button [loading]="true">Btn</atl-button>',
        { imports: [AtlButton] }
      );
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });

    it('sets aria-disabled when loading', async () => {
      const { container } = await render(
        '<atl-button [loading]="true">Btn</atl-button>',
        { imports: [AtlButton] }
      );
      expect(container.querySelector('atl-button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies is-loading class when loading', async () => {
      const { container } = await render(
        '<atl-button [loading]="true">Btn</atl-button>',
        { imports: [AtlButton] }
      );
      expect(container.querySelector('atl-button')).toHaveClass('is-loading');
    });
  });

  it('projects slotted content into the button', async () => {
    await render('<atl-button>Save Changes</atl-button>', { imports: [AtlButton] });
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  covers('button', 'click-emits')('emits native click events when not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = await render(
      '<atl-button (click)="onClick()">Click me</atl-button>',
      { imports: [AtlButton], componentProperties: { onClick } }
    );
    await user.click(container.querySelector('atl-button')!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  covers('button', 'disabled-no-click')('does not emit click when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = await render(
      '<atl-button [disabled]="true" (click)="onClick()">Click me</atl-button>',
      { imports: [AtlButton], componentProperties: { onClick } }
    );
    await user.click(container.querySelector('atl-button')!);
    expect(onClick).not.toHaveBeenCalled();
  });
});
