import { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import type {
  AtlTableSpec,
  AtlTbodySpec,
  AtlTrSpec,
  AtlThSpec,
  AtlTdSpec,
  AtlSortDirection,
} from '../spec';
import { AtlCheckbox } from '../checkbox/atl-checkbox';
import './atl-table.css';

export type { AtlSortDirection };

// ---------------------------------------------------------------------------
// AtlTable
// ---------------------------------------------------------------------------

export interface AtlTableProps extends HTMLAttributes<HTMLDivElement>, AtlTableSpec {
  children?: ReactNode;
  /**
   * Accessible name for the scrollable table region. Surfaces to
   * screen readers as the region's label so keyboard users who
   * scroll the wrapper know what they're scrolling. Defaults to
   * `"Table"` if unset.
   */
  'aria-label'?: string;
}

export function AtlTable({
  variant = 'default',
  size = 'md',
  stickyHeader = false,
  children,
  className,
  'aria-label': ariaLabel,
  ...rest
}: AtlTableProps) {
  const classes = [
    'atl-table',
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
        className="atl-table-wrapper"
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
// AtlThead
// ---------------------------------------------------------------------------

export interface AtlTheadProps {
  children?: ReactNode;
}

export function AtlThead({ children }: AtlTheadProps) {
  return <thead>{children}</thead>;
}

// ---------------------------------------------------------------------------
// AtlTbody
// ---------------------------------------------------------------------------

export interface AtlTbodyProps extends AtlTbodySpec {
  children?: ReactNode;
  /** Content shown in place of rows when empty=true. */
  emptyContent?: ReactNode;
}

export function AtlTbody({ empty = false, colSpan = 1, children, emptyContent }: AtlTbodyProps) {
  return (
    <tbody>
      {!empty ? (
        children
      ) : (
        <tr>
          <td colSpan={colSpan} className="atl-tbody-empty-cell">
            {emptyContent}
          </td>
        </tr>
      )}
    </tbody>
  );
}

// ---------------------------------------------------------------------------
// AtlTr
// ---------------------------------------------------------------------------

export interface AtlTrProps extends AtlTrSpec {
  children?: ReactNode;
  onSelectedChange?: (selected: boolean) => void;
}

export function AtlTr({
  selected = false,
  selectable = false,
  children,
  onSelectedChange,
}: AtlTrProps) {
  return (
    <tr aria-selected={selectable ? selected : undefined} className={selected ? 'is-selected' : undefined}>
      {selectable && (
        <td className="atl-tr-select-cell">
          <AtlCheckbox checked={selected} onCheckedChange={onSelectedChange} />
        </td>
      )}
      {children}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// AtlTh
// ---------------------------------------------------------------------------

export interface AtlThProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'>, AtlThSpec {
  children?: ReactNode;
  onSort?: (direction: AtlSortDirection) => void;
}

export function AtlTh({
  sortable = false,
  sortDirection = null,
  align = 'start',
  width,
  children,
  onSort,
  className,
  ...rest
}: AtlThProps) {
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
    const next: AtlSortDirection =
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
        <button type="button" className="atl-th-sort-btn" onClick={cycleSort}>
          {children}
          <svg
            className="atl-th-sort-icon"
            aria-hidden="true"
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
          >
            <path className="atl-th-sort-asc-arrow" d="M6 2L11 8H1L6 2Z" fill="currentColor" />
            <path className="atl-th-sort-desc-arrow" d="M6 14L1 8H11L6 14Z" fill="currentColor" />
          </svg>
        </button>
      ) : (
        children
      )}
    </th>
  );
}

// ---------------------------------------------------------------------------
// AtlTd
// ---------------------------------------------------------------------------

export interface AtlTdProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'>, AtlTdSpec {
  children?: ReactNode;
}

export function AtlTd({ align = 'start', children, className, ...rest }: AtlTdProps) {
  const classes = [`align-${align}`, className].filter(Boolean).join(' ');
  return (
    <td className={classes} {...rest}>
      {children}
    </td>
  );
}
