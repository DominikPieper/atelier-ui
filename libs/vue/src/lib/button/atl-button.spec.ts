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
    render(AtlButton, { props: { variant: 'outline', size: 'lg' }, slots: { default: 'Outline' } });
    const button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('variant-outline', 'size-lg');
  });

  covers('button', 'disabled-state')('is disabled when disabled prop is true', () => {
    render(AtlButton, { props: { disabled: true }, slots: { default: 'Disabled' } });
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('is-disabled');
  });

  covers('button', 'loading-spinner')('is disabled and shows spinner when loading', () => {
    render(AtlButton, { props: { loading: true }, slots: { default: 'Loading' } });
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('is-loading');
    expect(button.querySelector('.spinner')).toBeInTheDocument();
  });

  covers('button', 'click-emits')('emits click events when not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(AtlButton, { slots: { default: 'Click' }, attrs: { onClick } });
    await user.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  covers('button', 'disabled-no-click')('does not emit click when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(AtlButton, { props: { disabled: true }, slots: { default: 'No Click' }, attrs: { onClick } });
    await user.click(screen.getByRole('button', { name: 'No Click' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
