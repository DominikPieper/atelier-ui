import { useState, useRef, useEffect, ReactNode, useId } from 'react';
import type { LlmTooltipSpec } from '@atelier-ui/spec';
import './llm-tooltip.css';

/**
 * Properties for the LlmTooltip component.
 */
export interface LlmTooltipProps extends LlmTooltipSpec {
  /**
   * The content to trigger the tooltip.
   */
  children: ReactNode;
}

/**
 * A tooltip component that displays additional information when the trigger is hovered or focused.
 */
export function LlmTooltip({
  llmTooltip,
  llmTooltipPosition = 'above',
  llmTooltipDisabled = false,
  llmTooltipShowDelay = 300,
  llmTooltipHideDelay = 0,
  children,
}: LlmTooltipProps) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const tooltipId = `tooltip-${id}`;

  const show = () => {
    if (llmTooltipDisabled || !llmTooltip) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (!visible) {
      showTimer.current = setTimeout(() => {
        showTimer.current = null;
        setVisible(true);
      }, llmTooltipShowDelay);
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
    }, llmTooltipHideDelay);
  };

  // Set aria-describedby on the child element
  useEffect(() => {
    const el = wrapperRef.current?.firstElementChild as HTMLElement | null;
    if (el && visible) {
      el.setAttribute('aria-describedby', tooltipId);
    } else if (el) {
      el.removeAttribute('aria-describedby');
    }
  }, [visible, tooltipId]);

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
      {visible && !llmTooltipDisabled && llmTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`llm-tooltip position-${llmTooltipPosition}`}
        >
          {llmTooltip}
        </div>
      )}
    </span>
  );
}
