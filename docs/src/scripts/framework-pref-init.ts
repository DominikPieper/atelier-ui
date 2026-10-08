import {
  FW_DEFAULT,
  getFramework,
  getFrameworkSource,
  setFramework,
  subscribeFramework,
  type Framework,
} from '../lib/framework-pref';

const VALID: readonly Framework[] = ['angular', 'react', 'vue'];

function asFramework(value: string | undefined | null): Framework | null {
  if (!value) return null;
  const v = value.toLowerCase();
  return (VALID as readonly string[]).includes(v) ? (v as Framework) : null;
}

function applyFramework(fw: Framework): void {
  document
    .querySelectorAll<HTMLButtonElement>('[data-fw-btn]')
    .forEach((btn) => {
      const v = (btn.dataset.fwBtn ?? '').toLowerCase();
      btn.classList.toggle('active', v === fw);
      btn.setAttribute('aria-pressed', String(v === fw));
    });
  document.querySelectorAll<HTMLElement>('[data-fw-panel]').forEach((el) => {
    const v = (el.dataset.fwPanel ?? '').toLowerCase();
    el.hidden = v !== fw;
  });
}

function setHint(text: string | null): void {
  document.querySelectorAll<HTMLElement>('[data-fw-hint]').forEach((el) => {
    el.textContent = text ?? '';
    el.hidden = !text;
  });
}

function wireButtons(): void {
  document
    .querySelectorAll<HTMLButtonElement>('[data-fw-btn]')
    .forEach((btn) => {
      if (btn.dataset.fwWired === '1') return;
      btn.dataset.fwWired = '1';
      btn.addEventListener('click', () => {
        const fw = asFramework(btn.dataset.fwBtn);
        if (fw) setFramework(fw);
      });
    });
}

function init(): void {
  wireButtons();
  const fw = getFramework();
  applyFramework(fw);
  // A non-default framework the reader did not just pick: say where it came from.
  const source = getFrameworkSource();
  setHint(
    fw === FW_DEFAULT || source === 'default'
      ? null
      : source === 'url'
        ? 'Set by this link'
        : 'Remembered from your last visit',
  );
}

subscribeFramework((fw) => {
  setHint(null);
  applyFramework(fw);
});
document.addEventListener('astro:page-load', init);
init();
