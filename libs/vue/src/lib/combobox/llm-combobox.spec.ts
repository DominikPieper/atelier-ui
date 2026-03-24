import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { ref } from 'vue';
import LlmCombobox from './llm-combobox.vue';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape', disabled: true },
];

const Controlled = {
  components: { LlmCombobox },
  props: ['initialValue'],
  setup(props: { initialValue?: string }) {
    const value = ref(props.initialValue ?? '');
    return { value, options: OPTIONS };
  },
  template: `
    <LlmCombobox
      v-model:value="value"
      :options="options"
      placeholder="Search fruit…"
    />
  `,
};

describe('LlmCombobox', () => {
  it('renders an input with role="combobox"', () => {
    const { container } = render(Controlled);
    expect(container.querySelector('input[role="combobox"]')).toBeInTheDocument();
  });

  it('shows placeholder when no value selected', () => {
    render(Controlled);
    expect(screen.getByPlaceholderText('Search fruit…')).toBeInTheDocument();
  });

  it('opens the listbox on focus', async () => {
    const user = userEvent.setup();
    render(Controlled);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('filters options as user types', async () => {
    const user = userEvent.setup();
    render(Controlled);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('an');
    const options = screen.getAllByRole('option');
    expect(options.some((o) => o.textContent?.includes('Banana'))).toBe(true);
    expect(options.every((o) => !o.textContent?.includes('Apple'))).toBe(true);
  });

  it('shows "No results found." when nothing matches', async () => {
    const user = userEvent.setup();
    render(Controlled);
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('zzz');
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('selects an option on click and emits update:value', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmCombobox, {
      props: { value: '', options: OPTIONS, placeholder: 'Search fruit…' },
    });
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Banana'));
    expect(emitted()['update:value']).toEqual([['banana']]);
  });

  it('shows selected label in input after selection', async () => {
    const user = userEvent.setup();
    render(Controlled);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Apple'));
    expect(screen.getByRole('combobox')).toHaveValue('Apple');
  });

  it('closes the panel after selection', async () => {
    const user = userEvent.setup();
    render(Controlled);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Cherry'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('navigates with ArrowDown and selects with Enter', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmCombobox, {
      props: { value: '', options: OPTIONS, placeholder: 'Search fruit…' },
    });
    await user.click(screen.getByRole('combobox'));
    await user.keyboard('{ArrowDown}{Enter}');
    expect(emitted()['update:value']).toEqual([['apple']]);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(Controlled);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('sets aria-expanded=true when open', async () => {
    const user = userEvent.setup();
    render(Controlled);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows preselected label on initial render', () => {
    render(Controlled, { props: { initialValue: 'banana' } });
    expect(screen.getByRole('combobox')).toHaveValue('Banana');
  });

  it('disables input and applies is-disabled class', () => {
    const { container } = render({
      components: { LlmCombobox },
      setup() { return { options: OPTIONS }; },
      template: `<LlmCombobox :options="options" :disabled="true" />`,
    });
    expect(container.querySelector('.llm-combobox')).toHaveClass('is-disabled');
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('applies is-invalid class when invalid', () => {
    const { container } = render({
      components: { LlmCombobox },
      setup() { return { options: OPTIONS }; },
      template: `<LlmCombobox :options="options" :invalid="true" />`,
    });
    expect(container.querySelector('.llm-combobox')).toHaveClass('is-invalid');
  });

  it('shows error messages when invalid and errors provided', () => {
    render({
      components: { LlmCombobox },
      setup() { return { options: OPTIONS }; },
      template: `<LlmCombobox :options="options" :invalid="true" :errors="['Please select a fruit']" />`,
    });
    expect(screen.getByText('Please select a fruit')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not select a disabled option', async () => {
    const user = userEvent.setup();
    const { emitted } = render(Controlled);
    await user.click(screen.getByRole('combobox'));
    const grapeOption = screen.getAllByRole('option').find((o) => o.textContent?.includes('Grape'))!;
    await user.click(grapeOption);
    // Grape is disabled — no update:value should be emitted for 'grape'
    const updates = (emitted()['update:value'] ?? []) as string[][];
    expect(updates.every(([v]) => v !== 'grape')).toBe(true);
  });
});
