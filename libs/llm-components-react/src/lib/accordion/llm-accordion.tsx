import {
  createContext,
  useContext,
  useState,
  useRef,
  useId,
  ReactNode,
  HTMLAttributes,
  KeyboardEvent,
} from 'react';
import './llm-accordion.css';

interface AccordionGroupContextValue {
  multi: boolean;
  openItems: Set<string>;
  toggleItem: (id: string) => void;
  registerItem: (id: string, ref: React.RefObject<HTMLButtonElement | null>, disabled: boolean) => void;
  unregisterItem: (id: string) => void;
  handleKeydown: (e: KeyboardEvent, id: string) => void;
}

const AccordionGroupContext = createContext<AccordionGroupContextValue>({
  multi: false,
  openItems: new Set(),
  toggleItem: () => {},
  registerItem: () => {},
  unregisterItem: () => {},
  handleKeydown: () => {},
});

export interface LlmAccordionGroupProps extends HTMLAttributes<HTMLDivElement> {
  multi?: boolean;
  variant?: 'default' | 'bordered' | 'separated';
  children?: ReactNode;
}

export function LlmAccordionGroup({
  multi = false,
  variant = 'default',
  children,
  className,
  ...rest
}: LlmAccordionGroupProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const itemsRef = useRef<{ id: string; triggerRef: React.RefObject<HTMLButtonElement | null>; disabled: boolean }[]>([]);

  const classes = ['llm-accordion-group', `variant-${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multi) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  const registerItem = (id: string, ref: React.RefObject<HTMLButtonElement | null>, disabled: boolean) => {
    itemsRef.current = [...itemsRef.current.filter((i) => i.id !== id), { id, triggerRef: ref, disabled }];
  };

  const unregisterItem = (id: string) => {
    itemsRef.current = itemsRef.current.filter((i) => i.id !== id);
  };

  const handleKeydown = (e: KeyboardEvent, currentId: string) => {
    const enabled = itemsRef.current.filter((i) => !i.disabled);
    if (enabled.length === 0) return;

    const pos = enabled.findIndex((i) => i.id === currentId);
    const n = enabled.length;
    let target: (typeof enabled)[0] | null = null;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      target = enabled[(pos + 1) % n];
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      target = enabled[(pos - 1 + n) % n];
    } else if (e.key === 'Home') {
      e.preventDefault();
      target = enabled[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      target = enabled[n - 1];
    }

    target?.triggerRef.current?.focus();
  };

  return (
    <AccordionGroupContext.Provider
      value={{ multi, openItems, toggleItem, registerItem, unregisterItem, handleKeydown }}
    >
      <div className={classes} role="presentation" {...rest}>
        {children}
      </div>
    </AccordionGroupContext.Provider>
  );
}

export interface LlmAccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function LlmAccordionItem({
  expanded: externalExpanded,
  onExpandedChange,
  disabled = false,
  children,
  className,
  ...rest
}: LlmAccordionItemProps) {
  const ctx = useContext(AccordionGroupContext);
  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Register/unregister with parent
  // Using a layout-effect-like pattern via ref callback would be ideal,
  // but for simplicity we register inline (idempotent due to filter+push)
  ctx.registerItem(id, triggerRef, disabled);

  const isControlled = externalExpanded !== undefined;
  const isExpanded = isControlled ? externalExpanded : ctx.openItems.has(id);

  const toggle = () => {
    if (disabled) return;
    const next = !isExpanded;
    if (!isControlled) ctx.toggleItem(id);
    onExpandedChange?.(next);
  };

  const classes = [
    'llm-accordion-item',
    isExpanded && 'is-expanded',
    disabled && 'is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Separate header child from body children
  const childArray = Array.isArray(children) ? children : [children];
  const headerNode = childArray.find(
    (c): c is React.ReactElement =>
      typeof c === 'object' &&
      c !== null &&
      'type' in (c as object) &&
      (c as React.ReactElement).type === LlmAccordionHeader
  );
  const bodyNodes = childArray.filter((c) => c !== headerNode);

  return (
    <div className={classes} {...rest}>
      <h3 className="accordion-heading">
        <button
          ref={triggerRef}
          type="button"
          id={triggerId}
          className={['accordion-trigger', disabled && 'is-disabled']
            .filter(Boolean)
            .join(' ')}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          onClick={toggle}
          onKeyDown={(e) => ctx.handleKeydown(e, id)}
        >
          {headerNode}
          <svg
            className={['chevron', isExpanded && 'is-expanded']
              .filter(Boolean)
              .join(' ')}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </h3>
      <div
        className={['accordion-panel-wrapper', isExpanded && 'is-expanded']
          .filter(Boolean)
          .join(' ')}
      >
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="accordion-panel"
        >
          {bodyNodes}
        </div>
      </div>
    </div>
  );
}

export function LlmAccordionHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { children?: ReactNode }) {
  return (
    <span
      className={['accordion-header-content', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
