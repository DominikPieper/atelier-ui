import { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import type {
  LlmTableSpec,
  LlmTbodySpec,
  LlmTrSpec,
  LlmThSpec,
  LlmTdSpec,
  LlmSortDirection,
} from '../spec';
import { LlmCheckbox } from '../checkbox/llm-checkbox';
import './llm-table.css';

export type { LlmSortDirection };

// ---------------------------------------------------------------------------
// LlmTable
// ---------------------------------------------------------------------------

export interface LlmTableProps extends HTMLAttributes<HTMLDivElement>, LlmTableSpec {
  children?: ReactNode;
  /**
   * Accessible name for the scrollable table region. Surfaces to
   * screen readers as the region's label so keyboard users who
   * scroll the wrapper know what they're scrolling. Defaults to
   * `"Table"` if unset.
   */
  'aria-label'?: string;
}

export function LlmTable({
  variant = 'default',
  size = 'md',
  stickyHeader = false,
  children,
  className,
  'aria-label': ariaLabel,
  ...rest
}: LlmTableProps) {
  const classes = [
    'llm-table',
    `variant-${variant}`,
    `size-${size}`,
    stickyHeader && 'is-sticky-header',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {/* The wrapper is the scrollable region — give it tabindex=0 so
       * keyboard users can scroll horizontally through wide tables.
       * role=region + aria-label expose it as a labelled landmark for
       * screen readers (axe rule: scrollable-region-focusable). */}
      <div
        className="llm-table-wrapper"
        tabIndex={0}
        role="region"
        aria-label={ariaLabel ?? 'Table'}
      >
        <table>{children}</table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LlmThead
// ---------------------------------------------------------------------------

export interface LlmTheadProps {
  children?: ReactNode;
}

export function LlmThead({ children }: LlmTheadProps) {
  return <thead>{children}</thead>;
}

// ---------------------------------------------------------------------------
// LlmTbody
// ---------------------------------------------------------------------------

export interface LlmTbodyProps extends LlmTbodySpec {
  children?: ReactNode;
  /** Content shown in place of rows when empty=true. */
  emptyContent?: ReactNode;
}

export function LlmTbody({ empty = false, colSpan = 1, children, emptyContent }: LlmTbodyProps) {
  return (
    <tbody>
      {!empty ? (
        children
      ) : (
        <tr>
          <td colSpan={colSpan} className="llm-tbody-empty-cell">
            {emptyContent}
          </td>
        </tr>
      )}
    </tbody>
  );
}

// ---------------------------------------------------------------------------
// LlmTr
// ---------------------------------------------------------------------------

export interface LlmTrProps extends LlmTrSpec {
  children?: ReactNode;
  onSelectedChange?: (selected: boolean) => void;
}

export function LlmTr({
  selected = false,
  selectable = false,
  children,
  onSelectedChange,
}: LlmTrProps) {
  return (
    <tr aria-selected={selectable ? selected : undefined} className={selected ? 'is-selected' : undefined}>
      {selectable && (
        <td className="llm-tr-select-cell">
          <LlmCheckbox checked={selected} onCheckedChange={onSelectedChange} />
        </td>
      )}
      {children}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// LlmTh
// ---------------------------------------------------------------------------

export interface LlmThProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'>, LlmThSpec {
  children?: ReactNode;
  onSort?: (direction: LlmSortDirection) => void;
}

export function LlmTh({
  sortable = false,
  sortDirection = null,
  align = 'start',
  width,
  children,
  onSort,
  className,
  ...rest
}: LlmThProps) {
  const classes = [
    `align-${align}`,
    sortDirection && 'is-sorted',
    sortDirection === 'asc' && 'sort-asc',
    sortDirection === 'desc' && 'sort-desc',
    className,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const ariaSort = sortable
    ? sortDirection === 'asc'
      ? 'ascending'
      : sortDirection === 'desc'
        ? 'descending'
        : 'none'
    : undefined;

  function cycleSort() {
    const next: LlmSortDirection =
      sortDirection === null ? 'asc' : sortDirection === 'asc' ? 'desc' : null;
    onSort?.(next);
  }

  return (
    <th
      aria-sort={ariaSort}
      style={width ? { width } : undefined}
      className={classes}
      {...rest}
    >
      {sortable ? (
        <button type="button" className="llm-th-sort-btn" onClick={cycleSort}>
          {children}
          <svg
            className="llm-th-sort-icon"
            aria-hidden="true"
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
          >
            <path className="llm-th-sort-asc-arrow" d="M6 2L11 8H1L6 2Z" fill="currentColor" />
            <path className="llm-th-sort-desc-arrow" d="M6 14L1 8H11L6 14Z" fill="currentColor" />
          </svg>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

// ---------------------------------------------------------------------------
// LlmTd
// ---------------------------------------------------------------------------

export interface LlmTdProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'>, LlmTdSpec {
  children?: ReactNode;
}

export function LlmTd({ align = 'start', children, className, ...rest }: LlmTdProps) {
  const classes = [`align-${align}`, className].filter(Boolean).join(' ');
  return (
    <td className={classes} {...rest}>
      {children}
    </td>
  );
}
