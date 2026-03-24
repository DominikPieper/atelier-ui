import {
  createContext,
  useContext,
  useState,
  ReactNode,
  HTMLAttributes,
  Children,
  isValidElement,
  useMemo,
} from 'react';
import type { LlmStepperSpec, LlmStepSpec } from '@atelier-ui/spec';
import './llm-stepper.css';

interface StepInfo {
  label: string;
  description?: string;
  completed: boolean;
  error: boolean;
  optional: boolean;
  disabled: boolean;
}

interface StepperContextValue {
  activeStep: number;
  setActiveStep: (i: number) => void;
  steps: StepInfo[];
  linear: boolean;
  next(): void;
  prev(): void;
  goTo(i: number): void;
}

const StepperContext = createContext<StepperContextValue>({
  activeStep: 0,
  setActiveStep: () => undefined,
  steps: [],
  linear: false,
  next: () => undefined,
  prev: () => undefined,
  goTo: () => undefined,
});

/** Access stepper navigation from within step content. */
export function useLlmStepper() {
  return useContext(StepperContext);
}

export interface LlmStepperProps
  extends HTMLAttributes<HTMLDivElement>,
    LlmStepperSpec {
  /** Currently active step index. */
  activeStep?: number;
  /** Callback when the active step changes. */
  onActiveStepChange?: (index: number) => void;
  /** Layout orientation. */
  orientation?: 'horizontal' | 'vertical';
  /** Restrict forward navigation until previous steps are completed. */
  linear?: boolean;
  children?: ReactNode;
}

export function LlmStepper({
  activeStep: externalStep,
  onActiveStepChange,
  orientation = 'horizontal',
  linear = false,
  children,
  className,
  ...rest
}: LlmStepperProps) {
  const [internalStep, setInternalStep] = useState(externalStep ?? 0);
  const isControlled = externalStep !== undefined;
  const activeStep = isControlled ? externalStep : internalStep;

  const setStep = (i: number) => {
    if (!isControlled) setInternalStep(i);
    onActiveStepChange?.(i);
  };

  const childArray = Children.toArray(children);
  const steps: StepInfo[] = useMemo(
    () =>
      childArray
        .filter(
          (c) =>
            isValidElement(c) &&
            (c.type as { displayName?: string }).displayName === 'LlmStep'
        )
        .map((c: any) => ({
          label: c.props.label ?? '',
          description: c.props.description,
          completed: c.props.completed ?? false,
          error: c.props.error ?? false,
          optional: c.props.optional ?? false,
          disabled: c.props.disabled ?? false,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children]
  );

  const goTo = (i: number) => {
    if (i < 0 || i >= steps.length) return;
    if (steps[i]?.disabled) return;
    if (linear && i > activeStep) {
      const canAdvance = steps.slice(0, i).every((s) => s.completed || s.optional);
      if (!canAdvance) return;
    }
    setStep(i);
  };

  const next = () => goTo(activeStep + 1);
  const prev = () => {
    const p = activeStep - 1;
    if (p >= 0 && !steps[p]?.disabled) setStep(p);
  };

  const classes = [
    'llm-stepper',
    `orientation-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const stepPanels = childArray.filter(
    (c) =>
      isValidElement(c) &&
      (c.type as { displayName?: string }).displayName === 'LlmStep'
  );

  return (
    <StepperContext.Provider value={{ activeStep, setActiveStep: setStep, steps, linear, next, prev, goTo }}>
      <div className={classes} {...rest}>
        <div className="stepper-header" role="tablist">
          {steps.map((step, i) => {
            const isActive = activeStep === i;
            const isCompleted = step.completed && !isActive;
            const itemClass = [
              'step-item',
              isActive && 'is-active',
              isCompleted && 'is-completed',
              step.error && 'is-error',
              step.disabled && 'is-disabled',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <>
                <div key={i} className={itemClass}>
                  <button
                    type="button"
                    role="tab"
                    id={`llm-step-${i}`}
                    className="step-circle"
                    aria-label={step.label}
                    aria-selected={isActive}
                    aria-controls={`llm-step-panel-${i}`}
                    aria-disabled={step.disabled || undefined}
                    tabIndex={isActive ? 0 : -1}
                    disabled={step.disabled}
                    onClick={() => goTo(i)}
                  >
                    {step.completed && !step.error ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : step.error ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </button>
                  <div className="step-text">
                    <span className="step-label">{step.label}</span>
                    {step.description && (
                      <span className="step-description">{step.description}</span>
                    )}
                    {step.optional && !step.completed && (
                      <span className="step-optional">Optional</span>
                    )}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    key={`connector-${i}`}
                    className={['step-connector', (activeStep > i || step.completed) && 'is-active']
                      .filter(Boolean)
                      .join(' ')}
                  />
                )}
              </>
            );
          })}
        </div>
        <div className="stepper-content">
          {stepPanels.map((panel: any, i) => (
            <div
              key={i}
              id={`llm-step-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`llm-step-${i}`}
              tabIndex={0}
              hidden={i !== activeStep}
            >
              {panel.props.children}
            </div>
          ))}
        </div>
      </div>
    </StepperContext.Provider>
  );
}

export interface LlmStepProps extends LlmStepSpec {
  /** Text displayed on the step indicator. Required. */
  label: string;
  /** Optional subtitle. */
  description?: string;
  /** Mark as completed (shows checkmark). */
  completed?: boolean;
  /** Mark as errored (shows X). */
  error?: boolean;
  /** Mark as optional. */
  optional?: boolean;
  /** Whether the step is disabled. */
  disabled?: boolean;
  children?: ReactNode;
}

export function LlmStep({ children }: LlmStepProps) {
  return <>{children}</>;
}
LlmStep.displayName = 'LlmStep';
