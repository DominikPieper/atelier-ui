import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  Signal,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import type { AtlBreadcrumbsSpec } from '../spec';
import { ATL_BREADCRUMBS } from './atl-breadcrumbs.token';

/**
 * Accessible breadcrumb navigation. Wrap `atl-breadcrumb-item` elements inside.
 * The last item is automatically marked as the current page, unless an item sets
 * `current` itself. If any item does, only explicit values count: `[current]="true"`
 * on the item that is the page, or `[current]="false"` for a trail with no current
 * page.
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
        registerItem: (explicit: Signal<boolean | undefined>) =>
          bc.registerItem(explicit),
        unregisterItem: (id: number) => bc.unregisterItem(id),
        lastItemId: bc.lastItemId,
        hasExplicitCurrent: bc.hasExplicitCurrent,
      }),
      deps: [AtlBreadcrumbs],
    },
  ],
  template: `
    <nav aria-label="Breadcrumb">
      <ol role="list" class="breadcrumbs-list">
        <ng-content />
      </ol>
    </nav>
  `,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/breadcrumbs/atl-breadcrumbs.css',
  host: {
    class: 'atl-breadcrumbs',
    '[style.--atl-separator]': 'separatorCssVar()',
  },
})
export class AtlBreadcrumbs {
  /** Separator character shown between breadcrumb items. Default `/`. */
  readonly separator = input<AtlBreadcrumbsSpec['separator']>('/');

  protected readonly separatorCssVar = computed(() => `'${this.separator()}'`);

  private readonly _items = signal<
    { id: number; explicit: Signal<boolean | undefined> }[]
  >([]);
  private _nextId = 0;

  /** @internal — used by AtlBreadcrumbItem via ATL_BREADCRUMBS token */
  readonly lastItemId = computed(() => {
    const items = this._items();
    return items.length > 0 ? items[items.length - 1].id : -1;
  });

  /** @internal */
  readonly hasExplicitCurrent = computed(() =>
    this._items().some((item) => item.explicit() !== undefined),
  );

  /** @internal */
  registerItem(explicit: Signal<boolean | undefined>): number {
    const id = this._nextId++;
    this._items.update((items) => [...items, { id, explicit }]);
    return id;
  }

  /** @internal */
  unregisterItem(id: number): void {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }
}

/**
 * A single breadcrumb step. The last item is automatically treated as
 * `aria-current="page"` and rendered as plain text (no link), unless `current`
 * is set on any item (see `AtlBreadcrumbs`).
 */
@Component({
  selector: 'atl-breadcrumb-item',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The host is the list item, as the <li> is in React and Vue: it carries
  // role="listitem" instead of wrapping an <li>, so the item is a direct child of
  // the <ol> and the shared stylesheet's `.atl-breadcrumb-item > .breadcrumb-link`
  // matches in all three frameworks. The current page is a <span aria-current="page">
  // there as well, not an <a> without an href.
  template: `
    <ng-template #label><ng-content /></ng-template>
    @if (href() && !isCurrent()) {
      <a class="breadcrumb-link" [attr.href]="href()">
        <ng-container *ngTemplateOutlet="label" />
      </a>
    } @else if (isCurrent()) {
      <span class="breadcrumb-current" aria-current="page">
        <ng-container *ngTemplateOutlet="label" />
      </span>
    } @else {
      <span class="breadcrumb-text">
        <ng-container *ngTemplateOutlet="label" />
      </span>
    }
  `,
  // Class-rooted CSS shared with React and Vue (libs/styles): the root class below
  // is what scopes it, so Emulated encapsulation is switched off.
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../../../../styles/src/breadcrumbs/atl-breadcrumbs.css',
  host: {
    class: 'atl-breadcrumb-item',
    role: 'listitem',
    '[class.is-current]': 'isCurrent()',
  },
})
export class AtlBreadcrumbItem implements OnInit, OnDestroy {
  /** Optional href for navigation. Ignored on the current item. */
  readonly href = input('');

  /**
   * Whether this is the current page. Leave it unset and the last item is the
   * current page; set it on any item and only explicit values count.
   */
  readonly current = input<boolean | undefined, boolean | string | undefined>(
    undefined,
    {
      transform: (value) =>
        value === undefined ? undefined : booleanAttribute(value),
    },
  );

  private readonly context = inject(ATL_BREADCRUMBS);
  private readonly myIndex = signal(-1);

  protected readonly isCurrent = computed(() => {
    if (this.context.hasExplicitCurrent()) return this.current() === true;
    return this.myIndex() >= 0 && this.myIndex() === this.context.lastItemId();
  });

  ngOnInit(): void {
    this.myIndex.set(this.context.registerItem(this.current));
  }

  ngOnDestroy(): void {
    if (this.myIndex() >= 0) {
      this.context.unregisterItem(this.myIndex());
    }
  }
}
