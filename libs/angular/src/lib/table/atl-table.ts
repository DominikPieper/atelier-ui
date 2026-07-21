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
import { AtlCheckbox } from '../checkbox/atl-checkbox';

// ---------------------------------------------------------------------------
// Context token
// ---------------------------------------------------------------------------

export interface AtlTableContext {
  readonly size: Signal<'sm' | 'md' | 'lg'>;
  readonly variant: Signal<'default' | 'striped' | 'bordered'>;
}

export const ATL_TABLE = new InjectionToken<AtlTableContext>('ATL_TABLE');

// ---------------------------------------------------------------------------
// AtlTable
// ---------------------------------------------------------------------------

/**
 * Accessible data table with sorting, row selection, sticky header, and empty state.
 * Compose with `atl-thead`, `atl-tbody`, `atl-tr`, `atl-th`, and `atl-td`.
 *
 * Usage:
 * ```html
 * <atl-table variant="striped" [stickyHeader]="true">
 *   <atl-thead>
 *     <atl-tr>
 *       <atl-th sortable [sortDirection]="sort" (sort)="sort = $event">Name</atl-th>
 *       <atl-th>Status</atl-th>
 *     </atl-tr>
 *   </atl-thead>
 *   <atl-tbody [empty]="rows.length === 0" [colSpan]="2">
 *     @for (row of rows; track row.id) {
 *       <atl-tr selectable [selected]="selection.has(row.id)" (selectedChange)="toggle(row.id, $event)">
 *         <atl-td>{{ row.name }}</atl-td>
 *         <atl-td>{{ row.status }}</atl-td>
 *       </atl-tr>
 *     }
 *     <div atlTableEmpty>No results found.</div>
 *   </atl-tbody>
 * </atl-table>
 * ```
 */
@Component({
  selector: 'atl-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- The wrapper is the scrollable region — tabindex=0 lets keyboard
         users scroll horizontally through wide tables. role=region +
         aria-label expose it as a labelled landmark for screen readers
         (axe: scrollable-region-focusable). -->
    <div
      class="atl-table-wrapper"
      tabindex="0"
      role="region"
      [attr.aria-label]="ariaLabel() || 'Table'"
    >
      <table>
        <ng-content />
      </table>
    </div>
  `,
  styleUrl: './atl-table.css',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: ATL_TABLE, useExisting: AtlTable }],
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None
})
export class AtlTable implements AtlTableContext {
  /** Visual style of the table rows. */
  readonly variant = input<'default' | 'striped' | 'bordered'>('default');

  /** Row density. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Whether the header row sticks to the top when the table scrolls. */
  readonly stickyHeader = input(false);

  /**
   * Accessible name for the scrollable table region. Surfaces to
   * screen readers as the region's label so keyboard users who
   * scroll the wrapper know what they're scrolling. Defaults to
   * `"Table"` if unset.
   */
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  /** @internal */
  protected readonly hostClasses = computed(() => {
    const classes = ['atl-table', `variant-${this.variant()}`, `size-${this.size()}`];
    if (this.stickyHeader()) classes.push('is-sticky-header');
    return classes.join(' ');
  });
}

// ---------------------------------------------------------------------------
// AtlThead
// ---------------------------------------------------------------------------

/**
 * Table head section. Contains header rows with `atl-tr` and `atl-th`.
 *
 * Usage:
 * ```html
 * <atl-thead>
 *   <atl-tr>
 *     <atl-th sortable [sortDirection]="sort" (sort)="sort = $event">Name</atl-th>
 *   </atl-tr>
 * </atl-thead>
 * ```
 */
@Component({
  selector: 'atl-thead',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<thead><ng-content /></thead>`,
  styleUrl: './atl-table.css',
  host: { '[style.display]': '"contents"' },
})
export class AtlThead {}

// ---------------------------------------------------------------------------
// AtlTbody
// ---------------------------------------------------------------------------

/**
 * Table body section. Shows rows or an empty state.
 *
 * Usage:
 * ```html
 * <atl-tbody [empty]="rows.length === 0" [colSpan]="3">
 *   @for (row of rows; track row.id) {
 *     <atl-tr><atl-td>{{ row.name }}</atl-td></atl-tr>
 *   }
 *   <div atlTableEmpty>No results found.</div>
 * </atl-tbody>
 * ```
 */
