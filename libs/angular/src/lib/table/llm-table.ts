import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Signal,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import { LlmCheckbox } from '../checkbox/llm-checkbox';

// ---------------------------------------------------------------------------
// Context token
// ---------------------------------------------------------------------------

export interface LlmTableContext {
  readonly size: Signal<'sm' | 'md' | 'lg'>;
  readonly variant: Signal<'default' | 'striped' | 'bordered'>;
}

export const LLM_TABLE = new InjectionToken<LlmTableContext>('LLM_TABLE');

// ---------------------------------------------------------------------------
// LlmTable
// ---------------------------------------------------------------------------

/**
 * Accessible data table with sorting, row selection, sticky header, and empty state.
 * Compose with `llm-thead`, `llm-tbody`, `llm-tr`, `llm-th`, and `llm-td`.
 *
 * Usage:
 * ```html
 * <llm-table variant="striped" [stickyHeader]="true">
 *   <llm-thead>
 *     <llm-tr>
 *       <llm-th sortable [sortDirection]="sort" (sort)="sort = $event">Name</llm-th>
 *       <llm-th>Status</llm-th>
 *     </llm-tr>
 *   </llm-thead>
 *   <llm-tbody [empty]="rows.length === 0" [colSpan]="2">
 *     @for (row of rows; track row.id) {
 *       <llm-tr selectable [selected]="selection.has(row.id)" (selectedChange)="toggle(row.id, $event)">
 *         <llm-td>{{ row.name }}</llm-td>
 *         <llm-td>{{ row.status }}</llm-td>
 *       </llm-tr>
 *     }
 *     <div llmTableEmpty>No results found.</div>
 *   </llm-tbody>
 * </llm-table>
 * ```
 */
@Component({
  selector: 'llm-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="llm-table-wrapper">
      <table>
        <ng-content />
      </table>
    </div>
  `,
  styleUrl: './llm-table.css',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: LLM_TABLE, useExisting: LlmTable }],
  encapsulation: ViewEncapsulation.None
})
export class LlmTable implements LlmTableContext {
  /** Visual style of the table rows. */
  readonly variant = input<'default' | 'striped' | 'bordered'>('default');

  /** Row density. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Whether the header row sticks to the top when the table scrolls. */
  readonly stickyHeader = input(false);

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes = [`variant-${this.variant()}`, `size-${this.size()}`];
    if (this.stickyHeader()) classes.push('is-sticky-header');
    return classes.join(' ');
  });
}

// ---------------------------------------------------------------------------
// LlmThead
// ---------------------------------------------------------------------------

/**
 * Table head section. Contains header rows with `llm-tr` and `llm-th`.
 *
 * Usage:
 * ```html
 * <llm-thead>
 *   <llm-tr>
 *     <llm-th sortable [sortDirection]="sort" (sort)="sort = $event">Name</llm-th>
 *   </llm-tr>
 * </llm-thead>
 * ```
 */
@Component({
  selector: 'llm-thead',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<thead><ng-content /></thead>`,
  styleUrl: './llm-table.css',
  host: { '[style.display]': '"contents"' },
})
export class LlmThead {}

// ---------------------------------------------------------------------------
// LlmTbody
// ---------------------------------------------------------------------------

/**
 * Table body section. Shows rows or an empty state.
 *
 * Usage:
 * ```html
 * <llm-tbody [empty]="rows.length === 0" [colSpan]="3">
 *   @for (row of rows; track row.id) {
 *     <llm-tr><llm-td>{{ row.name }}</llm-td></llm-tr>
 *   }
 *   <div llmTableEmpty>No results found.</div>
 * </llm-tbody>
 * ```
 */
