import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  HTMLAttributes,
  RefObject,
} from 'react';
import type {
  LlmMenuSpec,
  LlmMenuItemSpec,
} from '@atelier-ui/spec';
import './llm-menu.css';

interface MenuContextValue {
  close: () => void;
}

const MenuContext = createContext<MenuContextValue>({ close: () => {} });

/**
 * Properties for the LlmMenu component.
 */
export interface LlmMenuProps extends HTMLAttributes<HTMLDivElement>, LlmMenuSpec {
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
export function LlmMenu({ variant = 'default', children, className, ...rest }: LlmMenuProps) {
  const classes = ['llm-menu', `variant-${variant}`, className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="menu" {...rest}>
      {children}
    </div>
  );
}

/**
 * Properties for the LlmMenuItem component.
 */
export interface LlmMenuItemProps
  extends HTMLAttributes<HTMLButtonElement>,
    LlmMenuItemSpec {
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
export function LlmMenuItem({
  disabled = false,
  onTriggered,
  children,
  className,
  onClick,
  ...rest
}: LlmMenuItemProps) {
  const ctx = useContext(MenuContext);
  const classes = ['llm-menu-item', disabled && 'is-disabled', className]
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
      disabled={disabled}
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
export function LlmMenuSeparator() {
  return <hr className="llm-menu-separator" role="separator" />;
}

/**
 * Properties for the LlmMenuTrigger component.
 */
export interface LlmMenuTriggerProps {
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
export function LlmMenuTrigger({ menu, children }: LlmMenuTriggerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <MenuContext.Provider value={{ close: () => setOpen(false) }}>
      <div
        className="llm-menu-trigger-wrapper"
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {children({ onClick: () => setOpen((v) => !v), ref: triggerRef })}
        {open && (
          <div ref={menuRef} className="llm-menu-panel">
            {menu}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  );
}
