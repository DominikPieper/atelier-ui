import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CdkAccordion, CdkAccordionItem } from '@angular/cdk/accordion';
import { LLM_ACCORDION_GROUP, type AccordionItem, type LlmAccordionGroupContext } from './llm-accordion.token';

let nextId = 0;

/**
 * Container that manages accordion items. Controls single vs multi expansion
 * and provides keyboard navigation across items.
 *
 * Usage:
 * ```html
 * <llm-accordion-group [multi]="true" variant="separated">
 *   <llm-accordion-item [(expanded)]="open">
 *     <span llmAccordionHeader>Title</span>
 *     Body content here.
 *   </llm-accordion-item>
 * </llm-accordion-group>
 * ```
 */
@Component({
  selector: 'llm-accordion-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-accordion.css',
  hostDirectives: [{ directive: CdkAccordion, inputs: ['multi'] }],
  host: {
    '[class]': 'hostClasses()',
    role: 'presentation',
  },
  providers: [{ provide: LLM_ACCORDION_GROUP, useExisting: LlmAccordionGroup }],
})
export class LlmAccordionGroup implements LlmAccordionGroupContext {
  /** Allow multiple items to be expanded simultaneously. */
  readonly multi = input(false);

  /** Visual variant. */
  readonly variant = input<'default' | 'bordered' | 'separated'>('default');

  /** @internal */
  protected readonly hostClasses = computed(() => `variant-${this.variant()}`);

  /** @internal */
  private readonly items = signal<AccordionItem[]>([]);

  register(item: AccordionItem): void {
    this.items.update((list) => [...list, item]);
  }

  unregister(item: AccordionItem): void {
    this.items.update((list) => list.filter((i) => i !== item));
  }

  handleKeydown(event: KeyboardEvent, item: AccordionItem): void {
    const allItems = this.items();
    const enabled = allItems.filter((i) => !i.isItemDisabled());
    if (enabled.length === 0) return;

    const pos = enabled.indexOf(item);
    const n = enabled.length;
    let target: AccordionItem | null = null;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        target = enabled[(pos + 1) % n];
        break;
      case 'ArrowUp':
        event.preventDefault();
        target = enabled[(pos - 1 + n) % n];
        break;
      case 'Home':
        event.preventDefault();
        target = enabled[0];
        break;
      case 'End':
        event.preventDefault();
        target = enabled[n - 1];
        break;
    }

    target?.focusTrigger();
  }
}

/**
 * Directive to mark the accordion header content.
 */
@Directive({
  selector: '[llmAccordionHeader]',
  standalone: true,
})
export class LlmAccordionHeader {}

/**
 * Individual collapsible accordion item. Place inside `<llm-accordion-group>`.
 *
 * Usage:
 * ```html
 * <llm-accordion-item [(expanded)]="isOpen">
 *   <span llmAccordionHeader>Section Title</span>
 *   Section content goes here.
 * </llm-accordion-item>
 * ```
 */
@Component({
  selector: 'llm-accordion-item',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkAccordionItem],
  template: `
    <h3 class="accordion-heading">
      <button
        type="button"
        class="accordion-trigger"
        [id]="triggerId"
        [attr.aria-expanded]="isExpanded()"
        [attr.aria-controls]="panelId"
        [attr.aria-disabled]="disabled() || null"
        [class.is-disabled]="disabled()"
        (click)="onToggle()"
        (keydown)="onKeydown($event)"
      >
        <ng-content select="[llmAccordionHeader]" />
        <svg
          class="chevron"
          [class.is-expanded]="isExpanded()"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </h3>
    <div
      class="accordion-panel-wrapper"
      [class.is-expanded]="isExpanded()"
    >
      <div
        role="region"
        [id]="panelId"
        [attr.aria-labelledby]="triggerId"
        class="accordion-panel"
      >
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './llm-accordion.css',
  host: {
    '[attr.data-accordion-id]': 'id',
  },
})
export class LlmAccordionItem implements AccordionItem, OnInit, OnDestroy {
  /** Whether this item is expanded. Supports two-way binding. */
  readonly expanded = model(false);

  /** Whether this item is disabled. */
  readonly disabled = input(false);

  /** @internal */
  readonly id = `llm-accordion-item-${nextId++}`;

  /** @internal */
  readonly triggerId = `${this.id}-trigger`;

  /** @internal */
  readonly panelId = `${this.id}-panel`;

  /** @internal */
  private readonly group = inject(LlmAccordionGroup);

  /** @internal */
  private readonly cdkItem = inject(CdkAccordionItem);

  /** @internal */
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  /** @internal */
  protected readonly isExpanded = signal(false);

  constructor() {
    this.cdkItem.expandedChange.subscribe((expanded: boolean) => {
      this.isExpanded.set(expanded);
      this.expanded.set(expanded);
    });
  }

  ngOnInit(): void {
    this.group.register(this);
    // Sync initial expanded model
    if (this.expanded()) {
      this.cdkItem.open();
    }
  }

  ngOnDestroy(): void {
    this.group.unregister(this);
  }

  /** @internal — for FocusKeyManager */
  focusTrigger(): void {
    this.el.nativeElement.querySelector<HTMLButtonElement>('.accordion-trigger')?.focus();
  }

  /** @internal — for FocusKeyManager */
  isItemDisabled(): boolean {
    return this.disabled();
  }

  /** @internal */
  protected onToggle(): void {
    if (this.disabled()) return;
    this.cdkItem.toggle();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    this.group.handleKeydown(event, this);
  }
}
