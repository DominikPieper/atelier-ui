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
import './llm-drawer.css';

interface DrawerContextValue {
  headerId: string;
  close: () => void;
}

const DrawerContext = createContext<DrawerContextValue>({
  headerId: '',
  close: () => {},
});

export interface LlmDrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnBackdrop?: boolean;
  children?: ReactNode;
}

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

export function LlmDrawerHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
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

export function LlmDrawerContent({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={['llm-drawer-content', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

export function LlmDrawerFooter({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div
      className={['llm-drawer-footer', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
