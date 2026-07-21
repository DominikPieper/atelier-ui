import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlToggle } from './atl-toggle';
import { covers } from '../../testing/behavior';

describe('AtlToggle', () => {
  covers('toggle', 'role-switch')('renders a checkbox input with role switch', () => {
    render(<AtlToggle>Enable</AtlToggle>);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('applies atl-toggle class to wrapper', () => {
    const { container } = render(<AtlToggle />);
    expect(container.firstChild).toHaveClass('atl-toggle');
  });

  it('renders label text', () => {
    render(<AtlToggle>Enable notifications</AtlToggle>);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(<AtlToggle />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  covers('toggle', 'reflects-checked')('renders as checked when checked=true', () => {
    render(<AtlToggle checked>Enable</AtlToggle>);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('applies is-checked class when checked', () => {
    const { container } = render(<AtlToggle checked />);
    expect(container.firstChild).toHaveClass('is-checked');
  });

  covers('toggle', 'disabled')('is disabled when disabled prop is true', () => {
    render(<AtlToggle disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(<AtlToggle disabled />);
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render(<AtlToggle invalid />);
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  it('sets aria-invalid when invalid', () => {
    render(<AtlToggle invalid />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  covers('toggle', 'toggle-emits')('calls onCheckedChange on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<AtlToggle onCheckedChange={onCheckedChange}>Enable</AtlToggle>);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledOnce();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  covers('toggle', 'errors')('shows error messages', () => {
    render(<AtlToggle invalid errors={['Required']}>Enable</AtlToggle>);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  covers('toggle', 'aria-checked')('sets aria-checked attribute', () => {
    render(<AtlToggle checked />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('renders track and thumb elements', () => {
    const { container } = render(<AtlToggle />);
    expect(container.querySelector('.track')).toBeInTheDocument();
    expect(container.querySelector('.thumb')).toBeInTheDocument();
  });
});
