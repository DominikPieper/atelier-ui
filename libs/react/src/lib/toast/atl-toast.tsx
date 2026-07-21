import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import type {
  AtlToastOptions,
  AtlToastContainerPosition,
} from '../spec';
import './atl-toast.css';

/**
 * Internal data structure for a toast message.
 */
export interface ToastData extends Required<AtlToastOptions> {
  id: string;
  message: string;
}

interface ToastContextValue {
  show: (message: string, options?: AtlToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
  toasts: ToastData[];
}

const ToastContext = createContext<ToastContextValue>({
  show: () => '',
  dismiss: () => undefined,
  clear: () => undefined,
  toasts: [],
});

/**
 * Context provider that manages the toast state.
 */
export function AtlToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const toastId = useRef(0);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options: AtlToastOptions = {}): string => {
      const id = `atl-toast-${toastId.current++}`;
      const toast: ToastData = {
        id,
        message,
        variant: options.variant ?? 'default',
        duration: options.duration ?? 5000,
        dismissible: options.dismissible ?? true,
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        const timer = setTimeout(() => dismiss(id), toast.duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const clear = useCallback(() => {
    for (const timer of timersRef.current.values()) clearTimeout(timer);
    timersRef.current.clear();
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss, clear, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

/** Access toast actions: show, dismiss, clear. Must be inside AtlToastProvider. */
export function useAtlToast() {
  const ctx = useContext(ToastContext);
  return { show: ctx.show, dismiss: ctx.dismiss, clear: ctx.clear };
}

/**
 * Properties for the AtlToastContainer component.
 */
export interface AtlToastContainerProps {
  /**
   * Position of the toast container in the viewport.
   */
  position?: AtlToastContainerPosition;
}

/**
 * Renders the toast stack at a fixed viewport position.
 * Must be placed inside AtlToastProvider.
 */
export function AtlToastContainer({ position = 'bottom-right' }: AtlToastContainerProps) {
  const { toasts, dismiss } = useContext(ToastContext);
  const classes = `atl-toast-container position-${position}`;

  return (
    <div className={classes} aria-live="polite" role="status">
      {toasts.map((toast) => (
        <AtlToastItem key={toast.id} data={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

/**
 * Properties for the AtlToastItem component.
 */
export interface AtlToastItemProps {
  /**
   * The toast data to display.
   */
  data: ToastData;
  /**
   * Callback fired when the toast is dismissed.
   */
  onDismiss: (id: string) => void;
}

/**
 * An individual toast notification item.
 */
export function AtlToastItem({ data, onDismiss }: AtlToastItemProps) {
  const classes = `atl-toast variant-${data.variant}`;
  return (
    <div className={classes} role="status">
      <span className="message">{data.message}</span>
      {data.dismissible && (
        <button
          className="dismiss"
          type="button"
          aria-label="Dismiss"
          onClick={() => onDismiss(data.id)}
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
      )}
    </div>
  );
}
