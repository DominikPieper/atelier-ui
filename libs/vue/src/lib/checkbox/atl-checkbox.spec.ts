import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import AtlCheckbox from './atl-checkbox.vue';
import { covers } from '../../testing/behavior';

describe('AtlCheckbox', () => {
  it('renders with a label', () => {
    render(AtlCheckbox, { slots: { default: 'Accept terms' } });
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  covers('checkbox', 'reflects-checked')('reflects checked prop', () => {
    render(AtlCheckbox, { props: { checked: true }, slots: { default: 'Checked' } });
    expect(screen.getByRole('checkbox', { name: 'Checked' })).toBeChecked();
  });

  covers('checkbox', 'toggle-emits')('emits update:checked on change', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlCheckbox, { props: { checked: false }, slots: { default: 'Toggle' } });
    await user.click(screen.getByRole('checkbox', { name: 'Toggle' }));
    expect(emitted()['update:checked']).toEqual([[true]]);
  });

  covers('checkbox', 'disabled')('is disabled when disabled prop is true', () => {
    render(AtlCheckbox, { props: { disabled: true }, slots: { default: 'Disabled' } });
    expect(screen.getByRole('checkbox', { name: 'Disabled' })).toBeDisabled();
  });

  covers('checkbox', 'errors')('displays error messages', () => {
    render(AtlCheckbox, { props: { errors: ['Field is required'] }, slots: { default: 'Required' } });
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  covers('checkbox', 'invalid')('marks input as invalid when invalid prop is true', () => {
    render(AtlCheckbox, { props: { invalid: true }, slots: { default: 'Invalid' } });
    expect(screen.getByRole('checkbox', { name: 'Invalid' })).toHaveAttribute('aria-invalid', 'true');
  });

  covers('checkbox', 'indeterminate')('sets the indeterminate property on the input when indeterminate is true', () => {
    const { container } = render(AtlCheckbox, {
      props: { indeterminate: true },
      slots: { default: 'Partial' },
    });
    expect((container.querySelector('input') as HTMLInputElement).indeterminate).toBe(true);
  });

  it('renders error messages as .error-message paragraphs', () => {
    const { container } = render(AtlCheckbox, {
      props: { errors: ['Field is required', 'Pick one'] },
      slots: { default: 'Required' },
    });
    expect(container.querySelectorAll('.errors .error-message')).toHaveLength(2);
  });

  // Angular and React point the input at the error container; a screen reader
  // reads nothing unless the two are associated.
  it('points aria-describedby at the errors container', () => {
    const { container } = render(AtlCheckbox, {
      props: { errors: ['Field is required'] },
      slots: { default: 'Required' },
    });
    const errors = container.querySelector('.errors') as HTMLElement;
    expect(errors.id).toBeTruthy();
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby', errors.id);
  });

  it('sets no aria-describedby when there are no errors', () => {
    render(AtlCheckbox, { slots: { default: 'Required' } });
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('aria-describedby');
  });
});
