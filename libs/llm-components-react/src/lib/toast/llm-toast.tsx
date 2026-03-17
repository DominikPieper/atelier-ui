import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import './llm-toast.css';

export type ToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastOptions {
  variant?: ToastVariant;
  /** Duration in ms before auto-dismiss. 0 = no auto-dismiss. Default 5000. */
  duration?: number;
  /** Whether the toast shows a dismiss button. Default true. */
  dismissible?: boolean;
}

export interface ToastData extends Required<ToastOptions> {
  id: string;
  message: string;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
  clear: () => void;
  toasts: ToastData[];
}

const ToastContext = createContext<ToastContextValue>({
  show: () => '',
  dismiss: () => {},
  clear: () => {},
  toasts: [],
});

export function LlmToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  let toastId = useRef(0);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      const id = `llm-toast-${toastId.current++}`;
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

/** Access toast actions: show, dismiss, clear. Must be inside LlmToastProvider. */
export function useLlmToast() {
  const ctx = useContext(ToastContext);
  return { show: ctx.show, dismiss: ctx.dismiss, clear: ctx.clear };
}

export interface LlmToastContainerProps {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

/**
 * Renders the toast stack at a fixed viewport position.
 * Must be placed inside LlmToastProvider.
 */
export function LlmToastContainer({ position = 'bottom-right' }: LlmToastContainerProps) {
  const { toasts, dismiss } = useContext(ToastContext);
  const classes = `llm-toast-container position-${position}`;

  return (
    <div className={classes} aria-live="polite" role="status">
      {toasts.map((toast) => (
        <LlmToastItem key={toast.id} data={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

export interface LlmToastItemProps {
  data: ToastData;
  onDismiss: (id: string) => void;
}

export function LlmToastItem({ data, onDismiss }: LlmToastItemProps) {
  const classes = `llm-toast variant-${data.variant}`;
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
