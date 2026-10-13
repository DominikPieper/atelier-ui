import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlButton from './atl-button.vue';

describe('AtlButton', () => {
  covers('button', 'default-render')('renders with default props', () => {
    render(AtlButton, { slots: { default: 'Click me' } });
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('atl-button', 'variant-primary', 'size-md');
  });

  it('applies variant and size classes', () => {
    render(AtlButton, {
      props: { variant: 'outline', size: 'lg' },
      slots: { default: 'Outline' },
    });
    const button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('variant-outline', 'size-lg');
  });

  covers('button', 'disabled-state')(
    'is disabled when disabled prop is true',
    () => {
      render(AtlButton, {
        props: { disabled: true },
        slots: { default: 'Disabled' },
      });
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('is-disabled');
    },
  );

  covers('button', 'loading-spinner')(
    'shows the spinner and the loading class when loading',
    () => {
      render(AtlButton, {
        props: { loading: true },
        slots: { default: 'Loading' },
      });
      const button = screen.getByRole('button', { name: 'Loading' });
      expect(button).toHaveClass('is-loading', 'is-disabled');
      expect(button.querySelector('.spinner')).toBeInTheDocument();
    },
  );

  // ADR-0171: loading is aria-disabled + aria-busy, never native `disabled`,
  // so a focused button that starts loading keeps focus (WCAG 2.4.3).
  covers('button', 'loading-busy')(
    'is aria-busy and aria-disabled but not natively disabled when loading',
    () => {
      render(AtlButton, {
        props: { loading: true },
        slots: { default: 'Btn' },
      });
      const btn = screen.getByRole('button');
      expect(btn).toBeEnabled();
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).toHaveAttribute('aria-busy', 'true');
    },
  );

  it('carries no aria-busy when not loading', () => {
    render(AtlButton, { props: { disabled: true }, slots: { default: 'Btn' } });
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('keeps focus when a focused button starts loading', async () => {
    const { rerender } = render(AtlButton, { slots: { default: 'Save' } });
    const btn = screen.getByRole('button', { name: 'Save' });
    btn.focus();
    expect(btn).toHaveFocus();
    await rerender({ loading: true });
    expect(btn).toHaveFocus();
  });

  it('stays reachable with Tab while loading', async () => {
    const user = userEvent.setup();
    render(AtlButton, {
      props: { loading: true },
      slots: { default: 'Save' },
    });
    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  covers('button', 'loading-no-click')(
    'ignores clicks and keyboard activation while loading',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(AtlButton, {
        props: { loading: true },
        slots: { default: 'Save' },
        attrs: { onClick },
      });
      await user.click(screen.getByRole('button'));
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it('does not submit the enclosing form while loading', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: Event) => e.preventDefault());
    render({
      components: { AtlButton },
      setup: () => ({ onSubmit }),
      template:
        '<form @submit="onSubmit"><AtlButton type="submit" loading>Send</AtlButton></form>',
    });
    await user.click(screen.getByRole('button'));
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  covers('button', 'click-emits')(
    'emits click events when not disabled',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(AtlButton, { slots: { default: 'Click' }, attrs: { onClick } });
      await user.click(screen.getByRole('button', { name: 'Click' }));
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  covers('button', 'disabled-no-click')(
    'does not emit click when disabled',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(AtlButton, {
        props: { disabled: true },
        slots: { default: 'No Click' },
        attrs: { onClick },
      });
      await user.click(screen.getByRole('button', { name: 'No Click' }));
      expect(onClick).not.toHaveBeenCalled();
    },
  );
});
