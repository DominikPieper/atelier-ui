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
 * metadata file". Some spec interfaces (AtlFormFieldSpec, AtlToastOptions,
 * AtlComboboxOption, AtlChatMessageSpec, AtlChatSuggestionSpec) are shared
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
 * (b) every exported `Atl*Spec` is either listed here or in the
 * NON_COMPONENT_SPECS set below.
 */
export const COMPONENT_METADATA_REGISTRY: Record<string, string> = {
  // Inputs / forms
  AtlButtonSpec: 'button',
  AtlInputSpec: 'input',
  AtlTextareaSpec: 'textarea',
  AtlCheckboxSpec: 'checkbox',
  AtlToggleSpec: 'toggle',
  AtlRadioSpec: 'radio',
  AtlRadioGroupSpec: 'radio',
  AtlSelectSpec: 'select',
  AtlOptionSpec: 'select',
  AtlComboboxSpec: 'combobox',
  AtlStepperSpec: 'stepper',
  AtlStepSpec: 'stepper',
  // Display
  AtlBadgeSpec: 'badge',
  AtlAvatarSpec: 'avatar',
  AtlAvatarGroupSpec: 'avatar',
  AtlCardSpec: 'card',
  AtlSkeletonSpec: 'skeleton',
  AtlProgressSpec: 'progress',
  AtlIconSpec: 'icon',
  // Navigation
  AtlTabGroupSpec: 'tabs',
  AtlTabSpec: 'tabs',
  AtlBreadcrumbsSpec: 'breadcrumbs',
  AtlBreadcrumbItemSpec: 'breadcrumbs',
  AtlPaginationSpec: 'pagination',
  AtlMenuSpec: 'menu',
  AtlMenuItemSpec: 'menu',
  // Overlays
  AtlDialogSpec: 'dialog',
  AtlDrawerSpec: 'drawer',
  AtlTooltipSpec: 'tooltip',
  // Containers
  AtlAccordionGroupSpec: 'accordion',
  AtlAccordionItemSpec: 'accordion',
  // Feedback
  AtlAlertSpec: 'alert',
  // Data
  AtlTableSpec: 'table',
  AtlTbodySpec: 'table',
  AtlTrSpec: 'table',
  AtlThSpec: 'table',
  AtlTdSpec: 'table',
  // AI surfaces
  AtlChatSpec: 'chat',
};

/**
 * Spec interfaces that are NOT standalone components — shared base shapes,
 * option types, sub-spec shapes. The drift-gate consults this set to know
 * which `Atl*Spec` exports it is allowed to skip.
 */
export const NON_COMPONENT_SPECS = new Set<string>([
  'AtlFormFieldSpec', // base for every form input
  'AtlToastOptions', // options passed to toast service, not a component
  'AtlComboboxOption', // option shape inside AtlComboboxSpec
  'AtlChatMessageSpec', // message shape rendered by AtlChatSpec
  'AtlChatSuggestionSpec', // suggestion shape rendered by AtlChatSpec
]);
