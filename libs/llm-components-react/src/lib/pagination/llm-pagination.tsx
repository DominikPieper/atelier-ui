import { HTMLAttributes, useMemo } from 'react';
import type { LlmPaginationSpec } from '@atelier-ui/spec';
import './llm-pagination.css';

type PageItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; key: string };

function buildPageItems(page: number, pageCount: number, siblingCount: number): PageItem[] {
  if (pageCount <= 1) return [{ type: 'page', page: 1 }];

  const items: PageItem[] = [];

  // Always include first page
  items.push({ type: 'page', page: 1 });

  const left = Math.max(2, page - siblingCount);
  const right = Math.min(pageCount - 1, page + siblingCount);

  // Left ellipsis
  if (left > 2) {
    items.push({ type: 'ellipsis', key: 'ellipsis-start' });
  }

  // Middle pages
  for (let p = left; p <= right; p++) {
    items.push({ type: 'page', page: p });
  }

  // Right ellipsis
  if (right < pageCount - 1) {
    items.push({ type: 'ellipsis', key: 'ellipsis-end' });
  }

  // Always include last page
  items.push({ type: 'page', page: pageCount });

  return items;
}

/**
 * Properties for the LlmPagination component.
 */
export interface LlmPaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange'>,
    LlmPaginationSpec {
  /**
   * The currently active page.
   */
  page?: number;
  /**
   * The total number of pages.
   */
  pageCount?: number;
  /**
   * The number of pages to show on either side of the current page.
   */
  siblingCount?: number;
  /**
   * Whether to show buttons for first and last pages.
   */
  showFirstLast?: boolean;
  /**
   * Callback triggered when the page changes.
   */
  onPageChange?: (page: number) => void;
}

/**
 * A pagination component for navigating through paged content.
 */
export function LlmPagination({
  page = 1,
  pageCount = 1,
  siblingCount = 1,
  showFirstLast = true,
  onPageChange,
  className,
  ...rest
}: LlmPaginationProps) {
  const classes = ['llm-pagination', className].filter(Boolean).join(' ');

  const pageItems = useMemo(
    () => buildPageItems(page, pageCount, siblingCount),
    [page, pageCount, siblingCount]
  );

  const goTo = (p: number) => {
    const clamped = Math.min(Math.max(p, 1), pageCount);
    if (clamped !== page) {
      onPageChange?.(clamped);
    }
  };

  return (
    <nav className={classes} aria-label="Pagination" {...rest}>
      <ul role="list" className="page-list">
        {showFirstLast && (
          <li>
            <button
              className={['page-btn', page <= 1 ? 'is-disabled' : ''].filter(Boolean).join(' ')}
              disabled={page <= 1}
              aria-label="First page"
              onClick={() => goTo(1)}
            >
              «
            </button>
          </li>
        )}
        <li>
          <button
            className={['page-btn', page <= 1 ? 'is-disabled' : ''].filter(Boolean).join(' ')}
            disabled={page <= 1}
            aria-label="Previous page"
            onClick={() => goTo(page - 1)}
          >
            ‹
          </button>
        </li>

        {pageItems.map((item, index) =>
          item.type === 'page' ? (
            <li key={item.page}>
              <button
                className={['page-btn', item.page === page ? 'is-active' : '']
                  .filter(Boolean)
                  .join(' ')}
                aria-current={item.page === page ? 'page' : undefined}
                aria-label={`Page ${item.page}`}
                onClick={() => goTo(item.page)}
              >
                {item.page}
              </button>
            </li>
          ) : (
            <li key={item.key}>
              <span className="ellipsis" aria-hidden="true">
                …
              </span>
            </li>
          )
        )}

        <li>
          <button
            className={[
              'page-btn',
              page >= pageCount ? 'is-disabled' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={page >= pageCount}
            aria-label="Next page"
            onClick={() => goTo(page + 1)}
          >
            ›
          </button>
        </li>
        {showFirstLast && (
          <li>
            <button
              className={[
                'page-btn',
                page >= pageCount ? 'is-disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              disabled={page >= pageCount}
              aria-label="Last page"
              onClick={() => goTo(pageCount)}
            >
              »
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