@Component({
  selector: 'llm-tbody',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tbody>
      @if (!empty()) {
        <ng-content />
      } @else {
        <tr>
          <td [attr.colspan]="colSpan()" class="llm-tbody-empty-cell">
            <ng-content select="[llmTableEmpty]" />
          </td>
        </tr>
      }
    </tbody>
  `,
  styleUrl: './llm-table.css',
  host: { '[style.display]': '"contents"' },
})
export class LlmTbody {
  /** When true, hides rows and shows the `[llmTableEmpty]` slot content instead. */
  readonly empty = input(false);

  /** Number of columns to span in the empty-state row. Should match total column count. */
  readonly colSpan = input(1);
}

// ---------------------------------------------------------------------------
// LlmTr
// ---------------------------------------------------------------------------

/**
 * Table row. Use inside `llm-thead` or `llm-tbody`.
 * Set `selectable` to auto-add a checkbox column for row selection.
 *
 * Usage:
 * ```html
 * <llm-tr selectable [selected]="isSelected" (selectedChange)="toggle($event)">
 *   <llm-td>Cell content</llm-td>
 * </llm-tr>
 * ```
 */
@Component({
  selector: 'llm-tr',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LlmCheckbox],
  template: `
    <tr
      [attr.aria-selected]="selectable() ? selected() : null"
      [class]="innerClasses()"
    >
      @if (selectable()) {
        <td class="llm-tr-select-cell">
          <llm-checkbox [checked]="selected()" (checkedChange)="selectedChange.emit($event)" />
        </td>
      }
      <ng-content />
    </tr>
  `,
  styleUrl: './llm-table.css',
  host: {
    '[class]': 'hostClasses()',
    '[style.display]': '"contents"',
  },
})
export class LlmTr {
  /** Whether this row is currently selected. */
  readonly selected = input(false);

  /** Whether this row shows a selection checkbox. */
  readonly selectable = input(false);

  /** Optional identifier for this row. Useful for tracking selection. */
  readonly rowId = input<string | undefined>(undefined);

  /** Emits when the row's checkbox is toggled. */
  readonly selectedChange = output<boolean>();

  /** @internal */
  protected readonly hostClasses = computed(() =>
    this.selectable() ? 'is-selectable' : ''
  );

  /** @internal — applied to inner <tr> for CSS selection styling */
  protected readonly innerClasses = computed(() =>
    this.selected() ? 'is-selected' : ''
  );
}

// ---------------------------------------------------------------------------
// LlmTh
// ---------------------------------------------------------------------------

/** Sort direction for sortable column headers. */
export type LlmSortDirection = 'asc' | 'desc' | null;

/**
 * Table header cell. Set `sortable` to enable sort cycling.
 * The consumer controls `sortDirection` (fully controlled — no internal state).
 *
 * Usage:
 * ```html
 * <llm-th sortable [sortDirection]="nameSortDir" (sort)="nameSortDir = $event">Name</llm-th>
 * ```
 */
@Component({
  selector: 'llm-th',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <th
      [attr.aria-sort]="ariaSort()"
      [style.width]="width() ?? null"
      [class]="cellClasses()"
    >
      @if (sortable()) {
        <button type="button" class="llm-th-sort-btn" (click)="cycleSort()">
          <ng-content />
          <svg
            class="llm-th-sort-icon"
            aria-hidden="true"
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
          >
            <path class="llm-th-sort-asc-arrow" d="M6 2L11 8H1L6 2Z" fill="currentColor" />
            <path class="llm-th-sort-desc-arrow" d="M6 14L1 8H11L6 14Z" fill="currentColor" />
          </svg>
        </button>
      } @else {
        <ng-content />
      }
    </th>
  `,
  styleUrl: './llm-table.css',
  host: { '[style.display]': '"contents"' },
})
export class LlmTh {
  /** Whether this column is sortable. Renders a sort button when true. */
  readonly sortable = input(false);

  /** Current sort direction. Fully controlled — the consumer owns this state. */
  readonly sortDirection = input<LlmSortDirection>(null);

  /** Text alignment of the header cell content. */
  readonly align = input<'start' | 'center' | 'end'>('start');

  /** Fixed column width (e.g. `'120px'`, `'10rem'`). */
  readonly width = input<string | undefined>(undefined);

  /**
   * Emits when the header is clicked.
   * Cycles: `null` → `'asc'` → `'desc'` → `null`.
   */
  readonly sort = output<LlmSortDirection>();

  /** @internal */
  protected readonly ariaSort = computed(() => {
    if (!this.sortable()) return undefined;
    const d = this.sortDirection();
    if (d === 'asc') return 'ascending';
    if (d === 'desc') return 'descending';
    return 'none';
  });

  /** @internal */
  protected readonly cellClasses = computed(() => {
    const classes = [`align-${this.align()}`];
    if (this.sortDirection()) classes.push('is-sorted');
    if (this.sortDirection() === 'asc') classes.push('sort-asc');
    if (this.sortDirection() === 'desc') classes.push('sort-desc');
    return classes.join(' ');
  });

  /** @internal */
  protected cycleSort(): void {
    const current = this.sortDirection();
    const next: LlmSortDirection =
      current === null ? 'asc' : current === 'asc' ? 'desc' : null;
    this.sort.emit(next);
  }
}

// ---------------------------------------------------------------------------
// LlmTd
// ---------------------------------------------------------------------------

/**
 * Table data cell. Use inside `llm-tr` inside `llm-tbody`.
 *
 * Usage:
 * ```html
 * <llm-td align="end">{{ value }}</llm-td>
 * ```
 */
@Component({
  selector: 'llm-td',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <td [class]="'align-' + align()">
      <ng-content />
    </td>
  `,
  styleUrl: './llm-table.css',
  host: { '[style.display]': '"contents"' },
})
export class LlmTd {
  /** Text alignment of the cell content. */
  readonly align = input<'start' | 'center' | 'end'>('start');
}
