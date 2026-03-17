import { useState, useRef, useEffect, ReactNode } from 'react';
import './llm-tooltip.css';

export interface LlmTooltipProps {
  content: string;
  position?: 'above' | 'below' | 'left' | 'right';
  disabled?: boolean;
  showDelay?: number;
  hideDelay?: number;
  children: ReactNode;
}

export function LlmTooltip({
  content,
  position = 'above',
  disabled = false,
  showDelay = 300,
  hideDelay = 0,
  children,
}: LlmTooltipProps) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useRef(`tooltip-${Math.random().toString(36).slice(2)}`);

  const show = () => {
    if (disabled || !content) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (!visible) {
      showTimer.current = setTimeout(() => {
        showTimer.current = null;
        setVisible(true);
      }, showDelay);
    }
  };

  const hide = () => {
    if (showTimer.current) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setVisible(false);
    }, hideDelay);
  };

  // Set aria-describedby on the child element
  useEffect(() => {
    const el = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (el && visible) {
      el.setAttribute('aria-describedby', tooltipId.current);
    } else if (el) {
      el.removeAttribute('aria-describedby');
    }
  }, [visible]);

  // Handle Escape key to dismiss
  useEffect(() => {
    const keyHandler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <span
      ref={wrapperRef}
      className="llm-tooltip-wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && !disabled && content && (
        <div
          id={tooltipId.current}
          role="tooltip"
          className={`llm-tooltip position-${position}`}
        >
          {content}
        </div>
      )}
    </span>
  );
}
