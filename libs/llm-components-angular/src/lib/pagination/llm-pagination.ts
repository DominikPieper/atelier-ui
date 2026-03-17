import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

export type PageItem =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; key: string };

/**
 * Pagination control for navigating multi-page content.
 *
 * Usage:
 * ```html
 * <llm-pagination [(page)]="currentPage" [pageCount]="totalPages" />
 * ```
 */
@Component({
  selector: 'llm-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav aria-label="Pagination">
      <ul role="list" class="page-list">
        @if (showFirstLast()) {
          <li>
            <button
              class="page-btn"
              [class.is-disabled]="page() <= 1"
              [disabled]="page() <= 1"
              aria-label="First page"
              (click)="goFirst()"
            >«</button>
          </li>
        }
        <li>
          <button
            class="page-btn"
            [class.is-disabled]="page() <= 1"
            [disabled]="page() <= 1"
            aria-label="Previous page"
            (click)="goPrev()"
          >‹</button>
        </li>

        @for (item of pageItems(); track $index) {
          @if (item.type === 'page') {
            <li>
              <button
                class="page-btn"
                [class.is-active]="item.page === page()"
                [attr.aria-current]="item.page === page() ? 'page' : null"
                [attr.aria-label]="'Page ' + item.page"
                (click)="goTo(item.page)"
              >{{ item.page }}</button>
            </li>
          } @else {
            <li>
              <span class="ellipsis" aria-hidden="true">…</span>
            </li>
          }
        }

        <li>
          <button
            class="page-btn"
            [class.is-disabled]="page() >= pageCount()"
            [disabled]="page() >= pageCount()"
            aria-label="Next page"
            (click)="goNext()"
          >›</button>
        </li>
        @if (showFirstLast()) {
          <li>
            <button
              class="page-btn"
              [class.is-disabled]="page() >= pageCount()"
              [disabled]="page() >= pageCount()"
              aria-label="Last page"
              (click)="goLast()"
            >»</button>
          </li>
        }
      </ul>
    </nav>
  `,
  styleUrl: './llm-pagination.css',
})
export class LlmPagination {
  /** Current page (1-based). Supports two-way binding: [(page)]="currentPage". */
  readonly page = model(1);

  /** Total number of pages. */
  readonly pageCount = input(1);

  /** Number of page buttons to show on each side of the current page. */
  readonly siblingCount = input(1);

  /** Whether to show first/last page jump buttons. */
  readonly showFirstLast = input(true);

  protected readonly pageItems = computed((): PageItem[] => {
    const total = this.pageCount();
    const current = this.page();
    const siblings = this.siblingCount();

    if (total <= 1) return [{ type: 'page', page: 1 }];

    const items: PageItem[] = [];

    // Always include first page
    items.push({ type: 'page', page: 1 });

    const left = Math.max(2, current - siblings);
    const right = Math.min(total - 1, current + siblings);

    // Left ellipsis
    if (left > 2) {
      items.push({ type: 'ellipsis', key: 'ellipsis-start' });
    }

    // Middle pages
    for (let p = left; p <= right; p++) {
      items.push({ type: 'page', page: p });
    }

    // Right ellipsis
    if (right < total - 1) {
      items.push({ type: 'ellipsis', key: 'ellipsis-end' });
    }

    // Always include last page
    items.push({ type: 'page', page: total });

    return items;
  });

  protected goTo(p: number): void {
    const clamped = Math.min(Math.max(p, 1), this.pageCount());
    this.page.set(clamped);
  }

  protected goPrev(): void {
    this.goTo(this.page() - 1);
  }

  protected goNext(): void {
    this.goTo(this.page() + 1);
  }

  protected goFirst(): void {
    this.goTo(1);
  }

  protected goLast(): void {
    this.goTo(this.pageCount());
  }
}
