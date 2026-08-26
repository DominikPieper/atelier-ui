import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { AtlIcon } from '../icon/atl-icon';

/**
 * Displays a block of code with an optional header, language label, and copy button.
 * Designed for rendering LLM-generated code output, inline snippets, and API examples.
 *
 * Usage:
 * ```html
 * <atl-code-block code="const x = 1;" language="typescript" />
 * <atl-code-block [code]="generatedCode" filename="app.component.ts" [showLineNumbers]="true" />
 * ```
 */
@Component({
  selector: 'atl-code-block',
  standalone: true,
  imports: [AtlIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block-header">
      <span class="code-block-label">{{ displayLabel() }}</span>
      @if (copyable()) {
        <button
          class="code-block-copy"
          type="button"
          [attr.aria-label]="copied() ? 'Copied' : 'Copy code'"
          (click)="copy()"
        >
          @if (copied()) {
            <atl-icon name="check" size="sm" />
            Copied
          } @else {
            <atl-icon name="copy" size="sm" />
            Copy
          }
        </button>
      }
    </div>
    <div class="code-block-body">
      <pre class="code-block-pre"><code>@if (showLineNumbers()) {
          @for (line of lines(); track $index) {
            <span class="code-line">
              <span class="code-line-number">{{ $index + 1 }}</span>
              <span class="code-line-text">{{ line }}</span>
            </span>
          }
        } @else {
          {{ code() }}
        }</code></pre>
    </div>
  `,
  styleUrl: './atl-code-block.css',
  host: {
    '[class]': '"atl-code-block"',
  },
})
export class AtlCodeBlock {
  /** The code string to display. */
  readonly code = input<string>('');

  /** Language label shown in the header. Ignored if filename is set. */
  readonly language = input<string>('text');

  /** Optional filename shown in the header instead of the language label. */
  readonly filename = input<string>('');

  /** Whether to show a copy-to-clipboard button. */
  readonly copyable = input<boolean>(true);

  /** Whether to display line numbers alongside the code. */
  readonly showLineNumbers = input<boolean>(false);

  protected readonly copied = signal(false);

  protected readonly displayLabel = computed(() => this.filename() || this.language());

  protected readonly lines = computed(() => this.code().split('\n'));

  protected copy(): void {
    void navigator.clipboard.writeText(this.code()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1800);
    });
  }
}
