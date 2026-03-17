import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmOption } from './llm-option';
import { LlmSelect } from './llm-select';

const SELECT_TEMPLATE = `
  <llm-select [(value)]="value" placeholder="Choose one">
    <llm-option optionValue="a">Option A</llm-option>
    <llm-option optionValue="b">Option B</llm-option>
    <llm-option optionValue="c">Option C</llm-option>
  </llm-select>
`;

// Polyfill popover API for jsdom
function polyfillPopover() {
  if (!HTMLElement.prototype.hasOwnProperty('showPopover')) {
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

describe('LlmSelect', () => {
  it('renders with role="combobox"', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelector('[role="combobox"]')).toBeInTheDocument();
  });

  it('renders a trigger button', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelector('button.trigger')).toBeInTheDocument();
  });

  it('shows placeholder when no value is selected', async () => {
    await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: '' },
    });
    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  it('shows selected option label when value is set', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: 'b' },
    });
    expect(container.querySelector('.trigger-text')?.textContent?.trim()).toBe('Option B');
  });

  it('renders a listbox panel', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelector('.panel[role="listbox"]')).toBeInTheDocument();
  });

  it('renders options with role="option"', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: '' },
    });
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(3);
  });

  it('marks selected option with aria-selected', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: 'a' },
    });
    const options = container.querySelectorAll('[role="option"]');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('applies is-selected class to the selected option', async () => {
    const { container } = await render(SELECT_TEMPLATE, {
      imports: [LlmSelect, LlmOption],
      componentProperties: { value: 'c' },
    });
    const options = container.querySelectorAll('[role="option"]');
    expect(options[2]).toHaveClass('is-selected');
    expect(options[0]).not.toHaveClass('is-selected');
  });

  describe('disabled state', () => {
    it('disables the trigger button when disabled', async () => {
      const { container } = await render(
        `<llm-select [disabled]="true" placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('button.trigger')).toBeDisabled();
    });

    it('applies is-disabled class to host when disabled', async () => {
      const { container } = await render(
        `<llm-select [disabled]="true" placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('llm-select')).toHaveClass('is-disabled');
    });
  });

  describe('disabled option', () => {
    it('marks disabled option with aria-disabled', async () => {
      const { container } = await render(
        `<llm-select placeholder="Choose">
          <llm-option optionValue="a" [disabled]="true">A</llm-option>
          <llm-option optionValue="b">B</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      const options = container.querySelectorAll('[role="option"]');
      expect(options[0]).toHaveAttribute('aria-disabled', 'true');
      expect(options[1]).not.toHaveAttribute('aria-disabled');
    });

    it('applies is-disabled class to disabled option', async () => {
      const { container } = await render(
        `<llm-select placeholder="Choose">
          <llm-option optionValue="a" [disabled]="true">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('[role="option"]')).toHaveClass('is-disabled');
    });
  });

  describe('invalid state', () => {
    it('sets aria-invalid on the trigger when invalid', async () => {
      const { container } = await render(
        `<llm-select [invalid]="true" placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('button.trigger')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render(
        `<llm-select placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('button.trigger')).not.toHaveAttribute('aria-invalid');
    });

    it('applies is-invalid class to host when invalid', async () => {
      const { container } = await render(
        `<llm-select [invalid]="true" placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('llm-select')).toHaveClass('is-invalid');
    });
  });

  describe('error display', () => {
    it('does not show errors when not touched', async () => {
      const { container } = await render(
        `<llm-select [invalid]="true" [errors]="errors" placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        {
          imports: [LlmSelect, LlmOption],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Please select an option' }],
          },
        }
      );
      expect(container.querySelector('.errors')).not.toBeInTheDocument();
    });

    it('shows errors when touched and invalid', async () => {
      await render(
        `<llm-select [invalid]="true" [errors]="errors" [touched]="true" placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        {
          imports: [LlmSelect, LlmOption],
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
        `<llm-select [touched]="true" placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('llm-select')).toHaveClass('is-touched');
    });

    it('does not have is-touched class by default', async () => {
      const { container } = await render(
        `<llm-select placeholder="Choose">
          <llm-option optionValue="a">A</llm-option>
        </llm-select>`,
        { imports: [LlmSelect, LlmOption] }
      );
      expect(container.querySelector('llm-select')).not.toHaveClass('is-touched');
    });
  });

  describe('open/close', () => {
    it('applies is-open class when opened via trigger click', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [LlmSelect, LlmOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      expect(container.querySelector('llm-select')).toHaveClass('is-open');
    });

    it('removes is-open class when closed via second trigger click', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [LlmSelect, LlmOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      await user.click(trigger);
      expect(container.querySelector('llm-select')).not.toHaveClass('is-open');
    });

    it('selects an option when clicked and closes the panel', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [LlmSelect, LlmOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      const options = container.querySelectorAll('[role="option"]');
      await user.click(options[1]);
      expect(container.querySelector('llm-select')).not.toHaveClass('is-open');
    });

    it('closes panel on Escape key', async () => {
      const user = userEvent.setup();
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [LlmSelect, LlmOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      await user.keyboard('{Escape}');
      expect(container.querySelector('llm-select')).not.toHaveClass('is-open');
    });
  });

  describe('ARIA attributes', () => {
    it('sets aria-haspopup="listbox" on trigger', async () => {
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [LlmSelect, LlmOption],
        componentProperties: { value: '' },
      });
      expect(container.querySelector('button.trigger')).toHaveAttribute(
        'aria-haspopup',
        'listbox'
      );
    });

    it('sets aria-expanded="false" when closed', async () => {
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [LlmSelect, LlmOption],
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
        imports: [LlmSelect, LlmOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-controls pointing to the panel', async () => {
      const { container } = await render(SELECT_TEMPLATE, {
        imports: [LlmSelect, LlmOption],
        componentProperties: { value: '' },
      });
      const trigger = container.querySelector('button.trigger') as HTMLButtonElement;
      const panelId = trigger.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(container.querySelector(`#${panelId}`)).toBeInTheDocument();
    });
  });
});
