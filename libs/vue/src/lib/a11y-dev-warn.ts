import { nextTick } from 'vue';

/** True in dev builds only; the dev-mode a11y warnings are stripped from production. */
export function isDevBuild(): boolean {
  return import.meta.env?.DEV === true;
}

/**
 * Dev-mode check for a form control that renders a native labelable element,
 * mirroring AtlButton's check. Call from `onMounted` with the control's template
 * ref; it re-checks after the next tick so a bound `label` / `aria-label` has
 * settled. Warns at most once per call.
 */
export function warnIfUnnamedControl(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
  component: string,
  fix: string,
): void {
  if (!isDevBuild() || !control) return;
  void nextTick(() => {
    const named =
      (control.getAttribute('aria-label') ?? '').trim().length > 0 ||
      control.hasAttribute('aria-labelledby') ||
      (control.labels?.length ?? 0) > 0;
    if (!named) {
      console.warn(
        `[${component}] no accessible name — ${fix} so screen readers announce its purpose.`,
        control,
      );
    }
  });
}

/**
 * Dev-mode check for a component whose ROOT element carries a role that needs a
 * name (`role="radiogroup"`) and has no native control to be labelled through
 * `<label for>`: the name has to arrive as `aria-label` or `aria-labelledby`
 * on the root. Call from `onMounted` with the root element; re-checks after the
 * next tick so a bound value has settled. Warns at most once per call.
 */
export function warnIfUnnamedHost(
  host: HTMLElement | null,
  component: string,
  fix: string,
): void {
  if (!isDevBuild() || !host) return;
  void nextTick(() => {
    const named =
      (host.getAttribute('aria-label') ?? '').trim().length > 0 ||
      (host.getAttribute('aria-labelledby') ?? '').trim().length > 0;
    if (!named) {
      console.warn(
        `[${component}] no accessible name — ${fix} so screen readers announce its purpose.`,
        host,
      );
    }
  });
}
