import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

/**
 * Trigger directive that opens an `<llm-menu>` dropdown.
 * Apply to any element (typically `<llm-button>`) to wire up click + keyboard open/close.
 *
 * Usage:
 * ```html
 * <llm-button [llmMenuTriggerFor]="myMenu">Open</llm-button>
 * <ng-template #myMenu>
 *   <llm-menu>
 *     <llm-menu-item (triggered)="action()">Action</llm-menu-item>
 *   </llm-menu>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[llmMenuTriggerFor]',
  standalone: true,
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: ['cdkMenuTriggerFor: llmMenuTriggerFor'],
    },
  ],
})
export class LlmMenuTrigger {}

/**
 * Accessible dropdown menu panel.
 * Uses `@angular/cdk/menu` for keyboard navigation, focus management, and ARIA.
 *
 * Usage:
 * ```html
 * <llm-button [llmMenuTriggerFor]="actions">Actions</llm-button>
 * <ng-template #actions>
 *   <llm-menu>
 *     <llm-menu-item (triggered)="onCopy()">Copy</llm-menu-item>
 *     <llm-menu-separator />
 *     <llm-menu-item [disabled]="true">Paste</llm-menu-item>
 *   </llm-menu>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'llm-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [CdkMenu],
  template: `<ng-content />`,
  styleUrl: './llm-menu.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmMenu {
  /** Visual variant. `compact` reduces font size and padding. */
  readonly variant = input<'default' | 'compact'>('default');

  /** @internal */
  protected readonly hostClasses = computed(() => `llm-menu variant-${this.variant()}`);
}

/**
 * A single item inside an `<llm-menu>`.
 * Supports keyboard navigation, disabled state, and nested submenus via `[llmMenuTriggerFor]`.
 *
 * Usage:
 * ```html
 * <llm-menu-item (triggered)="doSomething()">Label</llm-menu-item>
 * <llm-menu-item [disabled]="true">Disabled</llm-menu-item>
 * ```
 */
@Component({
  selector: 'llm-menu-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: CdkMenuItem,
      inputs: ['cdkMenuItemDisabled: disabled'],
      outputs: ['cdkMenuItemTriggered: triggered'],
    },
  ],
  template: `
    <ng-content />
    @if (hasSubmenu()) {
      <span class="llm-menu-item-chevron" aria-hidden="true">&#x203A;</span>
    }
  `,
  host: {
    class: 'llm-menu-item',
    '[class.is-disabled]': 'disabled()',
  },
})
export class LlmMenuItem {
  /** Whether this menu item is disabled. */
  readonly disabled = input(false);

  /** @internal — detect if this item also triggers a submenu */
  private readonly menuTrigger = inject(CdkMenuTrigger, { optional: true, self: true });

  /** @internal */
  protected readonly hasSubmenu = computed(() => !!this.menuTrigger);
}

/**
 * Visual separator between groups of menu items.
 *
 * Usage:
 * ```html
 * <llm-menu-item>Copy</llm-menu-item>
 * <llm-menu-separator />
 * <llm-menu-item>Delete</llm-menu-item>
 * ```
 */
@Component({
  selector: 'llm-menu-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: {
    class: 'llm-menu-separator',
    role: 'separator',
  },
})
export class LlmMenuSeparator {}
