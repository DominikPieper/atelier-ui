import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  HTMLAttributes,
  KeyboardEvent,
  Children,
  isValidElement,
} from 'react';
import type {
  LlmTabGroupSpec,
  LlmTabSpec,
} from '@atelier-ui/spec';
import './llm-tabs.css';

interface TabInfo {
  label: string;
  disabled: boolean;
}

interface TabGroupContextValue {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  variant: 'default' | 'pills';
  tabs: TabInfo[];
}

const TabGroupContext = createContext<TabGroupContextValue>({
  selectedIndex: 0,
  setSelectedIndex: () => undefined,
  variant: 'default',
  tabs: [],
});

/**
 * Properties for the LlmTabGroup component.
 */
export interface LlmTabGroupProps
  extends HTMLAttributes<HTMLDivElement>,
    LlmTabGroupSpec {
  /**
   * The index of the currently selected tab.
   */
  selectedIndex?: number;
  /**
   * Callback triggered when the selected tab index changes.
   */
  onSelectedIndexChange?: (index: number) => void;
  /**
   * The visual style variant of the tabs.
   */
  variant?: 'default' | 'pills';
  /**
   * The LlmTab components to be rendered.
   */
  children?: ReactNode;
}

/**
 * A component for organizing content into multiple tabs.
 */
export function LlmTabGroup({
  selectedIndex: externalIndex,
  onSelectedIndexChange,
  variant = 'default',
  children,
  className,
  ...rest
}: LlmTabGroupProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const isControlled = externalIndex !== undefined;
  const selectedIndex = isControlled ? externalIndex : internalIndex;
  const tabListRef = useRef<HTMLDivElement>(null);

  const setIndex = (i: number) => {
    if (!isControlled) setInternalIndex(i);
    onSelectedIndexChange?.(i);
  };

  const childArray = Children.toArray(children);
  const tabs: TabInfo[] = childArray
    .filter(
      (child) =>
        isValidElement(child) &&
        (child.type as { displayName?: string }).displayName === 'LlmTab'
    )
    .map((child: any) => ({
      label: child.props.label ?? '',
      disabled: child.props.disabled ?? false,
    }));

  const classes = ['llm-tab-group', `variant-${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const enabledIndices = tabs
      .map((t, i) => (!t.disabled ? i : -1))
      .filter((i) => i >= 0);
    if (enabledIndices.length === 0) return;

    const currentEnabled = enabledIndices.indexOf(selectedIndex);
    let nextPos = currentEnabled;

    if (e.key === 'ArrowRight')
      nextPos = (currentEnabled + 1) % enabledIndices.length;
    else if (e.key === 'ArrowLeft')
      nextPos =
        (currentEnabled - 1 + enabledIndices.length) % enabledIndices.length;
    else if (e.key === 'Home') nextPos = 0;
    else if (e.key === 'End') nextPos = enabledIndices.length - 1;
    else return;

    e.preventDefault();
    const nextIndex = enabledIndices[nextPos];
    setIndex(nextIndex);
    const buttons =
      tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  };

  const panels = childArray.filter(
    (child) =>
      isValidElement(child) &&
      (child.type as { displayName?: string }).displayName === 'LlmTab'
  );

  return (
    <TabGroupContext.Provider value={{ selectedIndex, setSelectedIndex: setIndex, variant, tabs }}>
      <div className={classes} {...rest}>
        <div className="tablist" role="tablist" ref={tabListRef}>
          {tabs.map((tab, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              id={`llm-tab-${i}`}
              aria-selected={i === selectedIndex}
              aria-controls={`llm-tab-panel-${i}`}
              aria-disabled={tab.disabled || undefined}
              tabIndex={i === selectedIndex ? 0 : -1}
              className={[
                i === selectedIndex && 'is-active',
                tab.disabled && 'is-disabled',
              ]
                .filter(Boolean)
                .join(' ') || undefined}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && setIndex(i)}
              onKeyDown={handleKeyDown}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {panels.map((panel: any, i) => (
          <div
            key={i}
            id={`llm-tab-panel-${i}`}
            role="tabpanel"
            aria-labelledby={`llm-tab-${i}`}
            tabIndex={0}
            hidden={i !== selectedIndex}
          >
            {panel.props.children}
          </div>
        ))}
      </div>
    </TabGroupContext.Provider>
  );
}

/**
 * Properties for the LlmTab component.
 */
export interface LlmTabProps extends LlmTabSpec {
  /**
   * The label to display on the tab button.
   */
  label: string;
  /**
   * Whether the tab is disabled.
   */
  disabled?: boolean;
  /**
   * The content to be rendered when the tab is selected.
   */
  children?: ReactNode;
}

/**
 * An individual tab component for use within LlmTabGroup.
 */
export function LlmTab({ children }: LlmTabProps) {
  return <>{children}</>;
}
LlmTab.displayName = 'LlmTab';
