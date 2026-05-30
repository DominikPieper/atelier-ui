/**
 * Metadata barrel — re-exports every component's metadata so a single
 * import gives consumers (gen-llms-txt, check-metadata) the full set.
 *
 * Add a new component:
 *   1. Write `libs/spec/src/metadata/<component>.metadata.ts`.
 *   2. Add a re-export below.
 *   3. Add an entry to COMPONENT_METADATA_REGISTRY.
 *   4. Run `npm run check:metadata` to confirm wiring.
 *
 * The registry is the authoritative list of "this spec interface needs a
 * metadata file". Some spec interfaces (LlmFormFieldSpec, LlmToastOptions,
 * LlmComboboxOption, LlmChatMessageSpec, LlmChatSuggestionSpec) are shared
 * shapes or options, not standalone components; they are explicitly
 * excluded here so the drift-gate does not demand metadata for them.
 */
export type { ComponentMetadata } from './types';

/**
 * Authoritative list of spec interfaces that require metadata. Keys are the
 * `specName` from `libs/spec/src/index.ts`; values are the metadata module
 * filename (without `.metadata.ts`).
 *
 * `check-metadata` reads both this map and `libs/spec/src/index.ts` and
 * verifies (a) every entry resolves to a populated metadata file and
 * (b) every exported `Llm*Spec` is either listed here or in the
 * NON_COMPONENT_SPECS set below.
 */
export const COMPONENT_METADATA_REGISTRY: Record<string, string> = {
  // Inputs / forms
  LlmButtonSpec: 'button',
  LlmInputSpec: 'input',
  LlmTextareaSpec: 'textarea',
  LlmCheckboxSpec: 'checkbox',
  LlmToggleSpec: 'toggle',
  LlmRadioSpec: 'radio',
  LlmRadioGroupSpec: 'radio',
  LlmSelectSpec: 'select',
  LlmOptionSpec: 'select',
  LlmComboboxSpec: 'combobox',
  LlmStepperSpec: 'stepper',
  LlmStepSpec: 'stepper',
  // Display
  LlmBadgeSpec: 'badge',
  LlmAvatarSpec: 'avatar',
  LlmAvatarGroupSpec: 'avatar',
  LlmCardSpec: 'card',
  LlmSkeletonSpec: 'skeleton',
  LlmProgressSpec: 'progress',
  LlmIconSpec: 'icon',
  // Navigation
  LlmTabGroupSpec: 'tabs',
  LlmTabSpec: 'tabs',
  LlmBreadcrumbsSpec: 'breadcrumbs',
  LlmBreadcrumbItemSpec: 'breadcrumbs',
  LlmPaginationSpec: 'pagination',
  LlmMenuSpec: 'menu',
  LlmMenuItemSpec: 'menu',
  // Overlays
  LlmDialogSpec: 'dialog',
  LlmDrawerSpec: 'drawer',
  LlmTooltipSpec: 'tooltip',
  // Containers
  LlmAccordionGroupSpec: 'accordion',
  LlmAccordionItemSpec: 'accordion',
  // Feedback
  LlmAlertSpec: 'alert',
  // Data
  LlmTableSpec: 'table',
  LlmTbodySpec: 'table',
  LlmTrSpec: 'table',
  LlmThSpec: 'table',
  LlmTdSpec: 'table',
  // AI surfaces
  LlmChatSpec: 'chat',
};

/**
 * Spec interfaces that are NOT standalone components — shared base shapes,
 * option types, sub-spec shapes. The drift-gate consults this set to know
 * which `Llm*Spec` exports it is allowed to skip.
 */
export const NON_COMPONENT_SPECS = new Set<string>([
  'LlmFormFieldSpec', // base for every form input
  'LlmToastOptions', // options passed to toast service, not a component
  'LlmComboboxOption', // option shape inside LlmComboboxSpec
  'LlmChatMessageSpec', // message shape rendered by LlmChatSpec
  'LlmChatSuggestionSpec', // suggestion shape rendered by LlmChatSpec
]);
