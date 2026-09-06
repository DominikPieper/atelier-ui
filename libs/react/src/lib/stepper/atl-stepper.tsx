import {
  Fragment,
  createContext,
  useContext,
  useState,
  ReactNode,
  HTMLAttributes,
  Children,
  isValidElement,
  useMemo,
  ReactElement,
} from 'react';
import type { AtlStepperSpec, AtlStepSpec } from '../spec';
import './atl-stepper.css';
import { AtlIcon } from '../icon/atl-icon';

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
export function useAtlStepper() {
  return useContext(StepperContext);
}

export interface AtlStepperProps
  extends HTMLAttributes<HTMLDivElement>,
    AtlStepperSpec {
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

export function AtlStepper({
  activeStep: externalStep,
  onActiveStepChange,
  orientation = 'horizontal',
  linear = false,
  children,
  className,
  ...rest
}: AtlStepperProps) {
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
            (c.type as { displayName?: string }).displayName === 'AtlStep'
        )
        .map((c) => {
          const element = c as ReactElement<AtlStepProps>;
          return {
            label: element.props.label ?? '',
            description: element.props.description,
            completed: element.props.completed ?? false,
            error: element.props.error ?? false,
            optional: element.props.optional ?? false,
            disabled: element.props.disabled ?? false,
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [children]
  );

  // Whether step `i` can be activated right now: not itself disabled, and — in
  // linear mode — either at/behind the active step, or ahead of it with every
  // step before it completed or optional. Drives both goTo()'s guard and the
  // header button's native `disabled` state, so an unreachable step is also
  // not focusable — no roving-tabindex bookkeeping needed, since the header is
  // a list, not a tab widget.
  const isReachable = (i: number) => {
    const step = steps[i];
    if (!step || step.disabled) return false;
    if (!linear) return true;
    if (i <= activeStep) return true;
    return steps.slice(0, i).every((s) => s.completed || s.optional);
  };

  const goTo = (i: number) => {
    if (i < 0 || i >= steps.length) return;
    if (!isReachable(i)) return;
    setStep(i);
  };

  const next = () => goTo(activeStep + 1);
  const prev = () => {
    const p = activeStep - 1;
    if (p >= 0 && !steps[p]?.disabled) setStep(p);
  };

  const classes = [
    'atl-stepper',
    `orientation-${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const stepPanels = childArray.filter(
    (c) =>
      isValidElement(c) &&
      (c.type as { displayName?: string }).displayName === 'AtlStep'
  );

  return (
    <StepperContext.Provider value={{ activeStep, setActiveStep: setStep, steps, linear, next, prev, goTo }}>
      <div className={classes} {...rest}>
        <ol className="stepper-header" role="list" aria-label="Progress">
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
              <Fragment key={i}>
                <li className={itemClass}>
                  <button
                    type="button"
                    id={`atl-step-${i}`}
                    className="step-circle"
                    aria-label={step.label}
                    aria-current={isActive ? 'step' : undefined}
                    disabled={!isReachable(i)}
                    onClick={() => goTo(i)}
                  >
                    {step.completed && !step.error ? (
                      <AtlIcon name="check" size="sm" />
                    ) : step.error ? (
                      <AtlIcon name="close" size="sm" />
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
                </li>
                {i < steps.length - 1 && (
                  <li
                    aria-hidden="true"
                    className={['step-connector', (activeStep > i || step.completed) && 'is-active']
                      .filter(Boolean)
                      .join(' ')}
                  />
                )}
              </Fragment>
            );
          })}
        </ol>
        <div className="stepper-content">
          {stepPanels.map((panel, i) => {
            const element = panel as ReactElement<AtlStepProps>;
            return (
              <div
                key={i}
                role="region"
                className="step-panel"
                aria-labelledby={`atl-step-${i}`}
                hidden={i !== activeStep}
              >
                {element.props.children}
              </div>
            );
          })}
        </div>
      </div>
    </StepperContext.Provider>
  );
}

export interface AtlStepProps extends AtlStepSpec {
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

export function AtlStep({ children }: AtlStepProps) {
  return children;
}
AtlStep.displayName = 'AtlStep';
