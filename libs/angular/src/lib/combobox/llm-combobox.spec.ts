import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmCombobox } from './llm-combobox';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape', disabled: true },
];

const TEMPLATE = `
  <llm-combobox [(value)]="value" [options]="options" placeholder="Search fruit…" />
`;

// Polyfill Popover API for jsdom
function polyfillPopover(): void {
  if (!Object.prototype.hasOwnProperty.call(HTMLElement.prototype, 'showPopover')) {
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      value() { this.setAttribute('popover-open', ''); },
    });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
      configurable: true,
      value() { this.removeAttribute('popover-open'); },
    });
  }
}

beforeAll(() => polyfillPopover());

function getInput(container: Element): HTMLInputElement {
  const input = container.querySelector('input[type="text"]');
  if (!input) {
    throw new Error('Input not found');
  }
  return input as HTMLInputElement;
}

describe('LlmCombobox', () => {
  it('renders an input with role="combobox"', async () => {
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    expect(container.querySelector('input[role="combobox"]')).toBeInTheDocument();
  });

  it('shows placeholder on the input', async () => {
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    expect(getInput(container).placeholder).toBe('Search fruit…');
  });

  it('opens the listbox on focus (adds is-open class)', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    await user.click(getInput(container));
    expect(container.querySelector('llm-combobox')).toHaveClass('is-open');
  });

  it('renders options in the listbox', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    await user.click(getInput(container));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });

  it('filters options as user types', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    await user.click(getInput(container));
    await user.keyboard('an');
    const options = screen.getAllByRole('option');
    expect(options.some((o) => o.textContent.includes('Banana'))).toBe(true);
    expect(options.every((o) => !o.textContent.includes('Apple'))).toBe(true);
  });

  it('shows "No results found." when nothing matches', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    await user.click(getInput(container));
    await user.keyboard('zzz');
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('selects an option on click and shows its label in the input', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    const input = getInput(container);
    await user.click(input);
    await user.click(screen.getByText('Banana'));
    expect(input.value).toBe('Banana');
  });

  it('closes the panel (removes is-open class) after selection', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    await user.click(getInput(container));
    await user.click(screen.getByText('Cherry'));
    expect(container.querySelector('llm-combobox')).not.toHaveClass('is-open');
  });

  it('navigates options with ArrowDown and selects with Enter', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    const input = getInput(container);
    await user.click(input);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(input.value).toBe('Apple');
  });

  it('closes on Escape (removes is-open class)', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    await user.click(getInput(container));
    expect(container.querySelector('llm-combobox')).toHaveClass('is-open');
    await user.keyboard('{Escape}');
    expect(container.querySelector('llm-combobox')).not.toHaveClass('is-open');
  });

  it('sets aria-expanded=true when open', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    const input = getInput(container);
    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies is-disabled class and disables input when disabled', async () => {
    const { container } = await render(
      `<llm-combobox [options]="options" [disabled]="true" />`,
      { imports: [LlmCombobox], componentProperties: { options: OPTIONS } },
    );
    expect(container.querySelector('llm-combobox')).toHaveClass('is-disabled');
    expect(getInput(container)).toBeDisabled();
  });

  it('applies is-invalid class when invalid', async () => {
    const { container } = await render(
      `<llm-combobox [options]="options" [invalid]="true" />`,
      { imports: [LlmCombobox], componentProperties: { options: OPTIONS } },
    );
    expect(container.querySelector('llm-combobox')).toHaveClass('is-invalid');
  });

  it('does not select a disabled option', async () => {
    const user = userEvent.setup();
    const { container } = await render(TEMPLATE, {
      imports: [LlmCombobox],
      componentProperties: { value: '', options: OPTIONS },
    });
    const input = getInput(container);
    await user.click(input);
    const grapeOption = screen
      .getAllByRole('option')
      .find((o) => o.textContent.includes('Grape'));
    if (!grapeOption) {
      throw new Error('Grape option not found');
    }
    await user.click(grapeOption);
    expect(input.value).toBe(''); // disabled — input stays empty
  });
});
