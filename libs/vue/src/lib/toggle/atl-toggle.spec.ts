import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import AtlToggle from './atl-toggle.vue';
import { covers } from '../../testing/behavior';

describe('AtlToggle', () => {
  covers('toggle', 'role-switch')('renders a switch', () => {
    render(AtlToggle, { slots: { default: 'Enable notifications' } });
    expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument();
  });

  covers('toggle', 'reflects-checked')('reflects checked state', () => {
    render(AtlToggle, { props: { checked: true }, slots: { default: 'Enabled' } });
    expect(screen.getByRole('switch', { name: 'Enabled' })).toBeChecked();
  });

  covers('toggle', 'toggle-emits')('emits update:checked on toggle', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlToggle, { props: { checked: false }, slots: { default: 'Toggle' } });
    await user.click(screen.getByRole('switch', { name: 'Toggle' }));
    expect(emitted()['update:checked']).toEqual([[true]]);
  });

  covers('toggle', 'disabled')('is disabled when disabled prop is true', () => {
    render(AtlToggle, { props: { disabled: true }, slots: { default: 'Disabled' } });
    expect(screen.getByRole('switch', { name: 'Disabled' })).toBeDisabled();
  });

  covers('toggle', 'errors')('displays error messages', () => {
    render(AtlToggle, { props: { errors: ['This is required'] }, slots: { default: 'Toggle' } });
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  covers('toggle', 'aria-checked')('sets aria-checked attribute', () => {
    render(AtlToggle, { props: { checked: true }, slots: { default: 'Notify' } });
    expect(screen.getByRole('switch', { name: 'Notify' })).toHaveAttribute('aria-checked', 'true');
  });

  // `.atl-toggle.is-checked .track` and `… .thumb` are the only rules that fill the
  // track and slide the thumb. Without the class the switch is painted off in every
  // state, and `reflects checked state` above still passes: it asserts the native
  // input's property, which was bound correctly all along.
  it('applies is-checked class to the root when checked', () => {
    const { container } = render(AtlToggle, {
      props: { checked: true },
      slots: { default: 'Enabled' },
    });
    expect(container.firstElementChild).toHaveClass('is-checked');
  });

  it('does not apply is-checked class when unchecked', () => {
    const { container } = render(AtlToggle, {
      props: { checked: false },
      slots: { default: 'Disabled' },
    });
    expect(container.firstElementChild).not.toHaveClass('is-checked');
  });

  it('renders error messages as .error-message paragraphs', () => {
    const { container } = render(AtlToggle, {
      props: { errors: ['This is required', 'Pick one'] },
      slots: { default: 'Toggle' },
    });
    expect(container.querySelectorAll('.errors .error-message')).toHaveLength(2);
  });

  // Angular and React point the input at the error container; a screen reader
  // reads nothing unless the two are associated.
  it('points aria-describedby at the errors container', () => {
    const { container } = render(AtlToggle, {
      props: { errors: ['This is required'] },
      slots: { default: 'Toggle' },
    });
    const errors = container.querySelector('.errors') as HTMLElement;
    expect(errors.id).toBeTruthy();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-describedby', errors.id);
  });

  it('sets no aria-describedby when there are no errors', () => {
    render(AtlToggle, { slots: { default: 'Toggle' } });
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-describedby');
  });
});
