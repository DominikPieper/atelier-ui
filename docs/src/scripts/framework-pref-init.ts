import { getFramework, setFramework, subscribeFramework, type Framework } from '../lib/framework-pref';

const VALID: readonly Framework[] = ['angular', 'react', 'vue'];

function asFramework(value: string | undefined | null): Framework | null {
  if (!value) return null;
  const v = value.toLowerCase();
  return (VALID as readonly string[]).includes(v) ? (v as Framework) : null;
}

function applyFramework(fw: Framework): void {
  document.querySelectorAll<HTMLButtonElement>('[data-fw-btn]').forEach(btn => {
    const v = (btn.dataset.fwBtn ?? '').toLowerCase();
    btn.classList.toggle('active', v === fw);
  });
  document.querySelectorAll<HTMLElement>('[data-fw-panel]').forEach(el => {
    const v = (el.dataset.fwPanel ?? '').toLowerCase();
    el.hidden = v !== fw;
  });
}

function wireButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-fw-btn]').forEach(btn => {
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
  applyFramework(getFramework());
}

subscribeFramework(applyFramework);
document.addEventListener('astro:page-load', init);
init();
