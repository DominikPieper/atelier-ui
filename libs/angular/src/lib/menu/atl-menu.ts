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
 * Trigger directive that opens an `<atl-menu>` dropdown.
 * Apply to any element (typically `<atl-button>`) to wire up click + keyboard open/close.
 *
 * Usage:
 * ```html
 * <atl-button [atlMenuTriggerFor]="myMenu">Open</atl-button>
 * <ng-template #myMenu>
 *   <atl-menu>
 *     <atl-menu-item (triggered)="action()">Action</atl-menu-item>
 *   </atl-menu>
 * </ng-template>
 * ```
 */
@Directive({
  selector: '[atlMenuTriggerFor]',
  standalone: true,
  hostDirectives: [
    {
      directive: CdkMenuTrigger,
      inputs: ['cdkMenuTriggerFor: atlMenuTriggerFor'],
    },
  ],
})
export class AtlMenuTrigger {}

/**
 * Accessible dropdown menu panel.
 * Uses `@angular/cdk/menu` for keyboard navigation, focus management, and ARIA.
 *
 * Usage:
 * ```html
 * <atl-button [atlMenuTriggerFor]="actions">Actions</atl-button>
 * <ng-template #actions>
 *   <atl-menu>
 *     <atl-menu-item (triggered)="onCopy()">Copy</atl-menu-item>
 *     <atl-menu-separator />
 *     <atl-menu-item [disabled]="true">Paste</atl-menu-item>
 *   </atl-menu>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'atl-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [CdkMenu],
  template: `<ng-content />`,
  styleUrl: './atl-menu.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class AtlMenu {
  /** Visual variant. `compact` reduces font size and padding. */
  readonly variant = input<'default' | 'compact'>('default');

  /** @internal */
  protected readonly hostClasses = computed(() => `atl-menu variant-${this.variant()}`);
}

/**
 * A single item inside an `<atl-menu>`.
 * Supports keyboard navigation, disabled state, and nested submenus via `[atlMenuTriggerFor]`.
 *
 * Usage:
 * ```html
 * <atl-menu-item (triggered)="doSomething()">Label</atl-menu-item>
 * <atl-menu-item [disabled]="true">Disabled</atl-menu-item>
 * ```
 */
@Component({
  selector: 'atl-menu-item',
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
      <span class="atl-menu-item-chevron" aria-hidden="true">&#x203A;</span>
    }
  `,
  host: {
    class: 'atl-menu-item',
    '[class.is-disabled]': 'disabled()',
  },
})
export class AtlMenuItem {
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
 * <atl-menu-item>Copy</atl-menu-item>
 * <atl-menu-separator />
 * <atl-menu-item>Delete</atl-menu-item>
 * ```
 */
@Component({
  selector: 'atl-menu-separator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ``,
  host: {
    class: 'atl-menu-separator',
    role: 'separator',
  },
})
export class AtlMenuSeparator {}
