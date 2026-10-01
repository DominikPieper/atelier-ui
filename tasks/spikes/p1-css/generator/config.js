const bare = { scope: 'bare', scopeKind: 'accidental' };
const ren = (from, to) => ({ t: 'rename', from, to, kind: 'accidental' });
module.exports = {
  button: bare, 'code-block': bare, dialog: bare, pagination: bare, progress: bare, stepper: bare,
  table: { ...bare, ops: [{ t: 'tag', from: 'atl-tr', to: 'tr', kind: 'inherent', dom: true }] },
  accordion: { ...bare },
  avatar: { ops: [
    { t: 'hostAlias', from: '.group', to: '.atl-avatar-group', kind: 'accidental' },
    { t: 'ctx', from: '.atl-avatar-group', to: '.atl-avatar-group >', kind: 'accidental' },
    { t: 'scopeSel', match: '^\\.overflow-badge', root: '', kind: 'accidental' } ] },
  combobox: { ops: [
    ren('.combobox-wrapper', '.atl-combobox-wrapper'), ren('.combobox-input', '.atl-combobox-input'), ren('.combobox-icon', '.atl-combobox-icon'),
    ren('.panel', '.atl-combobox-panel'), ren('.option', '.atl-combobox-option'), ren('.option-check', '.atl-combobox-check'),
    ren('.no-results', '.atl-combobox-no-results'), ren('.errors', '.atl-combobox-errors'), ren('.error-message', '.atl-combobox-error-message') ] },
  tabs: { ops: [
    { t: 'inlineStyles', file: 'atl-tabs.ts', root: '.atl-tab-group', dropHost: true, kind: 'inherent' } ] },
  breadcrumbs: { ops: [
    ren('.list', '.breadcrumbs-list'),
    { t: 'scopeSel', match: '^\\.breadcrumbs-list', root: '', kind: 'accidental' },
    { t: 'sel', re: '^\\.atl-breadcrumb-item\\.is-current a', to: '.atl-breadcrumb-item .breadcrumb-current', kind: 'accidental', dom: true },
    { t: 'sel', re: '^\\.atl-breadcrumbs a', to: '.atl-breadcrumb-item .breadcrumb-link', kind: 'accidental', dom: true } ] },
  drawer: { root: '.atl-drawer-host', rootKind: 'accidental', ops: [
    { t: 'hostAlias', from: '.atl-drawer', to: '.atl-drawer-host', kind: 'accidental' },
    { t: 'scopeSel', match: '^\\.close-btn', root: '', kind: 'accidental' },
    { t: 'addDecl', selector: '.atl-drawer-host', prop: 'display', value: 'contents', kind: 'inherent', dom: true } ] },
  menu: { ops: [
    { t: 'addCss', css: '.atl-menu-panel { position: absolute; z-index: var(--ui-z-dropdown, 100); top: calc(100% + var(--ui-spacing-2)); left: 0; min-width: 100%; }', kind: 'inherent', dom: true } ] },
  toast: { ops: [
    { t: 'mergeFile', file: 'atl-toast-container.css', root: '.atl-toast-container', at: 'start', kind: 'inherent' } ] },
};
