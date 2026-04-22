import { useEffect, useMemo, useRef, useState } from 'react';
import type { LlmComboboxOption, LlmComboboxSpec } from '../spec';
import './llm-combobox.css';

export type { LlmComboboxOption };

let nextId = 0;

export interface LlmComboboxProps extends LlmComboboxSpec {
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
 * <LlmCombobox
 *   value={country}
 *   onValueChange={setCountry}
 *   options={countryOptions}
 *   placeholder="Search country…"
 * />
 * ```
 */
export function LlmCombobox({
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
}: LlmComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const ids = useRef({ input: `llm-combobox-input-${nextId}`, panel: `llm-combobox-panel-${nextId++}` });

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Sync display when value changes externally
  useEffect(() => {
    if (!isOpen) {
      setQuery(selectedLabel);
    }
  }, [selectedLabel, isOpen]);

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
    setIsOpen(true);
    setActiveIndex(-1);
  }

  function close() {
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function selectOption(option: LlmComboboxOption) {
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
    'llm-combobox',
    isOpen && 'is-open',
    disabled && 'is-disabled',
    invalid && 'is-invalid',
  ]
    .filter(Boolean)
    .join(' ');

  const activeOptionId =
    activeIndex >= 0 ? `${ids.current.panel}-option-${activeIndex}` : undefined;

  return (
    <div className={classes} ref={containerRef}>
      <div className="llm-combobox-wrapper">
        <input
          ref={inputRef}
          className="llm-combobox-input"
          type="text"
          autoComplete="off"
          role="combobox"
          id={ids.current.input}
          aria-expanded={isOpen}
          aria-controls={ids.current.panel}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          readOnly={readonly}
          required={required}
          name={name}
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeydown}
        />
        <span className="llm-combobox-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {isOpen && (
        <ul
          id={ids.current.panel}
          className="llm-combobox-panel"
          role="listbox"
          aria-labelledby={ids.current.input}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, i) => (
              <li
                key={option.value}
                id={`${ids.current.panel}-option-${i}`}
                role="option"
                className={[
                  'llm-combobox-option',
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
                  <svg className="llm-combobox-check" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            ))
          ) : (
            <li className="llm-combobox-no-results" role="option" aria-selected={false} aria-disabled="true">
              No results found.
            </li>
          )}
        </ul>
      )}

      {invalid && errors.length > 0 && (
        <div className="llm-combobox-errors" role="alert" aria-live="polite">
          {errors.map((e, i) => (
            <p key={i} className="llm-combobox-error-message">{e}</p>
          ))}
        </div>
      )}
    </div>
  );
}
