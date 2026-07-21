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
  AtlMenuSpec,
  AtlMenuItemSpec,
} from '../spec';
import './atl-menu.css';

interface MenuContextValue {
  close: () => void;
}

const MenuContext = createContext<MenuContextValue>({ close: () => undefined });

/**
 * Properties for the AtlMenu component.
 */
export interface AtlMenuProps extends HTMLAttributes<HTMLDivElement>, AtlMenuSpec {
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
export function AtlMenu({ variant = 'default', children, className, ...rest }: AtlMenuProps) {
  const classes = ['atl-menu', `variant-${variant}`, className].filter(Boolean).join(' ');
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
  extends HTMLAttributes<HTMLButtonElement>,
    AtlMenuItemSpec {
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
        className="atl-menu-trigger-wrapper"
        style={{ position: 'relative', display: 'inline-block' }}
      >
        {children({ onClick: () => setOpen((v) => !v), ref: triggerRef })}
        {open && (
          <div ref={menuRef} className="atl-menu-panel">
            {menu}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  );
}
