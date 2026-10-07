import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  RefObject,
} from 'react';
import type { AtlMenuSpec, AtlMenuItemSpec } from '../spec';
import '@atelier-ui/styles/menu/atl-menu.css';
import '@atelier-ui/styles/menu/atl-menu.native.css';

interface MenuContextValue {
  close: () => void;
}

/** Idle time after which the type-ahead buffer is forgotten (uianatomy menu: ~500ms). */
const TYPE_AHEAD_RESET_MS = 500;

/**
 * Menu items of one panel, in DOM order. Disabled items are included: they stay
 * focusable (APG, and the Angular CDK menu) and are announced as disabled.
 */
function menuItems(panel: HTMLElement): HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>('[role="menuitem"]'),
  ).filter((el) => el.closest('.atl-menu-panel') === panel);
}

/** Roving tabindex: the focused item is the only tab stop. */
function focusItem(items: HTMLElement[], target: HTMLElement) {
  items.forEach((el) => el.setAttribute('tabindex', '-1'));
  target.setAttribute('tabindex', '0');
  target.focus();
}

const MenuContext = createContext<MenuContextValue>({ close: () => undefined });

/**
 * Properties for the AtlMenu component.
 */
export interface AtlMenuProps
  extends HTMLAttributes<HTMLDivElement>, AtlMenuSpec {
  /**
   * The visual style variant of the menu.
   */
  variant?: 'default' | 'compact';
  /**
   * The menu items to be rendered.
   */
  children?: ReactNode;
}

/**
 * A menu component for displaying a list of choices.
 */
export function AtlMenu({
  variant = 'default',
  children,
  className,
  ...rest
}: AtlMenuProps) {
  const classes = ['atl-menu', `variant-${variant}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} role="menu" {...rest}>
      {children}
    </div>
  );
}

/**
 * Properties for the AtlMenuItem component.
 */
export interface AtlMenuItemProps
  extends HTMLAttributes<HTMLButtonElement>, AtlMenuItemSpec {
  /**
   * Whether the menu item is disabled.
   */
  disabled?: boolean;
  /**
   * Callback triggered when the item is selected.
   */
  onTriggered?: () => void;
  /**
   * The content of the menu item.
   */
  children?: ReactNode;
}

/**
 * An individual item within a menu.
 */
export function AtlMenuItem({
  disabled = false,
  onTriggered,
  children,
  className,
  onClick,
  ...rest
}: AtlMenuItemProps) {
  const ctx = useContext(MenuContext);
  const classes = ['atl-menu-item', disabled && 'is-disabled', className]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onTriggered?.();
      ctx.close();
      onClick?.(e);
    }
  };

  return (
    <button
      className={classes}
      role="menuitem"
      aria-disabled={disabled || undefined}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * A separator for dividing groups of menu items.
 */
export function AtlMenuSeparator() {
  return <hr className="atl-menu-separator" />;
}

/**
 * Properties for the AtlMenuTrigger component.
 */
export interface AtlMenuTriggerProps {
  /**
   * The menu to be displayed.
   */
  menu: ReactNode;
  /**
   * Render prop that provides trigger functionality.
   */
  children: (props: {
    onClick: () => void;
    ref: RefObject<HTMLElement | null>;
  }) => ReactNode;
}

/**
 * A component that manages the state of a menu and its trigger.
 */
export function AtlMenuTrigger({ menu, children }: AtlMenuTriggerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Which item receives focus when the menu opens (ArrowUp on the trigger: last).
  const initialFocus = useRef<'first' | 'last'>('first');
  const typeAhead = useRef({ buffer: '', timer: 0 });

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  // Menu-button ARIA on the trigger element itself (the render prop binds the
  // ref to it) — mirrors what the CDK menu trigger does in the Angular adapter,
  // so consumers get correct semantics without wiring attributes by hand.
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    el.setAttribute('aria-haspopup', 'menu');
    el.setAttribute('aria-expanded', String(open));
  }, [open]);

  // Opening moves focus into the menu (WAI-ARIA menu button pattern).
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const items = menuItems(menuRef.current);
    const target =
      initialFocus.current === 'last' ? items[items.length - 1] : items[0];
    if (target) focusItem(items, target);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close(true);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(typeAhead.current.timer), []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = e.target as Node;

    if (triggerRef.current?.contains(target)) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        initialFocus.current = e.key === 'ArrowUp' ? 'last' : 'first';
        if (!open) setOpen(true);
      }
      return;
    }

    const panel = menuRef.current;
    if (!open || !panel?.contains(target)) return;
    if (e.key === 'Tab') {
      // Not prevented: focus returns to the trigger, then Tab moves on from it.
      close(true);
      return;
    }

    const items = menuItems(panel);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLElement);
    let next: HTMLElement | undefined;

    if (e.key === 'ArrowDown') next = items[(current + 1) % items.length];
    else if (e.key === 'ArrowUp')
      next = items[current <= 0 ? items.length - 1 : current - 1];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];
    else if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      (e.key !== ' ' || typeAhead.current.buffer)
    ) {
      const ta = typeAhead.current;
      window.clearTimeout(ta.timer);
      ta.buffer += e.key.toLowerCase();
      ta.timer = window.setTimeout(() => (ta.buffer = ''), TYPE_AHEAD_RESET_MS);
      // A single character cycles to the next match; a longer prefix may keep the current item.
      const start = ta.buffer.length === 1 ? current + 1 : Math.max(current, 0);
      for (let i = 0; i < items.length; i++) {
        const candidate = items[(start + i) % items.length];
        if (candidate.textContent?.trim().toLowerCase().startsWith(ta.buffer)) {
          next = candidate;
          break;
        }
      }
      if (!next) return;
    } else return;

    e.preventDefault();
    if (next) focusItem(items, next);
  };

  return (
    <MenuContext.Provider value={{ close: () => close(true) }}>
      {/* The wrapper is not a control: it only listens for the keydown events
          that bubble up from the trigger and the menu items. */}
      <div
        className="atl-menu-trigger-wrapper"
        style={{ position: 'relative', display: 'inline-block' }}
        onKeyDown={onKeyDown}
      >
        {children({
          onClick: () => {
            initialFocus.current = 'first';
            setOpen((v) => !v);
          },
          ref: triggerRef,
        })}
        {open && (
          <div ref={menuRef} className="atl-menu-panel">
            {menu}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  );
}
