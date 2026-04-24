export type Framework = 'angular' | 'react' | 'vue';

const VALID: readonly Framework[] = ['angular', 'react', 'vue'];

export const FW_STORAGE_KEY = 'atelier.fw';
export const FW_EVENT = 'atelier:fw-change';
export const FW_DEFAULT: Framework = 'angular';

function parse(value: string | null | undefined): Framework | null {
  if (!value) return null;
  const v = value.toLowerCase();
  return (VALID as readonly string[]).includes(v) ? (v as Framework) : null;
}

export function getFramework(defaultFw: Framework = FW_DEFAULT): Framework {
  if (typeof window === 'undefined') return defaultFw;
  try {
    const urlFw = parse(new URL(window.location.href).searchParams.get('fw'));
    if (urlFw) return urlFw;
  } catch {
    // URL parse failure — fall through.
  }
  try {
    const stored = parse(localStorage.getItem(FW_STORAGE_KEY));
    if (stored) return stored;
  } catch {
    // localStorage blocked — fall through.
  }
  return defaultFw;
}

export function setFramework(fw: Framework): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FW_STORAGE_KEY, fw);
  } catch {
    // Ignore quota / private-mode errors.
  }
  window.dispatchEvent(new CustomEvent<Framework>(FW_EVENT, { detail: fw }));
}

export function subscribeFramework(cb: (fw: Framework) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const fw = parse((e as CustomEvent<Framework>).detail);
    if (fw) cb(fw);
  };
  const storageHandler = (e: StorageEvent) => {
    if (e.key !== FW_STORAGE_KEY) return;
    const fw = parse(e.newValue);
    if (fw) cb(fw);
  };
  window.addEventListener(FW_EVENT, handler);
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(FW_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
