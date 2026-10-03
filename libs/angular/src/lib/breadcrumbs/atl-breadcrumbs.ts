import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  signal,
  ViewEncapsulation,
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
  /** Optional href for navigation. Ignored on the last (current) item. */
  readonly href = input('');

  private readonly context = inject(ATL_BREADCRUMBS);
  private readonly myIndex = signal(-1);

  protected readonly isCurrent = computed(
    () => this.myIndex() >= 0 && this.myIndex() === this.context.lastItemId(),
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
