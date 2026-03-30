import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
  viewChildren,
} from '@angular/core';
import { LLM_TAB_GROUP, type LlmTabGroupContext, type TabInfo } from './llm-tabs.token';

let nextId = 0;

/**
 * Accessible tabbed interface container. Renders a tab list and manages
 * keyboard navigation with roving tabindex.
 *
 * Usage:
 * ```html
 * <llm-tab-group [(selectedIndex)]="activeTab">
 *   <llm-tab label="Account">Account settings here.</llm-tab>
 *   <llm-tab label="Notifications">Notification prefs here.</llm-tab>
 *   <llm-tab label="Billing" [disabled]="true">Billing info here.</llm-tab>
 * </llm-tab-group>
 * ```
 */
@Component({
  selector: 'llm-tab-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tablist" role="tablist">
      @for (tab of tabs(); track tab.id; let i = $index) {
        <button
          #tabBtn
          type="button"
          role="tab"
          [id]="tab.tabId"
          [attr.aria-selected]="selectedIndex() === i"
          [attr.aria-controls]="tab.panelId"
          [attr.aria-disabled]="tab.disabled || null"
          [attr.tabindex]="selectedIndex() === i ? 0 : -1"
          [class.is-active]="selectedIndex() === i"
          [class.is-disabled]="tab.disabled"
          (click)="selectTab(i)"
          (keydown)="onTabKeydown($event)"
        >
          {{ tab.label }}
        </button>
      }
    </div>
    <ng-content />
  `,
  styleUrl: './llm-tabs.css',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: LLM_TAB_GROUP, useExisting: LlmTabGroup }],
})
export class LlmTabGroup implements LlmTabGroupContext {
  /** Index of the currently active tab. Supports two-way binding. */
  readonly selectedIndex = model(0);

  /** Visual variant. */
  readonly variant = input<'default' | 'pills'>('default');

  /** @internal */
  readonly tabs = signal<TabInfo[]>([]);

  /** @internal */
  protected readonly tabBtns = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');

  /** @internal */
  protected readonly hostClasses = computed(() => `variant-${this.variant()}`);

  /** @internal — called by LlmTab on init */
  registerTab(info: TabInfo): void {
    this.tabs.update((list) => [...list, info]);
  }

  /** @internal — called by LlmTab on destroy */
  unregisterTab(id: string): void {
    this.tabs.update((list) => list.filter((t) => t.id !== id));
  }

  /** @internal */
  protected selectTab(index: number): void {
    const tab = this.tabs()[index];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (tab && !tab.disabled) {
      this.selectedIndex.set(index);
    }
  }

  /** @internal */
  protected onTabKeydown(event: KeyboardEvent): void {
    const allTabs = this.tabs();
    const enabledIndices = allTabs.map((_, i) => i).filter((i) => !allTabs[i].disabled);
    const len = enabledIndices.length;
    if (len === 0) return;

    const currentPosInEnabled = enabledIndices.indexOf(this.selectedIndex());

    let targetIdx: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        targetIdx = enabledIndices[(currentPosInEnabled + 1) % len];
        break;
      case 'ArrowLeft':
        targetIdx = enabledIndices[(currentPosInEnabled - 1 + len) % len];
        break;
      case 'Home':
        targetIdx = enabledIndices[0];
        break;
      case 'End':
        targetIdx = enabledIndices[len - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    this.selectTab(targetIdx);
    this.tabBtns()[targetIdx]?.nativeElement.focus();
  }
}

/**
 * Individual tab definition. Place inside `<llm-tab-group>`.
 *
 * Usage:
 * ```html
 * <llm-tab label="Settings">Settings content here.</llm-tab>
 * ```
 */
@Component({
  selector: 'llm-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isActive()) {
      <div
        role="tabpanel"
        [id]="panelId"
        [attr.aria-labelledby]="tabId"
        [tabindex]="0"
      >
        <ng-content />
      </div>
    }
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class LlmTab implements OnInit, OnDestroy {
  /** Text displayed on the tab button. Required. */
  readonly label = input.required<string>();

  /** Whether this tab is disabled. */
  readonly disabled = input(false);

  /** @internal */
  readonly tabId = `llm-tab-${nextId}`;

  /** @internal */
  readonly panelId = `llm-tab-panel-${nextId}`;

  /** @internal */
  private readonly id = `llm-tab-instance-${nextId++}`;

  /** @internal */
  private readonly context = inject(LLM_TAB_GROUP);

  /** @internal */
  protected readonly isActive = computed(() => {
    const index = this.context.tabs().findIndex((t) => t.id === this.id);
    return this.context.selectedIndex() === index;
  });

  ngOnInit(): void {
    this.context.registerTab({
      id: this.id,
      label: this.label(),
      disabled: this.disabled(),
      panelId: this.panelId,
      tabId: this.tabId,
    });
  }

  ngOnDestroy(): void {
    this.context.unregisterTab(this.id);
  }
}
