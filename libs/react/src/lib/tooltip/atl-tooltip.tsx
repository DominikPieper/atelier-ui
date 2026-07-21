import { useState, useRef, useEffect, ReactNode, useId } from 'react';
import type { AtlTooltipSpec } from '../spec';
import './atl-tooltip.css';

/**
 * Properties for the AtlTooltip component.
 */
export interface AtlTooltipProps extends AtlTooltipSpec {
  /**
   * The content to trigger the tooltip.
   */
  children: ReactNode;
}

/**
 * A tooltip component that displays additional information when the trigger is hovered or focused.
 */
export function AtlTooltip({
  atlTooltip,
  atlTooltipPosition = 'above',
  atlTooltipDisabled = false,
  atlTooltipShowDelay = 300,
  atlTooltipHideDelay = 0,
  children,
}: AtlTooltipProps) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const id = useId();
  const tooltipId = `tooltip-${id}`;

  const show = () => {
    if (atlTooltipDisabled || !atlTooltip) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (!visible) {
      showTimer.current = setTimeout(() => {
        showTimer.current = null;
        setVisible(true);
      }, atlTooltipShowDelay);
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
    }, atlTooltipHideDelay);
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
      className="atl-tooltip-wrapper"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && !atlTooltipDisabled && atlTooltip && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`atl-tooltip position-${atlTooltipPosition}`}
        >
          {atlTooltip}
        </div>
      )}
    </span>
  );
}
