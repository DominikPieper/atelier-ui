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
import { LLM_BREADCRUMBS } from './llm-breadcrumbs.token';

/**
 * Accessible breadcrumb navigation. Wrap `llm-breadcrumb-item` elements inside.
 * The last item is automatically marked as the current page.
 *
 * Usage:
 * ```html
 * <llm-breadcrumbs>
 *   <llm-breadcrumb-item href="/home">Home</llm-breadcrumb-item>
 *   <llm-breadcrumb-item href="/products">Products</llm-breadcrumb-item>
 *   <llm-breadcrumb-item>Widget X</llm-breadcrumb-item>
 * </llm-breadcrumbs>
 * ```
 */
@Component({
  selector: 'llm-breadcrumbs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: LLM_BREADCRUMBS,
      useFactory: (bc: LlmBreadcrumbs) => ({
        registerItem: () => bc.registerItem(),
        unregisterItem: (id: number) => bc.unregisterItem(id),
        lastItemId: bc.lastItemId,
      }),
      deps: [LlmBreadcrumbs],
    },
  ],
  template: `
    <nav aria-label="Breadcrumb">
      <ol role="list" class="list">
        <ng-content />
      </ol>
    </nav>
  `,
  styleUrl: './llm-breadcrumbs.css',
})
export class LlmBreadcrumbs {
  private readonly _itemIds = signal<number[]>([]);
  private _nextId = 0;

  /** @internal — used by LlmBreadcrumbItem via LLM_BREADCRUMBS token */
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
  selector: 'llm-breadcrumb-item',
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
  styleUrl: './llm-breadcrumbs.css',
  host: {
    '[class.is-current]': 'isCurrent()',
  },
})
export class LlmBreadcrumbItem implements OnInit, OnDestroy {
  /** Optional href for navigation. Ignored on the last (current) item. */
  readonly href = input('');

  private readonly context = inject(LLM_BREADCRUMBS);
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
