import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { AtlComboboxOption, AtlComboboxSpec, AtlErrorItem } from '../spec';
import '@atelier-ui/styles/combobox/atl-combobox.css';
import { AtlIcon } from '../icon/atl-icon';
import { errorMessage } from '../error-message';

export type { AtlComboboxOption };

export interface AtlComboboxProps extends AtlComboboxSpec {
  /**
   * The selected option's `value`. Controlled: pair it with `onValueChange`.
   */
  value?: string;
  /**
   * Callback fired with the chosen option's `value` when the user selects an option.
   */
  onValueChange?: (value: string) => void;
  /**
   * Whether the combobox is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the combobox has validation errors.
   */
  invalid?: boolean;
  /**
   * Whether the combobox is required.
   */
  required?: boolean;
  /**
   * The input's name attribute, used for form submission.
   */
  name?: string;
  /**
   * Whether the value can be read but not changed. Enforced by the component: typing, opening the panel and selecting an option are all blocked.
   */
  readonly?: boolean;
  /**
   * Options to display and filter. Each option is `{ value, label, disabled? }`.
   */
  options?: AtlComboboxOption[];
  /**
   * Placeholder text for the input.
   */
  placeholder?: string;
  /**
   * Array of error messages to display.
   */
  errors?: ReadonlyArray<string | AtlErrorItem>;
}

/**
 * Next enabled option from `from` in `step` direction (1 or -1), wrapping.
 * Disabled options are skipped; with none enabled the index is unchanged.
 */
function nextEnabledIndex(
  options: readonly { disabled?: boolean }[],
  from: number,
  step: 1 | -1,
): number {
  const len = options.length;
  // From "nothing active" (-1), ArrowUp starts at the end, not before it.
  const start = from < 0 && step === -1 ? 0 : from;
  for (let n = 1; n <= len; n++) {
    const i = (((start + step * n) % len) + len) % len;
    if (!options[i].disabled) return i;
  }
  return from;
}

/**
 * Filterable autocomplete combobox. Accepts an `options` array and emits the
 * selected option's `value`. The user types to narrow the list; selecting an
 * option commits the value and displays its label.
 *
 * Usage:
 * ```tsx
 * <AtlCombobox
 *   value={country}
 *   onValueChange={setCountry}
 *   options={countryOptions}
 *   placeholder="Search country…"
 * />
 * ```
 */
export function AtlCombobox({
  value = '',
  onValueChange,
  options = [],
  placeholder = '',
  disabled = false,
  readonly = false,
  invalid = false,
  required = false,
  name,
  errors = [],
}: AtlComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputId = useId();
  const panelId = useId();
  const errorsId = `${useId()}-errors`;

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const displayValue = isOpen ? query : selectedLabel;

  // Outside-click closes panel
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery(selectedLabel);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, selectedLabel]);

  function open() {
    if (disabled || readonly) return;
    setQuery(selectedLabel);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectOption(option: AtlComboboxOption) {
    if (option.disabled || disabled || readonly) return;
    onValueChange?.(option.value);
    setQuery(option.label);
    close();
    inputRef.current?.focus();
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    setActiveIndex(-1);
    if (q === '') onValueChange?.('');
    if (!isOpen) open();
  }

  function handleFocus() {
    open();
  }

  function handleBlur() {
    setQuery(selectedLabel);
  }

  function handleKeydown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          open();
          return;
        }
        setActiveIndex((i) => nextEnabledIndex(filteredOptions, i, 1));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) {
          open();
          return;
        }
        setActiveIndex((i) => nextEnabledIndex(filteredOptions, i, -1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (
          isOpen &&
          activeIndex >= 0 &&
          activeIndex < filteredOptions.length
        ) {
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setQuery(selectedLabel);
        close();
        break;
      }
      case 'Tab': {
        close();
        break;
      }
    }
  }

  const classes = [
    'atl-combobox',
    isOpen && 'is-open',
    disabled && 'is-disabled',
    readonly && 'is-readonly',
    invalid && 'is-invalid',
  ]
    .filter(Boolean)
    .join(' ');

  const activeOptionId =
    activeIndex >= 0 ? `${panelId}-option-${activeIndex}` : undefined;

  return (
    <div className={classes} ref={containerRef}>
      <div className="atl-combobox-wrapper">
        <input
          ref={inputRef}
          className="atl-combobox-input"
          type="text"
          autoComplete="off"
          role="combobox"
          id={inputId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-invalid={invalid || undefined}
          aria-describedby={errors.length > 0 ? errorsId : undefined}
          disabled={disabled}
          readOnly={readonly}
          required={required}
          name={name}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeydown}
        />
        {invalid && (
          <AtlIcon name="danger" size="sm" className="invalid-icon" />
        )}
        <span className="atl-combobox-icon" aria-hidden="true">
          <AtlIcon name="chevron-down" size="sm" />
        </span>
      </div>

      {isOpen && (
        <ul
          id={panelId}
          className="atl-combobox-panel"
          role="listbox"
          aria-labelledby={inputId}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, i) => (
              <li
                key={option.value}
                id={`${panelId}-option-${i}`}
                role="option"
                className={[
                  'atl-combobox-option',
                  activeIndex === i && 'is-active',
                  option.value === value && 'is-selected',
                  option.disabled && 'is-disabled',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-selected={option.value === value}
                aria-disabled={option.disabled || undefined}
                onMouseDown={() => selectOption(option)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <AtlIcon
                    name="check"
                    size="sm"
                    className="atl-combobox-check"
                  />
                )}
              </li>
            ))
          ) : (
            <li
              className="atl-combobox-no-results"
              role="option"
              aria-selected={false}
              aria-disabled="true"
            >
              No results found.
            </li>
          )}
        </ul>
      )}

      {errors.length > 0 && (
        <div className="atl-combobox-errors" id={errorsId} aria-live="polite">
          {errors.map((e, i) => (
            <p key={i} className="atl-combobox-error-message">
              {errorMessage(e)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
