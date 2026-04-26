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
    '[class]': 'hostClassesValue',
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
  get hostClassesValue(): string {
    return this.hostClasses();
  }

  /** @internal */
  private readonly items = signal<AccordionItem[]>([]);

  register(item: AccordionItem): void {
    this.items.update((list) => [...list, item]);
  }

  unregister(item: AccordionItem): void {
    this.items.update((list) => list.filter((i) => i !== item));
  }

  handleKeydown(event: KeyboardEvent, item: AccordionItem): void {
    const enabledItems = this.items().filter((i) => !i.disabled);
    const len = enabledItems.length;
    if (len === 0) return;

    const currentIdx = enabledItems.indexOf(item);

    let targetItem: AccordionItem | null = null;

    switch (event.key) {
      case 'ArrowDown':
        targetItem = enabledItems[(currentIdx + 1) % len];
        break;
      case 'ArrowUp':
        targetItem = enabledItems[(currentIdx - 1 + len) % len];
        break;
      case 'Home':
        targetItem = enabledItems[0];
        break;
      case 'End':
        targetItem = enabledItems[len - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    targetItem.focus();
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
    <div role="heading" [attr.aria-level]="headingLevel()" class="accordion-heading">
      <button
        type="button"
        class="accordion-trigger"
        [id]="triggerId"
        [attr.aria-expanded]="isExpandedValue"
        [attr.aria-controls]="panelId"
        [attr.aria-disabled]="ariaDisabled"
        [class.is-disabled]="isDisabled"
        (click)="onToggle()"
        (keydown)="onKeydown($event)"
      >
        <ng-content select="[llmAccordionHeader]" />
        <svg
          class="chevron"
          [class.is-expanded]="isExpandedValue"
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
    </div>
    <div
      class="accordion-panel-wrapper"
      [class.is-expanded]="isExpandedValue"
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
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly disabledInput = input(false, { alias: 'disabled' });

  /**
   * HTML heading level wrapping the trigger button. Default `3`.
   * Match your page's heading outline so heading order stays valid.
   * Rendered as `<div role="heading" aria-level="N">` so screen
   * readers treat it as a real heading at that level.
   */
  readonly headingLevel = input<1 | 2 | 3 | 4 | 5 | 6>(3);

  /** @internal — satisfies AccordionItem / FocusableOption interface */
  get disabled(): boolean {
    return this.disabledInput();
  }

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

  /** @internal */
  get isExpandedValue(): boolean {
    return this.isExpanded();
  }

  /** @internal */
  get isDisabled(): boolean {
    return this.disabledInput();
  }

  /** @internal */
  get ariaDisabled(): boolean | null {
    return this.disabledInput() || null;
  }

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
  focus(): void {
    this.el.nativeElement.querySelector<HTMLButtonElement>('.accordion-trigger')?.focus();
  }

  /** @internal */
  protected onToggle(): void {
    if (this.disabledInput()) return;
    this.cdkItem.toggle();
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    this.group.handleKeydown(event, this);
  }
}
