import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlCheckbox } from './atl-checkbox';

describe('AtlCheckbox', () => {
  it('renders a checkbox input', () => {
    render(<AtlCheckbox>Accept</AtlCheckbox>);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('applies atl-checkbox class to wrapper', () => {
    const { container } = render(<AtlCheckbox />);
    expect(container.firstChild).toHaveClass('atl-checkbox');
  });

  it('renders label text', () => {
    render(<AtlCheckbox>I agree</AtlCheckbox>);
    expect(screen.getByText('I agree')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<AtlCheckbox />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  covers('checkbox', 'reflects-checked')('renders as checked when checked=true', () => {
    render(<AtlCheckbox checked>Accept</AtlCheckbox>);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('applies is-checked class when checked', () => {
    const { container } = render(<AtlCheckbox checked />);
    expect(container.firstChild).toHaveClass('is-checked');
  });

  covers('checkbox', 'disabled')('is disabled when disabled prop is true', () => {
    render(<AtlCheckbox disabled />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(<AtlCheckbox disabled />);
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(<AtlCheckbox invalid />);
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  covers('checkbox', 'invalid')('sets aria-invalid when invalid', () => {
    render(<AtlCheckbox invalid />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  covers('checkbox', 'toggle-emits')('calls onCheckedChange on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<AtlCheckbox onCheckedChange={onCheckedChange}>Accept</AtlCheckbox>);
    await user.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  covers('checkbox', 'indeterminate')('sets indeterminate state on checkbox element', () => {
    render(<AtlCheckbox indeterminate />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  covers('checkbox', 'errors')('shows error messages', () => {
    render(<AtlCheckbox invalid errors={['Required']}>Accept</AtlCheckbox>);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });
});
