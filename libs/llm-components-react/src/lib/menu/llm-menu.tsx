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
import './llm-menu.css';

interface MenuContextValue {
  close: () => void;
}

const MenuContext = createContext<MenuContextValue>({ close: () => {} });

export interface LlmMenuProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'compact';
  children?: ReactNode;
}

export function LlmMenu({ variant = 'default', children, className, ...rest }: LlmMenuProps) {
  const classes = ['llm-menu', `variant-${variant}`, className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="menu" {...rest}>
      {children}
    </div>
  );
}

export interface LlmMenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  onTriggered?: () => void;
  children?: ReactNode;
}

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

export function LlmMenuSeparator() {
  return <hr className="llm-menu-separator" role="separator" />;
}

export interface LlmMenuTriggerProps {
  menu: ReactNode;
  children: (props: {
    onClick: () => void;
    ref: RefObject<HTMLElement | null>;
  }) => ReactNode;
}

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
