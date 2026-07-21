import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { AtlComboboxOption, AtlComboboxSpec } from '../spec';
import './atl-combobox.css';

export type { AtlComboboxOption };

export interface AtlComboboxProps extends AtlComboboxSpec {
  value?: string;
  onValueChange?: (value: string) => void;
  errors?: string[];
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
        if (!isOpen) { open(); return; }
        setActiveIndex((i) => (i + 1 >= filteredOptions.length ? 0 : i + 1));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) { open(); return; }
        setActiveIndex((i) => (i - 1 < 0 ? filteredOptions.length - 1 : i - 1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && activeIndex < filteredOptions.length) {
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
        <span className="atl-combobox-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
                  <svg className="atl-combobox-check" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))
          ) : (
            <li className="atl-combobox-no-results" role="option" aria-selected={false} aria-disabled="true">
              No results found.
            </li>
          )}
        </ul>
      )}

      {invalid && errors.length > 0 && (
        <div className="atl-combobox-errors" role="alert" aria-live="polite">
          {errors.map((e, i) => (
            <p key={i} className="atl-combobox-error-message">{e}</p>
          ))}
        </div>
      )}
    </div>
  );
}
