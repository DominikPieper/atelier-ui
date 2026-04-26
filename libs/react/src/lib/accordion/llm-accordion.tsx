import {
  createContext,
  useContext,
  useState,
  useRef,
  useId,
  useLayoutEffect,
  useCallback,
  ReactNode,
  HTMLAttributes,
  KeyboardEvent,
} from 'react';
import type {
  LlmAccordionGroupSpec,
  LlmAccordionItemSpec,
} from '../spec';
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
  toggleItem: () => { /* noop */ },
  registerItem: () => { /* noop */ },
  unregisterItem: () => { /* noop */ },
  handleKeydown: () => { /* noop */ },
});

/**
 * Properties for the LlmAccordionGroup component.
 */
export interface LlmAccordionGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    LlmAccordionGroupSpec {
  /**
   * Whether multiple items can be expanded simultaneously.
   */
  multi?: boolean;
  /**
   * The visual style variant of the accordion.
   */
  variant?: 'default' | 'bordered' | 'separated';
  /**
   * The accordion items to be rendered.
   */
  children?: ReactNode;
}

/**
 * A container component that manages a group of accordion items.
 */
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

  const toggleItem = useCallback((id: string) => {
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
  }, [multi]);

  const registerItem = useCallback((id: string, ref: React.RefObject<HTMLButtonElement | null>, disabled: boolean) => {
    itemsRef.current = [...itemsRef.current.filter((i) => i.id !== id), { id, triggerRef: ref, disabled }];
  }, []);

  const unregisterItem = useCallback((id: string) => {
    itemsRef.current = itemsRef.current.filter((i) => i.id !== id);
  }, []);

  const handleKeydown = useCallback((e: KeyboardEvent, currentId: string) => {
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
  }, []);

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

/**
 * Properties for the LlmAccordionItem component.
 */
export interface LlmAccordionItemProps
  extends HTMLAttributes<HTMLDivElement>,
    LlmAccordionItemSpec {
  /**
   * Whether the item is currently expanded.
   */
  expanded?: boolean;
  /**
   * Callback triggered when the expanded state changes.
   */
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Whether the accordion item is disabled.
   */
  disabled?: boolean;
  /**
   * HTML heading level wrapping the trigger button. Default `3`.
   * Match your page's heading outline so heading order stays valid.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * The content of the accordion item, typically including an LlmAccordionHeader.
   */
  children?: ReactNode;
}

/**
 * An individual item within an accordion group.
 */
export function LlmAccordionItem({
  expanded: externalExpanded,
  onExpandedChange,
  disabled = false,
  headingLevel = 3,
  children,
  className,
  ...rest
}: LlmAccordionItemProps) {
  const ctx = useContext(AccordionGroupContext);
  const id = useId();
  const triggerId = `${id}-trigger`;
  const panelId = `${id}-panel`;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { registerItem, unregisterItem } = ctx;

  // Register/unregister with parent
  useLayoutEffect(() => {
    registerItem(id, triggerRef, disabled);
    return () => unregisterItem(id);
  }, [id, triggerRef, disabled, registerItem, unregisterItem]);

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

  // Render the heading wrapper at the level the consumer asked for.
  // We can't use a JSX expression as a tag, so React.createElement is
  // the cleanest path here.
  const Heading = `h${headingLevel}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <div className={classes} {...rest}>
      <Heading className="accordion-heading">
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
      </Heading>
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

/**
 * The header component for an LlmAccordionItem.
 */
export function LlmAccordionHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  /**
   * The content to be rendered in the header.
   */
  children?: ReactNode;
}) {
  return (
    <span
      className={['accordion-header-content', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
