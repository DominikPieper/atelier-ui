/**
 * @atelier-ui/spec
 *
 * Framework-agnostic TypeScript interfaces defining the public API contract
 * for every llm-components component. Both the Angular and React libraries
 * import from here so the compiler enforces parity.
 *
 * Angular: use the union types as `input<T>()` type parameters.
 * React: extend the spec interface from the framework-specific props interface.
 */

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
export type LlmButtonVariant = 'primary' | 'secondary' | 'outline';
export type LlmButtonSize = 'sm' | 'md' | 'lg';
export interface LlmButtonSpec {
  variant?: LlmButtonVariant;
  size?: LlmButtonSize;
  disabled?: boolean;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
export type LlmBadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type LlmBadgeSize = 'sm' | 'md';
export interface LlmBadgeSpec {
  variant?: LlmBadgeVariant;
  size?: LlmBadgeSize;
}

// ---------------------------------------------------------------------------
// Avatar / AvatarGroup
// ---------------------------------------------------------------------------
export type LlmAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LlmAvatarShape = 'circle' | 'square';
export type LlmAvatarStatus = 'online' | 'offline' | 'away' | 'busy' | '';
export interface LlmAvatarSpec {
  src?: string;
  alt?: string;
  name?: string;
  size?: LlmAvatarSize;
  shape?: LlmAvatarShape;
  status?: LlmAvatarStatus;
}
export interface LlmAvatarGroupSpec {
  max?: number;
  size?: LlmAvatarSize;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export type LlmCardVariant = 'elevated' | 'outlined' | 'flat';
export type LlmCardPadding = 'none' | 'sm' | 'md' | 'lg';
export interface LlmCardSpec {
  variant?: LlmCardVariant;
  padding?: LlmCardPadding;
}

// ---------------------------------------------------------------------------
// Input / Textarea (shared form field props)
// ---------------------------------------------------------------------------
export interface LlmFormFieldSpec {
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
}

export type LlmInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
export interface LlmInputSpec extends LlmFormFieldSpec {
  type?: LlmInputType;
  placeholder?: string;
}

export interface LlmTextareaSpec extends LlmFormFieldSpec {
  rows?: number;
  placeholder?: string;
  autoResize?: boolean;
}

// ---------------------------------------------------------------------------
// Checkbox / Toggle
// ---------------------------------------------------------------------------
export interface LlmCheckboxSpec extends LlmFormFieldSpec {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface LlmToggleSpec extends LlmFormFieldSpec {
  checked?: boolean;
}

// ---------------------------------------------------------------------------
// Radio / RadioGroup
// ---------------------------------------------------------------------------
export interface LlmRadioSpec {
  radioValue: string;
  disabled?: boolean;
}

export interface LlmRadioGroupSpec extends LlmFormFieldSpec {
  value?: string;
}

// ---------------------------------------------------------------------------
// Select / Option
// ---------------------------------------------------------------------------
export interface LlmSelectSpec extends LlmFormFieldSpec {
  placeholder?: string;
}

export interface LlmOptionSpec {
  optionValue: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------
export interface LlmStepperSpec {
  activeStep?: number;
  orientation?: 'horizontal' | 'vertical';
  linear?: boolean;
}

export interface LlmStepSpec {
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
export interface LlmComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface LlmComboboxSpec extends LlmFormFieldSpec {
  options?: LlmComboboxOption[];
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------
export type LlmAlertVariant = 'info' | 'success' | 'warning' | 'danger';
export interface LlmAlertSpec {
  variant?: LlmAlertVariant;
  dismissible?: boolean;
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
export type LlmDialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface LlmDialogSpec {
  open?: boolean;
  closeOnBackdrop?: boolean;
  size?: LlmDialogSize;
}

// ---------------------------------------------------------------------------
// TabGroup / Tab
// ---------------------------------------------------------------------------
export type LlmTabGroupVariant = 'default' | 'pills';
export interface LlmTabGroupSpec {
  selectedIndex?: number;
  variant?: LlmTabGroupVariant;
}

export interface LlmTabSpec {
  label: string;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// AccordionGroup / AccordionItem
// ---------------------------------------------------------------------------
export type LlmAccordionGroupVariant = 'default' | 'bordered' | 'separated';
export interface LlmAccordionGroupSpec {
  multi?: boolean;
  variant?: LlmAccordionGroupVariant;
}

export interface LlmAccordionItemSpec {
  expanded?: boolean;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Menu / MenuItem
// ---------------------------------------------------------------------------
export type LlmMenuVariant = 'default' | 'compact';
export interface LlmMenuSpec {
  variant?: LlmMenuVariant;
}

export interface LlmMenuItemSpec {
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------
export type LlmTooltipPosition = 'above' | 'below' | 'left' | 'right';
export interface LlmTooltipSpec {
  llmTooltip: string;
  llmTooltipPosition?: LlmTooltipPosition;
  llmTooltipDisabled?: boolean;
  llmTooltipShowDelay?: number;
  llmTooltipHideDelay?: number;
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
export type LlmToastVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type LlmToastContainerPosition =
  | 'top-right'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-center';
export interface LlmToastOptions {
  variant?: LlmToastVariant;
  duration?: number;
  dismissible?: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
export type LlmSkeletonVariant = 'text' | 'circular' | 'rectangular';
export interface LlmSkeletonSpec {
  variant?: LlmSkeletonVariant;
  width?: string;
  height?: string;
  animated?: boolean;
}

// ---------------------------------------------------------------------------
// Breadcrumbs / BreadcrumbItem
// ---------------------------------------------------------------------------
export interface LlmBreadcrumbsSpec {
  separator?: string;
}

export interface LlmBreadcrumbItemSpec {
  href?: string;
  current?: boolean;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface LlmPaginationSpec {
  page?: number;
  pageCount?: number;
  siblingCount?: number;
  showFirstLast?: boolean;
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------
export type LlmProgressVariant = 'default' | 'success' | 'warning' | 'danger';
export type LlmProgressSize = 'sm' | 'md' | 'lg';
export interface LlmProgressSpec {
  value?: number;
  max?: number;
  variant?: LlmProgressVariant;
  size?: LlmProgressSize;
  indeterminate?: boolean;
}

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------
export type LlmDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type LlmDrawerSize = 'sm' | 'md' | 'lg' | 'full';
export interface LlmDrawerSpec {
  open?: boolean;
  position?: LlmDrawerPosition;
  size?: LlmDrawerSize;
  closeOnBackdrop?: boolean;
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------
export type LlmTableVariant = 'default' | 'striped' | 'bordered';
export type LlmTableSize = 'sm' | 'md' | 'lg';
export type LlmSortDirection = 'asc' | 'desc' | null;
export type LlmTableAlign = 'start' | 'center' | 'end';

export interface LlmTableSpec {
  variant?: LlmTableVariant;
  size?: LlmTableSize;
  stickyHeader?: boolean;
}

export interface LlmTbodySpec {
  empty?: boolean;
  colSpan?: number;
}

export interface LlmTrSpec {
  selected?: boolean;
  selectable?: boolean;
  rowId?: string;
}

export interface LlmThSpec {
  sortable?: boolean;
  sortDirection?: LlmSortDirection;
  align?: LlmTableAlign;
  width?: string;
}

export interface LlmTdSpec {
  align?: LlmTableAlign;
}
