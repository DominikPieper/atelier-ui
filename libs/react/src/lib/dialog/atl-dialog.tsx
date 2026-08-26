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
import type { AtlDialogSpec } from '../spec';
import './atl-dialog.css';
import { AtlIcon } from '../icon/atl-icon';

interface DialogContextValue {
  headerId: string;
  close: () => void;
}

const DialogContext = createContext<DialogContextValue>({
  headerId: '',
  close: () => undefined,
});

/**
 * Properties for the AtlDialog component.
 */
export interface AtlDialogProps extends AtlDialogSpec {
  /**
   * Whether the dialog is open.
   */
  open?: boolean;
  /**
   * Callback triggered when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether to close the dialog when clicking on the backdrop.
   */
  closeOnBackdrop?: boolean;
  /**
   * The size of the dialog.
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Accessible label for the dialog.
   */
  'aria-label'?: string;
  /**
   * Accessible label provided by another element.
   */
  'aria-labelledby'?: string;
  /**
   * The content of the dialog.
   */
  children?: ReactNode;
}

/**
 * A dialog (modal) component for displaying content on top of the main UI.
 */
export function AtlDialog({
  open = false,
  onOpenChange,
  closeOnBackdrop = true,
  size = 'md',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  children,
}: AtlDialogProps) {
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

  const effectiveAriaLabelledby = ariaLabel ? undefined : (ariaLabelledby ?? headerId);

  return (
    <DialogContext.Provider value={{ headerId, close: () => onOpenChange?.(false) }}>
      <dialog
        ref={dialogRef}
        className={`atl-dialog size-${size}${open ? ' is-open' : ''}`}
        aria-label={ariaLabel || undefined}
        aria-labelledby={effectiveAriaLabelledby}
        aria-modal="true"
        onClick={handleBackdropClick}
      >
        <div className="panel" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </dialog>
    </DialogContext.Provider>
  );
}

/**
 * The header component for an AtlDialog.
 */
export function AtlDialogHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The content of the dialog header.
   */
  children?: ReactNode;
}) {
  const ctx = useContext(DialogContext);
  return (
    <div
      id={ctx.headerId}
      className={['atl-dialog-header', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
      <button
        className="close-btn"
        type="button"
        aria-label="Close dialog"
        onClick={ctx.close}
      >
        <AtlIcon name="close" size="sm" />
      </button>
    </div>
  );
}

/**
 * The main content component for an AtlDialog.
 */
export function AtlDialogContent({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The main content of the dialog.
   */
  children?: ReactNode;
}) {
  return (
    <div
      className={['atl-dialog-content', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * The footer component for an AtlDialog.
 */
export function AtlDialogFooter({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  /**
   * The content of the dialog footer.
   */
  children?: ReactNode;
}) {
  return (
    <div
      className={['atl-dialog-footer', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
