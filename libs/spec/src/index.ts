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
export type LlmButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
export type LlmButtonSize = 'sm' | 'md' | 'lg';
export interface LlmButtonSpec {
  variant?: LlmButtonVariant;
  size?: LlmButtonSize;
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
// `any` is intentional here: downstream form-field interfaces narrow `value`
// to the concrete primitive they accept (string, number, boolean, Date, …).
// Using `unknown` would force every downstream consumer to redeclare the
// property, defeating the purpose of the shared spec.
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LlmFormFieldSpec {
  value?: any;
  onValueChange?: (value: any) => void;
  disabled?: boolean;
  readonly?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

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
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

export interface LlmToggleSpec extends LlmFormFieldSpec {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
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
  onOpenChange?: (open: boolean) => void;
  closeOnBackdrop?: boolean;
  size?: LlmDialogSize;
}

// ---------------------------------------------------------------------------
// TabGroup / Tab
// ---------------------------------------------------------------------------
export type LlmTabGroupVariant = 'default' | 'pills';
export interface LlmTabGroupSpec {
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
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

export type LlmAccordionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export interface LlmAccordionItemSpec {
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
  headingLevel?: LlmAccordionHeadingLevel;
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
  /**
   * Accessible name for the scrollable table region. The wrapper
   * around the `<table>` is keyboard-focusable (tabindex=0) so that
   * users can scroll horizontally; this label is what screen readers
   * announce when focus enters the region. Defaults to `"Table"`.
   */
  'aria-label'?: string;
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

// ---------------------------------------------------------------------------
// Icon
// ---------------------------------------------------------------------------
export type LlmIconName =
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
export type LlmIconSize = 'sm' | 'md' | 'lg';
export interface LlmIconSpec {
  name: LlmIconName;
  size?: LlmIconSize;
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
export type LlmChatVariant = 'drawer' | 'popup' | 'inline';
export type LlmChatStatus = 'idle' | 'streaming' | 'error';
export type LlmChatMessageRole = 'user' | 'assistant' | 'system';

export interface LlmChatMessageSpec {
  id: string;
  role: LlmChatMessageRole;
  content: string;
  failed?: boolean;
}

export interface LlmChatSuggestionSpec {
  id: string;
  label: string;
  hint?: string;
}

export interface LlmChatSpec {
  variant?: LlmChatVariant;
  status?: LlmChatStatus;
  open?: boolean;
}
