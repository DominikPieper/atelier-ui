import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';

/**
 * Displays a block of code with an optional header, language label, and copy button.
 * Designed for rendering LLM-generated code output, inline snippets, and API examples.
 *
 * Usage:
 * ```html
 * <llm-code-block code="const x = 1;" language="typescript" />
 * <llm-code-block [code]="generatedCode" filename="app.component.ts" [showLineNumbers]="true" />
 * ```
 */
@Component({
  selector: 'llm-code-block',
  standalone: true,
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
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
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
  styleUrl: './llm-code-block.css',
  host: {
    '[class]': '"llm-code-block"',
  },
})
export class LlmCodeBlock {
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
