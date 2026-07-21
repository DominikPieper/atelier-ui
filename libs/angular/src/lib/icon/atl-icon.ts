import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import type { AtlIconName, AtlIconSize } from '../spec';

const ICON_GLYPHS: Record<AtlIconName, string> = {
  success: '✓',
  warning: '⚠',
  danger: '✕',
  info: 'ℹ',
  error: '!',
  'chevron-up': '▲',
  'chevron-down': '▼',
  'chevron-left': '‹',
  'chevron-right': '›',
  'sort-asc': '↑',
  'sort-desc': '↓',
  'arrow-right': '→',
  'arrow-left': '←',
  copy: '⎘',
  paste: '⎗',
  add: '⊕',
  edit: '✏',
  delete: '🗑',
  close: '×',
  more: '…',
  'default-toast': '💬',
};

/**
 * Pictogram glyph icon. 21 named variants matching the Figma `AtlIcon`
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
  template: `{{ glyph() }}`,
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

  protected readonly glyph = computed(() => ICON_GLYPHS[this.name()]);
  protected readonly hostClasses = computed(() => `size-${this.size()}`);
}
