import {
  useEffect,
  useRef,
  useId,
  createContext,
  useContext,
  ReactNode,
  HTMLAttributes,
  MouseEvent,
} from 'react';
import type { LlmDrawerSpec } from '@atelier-ui/spec';
import './llm-drawer.css';

interface DrawerContextValue {
  headerId: string;
  close: () => void;
}

const DrawerContext = createContext<DrawerContextValue>({
  headerId: '',
  close: () => {},
});

/**
 * Properties for the LlmDrawer component.
 */
export interface LlmDrawerProps extends LlmDrawerSpec {
  /**
   * Whether the drawer is open.
   */
  open?: boolean;
  /**
   * Callback triggered when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The position of the drawer on the screen.
   */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * The size of the drawer.
   */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /**
   * Whether to close the drawer when clicking on the backdrop.
   */
  closeOnBackdrop?: boolean;
  /**
   * The content of the drawer.
   */
  children?: ReactNode;
}

/**
 * A drawer component that slides in from the edge of the screen.
 */
export function LlmDrawer({
  open = false,
  onOpenChange,
  position = 'right',
  size = 'md',
  closeOnBackdrop = true,
  children,
}: LlmDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerId = useId();
  const triggerElRef = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      triggerElRef.current = document.activeElement;
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      (triggerElRef.current as HTMLElement | null)?.focus();
      triggerElRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => onOpenChange?.(false);
    const onCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange?.(false);
    };
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('cancel', onCancel);
    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('cancel', onCancel);
    };
  }, [onOpenChange]);

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (!closeOnBackdrop) return;
    if (e.target === dialogRef.current) {
      onOpenChange?.(false);
    }
  };

  const hostClass = [
    'llm-drawer-host',
    `position-${position}`,
    `size-${size}`,
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <DrawerContext.Provider value={{ headerId, close: () => onOpenChange?.(false) }}>
      <div className={hostClass}>
        <dialog
          ref={dialogRef}
          aria-labelledby={headerId}
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </dialog>
      </div>
    </DrawerContext.Provider>
  );
}

/**
 * The header component for an LlmDrawer.
 */
export function LlmDrawerHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The content of the drawer header.
   */
  children?: ReactNode;
}) {
  const ctx = useContext(DrawerContext);
  return (
    <div
      id={ctx.headerId}
      className={['llm-drawer-header', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
      <button
        className="close-btn"
        type="button"
        aria-label="Close drawer"
        onClick={ctx.close}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/**
 * The main content component for an LlmDrawer.
 */
export function LlmDrawerContent({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The main content of the drawer.
   */
  children?: ReactNode;
}) {
  return (
    <div
      className={['llm-drawer-content', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * The footer component for an LlmDrawer.
 */
export function LlmDrawerFooter({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The content of the drawer footer.
   */
  children?: ReactNode;
}) {
  return (
    <div
      className={['llm-drawer-footer', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
