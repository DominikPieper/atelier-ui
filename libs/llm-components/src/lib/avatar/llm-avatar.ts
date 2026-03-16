import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChildren,
  effect,
  input,
  signal,
  untracked,
} from '@angular/core';

/**
 * Displays a user avatar with image, initials, or icon fallback.
 *
 * Fallback order: image → initials (from `name`) → generic icon.
 *
 * Usage:
 * ```html
 * <llm-avatar src="https://example.com/photo.jpg" name="Jane Doe" />
 * <llm-avatar name="John Smith" size="lg" status="online" />
 * <llm-avatar size="sm" shape="square" />
 * ```
 */
@Component({
  selector: 'llm-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (src() && showImage()) {
      <img [src]="src()" [alt]="alt()" (error)="showImage.set(false)" />
    } @else if (initials()) {
      <span class="initials" aria-hidden="true">{{ initials() }}</span>
    } @else {
      <svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.343-10 4v2h20v-2c0-2.657-6.686-4-10-4z" />
      </svg>
    }
    @if (status()) {
      <span [class]="'status-dot status-' + status()" aria-hidden="true"></span>
    }
  `,
  styleUrl: './llm-avatar.css',
  host: {
    '[class]': 'hostClasses()',
    role: 'img',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class LlmAvatar {
  /** Image URL. Falls back to initials or icon if empty or fails to load. */
  readonly src = input('');

  /** Alt text for the image (also used as aria-label). */
  readonly alt = input('');

  /** Full name used to generate initials fallback and default aria-label. */
  readonly name = input('');

  /** Size of the avatar. */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  /** Shape of the avatar. */
  readonly shape = input<'circle' | 'square'>('circle');

  /** Presence status indicator dot. Empty string hides the dot. */
  readonly status = input<'online' | 'offline' | 'away' | 'busy' | ''>('');

  /** @internal — reset to true whenever src changes */
  protected readonly showImage = signal(true);

  /** @internal */
  protected readonly initials = computed(() => {
    const name = this.name();
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  });

  /** @internal */
  protected readonly ariaLabel = computed(
    () => this.alt() || this.name() || 'Avatar'
  );

  /** @internal */
  protected readonly hostClasses = computed(
    () => `size-${this.size()} shape-${this.shape()}`
  );

  constructor() {
    effect(() => {
      this.src(); // track src changes
      untracked(() => this.showImage.set(true));
    });
  }
}

/**
 * Groups multiple avatars with overlap and an overflow count badge.
 *
 * Usage:
 * ```html
 * <llm-avatar-group [max]="3" size="md">
 *   <llm-avatar name="Alice" />
 *   <llm-avatar name="Bob" />
 *   <llm-avatar name="Charlie" />
 *   <llm-avatar name="Dave" />
 * </llm-avatar-group>
 * ```
 */
@Component({
  selector: 'llm-avatar-group',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content />
    @if (overflowCount() > 0) {
      <span [class]="'overflow-badge size-' + size()">+{{ overflowCount() }}</span>
    }
  `,
  styleUrl: './llm-avatar.css',
  host: {
    class: 'group',
    '[class]': '"group size-" + size()',
  },
})
export class LlmAvatarGroup {
  /** Maximum visible avatars before showing an overflow count. */
  readonly max = input(5);

  /** Size applied to the overflow badge (match the size used on child avatars). */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  private readonly avatarEls = contentChildren(LlmAvatar, { read: ElementRef });

  protected readonly overflowCount = computed(() =>
    Math.max(0, this.avatarEls().length - this.max())
  );

  constructor() {
    effect(() => {
      const max = this.max();
      this.avatarEls().forEach((el, i) => {
        (el.nativeElement as HTMLElement).style.display = i >= max ? 'none' : '';
      });
    });
  }
}
