import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  input,
  OnDestroy,
  signal,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
  type ConnectedPosition,
  type OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

let nextTooltipId = 0;

/** @internal — Rendered inside the CDK overlay when the tooltip is visible. */
@Component({
  selector: 'atl-tooltip-content',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // eslint-disable-next-line @angular-eslint/use-component-view-encapsulation
  encapsulation: ViewEncapsulation.None,
  template: `{{ text() }}`,
  styleUrl: './atl-tooltip.css',
  host: {
    class: 'atl-tooltip',
    role: 'tooltip',
    '[id]': 'tooltipId()',
  },
})
export class AtlTooltipContent {
  /** @internal */
  readonly text = input('');
  /** @internal */
  readonly tooltipId = input('');
}

const POSITIONS: Record<string, ConnectedPosition[]> = {
  above: [
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
  ],
  below: [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 },
  ],
  left: [
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
  ],
  right: [
    { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 },
    { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 },
  ],
};

/**
 * Attribute directive that displays a text tooltip on hover or focus.
 * Uses `@angular/cdk/overlay` for viewport-aware positioning.
 *
 * Usage:
 * ```html
 * <atl-button atlTooltip="Save your changes">Save</atl-button>
 * <atl-button atlTooltip="Copy to clipboard" atlTooltipPosition="right">Copy</atl-button>
 * ```
 */
@Directive({
  selector: '[atlTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
    '(keydown.escape)': 'hide()',
    '[attr.aria-describedby]': 'activeTooltipId()',
  },
})
export class AtlTooltip implements OnDestroy {
  /** The tooltip text. */
  readonly atlTooltip = input.required<string>();

  /** Preferred tooltip placement. Falls back to the opposite side if clipped. */
  readonly atlTooltipPosition = input<'above' | 'below' | 'left' | 'right'>('above');

  /** Disable the tooltip without removing the directive. */
  readonly atlTooltipDisabled = input(false);

  /** Delay in ms before the tooltip appears. */
  readonly atlTooltipShowDelay = input(300);

  /** Delay in ms before the tooltip hides. */
  readonly atlTooltipHideDelay = input(0);

  private readonly injector = inject(Injector);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private overlayRef: OverlayRef | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  /** @internal — links host aria-describedby to the tooltip element */
  protected readonly activeTooltipId = signal<string | null>(null);

  /** @internal */
  protected show(): void {
    if (this.atlTooltipDisabled() || !this.atlTooltip()) return;
    this.clearHideTimer();

    if (this.overlayRef?.hasAttached()) return;

    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      this.attach();
    }, this.atlTooltipShowDelay());
  }

  /** @internal */
  protected hide(): void {
    this.clearShowTimer();

    if (!this.overlayRef?.hasAttached()) return;

    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.overlayRef?.detach();
      this.activeTooltipId.set(null);
    }, this.atlTooltipHideDelay());
  }

  ngOnDestroy(): void {
    this.clearShowTimer();
    this.clearHideTimer();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  private attach(): void {
    if (!this.overlayRef) {
      this.overlayRef = this.createOverlay();
    }

    if (this.overlayRef.hasAttached()) return;

    const id = `atl-tooltip-${nextTooltipId++}`;
    const portal = new ComponentPortal(AtlTooltipContent);
    const ref = this.overlayRef.attach(portal);
    ref.setInput('text', this.atlTooltip());
    ref.setInput('tooltipId', id);
    this.activeTooltipId.set(id);
  }

  private createOverlay(): OverlayRef {
    const positions = POSITIONS[this.atlTooltipPosition()] ?? POSITIONS['above'];

    const positionStrategy = createFlexibleConnectedPositionStrategy(
      this.injector,
      this.elementRef,
    )
      .withPositions(positions)
      .withFlexibleDimensions(false)
      .withPush(true);

    const scrollStrategy = createRepositionScrollStrategy(this.injector);

    return createOverlayRef(this.injector, {
      positionStrategy,
      scrollStrategy,
      panelClass: 'atl-tooltip-panel',
    });
  }

  private clearShowTimer(): void {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }
}
