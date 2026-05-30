// AUTO-GENERATED from libs/spec/src/behaviors.json — do not edit here.
// Run `node tools/scripts/gen-behaviors.mjs` after editing the source of truth.
//
// Maps each component (subject) to the behavior ids every framework adapter
// must cover. Consumed by the typed `covers(subject, id)` test helper and the
// behavior-coverage gate so a wrong id is a compile error, not a silent miss.

export const BEHAVIORS = {
  button: ['default-render', 'disabled-state', 'loading-spinner', 'click-emits', 'disabled-no-click'],
  dialog: ['render-dialog-element', 'open-shows-modal', 'size-class', 'aria-modal', 'close-button'],
  menu: ['closed-initially', 'open-on-trigger', 'variant-class', 'close-on-item-click', 'disabled-item'],
  select: ['render-element', 'placeholder', 'disabled', 'invalid', 'value-change', 'error-messages'],
  combobox: ['render-input', 'filter-on-type', 'select-on-click', 'keyboard-nav', 'close-on-escape', 'aria-expanded'],
  accordion: ['expand-on-click', 'collapse-on-click', 'disabled-no-toggle', 'multi-expand', 'single-collapse-other', 'keyboard-nav', 'home-end', 'wrap', 'skip-disabled'],
  alert: ['dismiss-hidden', 'dismiss-shown', 'emits-dismiss', 'aria-live'],
  avatar: ['img-when-src', 'icon-when-empty', 'initials-when-no-src', 'aria-label-from-name'],
  badge: ['render-default'],
  breadcrumbs: ['nav-aria-label', 'link-when-href', 'current-class'],
  card: ['renders-content', 'header-subcomponent', 'content-subcomponent', 'footer-subcomponent'],
  chat: ['inline-variant', 'popup-variant', 'is-failed', 'send-button-idle', 'stop-button-streaming', 'emits-send', 'emits-stop', 'variant-class'],
  checkbox: ['reflects-checked', 'toggle-emits', 'disabled', 'invalid', 'errors', 'indeterminate'],
  'code-block': ['renders-code', 'language-label', 'filename-label', 'copy-button', 'no-copy-button', 'line-numbers', 'copied-state'],
  drawer: ['render-dialog-element', 'open-shows-modal', 'is-open-class', 'close-button', 'aria-modal'],
  icon: ['renders-glyph', 'decorative-hidden', 'labelled-img'],
  input: ['renders-input', 'disabled', 'invalid', 'errors', 'updates-value'],
  pagination: ['disables-prev-first', 'disables-next-last', 'aria-current', 'page-change-on-click', 'hide-first-last'],
  progress: ['aria-value', 'clamp', 'indeterminate-omits-valuenow'],
  radio: ['renders-input', 'disabled', 'checked-from-group', 'select-on-click'],
  'radio-group': ['role', 'checks-matching-value', 'value-change', 'invalid', 'errors', 'keyboard-nav'],
  skeleton: ['not-animated', 'circular-height', 'custom-size'],
  stepper: ['renders-tablist', 'first-panel-default', 'aria-selected-active', 'click-navigates', 'disabled-step-noop', 'completed-class', 'error-class', 'orientation-vertical'],
  table: ['renders-table', 'thead-tbody', 'variant-default', 'sticky-header', 'sort-button', 'no-sort-button', 'checkbox-selectable', 'empty-state'],
  tabs: ['first-tab-default', 'switch-on-click', 'disabled-tab-noop', 'variant-class', 'keyboard-nav', 'home-end', 'wrap', 'skip-disabled'],
  textarea: ['renders-textarea', 'disabled', 'errors', 'updates-value', 'rows'],
  toast: ['show-adds', 'dismiss-button-click', 'position-class', 'variant-class'],
  toggle: ['role-switch', 'reflects-checked', 'toggle-emits', 'disabled', 'errors', 'aria-checked'],
  tooltip: ['hidden-initially', 'show-on-hover', 'hide-on-leave', 'disabled-no-show'],
} as const;

export type Subject = keyof typeof BEHAVIORS;

export type BehaviorId<S extends Subject> = (typeof BEHAVIORS)[S][number];
