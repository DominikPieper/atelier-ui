import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlRadioGroup } from './atl-radio-group';
import { AtlRadio } from '../radio/atl-radio';
import { covers } from '../../testing/behavior';

describe('AtlRadioGroup', () => {
  describe('accessible name', () => {
    covers('radio-group', 'accessible-name')('is named by aria-label', () => {
      render(
        <AtlRadioGroup aria-label="Plan size">
          <AtlRadio radioValue="a">A</AtlRadio>
        </AtlRadioGroup>,
      );
      expect(
        screen.getByRole('radiogroup', { name: 'Plan size' }),
      ).toBeInTheDocument();
    });

    it('is named by aria-labelledby', () => {
      render(
        <>
          <span id="cap">Plan size</span>
          <AtlRadioGroup aria-labelledby="cap">
            <AtlRadio radioValue="a">A</AtlRadio>
          </AtlRadioGroup>
        </>,
      );
      expect(
        screen.getByRole('radiogroup', { name: 'Plan size' }),
      ).toBeInTheDocument();
    });

    it('requires a name at the type level', () => {
      // The discriminated union (as for AtlButton) rejects an unnamed group at
      // consumer build time; this line only compiles with the directive below
      // if the error exists.
      // @ts-expect-error — neither aria-label nor aria-labelledby
      const unnamed = <AtlRadioGroup name="plan" />;
      expect(unnamed).toBeTruthy();
    });
  });

  it('renders children', () => {
    render(
      <AtlRadioGroup aria-label="Plan" name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
      </AtlRadioGroup>,
    );
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  covers('radio-group', 'role')('has role="radiogroup"', () => {
    render(
      <AtlRadioGroup aria-label="Plan" name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
      </AtlRadioGroup>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  covers('radio-group', 'checks-matching-value')(
    'checks the radio matching value',
    () => {
      render(
        <AtlRadioGroup aria-label="Plan" value="pro" name="plan">
          <AtlRadio radioValue="free">Free</AtlRadio>
          <AtlRadio radioValue="pro">Pro</AtlRadio>
        </AtlRadioGroup>,
      );
      const radios = screen.getAllByRole('radio');
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    },
  );

  covers('radio-group', 'value-change')(
    'calls onValueChange when a radio is selected',
    async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <AtlRadioGroup
          aria-label="Plan"
          value="free"
          onValueChange={onChange}
          name="plan"
        >
          <AtlRadio radioValue="free">Free</AtlRadio>
          <AtlRadio radioValue="pro">Pro</AtlRadio>
        </AtlRadioGroup>,
      );
      await user.click(screen.getByLabelText('Pro'));
      expect(onChange).toHaveBeenCalledWith('pro');
    },
  );

  covers('radio-group', 'keyboard-nav')(
    'ArrowDown selects the next radio',
    async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <AtlRadioGroup
          aria-label="Plan"
          value="free"
          onValueChange={onChange}
          name="plan"
        >
          <AtlRadio radioValue="free">Free</AtlRadio>
          <AtlRadio radioValue="pro">Pro</AtlRadio>
          <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
        </AtlRadioGroup>,
      );
      screen.getByLabelText('Free').focus();
      await user.keyboard('{ArrowDown}');
      expect(onChange).toHaveBeenLastCalledWith('pro');
    },
  );

  it('ArrowUp wraps from the first radio to the last', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlRadioGroup
        aria-label="Plan"
        value="free"
        onValueChange={onChange}
        name="plan"
      >
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
        <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
      </AtlRadioGroup>,
    );
    screen.getByLabelText('Free').focus();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenLastCalledWith('enterprise');
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(
      <AtlRadioGroup aria-label="Plan" disabled name="plan">
        <AtlRadio radioValue="free">Free</AtlRadio>
      </AtlRadioGroup>,
    );
    expect(container.firstChild).toHaveClass('is-disabled');
  });

  it('does not call onValueChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlRadioGroup
        aria-label="Plan"
        value="free"
        onValueChange={onChange}
        disabled
        name="plan"
      >
        <AtlRadio radioValue="free">Free</AtlRadio>
        <AtlRadio radioValue="pro">Pro</AtlRadio>
      </AtlRadioGroup>,
    );
    await user.click(screen.getByLabelText('Pro'));
    expect(onChange).not.toHaveBeenCalled();
  });

  covers('radio-group', 'invalid')(
    'applies is-invalid class when invalid',
    () => {
      const { container } = render(
        <AtlRadioGroup aria-label="Plan" invalid name="plan">
          <AtlRadio radioValue="free">Free</AtlRadio>
        </AtlRadioGroup>,
      );
      expect(container.firstChild).toHaveClass('is-invalid');
    },
  );

  covers('radio-group', 'errors')(
    'shows error messages when invalid and errors provided',
    () => {
      render(
        <AtlRadioGroup
          aria-label="Plan"
          invalid
          errors={['Please select a plan']}
          name="plan"
        >
          <AtlRadio radioValue="free">Free</AtlRadio>
        </AtlRadioGroup>,
      );
      expect(screen.getByText('Please select a plan')).toBeInTheDocument();
    },
  );
});

describe('AtlRadio', () => {
  it('renders with label text', () => {
    render(
      <AtlRadioGroup aria-label="Plan" name="plan">
        <AtlRadio radioValue="free">Free plan</AtlRadio>
      </AtlRadioGroup>,
    );
    expect(screen.getByText('Free plan')).toBeInTheDocument();
  });

  it('is disabled when individual disabled prop is set', () => {
    render(
      <AtlRadioGroup aria-label="Plan" name="plan">
        <AtlRadio radioValue="free" disabled>
          Free
        </AtlRadio>
      </AtlRadioGroup>,
    );
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('propagates name from group', () => {
    render(
      <AtlRadioGroup aria-label="Plan" name="my-group">
        <AtlRadio radioValue="a">A</AtlRadio>
        <AtlRadio radioValue="b">B</AtlRadio>
      </AtlRadioGroup>,
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toHaveAttribute('name', 'my-group'));
  });
});
