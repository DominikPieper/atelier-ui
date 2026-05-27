import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmRadioGroup } from './llm-radio-group';
import { LlmRadio } from '../radio/llm-radio';

describe('LlmRadioGroup', () => {
  it('renders children', () => {
    render(
      <LlmRadioGroup name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
      </LlmRadioGroup>
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  // @behavior role
  it('has role="radiogroup"', () => {
    render(
      <LlmRadioGroup name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
      </LlmRadioGroup>
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  // @behavior checks-matching-value
  it('checks the radio matching value', () => {
    render(
      <LlmRadioGroup value="pro" name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
      </LlmRadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  // @behavior value-change
  it('calls onValueChange when a radio is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmRadioGroup value="free" onValueChange={onChange} name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
      </LlmRadioGroup>
    );
    await user.click(screen.getByLabelText('Pro'));
    expect(onChange).toHaveBeenCalledWith('pro');
  });

  // @behavior keyboard-nav
  it('ArrowDown selects the next radio', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmRadioGroup value="free" onValueChange={onChange} name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    );
    screen.getByLabelText('Free').focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('pro');
  });

  it('ArrowUp wraps from the first radio to the last', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmRadioGroup value="free" onValueChange={onChange} name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    );
    screen.getByLabelText('Free').focus();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('enterprise');
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(
      <LlmRadioGroup disabled name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
      </LlmRadioGroup>
    );
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('does not call onValueChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmRadioGroup value="free" onValueChange={onChange} disabled name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
      </LlmRadioGroup>
    );
    await user.click(screen.getByLabelText('Pro'));
    expect(onChange).not.toHaveBeenCalled();
  });

  // @behavior invalid
  it('applies is-invalid class when invalid', () => {
    const { container } = render(
      <LlmRadioGroup invalid name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
      </LlmRadioGroup>
    );
    expect(container.firstChild).toHaveClass('is-invalid');
  });

  // @behavior errors
  it('shows error messages when invalid and errors provided', () => {
    render(
      <LlmRadioGroup invalid errors={['Please select a plan']} name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
      </LlmRadioGroup>
    );
    expect(screen.getByText('Please select a plan')).toBeInTheDocument();
  });
});

describe('LlmRadio', () => {
  it('renders with label text', () => {
    render(
      <LlmRadioGroup name="plan">
        <LlmRadio radioValue="free">Free plan</LlmRadio>
      </LlmRadioGroup>
    );
    expect(screen.getByText('Free plan')).toBeInTheDocument();
  });

  it('is disabled when individual disabled prop is set', () => {
    render(
      <LlmRadioGroup name="plan">
        <LlmRadio radioValue="free" disabled>
          Free
        </LlmRadio>
      </LlmRadioGroup>
    );
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('propagates name from group', () => {
    render(
      <LlmRadioGroup name="my-group">
        <LlmRadio radioValue="a">A</LlmRadio>
        <LlmRadio radioValue="b">B</LlmRadio>
      </LlmRadioGroup>
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toHaveAttribute('name', 'my-group'));
  });
});
