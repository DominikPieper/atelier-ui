import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type { AtlIconName, AtlIconSize } from '../spec';
import { ATL_ICON_GEOMETRY, ATL_ICON_STROKE_WIDTH, ATL_ICON_VIEWBOX } from '../icons';


/**
 * Vector icon. 23 named variants, drawn from the geometry in `icons.ts` so the
 * same shape is used everywhere it appears. Matches the Figma `AtlIcon`
 * component set. Decorative by default; pass `label` to announce a meaning
 * to assistive tech.
 *
 * Usage:
 * ```html
 * <atl-icon name="success" />
 * <atl-icon name="warning" size="lg" label="Warning" />
 * ```
 */
@Component({
  selector: 'atl-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="viewBox"
      [attr.fill]="isStroke() ? 'none' : 'currentColor'"
      [attr.stroke]="isStroke() ? 'currentColor' : null"
      [attr.stroke-width]="isStroke() ? strokeWidth : null"
      [attr.stroke-linecap]="isStroke() ? 'round' : null"
      [attr.stroke-linejoin]="isStroke() ? 'round' : null"
      aria-hidden="true"
      focusable="false"
    >
      @for (d of geometry().paths; track d) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styleUrl: './atl-icon.css',
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': 'label() ? null : "true"',
  },
})
export class AtlIcon {
  readonly name = input.required<AtlIconName>();
  readonly size = input<AtlIconSize>('md');
  readonly label = input<string | undefined>();

  protected readonly viewBox = ATL_ICON_VIEWBOX;
  protected readonly strokeWidth = ATL_ICON_STROKE_WIDTH;
  protected readonly geometry = computed(() => ATL_ICON_GEOMETRY[this.name()]);
  protected readonly isStroke = computed(() => this.geometry().kind === 'stroke');
  protected readonly hostClasses = computed(() => `size-${this.size()}`);
}
