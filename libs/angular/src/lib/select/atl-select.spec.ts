import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlOption } from './atl-option';
import { AtlSelect } from './atl-select';

const SELECT_TEMPLATE = `
  <atl-select [(value)]="value" placeholder="Choose one">
    <atl-option optionValue="a">Option A</atl-option>
    <atl-option optionValue="b">Option B</atl-option>
    <atl-option optionValue="c">Option C</atl-option>
  </atl-select>
`;

// Polyfill popover API for jsdom
function polyfillPopover(): void {
  if (!Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'showPopover')) {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      value() {
        this.setAttribute('popover-open', '');
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
      configurable: true,
      value() {
        this.removeAttribute('popover-open');
      },
    });
  }
}

beforeAll(() => {
  polyfillPopover();
});

describe('AtlSelect', () => {
  covers('select', 'render-element')('renders with role="combobox"', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelector('[role="combobox"]')).toBeInTheDocument();
  });

  it('renders a trigger button', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelector('button.trigger')).toBeInTheDocument();
  });

  covers('select', 'placeholder')('shows placeholder when no value is selected', async () => {
    await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: '' },
    });
    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  it('shows selected option label when value is set', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: 'b' },
    });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    expect(container.querySelector('.trigger-text')?.textContent?.trim()).toBe('Option B');
  });

  it('renders a listbox panel', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelector('.panel[role="listbox"]')).toBeInTheDocument();
  });

  it('renders options with role="option"', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(3);
  });

  it('marks selected option with aria-selected', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: 'a' },
    });
    const options = container.querySelectorAll('[role="option"]');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('applies is-selected class to the selected option', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [AtlSelect, AtlOption],
      componentProperties: { value: 'c' },
    });
    const options = container.querySelectorAll('[role="option"]');
    expect(options[2]).toHaveClass('is-selected');
    expect(options[0]).not.toHaveClass('is-selected');
  });

  describe('disabled state', () => {
    covers('select', 'disabled')('disables the trigger button when disabled', async () => {
      const { container } = await render(
        `<atl-select [disabled]="true" placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('button.trigger')).toBeDisabled();
    });

    it('applies is-disabled class to host when disabled', async () => {
      const { container } = await render(
        `<atl-select [disabled]="true" placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('atl-select')).toHaveClass('is-disabled');
    });
  });

  describe('disabled option', () => {
    it('marks disabled option with aria-disabled', async () => {
      const { container } = await render(
        `<atl-select placeholder="Choose">
          <atl-option optionValue="a" [disabled]="true">A</atl-option>
          <atl-option optionValue="b">B</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      const options = container.querySelectorAll('[role="option"]');
      expect(options[0]).toHaveAttribute('aria-disabled', 'true');
      expect(options[1]).not.toHaveAttribute('aria-disabled');
    });

    it('applies is-disabled class to disabled option', async () => {
      const { container } = await render(
        `<atl-select placeholder="Choose">
          <atl-option optionValue="a" [disabled]="true">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('[role="option"]')).toHaveClass('is-disabled');
    });
  });

  describe('invalid state', () => {
    covers('select', 'invalid')('sets aria-invalid on the trigger when invalid', async () => {
      const { container } = await render(
        `<atl-select [invalid]="true" placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('button.trigger')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render(
        `<atl-select placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('button.trigger')).not.toHaveAttribute('aria-invalid');
    });

    it('applies is-invalid class to host when invalid', async () => {
      const { container } = await render(
        `<atl-select [invalid]="true" placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('atl-select')).toHaveClass('is-invalid');
    });
  });

  describe('error display', () => {
    it('does not show errors when not touched', async () => {
      const { container } = await render(
        `<atl-select [invalid]="true" [errors]="errors" placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        {
          imports: [AtlSelect, AtlOption],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Please select an option' }],
          },
        }
      );
      expect(container.querySelector('.errors')).not.toBeInTheDocument();
    });

    covers('select', 'error-messages')('shows errors when touched and invalid', async () => {
      await render(
        `<atl-select [invalid]="true" [errors]="errors" [touched]="true" placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        {
          imports: [AtlSelect, AtlOption],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Please select an option' }],
          },
        }
      );
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
    });
  });

  describe('touched state', () => {
    it('applies is-touched class when touched=true', async () => {
      const { container } = await render(
        `<atl-select [touched]="true" placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('atl-select')).toHaveClass('is-touched');
    });

    it('does not have is-touched class by default', async () => {
      const { container } = await render(
        `<atl-select placeholder="Choose">
          <atl-option optionValue="a">A</atl-option>
        </atl-select>`,
        { imports: [AtlSelect, AtlOption] }
      );
      expect(container.querySelector('atl-select')).not.toHaveClass('is-touched');
    });
  });

  describe('open/close', () => {
    it('applies is-open class when opened via trigger click', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      expect(container.querySelector('atl-select')).toHaveClass('is-open');
    });

    it('removes is-open class when closed via second trigger click', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      await user.click(trigger);
      expect(container.querySelector('atl-select')).not.toHaveClass('is-open');
    });

    covers('select', 'value-change')('selects an option when clicked and closes the panel', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      const options = container.querySelectorAll('[role="option"]');
      await user.click(options[1]);
      expect(container.querySelector('atl-select')).not.toHaveClass('is-open');
    });

    it('closes panel on Escape key', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      await user.keyboard('{Escape}');
      expect(container.querySelector('atl-select')).not.toHaveClass('is-open');
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-haspopup="listbox" on trigger', async () => {
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      expect(container.querySelector('button.trigger')).toHaveAttribute(
        'aria-haspopup',
        'listbox'
      );
    });

    it('sets aria-expanded="false" when closed', async () => {
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      expect(container.querySelector('button.trigger')).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });

    it('sets aria-expanded="true" when open', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-controls pointing to the panel', async () => {
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [AtlSelect, AtlOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      const panelId = trigger.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(container.querySelector(`#${panelId}`)).toBeInTheDocument();
    });
  });
});
