import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

/** Action button of the fixture design system. */
@Component({
  selector: 'n-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button
    type="button"
    [disabled]="disabled()"
    (click)="pressed.emit()"
  >
    <ng-content />
  </button>`,
})
export class NButton {
  /** Visual emphasis. */
  readonly variant = input<'primary' | 'secondary'>('primary');
  /** Size of the button. */
  readonly size = input<'sm' | 'md'>('md');
  /** Colour family; code-only, Figma draws no axis for it. */
  readonly tone = input<'neutral' | 'brand'>('neutral');
  /** Whether the button is toggled on. */
  readonly selected = input(false);
  /** Whether the button is disabled. */
  readonly disabled = input(false);
  /** Emitted when the button is pressed. */
  readonly pressed = output<void>();
}
