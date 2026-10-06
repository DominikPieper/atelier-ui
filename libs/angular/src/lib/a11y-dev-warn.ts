import { afterNextRender } from '@angular/core';

// Angular's compiler injects this global; declare so TS doesn't complain.
declare const ngDevMode: unknown;

/** True in dev builds only; the dev-mode a11y warnings are tree-shaken from production. */
export function isNgDevMode(): boolean {
  return typeof ngDevMode !== 'undefined' && !!ngDevMode;
}

/**
 * Dev-mode check for a form control that renders a native labelable element.
 * Angular's `<ng-content>` / signal inputs mean the missing name can't be
 * rejected at the type level, so — like AtlButton — it is checked once after
 * first render, when every input (including bound ones) has settled.
 * Must be called from an injection context (a constructor).
 */
export function warnIfUnnamedControl(
  host: HTMLElement,
  component: string,
  controlSelector: string,
  fix: string,
): void {
  if (!isNgDevMode()) return;
  afterNextRender(() => {
    const control = host.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement
    >(controlSelector);
    if (!control) return;
    const named =
      (control.getAttribute('aria-label') ?? '').trim().length > 0 ||
      control.hasAttribute('aria-labelledby') ||
      (control.labels?.length ?? 0) > 0;
    if (!named) {
      console.warn(
        `[${component}] no accessible name — ${fix} so screen readers announce its purpose.`,
        host,
      );
    }
  });
}
