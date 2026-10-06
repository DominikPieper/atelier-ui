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