@Component({
  selector: 'atl-tbody',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <tbody>
      @if (!empty()) {
        <ng-content />
      } @else {
        <tr>
          <td [attr.colspan]="colSpan()" class="atl-tbody-empty-cell">
            <ng-content select="[atlTableEmpty]" />
          </td>
        </tr>
      }
    </tbody>
  `,
  styleUrl: './atl-table.css',
  host: { '[style.display]': '"contents"' },
})
export class AtlTbody {
  /** When true, hides rows and shows the `[atlTableEmpty]` slot content instead. */
  readonly empty = input(false);

  /** Number of columns to span in the empty-state row. Should match total column count. */
  readonly colSpan = input(1);
}

// ---------------------------------------------------------------------------
// AtlTr
// ---------------------------------------------------------------------------

/**
 * Table row. Use inside `atl-thead` or `atl-tbody`.
 * Set `selectable` to auto-add a checkbox column for row selection.
 *
 * Usage:
 * ```html
 * <atl-tr selectable [selected]="isSelected" (selectedChange)="toggle($event)">
 *   <atl-td>Cell content</atl-td>
 * </atl-tr>
 * ```
 */
@Component({
  selector: 'atl-tr',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtlCheckbox],
  template: `
    <tr
      [attr.aria-selected]="selectable() ? selected() : null"
      [class]="innerClasses()"
    >
      @if (selectable()) {
        <td class="atl-tr-select-cell">
          <atl-checkbox [checked]="selected()" (checkedChange)="selectedChange.emit($event)" />
        </td>
      }
      <ng-content />
    </tr>
  `,
  styleUrl: './atl-table.css',
  host: {
    '[class]': 'hostClasses()',
    '[style.display]': '"contents"',
  },
})
export class AtlTr {
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
// AtlTh
// ---------------------------------------------------------------------------

/** Sort direction for sortable column headers. */
export type AtlSortDirection = 'asc' | 'desc' | null;

/**
 * Table header cell. Set `sortable` to enable sort cycling.
 * The consumer controls `sortDirection` (fully controlled — no internal state).
 *
 * Usage:
 * ```html
 * <atl-th sortable [sortDirection]="nameSortDir" (sort)="nameSortDir = $event">Name</atl-th>
 * ```
 */
@Component({
  selector: 'atl-th',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <th
      [attr.aria-sort]="ariaSort()"
      [style.width]="width() ?? null"
      [class]="cellClasses()"
    >
      @if (sortable()) {
        <button type="button" class="atl-th-sort-btn" (click)="cycleSort()">
          <ng-content />
          <svg
            class="atl-th-sort-icon"
            aria-hidden="true"
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="none"
          >
            <path class="atl-th-sort-asc-arrow" d="M6 2L11 8H1L6 2Z" fill="currentColor" />
            <path class="atl-th-sort-desc-arrow" d="M6 14L1 8H11L6 14Z" fill="currentColor" />
          </svg>
        </button>
      } @else {
        <ng-content />
      }
    </th>
  `,
  styleUrl: './atl-table.css',
  host: { '[style.display]': '"contents"' },
})
export class AtlTh {
  /** Whether this column is sortable. Renders a sort button when true. */
  readonly sortable = input(false);

  /** Current sort direction. Fully controlled — the consumer owns this state. */
  readonly sortDirection = input<AtlSortDirection>(null);

  /** Text alignment of the header cell content. */
  readonly align = input<'start' | 'center' | 'end'>('start');

  /** Fixed column width (e.g. `'120px'`, `'10rem'`). */
  readonly width = input<string | undefined>(undefined);

  /**
   * Emits when the header is clicked.
   * Cycles: `null` → `'asc'` → `'desc'` → `null`.
   */
  readonly sort = output<AtlSortDirection>();

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
    const next: AtlSortDirection =
      current === null ? 'asc' : current === 'asc' ? 'desc' : null;
    this.sort.emit(next);
  }
}

// ---------------------------------------------------------------------------
// AtlTd
// ---------------------------------------------------------------------------

/**
 * Table data cell. Use inside `atl-tr` inside `atl-tbody`.
 *
 * Usage:
 * ```html
 * <atl-td align="end">{{ value }}</atl-td>
 * ```
 */
@Component({
  selector: 'atl-td',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <td [class]="'align-' + align()">
      <ng-content />
    </td>
  `,
  styleUrl: './atl-table.css',
  host: { '[style.display]': '"contents"' },
})
export class AtlTd {
  /** Text alignment of the cell content. */
  readonly align = input<'start' | 'center' | 'end'>('start');
}
