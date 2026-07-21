/**
 * @atelier-ui/spec
 *
 * Framework-agnostic TypeScript interfaces defining the public API contract
 * for every Atelier component. Both the Angular and React libraries
 * import from here so the compiler enforces parity.
 *
 * Angular: use the union types as `input<T>()` type parameters.
 * React: extend the spec interface from the framework-specific props interface.
 */

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
export type AtlButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type AtlButtonSize = 'sm' | 'md' | 'lg';
export interface AtlButtonSpec {
  variant?: AtlButtonVariant;
  size?: AtlButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /**
   * Accessible name — rendered as `aria-label`. Required when the
   * button has no visible text label (icon-only buttons), otherwise
   * the button is unnamed for assistive tech. The React adapter
   * encodes this requirement at the type level via a discriminated
   * union; the Angular and Vue adapters log a dev-mode warning when
   * a rendered button has no accessible name.
   */
  'aria-label'?: string;
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
export type AtlBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type AtlBadgeSize = 'sm' | 'md';
export interface AtlBadgeSpec {
  variant?: AtlBadgeVariant;
  size?: AtlBadgeSize;
}

// ---------------------------------------------------------------------------
// Avatar / AvatarGroup
// ---------------------------------------------------------------------------
export type AtlAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AtlAvatarShape = 'circle' | 'square';
export type AtlAvatarStatus = 'online' | 'offline' | 'away' | 'busy' | '';
export interface AtlAvatarSpec {
  src?: string;
  alt?: string;
  name?: string;
  size?: AtlAvatarSize;
  shape?: AtlAvatarShape;
  status?: AtlAvatarStatus;
}
export interface AtlAvatarGroupSpec {
  max?: number;
  size?: AtlAvatarSize;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export type AtlCardVariant = 'elevated' | 'outlined' | 'flat';
export type AtlCardPadding = 'none' | 'sm' | 'md' | 'lg';
/**
 * Optional landmark role for the card. Default behaviour is a plain
 * `<div>` — most cards group content visually and shouldn't add a
 * landmark to the page outline.
 *
 * Pick a role only when the card is meaningful as a landmark:
 *   - `'article'` for self-contained pieces of content (a blog post,
 *     a comment, a forum entry) that make sense out of context.
 *   - `'region'` for a perceivable area that needs a screen-reader
 *     stop. Pair with `aria-label` or `aria-labelledby`.
 *   - `'section'` is not a landmark by itself — equivalent to a
 *     `<section>` element. Useful when nesting structure matters.
 */
export type AtlCardRole = 'article' | 'region' | 'section';
export interface AtlCardSpec {
  variant?: AtlCardVariant;
  padding?: AtlCardPadding;
  /**
   * Opt-in landmark role. Default is no role (plain `<div>`).
   * See {@link AtlCardRole} for when to use each value.
   */
  role?: AtlCardRole;
}

// ---------------------------------------------------------------------------
// Input / Textarea (shared form field props)
// ---------------------------------------------------------------------------
// `any` is intentional here: downstream form-field interfaces narrow `value`
// to the concrete primitive they accept (string, number, boolean, Date, …).
// Using `unknown` would force every downstream consumer to redeclare the
// property, defeating the purpose of the shared spec.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AtlFormFieldSpec {
  value?: any;
  onValueChange?: (value: any) => void;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export type AtlInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
export interface AtlInputSpec extends AtlFormFieldSpec {
  type?: AtlInputType;
  placeholder?: string;
}

export interface AtlTextareaSpec extends AtlFormFieldSpec {
  rows?: number;
  placeholder?: string;
  autoResize?: boolean;
}

// ---------------------------------------------------------------------------
// Checkbox / Toggle
// ---------------------------------------------------------------------------
// Checkbox/Toggle are checked-based, not value-based, so they omit the
// inherited `value`/`onValueChange` — their state is `checked`/`onCheckedChange`.
// (Input/Textarea/RadioGroup/Select/Combobox keep the value-based pair.)
export interface AtlCheckboxSpec extends Omit<AtlFormFieldSpec, 'value' | 'onValueChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

export interface AtlToggleSpec extends Omit<AtlFormFieldSpec, 'value' | 'onValueChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

// ---------------------------------------------------------------------------
// Radio / RadioGroup
// ---------------------------------------------------------------------------
export interface AtlRadioSpec {
  radioValue: string;
  disabled?: boolean;
}

export interface AtlRadioGroupSpec extends AtlFormFieldSpec {
  value?: string;
}

// ---------------------------------------------------------------------------
// Select / Option
// ---------------------------------------------------------------------------
export interface AtlSelectSpec extends AtlFormFieldSpec {
  placeholder?: string;
}

export interface AtlOptionSpec {
  optionValue: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------
export interface AtlStepperSpec {
  activeStep?: number;
  orientation?: 'horizontal' | 'vertical';
  linear?: boolean;
}

export interface AtlStepSpec {
  label: string;
  description?: string;
  completed?: boolean;
  error?: boolean;
  optional?: boolean;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Combobox
// ---------------------------------------------------------------------------
export interface AtlComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AtlComboboxSpec extends AtlFormFieldSpec {
  options?: AtlComboboxOption[];
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------
export type AtlAlertVariant = 'info' | 'success' | 'warning' | 'danger';
export interface AtlAlertSpec {
  variant?: AtlAlertVariant;
  dismissible?: boolean;
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
export type AtlDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface AtlDialogSpec {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnBackdrop?: boolean;
  size?: AtlDialogSize;
}

// ---------------------------------------------------------------------------
// TabGroup / Tab
// ---------------------------------------------------------------------------
export type AtlTabGroupVariant = 'default' | 'pills';
export interface AtlTabGroupSpec {
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  variant?: AtlTabGroupVariant;
}

export interface AtlTabSpec {
  label: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// AccordionGroup / AccordionItem
// ---------------------------------------------------------------------------
export type AtlAccordionGroupVariant = 'default' | 'bordered' | 'separated';
export interface AtlAccordionGroupSpec {
  multi?: boolean;
  variant?: AtlAccordionGroupVariant;
}

export type AtlAccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export interface AtlAccordionItemSpec {
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  /**
   * HTML heading level wrapping the trigger button. Default `3`.
   * Set this to match your page's heading outline so the
   * accordion's section titles don't break heading order.
   * Example: if the accordion is nested under an `<h2>`, pass
   * `headingLevel={3}` (default); if nested under an `<h3>`, pass
   * `headingLevel={4}`.
   */
  headingLevel?: AtlAccordionHeadingLevel;
}

// ---------------------------------------------------------------------------
// Menu / MenuItem
// ---------------------------------------------------------------------------
export type AtlMenuVariant = 'default' | 'compact';
export interface AtlMenuSpec {
  variant?: AtlMenuVariant;
}

export interface AtlMenuItemSpec {
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
export type AtlTooltipPosition = 'above' | 'below' | 'left' | 'right';
export interface AtlTooltipSpec {
  atlTooltip: string;
  atlTooltipPosition?: AtlTooltipPosition;
  atlTooltipDisabled?: boolean;
  atlTooltipShowDelay?: number;
  atlTooltipHideDelay?: number;
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
export type AtlToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type AtlToastContainerPosition =
  | 'top-right'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-center';
export interface AtlToastOptions {
  variant?: AtlToastVariant;
  duration?: number;
  dismissible?: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
export type AtlSkeletonVariant = 'text' | 'circular' | 'rectangular';
export interface AtlSkeletonSpec {
  variant?: AtlSkeletonVariant;
  width?: string;
  height?: string;
  animated?: boolean;
}

// ---------------------------------------------------------------------------
// Breadcrumbs / BreadcrumbItem
// ---------------------------------------------------------------------------
export interface AtlBreadcrumbsSpec {
  separator?: string;
}

export interface AtlBreadcrumbItemSpec {
  href?: string;
  current?: boolean;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface AtlPaginationSpec {
  page?: number;
  pageCount?: number;
  siblingCount?: number;
  showFirstLast?: boolean;
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------
export type AtlProgressVariant = 'default' | 'success' | 'warning' | 'danger';
export type AtlProgressSize = 'sm' | 'md' | 'lg';
export interface AtlProgressSpec {
  value?: number;
  max?: number;
  variant?: AtlProgressVariant;
  size?: AtlProgressSize;
  indeterminate?: boolean;
  /**
   * Accessible name for the progress bar — rendered as `aria-label`.
   * Required by ARIA when there is no visible label nearby; without it
   * screen readers announce only "progress bar 47%". Examples:
   * `"Upload progress"`, `"Form completion"`, `"Quota usage"`.
   */
  label?: string;
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------
export type AtlDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type AtlDrawerSize = 'sm' | 'md' | 'lg' | 'full';
export interface AtlDrawerSpec {
  open?: boolean;
  position?: AtlDrawerPosition;
  size?: AtlDrawerSize;
  closeOnBackdrop?: boolean;
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------
export type AtlTableVariant = 'default' | 'striped' | 'bordered';
export type AtlTableSize = 'sm' | 'md' | 'lg';
export type AtlSortDirection = 'asc' | 'desc' | null;
export type AtlTableAlign = 'start' | 'center' | 'end';

export interface AtlTableSpec {
  variant?: AtlTableVariant;
  size?: AtlTableSize;
  stickyHeader?: boolean;
  /**
   * Accessible name for the scrollable table region. The wrapper
   * around the `<table>` is keyboard-focusable (tabindex=0) so that
   * users can scroll horizontally; this label is what screen readers
   * announce when focus enters the region. Defaults to `"Table"`.
   */
  'aria-label'?: string;
}

export interface AtlTbodySpec {
  empty?: boolean;
  colSpan?: number;
}

export interface AtlTrSpec {
  selected?: boolean;
  selectable?: boolean;
  rowId?: string;
}

export interface AtlThSpec {
  sortable?: boolean;
  sortDirection?: AtlSortDirection;
  align?: AtlTableAlign;
  width?: string;
}

export interface AtlTdSpec {
  align?: AtlTableAlign;
}

// ---------------------------------------------------------------------------
// Icon
// ---------------------------------------------------------------------------
export type AtlIconName =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'error'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'sort-asc'
  | 'sort-desc'
  | 'arrow-right'
  | 'arrow-left'
  | 'copy'
  | 'paste'
  | 'add'
  | 'edit'
  | 'delete'
  | 'close'
  | 'more'
  | 'default-toast';
export type AtlIconSize = 'sm' | 'md' | 'lg';
export interface AtlIconSpec {
  name: AtlIconName;
  size?: AtlIconSize;
  /**
   * Accessible label. When provided, the icon is announced as an image with
   * this label. When omitted, the icon is hidden from assistive tech (treated
   * as decorative).
   */
  label?: string;
}

// ---------------------------------------------------------------------------
// Chat (AI surface)
// ---------------------------------------------------------------------------
export type AtlChatVariant = 'drawer' | 'popup' | 'inline';
export type AtlChatStatus = 'idle' | 'streaming' | 'error';
export type AtlChatMessageRole = 'user' | 'assistant' | 'system';

export interface AtlChatMessageSpec {
  id: string;
  role: AtlChatMessageRole;
  content: string;
  failed?: boolean;
}

export interface AtlChatSuggestionSpec {
  id: string;
  label: string;
  hint?: string;
}

export interface AtlChatSpec {
  variant?: AtlChatVariant;
  status?: AtlChatStatus;
  open?: boolean;
}
