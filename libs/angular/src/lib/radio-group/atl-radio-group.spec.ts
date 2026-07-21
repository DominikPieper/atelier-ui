import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlRadio } from '../radio/atl-radio';
import { AtlRadioGroup } from './atl-radio-group';

const GROUP_TEMPLATE = `
  <atl-radio-group [(value)]="value" name="size">
    <atl-radio radioValue="sm">Small</atl-radio>
    <atl-radio radioValue="md">Medium</atl-radio>
    <atl-radio radioValue="lg">Large</atl-radio>
  </atl-radio-group>
`;

describe('AtlRadioGroup', () => {
  covers('radio-group', 'role')('renders with role="radiogroup"', async () => {
    const { container } = await render(GROUP_TEMPLATE, {
      imports: [AtlRadioGroup, AtlRadio],
      componentProperties: { value: 'sm' },
    });
    expect(container.querySelector('[role="radiogroup"]')).toBeInTheDocument();
  });

  it('renders child radio inputs', async () => {
    const { container } = await render(GROUP_TEMPLATE, {
      imports: [AtlRadioGroup, AtlRadio],
      componentProperties: { value: '' },
    });
    expect(container.querySelectorAll('input[type="radio"]')).toHaveLength(3);
  });

  covers('radio-group', 'checks-matching-value')('sets the checked radio based on value', async () => {
    const { container } = await render(GROUP_TEMPLATE, {
      imports: [AtlRadioGroup, AtlRadio],
      componentProperties: { value: 'md' },
    });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    expect(inputs[0]).not.toBeChecked();
    expect(inputs[1]).toBeChecked();
    expect(inputs[2]).not.toBeChecked();
  });

  it('propagates name attribute to all radio inputs', async () => {
    const { container } = await render(GROUP_TEMPLATE, {
      imports: [AtlRadioGroup, AtlRadio],
      componentProperties: { value: '' },
    });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('name', 'size');
    });
  });

  describe('selection', () => {
    covers('radio-group', 'value-change')('updates value when a radio is clicked', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'sm' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      await user.click(inputs[2]);
      expect(inputs[2]).toBeChecked();
    });

    it('unchecks previously selected radio on new selection', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'sm' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      await user.click(inputs[1]);
      expect(inputs[0]).not.toBeChecked();
      expect(inputs[1]).toBeChecked();
    });
  });

  describe('disabled state', () => {
    it('disables all radio inputs when group is disabled', async () => {
      const { container } = await render(
        `<atl-radio-group [disabled]="true" name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
          <atl-radio radioValue="md">Medium</atl-radio>
        </atl-radio-group>`,
        { imports: [AtlRadioGroup, AtlRadio] }
      );
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs.forEach((input) => expect(input).toBeDisabled());
    });

    it('applies is-disabled class to host when disabled', async () => {
      const { container } = await render(
        `<atl-radio-group [disabled]="true" name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
        </atl-radio-group>`,
        { imports: [AtlRadioGroup, AtlRadio] }
      );
      expect(container.querySelector('atl-radio-group')).toHaveClass('is-disabled');
    });
  });

  describe('invalid state', () => {
    covers('radio-group', 'invalid')('sets aria-invalid on the group when invalid', async () => {
      const { container } = await render(
        `<atl-radio-group [invalid]="true" name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
        </atl-radio-group>`,
        { imports: [AtlRadioGroup, AtlRadio] }
      );
      expect(container.querySelector('atl-radio-group')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render(
        `<atl-radio-group name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
        </atl-radio-group>`,
        { imports: [AtlRadioGroup, AtlRadio] }
      );
      expect(container.querySelector('atl-radio-group')).not.toHaveAttribute('aria-invalid');
    });

    it('applies is-invalid class to host', async () => {
      const { container } = await render(
        `<atl-radio-group [invalid]="true" name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
        </atl-radio-group>`,
        { imports: [AtlRadioGroup, AtlRadio] }
      );
      expect(container.querySelector('atl-radio-group')).toHaveClass('is-invalid');
    });
  });

  describe('error display', () => {
    it('does not show errors when not touched', async () => {
      const { container } = await render(
        `<atl-radio-group [invalid]="true" [errors]="errors" name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
        </atl-radio-group>`,
        {
          imports: [AtlRadioGroup, AtlRadio],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Please select an option' }],
          },
        }
      );
      expect(container.querySelector('.errors')).not.toBeInTheDocument();
    });

    covers('radio-group', 'errors')('shows errors when touched and invalid', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<atl-radio-group [invalid]="true" [errors]="errors" name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
        </atl-radio-group>`,
        {
          imports: [AtlRadioGroup, AtlRadio],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Please select an option' }],
          },
        }
      );
      const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
      await user.click(input);
      await user.tab();
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });
  });

  describe('required state', () => {
    it('sets aria-required on the group when required', async () => {
      const { container } = await render(
        `<atl-radio-group [required]="true" name="size">
          <atl-radio radioValue="sm">Small</atl-radio>
        </atl-radio-group>`,
        { imports: [AtlRadioGroup, AtlRadio] }
      );
      expect(container.querySelector('atl-radio-group')).toHaveAttribute(
        'aria-required',
        'true'
      );
    });
  });

  describe('keyboard navigation', () => {
    covers('radio-group', 'keyboard-nav')('moves focus to next radio on ArrowDown', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'sm' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs[0].focus();
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(inputs[1]);
    });

    it('moves focus to previous radio on ArrowUp', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'md' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs[1].focus();
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(inputs[0]);
    });

    it('moves focus to next radio on ArrowRight', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'sm' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs[0].focus();
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(inputs[1]);
    });

    it('moves focus to previous radio on ArrowLeft', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'md' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs[1].focus();
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(inputs[0]);
    });

    it('wraps from last to first on ArrowDown', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'lg' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs[2].focus();
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(inputs[0]);
    });

    it('wraps from first to last on ArrowUp', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'sm' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs[0].focus();
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(inputs[2]);
    });

    it('selects the radio when navigating with arrow keys', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: 'sm' },
      });
      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs[0].focus();
      await user.keyboard('{ArrowDown}');
      expect(inputs[1]).toBeChecked();
    });
  });

  describe('touched state', () => {
    it('marks as touched after blur', async () => {
      const user = userEvent.setup();
      const { container } = await render(GROUP_TEMPLATE, {
        imports: [AtlRadioGroup, AtlRadio],
        componentProperties: { value: '' },
      });
      const input = container.querySelector('input[type="radio"]') as HTMLInputElement;
      await user.click(input);
      await user.tab();
      expect(container.querySelector('atl-radio-group')).toHaveClass('is-touched');
    });
  });
});
