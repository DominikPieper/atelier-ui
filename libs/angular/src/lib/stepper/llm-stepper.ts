import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { LLM_STEPPER, type LlmStepperContext, type StepInfo } from './llm-stepper.token';

let nextId = 0;

/**
 * Multi-step wizard container.
 *
 * Usage:
 * ```html
 * <llm-stepper [(activeStep)]="step">
 *   <llm-step label="Account">Account form here.</llm-step>
 *   <llm-step label="Profile">Profile form here.</llm-step>
 *   <llm-step label="Review">Review and submit.</llm-step>
 * </llm-stepper>
 * ```
 */
@Component({
  selector: 'llm-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper-header" role="tablist">
      @for (step of steps(); track step.id; let i = $index; let last = $last) {
        <div
          class="step-item"
          [class.is-active]="activeStep() === i"
          [class.is-completed]="step.completed && activeStep() !== i"
          [class.is-error]="step.error"
          [class.is-disabled]="step.disabled"
        >
          <button
            type="button"
            role="tab"
            class="step-circle"
            [id]="'llm-step-' + i"
            [attr.aria-label]="step.label"
            [attr.aria-selected]="activeStep() === i"
            [attr.aria-controls]="'llm-step-panel-' + i"
            [attr.aria-disabled]="step.disabled || null"
            [attr.tabindex]="activeStep() === i ? 0 : -1"
            [disabled]="step.disabled || null"
            (click)="goTo(i)"
          >
            @if (step.completed && !step.error) {
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            } @else if (step.error) {
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            } @else {
              {{ i + 1 }}
            }
          </button>
          <div class="step-text">
            <span class="step-label">{{ step.label }}</span>
            @if (step.description) {
              <span class="step-description">{{ step.description }}</span>
            }
            @if (step.optional && !step.completed) {
              <span class="step-optional">Optional</span>
            }
          </div>
        </div>
        @if (!last) {
          <div
            class="step-connector"
            [class.is-active]="activeStep() > i || step.completed"
          ></div>
        }
      }
    </div>
    <div class="stepper-content">
      <ng-content />
    </div>
  `,
  styleUrl: './llm-stepper.css',
  host: {
    '[class]': 'hostClasses()',
  },
  providers: [{ provide: LLM_STEPPER, useExisting: LlmStepper }],
})
export class LlmStepper implements LlmStepperContext {
  /** Index of the currently active step. Supports two-way binding. */
  readonly activeStep = model(0);

  /** Layout orientation. */
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');

  /**
   * When true, users can only navigate to completed steps or the next pending step.
   * Use `goTo()` / `next()` in your step content to advance programmatically.
   */
  readonly linear = input(false);

  /** @internal */
  readonly steps = signal<StepInfo[]>([]);

  /** @internal */
  protected readonly hostClasses = computed(
    () => `orientation-${this.orientation()}`
  );

  /** @internal — called by LlmStep on init */
  registerStep(info: StepInfo): void {
    this.steps.update((list) => [...list, info]);
  }

  /** @internal — called by LlmStep on destroy */
  unregisterStep(id: string): void {
    this.steps.update((list) => list.filter((s) => s.id !== id));
  }

  /** @internal — called by LlmStep effect when inputs change */
  updateStep(id: string, info: Partial<StepInfo>): void {
    this.steps.update((list) =>
      list.map((s) => (s.id === id ? { ...s, ...info } : s))
    );
  }

  /** Navigate to a specific step index. Respects linear mode. */
  goTo(index: number): void {
    const steps = this.steps();
    if (index < 0 || index >= steps.length) return;
    if (steps[index].disabled) return;
    if (this.linear()) {
      // In linear mode, only allow going back or to the next uncompleted step
      const canGoForward = steps.slice(0, index).every((s) => s.completed || s.optional);
      if (index > this.activeStep() && !canGoForward) return;
    }
    this.activeStep.set(index);
  }

  /** Advance to the next step. */
  next(): void {
    this.goTo(this.activeStep() + 1);
  }

  /** Go back to the previous step. */
  prev(): void {
    const prev = this.activeStep() - 1;
    if (prev < 0) return;
    const steps = this.steps();
    if (steps[prev]?.disabled) return;
    this.activeStep.set(prev);
  }
}

/**
 * Individual step. Place inside `<llm-stepper>`.
 *
 * Usage:
 * ```html
 * <llm-step label="Account">Account form here.</llm-step>
 * ```
 */
@Component({
  selector: 'llm-step',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isActive()) {
      <div
        role="tabpanel"
        [id]="'llm-step-panel-' + myIndex()"
        [attr.aria-labelledby]="'llm-step-' + myIndex()"
        tabindex="0"
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
export class LlmStep implements OnInit, OnDestroy {
  /** Text displayed on the step indicator. Required. */
  readonly label = input.required<string>();

  /** Optional subtitle shown below the label. */
  readonly description = input<string | undefined>(undefined);

  /** Mark this step as completed (shows a checkmark). */
  readonly completed = input(false);

  /** Mark this step as having an error (shows an X). */
  readonly error = input(false);

  /** Mark this step as optional. */
  readonly optional = input(false);

  /** Whether this step is disabled. */
  readonly disabled = input(false);

  /** @internal */
  private readonly id = `llm-step-instance-${nextId++}`;

  /** @internal */
  private readonly context = inject(LLM_STEPPER);

  /** @internal */
  protected readonly myIndex = computed(() =>
    this.context.steps().findIndex((s) => s.id === this.id)
  );

  /** @internal */
  protected readonly isActive = computed(
    () => this.context.activeStep() === this.myIndex()
  );

  constructor() {
    // Keep step info in sync when inputs change
    effect(() => {
      if (this.myIndex() === -1) return;
      this.context.updateStep(this.id, {
        label: this.label(),
        description: this.description(),
        completed: this.completed(),
        error: this.error(),
        optional: this.optional(),
        disabled: this.disabled(),
      });
    });
  }

  ngOnInit(): void {
    this.context.registerStep({
      id: this.id,
      label: this.label(),
      description: this.description(),
      completed: this.completed(),
      error: this.error(),
      optional: this.optional(),
      disabled: this.disabled(),
    });
  }

  ngOnDestroy(): void {
    this.context.unregisterStep(this.id);
  }
}
