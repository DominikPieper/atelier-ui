/**
 * Metadata barrel — re-exports every component's metadata so a single
 * import gives consumers (gen-llms-txt, check-metadata) the full set.
 *
 * Add a new component (this file is the single source for every
 * component map — ADR-0031; the check scripts read it via
 * tools/scripts/lib/component-map.js):
 *   1. Write `libs/spec/src/metadata/<component>.metadata.ts`.
 *   2. Add a re-export below.
 *   3. Add an entry to COMPONENT_METADATA_REGISTRY.
 *   4. Add its primary spec to DOCS_PRIMARY_SPECS (once it has a docs page)
 *      and any sub-components to SUBCOMPONENT_PARENTS. Axis unions need no
 *      entry — they derive from the registry (UNION_COMPONENT_EXCEPTIONS
 *      only for spec-less masters like Toast).
 *   5. Run `npm run check:metadata` to confirm wiring.
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

/**
 * The PRIMARY spec interface per docs-site entry, mapped to its docs slug
 * (`docs/src/data/components.ts` key). Child interfaces (AtlRadioSpec,
 * AtlTabSpec, …) and shared shapes are intentionally absent — one docs
 * entry documents one primary interface. Consumed by check-docs-sync.
 */
export const DOCS_PRIMARY_SPECS: Record<string, string> = {
  AtlButtonSpec: 'button',
  AtlBadgeSpec: 'badge',
  AtlAvatarSpec: 'avatar',
  AtlCardSpec: 'card',
  AtlInputSpec: 'input',
  AtlTextareaSpec: 'textarea',
  AtlCheckboxSpec: 'checkbox',
  AtlToggleSpec: 'toggle',
  AtlRadioGroupSpec: 'radio-group',
  AtlSelectSpec: 'select',
  AtlAlertSpec: 'alert',
  AtlDialogSpec: 'dialog',
  AtlTabGroupSpec: 'tabs',
  AtlAccordionGroupSpec: 'accordion',
  AtlMenuSpec: 'menu',
  AtlTooltipSpec: 'tooltip',
  AtlToastOptions: 'toast',
  AtlSkeletonSpec: 'skeleton',
  AtlPaginationSpec: 'pagination',
  AtlProgressSpec: 'progress',
  AtlDrawerSpec: 'drawer',
  AtlBreadcrumbsSpec: 'breadcrumbs',
  AtlChatSpec: 'chat',
};

/**
 * Axis unions whose component directory cannot be derived from the union
 * name via the registry (`Atl<Base><Axis>` → `Atl<Base>Spec`). Toast has no
 * `AtlToastSpec` interface (it is options-based, ADR-0008), so both of its
 * axis unions need an explicit home. Consumed by lib/component-map.js,
 * which derives the rest of the union→component map from the registry.
 */
export const UNION_COMPONENT_EXCEPTIONS: Record<string, string> = {
  AtlToastVariant: 'toast',
  AtlToastContainerPosition: 'toast',
};

/**
 * Sub-component → parent component (PascalCase selector names). The
 * composition-cookbook catalog tags patterns with parent components while
 * story sources import sub-components; check-cookbook-parity normalizes
 * through this map before comparing.
 */
export const SUBCOMPONENT_PARENTS: Record<string, string> = {
  AtlCardHeader: 'AtlCard',
  AtlCardContent: 'AtlCard',
  AtlCardFooter: 'AtlCard',
  AtlDialogHeader: 'AtlDialog',
  AtlDialogContent: 'AtlDialog',
  AtlDialogFooter: 'AtlDialog',
  AtlDrawerHeader: 'AtlDrawer',
  AtlDrawerContent: 'AtlDrawer',
  AtlDrawerFooter: 'AtlDrawer',
  AtlTab: 'AtlTabGroup',
  AtlThead: 'AtlTable',
  AtlTbody: 'AtlTable',
  AtlTr: 'AtlTable',
  AtlTh: 'AtlTable',
  AtlTd: 'AtlTable',
  AtlAccordionItem: 'AtlAccordionGroup',
  AtlAccordionHeader: 'AtlAccordionGroup',
  AtlOption: 'AtlSelect',
  AtlMenuItem: 'AtlMenu',
  AtlMenuSeparator: 'AtlMenu',
  AtlMenuTrigger: 'AtlMenu',
};
