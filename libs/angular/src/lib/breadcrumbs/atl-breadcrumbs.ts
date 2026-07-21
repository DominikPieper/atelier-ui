import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import type { AtlBreadcrumbsSpec } from '../spec';
import { ATL_BREADCRUMBS } from './atl-breadcrumbs.token';

/**
 * Accessible breadcrumb navigation. Wrap `atl-breadcrumb-item` elements inside.
 * The last item is automatically marked as the current page.
 *
 * Usage:
 * ```html
 * <atl-breadcrumbs>
 *   <atl-breadcrumb-item href="/home">Home</atl-breadcrumb-item>
 *   <atl-breadcrumb-item href="/products">Products</atl-breadcrumb-item>
 *   <atl-breadcrumb-item>Widget X</atl-breadcrumb-item>
 * </atl-breadcrumbs>
 * ```
 */
@Component({
  selector: 'atl-breadcrumbs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: ATL_BREADCRUMBS,
      useFactory: (bc: AtlBreadcrumbs) => ({
        registerItem: () => bc.registerItem(),
        unregisterItem: (id: number) => bc.unregisterItem(id),
        lastItemId: bc.lastItemId,
      }),
      deps: [AtlBreadcrumbs],
    },
  ],
  template: `
    <nav aria-label="Breadcrumb">
      <ol role="list" class="list">
        <ng-content />
      </ol>
    </nav>
  `,
  styleUrl: './atl-breadcrumbs.css',
  host: {
    class: 'atl-breadcrumbs',
    '[style.--atl-separator]': 'separatorCssVar()',
  },
})
export class AtlBreadcrumbs {
  readonly separator = input<AtlBreadcrumbsSpec['separator']>('/');

  protected readonly separatorCssVar = computed(() => `'${this.separator()}'`);

  private readonly _itemIds = signal<number[]>([]);
  private _nextId = 0;

  /** @internal — used by AtlBreadcrumbItem via ATL_BREADCRUMBS token */
  readonly lastItemId = computed(() => {
    const ids = this._itemIds();
    return ids.length > 0 ? ids[ids.length - 1] : -1;
  });

  /** @internal */
  registerItem(): number {
    const id = this._nextId++;
    this._itemIds.update((ids) => [...ids, id]);
    return id;
  }

  /** @internal */
  unregisterItem(id: number): void {
    this._itemIds.update((ids) => ids.filter((i) => i !== id));
  }
}

/**
 * A single breadcrumb step. The last item is automatically treated as
 * `aria-current="page"` and rendered as plain text (no link).
 */
@Component({
  selector: 'atl-breadcrumb-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="item">
      <a
        [attr.href]="href() && !isCurrent() ? href() : null"
        [attr.aria-current]="isCurrent() ? 'page' : null"
      ><ng-content /></a>
    </li>
  `,
  styleUrl: './atl-breadcrumbs.css',
  host: {
    class: 'atl-breadcrumb-item',
    '[class.is-current]': 'isCurrent()',
  },
})
export class AtlBreadcrumbItem implements OnInit, OnDestroy {
  /** Optional href for navigation. Ignored on the last (current) item. */
  readonly href = input('');

  private readonly context = inject(ATL_BREADCRUMBS);
  private readonly myIndex = signal(-1);

  protected readonly isCurrent = computed(
    () => this.myIndex() >= 0 && this.myIndex() === this.context.lastItemId()
  );

  ngOnInit(): void {
    this.myIndex.set(this.context.registerItem());
  }

  ngOnDestroy(): void {
    if (this.myIndex() >= 0) {
      this.context.unregisterItem(this.myIndex());
    }
  }
}
