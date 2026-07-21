import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlRadioGroup } from './atl-radio-group';
import { AtlRadio } from '../radio/atl-radio';
import { covers } from '../../testing/behavior';

describe('AtlRadioGroup', () => {
  it('renders children', () => {
    render(
      <AtlRadioGroup name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
      </AtlRadioGroup>
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  covers('radio-group', 'role')('has role="radiogroup"', () => {
    render(
      <AtlRadioGroup name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
      </AtlRadioGroup>
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  covers('radio-group', 'checks-matching-value')('checks the radio matching value', () => {
    render(
      <AtlRadioGroup value="pro" name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
      </AtlRadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  covers('radio-group', 'value-change')('calls onValueChange when a radio is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlRadioGroup value="free" onValueChange={onChange} name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
      </AtlRadioGroup>
    );
    await user.click(screen.getByLabelText('Pro'));
    expect(onChange).toHaveBeenCalledWith('pro');
  });

  covers('radio-group', 'keyboard-nav')('ArrowDown selects the next radio', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlRadioGroup value="free" onValueChange={onChange} name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
        <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
      </AtlRadioGroup>
    );
    screen.getByLabelText('Free').focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('pro');
  });

  it('ArrowUp wraps from the first radio to the last', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlRadioGroup value="free" onValueChange={onChange} name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
        <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
      </AtlRadioGroup>
    );
    screen.getByLabelText('Free').focus();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('enterprise');
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(
      <AtlRadioGroup disabled name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
      </AtlRadioGroup>
    );
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('does not call onValueChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlRadioGroup value="free" onValueChange={onChange} disabled name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
      </AtlRadioGroup>
    );
    await user.click(screen.getByLabelText('Pro'));
    expect(onChange).not.toHaveBeenCalled();
  });

  covers('radio-group', 'invalid')('applies is-invalid class when invalid', () => {
    const { container } = render(
      <AtlRadioGroup invalid name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
      </AtlRadioGroup>
    );
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  covers('radio-group', 'errors')('shows error messages when invalid and errors provided', () => {
    render(
      <AtlRadioGroup invalid errors={['Please select a plan']} name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
      </AtlRadioGroup>
    );
    expect(screen.getByText('Please select a plan')).toBeInTheDocument();
  });
});

describe('AtlRadio', () => {
  it('renders with label text', () => {
    render(
      <AtlRadioGroup name="plan">
        <AtlRadio radioValue="free">Free plan</AtlRadio>
      </AtlRadioGroup>
    );
    expect(screen.getByText('Free plan')).toBeInTheDocument();
  });

  it('is disabled when individual disabled prop is set', () => {
    render(
      <AtlRadioGroup name="plan">
        <AtlRadio radioValue="free" disabled>
          Free
        </AtlRadio>
      </AtlRadioGroup>
    );
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('propagates name from group', () => {
    render(
      <AtlRadioGroup name="my-group">
        <AtlRadio radioValue="a">A</AtlRadio>
        <AtlRadio radioValue="b">B</AtlRadio>
      </AtlRadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toHaveAttribute('name', 'my-group'));
  });
});
