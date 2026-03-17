import { TextareaHTMLAttributes, useRef, useEffect } from 'react';
import './llm-textarea.css';

export interface LlmTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  errors?: string[];
  label?: string;
  autoResize?: boolean;
  readOnly?: boolean;
}

export function LlmTextarea({
  value,
  onChange,
  onValueChange,
  invalid = false,
  errors = [],
  disabled = false,
  readOnly = false,
  required = false,
  label,
  autoResize = false,
  rows = 3,
  className,
  id,
  ...rest
}: LlmTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputId =
    id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const classes = [
    'llm-textarea',
    invalid && 'is-invalid',
    disabled && 'is-disabled',
    readOnly && 'is-readonly',
    autoResize && 'is-auto-resize',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const errorId = inputId ? `${inputId}-errors` : undefined;

  return (
    <div className={classes}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <textarea
        ref={textareaRef}
        id={inputId}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
        aria-describedby={errors.length > 0 ? errorId : undefined}
        {...rest}
      />
      {errors.length > 0 && (
        <div className="errors" id={errorId} aria-live="polite">
          {errors.map((err, i) => (
            <p key={i} className="error-message">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
